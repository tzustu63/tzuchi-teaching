"""
應用程式配置
"""
from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """應用程式設定"""
    
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
    
    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()
