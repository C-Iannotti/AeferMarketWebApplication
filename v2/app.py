import os
import datetime
from flask import Flask, send_from_directory, make_response
from flask_cors import CORS
from flask_login import LoginManager
from database import db_session, init_db
from models import Sales, Users, ModelData, Logs
from dotenv import load_dotenv

import graph_apis
import authentication_apis
import ml_model_apis
import db_info_apis

load_dotenv()

app = Flask(__name__, static_folder="client/build", template_folder="client/build")
app.config["SECRET_KEY"] = os.getenv("SECRET")
app.config["PERMANENT_SESSION_LIFETIME"] = datetime.timedelta(minutes=30)
cors = CORS(app, origins="http://localhost",
      supports_credentials=True)
login_manager = LoginManager()
login_manager.init_app(app)

@app.get("/", defaults={"path": ""})
@app.get("/<path:path>")
def home(path):
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        res = make_response(send_from_directory(app.static_folder, path))
        return res
    else:
        res = make_response(send_from_directory("client/build", "index.html"))
        return res

app.add_url_rule("/api/login", view_func=authentication_apis.login, methods=["POST"])
app.add_url_rule("/api/logout", view_func=authentication_apis.logout, methods=["POST"])
app.add_url_rule("/api/authenticate", view_func=authentication_apis.authenticate, methods=["POST"])

app.add_url_rule("/api/sales-timeframe", view_func=graph_apis.get_sales_timeframe, methods=["POST"])
app.add_url_rule("/api/ratings-timeframe", view_func=graph_apis.get_ratings_timeframe, methods=["POST"])
app.add_url_rule("/api/quantity-trends", view_func=graph_apis.get_quantity_trends, methods=["POST"])
app.add_url_rule("/api/quantity-per-hour", view_func=graph_apis.quantity_per_hour, methods=["POST"])

app.add_url_rule("/api/retrieve-column-values", view_func=db_info_apis.retrieve_column_values, methods=["POST"])
app.add_url_rule("/api/retrieve-tables", view_func=db_info_apis.retrieve_tables, methods=["POST"])
app.add_url_rule("/api/retrieve-table-data", view_func=db_info_apis.retrieve_table_data, methods=["POST"])
app.add_url_rule("/api/update-sales-data", view_func=db_info_apis.update_sales_data, methods=["POST"])

app.add_url_rule("/api/retrieve-trend-predictions", view_func=ml_model_apis.retrieve_trend_predictions, methods=["POST"])
app.add_url_rule("/api/update-model-data", view_func=ml_model_apis.update_model_data, methods=["POST"])
app.add_url_rule("/api/change-model", view_func=ml_model_apis.change_model, methods=["POST"])

@login_manager.user_loader
def load_user(user_id):
    return Users.query.get(user_id)

@app.after_request
def apply_headers(res):
    res.headers.add("Access-Control-Allow-Origin", os.getenv("WHITELISTED"))
    res.headers.add("Access-Control-Allow-Credentials", "true")
    res.headers.add("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT")
    res.headers.add("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers, Access-Control-Allow-Credentials")
    return res

@app.teardown_appcontext
def shutdown_session(exception=None):
    db_session.remove()

if __name__ == "main":
    init_db()
    app.run(port=4000)