import os
import datetime
from dateutil import parser, relativedelta
import tensorflow as tf
import pandas as pd
from flask_login import current_user, login_required
from flask import request, make_response
from database import db_session
from utils import add_log
from sales_ml_model import MLModel

model = MLModel()
data_model_accessed = False

# Parses sent http body inputs for values for
# begDate, endDate, modelMethod, dataMethod, searchDate,
# and productLine and assigns them valid values if they
# do not have them.
def parse_body_values(conn, body):
    if ("endDate" not in body or not body["endDate"]) and os.getenv("DATA") == "Testing":
        body["endDate"] = conn.execute('SELECT "Date" FROM "Sales" GROUP BY "Date" ORDER BY "Date" DESC LIMIT 1').first()[0]
    elif "endDate" not in body or not body["endDate"]:
        body["endDate"] = datetime.date.today()
    else:
        try:
            body["endDate"] = parser.parse(body["endDate"]).date()
        except:
            body["endDate"] = datetime.date.today()
    body["begDate"] = body["endDate"] - datetime.timedelta(days=13)

    if "modelMethod" not in body:
        body["modelMethod"] = "check"

    if "dataMethod" not in body:
        body["dataMethod"] = "check"

    if "searchDate" not in body or not body["searchDate"]:
        body["searchDate"] = datetime.datetime.now()

    product_lines = []

    if "productLine" in body and isinstance(body["productLine"], list):
        for product_line in body["productLine"]:
            if "," not in product_line:
                product_lines.append(product_line)

    body["productLine"] = product_lines

    return body

# requires a session-based login cookie
# http body inputs: branch, begDate, endDate,
#   productLine
# 
# Parses body for branch, begDate, endDate,
# and productLine and uses current model and
# quantities between bgeDate and endDate to make
# predications for the next day of productLine's
# general quantity trend (0 for down, 1 for
# roughly similar, and 2 for up).
@login_required
def retrieve_trend_predictions():
    with db_session.connection() as conn:
        body = request.get_json()
        body = parse_body_values(conn, body)
        model = globals()['model'].model
        prediction_month = (body["endDate"] + datetime.timedelta(days=1)).month

        model_columns = pd.read_pickle("./model/transformed_model_columns.pkl")

        query_results = conn.execute(f"""
            SELECT "ProductLine", "Date", SUM("Quantity")
            FROM "Sales"
            WHERE "Date" BETWEEN '{str(body["begDate"])}' AND '{str(body["endDate"])}'
            {'AND "Branch"=' + "'" + body['branch'] + "'"}
            {'AND "ProductLine" = ANY' + "('{" + ",".join(body["productLine"]) + "}')" if len(body["productLine"]) > 0 else ""}
            GROUP BY "ProductLine", "Date"
            ORDER BY "ProductLine", "Date";
        """)

        prev_pl = None
        predictions_pl = []
        for line in query_results:
            if prev_pl != line[0]:
                if prev_pl is not None:
                    model_columns.iloc[-1]["Month"] = prediction_month
                    model_columns.iloc[-1][body["branch"]] = 1
                    model_columns.iloc[-1][prev_pl] = 1
                model_columns.loc[len(model_columns)] = [0 for i in range(model_columns.shape[1])]
                prev_pl = line[0]
                predictions_pl.append(prev_pl)
            model_columns.iloc[-1][str(13 - (body["endDate"] - line[1]).days)] = line[2]
        model_columns.iloc[-1]["Month"] = prediction_month
        model_columns.iloc[-1][body["branch"]] = 1
        model_columns.iloc[-1][prev_pl] = 1

        tf_model_columns = tf.convert_to_tensor(model_columns.to_numpy().reshape(-1, 1, model_columns.shape[1]))
        results = {
            "predictions": model(tf_model_columns).numpy().reshape(-1,).tolist(),
            "predictionsPL": predictions_pl
        }
        for i in range(len(results["predictions"])):
            if results["predictions"][i] <= 0:
                results["predictions"][i] = 0
            elif results["predictions"][i] >= 2:
                results["predictions"][i] = 2
            else:
                results["predictions"][i] = int(round(results["predictions"][i]))

        res = make_response(results)
        return res

