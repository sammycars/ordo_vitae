/**
 * Configuration - Ordo_Vitae
 * 
 * All configurable values in one place.
 * See: /projects/websites/design-principles.md Section 1.5 (Configuration Over Hard-Coding)
 */

const CONFIG = {
    supabase: {
        url: 'https://abhhlkhclbfzsisaezyv.supabase.co',
        anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiaGhsa2hjbGJmenNpc2Flenl2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3Nzk1MTMsImV4cCI6MjA4OTM1NTUxM30.OqPIHy-Tx5V8iWmPUXWPgsDIU3qN8Qg_emDoqOEJCGY'
    },
    app: {
        name: 'Ordo_Vitae',
        tagline: 'Order your life.'
    },
    features: {
        darkMode: true
    }
};

// Export for use in other modules
window.ORDO_CONFIG = CONFIG;

/**
 * Schema — All table and column names declared in one place.
 * See: /projects/websites/design-principles.md Section 5 (Data Layer)
 * See: docs/schema.sql — intended design (may lag behind actual Supabase schema)
 * 
 * Every column used in code must be listed here. No magic strings allowed.
 * Before adding a column: verify it exists in Supabase AND update schema.sql
 */
const SCHEMA = {

    // ==========================================
    // VISION
    // PK: vision_id (not id). All columns confirmed via service role OpenAPI spec.
    // ==========================================
    VISION: {
        table: 'ordovision',
        kind: {
            three_year: 'three_year',
            fear: 'fear',
            one_year: 'one_year'
        },
        columns: {
            id:             'vision_id',      // Primary key (PostgREST exposes as vision_id, not id)
            user_id:        'user_id',        // FK to auth.users
            vision_kind:    'vision_kind',     // three_year | fear | one_year
            vision_content: 'vision_content', // The vision text
            created_at:     'vision_created_at', // Auto-set by Supabase
            updated_at:     'vision_updated_at'  // Auto-set on update
        }
    },

    // ==========================================
    // QUARTER
    // All columns confirmed via service role OpenAPI spec.
    // ==========================================
    QUARTER: {
        table: 'ordoquarter',
        columns: {
            id:            'quarter_id',          // Primary key
            user_id:       'user_id',             // FK to auth.users
            quarter_year:  'quarter_year',        // INTEGER
            quarter:       'quarter_quarter',     // 1-4
            start_date:    'quarter_start_date',  // DATE
            end_date:      'quarter_end_date',    // DATE
            created_at:    'quarter_created_at'   // Auto-set by Supabase
        }
    },

    // ==========================================
    // WEEK
    // All columns confirmed via service role OpenAPI spec.
    // ==========================================
    WEEK: {
        table: 'ordoweek',
        columns: {
            id:          'week_id',            // Primary key
            user_id:     'user_id',           // FK to auth.users
            quarter_id:  'week_quarter_id',   // FK to ordoquarter(quarter_id)
            start_date:  'week_start_date',   // DATE
            end_date:    'week_end_date',     // DATE
            created_at:  'week_created_at'    // Auto-set by Supabase
        }
    },

    // ==========================================
    // DAY
    // All columns confirmed via service role OpenAPI spec.
    // ==========================================
    DAY: {
        table: 'ordoday',
        columns: {
            id:         'day_id',          // Primary key
            user_id:    'user_id',         // FK to auth.users
            week_id:    'day_week_id',     // FK to ordoweek(week_id)
            date:       'day_date',        // DATE, UNIQUE
            created_at: 'day_created_at'   // Auto-set by Supabase
        }
    },

    // ==========================================
    // GOAL
    // All columns confirmed via service role OpenAPI spec.
    // ==========================================
    GOAL: {
        table: 'ordogoal',
        status: {
            planned:     'planned',
            in_progress: 'in_progress',
            complete:    'complete'
        },
        columns: {
            id:               'goal_id',                // Primary key
            user_id:          'user_id',                // FK to auth.users
            quarter_id:       'goal_quarter_id',        // FK to ordoquarter(quarter_id), nullable
            realm:            'goal_realm',             // TEXT
            title:            'goal_title',             // TEXT, NOT NULL
            description:      'goal_description',       // TEXT
            completion_status: 'goal_completion_status', // planned | in_progress | complete
            created_at:       'goal_created_at',         // Auto-set by Supabase
            updated_at:       'goal_updated_at'          // Auto-set on update
        }
    },

    // ==========================================
    // ACTION
    // FK to GOAL is action_goal_id (not goal_id). Confirmed via OpenAPI spec.
    // ==========================================
    ACTION: {
        table: 'ordoaction',
        status: {
            pending:  'pending',
            complete: 'complete'
        },
        columns: {
            id:               'action_id',              // Primary key
            user_id:          'user_id',                // FK to auth.users
            goal_id:          'action_goal_id',        // FK to ordogoal(goal_id)
            title:            'action_title',          // TEXT, NOT NULL
            completion_status: 'action_completion_status', // pending | complete
            created_at:       'action_created_at',      // Auto-set by Supabase
            updated_at:       'action_updated_at'        // Auto-set on update
        }
    },

    // ==========================================
    // TASK
    // FK to ACTION is task_action_id (not action_id). Confirmed via OpenAPI spec.
    // ==========================================
    TASK: {
        table: 'ordotask',
        status: {
            pending:  'pending',
            complete: 'complete'
        },
        columns: {
            id:               'task_id',                // Primary key
            user_id:          'user_id',                // FK to auth.users
            action_id:        'task_action_id',        // FK to ordoaction(action_id)
            title:            'task_title',            // TEXT, NOT NULL
            scheduled_date:   'task_scheduled_date',   // DATE (nullable)
            scheduled_time:   'task_scheduled_time',   // TIME (nullable)
            completion_status: 'task_completion_status', // pending | complete
            rollover:         'task_rollover',         // BOOLEAN
            created_at:       'task_created_at',        // Auto-set by Supabase
            updated_at:       'task_updated_at'         // Auto-set on update
        }
    },

    // ==========================================
    // TODO
    // All columns confirmed via service role OpenAPI spec.
    // ==========================================
    TODO: {
        table: 'ordotodo',
        status: {
            pending:  'pending',
            complete: 'complete'
        },
        columns: {
            id:               'todo_id',               // Primary key
            user_id:          'user_id',               // FK to auth.users
            title:            'todo_title',           // TEXT, NOT NULL
            scheduled_date:   'todo_scheduled_date',  // DATE (nullable)
            scheduled_time:   'todo_scheduled_time',  // TIME (nullable)
            completion_status: 'todo_completion_status', // pending | complete
            rollover:         'todo_rollover',        // BOOLEAN
            created_at:       'todo_created_at',       // Auto-set by Supabase
            updated_at:       'todo_updated_at'        // Auto-set on update
        }
    },

    // ==========================================
    // HABIT_FATHER
    // All columns confirmed via service role OpenAPI spec.
    // ==========================================
    HABIT_FATHER: {
        table: 'ordohabit_father',
        columns: {
            id:            'habit_father_id',    // Primary key
            user_id:       'user_id',            // FK to auth.users
            name:          'habit_father_name', // TEXT, NOT NULL
            target_days:   'habit_father_target_days', // INTEGER, default 7
            is_paused:     'habit_father_is_paused',   // BOOLEAN
            paused_reason: 'habit_father_paused_reason', // TEXT (nullable)
            created_at:    'habit_father_created_at',  // Auto-set by Supabase
            updated_at:    'habit_father_updated_at'   // Auto-set on update
        }
    },

    // ==========================================
    // HABIT_SON
    // FK to HABIT_FATHER is habit_son_habit_id (not habit_id). Confirmed via OpenAPI spec.
    // ==========================================
    HABIT_SON: {
        table: 'ordohabit_son',
        status: {
            pending:  'pending',
            complete: 'complete'
        },
        columns: {
            id:                 'habit_son_id',              // Primary key
            user_id:            'user_id',                   // FK to auth.users
            habit_id:           'habit_son_habit_id',        // FK to ordohabit_father(habit_father_id)
            date:               'habit_son_date',            // DATE, NOT NULL
            completion_status:  'habit_son_completion_status', // pending | complete
            created_at:         'habit_son_created_at'        // Auto-set by Supabase
            // UNIQUE(habit_son_habit_id, habit_son_date) enforced at DB level
        }
    }
};
