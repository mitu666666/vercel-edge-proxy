# Vercel Edge 代理

Vercel Edge Functions 同源代理：把 CoinGecko 行情与 Alternative.me 市场情绪指数转发到自有域名，规避浏览器直连第三方 API 的 CORS 限制与速率限制，同时不在前端暴露任何密钥。

## 在线地址

- 边缘代理：<https://vercel-edge-proxy-gold.vercel.app>
- 站内路径（经 Nginx 反代）：<https://c.zksq.top/api/*>

## 目录结构

```
vercel-edge-proxy/
├── README.md
├── LICENSE
└── vercel-edge-proxy/          # ← Vercel 项目根目录
    ├── api/
    │   ├── coingecko/
    │   │   ├── simple/price.ts
    │   │   ├── coins/list.ts
    │   │   ├── coins/markets.ts
    │   │   ├── search.ts
    │   │   └── ping.ts
    │   ├── alternative/
    │   │   ├── fng.ts          # 恐惧与贪婪指数
    │   │   └── global.ts       # 全球市场概览
    │   └── health.ts
    ├── vercel.json
    └── README.md
```

> **注意**：`vercel-edge-proxy/` 子目录才是 Vercel 项目的**根目录**（在 Vercel 控制台的 Root Directory 中选中该目录）。该布局与线上部署绑定，**请勿扁平化**。

## 部署

1. 在 Vercel 新建项目并导入本仓库，根目录选择 `vercel-edge-proxy/`。
2. 部署完成后，用 Nginx 把 `c.zksq.top/api/` 反代到 Vercel 项目域名：

```nginx
location /api/ {
  proxy_pass https://<your-vercel-project>.vercel.app/api/;
  proxy_set_header Host <your-vercel-project>.vercel.app;
  proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  proxy_set_header X-Forwarded-Proto $scheme;
}
```

3. 配置 443（HTTPS）证书，80 端口 301 跳转到 443：

```nginx
server { listen 80; server_name c.zksq.top; return 301 https://$host$request_uri; }
```

## 接口一览

| 路径 | 说明 |
| --- | --- |
| `GET /api/coingecko/ping` | 连通性检查，返回 `{"gecko_says":"(V3) To the Moon!"}` |
| `GET /api/coingecko/simple/price?ids=bitcoin&vs_currencies=usd` | 简单价格 |
| `GET /api/coingecko/coins/list` | 币种列表 |
| `GET /api/coingecko/coins/markets` | 市场行情 |
| `GET /api/coingecko/search?query=btc` | 币种搜索 |
| `GET /api/alternative/fng` | 恐惧与贪婪指数 |
| `GET /api/alternative/global` | 全球市场数据 |
| `GET /api/health` | 健康检查 |

## 缓存策略

所有函数运行在 Edge Runtime，响应头包含 `cache-control: public, s-maxage=15`，由边缘缓存吸收高频请求，显著降低上游速率压力。如需更严格的节流策略，可在各路由中调整。

## License

MIT © mitu666666
