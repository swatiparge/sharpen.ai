-- Add credits_balance to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS credits_balance INTEGER DEFAULT 0;

-- Initialize existing users with 60 welcome credits
UPDATE users SET credits_balance = 60 WHERE credits_balance = 0;

-- Create credit_transactions table
CREATE TABLE IF NOT EXISTS credit_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL, -- positive for credits added, negative for spent
    transaction_type TEXT NOT NULL, -- 'WELCOME_BONUS', 'ANALYSIS_SPENT', 'RECONSTRUCT_SPENT', 'TOPUP'
    interview_id UUID REFERENCES interviews(id) ON DELETE SET NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user ON credit_transactions(user_id);
