# Prompt 編輯器功能說明

## ✨ 新功能：Prompt 編輯器

已成功將「進階設定：Prompt 編輯」移到側邊欄，並實現了完整的編輯功能！

## 📍 位置

### 側邊欄底部新增按鈕

- **⚙️ 設定** - 開啟 AI 模型選擇
- **📝 Prompt 編輯** - 開啟 Prompt 編輯器

## 🎯 功能特色

### 1. **選擇步驟**

- 下拉選單可選擇要編輯的 6 個步驟：
  - 步驟 1: 教學理念
  - 步驟 2: 學習目標
  - 步驟 3: 教學策略
  - 步驟 4: 教學流程
  - 步驟 5: PPT 生成
  - 步驟 6: 學習單

### 2. **編輯界面**

- 顯示 Prompt 名稱
- 顯示可用變數
- 大型文字編輯區域
- 使用等寬字體（Monaco/Menlo）便於編輯

### 3. **功能按鈕**

- **💾 儲存 Prompt** - 儲存修改過的 Prompt
- **🔄 重置為預設** - 恢復為預設值
- **❌ 關閉** - 關閉編輯器

## 🔧 技術實現

### 前端

- 側邊欄按鈕：在側邊欄底部新增「📝 Prompt 編輯」按鈕
- 編輯界面：新增完整的 Prompt 編輯器界面
- 樣式美化：藍色漸變背景、平滑動畫效果

### 功能實現

- `loadPromptForStep(stepNumber)` - 載入指定步驟的 Prompt
- `savePrompt()` - 儲存修改後的 Prompt
- `resetPrompt()` - 重置為預設 Prompt

### 後端 API

- `GET /prompts/{step_number}` - 獲取 Prompt
- `PUT /prompts/{step_number}` - 更新 Prompt
- `POST /prompts/{step_number}/reset` - 重置 Prompt

## 🎨 樣式特色

### Prompt 編輯器

- 藍色漸變背景
- 平滑淡入動畫
- 等寬字體顯示
- 清晰的按鈕佈局

## 📝 使用方式

### 1. 開啟編輯器

點擊側邊欄底部的「📝 Prompt 編輯」按鈕

### 2. 選擇步驟

使用下拉選單選擇要編輯的步驟

### 3. 編輯 Prompt

在文字區域修改 Prompt 內容

### 4. 儲存或重置

- 點擊「💾 儲存 Prompt」保存修改
- 點擊「🔄 重置為預設」恢復預設值
- 點擊「❌ 關閉」關閉編輯器

## 💡 提示

### 可用變數

編輯 Prompt 時可以使用以下變數（用 `{變數名}` 格式）：

- `{title}` - 課程標題
- `{grade}` - 年級
- `{duration}` - 課程時長
- `{student_count}` - 學生人數
- `{classroom_equipment}` - 教室設備
- `{rationale}` - 教學理念
- `{objectives}` - 學習目標
- `{strategies}` - 教學策略
- `{teaching_flow}` - 教學流程

### 注意事項

- 儲存的 Prompt 會被持久化到資料庫
- 重置會將 Prompt 恢復為系統預設值
- 修改 Prompt 會影響所有後續的課程計劃生成

## 🌐 訪問

- **前端應用**: http://localhost:3000
- **後端 API**: http://localhost:8000
- **API 文檔**: http://localhost:8000/docs

現在您可以輕鬆自訂各步驟的 Prompt 內容！
