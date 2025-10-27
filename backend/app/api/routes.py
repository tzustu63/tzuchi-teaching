"""
API 路由定義
"""
from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Query
from sqlalchemy.orm import Session
from typing import Optional, Dict, Any
import json
import os
from datetime import datetime
import PyPDF2
from docx import Document

from ..database import get_db
from ..services.openai_service import OpenAIService
from ..services.claude_service import ClaudeService
from ..services.encryption_service import EncryptionService
from ..models import PromptTemplate, CoursePlan, APIConfig, GammaGeneration
from ..prompts import get_prompt, get_all_prompts
from ..services.gamma_service import GammaService
from ..config import settings


router = APIRouter()


# ==================== API Key 管理 ====================

@router.get("/api-keys/status")
async def get_api_key_status():
    """檢查 API Key 狀態"""
    # TODO: 實作檢查邏輯
    return {"has_key": True}


@router.post("/api-keys/set")
async def set_api_key(
    api_key: str,
    db: Session = Depends(get_db)
):
    """設定 API Key"""
    encrypt_service = EncryptionService()
    
    try:
        # 驗證 API Key
        test_client = OpenAIService(api_key)
        # 可以做簡單的測試調用
        
        # 加密儲存
        encrypted_key = encrypt_service.encrypt(api_key)
        
        # 儲存到資料庫
        db_config = APIConfig(
            api_type="openai",
            encrypted_key=encrypted_key,
            is_valid=True
        )
        db.add(db_config)
        db.commit()
        
        return {"status": "success", "message": "API Key 已設定"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"API Key 設定失敗: {str(e)}")


# ==================== Prompt 管理 ====================

@router.get("/prompts")
async def list_prompts(db: Session = Depends(get_db)):
    """列出所有 prompt 模板"""
    # 從資料庫讀取自訂 prompt，如果沒有則返回預設
    prompts = {}
    for step_num in range(1, 7):
        db_prompt = db.query(PromptTemplate).filter_by(step_number=step_num).first()
        if db_prompt:
            prompts[step_num] = {
                "name": db_prompt.name,
                "type": db_prompt.type,
                "content": db_prompt.content,
                "variables": db_prompt.variables.split(",") if db_prompt.variables else []
            }
        else:
            prompts[step_num] = get_prompt(step_num)
    return prompts


@router.get("/prompts/{step_number}")
async def get_prompt_by_step(step_number: int, db: Session = Depends(get_db)):
    """獲取指定步驟的 prompt"""
    # 先查詢資料庫
    db_prompt = db.query(PromptTemplate).filter_by(step_number=step_number).first()
    if db_prompt:
        return {
            "name": db_prompt.name,
            "type": db_prompt.type,
            "content": db_prompt.content,
            "variables": db_prompt.variables.split(",") if db_prompt.variables else []
        }
    
    # 如果資料庫沒有，返回預設
    prompt = get_prompt(step_number)
    if not prompt:
        raise HTTPException(status_code=404, detail=f"步驟 {step_number} 的 prompt 不存在")
    return prompt


@router.put("/prompts/{step_number}")
async def update_prompt(
    step_number: int,
    request_data: Dict[str, Any],
    db: Session = Depends(get_db)
):
    """更新 prompt 模板"""
    try:
        db_prompt = db.query(PromptTemplate).filter_by(step_number=step_number).first()
        
        if db_prompt:
            # 更新現有記錄
            db_prompt.content = request_data.get("content", db_prompt.content)
            db_prompt.name = request_data.get("name", db_prompt.name)
        else:
            # 創建新記錄
            default_prompt = get_prompt(step_number)
            db_prompt = PromptTemplate(
                step_number=step_number,
                name=request_data.get("name", default_prompt.get("name", "")),
                type=request_data.get("type", default_prompt.get("type", "")),
                content=request_data.get("content", ""),
                variables=",".join(request_data.get("variables", []))
            )
            db.add(db_prompt)
        
        db.commit()
        return {"status": "success", "message": f"Prompt {step_number} 已更新"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"更新失敗: {str(e)}")


