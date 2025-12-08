#!/bin/bash

# 課程計劃生成器 - Lightsail 部署腳本
# 用途：將應用部署到 AWS Lightsail 伺服器，完全隔離於現有應用

set -e  # 遇到錯誤立即停止

# 顏色輸出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 配置變數
SERVER_IP="18.181.71.46"
SERVER_USER="ubuntu"
SSH_KEY="/Users/kuoyuming/Desktop/程式開發/new teaching拷貝/LightsailDefaultKey-ap-northeast-1 (1).pem"
APP_NAME="course-planner"
REMOTE_DIR="/home/ubuntu/${APP_NAME}"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}課程計劃生成器 - Lightsail 部署${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# 檢查 SSH Key 是否存在
if [ ! -f "$SSH_KEY" ]; then
    echo -e "${RED}錯誤：找不到 SSH Key${NC}"
    echo "路徑：$SSH_KEY"
    exit 1
fi

# 設定 SSH Key 權限
chmod 400 "$SSH_KEY"

# 檢查 .env.production 是否存在
if [ ! -f ".env.production" ]; then
    echo -e "${YELLOW}警告：找不到 .env.production 檔案${NC}"
    echo "請先複製 env.production.example 並填入實際值："
    echo "  cp env.production.example .env.production"
    echo "  nano .env.production"
    read -p "是否繼續部署？(y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo -e "${GREEN}步驟 1：連接到伺服器並創建目錄${NC}"
ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -i "$SSH_KEY" "${SERVER_USER}@${SERVER_IP}" << 'ENDSSH'
    # 創建應用目錄
    mkdir -p /home/ubuntu/course-planner
    echo "✅ 目錄已創建"
ENDSSH

echo -e "${GREEN}步驟 2：上傳檔案到伺服器${NC}"
# 使用 rsync 上傳檔案（排除不需要的檔案）
# 使用絕對路徑避免中文路徑問題
CURRENT_DIR=$(pwd)
rsync -avz --progress \
    -e "ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -i \"$SSH_KEY\"" \
    --exclude 'venv' \
    --exclude '__pycache__' \
    --exclude '*.pyc' \
    --exclude '.git' \
    --exclude '*.db' \
    --exclude 'uploads/*' \
    --exclude '.env' \
    --exclude '.env.local' \
    --exclude 'node_modules' \
    --exclude '.DS_Store' \
    "${CURRENT_DIR}/" "${SERVER_USER}@${SERVER_IP}:${REMOTE_DIR}/"

echo -e "${GREEN}步驟 3：上傳環境變數檔案${NC}"
CURRENT_DIR=$(pwd)
scp -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -i "$SSH_KEY" "${CURRENT_DIR}/.env.production" "${SERVER_USER}@${SERVER_IP}:${REMOTE_DIR}/.env.production"

echo -e "${GREEN}步驟 4：在伺服器上執行部署${NC}"
ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -i "$SSH_KEY" "${SERVER_USER}@${SERVER_IP}" << ENDSSH
    cd ${REMOTE_DIR}
    
    echo "📦 檢查 Docker 和 Docker Compose..."
    if ! command -v docker &> /dev/null; then
        echo "❌ Docker 未安裝，請先安裝 Docker"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        echo "❌ Docker Compose 未安裝，請先安裝 Docker Compose"
        exit 1
    fi
    
    echo "✅ Docker 環境檢查通過"
    
    echo "🛑 停止現有容器（如果存在）..."
    docker-compose -f docker-compose.prod.yml down || true
    docker compose -f docker-compose.prod.yml down || true
    
    echo "🔨 構建並啟動容器..."
    # 嘗試使用 docker compose（新版本）或 docker-compose（舊版本）
    if docker compose version &> /dev/null; then
        docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build
    else
        docker-compose -f docker-compose.prod.yml --env-file .env.production up -d --build
    fi
    
    echo "⏳ 等待服務啟動..."
    sleep 10
    
    echo "📊 檢查容器狀態..."
    docker ps | grep course-planner || docker ps
    
    echo "✅ 部署完成！"
    echo ""
    echo "🌐 訪問地址："
    echo "   前端：http://${SERVER_IP}:3001"
    echo "   後端 API：http://${SERVER_IP}:5002"
    echo "   API 文檔：http://${SERVER_IP}:5002/docs"
    echo ""
    echo "📝 查看日誌："
    echo "   docker compose -f docker-compose.prod.yml logs -f"
ENDSSH

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}部署完成！${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "🌐 訪問地址："
echo "   前端：http://${SERVER_IP}:3001"
echo "   後端 API：http://${SERVER_IP}:5002"
echo "   API 文檔：http://${SERVER_IP}:5002/docs"
echo ""
echo "📝 查看日誌："
echo "   ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -i $SSH_KEY ${SERVER_USER}@${SERVER_IP}"
echo "   cd ${REMOTE_DIR}"
echo "   docker compose -f docker-compose.prod.yml logs -f"

