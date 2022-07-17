from django.db import models

# Create your models here.

#Holds user information and permissions
class User():
    def __init__(self, username, password, view_data, edit_data, view_logs, access_logins):
        self.username = username
        self.password = password
        self.view_data = view_data
        self.edit_data = edit_data
        self.view_logs = view_logs
        self.access_logins = access_logins