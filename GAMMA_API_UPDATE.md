# Gamma API 更新說明

## 概述

根據 [Gamma API 官方文檔](https://developers.gamma.app/reference/generate-a-gamma)，已更新程式碼以符合 Gamma API v0.2 的規範。

## 主要變更

### 1. `backend/app/services/gamma_service.py`

#### 更新內容

- ✅ 修改 `generate_presentation()` 方法的參數結構以符合 Gamma API 規範
- ✅ 將 `content` 參數改為 `prompt` 參數
- ✅ 新增 `image_model` 參數支援（預設：`default`）
- ✅ 改進錯誤處理，包含更詳細的錯誤訊息
- ✅ 添加調試日誌輸出

#### 新增功能

- `_build_gamma_content()`：專門為 Gamma API 構建內容格式
- 改進 `check_generation_status()`：添加詳細的狀態追蹤日誌
- 改進 `wait_for_completion()`：添加進度追蹤日誌

#### API 參數說明

根據 Gamma API 規範，請求參數結構為：

```json
{
  "textOptions": {
    "language": "zh-TW"
  },
  "imageOptions": {
    "model": "default"
  },
  "prompt": "簡報內容"
}
```

### 2. `backend/app/api/routes.py`

#### 新增端點

- ✅ `POST /courses/generate-ppt`：生成 PPT
  - 支援 `language` 參數（預設：`zh-TW`）
  - 支援 `image_model` 參數（預設：`default`）
- ✅ `GET /courses/gamma-status/{generation_id}`：檢查生成狀態

  - 返回詳細的狀態資訊

- ✅ `POST /courses/gamma-wait/{generation_id}`：等待生成完成
  - 支援 `timeout` 參數（預設：300 秒）

#### 改進

- 從環境變數或設定中讀取 Gamma API Key
- 添加詳細的日誌記錄
- 改進錯誤處理

### 3. `backend/app/config.py`

#### 新增配置

- ✅ `gamma_api_key`：Gamma API Key 配置項

## 使用方式

### 1. 設定 Gamma API Key

#### 方式一：環境變數

```bash
export GAMMA_API_KEY="sk-gamma-your-key-here"
```

#### 方式二：`.env` 檔案

```
GAMMA_API_KEY=sk-gamma-your-key-here
```

### 2. 呼叫 API 生成 PPT

**端點**：`POST /api/courses/generate-ppt`

**請求範例**：

```json
{
  "title": "課程標題",
  "language": "zh-TW",
  "image_model": "default",
  "basic_info": {
    "grade": "一年級",
    "duration": 40,
    "student_count": 30,
    "classroom_equipment": "投影機、互動式白板"
  },
  "rationale": "教學理念...",
  "objectives": ["目標1", "目標2"],
  "strategies": ["策略1", "策略2"],
  "teaching_flow": ["步驟1", "步驟2"]
}
```

**回應範例**：

```json
{
  "status": "success",
  "generation_id": "gen_xxx",
  "gamma_url": "https://gamma.app/xxx",
  "status_info": "pending",
  "message": "PPT 生成中，請稍後檢查狀態"
}
```

### 3. 檢查生成狀態

**端點**：`GET /api/courses/gamma-status/{generation_id}`

**回應範例**：

```json
{
  "status": "success",
  "generation_status": "completed",
  "gamma_url": "https://gamma.app/xxx",
  "generation_info": {
    /* 詳細資訊 */
  }
}
```

### 4. 等待生成完成

**端點**：`POST /api/courses/gamma-wait/{generation_id}`

**查詢參數**：

- `timeout`（選填）：超時時間（秒），預設 300

**回應範例**：

```json
{
  "status": "success",
  "generation_id": "gen_xxx",
  "result": {
    "status": "completed",
    "gamma_url": "https://gamma.app/xxx"
  }
}
```

## API 參數說明

### 支援的語言（`language`）

- `zh-TW`：繁體中文（預設）
- `zh-CN`：簡體中文
- `en-US`：英文
- 更多語言請參考 [Gamma API 文檔](https://developers.gamma.app/reference/generate-a-gamma)

### 支援的圖片模型（`image_model`）

- `default`：預設模型
- 更多選項請參考 [Gamma API 文檔](https://developers.gamma.app/reference/generate-a-gamma)

## 測試建議

1. **測試生成請求**：

   ```bash
   curl -X POST http://localhost:8000/api/courses/generate-ppt \
     -H "Content-Type: application/json" \
     -d '{
       "title": "測試課程",
       "rationale": "這是測試內容"
     }'
   ```

2. **測試狀態查詢**：
   ```bash
   curl http://localhost:8000/api/courses/gamma-status/{generation_id}
   ```

## 注意事項

⚠️ **重要提示**：

- Gamma API 生成需要時間，通常需要數秒到數十秒
- 使用 `wait_for_completion` 時建議設定合理的 `timeout`
- Gamma API Key 需要有效的憑證
- 生成完成後才能取得 `gamma_url`

## 參考資料

- [Gamma API 文檔](https://developers.gamma.app/reference/generate-a-gamma)
- [Gamma Generate API](https://public-api.gamma.app/v0.2/generations)

## 後續改進

- [ ] 添加前端整合
- [ ] 添加生成進度顯示
- [ ] 支援多種輸出格式
- [ ] 添加批量生成功能
