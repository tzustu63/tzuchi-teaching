## ADDED Requirements

### Requirement: 基本課程資訊輸入

系統 SHALL 提供表單讓教師輸入以下基本課程資訊：

- 課程標題（必填）
- 年級（下拉選單，必填）
- 課程時長（分鐘，必填）
- 學生人數（數字，必填）
- 教案內容（檔案上傳，支援 .docx, .pdf, .txt）
- 教室設備（文字輸入，選填）

#### Scenario: 教師輸入完整課程資訊

- **WHEN** 教師填寫所有必填欄位並上傳教案內容
- **THEN** 系統顯示「送出」按鈕可點擊
- **AND** 系統驗證檔案格式和大小（最大 10MB）

#### Scenario: 教師未填寫必填欄位

- **WHEN** 教師未填寫必填欄位
- **THEN** 系統顯示「送出」按鈕為禁用狀態
- **AND** 系統顯示錯誤提示說明缺少的欄位

### Requirement: 教學理念生成

系統 SHALL 使用 OpenAI API 根據基本課程資訊生成教學理念，包含：

- 為何選此主題
- 學生起點分析（先備知識、經驗、困難、動機）
- 教學價值（知識、技能、情意、應用）
- 跨領域連結

#### Scenario: 成功生成教學理念

- **WHEN** 教師送出基本課程資訊
- **THEN** 系統呼叫 OpenAI API 生成教學理念
- **AND** 系統顯示生成中狀態
- **AND** 系統返回教學理念文字內容
- **AND** 顯示「確認」和「重新生成」按鈕

#### Scenario: 教師編輯教學理念

- **WHEN** 教師點擊編輯按鈕
- **THEN** 系統進入編輯模式
- **AND** 教師可以修改文字內容
- **AND** 系統提供「儲存」和「取消」按鈕

#### Scenario: 生成失敗處理

- **WHEN** OpenAI API 返回錯誤
- **THEN** 系統顯示友善的錯誤訊息
- **AND** 系統提供「重試」按鈕
- **AND** 錯誤訊息包含問題建議（如檢查 API key）

### Requirement: 學習目標生成

系統 SHALL 使用 OpenAI API 根據基本課程資訊和教學理念生成學習目標，包含：

- 認知目標（Cognitive）- 理解、分析等
- 技能目標（Psychomotor）- 操作、示範等
- 情意目標（Affective）- 欣賞、展現等

每個目標 SHALL 包含：

- 目標描述
- 評量方式
- 驗收標準

#### Scenario: 確認教學理念後生成學習目標

- **WHEN** 教師確認教學理念
- **THEN** 系統呼叫 OpenAI API 生成學習目標
- **AND** 系統將基本課程資訊、教學理念整合發送給 API
- **AND** 系統返回三個類別的學習目標
- **AND** 每個目標包含評量方式和驗收標準

#### Scenario: 學習目標編輯和重新生成

- **WHEN** 教師不滿意生成的學習目標
- **THEN** 教師可以編輯內容或點擊「重新生成」
- **AND** 系統提供儲存功能
- **AND** 重新生成使用修改後的內容

### Requirement: 教學策略推薦

系統 SHALL 使用 OpenAI API 推薦五種適合的教學方法，包含：

- 教學方法名稱
- 選擇理由
- 實施建議

#### Scenario: 確認學習目標後推薦教學策略

- **WHEN** 教師確認學習目標
- **THEN** 系統呼叫 OpenAI API 生成五種教學策略
- **AND** 系統整合基本課程資訊、教學理念、學習目標發送給 API
- **AND** 系統返回教學策略清單
- **AND** 每個策略包含說明和實施建議

### Requirement: 教學流程設計

系統 SHALL 使用 OpenAI API 根據課程時長設計教學流程，包含：

- 時間分配（引起動機、概念教學、實作、總結）
- 各階段活動內容
- 教師與學生行動
- 檢核點
- 所需材料

#### Scenario: 生成完整教學流程

- **WHEN** 教師確認教學策略
- **THEN** 系統呼叫 OpenAI API 生成教學流程
- **AND** 系統整合所有先前階段的內容
- **AND** 系統根據課程時長自動分配時間
- **AND** 返回結構化的教學流程資料

#### Scenario: 教學流程顯示

- **WHEN** 系統生成教學流程
- **THEN** 系統以表格或清單形式顯示
- **AND** 清楚標示每個階段的時間、活動、材料
- **AND** 提供編輯功能

### Requirement: PPT 和學習單生成

系統 SHALL 根據教學流程自動生成：

- PowerPoint 簡報檔案（.pptx）
- 學習單檔案（.pdf 或 .docx）

#### Scenario: 生成教學材料

- **WHEN** 教師確認教學流程
- **THEN** 系統呼叫 OpenAI API 生成 PPT 內容大綱
- **AND** 系統使用 python-pptx 生成 PPT 檔案
- **AND** 系統使用 reportlab/docx 生成學習單檔案
- **AND** 提供預覽和下載功能

#### Scenario: 下載生成的材料

- **WHEN** 系統生成 PPT 和學習單
- **THEN** 系統顯示下載按鈕
- **AND** 點擊後下載對應的檔案
- **AND** 檔案名稱包含課程標題和日期

### Requirement: OpenAI API Key 管理

系統 SHALL 提供安全儲存和管理 OpenAI API key 的功能。

#### Scenario: 輸入 API Key

- **WHEN** 用戶首次使用系統
- **THEN** 系統提示輸入 OpenAI API Key
- **AND** 系統加密儲存到資料庫
- **AND** 驗證 API Key 有效性

#### Scenario: API Key 驗證失敗

- **WHEN** 用戶輸入無效的 API Key
- **THEN** 系統顯示錯誤訊息
- **AND** 系統提示檢查 API Key 格式
- **AND** 提供重試功能

