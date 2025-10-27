# API 金鑰本地設定說明

## ✅ 已自動設定

我已經為您建立了 `backend/.env` 檔案，包含必要的 API 金鑰：

- ✅ OpenAI API Key
- ✅ Claude API Key
- ✅ 資料庫設定

## 🎯 現在可以使用了

後端服務已經重新啟動並載入了環境變數，您現在可以：

1. **訪問前端**：http://localhost:3000
2. **選擇 AI 模型**（OpenAI 或 Claude）
3. **開始使用**

## 🔍 驗證設定

如果遇到問題，請檢查：

### 1. .env 檔案是否存在

```bash
ls backend/.env
```

應該顯示檔案存在。

### 2. 後端服務正在運行

```bash
ps aux | grep uvicorn
```

應該看到 uvicorn 進程。

### 3. 重新載入服務

```bash
# 停止現有服務
kill $(ps aux | grep "uvicorn main:app" | grep -v grep | awk '{print $2}')

# 重新啟動
cd backend && source venv/bin/activate && uvicorn main:app --reload
```

## 📝 .env 檔案內容

檔案位置：`backend/.env`

```
OPENAI_API_KEY=your_key_here
CLAUDE_API_KEY=your_key_here
DATABASE_URL=sqlite:///./course_planner.db
ENVIRONMENT=development
DEBUG=true
```

## 🔒 安全性說明

- ✅ `.env` 檔案已被 `.gitignore` 保護
- ✅ 不會被推送到 GitHub
- ✅ 只在本地使用

## 🎉 完成！

現在您的本地環境已經完全配置好了，可以正常使用所有功能：

- ✅ Claude 整合
- ✅ 檔案上傳功能
- ✅ AI 生成功能
- ✅ Prompt 編輯器
- ✅ 側邊欄導航

---

**如果您需要更換 API 金鑰**，只需編輯 `backend/.env` 檔案即可。