@router.post("/prompts/{step_number}/reset")
async def reset_prompt(step_number: int, db: Session = Depends(get_db)):
    """重置 prompt 為預設值"""
    try:
        default_prompt = get_prompt(step_number)
        if not default_prompt:
            raise HTTPException(status_code=404, detail=f"步驟 {step_number} 的預設 prompt 不存在")
        
        db_prompt = db.query(PromptTemplate).filter_by(step_number=step_number).first()
        
        if db_prompt:
            # 更新為預設值
            db_prompt.content = default_prompt.get("content", "")
            db_prompt.name = default_prompt.get("name", "")
            db_prompt.variables = ",".join(default_prompt.get("variables", []))
        else:
            # 創建預設記錄
            db_prompt = PromptTemplate(
                step_number=step_number,
                name=default_prompt.get("name", ""),
                type=default_prompt.get("type", ""),
                content=default_prompt.get("content", ""),
                variables=",".join(default_prompt.get("variables", []))
            )
            db.add(db_prompt)
        
        db.commit()
        return {"status": "success", "message": f"Prompt {step_number} 已重置為預設值"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"重置失敗: {str(e)}")


# ==================== 課程計劃生成 ====================

@router.post("/courses/generate-rationale")
async def generate_rationale(
    basic_info: Dict[str, Any],
    db: Session = Depends(get_db)
):
    """生成教學理念（步驟 1 → 2）"""
    try:
        # 獲取 AI 模型選擇
        ai_model = basic_info.get("ai_model", "openai")
        
        print(f"🔧 收到生成請求")
        print(f"  - AI 模型: {ai_model}")
        print(f"  - 課程標題: {basic_info.get('title')}")
        print(f"  - 年級: {basic_info.get('grade')}")
        print(f"  - 時長: {basic_info.get('duration')}")
        print(f"  - 學生人數: {basic_info.get('student_count')}")
        print(f"  - 教室設備: {basic_info.get('classroom_equipment')}")
        
        # 檢查是否有上傳的檔案內容
        if "upload_content" in basic_info and basic_info["upload_content"]:
            print(f"  - ✅ 包含上傳的檔案內容，長度: {len(basic_info['upload_content'])} 字元")
            print(f"  - 檔案內容預覽: {basic_info['upload_content'][:300]}...")
        else:
            print(f"  - ⚠️ 沒有上傳檔案內容")
        
        # 根據模型選擇獲取 API Key（優先使用前端傳入的 key，否則使用預設）
        if ai_model == "claude":
            api_key = basic_info.get("api_key") or settings.claude_api_key or os.getenv("CLAUDE_API_KEY")
            if not api_key:
                raise HTTPException(status_code=500, detail="未設定 Claude API Key")
            service = ClaudeService(api_key)
        else:
            api_key = basic_info.get("api_key") or settings.openai_api_key or os.getenv("OPENAI_API_KEY")
            if not api_key:
                raise HTTPException(status_code=500, detail="未設定 OpenAI API Key")
            service = OpenAIService(api_key)
        
        # 獲取 prompt 模板（優先從資料庫讀取）
        db_prompt = db.query(PromptTemplate).filter_by(step_number=1).first()
        if db_prompt:
            prompt_template = {
                "content": db_prompt.content,
                "name": db_prompt.name
            }
        else:
            prompt_template = get_prompt(1)
        
        # 處理上傳內容
        if "upload_content" in basic_info and basic_info["upload_content"]:
            upload_text = f"\n\n上傳的教案內容：\n{basic_info['upload_content']}"
        else:
            upload_text = ""
        
        # 替換變數（包括 upload_content）
        basic_info["upload_content"] = upload_text
        
        print(f"📝 開始組合 Prompt...")
        prompt = service.replace_variables(
            prompt_template["content"],
            basic_info
        )
        print(f"✅ Prompt 組合完成，長度: {len(prompt)} 字元")
        
        # 調用 AI API（使用前端選擇的子模型）
        ai_submodel = basic_info.get("ai_submodel", "gpt-4o" if ai_model == "openai" else "claude-sonnet-4-5-20250929")
        language = basic_info.get("language", "zh")
        print(f"🤖 開始調用 {ai_model} API 生成內容...")
        print(f"📡 使用子模型: {ai_submodel}")
        print(f"🌐 輸出語言: {language}")
        rationale = service.generate_content(prompt, model=ai_submodel, language=language)
        
        print(f"✅ 內容生成完成！")
        print(f"📊 生成的教學理念長度: {len(rationale)} 字元")
        
        return {
            "status": "success",
            "rationale": rationale
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"生成失敗: {str(e)}")


