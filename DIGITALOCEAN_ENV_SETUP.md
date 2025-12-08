# DigitalOcean 環境變數設置指南

本指南說明如何在 DigitalOcean App Platform 中設置 OpenAI、Claude 和 Gamma 的 API 金鑰。

## 📋 需要的環境變數

您的應用程式需要以下環境變數：

- `OPENAI_API_KEY` - OpenAI API 金鑰
- `CLAUDE_API_KEY` - Claude (Anthropic) API 金鑰
- `GAMMA_API_KEY` - Gamma API 金鑰

## 🚀 設置步驟

### 方法一：透過 DigitalOcean 控制台（推薦）

1. **登入 DigitalOcean**

   - 前往 https://cloud.digitalocean.com/apps
   - 登入您的帳戶

2. **選擇您的應用程式**

   - 在應用程式列表中，點擊您要設置的應用程式

3. **進入設定頁面**

   - 點擊左側選單的 **Settings**（設定）
   - 向下滾動找到 **App-Level Environment Variables**（應用程式層級環境變數）

4. **新增環境變數**

   - 點擊 **Edit**（編輯）按鈕
   - 點擊 **Add Variable**（新增變數）
   - 依序新增以下三個環境變數：

   **變數 1：OPENAI_API_KEY**

   - **Key**: `OPENAI_API_KEY`
   - **Value**: 您的 OpenAI API 金鑰（例如：`sk-...`）
   - **Scope**: `App`（應用程式層級）
   - **Type**: `SECRET`（建議選擇此類型以保護金鑰）

   **變數 2：CLAUDE_API_KEY**

   - **Key**: `CLAUDE_API_KEY`
   - **Value**: 您的 Claude API 金鑰（例如：`sk-ant-...`）
   - **Scope**: `App`（應用程式層級）
   - **Type**: `SECRET`（建議選擇此類型以保護金鑰）

   **變數 3：GAMMA_API_KEY**

   - **Key**: `GAMMA_API_KEY`
   - **Value**: 您的 Gamma API 金鑰（例如：`sk-gamma-...`）
   - **Scope**: `App`（應用程式層級）
   - **Type**: `SECRET`（建議選擇此類型以保護金鑰）

5. **儲存設定**
   - 點擊 **Save**（儲存）
   - DigitalOcean 會自動觸發重新部署

### 方法二：透過 DigitalOcean CLI（進階）

如果您使用 DigitalOcean CLI (`doctl`)，可以使用以下命令：

```bash
# 設置環境變數
doctl apps update <APP_ID> --spec .do/app.yaml

# 或直接通過 API
doctl compute app create-variable <APP_ID> \
  --key OPENAI_API_KEY \
  --value "your-openai-key" \
  --type SECRET
```

## 📝 環境變數格式範例

