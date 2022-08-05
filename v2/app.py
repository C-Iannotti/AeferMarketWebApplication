import os
import datetime
from dateutil import parser, relativedelta
from flask import Flask, send_from_directory, make_response, request, session
from flask_cors import CORS
from flask_login import LoginManager, login_user, current_user, login_required, logout_user
from database import db_session, init_db
from models import Sales, Users
from dotenv import load_dotenv
from werkzeug.security import generate_password_hash, check_password_hash

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

@app.post("/api/login")
def login():
    with db_session.connection() as conn:
        body = request.get_json()
        query_results = conn.execute(f"""
            SELECT "UserID", "Username", "Password", "AuthorityLevel"
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
        res = make_response({ "message": "Logged in"})
        return res

@app.post("/api/logout")
@login_required
def logout():
    logout_user()
    res = make_response({ "message": "Logged out user" })
    return res


@app.post("/api/authenticate")
def authenticate():
    if current_user.is_authenticated:
        return make_response({
            "isAuthenticated": current_user.is_authenticated,
            "username": current_user.username
            })
    else:
        return "", 401

@app.post("/api/first-sale")
@login_required
def get_first_sale():
    return Sales.query.first().toJSON()

@app.post("/api/sales-timeframe")
@login_required
def get_sales_timeframe():
    with db_session.connection() as conn:
        body = request.get_json()
        errors = []
        if ("endDate" not in body or not body["endDate"]) and os.getenv("DATA") == "Testing":
            body["endDate"] = conn.execute('SELECT "Date" FROM "Sales" GROUP BY "Date" ORDER BY "Date" DESC LIMIT 1').first()[0]
        elif "endDate" not in body or not body["endDate"]:
            body["endDate"] = datetime.date.today()
        else:
            try:
                body["endDate"] = parser.parse(body["endDate"]).date()
            except:
                errors.append("Passed Invalid End Date")
                body["endDate"] = datetime.date.today()
        
        if "begDate" not in body or not body["begDate"]:
            body["begDate"] = body["endDate"] - relativedelta.relativedelta(days=30)
        else:
            try:
                body["begDate"] = parser.parse(body["begDate"]).date()
            except:
                errors.append("Passed Invalid End Date")
                body["begDate"] = body["endDate"] - relativedelta.relativedelta(days=30)
        
        results = {}
        query_results = conn.execute(f"""
            SELECT "ProductLine", "Gender", SUM("Quantity") as Quantity, SUM("GrossIncome") as GrossIncome
            FROM "Sales"
            WHERE "Date" Between '{body["begDate"]}' AND '{body["endDate"]}'
            {'AND "ProductLine"=' + "'" + body["productLine"] + "'" if "productLine" in body and body["productLine"] else ""}
            GROUP BY "ProductLine", "Gender"
            ORDER BY "ProductLine" ASC, GrossIncome DESC;
        """)
        for item in query_results:
            if item[0] not in results:
                results[item[0]] = {}
            results[item[0]][item[1]] = { "quantity": item[2], "grossIncome": float(item[3])}
        res = make_response(results)
        return res

@app.post("/api/ratings-timeframe")
@login_required
def get_ratings_timeframe():
    with db_session.connection() as conn:
        body = request.get_json()
        errors = []
        if ("endDate" not in body or not body["endDate"]) and os.getenv("DATA") == "Testing":
            body["endDate"] = conn.execute('SELECT "Date" FROM "Sales" GROUP BY "Date" ORDER BY "Date" DESC LIMIT 1').first()[0]
        elif "endDate" not in body or not body["endDate"]:
            body["endDate"] = datetime.date.today()
        else:
            try:
                body["endDate"] = parser.parse(body["endDate"]).date()
            except:
                errors.append("Passed Invalid End Date")
                body["endDate"] = datetime.date.today()
        
        if "begDate" not in body or not body["begDate"]:
            body["begDate"] = body["endDate"] - relativedelta.relativedelta(days=30)
        else:
            try:
                body["begDate"] = parser.parse(body["begDate"]).date()
            except:
                errors.append("Passed Invalid End Date")
                body["begDate"] = body["endDate"] - relativedelta.relativedelta(days=30)
        results = {}
        query_results = conn.execute(f"""
            SELECT "ProductLine", "Gender", "Date", AVG("Rating") as "Rating"
            FROM "Sales"
            WHERE "Date" BETWEEN '{str(body["begDate"])}' AND '{str(body["endDate"])}'
            {'AND "ProductLine"=' + "'" + body["productLine"] + "'" if "productLine" in body and body["productLine"] else ""}
            GROUP BY "ProductLine", "Gender", "Date"
            ORDER BY "ProductLine", "Gender", "Date";
        """)

        for line in query_results:
            if line[0] not in results: results[line[0]] = {}
            if line[1] is None: line[1] = "Unspecified"
            if line[1] not in results[line[0]]: results[line[0]][line[1]] = {}
            results[line[0]][line[1]][str(line[2])] = line[3]
        res = make_response(results)
        return res

@app.post("/api/quantity-trends")
@login_required
def get_quantity_trends():
    with db_session.connection() as conn:
        body = request.get_json()
        errors = []
        if ("endDate" not in body or not body["endDate"]) and os.getenv("DATA") == "Testing":
            body["endDate"] = conn.execute('SELECT "Date" FROM "Sales" GROUP BY "Date" ORDER BY "Date" DESC LIMIT 1').first()[0]
        elif "endDate" not in body or not body["endDate"]:
            body["endDate"] = datetime.date.today()
        else:
            try:
                body["endDate"] = parser.parse(body["endDate"]).date()
            except:
                errors.append("Passed Invalid End Date")
                body["endDate"] = datetime.date.today()
        
        if "begDate" not in body or not body["begDate"]:
            body["begDate"] = body["endDate"] - relativedelta.relativedelta(days=30)
        else:
            try:
                body["begDate"] = parser.parse(body["begDate"]).date()
            except:
                errors.append("Passed Invalid End Date")
                body["begDate"] = body["endDate"] - relativedelta.relativedelta(days=30)
        results = {}
        query_results = conn.execute(f"""
            SELECT "CustomerType", "Gender", "Date", SUM("Quantity")
            FROM "Sales"
            WHERE "Date" BETWEEN '{str(body["begDate"])}' AND '{str(body["endDate"])}'
            {'AND "ProductLine"=' + "'" + body["productLine"] + "'" if "productLine" in body and body["productLine"] else ""} 
            GROUP BY "CustomerType", "Gender", "Date"
            ORDER BY "CustomerType", "Gender", "Date";
        """)
        for line in query_results:
            if line[0] not in results: results[line[0]] = {}
            if line[1] not in results[line[0]]: results[line[0]][line[1]] = {}
            results[line[0]][line[1]][str(line[2])] = line[3]
        res = make_response(results)
        return res

@app.post("/api/retrieve-product-lines")
def retrieve_product_lines():
    with db_session.connection() as conn:
        results = {"productLines": []}
        query_results = conn.execute("""SELECT DISTINCT "ProductLine" FROM "Sales" ORDER BY "ProductLine";""")
        for line in query_results:
            results["productLines"].append(line[0])
        res = make_response(results)
        return res

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