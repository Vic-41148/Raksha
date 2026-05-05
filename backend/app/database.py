from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import datetime
from .config import DATABASE_URL

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

class AlertLog(Base):
    __tablename__ = "alert_logs"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    lat = Column(Float)
    lon = Column(Float)
    risk_level = Column(String)
    score = Column(Float)
    decision = Column(String)
    kids_present = Column(Boolean)
    elderly_present = Column(Boolean)

def init_db():
    Base.metadata.create_all(bind=engine)
