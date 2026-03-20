# Ordo_Vitae — Data Schema

> Objects and properties for Supabase. Naming convention: `object_prefix_column_name` (confirmed against actual Supabase via service role API)

---

## OBJECTS & OBJECT_properties

| OBJECT | OBJECT_properties |
|--------|-------------------|
| **VISION** | vision_id, user_id, vision_kind, vision_content, vision_created_at, vision_updated_at |
| **GOAL** | goal_id, user_id, goal_quarter_id, realm, title, description, completion_status, goal_created_at, goal_updated_at |
| **ACTION** | action_id, user_id, action_goal_id, title, completion_status, action_created_at, action_updated_at |
| **TASK** | task_id, user_id, task_action_id, title, scheduled_date, scheduled_time, completion_status, rollover, task_created_at, task_updated_at |
| **TODO** | todo_id, user_id, title, scheduled_date, scheduled_time, completion_status, rollover, todo_created_at, todo_updated_at |
| **QUARTER** | quarter_id, user_id, quarter_year, quarter, quarter_start_date, quarter_end_date, quarter_created_at |
| **WEEK** | week_id, user_id, week_quarter_id, week_start_date, week_end_date, week_created_at |
| **DAY** | day_id, user_id, day_week_id, day_date, day_created_at |
| **HABIT_FATHER** | habit_father_id, user_id, name, target_days, is_paused, paused_reason, habit_father_created_at, habit_father_updated_at |
| **HABIT_SON** | habit_son_id, user_id, habit_son_habit_id, date, completion_status, habit_son_created_at |

---

## Enum Values

| Column | Allowed Values |
|--------|---------------|
| vision_kind | `three_year`, `fear`, `one_year` |
| completion_status (GOAL) | `planned`, `in_progress`, `complete` |
| completion_status (ACTION) | `pending`, `complete` |
| completion_status (TASK) | `pending`, `complete` |
| completion_status (TODO) | `pending`, `complete` |
| completion_status (HABIT_SON) | `pending`, `complete` |

---

## Rollover Logic

- Only TASK and TODO can rollover
- If `scheduled_date < today` and `completion_status != complete`, automatically:
  1. Set `scheduled_date = today`
  2. Set `rollover = true`
- Display in magenta (see ObjectColor component)

---

## Notes

- All tables have RLS (Row Level Security) enabled — users can only access their own data
- All tables prefixed with `ordo` to avoid conflicts (e.g., `ordovision`, `ordogoal`)
- FK references use the actual column name, not the table name as prefix:
  - WEEK → QUARTER: `week_quarter_id` → `ordoquarter(quarter_id)`
  - DAY → WEEK: `day_week_id` → `ordoweek(week_id)`
  - GOAL → QUARTER: `goal_quarter_id` → `ordoquarter(quarter_id)`
  - ACTION → GOAL: `action_goal_id` → `ordogoal(goal_id)`
  - TASK → ACTION: `task_action_id` → `ordoaction(action_id)`
  - HABIT_SON → HABIT_FATHER: `habit_son_habit_id` → `ordohabit_father(habit_father_id)`
