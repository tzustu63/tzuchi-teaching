# 快速部署到 DigitalOcean App Platform

## 🚀 部署步驟

### 步驟 1: 推送配置到 GitHub

首先，確保所有配置檔案都已推送到 GitHub：

```bash
# 添加部署配置檔案
git add app.yaml DIGITALOCEAN_DEPLOYMENT.md deploy-digitalocean.sh

# 提交更改
git commit -m "feat: 添加 DigitalOcean App Platform 部署配置"

# 推送到 GitHub
git push origin V1
```

### 步驟 2: 登入 DigitalOcean

1. 前往 https://cloud.digitalocean.com/
2. 登入您的帳戶（或註冊新帳戶）
3. 確保帳戶有足夠餘額（建議至少 $12）

### 步驟 3: 創建新應用

1. 在 DigitalOcean 控制台，點擊左側選單的 **Apps**
2. 點擊 **Create App** 按鈕
3. 選擇 **GitHub** 作為來源
4. 如果尚未授權，點擊 **Authorize DigitalOcean** 並授權訪問您的 GitHub 帳戶
5. 選擇倉庫：`tzustu63/tzuchi-teaching`
6. 選擇分支：`V1`

### 步驟 4: 自動偵測配置

DigitalOcean 會自動偵測專案結構：

1. **自動偵測到 `app.yaml`**：
   - DigitalOcean 會自動讀取 `app.yaml` 配置
   - 您會看到前端和後端服務的配置

2. **確認配置**：
   - **Frontend**: Static Site（從 `/frontend` 目錄）
   - **Backend**: Web Service（使用 `backend/Dockerfile`）
   - 路由配置：前端 `/`，後端 `/api`

### 步驟 5: 設定環境變數

在 **Environment Variables** 區段，添加以下變數：

#### 必需變數（設定為 Encrypted）：
```
ENVIRONMENT=production
DEBUG=false
PORT=8000
```

#### API Keys（根據您使用的服務，設定為 Encrypted）：
```
OPENAI_API_KEY=<您的 OpenAI API Key>
CLAUDE_API_KEY=<您的 Claude API Key>
GAMMA_API_KEY=<您的 Gamma API Key>
```

#### 資料庫（如果使用 PostgreSQL）：
```
DATABASE_URL=<PostgreSQL 連接字串>
```

**重要**：
- 點擊每個變數右側的 **Encrypt** 選項以加密敏感資訊
- `DATABASE_URL` 會在添加資料庫資源時自動設定

### 步驟 6: 添加資料庫（可選）

如果需要 PostgreSQL 資料庫：

1. 在 **Resources** 區段，點擊 **Add Resource**
2. 選擇 **Database**
3. 選擇 **PostgreSQL**
4. 選擇版本（建議 15 或 16）
5. 選擇方案：
   - **Dev Database**: $15/月（適合開發/測試）
   - **Production**: $60+/月（適合生產環境）
6. DigitalOcean 會自動創建資料庫並設定 `DATABASE_URL` 環境變數

### 步驟 7: 檢查配置並部署

1. 點擊 **Review** 檢查所有配置
2. 確認：
   - ✅ 前端和後端服務配置正確
   - ✅ 環境變數已設定
   - ✅ 路由配置正確
   - ✅ 健康檢查端點已設定（`/health`）
3. 點擊 **Create Resources** 開始部署
4. 等待部署完成（通常 5-10 分鐘）

### 步驟 8: 獲取應用 URL

部署完成後：

1. 前往 **App** 頁面
2. 您會看到：
   - **Live App URL**: `https://your-app-name-xxx.ondigitalocean.app`
   - 前端可通過此 URL 訪問
   - 後端 API 位於 `/api` 路由下

### 步驟 9: 測試應用

1. **測試前端**：
   - 訪問 `https://your-app-name-xxx.ondigitalocean.app`
   - 確認頁面正常載入

2. **測試後端**：
   - 訪問 `https://your-app-name-xxx.ondigitalocean.app/api/health`
   - 應該返回 `{"status": "healthy"}`

3. **測試 API 文檔**：
   - 訪問 `https://your-app-name-xxx.ondigitalocean.app/api/docs`
   - 確認 API 文檔正常顯示

## 🔧 後續配置

### 設定自訂域名（可選）

1. 在 App Platform 中點擊您的應用
2. 前往 **Settings** → **Domains**
3. 點擊 **Add Domain**
4. 輸入您的域名（例如：`teaching.yourdomain.com`）
5. 按照指示更新 DNS 記錄：
   - 添加 CNAME 記錄指向 DigitalOcean 提供的域名

### 啟用自動部署

確保 `app.yaml` 中的 `deploy_on_push: true` 已設定：
- ✅ 每次推送到 `V1` 分支時會自動重新部署

### 監控和日誌

1. **查看日誌**：
   - 在 App Platform 中點擊您的應用
   - 前往 **Runtime Logs** 查看即時日誌

2. **監控**：
   - DigitalOcean 提供內建的應用監控
   - 可以查看 CPU、記憶體、請求數等指標

## ❌ 故障排除

### 部署失敗

**檢查**：
1. 查看部署日誌中的錯誤訊息
2. 確認 Dockerfile 路徑正確（`backend/Dockerfile`）
3. 檢查 `requirements.txt` 是否完整
4. 確認環境變數格式正確

### API 無法連接

**檢查**：
1. 確認後端服務正在運行（檢查 Runtime Logs）
2. 訪問 `/health` 端點確認服務正常
3. 檢查環境變數是否正確設定
4. 確認前端 API URL 配置正確

### 資料庫連接失敗

**檢查**：
1. 確認 `DATABASE_URL` 環境變數已設定
2. 檢查資料庫防火牆規則
3. 確認資料庫資源已創建並運行

## 📊 費用監控

- 在 DigitalOcean 控制台的 **Billing** 區段可以查看費用
- 設定預算提醒以避免超支

## 🎉 完成！

部署完成後，您的應用就可以在 DigitalOcean 上運行了！

如果需要協助，請參考：
- [DigitalOcean App Platform 文檔](https://docs.digitalocean.com/products/app-platform/)
- [完整部署指南](./DIGITALOCEAN_DEPLOYMENT.md)
