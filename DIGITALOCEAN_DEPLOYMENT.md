# DigitalOcean App Platform 部署指南

本指南將協助您將課程計劃生成器部署到 DigitalOcean App Platform。

## 📋 前置要求

1. **DigitalOcean 帳戶**

   - 註冊帳戶：https://www.digitalocean.com/
   - 建議至少有 $12 的餘額（基本方案約 $5-12/月）

2. **GitHub 倉庫**

   - 確保程式碼已推送到 GitHub
   - 倉庫：`tzustu63/tzuchi-teaching`
   - 分支：`V1`

3. **API Keys 準備**
   - OpenAI API Key（如果使用）
   - Claude API Key（如果使用）
   - Gamma API Key（如果使用）

## 🚀 部署步驟

### 方式一：使用 App Platform Web 介面（推薦）

#### 1. 創建新應用

1. 登入 DigitalOcean 控制台
2. 點擊左側選單的 **Apps**
3. 點擊 **Create App**
4. 選擇 **GitHub** 作為來源
5. 授權 DigitalOcean 訪問您的 GitHub 帳戶（如果尚未授權）
6. 選擇倉庫：`tzustu63/tzuchi-teaching`
7. 選擇分支：`V1`

#### 2. 配置應用

DigitalOcean 會自動偵測專案結構。您需要：

**配置後端服務（Backend）**：

- **Name**: `backend`
- **Type**: Web Service
- **Build Command**: 留空（使用 Dockerfile）
- **Run Command**: `python main.py`
- **HTTP Port**: `8000`
- **HTTP Request Routes**: `/api/*`
- **Instance Size**: Basic ($5/月) 或 Professional ($12/月)

**配置前端服務（Frontend）**：

- **Name**: `frontend`
- **Type**: Static Site
- **Source Directory**: `/frontend`
- **Output Directory**: `/`
- **Index Document**: `index.html`
- **HTTP Request Routes**: `/*`

#### 3. 設定環境變數

在 **Environment Variables** 區段，添加以下變數：

**必需變數**：

```
DATABASE_URL=<您的 PostgreSQL 連接字串>
ENVIRONMENT=production
DEBUG=false
PORT=8000
```

**API Keys**（根據您使用的服務）：

```
OPENAI_API_KEY=<您的 OpenAI API Key>
CLAUDE_API_KEY=<您的 Claude API Key>
GAMMA_API_KEY=<您的 Gamma API Key>
```

**注意**：將敏感資訊標記為 **Encrypted**（加密）

#### 4. 配置資料庫（可選）

如果需要使用 PostgreSQL：

1. 在 **Resources** 區段，點擊 **Add Resource**
2. 選擇 **Database**
3. 選擇 **PostgreSQL**
4. 選擇版本（建議 15 或 16）
5. 選擇方案（Dev Database $15/月 或 Production $60+/月）
6. DigitalOcean 會自動創建並連接資料庫
7. `DATABASE_URL` 環境變數會自動設定

#### 5. 部署

1. 點擊 **Review** 檢查配置
2. 點擊 **Create Resources** 開始部署
3. 等待部署完成（通常 5-10 分鐘）

### 方式二：使用 DigitalOcean CLI（進階）

如果您已安裝 `doctl` CLI：

```bash
# 登入
doctl auth init

# 使用 app.yaml 部署
doctl apps create --spec app.yaml
```

### 方式三：使用 app.yaml 檔案（GitHub Integration）

1. 將 `app.yaml` 檔案放在專案根目錄
2. 推送到 GitHub
3. 在 DigitalOcean App Platform 創建應用時選擇此倉庫
4. DigitalOcean 會自動讀取 `app.yaml` 配置

## 📝 部署後配置

### 1. 獲取應用 URL

部署完成後，您會獲得：

- **前端 URL**: `https://your-app-name-xxx.ondigitalocean.app`
- **後端 API URL**: `https://your-app-name-xxx.ondigitalocean.app/api`

### 2. 更新前端 API URL（如果需要）

如果前端和後端不在同一域名，需要修改 `frontend/app.js`：

```javascript
function getApiBaseUrl() {
  if (
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
  ) {
    return "http://localhost:8000";
  }

  // 使用後端 URL
  return "https://your-backend-url.ondigitalocean.app";
}
```

### 3. 資料庫初始化

首次部署後，需要初始化資料庫：

```bash
# 通過 DigitalOcean 控制台的 Console 或 SSH
# 連接到後端容器
python -c "from app.database import init_db; init_db()"
```

或在後端啟動時自動初始化（已實作）。

### 4. 設定自訂域名（可選）

1. 在 App Platform 中點擊您的應用
2. 前往 **Settings** → **Domains**
3. 點擊 **Add Domain**
4. 輸入您的域名
5. 按照指示更新 DNS 記錄

## 🔍 故障排除

### 問題 1: 部署失敗

**檢查**：

- 確認 Dockerfile 路徑正確
- 檢查 `requirements.txt` 是否完整
- 查看部署日誌中的錯誤訊息

### 問題 2: API 無法連接

**檢查**：

- 確認環境變數已正確設定
- 檢查後端服務是否運行（Health Check）
- 確認路由配置正確（`/api/*`）

### 問題 3: 資料庫連接失敗

**檢查**：

- 確認 `DATABASE_URL` 格式正確
- 檢查資料庫是否已創建並運行
- 確認資料庫防火牆規則允許應用訪問

### 問題 4: CORS 錯誤

**檢查**：

- 確認後端 CORS 設定允許前端域名
- 檢查 `backend/main.py` 中的 CORS 配置

## 💰 費用估算

**基本配置**（最低費用）：

- App Platform (Basic): $5/月
- Database (Dev): $15/月（可選）
- **總計**: $5-20/月

**生產配置**（建議）：

- App Platform (Professional): $12/月
- Database (Production): $60+/月
- **總計**: $72+/月

## 📚 參考資源

- [DigitalOcean App Platform 文檔](https://docs.digitalocean.com/products/app-platform/)
- [App Platform Pricing](https://www.digitalocean.com/pricing/app-platform)
- [PostgreSQL Managed Database](https://www.digitalocean.com/products/managed-databases)

## ✅ 部署檢查清單

- [ ] GitHub 倉庫已準備好
- [ ] API Keys 已準備
- [ ] app.yaml 已創建（如果使用）
- [ ] Dockerfile 已驗證
- [ ] 環境變數已設定
- [ ] 資料庫已配置（如果需要）
- [ ] 域名已設定（如果需要）
- [ ] 部署成功並測試

## 🎉 完成！

部署完成後，您的應用應該可以在 DigitalOcean 上運行。如果遇到任何問題，請查看 DigitalOcean 的部署日誌或聯繫支援。
