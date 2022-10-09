import os
import datetime
from dotenv import load_dotenv
from dateutil import parser, relativedelta
from flask import request, make_response
from flask_login import login_required
from database import db_session

load_dotenv()

def parse_body_values(conn, body):
    if "branch" not in body or not body["branch"]:
        body["branch"] = "A"

    if ("endDate" not in body or not body["endDate"]) and os.getenv("DATA") == "Testing":
        body["endDate"] = conn.execute('SELECT "Date" FROM "Sales" GROUP BY "Date" ORDER BY "Date" DESC LIMIT 1').first()[0]
    elif "endDate" not in body or not body["endDate"]:
        body["endDate"] = datetime.date.today()
    else:
        try:
            body["endDate"] = parser.parse(body["endDate"]).date()
        except:
            body["endDate"] = datetime.date.today()
    
    if "begDate" not in body or not body["begDate"]:
        body["begDate"] = body["endDate"] - relativedelta.relativedelta(days=30)
    else:
        try:
            body["begDate"] = parser.parse(body["begDate"]).date()
        except:
            body["begDate"] = body["endDate"] - relativedelta.relativedelta(days=30)

    if "separateOn" in body and body["separateOn"].lower() == "gender":
        body["separateOn"] = '"Gender"'
    else:
        body["separateOn"] = '"CustomerType"'

    return body

@login_required
def get_sales_timeframe():
    with db_session.connection() as conn:
        body = request.get_json()
        body = parse_body_values(conn, body)

        results = {}
        query_results = conn.execute(f"""
            SELECT "ProductLine", {body["separateOn"]}, SUM("Quantity") as Quantity, SUM("GrossIncome") as GrossIncome
            FROM "Sales"
            WHERE "Date" Between '{body["begDate"]}' AND '{body["endDate"]}'
            {'AND "Branch"=' + "'" + body['branch'] + "'"}
            {'AND "ProductLine" = ANY' + "('{" + ",".join(body["productLine"]) + "}')" if "productLine" in body and body["productLine"] else ""}
            GROUP BY "ProductLine", {body["separateOn"]}
            ORDER BY "ProductLine", GrossIncome DESC;
        """)

        for line in query_results:
            if line[0] not in results:
                results[line[0]] = {}
                results[line[0]]["totalQuantity"] = 0
                results[line[0]]["totalIncome"] = 0
            line_1 = line[1] if line[1] is not None else "Unspecified"
            results[line[0]][line_1] = { "quantity": line[2], "grossIncome": float(line[3])}
            results[line[0]]["totalQuantity"] += line[2]
            results[line[0]]["totalIncome"] += float(line[3])

        res = make_response(results)
        return res

@login_required
def get_ratings_timeframe():
    with db_session.connection() as conn:
        body = request.get_json()
        body = parse_body_values(conn, body)

        results = {}
        query_results = conn.execute(f"""
            SELECT {body["separateOn"] if len(body["productLine"]) == 1 else '"ProductLine"'}, "Date", AVG("Rating") as "Rating"
            FROM "Sales"
            WHERE "Date" BETWEEN '{str(body["begDate"])}' AND '{str(body["endDate"])}'
            {'AND "Branch"=' + "'" + body['branch'] + "'"}
            {'AND "ProductLine" = ANY' + "('{" + ",".join(body["productLine"]) + "}')" if "productLine" in body and body["productLine"] else ""}
            GROUP BY {body["separateOn"] if len(body["productLine"]) == 1 else '"ProductLine"'}, "Date"
            ORDER BY {body["separateOn"] if len(body["productLine"]) == 1 else '"ProductLine"'}, "Date";
        """)

        for line in query_results:
            line_0 = line[0] if line[0] is not None else "Unspecified"
            if line_0 not in results: results[line_0] = {}
            results[line_0][str(line[1])] = float(line[2])
        results["begDate"] = body["begDate"]
        results["endDate"] = body["endDate"]

        res = make_response(results)
        return res

@login_required
def get_quantity_trends():
    with db_session.connection() as conn:
        body = request.get_json()
        body = parse_body_values(conn, body)

        results = {}
        query_results = conn.execute(f"""
            SELECT {body["separateOn"] if len(body["productLine"]) == 1 else '"ProductLine"'}, "Date", SUM("Quantity")
            FROM "Sales"
            WHERE "Date" BETWEEN '{str(body["begDate"])}' AND '{str(body["endDate"])}'
            {'AND "Branch"=' + "'" + body['branch'] + "'"}
            {'AND "ProductLine" = ANY' + "('{" + ",".join(body["productLine"]) + "}')" if "productLine" in body and body["productLine"] else ""}
            GROUP BY {body["separateOn"] if len(body["productLine"]) == 1 else '"ProductLine"'}, "Date"
            ORDER BY {body["separateOn"] if len(body["productLine"]) == 1 else '"ProductLine"'}, "Date";
        """)

        for line in query_results:
            line_0 = line[0] if line[0] is not None else "Unspecified"
            if line_0 not in results: results[line_0] = {}
            results[line_0][str(line[1])] = line[2]
        results["begDate"] = body["begDate"]
        results["endDate"] = body["endDate"]

        res = make_response(results)
        return res

@login_required
def quantity_per_hour():
    with db_session.connection() as conn:
        body = request.get_json()
        body = parse_body_values(conn, body)

        results = {}
        query_results = conn.execute(f"""
            SELECT {body["separateOn"] if len(body["productLine"]) == 1 else '"ProductLine"'}, EXTRACT(HOUR FROM "Time") AS new_hour, SUM("Quantity")
            FROM "Sales"
            WHERE "Date" BETWEEN '{str(body["begDate"])}' AND '{str(body["endDate"])}'
            {'AND "Branch"=' + "'" + body['branch'] + "'"}
            {'AND "ProductLine" = ANY' + "('{" + ",".join(body["productLine"]) + "}')" if "productLine" in body and body["productLine"] else ""}
            GROUP BY {body["separateOn"] if len(body["productLine"]) == 1 else '"ProductLine"'}, EXTRACT(HOUR FROM "Time")
            ORDER BY {body["separateOn"] if len(body["productLine"]) == 1 else '"ProductLine"'};
        """)

        min_hour = 24
        max_hour = 0
        for line in query_results:
            line_0 = line[0] if line[0] is not None else "Unspecified"
            if line_0 not in results: results[line_0] = {}
            min_hour = min(min_hour, int(line[1]))
            max_hour = max(max_hour, int(line[1]))
            results[line_0][int(line[1])] = line[2]
        results["minHour"] = min_hour
        results["maxHour"] = max_hour

        res = make_response(results)
        return res