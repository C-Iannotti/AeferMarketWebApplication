import datetime
from flask import request, make_response, session
from flask_login import login_required, login_user, logout_user, current_user
from werkzeug.security import check_password_hash
from database import db_session
from models import Users
from utils import add_log

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

@login_required
def logout():
    logout_user()
    res = make_response({ "message": "Logged out user" })
    return res

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