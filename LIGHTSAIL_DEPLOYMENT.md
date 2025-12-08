# Lightsail 部署指南

## 📋 概述

本指南說明如何將課程計劃生成器部署到 AWS Lightsail 伺服器，確保與現有應用完全隔離。

## 🏗️ 架構設計

### 端口分配（避免與應用1衝突）

| 服務 | 應用 1 (ogastudent) | 應用 2 (course-planner) | 說明 |
|------|---------------------|------------------------|------|
| 前端 | 3000 | **3001** | 用戶訪問端口 |
| 後端 API | 5001 | **5002** | API 服務端口 |
| PostgreSQL | 5432 | **5433** | 資料庫端口（完全獨立） |

### 隔離策略

1. **網路隔離**：使用不同的 Docker 網路（`course-planner-network`）
2. **容器隔離**：不同的容器名稱前綴（`course-planner-*`）
3. **資料隔離**：獨立的 Volume（`course_planner_*`）
4. **資料庫隔離**：獨立的 PostgreSQL 實例和資料庫
5. **端口隔離**：不同的主機端口映射

### 目錄結構

```
/home/ubuntu/
├── ogastudent/                    # 應用 1（現有）
│   ├── docker-compose.prod.yml
│   └── ...
│
└── course-planner/                # 應用 2（新建）
    ├── docker-compose.prod.yml
    ├── backend/
    ├── frontend/
    └── .env.production
```

## 🚀 部署步驟

### 1. 準備環境變數檔案

複製範例檔案並填入實際值：

```bash
cp env.production.example .env.production
nano .env.production
```

**必須設定的項目：**

- `DB_PASSWORD`：資料庫密碼（至少16字元）
- `OPENAI_API_KEY`：OpenAI API 金鑰
- `GAMMA_API_KEY`：Gamma API 金鑰
- `MASTER_ENCRYPTION_KEY`：加密主金鑰（32字元隨機字串）

**生成加密主金鑰：**

```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

### 2. 執行部署腳本

```bash
./deploy.sh
```

部署腳本會自動：
1. 檢查 SSH Key 和環境變數檔案
2. 連接到伺服器並創建目錄
3. 上傳所有必要檔案
4. 構建並啟動 Docker 容器
5. 檢查服務狀態

### 3. 手動部署（可選）

如果自動部署腳本無法使用，可以手動執行：

#### 3.1 連接到伺服器

```bash
ssh -i LightsailDefaultKey-ap-northeast-1.pem ubuntu@18.179.120.246
```

#### 3.2 創建應用目錄

```bash
mkdir -p /home/ubuntu/course-planner
cd /home/ubuntu/course-planner
```

#### 3.3 上傳檔案

在本地執行：

```bash
# 上傳所有檔案（排除不需要的）
rsync -avz --progress \
    -e "ssh -i LightsailDefaultKey-ap-northeast-1.pem" \
    --exclude 'venv' \
    --exclude '__pycache__' \
    --exclude '*.pyc' \
    --exclude '.git' \
    --exclude '*.db' \
    --exclude 'uploads/*' \
    ./ ubuntu@18.179.120.246:/home/ubuntu/course-planner/
```

#### 3.4 上傳環境變數檔案

```bash
scp -i LightsailDefaultKey-ap-northeast-1.pem \
    .env.production \
    ubuntu@18.179.120.246:/home/ubuntu/course-planner/.env.production
```

#### 3.5 在伺服器上啟動服務

```bash
# 連接到伺服器後
cd /home/ubuntu/course-planner

# 停止現有容器（如果存在）
docker compose -f docker-compose.prod.yml down || true

# 構建並啟動
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build

# 查看日誌
docker compose -f docker-compose.prod.yml logs -f
```

## 🔍 驗證部署

### 檢查容器狀態

```bash
ssh -i LightsailDefaultKey-ap-northeast-1.pem ubuntu@18.179.120.246
docker ps | grep course-planner
```

應該看到三個容器：
- `course-planner-postgres`
- `course-planner-backend`
- `course-planner-frontend`

### 檢查服務健康狀態

```bash
# 後端健康檢查
curl http://18.179.120.246:5002/health

# 前端
curl http://18.179.120.246:3001/
```

### 訪問應用

- **前端**：http://18.179.120.246:3001
- **後端 API**：http://18.179.120.246:5002
- **API 文檔**：http://18.179.120.246:5002/docs

## 📊 常用命令

### 查看日誌

```bash
# 所有服務
docker compose -f docker-compose.prod.yml logs -f

# 特定服務
docker compose -f docker-compose.prod.yml logs -f backend
docker compose -f docker-compose.prod.yml logs -f frontend
docker compose -f docker-compose.prod.yml logs -f postgres
```

### 重啟服務

```bash
docker compose -f docker-compose.prod.yml restart
```

### 停止服務

```bash
docker compose -f docker-compose.prod.yml down
```

### 更新並重新部署

```bash
# 1. 在本地修改程式碼
# 2. 執行部署腳本
./deploy.sh

# 或手動上傳並重啟
docker compose -f docker-compose.prod.yml up -d --build
```

## 🔒 安全注意事項

1. **環境變數**：`.env.production` 包含敏感資訊，不要提交到 Git
2. **SSH Key**：確保 SSH Key 權限為 400
3. **資料庫密碼**：使用強密碼（至少16字元）
4. **加密金鑰**：`MASTER_ENCRYPTION_KEY` 必須是隨機生成的32字元字串
5. **CORS**：生產環境建議將 `CORS_ORIGINS` 設為特定域名

## 🐛 故障排除

### 問題：容器無法啟動

```bash
# 查看詳細錯誤
docker compose -f docker-compose.prod.yml logs

# 檢查環境變數
docker compose -f docker-compose.prod.yml config
```

### 問題：資料庫連接失敗

```bash
# 檢查 PostgreSQL 容器狀態
docker ps | grep postgres

# 檢查資料庫日誌
docker compose -f docker-compose.prod.yml logs postgres

# 測試連接
docker exec -it course-planner-postgres psql -U postgres -d course_planner_db
```

### 問題：端口被佔用

```bash
# 檢查端口使用情況
sudo netstat -tulpn | grep -E '3001|5002|5433'

# 或使用 ss
sudo ss -tulpn | grep -E '3001|5002|5433'
```

### 問題：前端無法連接到後端

1. 檢查 `API_URL` 環境變數是否正確
2. 檢查後端容器是否正常運行
3. 檢查 Nginx 配置中的 `proxy_pass` 設定

## 📝 維護

### 備份資料庫

```bash
docker exec course-planner-postgres pg_dump -U postgres course_planner_db > backup_$(date +%Y%m%d).sql
```

### 還原資料庫

```bash
cat backup_20240101.sql | docker exec -i course-planner-postgres psql -U postgres course_planner_db
```

### 清理未使用的資源

```bash
# 清理未使用的映像
docker image prune -a

# 清理未使用的 Volume
docker volume prune
```

## 🔄 更新流程

1. 在本地開發並測試
2. 更新 `.env.production`（如有需要）
3. 執行 `./deploy.sh` 或手動部署
4. 驗證服務正常運行
5. 監控日誌確保沒有錯誤

## 📞 支援

如有問題，請檢查：
1. 伺服器日誌：`docker compose logs`
2. 容器狀態：`docker ps`
3. 網路連接：`curl http://18.179.120.246:5002/health`
4. 環境變數：確認 `.env.production` 設定正確

