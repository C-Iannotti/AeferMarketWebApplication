from venv import create
from sqlalchemy import create_engine
from sqlalchemy.orm import scoped_session, sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from dotenv import load_dotenv
import os

load_dotenv()

# Creates a database session to be used
# throughout the application
engine = create_engine(os.getenv("DATABASE_URL"))
db_session = scoped_session(sessionmaker(autocommit=False, autoflush=False, bind=engine))

# Initializes the base database model
Base = declarative_base()
Base.query = db_session.query_property()

# Initializes all database models and
# binds them to the current database session
def init_db():
    import models
    Base.metadata.create_all(bind=engine)