# requires a session-based login cookie
# requires neither the model data nor model
# to be being updated
# http body inputs: dataMethod
# 
# Parses body for the dataMethod. Based on
# the dataMethod, either returns whether
# currently in process (check), adds the
# quantities for each group of branch and
# product line for a day that is not already
# in the model data (append), or recreates the
# model data in its entirety (replace). Creates
# an update model data log and stores model data
# locally.
@login_required
def update_model_data():
    global data_model_accessed

    if data_model_accessed: return make_response({"inProcess": True})
    data_model_accessed = True

    try:
        if not current_user.alter_model:
                return "", 403

        with db_session.connection() as conn:
            body = request.get_json()
            body = parse_body_values(conn, body)
            res = {}

            if body["dataMethod"].lower() == "check":
                res["inProcess"] = False

            if body["dataMethod"].lower() == "append":
                query_results = conn.execute(f"""
                    SELECT MAX("Date")
                    FROM "ModelData";
                """)
                for line in query_results:
                    min_date = line[0]
                if min_date is not None: min_date = min_date + datetime.timedelta(days=1)
                
                query_results = conn.execute(f"""
                    SELECT MIN("Date"), MAX("Date")
                    FROM "Sales";
                """)
                for line in query_results:
                    if min_date is None:
                        min_date = line[0]
                    max_date = line[1]

                query_results = conn.execute(f"""
                    INSERT INTO "ModelData"
                    SELECT "Branch", "ProductLine", "Date", SUM("Quantity") as "Quantity"
                    FROM 
                    (SELECT "Branch", "ProductLine", "Date", "Quantity"
                    FROM "Sales"
                    UNION
                    SELECT "Branch", "ProductLine", "Date"::date, 0 as "Quantity"
                    FROM generate_series('{min_date}'::timestamp, '{max_date}', '1 day') AS a("Date") CROSS JOIN (SELECT DISTINCT "Branch", "ProductLine" FROM "Sales") as b
                    ) as c
                    WHERE "Date" BETWEEN '{min_date}' AND '{max_date}'
                    GROUP BY "Branch", "ProductLine", "Date"
                    ORDER BY "Branch", "ProductLine", "Date";
                """)

            if body["dataMethod"].lower() == "replace":
                query_results = conn.execute("""DELETE FROM "ModelData";""")

                query_results = conn.execute(f"""
                    SELECT MIN("Date"), MAX("Date")
                    FROM "Sales";
                """)
                for line in query_results:
                    min_date = line[0]
                    max_date = line[1]

                query_results = conn.execute(f"""
                    INSERT INTO "ModelData"
                    SELECT "Branch", "ProductLine", "Date", SUM("Quantity") as "Quantity"
                    FROM 
                    (SELECT "Branch", "ProductLine", "Date", "Quantity"
                    FROM "Sales"
                    UNION
                    SELECT "Branch", "ProductLine", "Date"::date, 0 as "Quantity"
                    FROM generate_series('{min_date}'::timestamp, '{max_date}', '1 day') AS a("Date") CROSS JOIN (SELECT DISTINCT "Branch", "ProductLine" FROM "Sales") as b
                    ) as c
                    WHERE "Date" BETWEEN '{min_date}' AND '{max_date}'
                    GROUP BY "Branch", "ProductLine", "Date"
                    ORDER BY "Branch", "ProductLine", "Date";
                """)

            data = pd.DataFrame(columns=["Branch", "Product line", "Date", "Quantity"])
            query_results = conn.execute("""
                SELECT "Branch", "ProductLine", "Date", "Quantity"
                FROM "ModelData"
                ORDER BY "Branch", "ProductLine", "Date"
            """)
            for line in query_results:
                data.loc[len(data.index)] = [line[0], line[1], line[2], line[3]]

            train_data = pd.DataFrame(columns=["Branch", "Product line", "Month"] + [f"{i}" for i in range(14)] + ["Class"])

            for [branch, product_line], cur_frame in data.groupby(["Branch", "Product line"]):
                values = cur_frame["Quantity"]
                cur_slide = values.iloc[:14].to_list()
                for i in range(14, values.shape[0]):
                    label = 1

                    if cur_slide[-1] - values.iloc[i] >= cur_slide[-1] * 0.33:
                        label = 0
                    elif cur_slide[-1] - values.iloc[i] <= cur_slide[-1] * -0.33:
                        label = 2
                    train_data.loc[len(train_data.index)] = [branch, product_line, cur_frame.iloc[i]["Date"].month] + cur_slide + [label]

                    cur_slide.pop(0)
                    cur_slide.append(values.iloc[i])
                        
            train_data = pd.concat([train_data, pd.get_dummies(train_data["Branch"])], axis=1)
            train_data = pd.concat([train_data, pd.get_dummies(train_data["Product line"])], axis=1)

            train_data.pop("Branch")
            train_data.pop("Product line")
            train_data = train_data[[c for c in train_data if c not in [f"{i}" for i in range(14)]] 
                + [f"{i}" for i in range(14)]]
                        
            train_data_columns = train_data.iloc[:0].copy().drop(columns=["Class"])
            train_data_columns.to_pickle("./model/transformed_model_columns.pkl")
            
            valid_data = train_data.sample(frac=0.15)
            train_data = train_data.drop(valid_data.index)

            train_0 = train_data[train_data["Class"] == 0]
            train_1 = train_data[train_data["Class"] == 1]
            train_2 = train_data[train_data["Class"] == 2]
            max_train = (train_0 if train_0.shape[0] >= train_1.shape[0] and train_0.shape[0] >= train_2.shape[0] else
                        train_1 if train_1.shape[0] >= train_0.shape[0] and train_1.shape[0] >= train_2.shape[0] else
                        train_2)

            valid_0 = valid_data[valid_data["Class"] == 0]
            valid_1 = valid_data[valid_data["Class"] == 1]
            valid_2 = valid_data[valid_data["Class"] == 2]
            max_valid = (valid_0 if valid_0.shape[0] >= valid_1.shape[0] and valid_0.shape[0] >= valid_2.shape[0] else
                        valid_1 if valid_1.shape[0] >= valid_0.shape[0] and valid_1.shape[0] >= valid_2.shape[0] else
                        valid_2)

            for data_item in [train_0, train_1, train_2]:
                cur_num = data_item.shape[0]
                while cur_num + data_item.shape[0] < max_train.shape[0]:
                    train_data = pd.concat([train_data, data_item])
                    cur_num += data_item.shape[0]

            for data_item in [valid_0, valid_1, valid_2]:
                cur_num = data_item.shape[0]
                while cur_num + data_item.shape[0] < max_valid.shape[0]:
                    valid_data = pd.concat([valid_data, data_item])
                    cur_num += data_item.shape[0]

            train_data.to_csv("./model/train_data.csv", index=False)
            valid_data.to_csv("./model/valid_data.csv", index=False)

            add_log(action="UPDATE", table="ModelData")
            db_session.commit()
            data_model_accessed = False
            return make_response(res), 200
    except:
        data_model_accessed = False
        return "", 500

