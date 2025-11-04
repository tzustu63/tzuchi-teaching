# syntax=docker/dockerfile:1

FROM python:3.13-slim AS base

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# 安裝系統依賴
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# 複製依賴檔案並安裝 Python 套件
COPY backend/requirements.txt ./backend/requirements.txt
RUN pip install --no-cache-dir -r backend/requirements.txt

# 複製後端與前端程式碼
COPY backend ./backend
COPY frontend ./frontend

# 預設環境變數
ENV PORT=8000

EXPOSE 8000

CMD ["python", "backend/main.py"]