@router.post("/courses/generate-objectives")
async def generate_objectives(
    request_data: Dict[str, Any],
    db: Session = Depends(get_db)
):
    """生成學習目標（步驟 2 → 3）"""
    try:
        # 獲取 AI 模型選擇
        ai_model = request_data.get("ai_model", "openai")
        
        # 根據模型選擇獲取 API Key（優先使用前端傳入的 key，否則使用預設）
        if ai_model == "claude":
            api_key = request_data.get("api_key") or settings.claude_api_key or os.getenv("CLAUDE_API_KEY")
            if not api_key:
                raise HTTPException(status_code=500, detail="未設定 Claude API Key")
            service = ClaudeService(api_key)
        else:
            api_key = request_data.get("api_key") or settings.openai_api_key or os.getenv("OPENAI_API_KEY")
            if not api_key:
                raise HTTPException(status_code=500, detail="未設定 OpenAI API Key")
            service = OpenAIService(api_key)
        
        # 獲取 prompt 模板（優先從資料庫讀取）
        db_prompt = db.query(PromptTemplate).filter_by(step_number=2).first()
        if db_prompt:
            prompt_template = {
                "content": db_prompt.content,
                "name": db_prompt.name
            }
        else:
            prompt_template = get_prompt(2)
        
        # 替換變數
        prompt = service.replace_variables(
            prompt_template["content"],
            request_data
        )
        
        # 調用 API（使用前端選擇的子模型）
        ai_submodel = request_data.get("ai_submodel", "gpt-4o" if ai_model == "openai" else "claude-sonnet-4-5-20250929")
        language = request_data.get("language", "zh")
        print(f"📡 使用子模型: {ai_submodel}")
        print(f"🌐 輸出語言: {language}")
        objectives = service.generate_content(prompt, model=ai_submodel, language=language)
        
        return {
            "status": "success",
            "objectives": objectives
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"生成失敗: {str(e)}")


@router.post("/courses/generate-strategies")
async def generate_strategies(
    request_data: Dict[str, Any],
    db: Session = Depends(get_db)
):
    """生成教學策略（步驟 3 → 4）"""
    try:
        # 獲取 AI 模型選擇
        ai_model = request_data.get("ai_model", "openai")
        
        # 根據模型選擇獲取 API Key
        if ai_model == "claude":
            api_key = request_data.get("api_key") or settings.claude_api_key or os.getenv("CLAUDE_API_KEY")
            if not api_key:
                raise HTTPException(status_code=500, detail="未設定 Claude API Key")
            service = ClaudeService(api_key)
        else:
            api_key = request_data.get("api_key") or settings.openai_api_key or os.getenv("OPENAI_API_KEY")
            if not api_key:
                raise HTTPException(status_code=500, detail="未設定 OpenAI API Key")
            service = OpenAIService(api_key)
        
        # 獲取 prompt 模板（優先從資料庫讀取）
        db_prompt = db.query(PromptTemplate).filter_by(step_number=3).first()
        if db_prompt:
            prompt_template = {
                "content": db_prompt.content,
                "name": db_prompt.name
            }
        else:
            prompt_template = get_prompt(3)
        
        # 替換變數
        prompt = service.replace_variables(
            prompt_template["content"],
            request_data
        )
        
        # 調用 API（使用前端選擇的子模型）
        ai_submodel = request_data.get("ai_submodel", "gpt-4o" if ai_model == "openai" else "claude-sonnet-4-5-20250929")
        language = request_data.get("language", "zh")
        print(f"📡 使用子模型: {ai_submodel}")
        print(f"🌐 輸出語言: {language}")
        strategies = service.generate_content(prompt, model=ai_submodel, language=language)
        
        return {
            "status": "success",
            "strategies": strategies
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"生成失敗: {str(e)}")


