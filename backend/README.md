# sharpen.ai Backend

AI-powered Interview Performance Analytics — REST API server.

## Stack
- **Node.js + TypeScript + Express**
- **PostgreSQL** (database)
- **BullMQ + Redis** (async job queues)
- **TwinMind** (transcription)
- **OpenAI GPT-4o** (AI analysis)
- **AWS S3 / Cloudflare R2** (audio storage)

## Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
# Fill in your database URL, JWT secret, Redis URL, AWS keys, TwinMind API key, OpenAI key
```

### 3. Start PostgreSQL and Redis (Docker)
```bash
docker run -d --name postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=sharpen_db -p 5432:5432 postgres:16
docker run -d --name redis -p 6379:6379 redis:7
```

### 4. Run DB migration
```bash
npm run db:migrate
```

### 5. Start dev server
```bash
npm run dev
```

Server starts at: **http://localhost:3000**
Health check: **http://localhost:3000/health**

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/auth/signup` | Create account |
| POST | `/auth/login` | Login |
| POST/GET | `/onboarding/profile` | Save/get onboarding data |
| POST | `/interviews` | Create interview |
| GET | `/interviews` | List all interviews |
| GET | `/interviews/:id` | Interview + metrics |
| POST | `/interviews/:id/media-url` | Get S3 upload URL |
| POST | `/interviews/:id/analyze` | Trigger AI pipeline |
| GET | `/interviews/:id/transcript` | Full transcript |
| GET | `/interviews/:id/metrics/:name` | Metric detail |
| POST | `/interviews/:id/reconstruction` | Save Q&A reconstruction |
| GET | `/dashboard` | Dashboard data |
| GET | `/gaps` | Gap analysis |
| GET | `/roadmap` | Improvement roadmap |
| PATCH | `/roadmap/tasks/:id` | Mark task done |
| GET | `/simulations` | List simulations |
| POST | `/simulations/:id/start` | Start session |
| POST | `/simulations/sessions/:id/complete` | Complete session |
| GET/PUT/DELETE | `/profile` | Profile management |
