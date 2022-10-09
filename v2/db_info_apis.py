import os
from database import db_session
from flask import request, make_response
from flask_login import current_user, login_required
from utils import add_log
import simplejson as json

# Parses sent http body inputs for values for column,
# table, constraints, columns, data, pkData, and pageNumber
# and assigns them valid values if they do not have
# them.
def parse_body_values(conn, body):

    if "column" in body and body["column"].lower() == "customertype":
        body["column"] = '"CustomerType"'
    elif "column" in body and body["column"].lower() == "gender":
        body["column"] = '"Gender"'
    elif "column" in body and body["column"].lower() == "branch":
        body["column"] = '"Branch", "City"'
    else:
        body["column"] = '"ProductLine"'

    if "table" in body and body["table"].lower() == "sales":
        body["table"] = "Sales"
    elif "table" in body and body["table"].lower() == "logs":
        body["table"] = "Logs"
    else:
        body["table"] = "ModelWeights"

    if "constraints" not in body or not isinstance(body["constraints"], list):
        body["constraints"] = []

    if "columns" not in body or not isinstance(body["columns"], list):
        body["columns"] = ["Branch", "City", "CustomerType", "Gender", "ProductLine", "UnitPrice", "Quantity", "Tax", "Total", "Date", "Time", "Payment", "cogs", "GrossMarginPercentage", "GrossIncome", "Rating"]
    if "data" not in body:
        body["data"] = []
    if "pkData" not in body:
        body["pkData"] = []

    if "pageNumber" not in body:
        body["pageNumber"] = 0
    else:
        try:
            body["pageNumber"] = int(body["pageNumber"])
        except:
            body["pageNumber"] = 0

    return body

# http body inputs: column
# returns: values
#
# Parses the body for column and retrieves
# the unique values in the column and returns
# them.
def retrieve_column_values():
    with db_session.connection() as conn:
        body = request.get_json()
        body = parse_body_values(conn, body)

        results = {"values": []}
        print(body)
        query_results = conn.execute(f"""SELECT DISTINCT {body["column"]} FROM "Sales" ORDER BY {body["column"]};""")
        
        for line in query_results:
            if len(line) > 1:
                item = []
                for value in line:
                    item.append(value)
                results["values"].append(item)
            else:
                results["values"].append(line[0] if line[0] is not None else "Unspecified")

        res = make_response(results)
        return res

# requires session-based login cookie
# returns: results
#
# Looks at the current session with the
# requesting user and returns the tables
# and respective columns they are able to
# access.
@login_required
def retrieve_tables():
    res = []
    if current_user.view_sales:
        res.append({
            "table": "Sales",
            "columns": ["Branch", "City", "CustomerType", "Gender", "ProductLine", "UnitPrice", "Quantity", "Tax", "Total", "Date", "Time", "Payment", "cogs", "GrossMarginPercentage", "GrossIncome", "Rating"],
            "pkColumns": ["InvoiceID"]
        })

    if current_user.view_models:
        res.append({
            "table": "ModelWeights",
            "columns": ["Timestamp"],
            "pkColumns": ["id"]
        })

    res = make_response({"results": res})
    return res

# requires session-based login cookie
# http body inputs: table, constraints, columns,
#   pageNumber
# returns: results, pkColumns, columns
#
# Parses the body for table, constraints, and columns
# and retrieves the pageNumber page of table data matching
# the given constraints and sorted by the given columns.
# Returns the table data, along with its primary key columns
# and other columns and creates a view table log.
@login_required
def retrieve_table_data():
    with db_session.connection() as conn:
        body = request.get_json()
        body = parse_body_values(conn, body)
        res = {"results": []}
        table = None
        pk_columns = []

        if body["table"] == "Sales" and current_user.view_sales:
            table = "Sales"
            pk_columns = ['"InvoiceID"']
            res["pkColumns"] = ['InvoiceID']
            if current_user.edit_sales: res["editable"] = True

        if body["table"] == "Logs" and current_user.view_logs:
            table = "Logs"
            pk_columns = ['"id"']
            res["pkColumns"] = ['id']

        if body["table"] == "ModelWeights" and current_user.view_models:
            table = "ModelWeights"
            pk_columns = ['"id"']
            res["pkColumns"] = ['id']

        if table is not None:
            constraints = []
            columns_order = []

            for item in body["constraints"]:
                if not isinstance(item, list) or len(item) != 3: continue
                if not isinstance(item[0], str) or '"' in item[0]: continue
                if not isinstance(item[2], str) or "'" in item[2]: continue
                if item[1] != "=" and item[1] != ">=" and item[1] != "<=": continue
                constraints.append('"' + item[0] + '"' + item[1] + "'" + item[2] + "'")

            for item in body["columns"]:
                if not isinstance(item, list) or len(item) != 2: continue
                if not isinstance(item[0], str) or '"' in item[0]: continue
                if item[1] != "ASC" and item[1] != "DESC": continue
                columns_order.append('"' + item[0] + '"' + " " + item[1])

            if table == "Logs" and "Timestamp" not in columns_order: columns_order.append('"Timestamp" DESC')
                
        query_results = conn.execute(f"""
            SELECT *
            FROM "{table}"
            {"WHERE " + " AND ".join(constraints) if len(constraints) > 0 else ""}
            {"ORDER BY " + ", ".join(columns_order) if len(columns_order) > 0 else ""}
            LIMIT {os.getenv("PAGE_SIZE")} OFFSET {body["pageNumber"] * int(os.getenv("PAGE_SIZE"))}
        """)
        
        res["columns"] = [item for item in list(query_results.keys()) if '"' + item + '"' not in pk_columns]
        for line in query_results:
            res["results"].append(line[:])

        add_log(action="VIEW", table=table)
        db_session.commit()
        return json.dumps(res, default=str)

# requires session-based login cookie
# http body inputs: data, pkData, columns
#
# Parses the body for data, pkData, and columns then
# updates each instance of primary keys in pkData to
# have columns matching data in the Sales table in
# the current database session. Creates an update sales
# log.
@login_required
def update_sales_data():
    if not current_user.edit_sales:
        return "", 403
        
    with db_session.connection() as conn:
        body = request.get_json()
        primary_key_columns = ["InvoiceID"]

        for column in body["columns"]:
            if '"' in column: return "", 400
        for i, row in enumerate(body["data"]):
            valid = True
            for item in row:
                if "'" in item: valid = False
            for item in body["pkData"][i]:
                if "'" in item: valid = False
            if not valid: continue

            query_results = conn.execute(f"""
                UPDATE "Sales"
                SET {", ".join(['"' + body["columns"][j] + '"=' + "'" + row[j] + "'" for j in range(len(row))])}
                WHERE {", ".join(['"' + primary_key_columns[j] + '"=' + "'" + body["pkData"][i][j] + "'" for j in range(len(primary_key_columns))])}
            """)

        add_log(action="UPDATE", table="Sales")
        db_session.commit()
        res = make_response({})
        return res