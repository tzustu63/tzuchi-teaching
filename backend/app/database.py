"""
資料庫連接和設定
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from .models import Base
import os
from dotenv import load_dotenv

load_dotenv()

# 優先使用 PostgreSQL，沒有則使用 SQLite
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./course_planner.db")

# 創建資料庫引擎
if "postgresql" in DATABASE_URL.lower():
    # PostgreSQL 連接
    engine = create_engine(DATABASE_URL)
else:
    # SQLite 連接
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False}
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def init_db():
    """初始化資料庫，創建所有表"""
    Base.metadata.create_all(bind=engine)


def get_db():
    """獲取資料庫會話"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