```
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
CLAUDE_API_KEY=sk-ant-api03-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
GAMMA_API_KEY=sk-gamma-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## 🔍 驗證環境變數是否設置成功

### 方法一：使用診斷端點（推薦）⭐

我們已經添加了一個診斷端點來檢查環境變數是否正確讀取：

訪問診斷端點：

```
https://<your-app-domain>/debug/env-check
```

這個端點會顯示：

- 每個環境變數的讀取狀態（從 `os.getenv` 和 `settings` 兩種方式）
- 環境變數是否已設置
- 具體的建議和修復步驟

**範例回應**：

```json
{
  "status": "success",
  "environment_variables": {
    "OPENAI_API_KEY": {
      "from_os.getenv": {
        "exists": true,
        "length": 51,
        "preview": "sk-proj-...xxxx"
      },
      "from_settings": {
        "exists": true,
        "length": 51,
        "preview": "sk-proj-...xxxx"
      },
      "final_value": "✅ 已設置"
    },
    "CLAUDE_API_KEY": {
      "from_os.getenv": { "exists": false, "length": 0, "preview": null },
      "from_settings": { "exists": false, "length": 0, "preview": null },
      "final_value": "❌ 未設置"
    },
    "GAMMA_API_KEY": {
      "from_os.getenv": {
        "exists": true,
        "length": 45,
        "preview": "sk-gamma...xxxx"
      },
      "from_settings": {
        "exists": true,
        "length": 45,
        "preview": "sk-gamma...xxxx"
      },
      "final_value": "✅ 已設置"
    }
  },
  "recommendations": {
    "openai": "✅ 正常",
    "claude": "⚠️ 請在 DigitalOcean 設置 CLAUDE_API_KEY 環境變數",
    "gamma": "✅ 正常"
  }
}
```

### 方法二：檢查應用程式日誌

1. 在 DigitalOcean 控制台中，進入您的應用程式
2. 點擊 **Runtime Logs**（運行時日誌）
3. 查看應用程式啟動時的日誌
4. 如果看到連接 API 的錯誤訊息，可能是環境變數未正確設置

### 方法三：檢查應用程式健康狀態

訪問健康檢查端點：

```
https://<your-app-domain>/health
```

如果應用程式正常運行，應該會返回：

```json
{ "status": "healthy" }
```

### 方法四：測試 API 功能

在應用程式前端：

1. 嘗試使用 OpenAI 模型生成內容
2. 嘗試使用 Claude 模型生成內容
3. 嘗試使用 Gamma 功能

如果功能正常，表示環境變數已正確設置。

## ⚠️ 注意事項

### 安全性建議

1. **使用 SECRET 類型**

   - 在 DigitalOcean 中設置環境變數時，務必選擇 `SECRET` 類型
   - 這樣可以確保金鑰在日誌中不會被顯示

2. **不要提交到 Git**

   - 確認 `.env` 檔案已加入 `.gitignore`
   - 不要將 API 金鑰直接寫在程式碼中

3. **定期輪換金鑰**
   - 建議定期更新 API 金鑰以提高安全性

### 常見問題

**Q: 設置環境變數後，應用程式沒有重新部署？**
A: DigitalOcean 通常在儲存環境變數後會自動觸發重新部署。如果沒有，您可以手動觸發部署。

**Q: 如何確認環境變數是否生效？**
A: 檢查應用程式日誌，或直接在應用程式中測試相關功能。

**Q: 可以為不同的服務設定不同的環境變數嗎？**
A: 可以！在 DigitalOcean 中，您可以設定：

- **App-Level**：應用程式層級（所有服務共用）
- **Component-Level**：組件層級（僅特定服務使用）

**Q: 環境變數名稱大小寫有影響嗎？**
A: 根據您的 `config.py` 設定，環境變數名稱不區分大小寫（`case_sensitive = False`），但建議使用大寫字母以符合慣例。

**Q: 設置環境變數後仍然出現「未設定 OpenAI API Key」錯誤？**
A: 請按照以下步驟排查：

1. 訪問診斷端點：`https://<your-app-domain>/debug/env-check` 檢查環境變數是否正確讀取
2. 確認環境變數名稱完全正確：`OPENAI_API_KEY`、`CLAUDE_API_KEY`、`GAMMA_API_KEY`（全部大寫）
3. 確認環境變數的 Scope 設為 `App`（應用程式層級），而不是特定 Component
4. 確認環境變數的 Type 設為 `SECRET` 或 `NORMAL`
5. 在 DigitalOcean 控制台中手動觸發重新部署（Settings → Deployments → Redeploy）
6. 檢查 Runtime Logs 確認應用程式已重新啟動

## 🔄 更新環境變數

如果需要更新環境變數：

1. 進入 DigitalOcean 控制台
2. 選擇您的應用程式 → **Settings**
3. 找到要更新的環境變數
4. 點擊 **Edit**（編輯）
5. 更新 **Value**（值）
6. 點擊 **Save**（儲存）
7. 等待自動重新部署完成

## 📚 相關文件

- [DigitalOcean App Platform 環境變數文件](https://docs.digitalocean.com/products/app-platform/how-to/use-environment-variables/)
- [專案部署指南](./DIGITALOCEAN_DEPLOYMENT.md)
- [本地環境變數設置](./API_KEY_LOCAL_SETUP.md)

## 🎯 快速檢查清單

在完成設置後，請確認：

- [ ] `OPENAI_API_KEY` 已設置並標記為 `SECRET`
- [ ] `CLAUDE_API_KEY` 已設置並標記為 `SECRET`
- [ ] `GAMMA_API_KEY` 已設置並標記為 `SECRET`
- [ ] 應用程式已自動重新部署
- [ ] 健康檢查端點正常回應
- [ ] 所有 AI 模型功能正常運作

---

**完成！** 現在您的 DigitalOcean 應用程式應該可以正常使用所有 AI 服務了。🎉
