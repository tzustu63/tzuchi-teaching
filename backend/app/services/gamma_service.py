"""
Gamma API 服務
用於生成 PPT
"""
import requests
from typing import Dict, Any, Optional, List
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
            "X-API-KEY": api_key,
            "Content-Type": "application/json",
            "accept": "application/json"
        }
    
    def generate_presentation(
        self, 
        title: str,
        content: Dict[str, Any],
        language: str = "zh-tw",
        num_cards: int = 10,
        text_amount: str = "medium",
        tone: str = "",
        audience: str = "",
        image_model: str = "flux-1-pro",
        image_style: str = "photorealistic"
    ) -> Dict[str, Any]:
        """
        生成 Gamma 簡報
        
        Args:
            title: 簡報標題
            content: 課程內容（包含教學理念、目標、策略、流程等）
            language: 輸出語言（預設：zh-tw 繁體中文）
            num_cards: 卡牌數量（預設：10）
            text_amount: 文字量（brief, medium, detailed, extensive）
            tone: 語調
            audience: 觀眾/目標群體
            image_model: 圖片模型
            image_style: 圖片風格
        
        Returns:
            Dict: {
                "generation_id": str,
                "status": str,
                "gamma_url": Optional[str]
            }
        """
        try:
            # 構建簡報內容 - 使用 Gamma 要求的格式
            input_text = self._build_gamma_content(title, content)
            
            # 準備 textOptions
            text_options = {
                "amount": text_amount,
                "language": language
            }
            
            # 添加 tone
            if tone:
                text_options["tone"] = tone
            
            # 添加 audience
            if audience:
                text_options["audience"] = audience
            
            # 準備請求數據 - 根據 Gamma API v0.2 文檔
            payload = {
                "inputText": input_text,
                "textMode": "generate",
                "format": "presentation",
                "numCards": num_cards,
                "cardSplit": "auto",
                "textOptions": text_options,
                "imageOptions": {
                    "source": "aiGenerated",
                    "model": image_model,
                    "style": image_style
                }
            }
            
            print(f"📤 發送 Gamma API 請求...")
            print(f"  - 語言: {language}")
            print(f"  - 卡牌數量: {num_cards}")
            print(f"  - 輸入文字長度: {len(input_text)} 字元")
            
            # 記錄前500字元用於除錯
            if len(input_text) > 500:
                print(f"  - 內容預覽（前500字元）: {input_text[:500]}...")
            else:
                print(f"  - 完整內容: {input_text}")
            
            # 發送生成請求
            response = requests.post(
                f"{self.GAMMA_API_BASE}/generations",
                headers=self.headers,
                json=payload,
                timeout=60
            )
            
            response.raise_for_status()
            result = response.json()
            
            print(f"✅ Gamma API 回應成功")
            print(f"  - Generation ID: {result.get('generationId')}")
            
            return {
                "generation_id": result.get("generationId"),
                "status": "pending",
                "gamma_url": None
            }
            
        except requests.exceptions.HTTPError as e:
            error_detail = ""
            try:
                error_detail = e.response.json()
                print(f"❌ HTTP 錯誤: {error_detail}")
            except:
                error_detail = str(e)
            raise Exception(f"Gamma API 請求失敗: {error_detail}")
        except requests.exceptions.RequestException as e:
            raise Exception(f"Gamma API 請求失敗: {str(e)}")
    
    def _build_gamma_content(self, title: str, content: Dict[str, Any]) -> str:
        """
        構建 Gamma API 要求的簡報內容格式
        
        Args:
            title: 課程標題
            content: 課程內容
        
        Returns:
            str: 格式化的簡報內容
        """
        parts = []
        
        # 標題
        parts.append(f"# {title}")
        parts.append("")
        
        # 基本資訊
        if content.get("basic_info"):
            basic_info = content["basic_info"]
            parts.append("## 課程資訊")
            if basic_info.get("grade"):
                parts.append(f"- 年級：{basic_info['grade']}")
            if basic_info.get("duration"):
                parts.append(f"- 時長：{basic_info['duration']} 分鐘")
            if basic_info.get("student_count"):
                parts.append(f"- 學生人數：{basic_info['student_count']} 人")
            if basic_info.get("classroom_equipment"):
                parts.append(f"- 教室設備：{basic_info['classroom_equipment']}")
            parts.append("")
        
        # 教學理念
        if content.get("rationale"):
            parts.append("## 教學理念")
            parts.append(content["rationale"])
            parts.append("")
        
        # 學習目標
        if content.get("objectives"):
            parts.append("## 學習目標")
            objectives = content["objectives"]
            if isinstance(objectives, list):
                for idx, obj in enumerate(objectives, 1):
                    parts.append(f"{idx}. {obj}")
            else:
                parts.append(str(objectives))
            parts.append("")
        
        # 教學策略
        if content.get("strategies"):
            parts.append("## 教學策略")
            strategies = content["strategies"]
            if isinstance(strategies, list):
                for idx, strategy in enumerate(strategies, 1):
                    parts.append(f"{idx}. {strategy}")
            else:
                parts.append(str(strategies))
            parts.append("")
        
        # 教學流程
        if content.get("teaching_flow"):
            parts.append("## 教學流程")
            flow = content["teaching_flow"]
            if isinstance(flow, list):
                for idx, step in enumerate(flow, 1):
                    parts.append(f"{idx}. {step}")
            else:
                parts.append(str(flow))
            parts.append("")
        
        return "\n".join(parts)
    
    def check_generation_status(self, generation_id: str) -> Dict[str, Any]:
        """
        檢查生成狀態
        
        Args:
            generation_id: 生成 ID
        
        Returns:
            Dict: 狀態資訊
        """
        try:
            print(f"📥 查詢 Gamma 生成狀態...")
            print(f"  - Generation ID: {generation_id}")
            
            response = requests.get(
                f"{self.GAMMA_API_BASE}/generations/{generation_id}",
                headers=self.headers,
                timeout=30
            )
            
            response.raise_for_status()
            result = response.json()
            
            print(f"✅ 狀態查詢成功")
            print(f"  - 狀態: {result.get('status')}")
            if result.get('gammaUrl'):
                print(f"  - Gamma URL: {result.get('gammaUrl')}")
            
            return result
            
        except requests.exceptions.HTTPError as e:
            error_detail = ""
            try:
                error_detail = e.response.json()
            except:
                error_detail = str(e)
            print(f"❌ 查詢狀態失敗: {error_detail}")
            raise Exception(f"查詢生成狀態失敗: {error_detail}")
        except requests.exceptions.RequestException as e:
            print(f"❌ 請求失敗: {str(e)}")
            raise Exception(f"查詢生成狀態失敗: {str(e)}")
    
    def wait_for_completion(self, generation_id: str, timeout: int = 300) -> Dict[str, Any]:
        """
        等待生成完成
        
        Args:
            generation_id: 生成 ID
            timeout: 超時時間（秒）
        
        Returns:
            Dict: 完成狀態
        """
        print(f"⏳ 等待 Gamma 生成完成...")
        start_time = time.time()
        check_count = 0
        
        while time.time() - start_time < timeout:
            check_count += 1
            elapsed = int(time.time() - start_time)
            print(f"  - 檢查第 {check_count} 次（已等待 {elapsed} 秒）")
            
            status = self.check_generation_status(generation_id)
            current_status = status.get("status")
            
            if current_status == "completed":
                print(f"✅ 生成完成！")
                return {
                    "generation_id": generation_id,
                    "status": "completed",
                    "gamma_url": status.get("gammaUrl")
                }
            elif current_status in ["failed", "error"]:
                print(f"❌ 生成失敗")
                return {
                    "generation_id": generation_id,
                    "status": "failed",
                    "error": status.get("error")
                }
            
            time.sleep(5)  # 每 5 秒檢查一次
        
        print(f"⏰ 生成超時")
        return {
            "generation_id": generation_id,
            "status": "timeout",
            "error": "生成超時"
        }
