from django import forms
from django.utils.safestring import mark_safe
from django.db import connection
from .sql_queries import branch_query, product_lines_query
from .models import User
import datetime

#Login form
class UserForm(forms.Form):
    username = forms.CharField(label=mark_safe("<br />Username"), max_length=20)
    password = forms.CharField(widget=forms.PasswordInput(), label=mark_safe("<br />Password "), max_length=20)

#Makes a list of branches and a choice field to select one
class BranchSelection(forms.Form):
    with connection.cursor() as crs:
        crs.execute(branch_query)
        result = []
        for row in crs.fetchall():
            result.append((row[0], row[1]))
    branch = forms.ChoiceField(initial='A', label='',
        widget = forms.Select(attrs={'onchange': 'this.form.submit();'}),
        choices = result)

#Makes a choice field for products and a date field to select a date
class DemandSelection(forms.Form):
    with connection.cursor() as crs:
        crs.execute(product_lines_query)
        result = []
        for row in crs.fetchall():
            result.append((row[0], row[0]))
    product = forms.ChoiceField(label='Product Line', widget=forms.Select(), choices=result, initial='Electronic accessories')
    date = forms.DateField(label='Date (YYYY-MM-DD)', initial=datetime.date(2019, 3, 25))

#Makes a choice field for both tables and columns and makes a text box to enter a query
class DataSelection(forms.Form):
    def __init__(self, *args, **kwargs):
        user = args[1]
        if user == None:
            user = User('Invalid', 'Invalid', 0, 0, 0, 0)
        super(DataSelection, self).__init__(*args, **kwargs)

        table_result = []
        column_result =[]
        for table in connection.introspection.table_names():
            if (table == 'Login_Log' or table == 'Prediction_Log' or table == 'Query_Log') and (not user.view_logs):
                continue
            elif (table == 'Logins') and (not user.access_logins):
                continue
            elif not (table=='Login_Log' or table=='Prediction_Log' or table=='Query_Log' or table=='Logins' or table=='Sales') and not user.edit_data:
                continue
            else:
                table_result.append((table, table))

        if(args[0] == None):
            table_chosen = table_result[0][0]
        else:
            table_chosen = args[0].get('table', table_result[0][0])
        with connection.cursor() as crs:
            for row in crs.columns(table=table_chosen):
                column_result.append((row.column_name, row.column_name))

        self.fields['table'].choices = table_result
        self.fields['columns'].choices = column_result
        if user.edit_data:
            self.fields['query'].disabled = False

    table = forms.ChoiceField(label='', widget=forms.Select(attrs={'onchange':'this.form.submit();',
                             'class':'data_input'}), choices=[], required=False)
    columns = forms.MultipleChoiceField(label='', widget=forms.SelectMultiple(attrs={'class':'data_input'}),
                             choices=[], required=False)
    query = forms.CharField(widget=forms.Textarea(attrs={'placeholder':'Enter an SQL Query into here (using Transact-SQL)',
                             'class':'data_input'}), label='', disabled=True, required=False)