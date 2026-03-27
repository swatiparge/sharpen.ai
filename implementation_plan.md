# Sharpen.ai Platform Remediation Implementation Plan

This implementation plan details the step-by-step remediation of all issues discovered during the comprehensive architectural, QA, AI/ML, DevOps, and Security audits. The plan is organized by priority, ensuring that critical security vulnerabilities, data leaks, and crash-inducing bugs are resolved immediately before addressing performance optimizations and minor hygiene issues.

## Proposed Changes

### Phase 1: Critical Priorities (P0) - Security, Stability, & Core Logic

**Security & Authorization**
#### [MODIFY] [backend/src/routes/usage.routes.ts](file:///Users/apple/Documents/Work/InterviewOs/backend/src/routes/usage.routes.ts)
- Add `router.use(authMiddleware)` to secure the `/usage/analytics` endpoint and prevent the critical PII data leak (SC-3).
- (Optional) Restrict route explicitly to an Admin identifier instead of just any authenticated user.

#### [MODIFY] [backend/src/index.ts](file:///Users/apple/Documents/Work/InterviewOs/backend/src/index.ts)
- Delete all unauthenticated debug and DDL endpoints: `/migrate-once`, `/debug-onboarding`, `/test-insert` (SC-9, BE-6).

#### [MODIFY] [backend/src/routes/interviews.routes.ts](file:///Users/apple/Documents/Work/InterviewOs/backend/src/routes/interviews.routes.ts)
- Add strict ownership validation (req.userId matches interview owner) on `POST /interviews/:id/reconstruction` (SC-1).
- Add strict ownership validation on `POST /interviews/:id/metrics/:metricName/feedback` (SC-2).

#### [MODIFY] [backend/src/config/index.ts](file:///Users/apple/Documents/Work/InterviewOs/backend/src/config/index.ts)
- Add strict validation to throw an error immediately on application startup if `JWT_SECRET` is missing, instead of falling back to the insecure `'changeme'` default (BE-1).

