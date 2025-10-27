# Gamma API 更新檢查清單

## ✅ 已完成的更新

### 1. `backend/app/services/gamma_service.py`

- ✅ 更新 API 端點為 `v0.2`
- ✅ 修改請求參數結構：
  - `content` → `prompt`
  - 新增 `textOptions` 和 `imageOptions` 參數
- ✅ 新增 `language` 參數支援（預設：`zh-TW`）
- ✅ 新增 `image_model` 參數支援（預設：`default`）
- ✅ 改進錯誤處理和日誌記錄
- ✅ 新增 `_build_gamma_content()` 方法
- ✅ 改進 `check_generation_status()` 方法
- ✅ 改進 `wait_for_completion()` 方法

### 2. `backend/app/api/routes.py`

- ✅ 更新 `/courses/generate-ppt` 端點
- ✅ 新增支援 `language` 和 `image_model` 參數
- ✅ 改進 Gamma API Key 讀取邏輯
- ✅ 新增詳細日誌記錄
- ✅ 新增 `wait_for_completion` 端點

### 3. `backend/app/config.py`

- ✅ 新增 `gamma_api_key` 配置項

### 4. 文件

- ✅ 建立 `GAMMA_API_UPDATE.md` 詳細說明文件

## 📋 API 變更摘要

### 更新前

```python
payload = {
    "content": presentation_content
}
```

### 更新後

```python
payload = {
    "textOptions": {
        "language": language
    },
    "imageOptions": {
        "model": image_model
    },
    "prompt": presentation_content
}
```

## 🔍 需要測試的功能

### 1. PPT 生成

```bash
curl -X POST http://localhost:8000/api/courses/generate-ppt \
  -H "Content-Type: application/json" \
  -d '{
    "title": "測試課程",
    "language": "zh-TW",
    "image_model": "default",
    "basic_info": {
      "grade": "一年級",
      "duration": 40
    },
    "rationale": "教學理念測試",
    "objectives": ["目標1"],
    "strategies": ["策略1"],
    "teaching_flow": ["步驟1"]
  }'
```

### 2. 狀態查詢

```bash
curl http://localhost:8000/api/courses/gamma-status/{generation_id}
```

### 3. 等待完成

```bash
curl -X POST http://localhost:8000/api/courses/gamma-wait/{generation_id}?timeout=300
```

## ⚠️ 注意事項

1. **API Key 配置**：

   - 需要在環境變數或 `.env` 檔案中設定 `GAMMA_API_KEY`
   - 或使用程式碼中的預設值（測試用）

2. **生成時間**：

   - Gamma API 生成 PPT 需要時間（通常數秒到數十秒）
   - 建議使用 `wait_for_completion` 端點來等待完成

3. **錯誤處理**：
   - 已改進錯誤處理，會返回詳細的錯誤訊息
   - 建議查看後端日誌以了解詳細錯誤

## 🚀 下一步

1. 測試 PPT 生成功能
2. 整合前端以顯示 Gamma 連結
3. 添加生成進度顯示
4. 考慮添加批量生成功能

## 📚 參考資料

- [Gamma API 文檔](https://developers.gamma.app/reference/generate-a-gamma)
- [Gamma Generate API](https://public-api.gamma.app/v0.2/generations)
- [詳細更新說明](./GAMMA_API_UPDATE.md)
