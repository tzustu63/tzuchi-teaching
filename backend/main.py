"""
課程計劃生成器 - FastAPI 主應用
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from pathlib import Path
import os

from app.database import init_db
from app.api import routes

load_dotenv()

app = FastAPI(
    title="課程計劃生成器 API",
    description="AI 驅動的課程計劃生成系統",
    version="1.0.0"
)

# CORS 設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 開發環境，生產環境需設為特定域名
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 包含路由
app.include_router(routes.router)

@app.on_event("startup")
async def startup_event():
    """應用程式啟動時初始化資料庫"""
    init_db()

# 添加靜態文件服務（必須在其他路由之後）
frontend_path = Path(__file__).parent.parent / "frontend"
if frontend_path.exists():
    app.mount("/", StaticFiles(directory=str(frontend_path), html=True), name="static")


@app.get("/health")
async def health():
    """健康檢查端點"""
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
