import pyodbc
import pandas as pd
import numpy as np
import datetime
import plotly.graph_objects as go
import plotly.express as px
import sklearn.metrics as sm
from plotly.subplots import make_subplots
from .sql_queries import gendered_rating_query, demand_query, monthly_income_query, latest_sales_query, check_prediction_query, update_prediction_log
from django.db import connection
from sklearn import linear_model
from scipy import stats

# Returns a scatter plot of the regression and bar chart of predicted values, explained variance score, r2 score, and mean absolute error
# as fig, evs, r2, and mae
def demand_graphs(branch='A', product_line='Electronic accessories', date=datetime.date(2019, 3, 25)):
    pd.options.plotting.backend = "plotly"
    fig = make_subplots(rows = 1, cols = 2, shared_xaxes=False, specs=[[{"type": "xy"}, {"type": "xy"}]],
                        subplot_titles=('Day vs Demand', 'Predicted Values for a Week'))
    fig['layout'].update(xaxis_title='Day', yaxis_title='Quantity',
                         paper_bgcolor='rgba(0,0,0,0)', plot_bgcolor='rgba(0,0,0,0)')
    
    #Gets the earliest date in the database
    with connection.cursor() as crs:
        earliest_date_query = 'SELECT min(Date) FROM Sales'
        earliest_date = crs.execute(earliest_date_query).fetchval()

    df = pd.read_sql(demand_query % (earliest_date, earliest_date, date, branch, product_line, earliest_date), connection)
    date_difference = date - earliest_date

    #fills in days where there are no sales
    s = df['Day'].tolist()
    for i in range(0, date_difference.days):
        if i not in s:
            df.loc[-1] =[i, 0]
            df.index = df.index + 1

    #drops data that has a zscore with an absolute value greater than or equal to 3 then sorts
    z_scores = np.abs(stats.zscore(df['Demand']))
    df = df[(z_scores < 3)]
    df = df.sort_values('Day')

    #makes a linear regression model then predicts the values and store them
    model = linear_model.LinearRegression()
    weight = np.ones(len(df)) * 10
    weight[-7:] *= 1.5
    x = df[['Day']]
    y = df[['Demand']]
    model.fit(x, y, weight)
    df['bestfit'] = model.predict(df[['Day']])

    #makes a prediction of the next weeks demand
    days_predicted = list(range(date_difference.days, date_difference.days + 7))
    predicted_values = []
    total_predicted = 0
    for i in days_predicted:
        predicted = float(model.predict([[i]]))
        predicted_values.append(predicted)
        total_predicted += predicted
    predicted_values.append(total_predicted)

    #makes a scatter plot with a line for the linear regression
    fig.add_trace(go.Scatter(name='data points', x=df['Day'], y=df['Demand'].values, mode='markers'), 1, 1)
    fig.add_trace(go.Scatter(name='regression line', x=df['Day'], y=df['bestfit'], mode='lines'), 1, 1)

    #makes a bar chart for the predicted values for the week
    fig.add_trace(go.Bar(name='predicted values', x=days_predicted.append('total'), y=predicted_values), 1, 2)
    
    #finds the explained variance score, r2 score, and mean absolute error
    evs = sm.explained_variance_score(df['Demand'], df['bestfit'])
    r2 = sm.r2_score(df['Demand'], df['bestfit'])
    mae = sm.mean_absolute_error(df['Demand'], df['bestfit'])
    
    new_date = True
    with connection.cursor() as crs:
        crs.execute(check_prediction_query, (date, product_line, branch))
        if crs.fetchone() != None:
            new_date = False

    if new_date:
        with connection.cursor() as crs:
            crs.execute(update_prediction_log, (branch, product_line, date, evs, r2, mae))

    return fig, evs, r2, mae

#Returns a graph with three subplots showing descriptive data as fig and fig2
def dashboard_descriptive_graphs(branch='A'):
    pd.options.plotting.backend = "plotly"
    layout = go.Layout(
        paper_bgcolor='rgba(0,0,0,0)',
        plot_bgcolor='rgba(0,0,0,0)',
        font=go.layout.Font(size=15)
    )
    fig = make_subplots(rows = 1, cols = 2, shared_xaxes=False, specs=[[{"type": "xy"}, {"type": "xy"}]],
                        subplot_titles=('Rating Trends by Gender', 'Monthly Income by Product Line'))
    fig['layout'].update(paper_bgcolor='rgba(0,0,0,0)', plot_bgcolor='rgba(0,0,0,0)')

    #Gets the earliest date in the database
    with connection.cursor() as crs:
        earliest_date_query = 'SELECT min(Date) FROM Sales'
        earliest_date = crs.execute(earliest_date_query).fetchval()

    #Gets the data and replaces null and none values with Unknown/Unspecified for graphing
    df = pd.read_sql(gendered_rating_query % (earliest_date, branch, earliest_date, earliest_date), connection)
    df['Gender'].fillna(value='Unknown/Unspecified', inplace=True)
    df['Gender'].replace('None', 'Unknown/Unspecified', inplace=True)

    #Makes a line chart of the Rating Trends for each gender
    genders = list(df['Gender'].unique())
    for gender in genders:
        new_df = df[df['Gender'] == gender]
        fig.add_trace(go.Scatter(x=new_df['Day'], y=new_df['Rating'], mode='lines+markers', name=gender), row=1, col=1)

    #Gets the data
    df = pd.read_sql(monthly_income_query % (branch), connection)

    #Makes bar chart of the income for each product line for each month
    products = list(df['Product Line'].unique())
    for product in products:
        new_df = df[df['Product Line'] == product]
        fig.add_trace(go.Bar(x=new_df['Month'], y=new_df['Gross Income'], name=product), row=1, col=2)

    #Gets the data
    df = pd.read_sql(latest_sales_query % (branch), connection)

    #Makes pie chart of the quantity sold for each product line in the last 30 days
    fig2 = go.Figure(layout=layout)
    fig2.add_trace(go.Pie(labels=df['Product Line'], values=df['Quantity'], title='Quantity Sold by Product Line in the Past 30 Days'))

    return fig, fig2