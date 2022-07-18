from flask import Flask

app = Flask(__name__)

@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def home(path):
    print(path)
    return f"Welcome to: {path}. Will be putting React App shortly"

@app.route("/api/login")
def login():
    return "Attempted to login"