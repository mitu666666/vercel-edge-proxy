# Vercel Edge 代理项目

此目录包含一个可在 Vercel 部署的 Edge Functions 项目，为前端提供同源 `/api/*` 代理，转发到 CoinGecko 与 Alternative.me 公共 API，并设置短缓存头。

## 目录结构

```
vercel-edge-proxy/
  ├── api/
  │   ├── coingecko/
  │   │   ├── simple/price.ts
  │   │   ├── coins/list.ts
  │   │   ├── coins/markets.ts
  │   │   ├── search.ts
  │   │   └── ping.ts
  │   └── alternative/
  │       ├── fng.ts
  │       └── global.ts
  ├── api/health.ts
  └── vercel.json
```

## 部署步骤

1. 在 Vercel 新建项目，根目录选择 `vercel-edge-proxy/`。
2. 部署完成后将 `c.zksq.top` 的 `/api/*` 通过 Nginx 反向代理到你的 Vercel 项目域名：

```
location /api/ {
  proxy_pass https://<your-vercel-project>.vercel.app/api/;
  proxy_set_header Host <your-vercel-project>.vercel.app;
  proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  proxy_set_header X-Forwarded-Proto $scheme;
}
```

3. 确保 443（HTTPS）已配置证书；80 重定向到 443：

```
server { listen 80; server_name c.zksq.top; return 301 https://$host$request_uri; }
```

## 验证

- `https://c.zksq.top/api/coingecko/ping` → `{"gecko_says":"(V3) To the Moon!"}`
- `https://c.zksq.top/api/coingecko/simple/price?ids=bitcoin&vs_currencies=usd` → 价格 JSON
- `https://c.zksq.top/api/alternative/fng` → 恐惧与贪婪指数 JSON
- `https://c.zksq.top/api/health` → 健康状态 JSON

## 说明

- 所有函数运行在 Edge Runtime，响应头含 `cache-control: public, s-maxage=15`，便于边缘缓存，降低速率压力。
- 无需在前端暴露任何密钥；如需更严格的节流与缓存策略，可在各路由中调整。