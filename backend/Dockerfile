FROM python:3.13-slim

# 設定 UTF-8 編碼環境
ENV LANG=C.UTF-8
ENV LC_ALL=C.UTF-8
ENV PYTHONIOENCODING=utf-8
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# 安裝系統依賴（包含 locale）
RUN apt-get update && apt-get install -y \
    gcc \
    wget \
    locales \
    && sed -i '/en_US.UTF-8/s/^# //g' /etc/locale.gen \
    && locale-gen \
    && rm -rf /var/lib/apt/lists/*

# 複製依賴檔案
COPY requirements.txt .

# 安裝 Python 依賴
RUN pip install --no-cache-dir -r requirements.txt

# 複製必要的後端代碼
COPY main.py .
COPY app ./app/

# 創建必要的目錄
RUN mkdir -p /app/uploads /app/logs

# 暴露端口
EXPOSE 8000

# 啟動命令
CMD ["python", "main.py"]

