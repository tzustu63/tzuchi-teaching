# API Key 配置狀況說明

## 📋 當前配置狀況

### ✅ Claude API

- **後端已配置**：Claude API Key 可以從環境變數 `CLAUDE_API_KEY` 獲取
- **模型**: Claude Sonnet 4.5
- **狀態**: ✅ 需要設定環境變數或從 .env 檔案讀取

### ❌ OpenAI API

- **後端配置**：需要從環境變數 `OPENAI_API_KEY` 獲取
- **前端儲存**：API Key 儲存在瀏覽器的 localStorage 中
- **問題**：前端儲存的 API Key 目前沒有傳送到後端
- **狀態**: ⚠️ 需要改進

## 🔧 改進方案

### 選項 1：使用預設的 Claude API（推薦）

- ✅ 已完全配置
- ✅ 可以直接使用
- ✅ 無需額外設置

### 選項 2：手動設定環境變數

如果要使用 OpenAI，需要設定環境變數：

```bash
export OPENAI_API_KEY="your-openai-key"
```

### 選項 3：修改後端接受前端 API Key（需要開發）

目前後端不支持從前端接收 API Key，如果要實現，需要：

1. 修改 API 端點接收前端傳來的 API Key
2. 確保安全性

## 💡 建議

**目前最好的做法**：

1. 選擇 **Claude** 模型（已配置好）
2. 直接開始使用，無需再輸入 API Key

## 🎯 使用方式

### 使用 Claude（推薦）

1. 在首頁選擇 "Claude (Opus 4.1)"
2. 點擊「💾 儲存設定」（即使 API Key 是空的也可以，因為後端已有預設值）
3. 開始創建課程計劃

### 使用 OpenAI

1. 在首頁選擇 "OpenAI (GPT-4)"
2. 輸入您的 OpenAI API Key
3. 設定環境變數或修改後端程式碼
