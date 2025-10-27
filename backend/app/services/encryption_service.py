"""
API Key 加密服務
"""
from cryptography.fernet import Fernet
import os
import base64
from typing import Optional


class EncryptionService:
    """加密服務，用於安全儲存敏感資訊"""
    
    @staticmethod
    def generate_master_key() -> str:
        """生成主加密金鑰"""
        return Fernet.generate_key().decode()
    
    def __init__(self, master_key: Optional[str] = None):
        """
        初始化加密服務
        
        Args:
            master_key: 主加密金鑰（從環境變數獲取）
        """
        if master_key is None:
            master_key = os.getenv("MASTER_ENCRYPTION_KEY")
        
        if not master_key:
            raise ValueError("未設定 MASTER_ENCRYPTION_KEY 環境變數")
        
        # 確保 key 是 32 bytes
        key = master_key.encode()[:32]
        key = base64.urlsafe_b64encode(key)
        self.cipher = Fernet(key)
    
    def encrypt(self, plaintext: str) -> str:
        """加密文字"""
        return self.cipher.encrypt(plaintext.encode()).decode()
    
    def decrypt(self, ciphertext: str) -> str:
        """解密文字"""
        try:
            return self.cipher.decrypt(ciphertext.encode()).decode()
        except Exception as e:
            raise Exception(f"解密失敗: {str(e)}")
