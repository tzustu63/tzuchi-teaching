# Claude API 整合使用說明

## 📋 功能概述

現在您可以在首頁選擇使用 OpenAI 或 Claude AI 來生成課程計劃。

## 🚀 使用步驟

### 1. 選擇 AI 模型

在首頁的「AI 模型選擇和 API Key 設定」區域：

- 選擇 **OpenAI (GPT-4)** 或 **Claude (Opus 4.1)**
- 輸入對應的 API Key

### 2. Claude API Key

請在環境變數或 `.env` 檔案中設定：

```
CLAUDE_API_KEY=your_api_key_here
```

或者從前端輸入您的 Claude API Key。

### 3. 開始使用

1. 選擇 AI 模型
2. 輸入 API Key
3. 點擊「儲存」
4. 開始創建您的課程計劃

## 🔧 技術細節

### 後端變更

1. **新增 Claude 服務** (`backend/app/services/claude_service.py`)

   - 使用 Claude Opus 4.1 模型
   - 與 OpenAI 服務相同的接口

2. **更新配置** (`backend/app/config.py`)

   - 新增 `claude_api_key` 配置

3. **更新路由** (`backend/app/api/routes.py`)
   - 支持選擇 AI 模型
   - 根據選擇使用對應的服務

### 前端變更

1. **新增模型選擇器** (`frontend/index.html`)

   - 下拉選單選擇 AI 模型

2. **更新 JavaScript** (`frontend/app.js`)
   - 支持模型選擇
   - 儲存和讀取選擇的模型

### 依賴項

已添加 `anthropic` Python 套件到 `requirements.txt`

## 📝 API 使用

### 生成教學理念

```javascript
POST /courses/generate-rationale
{
  "title": "課程標題",
  "grade": "一年級",
  "duration": 40,
  "student_count": 30,
  "ai_model": "claude"  // 或 "openai"
}
```

## 🔑 API Key 管理

- OpenAI API Key: 以 `sk-` 開頭
- Claude API Key: 由 Anthropic 提供

API Key 會儲存在瀏覽器的 localStorage 中：

- `ai_model`: 選擇的模型 (openai/claude)
- `openai_api_key`: OpenAI API Key
- `claude_api_key`: Claude API Key

## ⚠️ 注意事項

1. Claude Opus 4.1 模型使用成本較高，請謹慎使用
2. 確保 API Key 的安全性
3. 更換模型時需要重新輸入對應的 API Key

## 🎯 功能特色

- ✅ 無縫切換 AI 模型
- ✅ 自動儲存用戶選擇
- ✅ 統一的用戶界面
- ✅ 支持所有生成步驟（教學理念、學習目標、教學策略、教學流程等）
