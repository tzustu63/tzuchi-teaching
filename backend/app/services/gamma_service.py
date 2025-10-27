"""
Gamma API 服務
用於生成 PPT
"""
import requests
from typing import Dict, Any, Optional
import time


class GammaService:
    """Gamma API 服務"""
    
    GAMMA_API_BASE = "https://public-api.gamma.app/v0.2"
    
    def __init__(self, api_key: str):
        """
        初始化 Gamma 服務
        
        Args:
            api_key: Gamma API Key
        """
        self.api_key = api_key
        self.headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
    
    def generate_presentation(
        self, 
        title: str,
        content: Dict[str, Any],
        language: str = "zh-TW"
    ) -> Dict[str, Any]:
        """
        生成 Gamma 簡報
        
        Args:
            title: 簡報標題
            content: 課程內容（包含教學理念、目標、策略、流程等）
            language: 輸出語言（預設：繁體中文）
        
        Returns:
            Dict: {
                "generation_id": str,
                "status": str,
                "gamma_url": Optional[str]
            }
        """
        try:
            # 構建簡報內容
            presentation_content = self._build_presentation_content(title, content)
            
            # 準備請求數據
            payload = {
                "textOptions": {
                    "language": language
                },
                "imageOptions": {
                    "model": "default"
                },
                "content": presentation_content
            }
            
            # 發送生成請求
            response = requests.post(
                f"{self.GAMMA_API_BASE}/generations",
                headers=self.headers,
                json=payload,
                timeout=60
            )
            
            response.raise_for_status()
            result = response.json()
            
            return {
                "generation_id": result.get("id"),
                "status": result.get("status", "pending"),
                "gamma_url": result.get("gamma_url")
            }
            
        except requests.exceptions.RequestException as e:
            raise Exception(f"Gamma API 請求失敗: {str(e)}")
    
    def check_generation_status(self, generation_id: str) -> Dict[str, Any]:
        """
        檢查生成狀態
        
        Args:
            generation_id: 生成 ID
        
        Returns:
            Dict: 狀態資訊
        """
        try:
            response = requests.get(
                f"{self.GAMMA_API_BASE}/generations/{generation_id}",
                headers=self.headers,
                timeout=30
            )
            
            response.raise_for_status()
            return response.json()
            
        except requests.exceptions.RequestException as e:
            raise Exception(f"查詢生成狀態失敗: {str(e)}")
    
    def _build_presentation_content(self, title: str, content: Dict[str, Any]) -> str:
        """
        構建簡報內容
        
        Args:
            title: 課程標題
            content: 課程內容
        
        Returns:
            str: 格式化的簡報內容
        """
        parts = []
        
        # 標題
        parts.append(f"# {title}")
        
        # 基本資訊
        if content.get("basic_info"):
            basic_info = content["basic_info"]
            parts.append(f"\n## 課程資訊")
            parts.append(f"- 年級：{basic_info.get('grade', 'N/A')}")
            parts.append(f"- 時長：{basic_info.get('duration', 'N/A')} 分鐘")
            parts.append(f"- 學生人數：{basic_info.get('student_count', 'N/A')} 人")
        
        # 教學理念
        if content.get("rationale"):
            parts.append(f"\n## 教學理念")
            parts.append(content["rationale"])
        
        # 學習目標
        if content.get("objectives"):
            parts.append(f"\n## 學習目標")
            objectives = content["objectives"]
            if isinstance(objectives, list):
                for idx, obj in enumerate(objectives, 1):
                    parts.append(f"{idx}. {obj}")
            else:
                parts.append(str(objectives))
        
        # 教學策略
        if content.get("strategies"):
            parts.append(f"\n## 教學策略")
            strategies = content["strategies"]
            if isinstance(strategies, list):
                for idx, strategy in enumerate(strategies, 1):
                    parts.append(f"{idx}. {strategy}")
            else:
                parts.append(str(strategies))
        
        # 教學流程
        if content.get("teaching_flow"):
            parts.append(f"\n## 教學流程")
            flow = content["teaching_flow"]
            if isinstance(flow, list):
                for idx, step in enumerate(flow, 1):
                    parts.append(f"{idx}. {step}")
            else:
                parts.append(str(flow))
        
        return "\n".join(parts)
    
    def wait_for_completion(self, generation_id: str, timeout: int = 300) -> Dict[str, Any]:
        """
        等待生成完成
        
        Args:
            generation_id: 生成 ID
            timeout: 超時時間（秒）
        
        Returns:
            Dict: 完成狀態
        """
        start_time = time.time()
        
        while time.time() - start_time < timeout:
            status = self.check_generation_status(generation_id)
            
            if status.get("status") == "completed":
                return {
                    "generation_id": generation_id,
                    "status": "completed",
                    "gamma_url": status.get("gamma_url")
                }
            elif status.get("status") in ["failed", "error"]:
                return {
                    "generation_id": generation_id,
                    "status": "failed",
                    "error": status.get("error")
                }
            
            time.sleep(5)  # 每 5 秒檢查一次
        
        return {
            "generation_id": generation_id,
            "status": "timeout",
            "error": "生成超時"
        }
