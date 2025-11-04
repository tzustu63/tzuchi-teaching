"""
應用程式配置
"""
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional
import os


class Settings(BaseSettings):
    """應用程式設定
    
    注意：pydantic_settings 會自動將欄位名稱轉換為大寫環境變數名稱
    例如：openai_api_key -> OPENAI_API_KEY
    """
    
    # OpenAI
    openai_api_key: Optional[str] = None
    
    # Claude
    claude_api_key: Optional[str] = None
    
    # Gamma
    gamma_api_key: Optional[str] = None
    
    # Database
    database_url: str = "sqlite:///./course_planner.db"
    
    # DigitalOcean Spaces
    spaces_access_key: Optional[str] = None
    spaces_secret_key: Optional[str] = None
    spaces_region: str = "nyc3"
    spaces_endpoint: str = "https://nyc3.digitaloceanspaces.com"
    
    # Encryption
    master_encryption_key: str = "default_key_change_in_production_32bytes!!"
    
    # App
    environment: str = "development"
    debug: bool = True
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        # 允許從環境變數讀取，即使沒有 .env 檔案
        env_ignore_empty=True,
        # 明確指定環境變數名稱對應（pydantic v2 的新方式）
        # 但實際上預設行為已經會自動轉換，所以這裡不需要
    )


# 建立設定實例
settings = Settings()

# 備用方案：如果 pydantic_settings 沒有讀取到，直接從 os.getenv 讀取
# 這確保在 DigitalOcean 等環境中也能正確讀取環境變數
if not settings.openai_api_key:
    settings.openai_api_key = os.getenv("OPENAI_API_KEY")
if not settings.claude_api_key:
    settings.claude_api_key = os.getenv("CLAUDE_API_KEY")
if not settings.gamma_api_key:
    settings.gamma_api_key = os.getenv("GAMMA_API_KEY")