@router.post("/courses/generate-flow")
async def generate_flow(
    request_data: Dict[str, Any],
    db: Session = Depends(get_db)
):
    """生成教學流程（步驟 4 → 5）"""
    try:
        # 獲取 AI 模型選擇
        ai_model = request_data.get("ai_model", "openai")
        
        # 根據模型選擇獲取 API Key
        if ai_model == "claude":
            api_key = request_data.get("api_key") or settings.claude_api_key or os.getenv("CLAUDE_API_KEY")
            if not api_key:
                raise HTTPException(status_code=500, detail="未設定 Claude API Key")
            service = ClaudeService(api_key)
        else:
            api_key = request_data.get("api_key") or settings.openai_api_key or os.getenv("OPENAI_API_KEY")
            if not api_key:
                raise HTTPException(status_code=500, detail="未設定 OpenAI API Key")
            service = OpenAIService(api_key)
        
        # 獲取 prompt 模板（優先從資料庫讀取）
        db_prompt = db.query(PromptTemplate).filter_by(step_number=4).first()
        if db_prompt:
            prompt_template = {
                "content": db_prompt.content,
                "name": db_prompt.name
            }
        else:
            prompt_template = get_prompt(4)
        
        # 替換變數
        prompt = service.replace_variables(
            prompt_template["content"],
            request_data
        )
        
        # 調用 API（使用前端選擇的子模型）
        ai_submodel = request_data.get("ai_submodel", "gpt-4o" if ai_model == "openai" else "claude-sonnet-4-5-20250929")
        language = request_data.get("language", "zh")
        print(f"📡 使用子模型: {ai_submodel}")
        print(f"🌐 輸出語言: {language}")
        flow = service.generate_content(prompt, model=ai_submodel, language=language)
        
        return {
            "status": "success",
            "flow": flow
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"生成失敗: {str(e)}")


@router.post("/courses/generate-worksheet")
async def generate_worksheet(
    request_data: Dict[str, Any],
    db: Session = Depends(get_db)
):
    """生成學習單（步驟 7）"""
    try:
        # 獲取 AI 模型選擇
        ai_model = request_data.get("ai_model", "openai")
        
        # 根據模型選擇獲取 API Key
        if ai_model == "claude":
            api_key = request_data.get("api_key") or settings.claude_api_key or os.getenv("CLAUDE_API_KEY")
            if not api_key:
                raise HTTPException(status_code=500, detail="未設定 Claude API Key")
            service = ClaudeService(api_key)
        else:
            api_key = request_data.get("api_key") or settings.openai_api_key or os.getenv("OPENAI_API_KEY")
            if not api_key:
                raise HTTPException(status_code=500, detail="未設定 OpenAI API Key")
            service = OpenAIService(api_key)
        
        # 獲取 prompt 模板（優先從資料庫讀取）
        db_prompt = db.query(PromptTemplate).filter_by(step_number=6).first()
        if db_prompt:
            prompt_template = {
                "content": db_prompt.content,
                "name": db_prompt.name
            }
        else:
            prompt_template = get_prompt(6)
        
        # 替換變數
        prompt = service.replace_variables(
            prompt_template["content"],
            request_data
        )
        
        # 調用 API（使用前端選擇的子模型）
        ai_submodel = request_data.get("ai_submodel", "gpt-4o" if ai_model == "openai" else "claude-sonnet-4-5-20250929")
        language = request_data.get("language", "zh")
        print(f"📡 使用子模型: {ai_submodel}")
        print(f"🌐 輸出語言: {language}")
        worksheet = service.generate_content(prompt, model=ai_submodel, language=language)
        
        return {
            "status": "success",
            "worksheet": worksheet
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"生成失敗: {str(e)}")


# ==================== 檔案上傳 ====================

