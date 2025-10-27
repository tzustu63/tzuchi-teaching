# AI 子模型選擇器功能

## ✅ 已實現功能

### 新增子模型選擇器

在側邊欄的 AI 模型選擇下方，新增了「📡 子模型」選擇器，提供更精細的模型選擇控制。

## 📋 可用模型

### OpenAI 模型
- ✅ **GPT-4o** (最新) - 推薦使用
- ✅ **GPT-4 Turbo** - 高性能
- ✅ **GPT-4** - 標準版本
- ✅ **GPT-3.5 Turbo** - 快速經濟

### Claude 模型
- ✅ **Claude Sonnet 4.5** (最新) - 推薦使用
- ✅ **Claude Sonnet 4** - 穩定版本
- ✅ **Claude 3.5 Sonnet** - 高質量輸出
- ✅ **Claude 3 Opus** - 最強性能

## 🎯 功能特點

### 1. 動態顯示
- 選擇 OpenAI 時，只顯示 OpenAI 模型選項
- 選擇 Claude 時，只顯示 Claude 模型選項
- 自動切換，無需手動操作

### 2. 自動保存
- 選擇的子模型會自動保存到 localStorage
- 下次使用時會記住您的選擇

### 3. 自動載入
- 頁面載入時自動恢復上次選擇的模型
- 切換提供商時自動選擇第一個可用模型

### 4. 完整整合
- 所有 API 調用都使用選擇的子模型
- 後端會接收並使用子模型參數
- 日誌中會顯示使用的子模型

## 📁 更新的檔案

### 前端
- `frontend/index.html` - 新增子模型選擇器 HTML
- `frontend/app.js` - 新增子模型處理邏輯

### 後端
- `backend/app/api/routes.py` - 接收並使用子模型參數

## 🚀 使用方法

### 1. 選擇 AI 提供商
點擊側邊欄的「🤖 AI 模型」下拉選單：
- 選擇 **OpenAI** 或 **Claude**

### 2. 選擇子模型
在「📡 子模型」下拉選單中選擇具體模型：
- OpenAI 選擇：GPT-4o (推薦), GPT-4 Turbo, GPT-4, GPT-3.5 Turbo
- Claude 選擇：Claude Sonnet 4.5 (推薦), Claude Sonnet 4, Claude 3.5 Sonnet, Claude 3 Opus

### 3. 自動應用
您的選擇會自動應用到所有後續的生成操作：
- 教學理念生成
- 學習目標生成
- 教學策略生成
- 教學流程生成

## 💡 推薦設定

### 高質量輸出
- **OpenAI**: GPT-4o
- **Claude**: Claude Sonnet 4.5

### 平衡性能與成本
- **OpenAI**: GPT-4 Turbo
- **Claude**: Claude 3.5 Sonnet

### 快速經濟
- **OpenAI**: GPT-3.5 Turbo
- **Claude**: Claude 3.5 Sonnet

## 🔍 技術細節

### 前端邏輯
```javascript
// 當 AI 提供商改變時
sidebarModelSelect.addEventListener("change", (e) => {
  const selectedProvider = e.target.value;
  updateSubmodelOptions(selectedProvider);  // 動態顯示對應模型
  localStorage.setItem("ai_model", selectedProvider);
});

// 當子模型改變時
sidebarSubmodelSelect.addEventListener("change", (e) => {
  localStorage.setItem("ai_submodel", e.target.value);
});

// 在所有 API 調用中
const aiSubmodel = localStorage.getItem("ai_submodel") || "gpt-4o";
requestData.ai_submodel = aiSubmodel;
```

### 後端邏輯
```python
# 接收子模型參數
ai_submodel = request_data.get("ai_submodel", "gpt-4o" if ai_model == "openai" else "claude-sonnet-4-5")

# 調用 API
rationale = service.generate_content(prompt, model=ai_submodel)
```

## 📊 模型參數預設

### OpenAI 服務
- max_tokens: 8192 (已增加)
- temperature: 0.7
- 支援所有 GPT 系列模型

### Claude 服務
- max_tokens: 8192 (已增加)
- temperature: 0.7
- 支援所有 Claude 系列模型

## ✅ 測試功能

### 檢查選擇
1. 打開瀏覽器開發者工具 (F12)
2. 查看 Console，會看到：
   ```
   📡 已選擇子模型: gpt-4o
   ```

### 檢查後端使用
查看後端日誌：
```bash
tail -f /tmp/backend.log | grep "使用子模型"
```

輸出範例：
```
📡 使用子模型: gpt-4o
📡 使用子模型: claude-sonnet-4-5
```

## 🎉 完成狀態

- ✅ 子模型選擇器 UI 完成
- ✅ 動態顯示邏輯完成
- ✅ 自動保存功能完成
- ✅ API 整合完成
- ✅ 所有生成步驟都使用子模型

## 📝 注意事項

### 模型可用性
- 確保您的 API Key 有權限使用選擇的模型
- GPT-4 需要付費帳號
- Claude Sonnet 4.5 需要 Anthropic 帳號

### 預設模型
- 如果未選擇子模型，會自動使用預設值
- OpenAI 預設：gpt-4o
- Claude 預設：claude-sonnet-4-5

## 🚀 下一步

現在您可以：
1. 選擇不同的 AI 提供商
2. 選擇該提供商下的具體模型
3. 所有生成操作都會使用您選擇的模型
4. 您的選擇會自動保存，下次使用時會記住

嘗試不同的模型組合，找到最適合您的設定！

