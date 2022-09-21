from math import prod
from xmlrpc.client import Boolean
from sqlalchemy import Column, String, SmallInteger, Date, Time, Numeric, Boolean, Integer, ARRAY, BigInteger, TIMESTAMP
from database import Base
from flask_login import UserMixin
import simplejson as json

class Sales(Base):
    __tablename__ = "Sales"
    id = Column("InvoiceID", String, primary_key=True)
    branch = Column("Branch", String)
    city = Column("City", String)
    customer_type = Column("CustomerType", String)
    gender = Column("Gender", String)
    product_line = Column("ProductLine", String)
    unit_price = Column("UnitPrice", Numeric)
    quantity = Column("Quantity", SmallInteger)
    tax = Column("Tax", Numeric)
    total = Column("Total", Numeric)
    date = Column("Date", Date)
    time = Column("Time", Time)
    payment = Column("Payment", String)
    gross_margin_percentage = Column("GrossMarginPercentage", Numeric)
    gross_income = Column("GrossIncome", Numeric)
    rating = Column("Rating", Numeric)

    def __init__(self, id=None, branch=None, city=None, customer_type=None,
                 gender=None, product_line=None, unit_price=None,
                 quantity=None, tax=None, total=None, date=None,
                 time=None, payment=None, gross_margin_percentage=None,
                 gross_income=None, rating=None):
        self.id = id
        self.branch = branch
        self.city = city
        self.customer_type = customer_type
        self.gender = gender
        self.product_line = product_line
        self.unit_price = unit_price
        self.quantity = quantity
        self.tax = tax
        self.total = total
        self.date = date
        self.time = time
        self.payment = payment
        self.gross_margin_percentage = gross_margin_percentage
        self.gross_income = gross_income
        self.rating = rating
    
    def __repr__(self):
        return f'<Sale id={self.id}>'

    def toDict(self):
        return {
            "id": self.id,
            "branch": self.branch,
            "city": self.city,
            "customerType": self.customer_type,
            "gender": self.gender,
            "productLine": self.product_line,
            "unitPrice": self.unit_price,
            "quantity": self.quantity,
            "tax": self.tax,
            "total": self.total,
            "date": self.date,
            "time": self.time,
            "payment": self.payment,
            "grossMarginPercentage": self.gross_margin_percentage,
            "grossIncome": self.gross_income,
            "rating": self.rating
        }
    def toJSON(self):
        return json.dumps(self.toDict(), default=str)

class Users(Base, UserMixin):
    __tablename__ = "Users"
    id = Column("UserID", String, primary_key=True)
    username = Column("Username", String)
    password = Column("Password", String)
    alter_model = Column("AlterModel", Boolean)

    def __init__(self, id=None, username=None, password=None, alter_model=None):
        self.id = id
        self.username = username
        self.password = password
        self.alter_model = alter_model

    def __repr__(self):
        return f'<User id={self.id}>'

class ModelData(Base):
    __tablename__ = "ModelData"
    branch = Column("Branch", String, primary_key=True)
    product_line = Column("ProductLine", String, primary_key=True)
    date = Column("Date", Date, primary_key=True)
    quantity = Column("Quantity", Integer)

    def __init__(self, branch=None, product_line=None, date=None, quantity=None):
        self.branch = branch
        self.product_line = product_line
        self.date = date
        self.quantity = quantity

    def __repr__(self):
        return f'<ModelData branch={self.branch} product_line={self.product_line} date={self.date} quantity={self.quantity}>'

class ModelWeights(Base):
    __tablename__ = "ModelWeights"
    id = Column("id", BigInteger, primary_key=True)
    timestamp = Column("Timestamp", TIMESTAMP)
    layer_1 = Column("Layer1", ARRAY(Numeric))
    layer_2 = Column("Layer2", ARRAY(Numeric))
    layer_3 = Column("Layer3", ARRAY(Numeric))
    layer_4 = Column("Layer4", ARRAY(Numeric))
    layer_5 = Column("Layer5", ARRAY(Numeric))

    def __init__(self, timestamp=None, layer_1=None, layer_2=None, layer_3=None, layer_4=None, layer_5=None):
        self.timestamp = timestamp
        self.layer_1 = layer_1
        self.layer_2 = layer_2
        self.layer_3 = layer_3
        self.layer_4 = layer_4
        self.layer_5 = layer_5

    def __repr__(self):
        return f'<ModelWeights id={self.id}>'

    