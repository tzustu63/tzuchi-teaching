# 伺服器可用網址列表

**伺服器 IP**: 18.181.71.46

## 🌐 通過域名訪問（推薦，已配置 HTTPS）

### 課程計劃生成器

- **前端應用**: https://course-planner.harvestwize.com
- **後端 API**: https://course-planner.harvestwize.com/api
- **API 文檔**: https://course-planner.harvestwize.com/docs
- **健康檢查**: https://course-planner.harvestwize.com/health

### HarvestWize 應用

- **n8n (工作流自動化)**: https://n8n.harvestwize.com
- **Open WebUI (AI 聊天界面)**: https://webui.harvestwize.com
- **Qdrant (向量資料庫)**: https://qdrant.harvestwize.com

## 🔌 通過 IP + 端口直接訪問

### 課程計劃生成器

- **前端**: http://18.181.71.46:3001
- **後端 API**: http://18.181.71.46:5002
- **API 文檔**: http://18.181.71.46:5002/docs
- **健康檢查**: http://18.181.71.46:5002/health
- **PostgreSQL**: 18.181.71.46:5433

### HarvestWize 應用

- **n8n**: http://18.181.71.46:5678
- **pgAdmin**: http://18.181.71.46:5050
- **Open WebUI**: http://18.181.71.46:8080
- **Qdrant**: http://18.181.71.46:6333
- **Ollama**: http://18.181.71.46:11434
- **PostgreSQL**: 18.181.71.46:5432

## 📋 服務對照表

| 服務 | 域名 | IP + 端口 | SSL | 說明 |
|------|------|-----------|-----|------|
| 課程計劃生成器前端 | course-planner.harvestwize.com | 18.181.71.46:3001 | ✅ | 課程計劃生成器前端應用 |
| 課程計劃生成器後端 | course-planner.harvestwize.com/api | 18.181.71.46:5002 | ✅ | 課程計劃生成器 API |
| n8n | n8n.harvestwize.com | 18.181.71.46:5678 | ✅ | 工作流自動化工具 |
| Open WebUI | webui.harvestwize.com | 18.181.71.46:8080 | ✅ | AI 聊天界面 |
| Qdrant | qdrant.harvestwize.com | 18.181.71.46:6333 | ✅ | 向量資料庫 |
| pgAdmin | - | 18.181.71.46:5050 | ❌ | PostgreSQL 管理介面 |
| Ollama | - | 18.181.71.46:11434 | ❌ | 本地 LLM 服務 |

## 🔒 SSL 憑證狀態

### 已配置 SSL 的域名

1. **course-planner.harvestwize.com**
   - 憑證到期日：2026-03-05
   - 自動續期：已啟用

2. **n8n.harvestwize.com**（共用憑證）
   - 包含：n8n.harvestwize.com, qdrant.harvestwize.com, webui.harvestwize.com
   - 自動續期：已啟用

## 📝 注意事項

1. **推薦使用域名訪問**：已配置 HTTPS，更安全且易於記憶
2. **HTTP 自動重定向**：所有 HTTP 請求會自動重定向到 HTTPS
3. **端口訪問**：直接使用 IP + 端口訪問時，請確保 Lightsail 防火牆已開放對應端口
4. **內部服務**：PostgreSQL、Ollama 等服務建議僅在內部網路訪問

## 🔍 驗證命令

```bash
# 檢查所有域名
dig course-planner.harvestwize.com +short
dig n8n.harvestwize.com +short
dig webui.harvestwize.com +short
dig qdrant.harvestwize.com +short

# 測試 HTTPS
curl -I https://course-planner.harvestwize.com
curl -I https://n8n.harvestwize.com
curl -I https://webui.harvestwize.com
curl -I https://qdrant.harvestwize.com
```

