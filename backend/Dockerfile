FROM python:3.13-slim

WORKDIR /app

# 安裝系統依賴
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# 複製依賴檔案
COPY requirements.txt .

# 安裝 Python 依賴
RUN pip install --no-cache-dir -r requirements.txt

# 複製後端代碼
COPY . .

# 暴露端口
EXPOSE 8000

# 啟動命令
CMD ["python", "main.py"]

