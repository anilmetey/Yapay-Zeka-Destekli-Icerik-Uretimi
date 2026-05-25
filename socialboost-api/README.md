# SocialBoost AI API

Small business sahipleri için profesyonel sosyal medya post generator backend'i.

## Neler Var

- Ollama tabanlı Instagram, TikTok ve LinkedIn post üretimi
- Zod validation, rate limit, request id ve structured error response
- Kalıcı local store: users, usage, generations, subscriptions
- Subscription-aware tier çözümü: Free, Starter, Pro
- Stripe Checkout ve Stripe webhook endpoint'i
- `/api/me`, `/api/usage`, `/api/generations`, `/openapi.json`
- Test edilebilir `createApp()` mimarisi
- Dockerfile, OpenAPI spec, graceful shutdown, JSON logs

## Kurulum

```bash
cd socialboost-api
npm install
cp .env.example .env
npm test
npm run dev
```

Ollama:

```bash
ollama pull mistral
ollama serve
```

Makinede başka model varsa:

```bash
OLLAMA_MODEL=gemma3:1b npm run dev
```

## Test İstekleri

```bash
curl http://localhost:3001/health
curl http://localhost:3001/openapi.json
curl http://localhost:3001/api/me -H "x-user-id: demo-user"
```

```bash
curl -X POST http://localhost:3001/api/generate-posts \
  -H "Content-Type: application/json" \
  -H "x-user-id: demo-user" \
  -d '{
    "productName": "Organik Krem Peynir",
    "description": "Katkısız günlük sütle üretilen premium kahvaltılık krem peynir.",
    "platform": "instagram",
    "tone": "premium",
    "language": "tr"
  }'
```

## Docker

```bash
docker build -t socialboost-api .
docker run --env-file .env -p 3001:3001 socialboost-api
```

## Üretim Notları

- Production'da `API_SECRET` set edilirse endpoint'ler `x-api-key` veya `Authorization: Bearer ...` ister.
- Stripe webhook için `STRIPE_WEBHOOK_SECRET` gerekir.
- Local JSON store MVP için yeterli; bir sonraki adım PostgreSQL + Prisma migration.
