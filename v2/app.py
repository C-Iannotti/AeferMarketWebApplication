import os
import datetime
from flask import Flask, send_from_directory, make_response, request
from database import db_session, init_db
from models import Sales
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__, static_folder="client/build", template_folder="client/build")
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
    return "Attempted to login"

@app.post("/api/first-sale")
def get_first_sale():
    return Sales.query.first().toJSON()

@app.get("/api/sales-timeframe")
def get_sales_timeframe():
    body = request.form
    beg_date = datetime.datetime.now()
    errors = []
    timeframe_unit = "day"
    timeframe = 30
    if "timeframe" not in body:
        pass
    elif body["timeframe"] == "day":
        timeframe = 1
    elif body["timeframe"] == "week":
        timeframe = 7
    elif body["timeframe"] == "month":
        timeframe_unit = "month"
        timeframe = 1
    elif body["timeframe"] == "quarter":
        timeframe_unit = "month"
        timeframe = 3
    elif body["timeframe"] == "year":
        timeframe_unit = "year"
        timeframe = 1

    if "begDate" in body:
        try:
            with db_session.connection() as conn:
                results = {}
                query_results = conn.execute("""
                    SELECT "ProductLine", "Gender", SUM("Quantity") as Quantity, SUM("GrossIncome") as GrossIncome
                    FROM "Sales"
                    GROUP BY "ProductLine", "Gender"
                    ORDER BY "ProductLine" ASC, GrossIncome DESC
                """)
                for item in query_results:
                    if item[0] not in results:
                        results[item[0]] = {}
                    results[item[0]][item[1]] = item[2:]
                res = make_response(results)
                res.headers.add("Access-Control-Allow-Origin", "*")
                return res
        except:
            errors.append("Passed Invalid Date")
    elif os.getenv("DATA") == "Testing":
        with db_session.connection() as conn:
            beg_date = conn.execute('SELECT "Date", MAX("Time") FROM "Sales" GROUP BY "Date" ORDER BY "Date" DESC LIMIT 1').first()
            if timeframe_unit == "day":
                beg_date = datetime.datetime.combine(beg_date[0], beg_date[1]) - datetime.timedelta(days=timeframe)
            elif timeframe_unit == "month":
                beg_date = datetime.datetime.combine(beg_date[0], beg_date[1]) - datetime.timedelta(months=timeframe)
            elif timeframe_unit == "year":
                beg_date = datetime.datetime.combine(beg_date[0], beg_date[1]) - datetime.timedelta(years=timeframe)

            results = {}
            query_results = conn.execute("""
                SELECT "ProductLine", "Gender", SUM("Quantity") as Quantity, SUM("GrossIncome") as GrossIncome
                FROM "Sales"
                GROUP BY "ProductLine", "Gender"
                ORDER BY "ProductLine" ASC, GrossIncome DESC
            """)
            for item in query_results:
                if item[0] not in results:
                    results[item[0]] = {}
                results[item[0]][item[1]] = item[2:]
            res = make_response(results)
            res.headers.add("Access-Control-Allow-Origin", "*")
            return res

@app.teardown_appcontext
def shutdown_session(exception=None):
    db_session.remove()

if __name__ == "main":
    init_db()
    app.run(port=4000)