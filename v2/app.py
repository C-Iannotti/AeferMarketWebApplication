import os
from flask import Flask, send_from_directory
from database import db_session, init_db
from models import Sales

app = Flask(__name__, static_folder="client/build", template_folder="client/build")
@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def home(path):
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory("client/build", "index.html")

@app.route("/api/login")
def login():
    return "Attempted to login"

@app.teardown_appcontext
def shutdown_session(exception=None):
    db_session.remove()

@app.route("/api/get-first-sale")
def get_first_sale():
    return Sales.query.first().toJSON()

if __name__ == "main":
    init_db()
    app.run(port=4000)