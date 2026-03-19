-- Ordo_Vitae — Supabase Schema
-- Phase 2: Data Schema
-- Naming convention: OBJECT_property

-- ==========================================
-- VISION
-- ==========================================
CREATE TABLE IF NOT EXISTS ordovision (
    VISION_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    VISION_kind TEXT NOT NULL CHECK (VISION_kind IN ('three_year', 'fear', 'one_year')),
    VISION_content TEXT,
    VISION_created_at TIMESTAMPTZ DEFAULT now(),
    VISION_updated_at TIMESTAMPTZ DEFAULT now()
);

-- ==========================================
-- QUARTER
-- ==========================================
CREATE TABLE IF NOT EXISTS ordoquarter (
    QUARTER_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    QUARTER_year INTEGER NOT NULL,
    QUARTER_quarter INTEGER NOT NULL CHECK (QUARTER_quarter BETWEEN 1 AND 4),
    QUARTER_start_date DATE NOT NULL,
    QUARTER_end_date DATE NOT NULL,
    QUARTER_created_at TIMESTAMPTZ DEFAULT now()
);

-- ==========================================
-- WEEK
-- ==========================================
CREATE TABLE IF NOT EXISTS ordoweek (
    WEEK_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    WEEK_quarter_id UUID REFERENCES ordoquarter(QUARTER_id) ON DELETE CASCADE,
    WEEK_start_date DATE NOT NULL,
    WEEK_end_date DATE NOT NULL,
    WEEK_created_at TIMESTAMPTZ DEFAULT now()
);

-- ==========================================
-- DAY
-- ==========================================
CREATE TABLE IF NOT EXISTS ordoday (
    DAY_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    DAY_week_id UUID REFERENCES ordoweek(WEEK_id) ON DELETE SET NULL,
    DAY_date DATE UNIQUE NOT NULL,
    DAY_created_at TIMESTAMPTZ DEFAULT now()
);

-- ==========================================
-- GOAL
-- ==========================================
CREATE TABLE IF NOT EXISTS ordogoal (
    GOAL_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    GOAL_quarter_id UUID REFERENCES ordoquarter(QUARTER_id) ON DELETE SET NULL,
    GOAL_realm TEXT,
    GOAL_title TEXT NOT NULL,
    GOAL_description TEXT,
    GOAL_completion_status TEXT DEFAULT 'planned' CHECK (GOAL_completion_status IN ('planned', 'in_progress', 'complete')),
    GOAL_created_at TIMESTAMPTZ DEFAULT now(),
    GOAL_updated_at TIMESTAMPTZ DEFAULT now()
);

-- ==========================================
-- ACTION
-- ==========================================
CREATE TABLE IF NOT EXISTS ordoaction (
    ACTION_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    ACTION_goal_id UUID REFERENCES ordogoal(GOAL_id) ON DELETE CASCADE,
    ACTION_title TEXT NOT NULL,
    ACTION_completion_status TEXT DEFAULT 'pending' CHECK (ACTION_completion_status IN ('pending', 'complete')),
    ACTION_created_at TIMESTAMPTZ DEFAULT now(),
    ACTION_updated_at TIMESTAMPTZ DEFAULT now()
);

-- ==========================================
-- TASK
-- ==========================================
CREATE TABLE IF NOT EXISTS ordotask (
    TASK_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    TASK_action_id UUID REFERENCES ordoaction(ACTION_id) ON DELETE CASCADE,
    TASK_title TEXT NOT NULL,
    TASK_scheduled_date DATE,
    TASK_scheduled_time TIME,
    TASK_completion_status TEXT DEFAULT 'pending' CHECK (TASK_completion_status IN ('pending', 'complete')),
    TASK_rollover BOOLEAN DEFAULT false,
    TASK_created_at TIMESTAMPTZ DEFAULT now(),
    TASK_updated_at TIMESTAMPTZ DEFAULT now()
);

-- ==========================================
-- TODO
-- ==========================================
CREATE TABLE IF NOT EXISTS ordotodo (
    TODO_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    TODO_title TEXT NOT NULL,
    TODO_scheduled_date DATE,
    TODO_scheduled_time TIME,
    TODO_completion_status TEXT DEFAULT 'pending' CHECK (TODO_completion_status IN ('pending', 'complete')),
    TODO_rollover BOOLEAN DEFAULT false,
    TODO_created_at TIMESTAMPTZ DEFAULT now(),
    TODO_updated_at TIMESTAMPTZ DEFAULT now()
);

-- ==========================================
-- HABIT_FATHER
-- ==========================================
CREATE TABLE IF NOT EXISTS ordohabit_father (
    HABIT_FATHER_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    HABIT_FATHER_name TEXT NOT NULL,
    HABIT_FATHER_target_days INTEGER DEFAULT 7,
    HABIT_FATHER_is_paused BOOLEAN DEFAULT false,
    HABIT_FATHER_paused_reason TEXT,
    HABIT_FATHER_created_at TIMESTAMPTZ DEFAULT now(),
    HABIT_FATHER_updated_at TIMESTAMPTZ DEFAULT now()
);

