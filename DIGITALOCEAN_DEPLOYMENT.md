# DigitalOcean 部署指南（Dockerfile 版本）

本指南說明如何使用專案根目錄的 `Dockerfile`，將課程計劃生成器部署到 DigitalOcean App Platform。

## 1. 前置作業
- GitHub 倉庫：`tzustu63/tzuchi-teaching`
- 主要分支：`V1`
- 環境變數（依需求）：`OPENAI_API_KEY`、`CLAUDE_API_KEY`、`GAMMA_API_KEY`、`DATABASE_URL`

## 2. 推送最新程式碼
```bash
git add Dockerfile .dockerignore DIGITALOCEAN_DEPLOYMENT.md Procfile.railway
# 依實際修改補上其他檔案

git commit -m "chore: 將 DigitalOcean 部署改為 Dockerfile"

git push origin V1
```

## 3. DigitalOcean App Platform 設定
1. 登入 https://cloud.digitalocean.com/apps
2. 建立（或編輯）應用，選擇 GitHub 倉庫 `tzustu63/tzuchi-teaching` / `V1`
3. 在 Components 中設定 **Web Service**：
   - **Build strategy**: `Dockerfile`
   - **Source directory**: `/`
   - **Dockerfile path**: `Dockerfile`
   - **Run command**: 無需填寫（Dockerfile 已設定）
   - **HTTP port**: `8000`
4. 如需前端靜態網站，可另外建立 Static Site 指向 `/frontend`（可選）
5. **設置環境變數**（重要！）：
   - 進入 **Settings** → **App-Level Environment Variables**
   - 點擊 **Edit** 新增以下環境變數：
     - `OPENAI_API_KEY` = 您的 OpenAI API 金鑰（類型：SECRET）
     - `CLAUDE_API_KEY` = 您的 Claude API 金鑰（類型：SECRET）
     - `GAMMA_API_KEY` = 您的 Gamma API 金鑰（類型：SECRET）
   - 📖 **詳細步驟請參考**：[環境變數設置指南](./DIGITALOCEAN_ENV_SETUP.md)
6. 儲存後部署

## 4. 驗證部署
- 等待部署完成，檢查 Logs 中是否出現 `python backend/main.py` 的啟動訊息
- 確認健康檢查端點 `https://<your-app-domain>/health` 回傳 `{"status": "healthy"}`
- 前端首頁可在 `https://<your-app-domain>/` 造訪

## 5. 常見問題
- **仍然使用 Buildpack？** 請在 Components → Web Service → Build strategy 中再次確認已選擇 `Dockerfile`
- **Port 錯誤？** 確保環境變數 `PORT` 未被手動覆寫，或在 App Platform 中維持預設設定
- **缺少靜態檔？** 確認 `frontend/` 目錄存在並已推送到 GitHub
