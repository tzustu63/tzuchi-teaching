# 前端 Dockerfile - 使用 Nginx 提供靜態檔案服務
FROM nginx:alpine

# 複製前端檔案到 Nginx 預設目錄
COPY . /usr/share/nginx/html

# 設定正確的檔案權限（Nginx 以 nginx 用戶運行）
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html

# 創建 Nginx 配置檔案（處理 API 代理和 SPA 路由）
RUN echo 'server { \
    listen 80; \
    server_name _; \
    root /usr/share/nginx/html; \
    index index.html; \
    \
    # 代理所有 API 請求到後端（包括 /api, /courses, /prompts 等） \
    location ~ ^/(api|courses|prompts|upload|api-keys|course-plans|health|docs|openapi.json) { \
        proxy_pass http://backend:8000; \
        proxy_http_version 1.1; \
        proxy_set_header Upgrade $http_upgrade; \
        proxy_set_header Connection "upgrade"; \
        proxy_set_header Host $host; \
        proxy_set_header X-Real-IP $remote_addr; \
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for; \
        proxy_set_header X-Forwarded-Proto $scheme; \
        proxy_read_timeout 300s; \
        proxy_connect_timeout 75s; \
    } \
    \
    # 靜態資源快取 \
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ { \
        expires 1y; \
        add_header Cache-Control "public, immutable"; \
    } \
    \
    # SPA 路由支援（所有其他路由都返回 index.html） \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

# 暴露端口
EXPOSE 80

# Nginx 會自動啟動
CMD ["nginx", "-g", "daemon off;"]

