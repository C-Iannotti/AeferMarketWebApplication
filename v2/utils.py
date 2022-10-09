import datetime
from flask_login import current_user
from database import db_session
from models import Logs

def add_log(action=None, table=None):
    db_session.add(Logs(user=current_user.id, action=action, table=table, timestamp=datetime.datetime.now()))