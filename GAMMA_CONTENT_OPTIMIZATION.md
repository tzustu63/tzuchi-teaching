# Gamma API 內容自動優化說明

## 問題描述

您觀察到 Gamma 生成 PPT 時，內容似乎被截斷或精簡，這其實是 **Gamma API 的正常行為**，而非程式碼錯誤。

## 原因分析

### Gamma API 的自動優化機制

根據 [Gamma API 文檔](https://developers.gamma.app/docs/how-does-the-generations-api-work)，Gamma 會根據以下因素自動調整內容：

1. **卡牌數量 (`numCards`)**

   - 設定較少卡牌時，Gamma 會精簡內容以適應頁數
   - 例如：10 張卡牌 vs 20 張卡牌，後者會有更多內容

2. **文字量設定 (`textOptions.amount`)**

   - `brief`：簡短版本，重點摘要
   - `medium`：中等詳細度（預設）
   - `detailed`：詳細內容
   - `extensive`：非常詳細的內容

3. **Gamma 的 AI 處理**
   - Gamma 會自動判斷內容的重要性
   - 保留關鍵訊息，精簡次要細節
   - 重新組織內容以符合簡報格式

### Token 和字元限制

根據官方文檔：

- **Token 限制**：1-100,000 tokens
- **字元限制**：約 1-400,000 字元

您的程式碼**沒有任何字元限制**，會完整傳送所有內容。

## 解決方案

### 方案一：增加卡牌數量

如果您希望保留更多內容，建議設定更多卡牌：

```javascript
// 在 Gamma 設定中
numCards: 15 - 20; // 增加到 15-20 張卡牌
```

### 方案二：調整文字量設定

選擇「詳細」或「非常詳細」：

```javascript
// 在 Gamma 設定中
text_amount: "extensive"; // 改為「非常詳細」
```

### 方案三：結構化輸入

在 Gamma API 中，您可以使用 `\\n---\\n` 來強制分頁，確保重要部分不被精簡：

```markdown
# 標題 1

## 內容 1

# 標題 2

## 內容 2

# 標題 3

內容 3
```

這會告訴 Gamma 這裡需要三個獨立的卡牌。

## 目前的實作

### 目前的參數設定

```javascript
numCards: 10; // 10 張卡牌（可能偏少）
text_amount: "medium"; // 中等詳細度
```

建議調整為：

```javascript
numCards: 15; // 增加到 15 張
text_amount: "detailed"; // 改為詳細
```

## 如何查看完整內容

### 1. 檢查後端日誌

查看 `/tmp/backend.log` 可以看到實際傳送的內容長度：

```bash
tail -100 /tmp/backend.log | grep "輸入文字長度"
```

### 2. 檢查傳送給 Gamma 的內容

後端已經添加了日誌輸出，會顯示：

- 輸入文字長度
- 內容預覽（前 500 字元）

### 3. 查看 Gamma 回應

Gamma API 會返回生成狀態，您可以使用：

```bash
curl http://localhost:8000/courses/gamma-status/{generation_id}
```

## 建議設定

根據您的使用案例，建議以下設定：

### 基礎教學（10-12 張卡牌）

```javascript
{
  language: "zh-tw",
  num_cards: 10,
  text_amount: "medium",
  tone: "專業, 清晰",
  audience: "國小學生",
  image_model: "flux-1-pro",
  image_style: "真實攝影"
}
```

### 完整教學（15-20 張卡牌）

```javascript
{
  language: "zh-tw",
  num_cards: 15,
  text_amount: "detailed",      // 改為詳細
  tone: "專業, 清晰",
  audience: "國小學生",
  image_model: "flux-1-pro",
  image_style: "真實攝影, 明亮"
}
```

### 深入教學（20+ 張卡牌）

```javascript
{
  language: "zh-tw",
  num_cards: 20,
  text_amount: "extensive",      // 非常詳細
  tone: "親切, 鼓勵, 專業",
  audience: "國小一年級學生",
  image_model: "flux-1-pro",
  image_style: "教育風格, 真實攝影"
}
```

## 總結

### 這不是程式碼問題

- ✅ 程式碼會完整傳送所有內容
- ✅ 沒有任何字元截斷
- ✅ 沒有 Token 限制

### 這是 Gamma API 的特性

- 📝 Gamma 會根據卡牌數量和文字量設定自動優化內容
- 📝 Gamma 會保留核心訊息，精簡次要細節
- 📝 Gamma 會重新組織內容以符合簡報格式

### 如何控制內容長度

- 🎯 增加 `num_cards`（建議 15-20）
- 🎯 選擇 `detailed` 或 `extensive` 文字量
- 🎯 使用 `\\n---\\n` 強制分頁
- 🎯 在 prompt 中明確指定要保留的內容

## 相關檔案

- `backend/app/services/gamma_service.py` - Gamma 服務
- `backend/app/api/routes.py` - API 路由
- `frontend/app.js` - 前端處理
- Gamma API 文檔：https://developers.gamma.app/docs/how-does-the-generations-api-work
