import datetime
from flask import request, make_response, session
from flask_login import login_required, login_user, logout_user, current_user
from werkzeug.security import check_password_hash
from database import db_session
from models import Users
from utils import add_log

# http body inputs: username, password
# returns: message
# 
# Creates a session-based login cookie and
# assigns it to the requesting user if the given
# username and password matches a user in the
# database session. Then, a login log instance is
# created.
def login():
    with db_session.connection() as conn:
        body = request.get_json()
        query_results = conn.execute(f"""
            SELECT "UserID", "Username", "Password", "AlterModel"
            FROM "Users"
            WHERE "Username"='{body["username"]}'
        """)
        result = None
        for line in query_results:
            if check_password_hash(line[2], body["password"]):
                result = line
                break

        if result is None: return "", 401
        session.permanent = True
        user = Users.query.get(result[0])
        login_user(user, duration=datetime.timedelta(minutes=30))
        add_log("LOGIN")
        db_session.commit()
        res = make_response({ "message": "Logged in"})
        return res

# requires a session-based login cookie
# returns: message
# 
# Ends the current session by invalidating
# the requesting user's login cookie.
@login_required
def logout():
    logout_user()
    res = make_response({ "message": "Logged out user" })
    return res

# returns: isAuthenticated, username,
#   dataAccess, logsAccess, modelAccess
#
# Checks if the requesting user has a valid
# login cookie, and returns either an error if
# they do not have one or information about the
# logged in user.
def authenticate():
    if current_user.is_authenticated:
        return make_response({
            "isAuthenticated": current_user.is_authenticated,
            "username": current_user.username,
            "dataAccess": current_user.view_sales or current_user.view_models,
            "logsAccess": current_user.view_logs,
            "modelAccess": current_user.alter_model
            })
    else:
        return "", 401