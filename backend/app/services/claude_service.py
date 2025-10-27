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
        model: str = "claude-sonnet-4-5-20250929",  # Claude Sonnet 4.5 (最新版本)
        max_tokens: Optional[int] = None,
        temperature: float = 0.7,
        language: str = "zh"
    ) -> str:
        """
        生成內容
        
        Args:
            prompt: 輸入的提示詞
            model: 使用的模型
            max_tokens: 最大令牌數（預設 8192，約 6000-7000 字）
            temperature: 溫度參數
            language: 輸出語言 ('zh' 或 'en')
            
        Returns:
            生成的文字內容
        """
        try:
            # 根據語言調整系統提示
            if language == "en":
                system_message = "You are an experienced curriculum design expert specializing in lesson planning. IMPORTANT: You must generate ALL content in English only. Use English for all text, headings, explanations, and examples. Do not use Chinese characters."
            else:
                system_message = "你是一位資深的教學設計專家，專精於課程計劃的撰寫。重要：請使用繁體中文生成所有內容，包括標題、說明和範例。請生成完整且詳細的內容。"
            
            params = {
                "model": model,
                "max_tokens": max_tokens if max_tokens else 8192,  # 增加到 8192 tokens
                "temperature": temperature,
                "system": system_message,
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
                print(f"🔍 Claude API 響應結構: {type(response.content)}")
                print(f"🔍 響應內容類型: {type(response.content[0]) if response.content else 'None'}")
                
                # response.content 是一個列表，包含 ContentBlock 對象
                text_content = ""
                for block in response.content:
                    print(f"🔍 處理內容區塊: {type(block)}")
                    # 檢查 block 的屬性
                    if hasattr(block, 'text'):
                        text_content += block.text
                    elif hasattr(block, 'content') and hasattr(block.content[0], 'text'):
                        # 處理嵌套結構
                        text_content += block.content[0].text
                    else:
                        print(f"⚠️ 無法提取文本，block 屬性: {dir(block)}")
                
                result = text_content.strip()
                
                # 記錄生成的內容長度
                print(f"📊 Claude 生成的內容長度: {len(result)} 字元")
                if len(result) > 1000:
                    print(f"📝 內容預覽（前500字元）: {result[:500]}...")
                    print(f"📝 內容結尾（後500字元）: ...{result[-500:]}")
                else:
                    print(f"📝 完整內容: {result}")
                
                return result
            return ""
        
        except Exception as e:
            print(f"❌ Claude API 錯誤詳情: {type(e).__name__}: {str(e)}")
            import traceback
            traceback.print_exc()
            raise Exception(f"Claude API 調用失敗: {type(e).__name__}: {str(e)}")
    
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
