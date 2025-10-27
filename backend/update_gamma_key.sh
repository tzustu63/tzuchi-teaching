#!/bin/bash

echo "================================================"
echo "更新 Gamma API Key"
echo "================================================"

# 讀取新的 API Key
read -p "請輸入新的 Gamma API Key: " NEW_KEY

if [ -z "$NEW_KEY" ]; then
    echo "❌ 錯誤：未輸入 API Key"
    exit 1
fi

# 檢查格式
if [[ ! "$NEW_KEY" =~ ^sk-gamma- ]]; then
    echo "⚠️  警告：API Key 格式可能不正確（應以 sk-gamma- 開頭）"
    read -p "是否仍要繼續？ (y/n): " confirm
    if [ "$confirm" != "y" ]; then
        exit 1
    fi
fi

# 更新 .env 檔案
if grep -q "GAMMA_API_KEY=" backend/.env; then
    # 如果已存在，更新它
    sed -i.bak "s|GAMMA_API_KEY=.*|GAMMA_API_KEY=$NEW_KEY|" backend/.env
    echo "✅ 已更新現有的 GAMMA_API_KEY"
else
    # 如果不存在，添加它
    echo "" >> backend/.env
    echo "# Gamma API Key" >> backend/.env
    echo "GAMMA_API_KEY=$NEW_KEY" >> backend/.env
    echo "✅ 已添加新的 GAMMA_API_KEY"
fi

echo ""
echo "新的 API Key 已設定：$NEW_KEY"
echo ""
echo "要測試嗎？"
read -p "執行測試？ (y/n): " test_confirm
if [ "$test_confirm" = "y" ]; then
    cd backend
    source venv/bin/activate
    python test_gamma_api.py
fi

