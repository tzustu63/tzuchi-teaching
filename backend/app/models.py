"""
資料庫模型定義
"""
from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.sql import func
from datetime import datetime

Base = declarative_base()


class PromptTemplate(Base):
    """Prompt 模板表"""
    __tablename__ = "prompt_templates"
    
    id = Column(Integer, primary_key=True, index=True)
    step_number = Column(Integer, nullable=False, comment="步驟編號 (1-7)")
    name = Column(String(100), nullable=False, comment="Prompt 名稱")
    type = Column(String(50), nullable=False, comment="Prompt 類型")
    content = Column(Text, nullable=False, comment="Prompt 內容")
    variables = Column(Text, comment="可用變數 JSON")
    is_active = Column(Boolean, default=True, comment="是否啟用")
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())


class CoursePlan(Base):
    """課程計劃表"""
    __tablename__ = "course_plans"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(50), comment="用戶 ID（未來擴展）")
    title = Column(String(200), nullable=False, comment="課程標題")
    grade = Column(String(50), comment="年級")
    duration = Column(Integer, comment="課程時長（分鐘）")
    student_count = Column(Integer, comment="學生人數")
    classroom_equipment = Column(Text, comment="教室設備")
    
    # 各階段生成內容
    rationale = Column(Text, comment="教學理念")
    objectives = Column(Text, comment="學習目標")
    strategies = Column(Text, comment="教學策略")
    teaching_flow = Column(Text, comment="教學流程")
    worksheet = Column(Text, comment="學習單")
    
    # 生成設定
    ai_model = Column(String(50), comment="使用的 AI 模型")
    ai_submodel = Column(String(100), comment="使用的子模型")
    language = Column(String(10), default="zh", comment="生成語言")
    
    # 檔案路徑
    uploaded_file_path = Column(String(500), comment="上傳的教案檔案路徑")
    uploaded_file_content = Column(Text, comment="上傳檔案的文字內容")
    gamma_url = Column(String(500), comment="Gamma PPT URL")
    
    status = Column(String(50), default="draft", comment="狀態: draft, generating, completed")
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())


class APIConfig(Base):
    """API Key 配置表（加密儲存）"""
    __tablename__ = "api_configs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(50), comment="用戶 ID")
    api_type = Column(String(50), nullable=False, comment="API 類型: openai, gamma")
    encrypted_key = Column(Text, nullable=False, comment="加密的 API Key")
    is_valid = Column(Boolean, default=True, comment="是否有效")
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())


class GammaGeneration(Base):
    """Gamma 生成記錄表"""
    __tablename__ = "gamma_generations"
    
    id = Column(Integer, primary_key=True, index=True)
    course_plan_id = Column(Integer, ForeignKey("course_plans.id"), comment="課程計劃 ID")
    generation_id = Column(String(200), nullable=False, comment="Gamma 生成 ID")
    gamma_url = Column(String(500), comment="Gamma 分享 URL")
    status = Column(String(50), default="pending", comment="狀態: pending, processing, completed, failed")
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
