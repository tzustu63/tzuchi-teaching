# 課程計劃生成器

AI 驅動的完整課程計劃生成系統，協助教師快速建立包含教學理念、學習目標、教學策略、教學流程的完整課程計劃。

## 功能特色

- 🔄 七步驟工作流程：從基本資訊到完整教學材料的系統化生成
- 🤖 AI 驅動：整合 OpenAI API 進行內容生成
- ⚙️ 可配置 Prompt：前端直接編輯 prompt 指令，無需修改程式碼
- 📦 DigitalOcean 部署：完整的雲端部署方案
- 🔐 安全儲存：API Key 加密儲存

## 專案結構

```
new-teaching/
├── backend/              # FastAPI 後端
│   ├── app/             # 應用程式模組
│   ├── main.py          # 主應用程式
│   └── requirements.txt  # Python 依賴
├── frontend/            # 前端 HTML/CSS/JS
│   ├── index.html       # 主頁面
│   ├── styles.css       # 樣式表
│   └── app.js           # 前端邏輯
└── openspec/           # OpenSpec 規範
```

## 快速開始

### 1. 設定環境

```bash
# 進入後端目錄
cd backend

# 創建虛擬環境
python3 -m venv venv

# 啟動虛擬環境
source venv/bin/activate  # macOS/Linux
# 或
venv\Scripts\activate     # Windows

# 安裝依賴
pip install -r requirements.txt
```

### 2. 設定環境變數

創建 `.env` 檔案：

```bash
cp .env.example .env
```

編輯 `.env` 並填入您的 OpenAI API Key。

### 3. 初始化資料庫

```bash
python -c "from app.database import init_db; init_db()"
```

### 4. 啟動後端伺服器

```bash
uvicorn main:app --reload
```

後端 API 運行在 `http://localhost:8000`

### 5. 啟動前端

開啟 `frontend/index.html` 在瀏覽器中。

## Railway 部署指南

1. **安裝 Railway CLI**
   ```bash
   curl -fsSL https://railway.app/install.sh | sh
   ```
   重新載入終端機後，執行 `railway login` 以完成授權。

2. **初始化專案**
   ```bash
   cd "/Users/kuoyuming/Desktop/程式開發/new teaching拷貝"
   railway init    # 或使用 railway link 連接既有專案
   ```

3. **建立 Railway Postgres**
   - 在 Railway 儀表板加入 Postgres 外掛。
   - 於 `Variables` 介面複製連線字串，設定為 `DATABASE_URL`。

4. **設定必需的環境變數**
   ```bash
   railway variables set OPENAI_API_KEY=sk-xxx
   railway variables set MASTER_ENCRYPTION_KEY=<32字元以上安全字串>
   railway variables set DATABASE_URL=<來自 Railway 的 Postgres 連線字串>
   # 如需 Gamma 功能：
   railway variables set GAMMA_API_KEY=gamma-xxx
   ```
   可視需求新增：
   - `DB_POOL_SIZE`（預設 5）
   - `DB_MAX_OVERFLOW`（預設 10）
   - `PGSSLMODE`（預設 `require`，當連線字串未指定時自動補上）

5. **部署**
   ```bash
   railway up
   ```
   Railway 會依 `railway.json` 使用 Railpack 安裝依賴（執行 `pip install -r requirements.txt`），並透過 `uvicorn backend.main:app --host 0.0.0.0 --port ${PORT}` 啟動服務。

6. **驗證**
   - 確認 `/health` 回應 `{"status": "healthy"}`
   - 測試主要流程（生成課程計劃、儲存資料、Gamma PPT 等）

> **注意：** Railway 容器檔案系統為暫存性質，`uploads/` 的檔案會在重新部署或重啟後被清除。若需長期保存上傳檔案，請整合外部物件儲存（如 S3、DigitalOcean Spaces）。

## 開發狀態

- ✅ 階段 1: 專案基礎架構 - 完成
- ✅ 階段 2: OpenAI API 整合 - 完成
- ✅ 階段 3: 後端 API 開發 - 完成（核心功能）
- ✅ 階段 4: 前端開發 - 完成（核心功能）
- ✅ 階段 5: 七步驟工作流程 - 完成（教學理念、學習目標、教學策略、教學流程）
- ✅ 階段 5B: Prompt 可配置系統 - 完成（前端顯示與編輯介面）
- ⏳ 階段 6: 安全與優化
- ⏳ 階段 7: 測試與部署準備
- ⏳ 階段 8: DigitalOcean 部署

## 已完成功能

### 前端 UI（七步驟工作流程）

- ✅ 步驟 1: 基本資訊輸入表單
- ✅ 步驟 2: 教學理念生成與顯示
- ✅ 步驟 3: 學習目標生成與顯示
- ✅ 步驟 4: 教學策略生成與顯示
- ✅ 步驟 5: 教學流程生成與顯示
- ✅ API Key 設定介面
- ✅ Prompt 設定介面（可查看和編輯）

### 後端 API

- ✅ OpenAI API 整合服務
- ✅ 教學理念生成 API (`/courses/generate-rationale`)
- ✅ 學習目標生成 API (`/courses/generate-objectives`)
- ✅ 教學策略生成 API (`/courses/generate-strategies`)
- ✅ 教學流程生成 API (`/courses/generate-flow`)
- ✅ Prompt 管理 API (`/prompts`)
- ✅ API Key 加密儲存機制

### Prompt 系統

- ✅ 六個預設 Prompt 模板（步驟 1-6）
- ✅ 變數替換系統（{title}, {grade}, {rationale} 等）
- ✅ 前端 Prompt 編輯介面
- ✅ Prompt 保存到資料庫功能
- ✅ Prompt 重置為預設值功能

### 檔案上傳功能

- ✅ 支援 .docx, .pdf, .txt 格式
- ✅ 檔案大小限制 10MB
- ✅ 自動儲存到 backend/uploads 目錄
- ✅ 安全檔案名稱生成（時間戳記前綴）

## API 文檔

啟動伺服器後，訪問：

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## 授權

MIT License
