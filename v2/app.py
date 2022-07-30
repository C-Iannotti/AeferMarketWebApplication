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
cors = CORS(app)

@app.get("/", defaults={"path": ""})
@app.get("/<path:path>")
def home(path):
    print("Why")
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        res = make_response(send_from_directory(app.static_folder, path))
        return res
    else:
        res = make_response(send_from_directory("client/build", "index.html"))
        return res

@app.post("/api/login")
def login():
    return "Attempted to login"

@app.post("/api/first-sale")
def get_first_sale():
    return Sales.query.first().toJSON()

@app.post("/api/sales-timeframe")
def get_sales_timeframe():
    with db_session.connection() as conn:
        body = request.get_json()
        end_date = datetime.date.today()
        errors = []
        timeframe_unit = "month"
        timeframe = 1
        if "timeframeUnit" not in body:
            pass
        elif body["timeframeUnit"] == "day":
            timeframe = 1
        elif body["timeframeUnit"] == "week":
            timeframe = 7
        elif body["timeframeUnit"] == "month":
            timeframe_unit = "month"
            timeframe = 1
        elif body["timeframeUnit"] == "quarter":
            timeframe_unit = "month"
            timeframe = 3
        elif body["timeframeUnit"] == "year":
            timeframe_unit = "year"
            timeframe = 1

        if "endDate" in body:
            try:
                end_date = parser.parse(body["endDate"]).date()
            except:
                errors.append("Passed Invalid Date")
        elif os.getenv("DATA") == "Testing":
            end_date = conn.execute('SELECT "Date" FROM "Sales" GROUP BY "Date" ORDER BY "Date" DESC LIMIT 1').first()[0]

        beg_date = datetime.date.today()
        if timeframe_unit == "day":
            beg_date = end_date - relativedelta.relativedelta(days=timeframe)
        elif timeframe_unit == "month":
            beg_date = end_date - relativedelta.relativedelta(months=timeframe)
        elif timeframe_unit == "year":
            beg_date = end_date - relativedelta.relativedelta(years=timeframe)
        end_date = end_date - relativedelta.relativedelta(days=1)
        results = {}
        
        query_results = conn.execute(f"""
            SELECT "ProductLine", "Gender", SUM("Quantity") as Quantity, SUM("GrossIncome") as GrossIncome
            FROM "Sales"
            WHERE "Date" Between '{beg_date}' AND '{end_date}'
            GROUP BY "ProductLine", "Gender"
            ORDER BY "ProductLine" ASC, GrossIncome DESC
        """)
        for item in query_results:
            if item[0] not in results:
                results[item[0]] = {}
            results[item[0]][item[1]] = { "quantity": item[2], "grossIncome": float(item[3])}
        res = make_response(results)
        res.headers.add("Access-Control-Allow-Origin", "*")
        return res

@app.post("/api/ratings-timeframe")
def get_ratings_timeframe():
    with db_session.connection() as conn:
        body = request.get_json()
        errors = []
        if "endDate" not in body and os.getenv("DATA") == "Testing":
            body["endDate"] = conn.execute('SELECT "Date" FROM "Sales" GROUP BY "Date" ORDER BY "Date" DESC LIMIT 1').first()[0]
        elif "endDate" not in body:
            body["endDate"] = datetime.date.today()
        else:
            try:
                body["endDate"] = parser.parse(body["endDate"]).date()
            except:
                errors.append("Passed Invalid End Date")
                body["endDate"] = datetime.date.today()
        
        if "begDate" not in body:
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
            GROUP BY "ProductLine", "Gender", "Date"
            ORDER BY "ProductLine", "Gender", "Date"
        """)

        for line in query_results:
            if line[0] not in results: results[line[0]] = {}
            if line[1] not in results[line[0]]: results[line[0]][line[1]] = {}
            results[line[0]][line[1]][str(line[2])] = line[3]
        res = make_response(results)
        res.headers.add("Access-Control-Allow-Origin", "*")
        return res


@app.teardown_appcontext
def shutdown_session(exception=None):
    db_session.remove()

if __name__ == "main":
    init_db()
    app.run(port=4000)