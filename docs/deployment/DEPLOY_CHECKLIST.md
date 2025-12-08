# Lightsail 部署檢查清單

## ✅ 部署前準備

### 1. 環境變數設定

- [ ] 複製環境變數範例檔案
  ```bash
  cp env.production.example .env.production
  ```

- [ ] 填入必要的環境變數：
  - [ ] `DB_PASSWORD` - 資料庫密碼（至少16字元）
  - [ ] `OPENAI_API_KEY` - OpenAI API 金鑰
  - [ ] `GAMMA_API_KEY` - Gamma API 金鑰
  - [ ] `MASTER_ENCRYPTION_KEY` - 加密主金鑰（32字元）

- [ ] 生成加密主金鑰
  ```bash
  python -c "import secrets; print(secrets.token_urlsafe(32))"
  ```

### 2. SSH Key 檢查

- [ ] 確認 SSH Key 檔案存在
  ```bash
  ls -l LightsailDefaultKey-ap-northeast-1.pem
  ```

- [ ] 設定 SSH Key 權限
  ```bash
  chmod 400 LightsailDefaultKey-ap-northeast-1.pem
  ```

### 3. 本地測試

- [ ] 確認 Docker 和 Docker Compose 已安裝
- [ ] 確認所有檔案都已提交到 Git（可選）

## 🚀 執行部署

### 方式一：使用部署腳本（推薦）

```bash
./deploy.sh
```

### 方式二：手動部署

參考 `LIGHTSAIL_DEPLOYMENT.md` 中的手動部署步驟

## ✅ 部署後驗證

### 1. 檢查容器狀態

```bash
ssh -i LightsailDefaultKey-ap-northeast-1.pem ubuntu@18.179.120.246
docker ps | grep course-planner
```

應該看到三個容器：
- `course-planner-postgres`
- `course-planner-backend`
- `course-planner-frontend`

### 2. 檢查服務健康狀態

```bash
# 後端健康檢查
curl http://18.179.120.246:5002/health

# 前端
curl http://18.179.120.246:3001/
```

### 3. 訪問應用

- [ ] 前端：http://18.179.120.246:3001
- [ ] 後端 API：http://18.179.120.246:5002
- [ ] API 文檔：http://18.179.120.246:5002/docs

### 4. 功能測試

- [ ] 前端頁面正常載入
- [ ] 可以選擇 AI 模型
- [ ] 可以填寫基本資訊
- [ ] 可以生成教學理念
- [ ] API 文檔可以訪問

## 🔍 常見問題檢查

### 問題：容器無法啟動

```bash
# 查看日誌
docker compose -f docker-compose.prod.yml logs

# 檢查環境變數
docker compose -f docker-compose.prod.yml config
```

### 問題：端口被佔用

```bash
# 檢查端口
sudo netstat -tulpn | grep -E '3001|5002|5433'
```

### 問題：資料庫連接失敗

```bash
# 檢查 PostgreSQL 容器
docker ps | grep postgres

# 查看資料庫日誌
docker compose -f docker-compose.prod.yml logs postgres
```

## 📝 部署完成後

- [ ] 記錄部署時間和版本
- [ ] 測試所有主要功能
- [ ] 確認日誌沒有錯誤
- [ ] 備份環境變數檔案（安全儲存）

## 🔄 更新部署

當需要更新時：

1. 在本地修改程式碼
2. 執行 `./deploy.sh`
3. 驗證服務正常運行
4. 檢查日誌確認沒有錯誤

---

**注意**：確保 `.env.production` 檔案包含所有必要的環境變數，特別是 API Keys 和加密金鑰！