# requires a session-based login cookie
# requires neither the model data nor model
# to be being updated
# http body inputs: modelMethod
# 
# Parses body for the modelMethod. Based on
# the modelMethod, either returns whether
# currently in process (check), trains the
# model (increment), recreates the model
# in its entirety (remake), or retrieves a
# previously stored model (retrieval). Creates
# an update model log and adds model to database
# session if modelMethod was increment or remake.
@login_required
def change_model():
    global data_model_accessed
    print(data_model_accessed)

    if data_model_accessed: return make_response({"inProcess": True})
    data_model_accessed = True
    try:
        if not current_user.alter_model:
            return "", 403

        with db_session.connection() as conn:
            body = request.get_json()
            body = parse_body_values(conn, body)
            new_model = None
            res = {}

            if body["modelMethod"].lower() == "check":
                res["inProcess"] = False
            
            if body["modelMethod"].lower() == "increment":
                new_model, res["trainAccuracy"], res["validAccuracy"] = model.train_model(10)

            if body["modelMethod"].lower() == "remake":
                new_model, res["trainAccuracy"], res["validAccuracy"] = model.remake_model()

            if body["modelMethod"].lower() == "retrieval":
                query_results = conn.execute(f"""
                    SELECT id, "Timestamp", "Layer1", "Layer2", "Layer3", "Layer4", "Layer5"
                    FROM "ModelWeights"
                    WHERE "Timestamp" < '{body["searchDate"]}'
                    ORDER BY "Timestamp" DESC
                    LIMIT 1
                """)
                weights = []
                for line in query_results:
                    res["id"] = line[0]
                    res["timestamp"] = line[1]
                    weights = [line[2:]]
                model.set_model(weights)
            
            if new_model:
                db_session.add(new_model)
                add_log(action="UPDATE", table="ModelWeights")
                db_session.commit()

            res = make_response(res)
            data_model_accessed = False
            return res
    except:
        data_model_accessed = False
        return "", 500