# Railway CLI 操作教學

本文整理自 Railway 官方 CLI 文件，提供常用操作步驟與指令，協助你在本地終端透過 CLI 管理 Railway 專案。參考來源：[Using the CLI](https://docs.railway.com/guides/cli)。

## 1. 安裝 CLI

根據開發環境選擇其一：

- Homebrew（macOS）
  ```bash
  brew install railway
  ```
- npm（macOS/Linux/Windows，需 Node.js ≥ 16）
  ```bash
  npm i -g @railway/cli
  ```
- Shell Script（macOS/Linux/WSL）
  ```bash
  bash <(curl -fsSL cli.new)
  ```

安裝後可執行 `railway --version` 確認版本。

## 2. 登入與驗證

- 標準流程會在瀏覽器開啟授權頁面：
  ```bash
  railway login
  ```
- 若當前環境無法開啟瀏覽器，可使用無瀏覽器模式，依提示輸入配對碼：
  ```bash
  railway login --browserless
  ```
- 自動化情境可改用 Token：
  ```bash
  RAILWAY_TOKEN=<project-token> railway up
  ```

## 3. 連結專案與服務

- 建立或連結專案（會提示選擇 Team、Project、Environment）：
  ```bash
  railway init     # 建立新專案
  railway link     # 連結既有專案
  ```
- 指定服務（專案內可能有多個服務）：
  ```bash
  railway service
  ```
- 切換環境：
  ```bash
  railway environment
  ```

## 4. 常用部署指令

- 上傳並部署當前目錄程式碼：
  ```bash
  railway up
  ```
- 若只想觸發部署後立刻返回：
  ```bash
  railway up --detach
  ```
- 查看建置或執行中的日誌：
  ```bash
  railway logs
  ```

## 5. 管理環境變數

- 設定單一變數：
  ```bash
  railway variables set KEY=value
  ```
- 下載環境變數（生成 `.env`）：
  ```bash
  railway variables download
  ```

## 6. 本地啟動與偵錯

- 在本地以遠端環境變數執行指令：
  ```bash
  railway run <command>
  ```
- 開啟帶有專案環境變數的本地 shell：
  ```bash
  railway shell
  ```

## 7. 建立資料庫與其他服務

- 透過 CLI 加入新的資料庫（例如 Postgres、Redis）：
  ```bash
  railway add
  ```
  依提示選擇需要的服務後，對應的連線資訊會自動存入專案環境變數。

## 8. 終端 SSH 連線（除錯用途）

- 在服務容器內開啟互動 shell：
  ```bash
  railway ssh
  ```
  可先 `railway link` 指向特定服務，也可在 Railway 儀表板複製完整命令。

## 9. 登出

完成操作後如需登出 CLI：
```bash
railway logout
```

---

### 建議工作流程（以本專案為例）
1. 安裝並登入 Railway CLI。
2. `railway init`（或 `railway link`）指向專案根目錄。
3. 在 Railway 儀表板新增 Postgres，取得 `DATABASE_URL` 後使用 `railway variables set` 設定必需變數。
4. 執行 `railway up` 進行部署，使用 `railway logs` 監看建置狀態。
5. 如需本地載入遠端環境進行測試，可執行 `railway run uvicorn backend.main:app --reload` 或使用 `railway shell`。

以上步驟即可在不依賴 GitHub 的情況下，直接從 Cursor 終端完成 Railway 部署與日常管理。[來源](https://docs.railway.com/guides/cli)

---

## CLI 部署時的建置方式選擇

- **建議：使用 Railpack（build configuration）**  
  Railway 目前以 Railpack 作為預設建置器，可透過 `railway.json` 或服務設定自訂語言版本、建置/啟動指令與快取目錄，適合直接用 CLI 執行 `railway up` 進行部署。[來源](https://docs.railway.com/guides/build-configuration)  
  - 若使用設定檔，請將 `builder` 設為 `RAILPACK`，必要時搭配 `installCommand`、`startCommand`。  
  - 如需設定根目錄，可在服務設定中指定 Root Directory；`railway.json` 需使用絕對路徑（例如 `/backend/railway.json`）。

- **備選：Dockerfile**  
  若專案必須完全掌控映像建置（自訂系統套件、複雜多階段流程等），可以在專案根目錄放置 `Dockerfile`，Railway 會自動偵測並使用。若 Dockerfile 位於其他路徑，可設定環境變數 `RAILWAY_DOCKERFILE_PATH` 指向正確位置。[來源](https://docs.railway.com/guides/dockerfiles)

對於本專案而言，使用 Railpack + `railway.json` 能直接從 CLI 部署並沿用既有的 `uvicorn` 啟動指令；只有在日後需要更細緻的映像控制時，再改用 Dockerfile。

