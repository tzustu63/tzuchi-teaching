# 課程計劃生成器 - 技術設計

## Context

本系統需要整合 OpenAI API 進行五步驟的課程計劃生成，並提供可配置的 prompt 編輯功能。系統需要處理結構化資料、檔案上傳、AI 生成內容的編輯和重新生成。

## Goals

- 提供直觀的多步驟表單介面
- 實現五個階段的課程內容生成
- 支持用戶編輯和重新生成內容
- 提供可配置的 prompt 系統
- 安全儲存和管理 OpenAI API key

## Non-Goals

- 不實作完整的 CMS 系統
- 不實作多租戶架構
- 不實作即時協作功能

## Decisions

### 1. 後端框架選擇：FastAPI

**理由**: FastAPI 提供自動 API 文件生成、類型提示支持、非同步處理能力，適合與 OpenAI API 整合。
**替代方案**: Flask (已排除，無自動文檔)、Django (過於重量級)

### 2. 前端架構：Vanilla JavaScript

**理由**: 專案初期功能單一，避免引入過多依賴
**替代方案**: React/Vue (可以後續重構)

### 3. 資料庫：SQLite → PostgreSQL (DigitalOcean Managed Database)

**理由**:

- 開發環境：SQLite 便於本地開發
- 生產環境：DigitalOcean 提供的託管 PostgreSQL 服務，自動備份和高可用性
  **遷移策略**:
- 使用 SQLAlchemy ORM 抽象層
- 生產環境使用環境變數切換資料庫連接
- 使用 SSL 連接 DigitalOcean PostgreSQL

### 4. 七步驟工作流程設計

**流程架構**:

```
Step 1: 基本資訊 → 教學理念
  ├── 輸入: {basic_info}
  ├── Prompt: rationale_prompt
  └── 輸出: rationale

Step 2: 教學理念 → 學習目標
  ├── 輸入: {basic_info} + {rationale}
  ├── Prompt: objectives_prompt
  └── 輸出: objectives

Step 3: 學習目標 → 教學策略
  ├── 輸入: {basic_info} + {rationale} + {objectives}
  ├── Prompt: strategies_prompt
  └── 輸出: strategies

Step 4: 教學策略 → 教學流程
  ├── 輸入: {basic_info} + {rationale} + {objectives} + {strategies}
  ├── Prompt: flow_prompt
  └── 輸出: teaching_flow

Step 5: 教學流程 → PPT
  ├── 輸入: {basic_info} + {rationale} + {objectives} + {strategies} + {flow}
  ├── Prompt: ppt_prompt
  └── 輸出: PPT檔案 (.pptx)

Step 6: 教學流程 → 學習單
  ├── 輸入: {basic_info} + {rationale} + {objectives} + {strategies} + {flow}
  ├── Prompt: worksheet_prompt
  └── 輸出: 學習單檔案 (.pdf/.docx)

Step 7: 最終確認與下載
  └── 打包所有生成文件
```

**每個步驟的特點**:

- 每個「下一步」按鈕都是獨立的功能
- 每個按鈕背後使用不同的 prompt 指令
- 每個 prompt 可透過前端介面修改
- 支援變數替換（{basic_info}、{rationale} 等）

### 5. Prompt Template 系統設計

**架構**:

```
prompts/
  ├── rationale.py         # 教學理念 template
  ├── objectives.py        # 學習目標 template
  ├── strategies.py        # 教學策略 template
  ├── flow.py              # 教學流程 template
  ├── ppt.py               # PPT 生成 template
  └── worksheet.py          # 學習單 template
```

**存儲**: 資料庫表 `prompt_templates`

- 欄位: id, step_number, name, type, content, variables, is_active, created_at, updated_at
- 支援: 版本歷史、變數替換、即時生效

**前端管理**:

- Prompt 設定頁面顯示 7 個步驟的 prompt 列表
- 每個 prompt 可獨立編輯
- 支援變數標記（{basic_info}、{rationale} 等）
- 修改後即時生效，無需重啟服務

