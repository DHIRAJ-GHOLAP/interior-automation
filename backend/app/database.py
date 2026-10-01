import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from .config import settings

DATABASE_URL = settings.DATABASE_URL

if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(
        DATABASE_URL,
        echo=False,
        connect_args={"check_same_thread": False}
    )
else:
    # Production PostgreSQL pool configuration optimized for Neon pgBouncer
    engine = create_engine(
        DATABASE_URL,
        echo=False,
        pool_size=10,
        max_overflow=5,
        pool_pre_ping=True,
        pool_recycle=300,
        connect_args={"connect_timeout": 10}
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
