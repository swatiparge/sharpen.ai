-- ============================================================
-- sharpen.ai – Full Database Schema
-- ============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- USERS & AUTH
-- ============================================================

CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email         TEXT UNIQUE NOT NULL,
  password_hash TEXT,                -- NULL for Google OAuth users
  full_name     TEXT NOT NULL,
  google_id     TEXT UNIQUE,         -- Google OAuth subject ID
  avatar_url    TEXT,                -- Google profile picture
  credits_balance INTEGER DEFAULT 60, -- New users start with 60 credits (1 hour)
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ONBOARDING PROFILE (WF-04, WF-05, WF-06)
-- ============================================================

CREATE TABLE IF NOT EXISTS onboarding_profiles (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  "current_role"    TEXT,
  years_experience  TEXT, -- e.g. '0-1', '2-3', '4-5', '6+'
  current_company   TEXT,
  target_level      TEXT, -- Junior / Mid / Senior / Lead
  target_companies  TEXT[], -- array of company names
  interview_stage   TEXT, -- e.g. 'Actively interviewing', 'Just started', etc.
  struggle_areas    TEXT[], -- e.g. '{"System Design", "Coding Speed"}'
  resume_path       TEXT, -- S3 key for uploaded resume
  consent_given     BOOLEAN DEFAULT FALSE,
  onboarding_done   BOOLEAN DEFAULT FALSE,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INTERVIEWS (WF-07 through WF-16)
-- ============================================================

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'interview_status') THEN
        CREATE TYPE interview_status AS ENUM (
          'CREATED', 'RECORDED', 'TRANSCRIBING', 'TRANSCRIBED', 'ANALYZING', 'ANALYZED', 'FAILED'
        );
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'interview_round') THEN
        CREATE TYPE interview_round AS ENUM (
          'SCREEN', 'TECHNICAL', 'SYSTEM_DESIGN', 'BEHAVIORAL', 'OTHER'
        );
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'interview_type') THEN
        CREATE TYPE interview_type AS ENUM (
          'RECORDED', 'RECONSTRUCTED', 'SIMULATION'
        );
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS interviews (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  company         TEXT,
  round           interview_round,
  interview_type  interview_type NOT NULL,
  status          interview_status DEFAULT 'CREATED',
  overall_score   NUMERIC(4, 2),
  summary_text    TEXT, -- e.g. "Strong mid-level frontend performance"
  badge_label     TEXT, -- e.g. "Weak closing"
  vocal_signals   JSONB, -- Level 2/3 metrics: wpm, fillers, pauses, emotion
  failure_reason  TEXT, -- Reason why analysis failed
  interviewed_at  TIMESTAMPTZ DEFAULT NOW(),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INTERVIEW MEDIA (audio/screen recordings)
-- ============================================================

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'media_type') THEN
        CREATE TYPE media_type AS ENUM ('AUDIO', 'SCREEN');
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS interview_media (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  interview_id  UUID NOT NULL REFERENCES interviews(id) ON DELETE CASCADE,
  media_type    media_type NOT NULL,
  storage_path  TEXT NOT NULL, -- S3/R2 key
  content_type  TEXT, -- e.g. 'audio/webm', 'audio/mpeg'
  duration_secs INT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- RECONSTRUCTION Q&A (WF-12, WF-13, WF-14)
-- ============================================================

CREATE TABLE IF NOT EXISTS reconstruction_questions (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  interview_id      UUID NOT NULL REFERENCES interviews(id) ON DELETE CASCADE,
  question_order    INT NOT NULL,
  question_text     TEXT,
  answer_text       TEXT,
  followup_text     TEXT,
  confidence_score  INT CHECK (confidence_score BETWEEN 0 AND 10),
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TRANSCRIPTS
-- ============================================================

CREATE TABLE IF NOT EXISTS transcripts (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  interview_id  UUID UNIQUE NOT NULL REFERENCES interviews(id) ON DELETE CASCADE,
  raw_text      TEXT,
  language      TEXT DEFAULT 'en',
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS transcript_segments (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  interview_id  UUID NOT NULL REFERENCES interviews(id) ON DELETE CASCADE,
  segment_order INT NOT NULL,
  start_ms      INT,
  end_ms        INT,
  speaker       TEXT, -- 'INTERVIEWER' or 'CANDIDATE'
  text          TEXT NOT NULL,
  highlight     TEXT, -- 'STRENGTH' | 'WEAKNESS' | 'OPPORTUNITY' | NULL
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- METRICS & SCORES (WF-16, WF-17)
-- ============================================================

CREATE TABLE IF NOT EXISTS metrics (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  interview_id        UUID NOT NULL REFERENCES interviews(id) ON DELETE CASCADE,
  metric_name         TEXT NOT NULL,
  -- e.g. communication_clarity, structural_thinking, technical_depth,
  --      tradeoff_awareness, quantification_impact, followup_handling,
  --      seniority_alignment, confidence_signal
  score               NUMERIC(4, 2),
  trend               TEXT, -- 'UP' | 'DOWN' | 'FLAT'
  explanation_summary TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS metric_examples (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  metric_id     UUID NOT NULL REFERENCES metrics(id) ON DELETE CASCADE,
  segment_id    UUID REFERENCES transcript_segments(id),
  label         TEXT, -- 'MISSED_OPPORTUNITY' | 'STRONG_EXAMPLE'
  comment       TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PATTERNS / GAP ANALYZER (WF-20)
-- ============================================================

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'pattern_type') THEN
        CREATE TYPE pattern_type AS ENUM ('WEAKNESS', 'STRENGTH');
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS patterns (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  pattern_type  pattern_type NOT NULL,
  title         TEXT NOT NULL,
  description   TEXT,
  severity      TEXT, -- 'LOW' | 'MEDIUM' | 'HIGH'
  impact        TEXT, -- e.g. "High impact on offer probability"
  occurrence    INT DEFAULT 1, -- how many interviews triggered this
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ROADMAP (WF-21)
-- ============================================================

CREATE TABLE IF NOT EXISTS roadmaps (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS roadmap_tasks (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  roadmap_id  UUID NOT NULL REFERENCES roadmaps(id) ON DELETE CASCADE,
  week_label  TEXT, -- e.g. "Week 1-2"
  theme       TEXT, -- e.g. "Quantification & impact stories"
  task_text   TEXT NOT NULL,
  is_done     BOOLEAN DEFAULT FALSE,
  order_index INT DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SIMULATIONS (WF-22, WF-23, WF-24)
-- ============================================================

CREATE TABLE IF NOT EXISTS simulations (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title        TEXT NOT NULL,
  description  TEXT,
  difficulty   TEXT, -- 'EASY' | 'MEDIUM' | 'HARD'
  duration_min INT,
  "role"       TEXT,
  focus_area   TEXT,
  is_system    BOOLEAN DEFAULT TRUE, -- system-generated vs user-created
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS simulation_sessions (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  simulation_id UUID NOT NULL REFERENCES simulations(id),
  status        TEXT DEFAULT 'IN_PROGRESS', -- 'IN_PROGRESS' | 'COMPLETED'
  overall_score NUMERIC(4, 2),
  summary_text  TEXT,
  started_at    TIMESTAMPTZ DEFAULT NOW(),
  completed_at  TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS simulation_answers (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id     UUID NOT NULL REFERENCES simulation_sessions(id) ON DELETE CASCADE,
  question_text  TEXT NOT NULL,
  answer_text    TEXT,
  audio_path     TEXT, -- S3 key if recorded
  is_saved       BOOLEAN DEFAULT FALSE, -- "Save best answers to library"
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- METRIC FEEDBACK (user trust-building)
-- ============================================================

CREATE TABLE IF NOT EXISTS metric_feedback (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    metric_id       UUID REFERENCES metrics(id) ON DELETE CASCADE,
    user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
    feedback_type   TEXT NOT NULL,
    user_score      FLOAT,
    comment         TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- CREDIT TRANSACTIONS
-- ============================================================

CREATE TABLE IF NOT EXISTS credit_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL, -- positive for credits added, negative for spent
    transaction_type TEXT NOT NULL, -- 'WELCOME_BONUS', 'ANALYSIS_SPENT', 'RECONSTRUCT_SPENT', 'TOPUP'
    interview_id UUID REFERENCES interviews(id) ON DELETE SET NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ADDITIONAL COLUMNS (added by migrations)
-- ============================================================

ALTER TABLE interviews ADD COLUMN IF NOT EXISTS top_strengths JSONB;
ALTER TABLE interviews ADD COLUMN IF NOT EXISTS key_improvement_areas JSONB;
ALTER TABLE interviews ADD COLUMN IF NOT EXISTS analysis_started_at TIMESTAMPTZ;
ALTER TABLE interviews ADD COLUMN IF NOT EXISTS analysis_completed_at TIMESTAMPTZ;
ALTER TABLE metric_examples ADD COLUMN IF NOT EXISTS question_text TEXT;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'unique_interview_metric') THEN
        ALTER TABLE metrics ADD CONSTRAINT unique_interview_metric UNIQUE (interview_id, metric_name);
    END IF;
END $$;

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_interviews_user_id ON interviews(user_id);
CREATE INDEX IF NOT EXISTS idx_interviews_status ON interviews(status);
CREATE INDEX IF NOT EXISTS idx_transcript_segments_interview ON transcript_segments(interview_id);
CREATE INDEX IF NOT EXISTS idx_metrics_interview ON metrics(interview_id);
CREATE INDEX IF NOT EXISTS idx_patterns_user ON patterns(user_id);
CREATE INDEX IF NOT EXISTS idx_roadmap_tasks_roadmap ON roadmap_tasks(roadmap_id);
CREATE INDEX IF NOT EXISTS idx_simulation_sessions_user ON simulation_sessions(user_id);

-- Phase 3: Compound Indexes for O(logN) dashboard aggregation and filtering
CREATE INDEX IF NOT EXISTS idx_interviews_user_status_date ON interviews(user_id, status, interviewed_at DESC);
CREATE INDEX IF NOT EXISTS idx_metrics_interview_name ON metrics(interview_id, metric_name);
CREATE INDEX IF NOT EXISTS idx_patterns_user_type_severity ON patterns(user_id, pattern_type, severity);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user ON credit_transactions(user_id);
