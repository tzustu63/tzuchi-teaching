"""
測試 OpenAI API 連線和可用模型
"""
import os
import openai
from dotenv import load_dotenv

load_dotenv()

def test_openai_connection():
    """測試 OpenAI API 連線"""
    api_key = os.getenv("OPENAI_API_KEY")
    
    if not api_key:
        print("❌ 未找到 OPENAI_API_KEY 環境變數")
        return False
    
    try:
        client = openai.OpenAI(api_key=api_key)
        
        # 測試基本連線
        print("🔍 測試 OpenAI API 連線...")
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": "Hello"}],
            max_tokens=10
        )
        print("✅ OpenAI API 連線成功")
        
        # 列出可用模型
        print("\n📋 查詢可用模型...")
        models = client.models.list()
        
        print("\n🎯 可用模型列表:")
        available_models = []
        for model in models.data:
            model_id = model.id
            if model_id.startswith("gpt"):
                available_models.append(model_id)
                print(f"  - {model_id}")
        
        # 測試特定模型
        test_models = ["gpt-4o-mini", "gpt-4", "gpt-5", "o1-preview", "o1-mini"]
        
        print("\n🧪 測試特定模型:")
        for model_name in test_models:
            if model_name in available_models:
                print(f"  ✅ {model_name} - 可用")
                try:
                    # gpt-5 使用不同的參數
                    if model_name == "gpt-5":
                        response = client.chat.completions.create(
                            model=model_name,
                            messages=[{"role": "user", "content": "Hi"}],
                            max_completion_tokens=5  # gpt-5 使用 max_completion_tokens
                        )
                    else:
                        response = client.chat.completions.create(
                            model=model_name,
                            messages=[{"role": "user", "content": "Hi"}],
                            max_tokens=5
                        )
                    print(f"     → 測試通過")
                except Exception as e:
                    print(f"     → 測試失敗: {str(e)}")
            else:
                print(f"  ❌ {model_name} - 不可用")
        
        return True
        
    except Exception as e:
        print(f"❌ 連線失敗: {str(e)}")
        return False

if __name__ == "__main__":
    print("=" * 60)
    print("OpenAI 模型測試")
    print("=" * 60)
    test_openai_connection()
    print("=" * 60)
