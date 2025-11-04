# DigitalOcean 構建修復指南

## 問題診斷

錯誤訊息顯示 DigitalOcean 使用了 Python buildpack 而不是 Dockerfile：
```
Python  v4.289.5  https://do.co/apps-buildpack-python
ERROR: failed to build: exit status 1
```

## 解決方案

### 方案 1: 在 DigitalOcean UI 中明確指定使用 Docker（推薦）

1. **登入 DigitalOcean App Platform**
2. **編輯您的應用**
3. **進入後端服務配置**
4. **Build & Deploy Settings** 區段：
   - 找到 **Build Method** 或 **Source Directory**
   - 選擇 **Dockerfile**
   - 確保 **Dockerfile Path** 設為 `backend/Dockerfile`
   - 確保 **Docker Build Context** 設為 `backend`

### 方案 2: 調整 app.yaml 配置

我已經更新了 `app.yaml`，添加了 `docker_context: backend`。請確保：

1. **提交並推送更新**：
```bash
git add app.yaml .dockerignore BUILD_FIX.md
git commit -m "fix: 修復 DigitalOcean 構建配置，明確指定 Docker 構建"
git push origin V1
```

2. **在 DigitalOcean UI 中重新載入配置**：
   - 或者刪除現有應用並重新創建

### 方案 3: 檢查根目錄是否有干擾文件

DigitalOcean 可能因為檢測到根目錄的某些 Python 文件而自動使用 buildpack。

**檢查**：
```bash
# 在項目根目錄運行
ls -la | grep -E "(requirements.txt|Procfile|runtime.txt|setup.py)"
```

如果有這些文件在根目錄，可能需要：
- 移動到適當位置
- 或添加 `.dockerignore`（已完成）

### 方案 4: 使用完整的 Docker 配置

如果以上方案都不行，可以嘗試在 `app.yaml` 中使用更明確的 Docker 配置：

```yaml
services:
  - name: backend
    github:
      repo: tzustu63/tzuchi-teaching
      branch: V1
      deploy_on_push: true
    source_dir: /backend
    dockerfile_path: Dockerfile
    http_port: 8000
    # ... 其他配置
```

## 驗證步驟

部署後，檢查構建日誌應該看到：
- ✅ "Using Dockerfile"
- ✅ 而不是 "Using Python buildpack"

## 如果仍然失敗

請檢查構建日誌中的詳細錯誤訊息，可能的原因：

1. **Dockerfile 路徑錯誤** - 確認 `backend/Dockerfile` 存在
2. **構建上下文錯誤** - 確認 `docker_context: backend` 已設定
3. **requirements.txt 缺失** - 確認 `backend/requirements.txt` 存在
4. **依賴安裝失敗** - 檢查 requirements.txt 中的套件是否都可用

## 緊急方案：使用 Buildpack

如果 Docker 構建持續失敗，可以臨時使用 buildpack，但需要：

1. **在根目錄創建 `Procfile`**：
```
web: cd backend && python main.py
```

2. **創建 `runtime.txt`**（可選）：
```
python-3.13
```

3. **調整構建命令**（在 DigitalOcean UI 中）：
   - Build Command: `cd backend && pip install -r requirements.txt`
   - Run Command: `cd backend && python main.py`

**但建議優先修復 Dockerfile 構建**，因為這提供更好的控制和一致性。
