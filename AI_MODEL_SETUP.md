# AI 模型簡化設定說明

## ✅ 已完成配置

### 🔑 API Keys 已預設

1. **OpenAI (GPT-4)**

   - API Key 已配置在 `backend/app/config.py`
   - 預設使用 GPT-4 模型

2. **Claude (Opus 4.1)**
   - API Key 已配置在 `backend/app/config.py`
   - 預設使用 Claude Opus 4.1 模型

## 🎯 使用方法

### 簡化流程

1. **選擇 AI 模型**（OpenAI 或 Claude）
2. **點擊「✅ 開始使用」**
3. **開始創建課程計劃**

### 不需要再做什麼

- ❌ 不需要輸入 API Key
- ❌ 不需要設定環境變數
- ❌ 不需要修改程式碼
- ✅ 只需要選擇 AI 模型即可

## 📝 技術細節

### 後端配置

- OpenAI API Key 已設定在 `config.py`
- Claude API Key 已設定在 `config.py`
- 後端會自動根據選擇使用對應的 API Key

### 前端流程

1. 用戶選擇 AI 模型
2. 前端儲存選擇到 localStorage
3. 發送請求時帶上模型選擇
4. 後端使用預設的 API Key 調用對應服務

## 🌐 訪問網址

- **前端應用**: http://localhost:3000
- **後端 API**: http://localhost:8000
- **API 文檔**: http://localhost:8000/docs

## ✨ 功能特色

- ✅ 極簡操作：只需選擇模型
- ✅ 自動配置：API Key 已預設
- ✅ 無縫切換：可隨時切換 AI 模型
- ✅ 側邊欄導航：美觀的步驟指示器
- ✅ 實時更新：當前步驟高亮顯示

## 🎨 界面特點

- 現代化的側邊欄設計
- 紫色漸變的設置卡片
- 平滑的動畫過渡效果
- 清晰的步驟指示器
- 響應式設計

現在您可以輕鬆選擇 AI 模型並開始創建課程計劃！
