#!/bin/bash

# DigitalOcean 部署前檢查腳本

echo "🔍 檢查 DigitalOcean 部署準備..."

# 檢查必要檔案
echo ""
echo "📋 檢查必要檔案..."

files=(
    "app.yaml"
    "backend/Dockerfile"
    "backend/requirements.txt"
    "backend/main.py"
    "frontend/index.html"
    "frontend/app.js"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✅ $file"
    else
        echo "  ❌ $file (缺失)"
    fi
done

# 檢查 GitHub 倉庫配置
echo ""
echo "📦 檢查 app.yaml 中的 GitHub 配置..."
if grep -q "repo: tzustu63/tzuchi-teaching" app.yaml; then
    echo "  ✅ GitHub 倉庫配置正確"
else
    echo "  ⚠️  請確認 GitHub 倉庫名稱"
fi

# 檢查 Dockerfile
echo ""
echo "🐳 檢查 Dockerfile..."
if grep -q "FROM python" backend/Dockerfile; then
    echo "  ✅ Dockerfile 包含 Python 基礎映像"
else
    echo "  ⚠️  Dockerfile 可能不完整"
fi

# 檢查環境變數
echo ""
echo "🔑 環境變數檢查清單："
echo "  需要在 DigitalOcean 設定以下環境變數："
echo "    - DATABASE_URL (如果使用 PostgreSQL)"
echo "    - OPENAI_API_KEY (可選)"
echo "    - CLAUDE_API_KEY (可選)"
echo "    - GAMMA_API_KEY (可選)"
echo "    - ENVIRONMENT=production"
echo "    - DEBUG=false"

# 檢查 health check 端點
echo ""
echo "🏥 檢查 Health Check 端點..."
if grep -q "@app.get(\"/health\")" backend/main.py || grep -q '"/health"' backend/main.py; then
    echo "  ✅ Health Check 端點存在"
else
    echo "  ⚠️  Health Check 端點可能缺失"
fi

echo ""
echo "✅ 檢查完成！"
echo ""
echo "📝 下一步："
echo "  1. 確認所有檔案都已推送到 GitHub (分支: V1)"
echo "  2. 登入 DigitalOcean 控制台"
echo "  3. 創建新 App，選擇 GitHub 倉庫"
echo "  4. 設定環境變數"
echo "  5. 開始部署"
echo ""
echo "📚 詳細說明請參考：DIGITALOCEAN_DEPLOYMENT.md"