@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    """上傳教案檔案"""
    try:
        # 檢查檔案類型
        allowed_extensions = ['.docx', '.pdf', '.txt']
        file_ext = os.path.splitext(file.filename)[1].lower()
        
        if file_ext not in allowed_extensions:
            raise HTTPException(
                status_code=400, 
                detail=f"不支援的檔案格式。支援格式: {', '.join(allowed_extensions)}"
            )
        
        # 檢查檔案大小（10MB）
        contents = await file.read()
        if len(contents) > 10 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="檔案大小超過 10MB")
        
        # 創建上傳目錄
        upload_dir = "uploads"
        if not os.path.exists(upload_dir):
            os.makedirs(upload_dir)
        
        # 生成檔案名稱
        timestamp = int(datetime.now().timestamp())
        safe_filename = f"{timestamp}_{file.filename}"
        file_path = os.path.join(upload_dir, safe_filename)
        
        # 儲存檔案
        with open(file_path, "wb") as f:
            f.write(contents)
        
        return {
            "status": "success",
            "file_path": file_path,
            "filename": file.filename,
            "size": len(contents)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"上傳失敗: {str(e)}")


@router.get("/upload/read")
async def read_uploaded_file(file_path: str = Query(...)):
    """讀取上傳檔案的內容"""
    try:
        # 讀取檔案
        file_ext = os.path.splitext(file_path)[1].lower()
        text_content = ""
        
        if file_ext == ".pdf":
            # 讀取 PDF
            with open(file_path, "rb") as f:
                pdf_reader = PyPDF2.PdfReader(f)
                for page in pdf_reader.pages:
                    text_content += page.extract_text() + "\n"
        
        elif file_ext == ".docx":
            # 讀取 Word 文檔
            doc = Document(file_path)
            for paragraph in doc.paragraphs:
                text_content += paragraph.text + "\n"
        
        elif file_ext == ".txt":
            # 讀取純文字
            with open(file_path, "r", encoding="utf-8") as f:
                text_content = f.read()
        
        else:
            raise HTTPException(status_code=400, detail="不支援的檔案格式")
        
        return {
            "status": "success",
            "content": text_content.strip(),
            "file_path": file_path
        }
        
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="檔案不存在")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"讀取檔案失敗: {str(e)}")


# ==================== PPT 和學習單生成 ====================