### Requirement: 七步驟工作流程與「下一步」按鈕

系統 SHALL 實現七個生成步驟，每個步驟都有獨立的「下一步」按鈕，每個按鈕背後都使用不同的 prompt 指令。

#### Scenario: 步驟 1 - 生成教學理念（第一個「下一步」）

- **WHEN** 教師填寫基本課程資訊並點擊「下一步」
- **THEN** 系統保存基本課程資訊
- **AND** 系統使用「教學理念 prompt」呼叫 OpenAI API
- **AND** 系統將基本課程資訊插入 prompt 模板
- **AND** 返回教學理念內容

#### Scenario: 步驟 2 - 生成學習目標（第二個「下一步」）

- **WHEN** 教師確認教學理念並點擊「下一步」
- **THEN** 系統保存教學理念
- **AND** 系統使用「學習目標 prompt」呼叫 OpenAI API
- **AND** 系統將基本課程資訊、教學理念插入 prompt 模板
- **AND** 返回學習目標內容

#### Scenario: 步驟 3 - 生成教學策略（第三個「下一步」）

- **WHEN** 教師確認學習目標並點擊「下一步」
- **THEN** 系統保存學習目標
- **AND** 系統使用「教學策略 prompt」呼叫 OpenAI API
- **AND** 系統將基本課程資訊、教學理念、學習目標插入 prompt 模板
- **AND** 返回五種教學策略

#### Scenario: 步驟 4 - 生成教學流程（第四個「下一步」）

- **WHEN** 教師確認教學策略並點擊「下一步」
- **THEN** 系統保存教學策略
- **AND** 系統使用「教學流程 prompt」呼叫 OpenAI API
- **AND** 系統將所有先前階段內容插入 prompt 模板
- **AND** 返回結構化教學流程

#### Scenario: 步驟 5 - 生成 PPT（第五個「下一步」）

- **WHEN** 教師確認教學流程並點擊「生成 PPT」
- **THEN** 系統保存教學流程
- **AND** 系統使用「PPT 生成 prompt」呼叫 OpenAI API 生成內容大綱
- **AND** 系統使用 python-pptx 將內容轉換為 .pptx 檔案
- **AND** 提供預覽和下載功能

#### Scenario: 步驟 6 - 生成學習單（第六個「下一步」）

- **WHEN** 教師確認教學流程並點擊「生成學習單」
- **THEN** 系統保存教學流程
- **AND** 系統使用「學習單生成 prompt」呼叫 OpenAI API 生成內容
- **AND** 系統使用 reportlab/docx 將內容轉換為 PDF/Word 檔案
- **AND** 提供預覽和下載功能

#### Scenario: 步驟 7 - 最終確認與下載（第七個「下一步」）

- **WHEN** 教師完成所有步驟
- **THEN** 系統提供「完成並下載」按鈕
- **AND** 點擊後可下載完整的課程計劃包（包含所有 PDF/DOCX 檔案）
- **AND** 提供課程計劃匯出功能

### Requirement: 可配置的 Prompt 指令系統

系統 SHALL 提供前端介面讓用戶在前台編輯七個步驟的 prompt 指令，無需修改程式碼。

#### Scenario: 查看和編輯 Prompt 列表

- **WHEN** 用戶進入 Prompt 設定頁面
- **THEN** 系統顯示七個步驟的 prompt 列表：
  1. 教學理念 prompt
  2. 學習目標 prompt
  3. 教學策略 prompt
  4. 教學流程 prompt
  5. PPT 生成 prompt
  6. 學習單生成 prompt
  7. 最終確認 prompt（如有需要）
- **AND** 每個 prompt 顯示名稱、類型、最後修改時間
- **AND** 提供「編輯」、「預覽」、「重置」按鈕

#### Scenario: 編輯單個 Prompt

- **WHEN** 用戶點擊某個 prompt 的「編輯」按鈕
- **THEN** 系統開啟編輯介面
- **AND** 顯示 prompt 的完整內容（包括變數標記如 {basic_info}、{rationale} 等）
- **AND** 用戶可以修改 prompt 文字內容
- **AND** 系統提供變數提示和語法說明
- **AND** 提供「儲存」、「取消」、「預覽效果」按鈕

#### Scenario: Prompt 修改即時生效

- **WHEN** 用戶儲存修改後的 prompt
- **THEN** 系統保存 prompt 到資料庫
- **AND** 下次點擊「下一步」時使用新 prompt
- **AND** 系統記錄修改歷史
- **AND** 修改即時生效，無需重啟服務

#### Scenario: Prompt 變數系統

- **WHEN** 每個步驟的 prompt 被執行
- **THEN** 系統自動替換以下變數：
  - {basic_info}: 基本課程資訊（標題、年級、時長等）
  - {rationale}: 教學理念
  - {objectives}: 學習目標
  - {strategies}: 教學策略
  - {flow}: 教學流程
- **AND** 系統將變數替換為實際內容後發送給 OpenAI API
- **AND** prompt 支持動態變數替換功能

#### Scenario: 重置 Prompt 為預設值

- **WHEN** 用戶點擊「重置為預設值」
- **THEN** 系統提示確認操作
- **AND** 確認後恢復為系統預設的 prompt
- **AND** 原始自定義 prompt 被保存為歷史版本
- **AND** 系統提供版本歷史查看功能

#### Scenario: Prompt 版本歷史

- **WHEN** 用戶點擊「查看歷史」
- **THEN** 系統顯示該 prompt 的所有修改記錄
- **AND** 每條記錄包含修改時間、修改者、修改摘要
- **AND** 提供「還原到此版本」功能
- **AND** 支援版本比較功能