#### [MODIFY] [backend/src/routes/auth.routes.ts](file:///Users/apple/Documents/Work/InterviewOs/backend/src/routes/auth.routes.ts)
- Integrate `express-rate-limit` into the [login](file:///Users/apple/Documents/Work/InterviewOs/frontend/src/lib/auth.tsx#24-25) and `signup` routes to mitigate brute-force and credential stuffing attacks targeting the bcrypt hasher (SC-5).

**AI Pipeline & Infrastructure**
#### [MODIFY] [ai-service/pipeline/scorer.py](file:///Users/apple/Documents/Work/InterviewOs/ai-service/pipeline/scorer.py)
- Change LLM provider/model from `meta/llama-3.1-8b-instruct` to a larger, more capable model (e.g., LLaMA 3 70B or equivalent) to significantly reduce the JSON parsing failures on complex 8-metric outputs (AI-1).
- Add post-parse validation: clamp all numerical scores between `0.0` and `10.0` to prevent UI layout breaks from out-of-bounds hallucinations (AI-10).
- Increase `max_retries` from `1` to `3` in the `@retry_llm_call` decorator (AI-14).
- Validate cached results against the Pydantic model ([AnalyzeResponse](file:///Users/apple/Documents/Work/InterviewOs/ai-service/main.py#56-67)) upon loading from cache to prevent serving corrupted cache files (AI-19).

#### [MODIFY] [backend/src/workers/analysis.worker.ts](file:///Users/apple/Documents/Work/InterviewOs/backend/src/workers/analysis.worker.ts)
- Convert the 5-minute blocking HTTP request to the AI service into an asynchronous webhook pattern. The node backend will no longer hang awaiting the `undiciFetch` result, mitigating severe socket and memory exhaustion (WP-6).

#### [MODIFY] [frontend/Dockerfile](file:///Users/apple/Documents/Work/InterviewOs/frontend/Dockerfile) & [backend/src/workers/queues.ts](file:///Users/apple/Documents/Work/InterviewOs/backend/src/workers/queues.ts)
- Fix frontend Docker build-time env var baking by moving runtime configurations (like API URL) to standard techniques (DO-1).
- Change inline fallback imports in production from [.ts](file:///Users/apple/Documents/Work/InterviewOs/backend/test-db.ts) to [.js](file:///Users/apple/Documents/Work/InterviewOs/frontend/next.config.js) or use bundler paths (DO-2).
- Remove AI Service dependency on local file caches to allow true horizontal scaling (DO-5).


### Phase 2: High Priorities (P1) - Performance, Resiliency, & Accuracy

**AI Prompting & Accuracy**
#### [MODIFY] [ai-service/pipeline/scorer.py](file:///Users/apple/Documents/Work/InterviewOs/ai-service/pipeline/scorer.py)
- Refactor the prompt builder to strictly separate the system context from the user payload (AI-5).
- Send metric ID to display name mappings in the prompt context to ensure the LLM returns consistent internal identifiers (AI-7).
- Adjust the default output structure so inapplicable metrics produce `None` instead of heavily skewing averages with default `5.0` scores (AI-11).
- Allow the target `interview_round` (e.g., System Design vs. Behavioral) to dictate the weighting of individual metrics (AI-13).

**Backend Reliability**
#### [MODIFY] [backend/src/index.ts](file:///Users/apple/Documents/Work/InterviewOs/backend/src/index.ts)
- Add process-level graceful shutdown handlers to cleanly terminate HTTP connections and the database pool upon `SIGTERM`/`SIGINT` (BE-15).
- Migrate the DDL schema changes removed from [index.ts](file:///Users/apple/Documents/Work/InterviewOs/backend/src/index.ts) into a proper automated migration tool (BE-14, DO-6).

#### [MODIFY] [backend/src/workers/analysis.worker.ts](file:///Users/apple/Documents/Work/InterviewOs/backend/src/workers/analysis.worker.ts)
- Add safe `try/catch` and `await` around BullMQ queue additions (`interviewQueue.add`) to catch Redis offline states or enqueueing failures (BE-17).

#### [MODIFY] [backend/src/routes/dashboard.routes.ts](file:///Users/apple/Documents/Work/InterviewOs/backend/src/routes/dashboard.routes.ts)
- Use `Promise.all([recent, trend, snapshot, weakness])` to run the active aggregation queries concurrently, slashing the dashboard TTFB (WP-1).

#### [MODIFY] [docker-compose.yml](file:///Users/apple/Documents/Work/InterviewOs/docker-compose.yml)
- Explicitly add `command: redis-server --appendonly yes` to the Redis container to prevent wiping the BullMQ job queue during an unexpected restart (DO-7).


### Phase 3: Medium Priorities (P2) - Scaling, Database Optimization, & Logging

**Database Upgrades**
#### [MODIFY] [backend/src/db/schema.sql](file:///Users/apple/Documents/Work/InterviewOs/backend/src/db/schema.sql)
- Add compound indexes for [(user_id, status)](file:///Users/apple/Documents/Work/InterviewOs/frontend/src/lib/api.ts#10-38) and [(interview_id, metric_name)](file:///Users/apple/Documents/Work/InterviewOs/frontend/src/lib/api.ts#10-38) to eliminate full table scans for dashboard queries (WP-2).

#### [MODIFY] [backend/src/workers/analysis.worker.ts](file:///Users/apple/Documents/Work/InterviewOs/backend/src/workers/analysis.worker.ts)
- Rewrite the `INSERT INTO transcript_segments` loop into a single optimized batched `INSERT` query (BE-9, BE-10).

**AI Resilience & DevOps**
#### [MODIFY] [backend/src/db/client.ts](file:///Users/apple/Documents/Work/InterviewOs/backend/src/db/client.ts)
- Shift explicit Postgres connection pool sizing (`max: 10`) into the [.env](file:///Users/apple/Documents/Work/InterviewOs/backend/.env) configuration (WP-4).

#### [MODIFY] [ai-service/pipeline/scorer.py](file:///Users/apple/Documents/Work/InterviewOs/ai-service/pipeline/scorer.py), [ai-service/pipeline/transcriber.py](file:///Users/apple/Documents/Work/InterviewOs/ai-service/pipeline/transcriber.py), [ai-service/pipeline/learn_generator.py](file:///Users/apple/Documents/Work/InterviewOs/ai-service/pipeline/learn_generator.py)
- Move shared connection setups into a single centralized `llm_client.py` module (AI-4).
- Expose the artificial `max_workers=2` concurrency throttle in the `ThreadPoolExecutor` to an Environment Variable (`AI_SCORER_CONCURRENCY`) to prepare for paid-tier API scaling (WP-5).
- Implement dynamic backoff inside the custom LLM retry decorator rather than fixed `time.sleep()` staggers (AI-25).
- Inject the specific model version directly into the transcription cache keys to automatically invalidate cache when switching to superior transcription models (AI-20).

#### [MODIFY] [backend/src/routes/onboarding.routes.ts](file:///Users/apple/Documents/Work/InterviewOs/backend/src/routes/onboarding.routes.ts)
- Strictly limit S3 Upload URL generation by evaluating the content-type at the S3 IAM policy level, preventing malicious uploads disguised as PDFs (SC-8).


### Phase 4: Minor Hygiene (P3) - Observability, Cleanup, & UI Consistency

#### [MODIFY] [backend/package.json](file:///Users/apple/Documents/Work/InterviewOs/backend/package.json)
- Remove unused dependencies (BE-24). Allow adoption of `pino` structured logging (BE-25) and trace headers (BE-21).

#### [MODIFY] [ai-service/pipeline/transcriber.py](file:///Users/apple/Documents/Work/InterviewOs/ai-service/pipeline/transcriber.py)
- Remove accidental `print(api_key)` statements inside the AI service logging logic (AI-18).

#### [NEW] [ai-service/.dockerignore](file:///Users/apple/Documents/Work/InterviewOs/ai-service/.dockerignore)
- Create a strict [.dockerignore](file:///Users/apple/Documents/Work/InterviewOs/backend/.dockerignore) blocking `.pytest_cache`, `__pycache__`, and `uploads/` directory from the builder layer (DO-3).

#### [MODIFY] [frontend/src/app/dashboard/interviews/[id]/page.tsx](file:///Users/apple/Documents/Work/InterviewOs/frontend/src/app/dashboard/interviews/%5Bid%5D/page.tsx)
- Ensure full transcript objects and raw JSON vocal payloads aren't injected into Next.js React Client Component hydration arrays unless expressly requested. Paginate large endpoints (`LIMIT`/`OFFSET`) across the backend and frontend lists (WP-3, WP-7).

## Verification Plan

### Automated Verification
Since the project currently lacks a CI/CD test suite, the verification will predominantly be testing APIs directly. Post-fix validations:
1. **Security Testing:**
   - Execute an unauthenticated `GET /usage/analytics` via `curl`. Expect HTTP 401.
   - Execute an authenticated `POST /interviews/<other-user-id>/reconstruction` with a secondary test account. Expect HTTP 403.
   - Run a rapid burst script of 100 requests to `POST /auth/login`. Expect HTTP 429 Too Many Requests.
2. **AI Stability:**
   - Submit an audio analysis through the QA pipeline with the new LLM scoring logic. Monitor `ai-service` logs to observe zero structured JSON parsing `JSONDecodeError`s.

### Manual Verification
1. **Dashboard Performance:** Refresh the user dashboard. Monitor the network tab to ensure Time-To-First-Byte (TTFB) is halved compared to the initial baseline due to concurrent DB querying.
2. **Infrastructure:** Perform a `docker compose up --build` simulating a Staging environment override. Confirm the frontend image does not bake the `localhost` API URL into the javascript bundle statically, but rather fetches from the overridden URL.
