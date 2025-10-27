"""
測試 Gamma API - 使用正確的格式
根據 https://developers.gamma.app/docs/how-does-the-generations-api-work
"""
import requests
import os
from dotenv import load_dotenv

load_dotenv()

GAMMA_API_KEY = os.getenv("GAMMA_API_KEY")
GAMMA_API_BASE = "https://public-api.gamma.app/v0.2"

print("=" * 70)
print("Gamma API 測試 - 使用正確的格式")
print("=" * 70)
print(f"\n🔑 API Key: {GAMMA_API_KEY[:30]}...")
print(f"🌐 API Base URL: {GAMMA_API_BASE}\n")

# 使用正確的 header 格式
headers = {
    "X-API-KEY": GAMMA_API_KEY,
    "Content-Type": "application/json",
    "accept": "application/json"
}

# 測試請求
input_text = """# 測試簡報：認識數字

## 課程資訊
- 年級：一年級
- 時長：40 分鐘
- 學生人數：30 人

## 教學理念
透過遊戲化的方式，讓一年級學生認識數字0-9，培養數感，激發學習興趣。

## 學習目標
1. 認識數字0-9
2. 能夠數數1-10
3. 培養數感

## 教學策略
1. 遊戲化教學
2. 實物操作
3. 小組合作

## 教學流程
1. 導入（5分鐘）：數字歌
2. 發展（25分鐘）：認識數字與數數
3. 總結（10分鐘）：成果分享
"""

payload = {
    "inputText": input_text,
    "textMode": "generate",
    "format": "presentation",
    "numCards": 10,
    "cardSplit": "auto",
    "textOptions": {
        "amount": "medium",
        "language": "zh"
    },
    "imageOptions": {
        "source": "aiGenerated",
        "model": "flux-1.1-pro",
        "style": "photorealistic"
    }
}

print("📤 發送請求...")
print(f"   輸入文字長度: {len(input_text)} 字元")
print(f"   卡牌數量: 10")
print(f"   語言: zh (繁體中文)")
print(f"   圖片來源: aiGenerated")
print(f"   圖片模型: flux-1.1-pro\n")

try:
    response = requests.post(
        f"{GAMMA_API_BASE}/generations",
        headers=headers,
        json=payload,
        timeout=60
    )
    
    print(f"📊 狀態碼: {response.status_code}")
    print(f"\n📝 回應內容:\n{response.text}\n")
    
    if response.status_code == 200:
        result = response.json()
        print("✅ 請求成功！")
        print(f"   Generation ID: {result.get('generationId')}")
        print("\n" + "=" * 70)
        print("下一步：使用此 Generation ID 查詢狀態")
        print("=" * 70)
    else:
        print("❌ 請求失敗")
        error_detail = response.json() if response.text else {}
        print(f"   錯誤訊息: {error_detail.get('message', response.text)}")
        
except Exception as e:
    print(f"❌ 發生錯誤: {str(e)}")

print("\n測試完成")

