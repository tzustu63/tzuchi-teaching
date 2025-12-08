# 如何獲取有效的 Gamma API Key

## 問題狀況

目前的 API Key 返回 401 錯誤：

```
{"message":"Invalid API key","statusCode":401}
```

## 獲取 Gamma API Key 的步驟

### 1. 註冊/登入 Gamma 帳戶

- 前往：https://gamma.app/
- 註冊新帳戶或登入現有帳戶

### 2. 升級到付費專業版

⚠️ **重要**：Gamma API 需要付費專業版帳戶

- 點擊左側面板底部的「Settings and Members」
- 升級到專業版（可能需要付費）

### 3. 獲取 API Key

- 在設定頁面中，點擊「API Keys」
- 創建新的 API Key
- 複製完整的 API Key（以 `sk-gamma-` 開頭）

### 4. 更新 .env 檔案

將新的 API Key 加入 `backend/.env`：

```bash
# 編輯 .env 檔案
nano backend/.env

# 更新或添加這一行：
GAMMA_API_KEY=sk-gamma-你的新API Key
```

### 5. 重新測試

```bash
cd backend
source venv/bin/activate
python test_gamma_api.py
```

## 替代方案

如果您：

- 沒有付費專業版帳戶
- 暫時無法獲取有效的 Gamma API Key

### 可以考慮：

1. 使用其他 PPT 生成服務（如 PowerPoint API）
2. 使用 OpenAI 生成簡報大綱，然後手動製作
3. 等待獲取有效的 Gamma API Key

## 更新 API Key

如果您有新的 Gamma API Key，請提供完整的 Key（完整字串），格式通常是：

```
sk-gamma-一串很長的字母數字
```

例如：

```
sk-gamma-A1b2C3d4E5f6G7h8I9j0K1l2M3n4O5p6Q7r8S9t0U1v2W3x4Y5z6
```

## 測試工具

已建立的測試腳本：

- `backend/test_gamma_api.py` - 基本測試
- `backend/test_gamma_detailed.py` - 詳細測試

可以直接運行：

```bash
cd backend
source venv/bin/activate
python test_gamma_api.py
```

## 下一步

請提供：

1. 新的完整 Gamma API Key
2. 或告知是否需要改用其他方案
