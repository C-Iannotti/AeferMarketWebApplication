from django.shortcuts import render
from django.shortcuts import redirect
from django.http import HttpResponse
from django.conf import settings
from django.db import connection
from django.contrib import messages
from .models import User
from .forms import BranchSelection, UserForm, DemandSelection, DataSelection
from .sql_queries import login_query, basic_query, update_login_log, update_prediction_log, update_query_log
from .dashboard_graphs import demand_graphs, dashboard_descriptive_graphs
from socket import gethostname
from time import sleep
import pandas as pd
import pyodbc
import datetime


# Create your views here.
user = None

#Login page
def home_view(request, *args, **kwargs):
    error = ''

    if request.method == 'POST':
        form = UserForm(request.POST)
        username = ''
        password = ''
        result = []

        if form.is_valid():
            username = request.POST['username']
            password = request.POST['password']

        #retrieves user information based on username and password
        with connection.cursor() as crs:
            crs.execute(login_query, (username, password))
            result = crs.fetchmany(1)

        # tries to login, stores user information for use and redirects to application if successful and displays error message is unsuccessful
        if result != []:
            username, password, view_data, edit_data, view_logs, access_logins = result[0]
            global user 
            user = User(username, password, view_data, edit_data, view_logs, access_logins)
            with connection.cursor() as crs:
                crs.execute(update_login_log, (username, datetime.datetime.now(), True))
            return redirect(dashboard_view)
        else:
            with connection.cursor() as crs:
                crs.execute(update_login_log, (username, datetime.datetime.now(), False))
            error = '<p style="color:red;">Invalid username or password</p>'
    else:
        form = UserForm()
    return render(request, 'home.html', {'error':error, 'form':form})

#Dashboard page
def dashboard_view(request, *args, **kwargs):
    error=''

    if user == None :
        return redirect(home_view)
    elif request.method == 'POST':
        try:
            #attempts to get graphs from selected information
            branch = BranchSelection(request.POST)
            fig1, fig2 = dashboard_descriptive_graphs(request.POST['branch'])
            fig1 = fig1.to_html(full_html=False, default_height=400)
            fig2 = fig2.to_html(full_html=False, default_height=400)
            fig, evs, r2, mae = demand_graphs(request.POST['branch'], request.POST['product'],
                                              datetime.datetime.strptime(request.POST['date'], '%Y-%m-%d').date())
            fig = fig.to_html(full_html=False, default_height=400)
            demand_selection = DemandSelection(request.POST)
        except:
            #returns to default selections and graphs if the attempt is unsuccessful
            error = '<p style="color:red;">Invalid selections, returning to default.</p>'
            branch = BranchSelection()
            fig1, fig2 = dashboard_descriptive_graphs()
            fig1 = fig1.to_html(full_html=False, default_height=400)
            fig2 = fig2.to_html(full_html=False, default_height=400)
            fig, evs, r2, mae = demand_graphs()
            fig = fig.to_html(full_html=False, default_height=400)
            demand_selection = DemandSelection()
    else:
        #displays default selections and graphs
        branch = BranchSelection()
        fig1, fig2 = dashboard_descriptive_graphs()
        fig1 = fig1.to_html(full_html=False, default_height=400)
        fig2 = fig2.to_html(full_html=False, default_height=400)
        fig, evs, r2, mae = demand_graphs()
        fig = fig.to_html(full_html=False, default_height=400)
        demand_selection = DemandSelection()
    accuracy_measures = '<p style="text-align:center; font-size:large;">EVS: ' + str(evs) + '&emsp;R2: ' + str(r2) + '&emsp;MAE: ' + str(mae) + '</p>'

    return render(request, 'dashboard.html', {'descriptive_graphs':fig1 + fig2, 'branch':branch,
                                              'demand_selection':demand_selection, 'demand_graphs':fig,
                                              'accuracy_measures':accuracy_measures, 'error':error
                                              })

#Data Page
def data_view(request, *args, **kwargs):
    error=''
    df_result = ''
    rows_affected = None
    if user == None or not user.view_data:
         return redirect(home_view)
    elif request.method == 'POST':
        form = DataSelection(request.POST, user)
        try:
            #attempts to query using the box for sql queries
            if 'query' in request.POST and request.POST['query'].lower().startswith('select'):
                df = pd.read_sql(request.POST['query'], connection)
                df_result = df.to_html()
            else:
                crs = connection.cursor()
                crs.execute(request.POST['query'])
                rows_affected = crs.rowcount
                df_result = '<p style="text-align:center;">Row(s) Affected: ' + str(rows_affected) + '</p>'
                cursor.close()
        except:
            #if unsuccessful makes a query with selected tabl and columns
            try:
                columns = ', '.join(request.POST.getlist('columns'))
                table = request.POST['table']
                df = pd.read_sql(basic_query % (columns, table), connection)
                df_result = df.to_html()
            except:
                pass
        if df_result == '':
            error='<p style="text-align:center;">No Results</p>'
        else:
            crs = connection.cursor()
            crs.execute(update_query_log, (user.username, datetime.datetime.now(), rows_affected))
            crs.close()
    else:
        form = DataSelection(None, user)
    return render(request, 'data.html', {'form':form, 'error':error, 'df_result':df_result})