# Ordo_Vitae — Data Schema

> Objects and properties for Supabase. Naming convention: `OBJECT_property`

---

## OBJECTS & OBJECT_properties

| OBJECT | OBJECT_properties |
|--------|-------------------|
| **VISION** | VISION_id, VISION_kind, VISION_content, VISION_created_at |
| **GOAL** | GOAL_id, GOAL_quarter_id, GOAL_realm, GOAL_title, GOAL_description, GOAL_completion_status |
| **ACTION** | ACTION_id, ACTION_goal_id, ACTION_title, ACTION_completion_status |
| **TASK** | TASK_id, TASK_action_id, TASK_title, TASK_scheduled_date, TASK_scheduled_time, TASK_completion_status, TASK_rollover |
| **TODO** | TODO_id, TODO_title, TODO_scheduled_date, TODO_scheduled_time, TODO_completion_status, TODO_rollover |
| **QUARTER** | QUARTER_id, QUARTER_year, QUARTER_quarter, QUARTER_start_date, QUARTER_end_date |
| **WEEK** | WEEK_id, WEEK_quarter_id, WEEK_start_date, WEEK_end_date |
| **DAY** | DAY_id, DAY_week_id, DAY_date |
| **HABIT_FATHER** | HABIT_FATHER_id, HABIT_FATHER_name, HABIT_FATHER_target_days, HABIT_FATHER_is_paused, HABIT_FATHER_paused_reason |
| **HABIT_SON** | HABIT_SON_id, HABIT_SON_habit_id, HABIT_SON_date, HABIT_SON_completion_status |

---

## Rollover Logic

- Only TASK and TODO can rollover
- If `scheduled_date < today` and `completion_status != complete`, automatically:
  1. Set `scheduled_date = today`
  2. Set `rollover = yes`
- Display in magenta (see ObjectColor component)

---

## Notes

- All tables should have RLS (Row Level Security) enabled
- Use UUID for all _id columns
- Include `created_at` and `updated_at` timestamps where relevant
- Prefix table names in Supabase (e.g., `ordo_vision`, `ordo_goal`) to avoid conflicts
