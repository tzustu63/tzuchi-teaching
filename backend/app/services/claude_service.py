"""
Claude API 整合服務
"""
import os
import anthropic
from typing import Optional, Dict, Any
import json


class ClaudeService:
    """Claude API 服務封裝"""
    
    def __init__(self, api_key: str):
        """初始化 Claude 客戶端"""
        self.client = anthropic.Anthropic(api_key=api_key)
    
    def generate_content(
        self,
        prompt: str,
        model: str = "claude-sonnet-4-5",  # Claude Sonnet 4.5 (最新版本)
        max_tokens: Optional[int] = None,
        temperature: float = 0.7
    ) -> str:
        """
        生成內容
        
        Args:
            prompt: 輸入的提示詞
            model: 使用的模型
            max_tokens: 最大令牌數（None 表示無限制，讓模型自己決定）
            temperature: 溫度參數
            
        Returns:
            生成的文字內容
        """
        try:
            params = {
                "model": model,
                "max_tokens": max_tokens if max_tokens else 4096,
                "temperature": temperature,
                "system": "你是一位資深的教學設計專家，專精於課程計劃的撰寫。",
                "messages": [
                    {
                        "role": "user",
                        "content": prompt
                    }
                ]
            }
            
            response = self.client.messages.create(**params)
            
            # 提取生成的內容
            if response.content:
                # response.content 是一個列表，包含 ContentBlock 對象
                text_content = ""
                for block in response.content:
                    if hasattr(block, 'text'):
                        text_content += block.text
                return text_content.strip()
            return ""
        
        except Exception as e:
            raise Exception(f"Claude API 調用失敗: {str(e)}")
    
    def replace_variables(self, template: str, variables: Dict[str, Any]) -> str:
        """
        替換模板中的變數
        
        Args:
            template: 包含變數的模板
            variables: 變數字典
            
        Returns:
            替換後的內容
        """
        result = template
        for key, value in variables.items():
            placeholder = "{" + key + "}"
            if isinstance(value, (dict, list)):
                value = json.dumps(value, ensure_ascii=False, indent=2)
            result = result.replace(placeholder, str(value))
        return result
