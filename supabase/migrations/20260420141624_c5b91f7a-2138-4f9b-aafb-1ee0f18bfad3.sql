-- Drop student-era tables
DROP TABLE IF EXISTS public.badges CASCADE;
DROP TABLE IF EXISTS public.budgets CASCADE;
DROP TABLE IF EXISTS public.savings_goals CASCADE;
DROP TABLE IF EXISTS public.transactions CASCADE;

-- Reusable updated_at trigger function (idempotent)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- 1. financial_profile (one row per user)
CREATE TABLE public.financial_profile (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  age integer NOT NULL,
  monthly_income numeric NOT NULL DEFAULT 0,
  monthly_expenses numeric NOT NULL DEFAULT 0,
  current_savings numeric NOT NULL DEFAULT 0,
  current_investments numeric NOT NULL DEFAULT 0,
  current_debt numeric NOT NULL DEFAULT 0,
  has_emergency_fund boolean NOT NULL DEFAULT false,
  has_health_insurance boolean NOT NULL DEFAULT false,
  has_term_insurance boolean NOT NULL DEFAULT false,
  retirement_age_target integer NOT NULL DEFAULT 60,
  expected_return_pct numeric NOT NULL DEFAULT 12,
  inflation_pct numeric NOT NULL DEFAULT 6,
  risk_tolerance text NOT NULL DEFAULT 'moderate',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.financial_profile ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own profile" ON public.financial_profile
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own profile" ON public.financial_profile
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own profile" ON public.financial_profile
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own profile" ON public.financial_profile
  FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER trg_financial_profile_updated_at
  BEFORE UPDATE ON public.financial_profile
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. financial_goals
CREATE TABLE public.financial_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  goal_type text NOT NULL DEFAULT 'other',
  target_amount numeric NOT NULL,
  current_amount numeric NOT NULL DEFAULT 0,
  target_date date,
  monthly_sip_required numeric DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.financial_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own goals" ON public.financial_goals
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own goals" ON public.financial_goals
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own goals" ON public.financial_goals
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own goals" ON public.financial_goals
  FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER trg_financial_goals_updated_at
  BEFORE UPDATE ON public.financial_goals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_financial_goals_user ON public.financial_goals(user_id);

-- 3. personality_results
CREATE TABLE public.personality_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  personality_type text NOT NULL,
  scores jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.personality_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own personality" ON public.personality_results
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own personality" ON public.personality_results
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own personality" ON public.personality_results
  FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_personality_user ON public.personality_results(user_id);

-- 4. chat_messages (for AI mentor conversation)
CREATE TABLE public.chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  conversation_id uuid NOT NULL DEFAULT gen_random_uuid(),
  role text NOT NULL CHECK (role IN ('user','assistant','system')),
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own chats" ON public.chat_messages
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own chats" ON public.chat_messages
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own chats" ON public.chat_messages
  FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_chat_messages_user_conv ON public.chat_messages(user_id, conversation_id, created_at);