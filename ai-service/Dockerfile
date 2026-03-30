# ── Stage 1: Build (install deps) ───────────────────────────────
FROM python:3.11-slim AS builder

WORKDIR /app

# Install build tools only in builder stage
RUN apt-get update && apt-get install -y --no-install-recommends gcc && \
    rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --upgrade pip && \
    pip install --prefix=/install --no-cache-dir -r requirements.txt

# ── Stage 2: Run ─────────────────────────────────────────────────
FROM python:3.11-slim AS runner

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Non-root user for security
RUN addgroup --system --gid 1001 aiservice && \
    adduser  --system --uid 1001 --ingroup aiservice aiservice

# Copy installed packages from builder
COPY --from=builder /install /usr/local

# Copy application source (exclude venv, cache, uploads)
COPY --chown=aiservice:aiservice . .

# Ensure the app directory is owned by the user
RUN chown -R aiservice:aiservice /app

USER aiservice

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]