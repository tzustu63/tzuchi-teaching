# Gamma API Key 設定說明

## API Key 資訊

```
GAMMA_API_KEY=sk-gamma-GlUo8DS1fqjaDlakxQuk3NFIkwgKTRYdkAOZTTb0A8
```

## 設定方式

### 方式一：建立 .env 檔案（推薦）

在 `backend/` 目錄下建立 `.env` 檔案：

```bash
cd backend
touch .env
```

將以下內容加入 `.env` 檔案：

```env
# Gamma API Configuration
GAMMA_API_KEY=sk-gamma-GlUo8DS1fqjaDlakxQuk3NFIkwgKTRYdkAOZTTb0A8

# OpenAI API Key (optional)
# OPENAI_API_KEY=your-openai-key-here

# Claude API Key (optional)
# CLAUDE_API_KEY=your-claude-key-here
```

### 方式二：使用環境變數

在終端機中設定：

```bash
export GAMMA_API_KEY=sk-gamma-GlUo8DS1fqjaDlakxQuk3NFIkwgKTRYdkAOZTTb0A8
```

或在系統環境變數中設定（永久性）

## 驗證設定

### 檢查是否已載入

程式會按照以下順序讀取 API Key：

1. 設定檔中的 `settings.gamma_api_key`
2. 環境變數 `GAMMA_API_KEY`
3. 預設值（程式碼中）

### 測試連線

```bash
# 啟動後端
cd backend
python main.py

# 測試 API
curl -X POST http://localhost:8000/api/courses/generate-ppt \
  -H "Content-Type: application/json" \
  -d '{
    "title": "測試課程",
    "rationale": "這是測試"
  }'
```

## 重要提醒

⚠️ **安全注意事項**：

1. 不要將 `.env` 檔案提交到 Git
2. 已在 `.gitignore` 中排除 `.env` 檔案
3. 生產環境請使用安全的密鑰管理系統

## 目前設定狀態

✅ API Key 已提供：`sk-gamma-GlUo8DS1fqjaDlakxQuk3NFIkwgKTRYdkAOZTTb0A8`  
✅ 已更新程式碼以支援 Gamma API v0.2  
✅ 已建立相關文檔

## 下一步

1. 建立 `.env` 檔案並加入 API Key
2. 重新啟動後端服務
3. 測試 PPT 生成功能
