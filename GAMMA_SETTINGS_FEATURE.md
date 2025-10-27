# Gamma 參數設定功能

## 📋 功能概述

在「生成教學材料」按鈕下方新增了 Gamma PPT 生成的參數設定面板，讓使用者可以根據需求調整各種 Gamma API 參數。

## ✅ 已實現的功能

### 1. Gamma 設定面板

- 📊 可摺疊的設定面板
- ⚙️ 點擊「Gamma 設定」按鈕可展開/收起
- 🎨 美觀的 UI 設計，與整體風格一致

### 2. 可調整的參數

#### 基本設定

- **語言**：繁體中文、簡體中文、英文、日文、韓文
- **卡牌數量**：1-60 張（建議 10-15 張）

#### 文字設定

- **文字量**：簡短、中等、詳細、非常詳細
- **語調**：例如「專業, 清晰」
- **觀眾/目標群體**：例如「國小學生」

#### 圖片設定

- **圖片模型**：
  - Flux 1 Pro（預設）
  - Flux 1 Quick
  - Flux 1 Ultra
  - DALL-E 3
  - Imagen 3 Pro
  - Imagen 4 Pro
- **圖片風格**：例如「真實攝影, 明亮」

### 3. 自動化功能

- ✅ 自動輪詢 Gamma 生成狀態
- ✅ 每 5 秒檢查一次，最多等待 2 分鐘
- ✅ 生成完成後自動跳轉到下一步
- ✅ 顯示 Gamma URL 連結

## 📁 更新的檔案

### 前端

1. **`frontend/index.html`**

   - 新增 Gamma 設定面板 HTML
   - 新增各類輸入欄位

2. **`frontend/app.js`**

   - `toggleGammaSettings()` - 切換設定面板
   - `generateMaterials()` - 收集設定並調用 Gamma API
   - `checkGammaStatus()` - 自動檢查狀態
   - `showMaterialResult()` - 顯示生成結果
   - `showStatus()` - 顯示狀態訊息

3. **`frontend/styles.css`**
   - Gamma 設定面板樣式
   - 按鈕樣式
   - 狀態訊息樣式

### 後端

1. **`backend/app/api/routes.py`**

   - 更新 `/courses/generate-ppt` 端點
   - 支援額外的參數設定

2. **`backend/app/services/gamma_service.py`**
   - 更新 `generate_presentation()` 方法
   - 支援所有 Gamma API 參數

## 🎯 使用方法

1. 完成前面的教學流程（步驟 1-5）
2. 點擊「⚙️ Gamma 設定」按鈕
3. 調整所需參數：
   - 選擇語言
   - 設定卡牌數量
   - 選擇文字量
   - 輸入語調和觀眾群體
   - 選擇圖片模型和風格
4. 點擊「生成教學材料」
5. 系統會自動：
   - 發送生成請求
   - 輪詢狀態
   - 顯示完成結果
   - 提供 Gamma URL

## 💡 使用建議

### 卡牌數量

- **10 張**：適合基礎教學
- **15 張**：適合完整教學流程
- **20+ 張**：適合詳細內容

### 文字量

- **簡短**：重點摘要
- **中等**：標準內容（推薦）
- **詳細**：豐富內容
- **非常詳細**：深入詳解

### 圖片風格範例

- `真實攝影` - 照片風格
- `插畫, 明亮, 卡通` - 插畫風格
- `專業, 商務, 簡約` - 商業風格
- `教育, 清晰, 友善` - 教育風格

### 語調範例

- `專業, 清晰`
- `親切, 鼓勵`
- `活潑, 有趣`
- `正式, 嚴謹`

### 觀眾群體範例

- `國小一年級學生`
- `專業人士`
- `教育工作者`
- `大學生`

## 📊 預設值

```javascript
language: "zh-tw"; // 繁體中文
num_cards: 10; // 10 張卡牌
text_amount: "medium"; // 中等文字量
tone: "專業, 清晰"; // 語調
audience: "國小學生"; // 觀眾
image_model: "flux-1-pro"; // 圖片模型
image_style: "真實攝影"; // 圖片風格
```

## 🔄 完整流程

```
Step 5: 教學流程
├─ 顯示教學流程內容
├─ 點擊「Gamma 設定」
│  ├─ 展開設定面板
│  └─ 調整參數
├─ 點擊「生成教學材料」
│  ├─ 收集所有設定
│  ├─ 調用 Gamma API
│  └─ 返回 generation_id
├─ 自動輪詢狀態
│  ├─ 每 5 秒檢查
│  └─ 最多等待 2 分鐘
├─ 生成完成
│  ├─ 顯示 Gamma URL
│  └─ 跳轉到 Step 6
└─ Step 6: 教學材料
   └─ 顯示結果和連結
```

## 🎉 完成狀態

- ✅ 前端 UI 完成
- ✅ 參數收集完成
- ✅ 後端 API 更新
- ✅ Gamma 服務更新
- ✅ 自動狀態檢查
- ✅ 結果顯示
- ✅ CSS 樣式
- ✅ 錯誤處理

## 📝 技術細節

### API 請求格式

```json
{
  "title": "課程標題",
  "language": "zh-tw",
  "num_cards": 10,
  "text_amount": "medium",
  "tone": "專業, 清晰",
  "audience": "國小學生",
  "image_model": "flux-1-pro",
  "image_style": "真實攝影",
  "rationale": "...",
  "objectives": "...",
  "strategies": "...",
  "teaching_flow": "..."
}
```

### Gamma API Payload

```json
{
  "inputText": "...",
  "textMode": "generate",
  "format": "presentation",
  "numCards": 10,
  "cardSplit": "auto",
  "textOptions": {
    "amount": "medium",
    "language": "zh-tw",
    "tone": "專業, 清晰",
    "audience": "國小學生"
  },
  "imageOptions": {
    "source": "aiGenerated",
    "model": "flux-1-pro",
    "style": "真實攝影"
  }
}
```

## 🎊 總結

現在您可以在「生成教學材料」按鈕下方完整控制 Gamma PPT 生成的所有參數，包括語言、卡牌數量、文字量、圖片模型等，讓您根據教學需求靈活調整簡報的風格和內容詳盡程度！