-- ==========================================
-- HABIT_SON
-- ==========================================
CREATE TABLE IF NOT EXISTS ordohabit_son (
    HABIT_SON_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    HABIT_SON_habit_id UUID REFERENCES ordohabit_father(HABIT_FATHER_id) ON DELETE CASCADE,
    HABIT_SON_date DATE NOT NULL,
    HABIT_SON_completion_status TEXT DEFAULT 'pending' CHECK (HABIT_SON_completion_status IN ('pending', 'complete')),
    HABIT_SON_created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(HABIT_SON_habit_id, HABIT_SON_date)
);

-- ==========================================
-- Indexes
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_vision_user ON ordovision(user_id);
CREATE INDEX IF NOT EXISTS idx_quarter_user ON ordoquarter(user_id);
CREATE INDEX IF NOT EXISTS idx_week_user ON ordoweek(user_id);
CREATE INDEX IF NOT EXISTS idx_day_user ON ordoday(user_id);
CREATE INDEX IF NOT EXISTS idx_day_date ON ordoday(DAY_date);
CREATE INDEX IF NOT EXISTS idx_goal_user ON ordogoal(user_id);
CREATE INDEX IF NOT EXISTS idx_goal_quarter ON ordogoal(GOAL_quarter_id);
CREATE INDEX IF NOT EXISTS idx_action_user ON ordoaction(user_id);
CREATE INDEX IF NOT EXISTS idx_action_goal ON ordoaction(ACTION_goal_id);
CREATE INDEX IF NOT EXISTS idx_task_user ON ordotask(user_id);
CREATE INDEX IF NOT EXISTS idx_task_date ON ordotask(TASK_scheduled_date);
CREATE INDEX IF NOT EXISTS idx_todo_user ON ordotodo(user_id);
CREATE INDEX IF NOT EXISTS idx_todo_date ON ordotodo(TODO_scheduled_date);
CREATE INDEX IF NOT EXISTS idx_habit_user ON ordohabit_father(user_id);
CREATE INDEX IF NOT EXISTS idx_habit_son_habit ON ordohabit_son(HABIT_SON_habit_id);
CREATE INDEX IF NOT EXISTS idx_habit_son_date ON ordohabit_son(HABIT_SON_date);

-- ==========================================
-- RLS (Row Level Security) - Enable for all tables
-- ==========================================
ALTER TABLE ordovision ENABLE ROW LEVEL SECURITY;
ALTER TABLE ordoquarter ENABLE ROW LEVEL SECURITY;
ALTER TABLE ordoweek ENABLE ROW LEVEL SECURITY;
ALTER TABLE ordoday ENABLE ROW LEVEL SECURITY;
ALTER TABLE ordogoal ENABLE ROW LEVEL SECURITY;
ALTER TABLE ordoaction ENABLE ROW LEVEL SECURITY;
ALTER TABLE ordotask ENABLE ROW LEVEL SECURITY;
ALTER TABLE ordotodo ENABLE ROW LEVEL SECURITY;
ALTER TABLE ordohabit_father ENABLE ROW LEVEL SECURITY;
ALTER TABLE ordohabit_son ENABLE ROW LEVEL SECURITY;

-- Create policies (users can only see their own data)
CREATE POLICY "Users can view own vision" ON ordovision FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own vision" ON ordovision FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own vision" ON ordovision FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own vision" ON ordovision FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own quarter" ON ordoquarter FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own quarter" ON ordoquarter FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own quarter" ON ordoquarter FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own quarter" ON ordoquarter FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own week" ON ordoweek FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own week" ON ordoweek FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own week" ON ordoweek FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own week" ON ordoweek FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own day" ON ordoday FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own day" ON ordoday FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own day" ON ordoday FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own day" ON ordoday FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own goal" ON ordogoal FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own goal" ON ordogoal FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own goal" ON ordogoal FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own goal" ON ordogoal FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own action" ON ordoaction FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own action" ON ordoaction FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own action" ON ordoaction FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own action" ON ordoaction FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own task" ON ordotask FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own task" ON ordotask FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own task" ON ordotask FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own task" ON ordotask FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own todo" ON ordotodo FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own todo" ON ordotodo FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own todo" ON ordotodo FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own todo" ON ordotodo FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own habit_father" ON ordohabit_father FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own habit_father" ON ordohabit_father FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own habit_father" ON ordohabit_father FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own habit_father" ON ordohabit_father FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own habit_son" ON ordohabit_son FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own habit_son" ON ordohabit_son FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own habit_son" ON ordohabit_son FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own habit_son" ON ordohabit_son FOR DELETE USING (auth.uid() = user_id);
