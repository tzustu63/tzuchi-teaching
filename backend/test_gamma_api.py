"""
測試 Gamma API
"""
import requests
import os
from dotenv import load_dotenv

load_dotenv()

GAMMA_API_KEY = os.getenv("GAMMA_API_KEY")
GAMMA_API_BASE = "https://public-api.gamma.app/v0.2"

print(f"🔑 Gamma API Key: {GAMMA_API_KEY[:20]}...")
print(f"🌐 API Base URL: {GAMMA_API_BASE}\n")

# 準備請求
headers = {
    "Authorization": f"Bearer {GAMMA_API_KEY}",
    "Content-Type": "application/json"
}

# 測試請求
payload = {
    "prompt": "# 測試簡報\n\n這是一個測試簡報內容。",
    "textOptions": {
        "language": "zh-TW"
    },
    "imageOptions": {
        "model": "default"
    }
}

print("📤 發送請求...")
print(f"   Payload: {payload}\n")

try:
    response = requests.post(
        f"{GAMMA_API_BASE}/generations",
        headers=headers,
        json=payload,
        timeout=60
    )
    
    print(f"📊 狀態碼: {response.status_code}")
    print(f"📝 回應內容:\n{response.text}\n")
    
    if response.status_code == 200:
        print("✅ 請求成功！")
        result = response.json()
        print(f"   Generation ID: {result.get('id')}")
        print(f"   狀態: {result.get('status')}")
    else:
        print("❌ 請求失敗")
        print(f"   錯誤: {response.text}")
        
except Exception as e:
    print(f"❌ 發生錯誤: {str(e)}")

