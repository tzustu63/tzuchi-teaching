# 重新部署步驟指南

## ✅ 第一步：程式碼已推送

程式碼已經成功推送到 GitHub：
- ✅ 所有更改已提交
- ✅ 已推送到 `V1` 分支
- ✅ GitHub 倉庫：`tzustu63/tzuchi-teaching`

## 🚀 第二步：在 DigitalOcean 觸發重新部署

### 方法一：自動部署（如果已啟用自動部署）

如果您的 DigitalOcean App 已啟用自動部署（Auto Deploy），它會自動偵測到 GitHub 推送並開始部署。

1. 登入 https://cloud.digitalocean.com/apps
2. 選擇您的應用程式：`king-prawn-app-xhssu`
3. 點擊 **Deployments**（部署）標籤
4. 您應該會看到新的部署正在進行中
5. 等待部署完成（通常需要 3-5 分鐘）

### 方法二：手動觸發重新部署

如果自動部署未啟用，或您想立即觸發部署：

1. **登入 DigitalOcean**
   - 前往 https://cloud.digitalocean.com/apps
   - 登入您的帳戶

2. **選擇您的應用程式**
   - 點擊應用程式：`king-prawn-app-xhssu`

3. **觸發重新部署**
   - 點擊左側選單的 **Deployments**（部署）
   - 點擊右上角的 **Redeploy**（重新部署）按鈕
   - 或點擊 **Create Deployment**（建立部署）
   - 選擇分支：`V1`
   - 點擊 **Deploy**（部署）

4. **監控部署進度**
   - 等待部署狀態從 "Building" → "Deploying" → "Live"
   - 通常需要 3-5 分鐘

## 🔍 第三步：驗證部署

### 1. 檢查部署狀態

在 DigitalOcean 控制台的 **Deployments** 頁面：
- ✅ 狀態顯示為 "Live" 或 "Active"
- ✅ 沒有錯誤訊息
- ✅ 部署時間是剛剛的時間

### 2. 檢查應用程式日誌

1. 點擊 **Runtime Logs**（運行時日誌）
2. 查看是否有任何錯誤訊息
3. 確認應用程式已正常啟動

### 3. 測試健康檢查端點

訪問：
```
https://king-prawn-app-xhssu.ondigitalocean.app/health
```

應該返回：
```json
{"status": "healthy"}
```

### 4. 測試診斷端點（新增功能）

訪問：
```
https://king-prawn-app-xhssu.ondigitalocean.app/debug/env-check
```

這會顯示：
- ✅ 環境變數是否正確讀取
- ✅ 每個 API 金鑰的狀態
- ✅ 具體的建議和修復步驟

### 5. 測試應用程式功能

在應用程式中：
1. 嘗試生成教學理念
2. 確認不再出現 "未設定 OpenAI API Key" 錯誤
3. 測試所有 AI 模型功能

## 📋 部署檢查清單

在部署前，請確認：

- [x] 程式碼已推送到 GitHub
- [ ] 環境變數已在 DigitalOcean 中設置：
  - [ ] `OPENAI_API_KEY`
  - [ ] `CLAUDE_API_KEY`
  - [ ] `GAMMA_API_KEY`
- [ ] 環境變數設置在 **App-Level**（應用程式層級）
- [ ] 已在 DigitalOcean 觸發重新部署
- [ ] 等待部署完成（狀態為 "Live"）
- [ ] 測試健康檢查端點正常
- [ ] 測試診斷端點顯示環境變數已正確讀取
- [ ] 測試應用程式功能正常

## ⚠️ 常見問題

### 部署失敗？

1. **檢查 Build Logs**
   - 在 **Deployments** 頁面，點擊失敗的部署
   - 查看 **Build Logs** 找出錯誤原因

2. **常見錯誤**
   - Dockerfile 錯誤：檢查 Dockerfile 語法
   - 依賴安裝失敗：檢查 requirements.txt
   - 環境變數未設置：確認已在 DigitalOcean 中設置

3. **重新部署**
   - 修復問題後，再次觸發部署

### 環境變數未讀取？

1. **訪問診斷端點**
   ```
   https://king-prawn-app-xhssu.ondigitalocean.app/debug/env-check
   ```
   檢查環境變數狀態

2. **確認設置**
   - 環境變數名稱必須完全大寫：`OPENAI_API_KEY`
   - 設置在 **App-Level**，不是 Component-Level
   - 類型可以是 `SECRET` 或 `NORMAL`

3. **重新部署**
   - 設置環境變數後，必須重新部署才能生效

## 🎉 完成！

部署完成後，您的應用程式應該：
- ✅ 正確讀取環境變數
- ✅ 所有 AI 功能正常運作
- ✅ 診斷端點可正常使用

如果遇到任何問題，請參考：
- [環境變數設置指南](./DIGITALOCEAN_ENV_SETUP.md)
- [部署指南](./DIGITALOCEAN_DEPLOYMENT.md)