### 6. API Key 安全儲存

**方法**:

- 使用 AES-256 加密（Python cryptography 庫）
- Master key 存於環境變數
- API key 加密後存於資料庫
- 使用時動態解密

### 7. 檔案上傳處理

**策略**:

- 開發環境：儲存到本地檔案系統
- 生產環境：DigitalOcean Spaces (S3-compatible object storage)
- 檔案大小限制：10MB
- 支援格式：.docx, .pdf, .txt
- 使用 boto3 連接 Spaces
- 上傳後提供預覽和下載功能

### 11. 部署方案：DigitalOcean

**架構**:

```
DigitalOcean App Platform:
├── Frontend Service (Static Site)
│   └── 託管前端 HTML/CSS/JavaScript
├── Backend Service (Web Service)
│   ├── FastAPI 應用
│   ├── Gunicorn/uWSGI 服務器
│   └── 環境變數配置
└── Managed PostgreSQL Database
    └── 自動備份和高可用性

DigitalOcean Spaces:
└── 文件存儲（教案、PPT、學習單）
```

**理由**:

- App Platform 簡化部署流程，自動 CI/CD
- Managed Database 提供自動備份和監控
- Spaces 提供低成本對象存儲
- 統一平台管理所有服務

**替代方案**: VPS + 手動部署（已排除，過於複雜）

### 8. 步驟間狀態管理

**方式**:

- 前端：使用 sessionStorage 暫存表單狀態
- 後端：建立課程計劃資料庫記錄，維護生成狀態
- 每個步驟生成後儲存到資料庫
- 支援中斷恢復

### 9. 教學流程輸出格式

**結構**: JSON 格式

```json
{
  "duration": 45,
  "stages": [
    {
      "stage": "引起動機",
      "duration": 5,
      "activities": "...",
      "teacher_actions": "...",
      "student_actions": "...",
      "materials": ["..."],
      "checkpoints": "..."
    }
  ]
}
```

### 10. PPT 和學習單生成

**方式**:

- PPT: 使用 python-pptx 庫生成 .pptx 檔案
- 學習單: 使用 reportlab 或 docx 生成 PDF/Word
- 基於教學流程自動生成結構化內容

## Risks / Trade-offs

### Risk: OpenAI API 成本控制

**影響**: API 調用費用隨使用量增加
**緩解**:

- 實施速率限制
- 快取常用 prompt 結果
- 提供 token 使用統計

### Risk: 生成內容品質不穩定

**影響**: AI 生成內容可能不符合教學需求
**緩解**:

- 提供可編輯功能
- 多次生成選項
- 預設高品質 prompt template

### Risk: Prompt 被用戶誤改

**影響**: 核心 prompt 被修改導致系統失效
**緩解**:

- 提供 prompt 重置功能
- 保存預設 prompt 版本
- 限制關鍵 prompt 的編輯權限

## Migration Plan

### 開發階段

1. 建立資料庫 schema（SQLite）
2. 實作 OpenAI API 整合
3. 開發後端 API（FastAPI）
4. 開發前端介面
5. 整合測試

### DigitalOcean 部署階段

6. 創建 DigitalOcean 專案
7. 設置 Managed PostgreSQL 資料庫
8. 設置 DigitalOcean Spaces 存儲
9. 配置環境變數和 secrets
10. 部署 Backend Service 到 App Platform
11. 部署 Frontend Service 到 App Platform
12. 配置域名和 SSL 證書
13. 設置監控和日誌
14. 生產環境測試
15. 用戶測試與回饋
16. 正式上線

## Open Questions

- PPT 模板樣式標準化？
- 是否需要提供多種學習單模板選擇？
- 是否需要支援匯出為其他格式（Markdown, HTML）？

### 部署相關

- **CDN 配置**：是否需要為靜態資源配置 CDN？
- **備份策略**：Database 和 Spaces 的自動備份保留時間？
- **監控方案**：使用 DigitalOcean Monitoring 還是第三方服務？
- **域名**：購買新域名或使用 DigitalOcean 提供的免費域名？
