"""
資料庫連接和設定
"""
import os
from typing import Any, Dict

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.engine import make_url
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import NullPool

from .config import settings
from .models import Base

load_dotenv()

# ======== 資料庫連線設定 ========
# Railway 部署會透過環境變數提供 DATABASE_URL（通常為 PostgreSQL）
# 若未提供，則退回開發用 SQLite
DEFAULT_SQLITE_URL = "sqlite:///./course_planner.db"
DATABASE_URL = (
    os.getenv("DATABASE_URL")
    or settings.database_url
    or DEFAULT_SQLITE_URL
)

# 將解析後的 URL 回寫到 settings，確保應用內部一致
settings.database_url = DATABASE_URL

url = make_url(DATABASE_URL)
backend_name = url.get_backend_name().lower()

engine_kwargs: Dict[str, Any] = {}

if backend_name.startswith("sqlite"):
    # SQLite 僅用於本地開發，禁用連線池避免 thread 檢查問題
    engine_kwargs.update(
        {
            "connect_args": {"check_same_thread": False},
            "poolclass": NullPool,
        }
    )
else:
    # PostgreSQL（Railway 預設）或其他 SQL 後端
    # Railway 會提供 `sslmode=require`，若缺少則自動補上
    connect_args: Dict[str, Any] = {}
    if backend_name.startswith("postgres") and "sslmode" not in (url.query or {}):
        connect_args["sslmode"] = (
            os.getenv("PGSSLMODE")
            or settings.pg_sslmode
            or "require"
        )

    if connect_args:
        engine_kwargs["connect_args"] = connect_args

    # 允許透過環境變數調整連線池參數
    pool_size = int(os.getenv("DB_POOL_SIZE", str(settings.db_pool_size)))
    max_overflow = int(os.getenv("DB_MAX_OVERFLOW", str(settings.db_max_overflow)))
    engine_kwargs.update(
        {
            "pool_pre_ping": True,
            "pool_size": pool_size,
            "max_overflow": max_overflow,
        }
    )

engine = create_engine(DATABASE_URL, **engine_kwargs)

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
