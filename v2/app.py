import os
from flask import Flask, send_from_directory

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