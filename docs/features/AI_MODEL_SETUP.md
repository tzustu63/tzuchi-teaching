# AI 模型設定說明

## ✅ 現況
- 系統僅支援 **OpenAI** 模型
- Gamma PPT 生成使用 **Gamma API**
- 所有 Claude 相關設定與金鑰已移除

## 🔑 必要環境變數
```
OPENAI_API_KEY=your-openai-key
GAMMA_API_KEY=your-gamma-key
```
可放在 `backend/.env` 或部署平台的環境設定中。

## 🎯 使用流程
1. 在側邊欄選擇 OpenAI 子模型（預設 `gpt-4o-mini`）
2. 依序完成七步驟課程計劃生成
3. 若需簡報，展開 Gamma 設定面板後送出

## 🛠️ 技術細節
- 後端僅保留 `OpenAIService` 與 `GammaService`
- 路由會驗證 `ai_model` 必須為 `openai`
- 前端僅顯示 OpenAI 選項並記住子模型

## 🌐 服務入口
- 前端頁面：http://localhost:3000
- 後端 API：http://localhost:8000
- API 文件：http://localhost:8000/docs

設定完成後即可專注於 OpenAI + Gamma 的完整教案流程。
