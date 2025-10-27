"""
課程計劃生成器 - FastAPI 主應用
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
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

@app.get("/")
async def root():
    """根目錄健康檢查"""
    return {"message": "課程計劃生成器 API", "status": "running"}


@app.get("/health")
async def health():
    """健康檢查端點"""
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
