import os
import datetime
from dateutil import parser, relativedelta
from flask import Flask, send_from_directory, make_response, request
from flask_cors import CORS
from database import db_session, init_db
from models import Sales
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__, static_folder="client/build", template_folder="client/build")
cors = CORS(app, origins="http://localhost",
      allow_headers=["Content-Type", "Authorization", "Access-Control-Allow-Credentials", "Access-Control-Allow-Origin"],
      supports_credentials=True)

@app.get("/", defaults={"path": ""})
@app.get("/<path:path>")
def home(path):
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        res = make_response(send_from_directory(app.static_folder, path))
        return res
    else:
        res = make_response(send_from_directory("client/build", "index.html"))
        return res

@app.route("/api/login", methods=["OPTIONS"])
def login_options():
    print("Here")
    res = make_response()
    res.headers.add("Access-Control-Allow-Credentials", True)
    return res

@app.post("/api/login")
def login():
    print("why")
    res = make_response("Attempted to login")
    res.headers.add("Access-Control-Allow-Credentials", "true")
    return res

@app.post("/api/first-sale")
def get_first_sale():
    return Sales.query.first().toJSON()

@app.post("/api/sales-timeframe")
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
        query_results = conn.execute("""SELECT DISTINCT "ProductLine" FROM "Sales" """)
        for line in query_results:
            results["productLines"].append(line[0])
        res = make_response(results)
        return res

@app.after_request
def apply_headers(res):
    res.headers.add("Access-Control-Allow-Origin", os.getenv("WHITELISTED"))
    return res

@app.teardown_appcontext
def shutdown_session(exception=None):
    db_session.remove()

if __name__ == "main":
    init_db()
    app.run(port=4000)