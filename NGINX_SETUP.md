# Nginx 反向代理配置指南

## 📋 概述

配置 Nginx 反向代理後，您可以通過域名訪問應用，而不需要使用 IP 地址和端口號。

## 🌐 訪問方式對比

### 目前（使用 IP + 端口）
- ❌ http://18.181.71.46:3001
- ❌ http://18.181.71.46:5002

### 配置後（使用域名）
- ✅ http://course-planner.yourdomain.com
- ✅ https://course-planner.yourdomain.com（如果配置 SSL）

## 🚀 配置步驟

### 步驟 1：準備域名

確保您有一個域名，並將 DNS 記錄指向伺服器 IP：
- **A 記錄**：`course-planner.yourdomain.com` → `18.181.71.46`
- 或使用現有域名的子域名

### 步驟 2：上傳 Nginx 配置檔案

```bash
# 上傳配置檔案到伺服器
scp -i "LightsailDefaultKey-ap-northeast-1 (1).pem" \
    nginx-course-planner.conf \
    ubuntu@18.181.71.46:/tmp/course-planner.conf
```

### 步驟 3：在伺服器上配置

```bash
# 連接到伺服器
ssh -i "LightsailDefaultKey-ap-northeast-1 (1).pem" ubuntu@18.181.71.46

# 編輯配置檔案，替換域名
sudo nano /tmp/course-planner.conf
# 將 "course-planner.yourdomain.com" 替換為您的實際域名

# 複製到 Nginx 配置目錄
sudo cp /tmp/course-planner.conf /etc/nginx/sites-available/course-planner

# 啟用配置
sudo ln -s /etc/nginx/sites-available/course-planner /etc/nginx/sites-enabled/

# 測試配置
sudo nginx -t

# 重新載入 Nginx
sudo systemctl reload nginx
```

### 步驟 4：配置 SSL（可選但推薦）

```bash
# 安裝 Certbot
sudo apt update
sudo apt install -y certbot python3-certbot-nginx

# 申請 SSL 憑證
sudo certbot --nginx -d course-planner.yourdomain.com

# 自動續期（Certbot 會自動配置）
```

## 📝 配置方案

### 方案 1：子域名（推薦）

**優點**：
- 簡潔的網址
- 易於管理
- 適合多個應用

**網址範例**：
- http://course-planner.yourdomain.com
- https://course-planner.yourdomain.com

**DNS 設定**：
```
A 記錄：course-planner → 18.181.71.46
```

### 方案 2：路徑（如果沒有子域名）

**優點**：
- 不需要額外的 DNS 記錄
- 使用現有域名

**網址範例**：
- http://yourdomain.com/course-planner
- http://yourdomain.com/course-planner-api

**注意**：需要修改前端配置以支援路徑前綴

## 🔧 更新應用配置

配置 Nginx 後，需要更新應用的 CORS 設定：

```bash
# 編輯環境變數
ssh -i "LightsailDefaultKey-ap-northeast-1 (1).pem" ubuntu@18.181.71.46
cd /home/ubuntu/course-planner
nano .env.production

# 更新 CORS_ORIGINS
CORS_ORIGINS=https://course-planner.yourdomain.com,http://course-planner.yourdomain.com

# 更新 API_URL（前端使用）
API_URL=https://course-planner.yourdomain.com

# 重啟容器
docker compose -f docker-compose.prod.yml restart backend frontend
```

## ✅ 驗證配置

### 檢查 Nginx 狀態

```bash
sudo systemctl status nginx
sudo nginx -t
```

### 測試訪問

```bash
# 測試 HTTP
curl -I http://course-planner.yourdomain.com

# 測試 HTTPS（如果配置了 SSL）
curl -I https://course-planner.yourdomain.com
```

### 檢查日誌

```bash
# Nginx 訪問日誌
sudo tail -f /var/log/nginx/access.log

# Nginx 錯誤日誌
sudo tail -f /var/log/nginx/error.log
```

## 🔒 安全建議

1. **使用 HTTPS**：配置 SSL 憑證，保護資料傳輸
2. **限制訪問**：可以配置 IP 白名單或基本認證
3. **防火牆**：確保 Lightsail 防火牆允許 80 和 443 端口

## 🐛 故障排除

### 問題：502 Bad Gateway

**原因**：後端服務未運行或無法連接

**解決**：
```bash
# 檢查容器狀態
docker ps | grep course-planner

# 檢查後端日誌
docker logs course-planner-backend

# 重啟服務
docker compose -f docker-compose.prod.yml restart
```

### 問題：403 Forbidden

**原因**：Nginx 權限問題

**解決**：
```bash
# 檢查 Nginx 配置
sudo nginx -t

# 檢查檔案權限
ls -la /etc/nginx/sites-enabled/course-planner
```

### 問題：域名無法解析

**原因**：DNS 設定不正確

**解決**：
```bash
# 檢查 DNS 解析
nslookup course-planner.yourdomain.com

# 確認 A 記錄指向正確的 IP
dig course-planner.yourdomain.com
```

## 📚 參考資料

- [Nginx 官方文檔](https://nginx.org/en/docs/)
- [Let's Encrypt 文檔](https://letsencrypt.org/docs/)
- [Certbot 文檔](https://certbot.eff.org/)