@router.post("/courses/generate-ppt")
async def generate_ppt(
    request_data: Dict[str, Any],
    db: Session = Depends(get_db)
):
    """生成 PPT（使用 Gamma API）"""
    try:
        print(f"📊 收到 PPT 生成請求")
        
        # 使用 Gamma API Key（從設定或環境變數讀取）
        gamma_api_key = settings.gamma_api_key or os.getenv("GAMMA_API_KEY") or "sk-gamma-GlUo8DS1fqjaDlakxQuk3NFIkwgKTRYdkAOZTTb0A8"
        
        if not gamma_api_key:
            raise HTTPException(status_code=500, detail="未設定 Gamma API Key")
        
        gamma_service = GammaService(gamma_api_key)
        
        # 準備課程內容
        title = request_data.get("title", "課程簡報")
        language = request_data.get("language", "zh-tw")
        num_cards = request_data.get("num_cards", 10)
        
        # 收集額外的 Gamma 設定
        text_amount = request_data.get("text_amount", "medium")
        tone = request_data.get("tone", "")
        audience = request_data.get("audience", "")
        image_model = request_data.get("image_model", "flux-1-pro")
        image_style = request_data.get("image_style", "photorealistic")
        
        content = {
            "basic_info": request_data.get("basic_info", {}),
            "rationale": request_data.get("rationale", ""),
            "objectives": request_data.get("objectives", ""),
            "strategies": request_data.get("strategies", ""),
            "teaching_flow": request_data.get("teaching_flow", "")
        }
        
        print(f"📝 準備生成簡報...")
        print(f"  - 標題: {title}")
        print(f"  - 語言: {language}")
        print(f"  - 卡牌數量: {num_cards}")
        print(f"  - 文字量: {text_amount}")
        print(f"  - 圖片模型: {image_model}")
        print(f"  - 圖片風格: {image_style}")
        
        # 生成 Gamma 簡報
        result = gamma_service.generate_presentation(
            title=title,
            content=content,
            language=language,
            num_cards=num_cards,
            text_amount=text_amount,
            tone=tone,
            audience=audience,
            image_model=image_model,
            image_style=image_style
        )
        
        # 記錄到資料庫
        gamma_gen = GammaGeneration(
            generation_id=result["generation_id"],
            status=result["status"],
            gamma_url=result.get("gamma_url")
        )
        db.add(gamma_gen)
        db.commit()
        
        print(f"✅ PPT 生成請求已提交")
        
        return {
            "status": "success",
            "generation_id": result["generation_id"],
            "gamma_url": result.get("gamma_url"),
            "status_info": result["status"],
            "message": "PPT 生成中，請稍後檢查狀態"
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ PPT 生成失敗: {str(e)}")
        raise HTTPException(status_code=500, detail=f"生成 PPT 失敗: {str(e)}")


@router.get("/courses/gamma-status/{generation_id}")
async def check_gamma_status(
    generation_id: str,
    db: Session = Depends(get_db)
):
    """檢查 Gamma 生成狀態"""
    try:
        # 使用 Gamma API Key（從設定或環境變數讀取）
        gamma_api_key = settings.gamma_api_key or os.getenv("GAMMA_API_KEY") or "sk-gamma-GlUo8DS1fqjaDlakxQuk3NFIkwgKTRYdkAOZTTb0A8"
        
        if not gamma_api_key:
            raise HTTPException(status_code=500, detail="未設定 Gamma API Key")
        
        gamma_service = GammaService(gamma_api_key)
        
        status = gamma_service.check_generation_status(generation_id)
        
        # 更新資料庫記錄
        gamma_gen = db.query(GammaGeneration).filter_by(generation_id=generation_id).first()
        if gamma_gen:
            gamma_gen.status = status.get("status", "unknown")
            gamma_gen.gamma_url = status.get("gammaUrl")
            db.commit()
        
        return {
            "status": "success",
            "generation_status": status.get("status"),
            "gamma_url": status.get("gammaUrl"),
            "generation_info": status
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ 查詢 Gamma 狀態失敗: {str(e)}")
        raise HTTPException(status_code=500, detail=f"查詢狀態失敗: {str(e)}")


@router.post("/courses/gamma-wait/{generation_id}")
async def wait_for_gamma_completion(
    generation_id: str,
    timeout: int = 300,
    db: Session = Depends(get_db)
):
    """等待 Gamma 生成完成"""
    try:
        # 使用 Gamma API Key（從設定或環境變數讀取）
        gamma_api_key = settings.gamma_api_key or os.getenv("GAMMA_API_KEY") or "sk-gamma-GlUo8DS1fqjaDlakxQuk3NFIkwgKTRYdkAOZTTb0A8"
        
        if not gamma_api_key:
            raise HTTPException(status_code=500, detail="未設定 Gamma API Key")
        
        gamma_service = GammaService(gamma_api_key)
        
        # 等待生成完成
        result = gamma_service.wait_for_completion(generation_id, timeout=timeout)
        
        # 更新資料庫記錄
        gamma_gen = db.query(GammaGeneration).filter_by(generation_id=generation_id).first()
        if gamma_gen:
            gamma_gen.status = result.get("status")
            gamma_gen.gamma_url = result.get("gamma_url")
            db.commit()
        
        return {
            "status": "success",
            "generation_id": generation_id,
            "result": result
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ 等待 Gamma 生成完成失敗: {str(e)}")
        raise HTTPException(status_code=500, detail=f"等待生成完成失敗: {str(e)}")


@router.post("/courses/generate-worksheet")
async def generate_worksheet(
    request_data: Dict[str, Any],
    db: Session = Depends(get_db)
):
    """生成學習單（使用 OpenAI API）"""
    try:
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise HTTPException(status_code=500, detail="未設定 OpenAI API Key")
        
        openai_service = OpenAIService(api_key)
        
        # 構建學習單 prompt
        title = request_data.get("title", "學習單")
        content = f"""
請為以下課程生成一份學習單：

課程名稱：{title}
教學目標：{request_data.get('objectives', '')}
教學內容：{request_data.get('teaching_flow', '')}

請生成包含以下內容的學習單：
1. 學習任務說明
2. 思考問題
3. 實踐活動
4. 反思總結

請使用結構清晰、學生容易理解的格式。
"""
        
        worksheet_content = openai_service.generate_content(content, model="gpt-5")
        
        return {
            "status": "success",
            "worksheet": worksheet_content
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"生成學習單失敗: {str(e)}")


# ==================== 課程計劃管理 ====================

@router.post("/course-plans/save")
async def save_course_plan(
    request_data: Dict[str, Any],
    db: Session = Depends(get_db)
):
    """保存課程計劃"""
    try:
        course_plan = CoursePlan(
            title=request_data.get("title"),
            grade=request_data.get("grade"),
            duration=request_data.get("duration"),
            student_count=request_data.get("student_count"),
            classroom_equipment=request_data.get("classroom_equipment"),
            rationale=request_data.get("rationale"),
            objectives=request_data.get("objectives"),
            strategies=request_data.get("strategies"),
            teaching_flow=request_data.get("teaching_flow"),
            worksheet=request_data.get("worksheet"),
            ai_model=request_data.get("ai_model"),
            ai_submodel=request_data.get("ai_submodel"),
            language=request_data.get("language", "zh"),
            uploaded_file_content=request_data.get("upload_content"),
            gamma_url=request_data.get("gamma_url"),
            status="completed"
        )
        
        db.add(course_plan)
        db.commit()
        db.refresh(course_plan)
        
        return {
            "status": "success",
            "course_plan_id": course_plan.id,
            "message": "課程計劃已保存"
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"保存失敗: {str(e)}")


@router.get("/course-plans")
async def list_course_plans(
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db)
):
    """列出所有課程計劃"""
    try:
        course_plans = db.query(CoursePlan).order_by(CoursePlan.created_at.desc()).offset(skip).limit(limit).all()
        
        result = []
        for plan in course_plans:
            result.append({
                "id": plan.id,
                "title": plan.title,
                "grade": plan.grade,
                "duration": plan.duration,
                "created_at": plan.created_at.isoformat() if plan.created_at else None,
                "updated_at": plan.updated_at.isoformat() if plan.updated_at else None,
                "status": plan.status
            })
        
        return {
            "status": "success",
            "total": len(result),
            "course_plans": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"查詢失敗: {str(e)}")


@router.get("/course-plans/{plan_id}")
async def get_course_plan(
    plan_id: int,
    db: Session = Depends(get_db)
):
    """獲取課程計劃詳情"""
    try:
        course_plan = db.query(CoursePlan).filter(CoursePlan.id == plan_id).first()
        
        if not course_plan:
            raise HTTPException(status_code=404, detail="課程計劃不存在")
        
        return {
            "status": "success",
            "course_plan": {
                "id": course_plan.id,
                "title": course_plan.title,
                "grade": course_plan.grade,
                "duration": course_plan.duration,
                "student_count": course_plan.student_count,
                "classroom_equipment": course_plan.classroom_equipment,
                "rationale": course_plan.rationale,
                "objectives": course_plan.objectives,
                "strategies": course_plan.strategies,
                "teaching_flow": course_plan.teaching_flow,
                "worksheet": course_plan.worksheet,
                "ai_model": course_plan.ai_model,
                "ai_submodel": course_plan.ai_submodel,
                "language": course_plan.language,
                "gamma_url": course_plan.gamma_url,
                "created_at": course_plan.created_at.isoformat() if course_plan.created_at else None,
                "updated_at": course_plan.updated_at.isoformat() if course_plan.updated_at else None,
                "status": course_plan.status
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"查詢失敗: {str(e)}")


@router.delete("/course-plans/{plan_id}")
async def delete_course_plan(
    plan_id: int,
    db: Session = Depends(get_db)
):
    """刪除課程計劃"""
    try:
        course_plan = db.query(CoursePlan).filter(CoursePlan.id == plan_id).first()
        
        if not course_plan:
            raise HTTPException(status_code=404, detail="課程計劃不存在")
        
        db.delete(course_plan)
        db.commit()
        
        return {
            "status": "success",
            "message": "課程計劃已刪除"
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"刪除失敗: {str(e)}")
