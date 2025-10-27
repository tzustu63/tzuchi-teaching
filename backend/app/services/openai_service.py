"""
OpenAI API 整合服務
"""
import os
from openai import OpenAI
from typing import Optional, Dict, Any
import json


class OpenAIService:
    """OpenAI API 服務封裝"""
    
    def __init__(self, api_key: str):
        """初始化 OpenAI 客戶端"""
        self.client = OpenAI(api_key=api_key)
    
    def generate_content(
        self,
        prompt: str,
        model: str = "gpt-4o",  # 使用最新的 GPT-4o 模型
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
            # gpt-5 模型使用不同的參數
            params = {
                "model": model,
                "messages": [
                    {"role": "system", "content": "你是一位資深的教學設計專家，專精於課程計劃的撰寫。"},
                    {"role": "user", "content": prompt}
                ],
                "temperature": temperature
            }
            
            # gpt-5 使用 max_completion_tokens，其他模型使用 max_tokens
            # 只有在提供 max_tokens 時才設置，否則不設限制
            if max_tokens is not None:
                if "gpt-5" in model.lower():
                    params["max_completion_tokens"] = max_tokens
                else:
                    params["max_tokens"] = max_tokens
            
            response = self.client.chat.completions.create(**params)
            
            return response.choices[0].message.content.strip()
        
        except Exception as e:
            raise Exception(f"OpenAI API 調用失敗: {str(e)}")
    
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
