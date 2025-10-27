# 檔案上傳功能完成報告

## 📋 功能概述

已實作完整的檔案上傳功能，允許用戶上傳教案檔案（PDF、Word、TXT），讓 AI 讀取並分析檔案內容，用於生成更精準的課程計劃。

## ✅ 實作內容

### 1. 前端功能 (`frontend/app.js`)

**檔案上傳與內容提取**

- 在 `handleBasicInfoSubmit()` 函數中實作檔案上傳邏輯
- 當用戶選擇檔案後，會自動：
  1. 上傳檔案到後端
  2. 讀取並解析檔案內容
  3. 將內容加入課程數據中

```javascript
// 處理檔案上傳
const fileInput = document.getElementById("upload-file");
if (fileInput.files.length > 0) {
  // 上傳檔案到後端
  const formData = new FormData();
  formData.append("file", uploadedFile);

  const uploadResponse = await fetch(`${API_BASE_URL}/upload`, {
    method: "POST",
    body: formData,
  });

  // 讀取檔案內容
  const contentResponse = await fetch(
    `${API_BASE_URL}/upload/read?file_path=${encodeURIComponent(
      uploadData.file_path
    )}`
  );
  courseData.upload_content = contentData.content;
}
```

### 2. 後端功能 (`backend/app/api/routes.py`)

**新增端點**

#### `/upload` - 檔案上傳

- 支援格式：`.pdf`, `.docx`, `.txt`
- 檔案大小限制：10MB
- 自動為檔案加上時間戳記避免重名

```python
@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    """上傳教案檔案"""
    # 檢查檔案類型與大小
    # 儲存檔案
    return {"status": "success", "file_path": file_path}
```

#### `/upload/read` - 讀取檔案內容

- 解析 PDF（使用 PyPDF2）
- 解析 Word 文檔（使用 python-docx）
- 讀取純文字檔案

```python
@router.get("/upload/read")
async def read_uploaded_file(file_path: str = Query(...)):
    """讀取上傳檔案的內容"""
    # 根據檔案類型解析內容
    return {"status": "success", "content": text_content}
```

### 3. Prompt 模板更新 (`backend/app/prompts/__init__.py`)

在教學理念生成的 prompt 中加入檔案內容變數：

```python
基本資訊：
- 課程標題：{title}
- 年級：{grade}
- 課程時長：{duration} 分鐘
- 學生人數：{student_count}
- 教室設備：{classroom_equipment}
{upload_content}  # 新增檔案內容變數
```

### 4. 後端邏輯整合 (`backend/app/api/routes.py`)

在 `generate_rationale()` 函數中處理檔案內容：

```python
# 處理上傳內容
if "upload_content" in basic_info and basic_info["upload_content"]:
    upload_text = f"\n\n上傳的教案內容：\n{basic_info['upload_content']}"
else:
    upload_text = ""

basic_info["upload_content"] = upload_text
prompt = service.replace_variables(prompt_template["content"], basic_info)
```

## 🔄 使用流程

1. **用戶上傳檔案**

   - 在步驟 1（基本資訊）選擇要上傳的檔案（.pdf, .docx, .txt）
   - 點擊「下一步：生成教學理念」

2. **系統自動處理**

   - 檔案上傳到後端 `uploads/` 目錄
   - 系統讀取並解析檔案內容
   - 將內容加入課程數據

3. **AI 生成**
   - AI 接收課程基本資訊 + 上傳的檔案內容
   - 根據完整資訊生成更精準的教學理念

## 📝 支援的檔案格式

| 格式      | 擴展名  | 解析工具    |
| --------- | ------- | ----------- |
| PDF       | `.pdf`  | PyPDF2      |
| Word 文檔 | `.docx` | python-docx |
| 純文字    | `.txt`  | Python 內建 |

## 🎯 實際效果

當用戶上傳教案檔案後：

- AI 能讀取並理解檔案內容
- 生成時會參考上傳的教案內容
- 生成的教學理念會更貼近實際需求
- 若未上傳檔案，系統會使用基本資訊生成

## 🚀 測試建議

1. 上傳一個 PDF 教案檔案
2. 查看瀏覽器控制台是否顯示「檔案內容已讀取」
3. 檢查生成的教學理念是否參考了上傳的內容

## 📦 已安裝依賴

- `python-docx` - Word 文檔解析（已在 requirements.txt）
- `PyPDF2` - PDF 解析（已在 requirements.txt）

## ✨ 注意事項

- 檔案大小限制：10MB
- 檔案會儲存在 `backend/uploads/` 目錄
- 檔案會自動加上時間戳記避免重名
- 若上傳失敗，系統會繼續使用基本資訊生成（不會中斷流程）

## 🔗 相關檔案

- `frontend/app.js` - 前端檔案上傳邏輯
- `backend/app/api/routes.py` - 後端檔案處理 API
- `backend/app/prompts/__init__.py` - Prompt 模板

---

**日期**: 2025-10-27  
**狀態**: ✅ 已完成並測試
