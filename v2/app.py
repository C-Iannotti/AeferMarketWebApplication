import os
import datetime
from dateutil import parser, relativedelta
from flask import Flask, send_from_directory, make_response, request, session
from flask_cors import CORS
from flask_login import LoginManager, login_user, current_user, login_required, logout_user
from database import db_session, init_db
from models import Sales, Users, ModelData
from dotenv import load_dotenv
from werkzeug.security import generate_password_hash, check_password_hash
import tensorflow as tf
import pandas as pd
from sales_ml_model import MLModel

load_dotenv()

app = Flask(__name__, static_folder="client/build", template_folder="client/build")
app.config["SECRET_KEY"] = os.getenv("SECRET")
app.config["PERMANENT_SESSION_LIFETIME"] = datetime.timedelta(minutes=30)
cors = CORS(app, origins="http://localhost",
      supports_credentials=True)
login_manager = LoginManager()
login_manager.init_app(app)

model = MLModel()

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

    if "modelMethod" not in body:
        body["modelMethod"] = "increment"

    if "dataMethod" not in body:
        body["dataMethod"] = "append"

    return body

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

@app.post("/api/sales-timeframe")
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

@app.post("/api/ratings-timeframe")
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

@app.post("/api/quantity-trends")
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

@app.post("/api/quantity-per-half-hour")
@login_required
def quantity_per_hour():
    with db_session.connection() as conn:
        body = request.get_json()
        body = parse_body_values(conn, body)

        results = {}
        query_results = conn.execute(f"""
            SELECT {body["separateOn"] if len(body["productLine"]) == 1 else '"ProductLine"'}, EXTRACT(HOUR FROM "Time") AS new_hour, FLOOR(EXTRACT(MINUTE FROM "Time") / 30) * 30 AS new_minute, SUM("Quantity")
            FROM "Sales"
            WHERE "Date" BETWEEN '{str(body["begDate"])}' AND '{str(body["endDate"])}'
            {'AND "Branch"=' + "'" + body['branch'] + "'"}
            {'AND "ProductLine" = ANY' + "('{" + ",".join(body["productLine"]) + "}')" if "productLine" in body and body["productLine"] else ""}
            GROUP BY {body["separateOn"] if len(body["productLine"]) == 1 else '"ProductLine"'}, EXTRACT(HOUR FROM "Time"), FLOOR(EXTRACT(MINUTE FROM "Time") / 30)
            ORDER BY {body["separateOn"] if len(body["productLine"]) == 1 else '"ProductLine"'};
        """)

        min_hour = 24
        max_hour = 0
        for line in query_results:
            line_0 = line[0] if line[0] is not None else "Unspecified"
            if line_0 not in results: results[line_0] = {}
            min_hour = min(min_hour, int(line[1]))
            max_hour = max(max_hour, int(line[1]))
            results[line_0][str(datetime.time(hour=int(line[1]), minute=int(line[2])))] = line[3]
        results["minHour"] = min_hour
        results["maxHour"] = max_hour

        res = make_response(results)
        return res

@app.post("/api/retrieve-column-values")
def retrieve_column_values():
    with db_session.connection() as conn:
        body = request.get_json()

        if "column" in body and body["column"].lower() == "customertype":
            body["column"] = '"CustomerType"'
        elif "column" in body and body["column"].lower() == "gender":
            body["column"] = '"Gender"'
        elif "column" in body and body["column"].lower() == "branch":
            body["column"] = '"Branch", "City"'
        else:
            body["column"] = '"ProductLine"'

        results = {"values": []}
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

@app.post("/api/retrieve-trend-predictions")
@login_required
def retrieve_trend_predictions():
    with db_session.connection() as conn:
        body = request.get_json()
        body = parse_body_values(conn, body)
        model = tf.keras.models.load_model("./model/model.h5")
        body["begDate"] = body["endDate"] - datetime.timedelta(days=13)
        prediction_month = (body["endDate"] + datetime.timedelta(days=1)).month

        model_columns = pd.read_pickle("./model/transformed_model_columns.pkl")

        query_results = conn.execute(f"""
            SELECT "ProductLine", "Date", SUM("Quantity")
            FROM "Sales"
            WHERE "Date" BETWEEN '{str(body["begDate"])}' AND '{str(body["endDate"])}'
            {'AND "Branch"=' + "'" + body['branch'] + "'"}
            {'AND "ProductLine" = ANY' + "('{" + ",".join(body["productLine"]) + "}')" if "productLine" in body and body["productLine"] else ""}
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


@app.post("/api/update-model-data")
@login_required
def update_model_data():
    if not current_user.alter_model:
            return "", 403

    with db_session.connection() as conn:
        body = request.get_json()
        body = parse_body_values(conn, body)

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
        branches = pd.unique(data["Branch"])
        product_lines = pd.unique(data["Product line"])
        j=0

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


        #train_class = train_data.pop("Class")
        #valid_class = valid_data.pop("Class")

        train_data.to_csv("./model/train_data.csv", index=False)
        #train_class.to_csv("./model/train_class.csv", index=False)
        valid_data.to_csv("./model/valid_data.csv", index=False)
        #valid_class.to_csv("./model/valid_class.csv", index=False)

        db_session.commit()
        return "", 200


@app.post("/api/change-model")
@login_required
def change_model():
    if not current_user.alter_model:
            return "", 403

    with db_session.connection() as conn:
        body = request.get_json()
        body = parse_body_values(conn, body)
        print(body)
        
        if body["modelMethod"].lower() == "increment":
            train_acc, valid_acc = model.train_model(10)

        if body["modelMethod"].lower() == "remake":
            print("Why")
            train_acc, valid_acc = model.remake_model()

        res = make_response({"trainAccuracy": train_acc, "validAccuracy": valid_acc})
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