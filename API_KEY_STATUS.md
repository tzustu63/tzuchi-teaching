# API Key 配置狀況說明

## 📋 當前配置狀況

### ✅ OpenAI API

- **後端載入方式**：環境變數 `OPENAI_API_KEY` 或 `.env` 檔案
- **預設狀態**：若未設定會回報錯誤，請務必提供有效金鑰
- **使用範圍**：教學理念、學習目標、教學策略、教學流程、學習單

### ✅ Gamma API

- **後端載入方式**：環境變數 `GAMMA_API_KEY` 或 `.env` 檔案
- **使用範圍**：PPT 生成與狀態輪詢

## 🔧 建議設定方式

1. 在 `backend/.env` 中設定：

```env
OPENAI_API_KEY=your-openai-key
GAMMA_API_KEY=your-gamma-key
```

2. 或於部署環境直接匯出：

```bash
export OPENAI_API_KEY="your-openai-key"
export GAMMA_API_KEY="your-gamma-key"
```

## 💡 注意事項

- 前端不會儲存或傳送 API Key，請確保後端環境已設定好金鑰
- 變更金鑰後請重新啟動服務，以便設定生效

## 🎯 使用流程

1. 在左側側邊欄選擇 **OpenAI** 模型與子模型
2. 正常進行七步驟教學流程生成
3. 若需生成簡報，可在 Gamma 設定面板確認參數後送出
