-- Ordo_Vitae — Supabase Schema
-- Phase 2: Data Schema
-- Naming convention: object_prefix_column_name (confirmed against actual Supabase)

-- ==========================================
-- VISION
-- ==========================================
CREATE TABLE IF NOT EXISTS ordovision (
    vision_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    vision_kind TEXT NOT NULL CHECK (vision_kind IN ('three_year', 'fear', 'one_year')),
    vision_content TEXT,
    vision_created_at TIMESTAMPTZ DEFAULT now(),
    vision_updated_at TIMESTAMPTZ DEFAULT now()
);

-- ==========================================
-- QUARTER
-- ==========================================
CREATE TABLE IF NOT EXISTS ordoquarter (
    quarter_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    quarter_year INTEGER NOT NULL,
    quarter INTEGER NOT NULL CHECK (quarter BETWEEN 1 AND 4),
    quarter_start_date DATE NOT NULL,
    quarter_end_date DATE NOT NULL,
    quarter_created_at TIMESTAMPTZ DEFAULT now()
);

-- ==========================================
-- WEEK
-- ==========================================
CREATE TABLE IF NOT EXISTS ordoweek (
    week_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    week_quarter_id UUID REFERENCES ordoquarter(quarter_id) ON DELETE CASCADE,
    week_start_date DATE NOT NULL,
    week_end_date DATE NOT NULL,
    week_created_at TIMESTAMPTZ DEFAULT now()
);

-- ==========================================
-- DAY
-- ==========================================
CREATE TABLE IF NOT EXISTS ordoday (
    day_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    day_week_id UUID REFERENCES ordoweek(week_id) ON DELETE SET NULL,
    day_date DATE UNIQUE NOT NULL,
    day_created_at TIMESTAMPTZ DEFAULT now()
);

-- ==========================================
-- GOAL
-- ==========================================
CREATE TABLE IF NOT EXISTS ordogoal (
    goal_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    goal_quarter_id UUID REFERENCES ordoquarter(quarter_id) ON DELETE SET NULL,
    realm TEXT,
    title TEXT NOT NULL,
    description TEXT,
    completion_status TEXT DEFAULT 'planned' CHECK (completion_status IN ('planned', 'in_progress', 'complete')),
    goal_created_at TIMESTAMPTZ DEFAULT now(),
    goal_updated_at TIMESTAMPTZ DEFAULT now()
);

-- ==========================================
-- ACTION
-- ==========================================
CREATE TABLE IF NOT EXISTS ordoaction (
    action_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    action_goal_id UUID REFERENCES ordogoal(goal_id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    completion_status TEXT DEFAULT 'pending' CHECK (completion_status IN ('pending', 'complete')),
    action_created_at TIMESTAMPTZ DEFAULT now(),
    action_updated_at TIMESTAMPTZ DEFAULT now()
);

-- ==========================================
-- TASK
-- ==========================================
CREATE TABLE IF NOT EXISTS ordotask (
    task_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    task_action_id UUID REFERENCES ordoaction(action_id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    scheduled_date DATE,
    scheduled_time TIME,
    completion_status TEXT DEFAULT 'pending' CHECK (completion_status IN ('pending', 'complete')),
    rollover BOOLEAN DEFAULT false,
    task_created_at TIMESTAMPTZ DEFAULT now(),
    task_updated_at TIMESTAMPTZ DEFAULT now()
);

-- ==========================================
-- TODO
-- ==========================================
CREATE TABLE IF NOT EXISTS ordotodo (
    todo_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    scheduled_date DATE,
    scheduled_time TIME,
    completion_status TEXT DEFAULT 'pending' CHECK (completion_status IN ('pending', 'complete')),
    rollover BOOLEAN DEFAULT false,
    todo_created_at TIMESTAMPTZ DEFAULT now(),
    todo_updated_at TIMESTAMPTZ DEFAULT now()
);

-- ==========================================
-- HABIT_FATHER
-- ==========================================
CREATE TABLE IF NOT EXISTS ordohabit_father (
    habit_father_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    target_days INTEGER DEFAULT 7,
    is_paused BOOLEAN DEFAULT false,
    paused_reason TEXT,
    habit_father_created_at TIMESTAMPTZ DEFAULT now(),
    habit_father_updated_at TIMESTAMPTZ DEFAULT now()
);

-- ==========================================
-- HABIT_SON
-- ==========================================
CREATE TABLE IF NOT EXISTS ordohabit_son (
    habit_son_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    habit_son_habit_id UUID REFERENCES ordohabit_father(habit_father_id) ON DELETE CASCADE,
    date DATE NOT NULL,
    completion_status TEXT DEFAULT 'pending' CHECK (completion_status IN ('pending', 'complete')),
    habit_son_created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(habit_son_habit_id, date)
);

-- ==========================================
-- Indexes
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_vision_user ON ordovision(user_id);
CREATE INDEX IF NOT EXISTS idx_quarter_user ON ordoquarter(user_id);
CREATE INDEX IF NOT EXISTS idx_week_user ON ordoweek(user_id);
CREATE INDEX IF NOT EXISTS idx_day_user ON ordoday(user_id);
CREATE INDEX IF NOT EXISTS idx_day_date ON ordoday(day_date);
CREATE INDEX IF NOT EXISTS idx_goal_user ON ordogoal(user_id);
CREATE INDEX IF NOT EXISTS idx_goal_quarter ON ordogoal(goal_quarter_id);
CREATE INDEX IF NOT EXISTS idx_action_user ON ordoaction(user_id);
CREATE INDEX IF NOT EXISTS idx_action_goal ON ordoaction(action_goal_id);
CREATE INDEX IF NOT EXISTS idx_task_user ON ordotask(user_id);
CREATE INDEX IF NOT EXISTS idx_task_date ON ordotask(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_todo_user ON ordotodo(user_id);
CREATE INDEX IF NOT EXISTS idx_todo_date ON ordotodo(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_habit_user ON ordohabit_father(user_id);
CREATE INDEX IF NOT EXISTS idx_habit_son_habit ON ordohabit_son(habit_son_habit_id);
CREATE INDEX IF NOT EXISTS idx_habit_son_date ON ordohabit_son(date);

-- ==========================================
-- RLS (Row Level Security)
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
