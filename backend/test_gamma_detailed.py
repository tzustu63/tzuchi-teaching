"""
詳細測試 Gamma API
"""
import requests
import os
from dotenv import load_dotenv

load_dotenv()

GAMMA_API_KEY = os.getenv("GAMMA_API_KEY")
GAMMA_API_BASE = "https://public-api.gamma.app/v0.2"

print("=" * 60)
print("Gamma API 詳細測試")
print("=" * 60)
print(f"\n🔑 API Key 開頭: {GAMMA_API_KEY[:30]}..." if GAMMA_API_KEY else "❌ 未找到 API Key")
print(f"🌐 API Base URL: {GAMMA_API_BASE}\n")

if not GAMMA_API_KEY:
    print("❌ 錯誤：未設定 GAMMA_API_KEY")
    print("請在 .env 檔案中加入：GAMMA_API_KEY=your-key-here")
    exit(1)

# 測試不同的請求格式
headers = {
    "Authorization": f"Bearer {GAMMA_API_KEY}",
    "Content-Type": "application/json"
}

# 簡單測試
print("測試 1: 最簡單的請求")
payload1 = {
    "prompt": "測試簡報"
}

try:
    response = requests.post(
        f"{GAMMA_API_BASE}/generations",
        headers=headers,
        json=payload1,
        timeout=30
    )
    print(f"   📊 狀態碼: {response.status_code}")
    print(f"   📝 回應: {response.text[:200]}")
except Exception as e:
    print(f"   ❌ 錯誤: {str(e)}")

print("\n" + "-" * 60)

# 完整格式測試
print("\n測試 2: 完整格式")
payload2 = {
    "prompt": "# 測試簡報\n\n這是測試內容。",
    "textOptions": {
        "language": "en-US"
    },
    "imageOptions": {
        "model": "default"
    }
}

try:
    response = requests.post(
        f"{GAMMA_API_BASE}/generations",
        headers=headers,
        json=payload2,
        timeout=30
    )
    print(f"   📊 狀態碼: {response.status_code}")
    print(f"   📝 回應: {response.text[:200]}")
except Exception as e:
    print(f"   ❌ 錯誤: {str(e)}")

print("\n" + "-" * 60)

# 測試無 imageOptions
print("\n測試 3: 省略 imageOptions")
payload3 = {
    "prompt": "# 測試\n\n內容",
    "textOptions": {
        "language": "en-US"
    }
}

try:
    response = requests.post(
        f"{GAMMA_API_BASE}/generations",
        headers=headers,
        json=payload3,
        timeout=30
    )
    print(f"   📊 狀態碼: {response.status_code}")
    print(f"   📝 回應: {response.text[:200]}")
except Exception as e:
    print(f"   ❌ 錯誤: {str(e)}")

print("\n" + "=" * 60)
print("測試完成")
print("=" * 60)

