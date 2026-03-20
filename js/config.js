/**
 * Configuration - Ordo_Vitae
 * 
 * All configurable values in one place.
 * See: /projects/websites/design-principles.md Section 1.5 (Configuration Over Hard-Coding)
 */

// Supabase configuration
// TODO: Replace with your actual Supabase credentials
const CONFIG = {
    supabase: {
        url: 'https://abhhlkhclbfzsisaezyv.supabase.co',
        anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiaGhsa2hjbGJmenNpc2Flenl2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3Nzk1MTMsImV4cCI6MjA4OTM1NTUxM30.OqPIHy-Tx5V8iWmPUXWPgsDIU3qN8Qg_emDoqOEJCGY'
    },
    
    // App settings
    app: {
        name: 'Ordo_Vitae',
        tagline: 'Order your life.'
    },
    
    // Feature flags
    features: {
        darkMode: true  // Default to dark mode
    }
};

// Export for use in other modules
window.ORDO_CONFIG = CONFIG;

/**
 * Schema — All table and column names declared in one place.
 * See: /projects/websites/design-principles.md Section 5 (Data Layer)
 * See: docs/schema.sql — source of truth for intended schema
 * 
 * Every column used in code must be listed here. No magic strings allowed.
 * Before adding a column: verify it exists in Supabase AND document it in schema.sql
 * 
 * NOTE: Only VISION column names are verified against actual Supabase.
 * Other tables follow schema.sql naming but have NOT been confirmed against Supabase yet.
 * Run 2.6 (Andy gate) to verify all tables before Phase 3.
 */
const SCHEMA = {

    // ==========================================
    // VISION
    // Verified: column names confirmed against actual Supabase table
    // ==========================================
    VISION: {
        table: 'ordovision',
        kind: {
            three_year: 'three_year',
            fear: 'fear',
            one_year: 'one_year'
        },
        columns: {
            id:             'id',              // Primary key (Supabase auto-exposes as 'id')
            user_id:        'user_id',         // FK to auth.users
            vision_kind:    'vision_kind',     // three_year | fear | one_year
            vision_content: 'vision_content',  // The vision text
            created_at:     'created_at',      // Auto-set by Supabase
            updated_at:     'updated_at'       // Auto-set on update
        }
    },

    // ==========================================
    // QUARTER
    // Not yet verified against Supabase — names from schema.sql
    // ==========================================
    QUARTER: {
        table: 'ordoquarter',
        columns: {
            id:              'id',               // Primary key (auto-exposed as 'id' by Supabase)
            user_id:         'user_id',          // FK to auth.users
            quarter_year:    'quarter_year',     // INTEGER
            quarter:         'quarter',          // 1-4
            start_date:      'start_date',       // DATE
            end_date:        'end_date',         // DATE
            created_at:      'created_at'        // Auto-set by Supabase
        }
    },

    // ==========================================
    // WEEK
    // Not yet verified against Supabase — names from schema.sql
    // ==========================================
    WEEK: {
        table: 'ordoweek',
        columns: {
            id:           'id',            // Primary key
            user_id:      'user_id',       // FK to auth.users
            quarter_id:   'quarter_id',    // FK to ordoquarter
            start_date:   'start_date',    // DATE
            end_date:     'end_date',      // DATE
            created_at:   'created_at'     // Auto-set by Supabase
        }
    },

    // ==========================================
    // DAY
    // Not yet verified against Supabase — names from schema.sql
    // ==========================================
    DAY: {
        table: 'ordoday',
        columns: {
            id:         'id',         // Primary key
            user_id:    'user_id',    // FK to auth.users
            week_id:    'week_id',    // FK to ordoweek
            date:       'date',       // DATE, UNIQUE
            created_at: 'created_at'  // Auto-set by Supabase
        }
    },

    // ==========================================
    // GOAL
    // Not yet verified against Supabase — names from schema.sql
    // ==========================================
    GOAL: {
        table: 'ordogoal',
        status: {
            planned:    'planned',
            in_progress: 'in_progress',
            complete:   'complete'
        },
        columns: {
            id:               'id',                // Primary key
            user_id:          'user_id',           // FK to auth.users
            quarter_id:       'quarter_id',        // FK to ordoquarter (nullable)
            realm:            'realm',             // TEXT
            title:            'title',             // TEXT, NOT NULL
            description:       'description',       // TEXT
            completion_status: 'completion_status', // planned | in_progress | complete
            created_at:       'created_at',         // Auto-set by Supabase
            updated_at:       'updated_at'          // Auto-set on update
        }
    },

    // ==========================================
    // ACTION
    // Not yet verified against Supabase — names from schema.sql
    // ==========================================
    ACTION: {
        table: 'ordoaction',
        status: {
            pending:  'pending',
            complete: 'complete'
        },
        columns: {
            id:               'id',                // Primary key
            user_id:          'user_id',           // FK to auth.users
            goal_id:          'goal_id',          // FK to ordogoal
            title:            'title',             // TEXT, NOT NULL
            completion_status: 'completion_status', // pending | complete
            created_at:       'created_at',         // Auto-set by Supabase
            updated_at:       'updated_at'          // Auto-set on update
        }
    },

    // ==========================================
    // TASK
    // Not yet verified against Supabase — names from schema.sql
    // ==========================================
    TASK: {
        table: 'ordotask',
        status: {
            pending:  'pending',
            complete: 'complete'
        },
        columns: {
            id:               'id',                // Primary key
            user_id:          'user_id',           // FK to auth.users
            action_id:        'action_id',         // FK to ordoaction
            title:            'title',             // TEXT, NOT NULL
            scheduled_date:   'scheduled_date',    // DATE (nullable)
            scheduled_time:   'scheduled_time',    // TIME (nullable)
            completion_status: 'completion_status', // pending | complete
            rollover:         'rollover',          // BOOLEAN
            created_at:       'created_at',         // Auto-set by Supabase
            updated_at:       'updated_at'          // Auto-set on update
        }
    },

    // ==========================================
    // TODO
    // Not yet verified against Supabase — names from schema.sql
    // ==========================================
    TODO: {
        table: 'ordotodo',
        status: {
            pending:  'pending',
            complete: 'complete'
        },
        columns: {
            id:               'id',                // Primary key
            user_id:          'user_id',           // FK to auth.users
            title:            'title',             // TEXT, NOT NULL
            scheduled_date:   'scheduled_date',   // DATE (nullable)
            scheduled_time:   'scheduled_time',   // TIME (nullable)
            completion_status: 'completion_status', // pending | complete
            rollover:         'rollover',          // BOOLEAN
            created_at:       'created_at',         // Auto-set by Supabase
            updated_at:       'updated_at'          // Auto-set on update
        }
    },

    // ==========================================
    // HABIT_FATHER
    // Not yet verified against Supabase — names from schema.sql
    // ==========================================
    HABIT_FATHER: {
        table: 'ordohabit_father',
        columns: {
            id:            'id',             // Primary key
            user_id:       'user_id',        // FK to auth.users
            name:          'name',           // TEXT, NOT NULL
            target_days:   'target_days',    // INTEGER, default 7
            is_paused:     'is_paused',      // BOOLEAN
            paused_reason: 'paused_reason',  // TEXT (nullable)
            created_at:    'created_at',     // Auto-set by Supabase
            updated_at:    'updated_at'      // Auto-set on update
        }
    },

    // ==========================================
    // HABIT_SON
    // Not yet verified against Supabase — names from schema.sql
    // ==========================================
    HABIT_SON: {
        table: 'ordohabit_son',
        status: {
            pending:  'pending',
            complete: 'complete'
        },
        columns: {
            id:                 'id',                  // Primary key
            user_id:            'user_id',             // FK to auth.users
            habit_id:           'habit_id',            // FK to ordohabit_father
            date:               'date',                // DATE, NOT NULL
            completion_status:  'completion_status',   // pending | complete
            created_at:         'created_at'           // Auto-set by Supabase
            // UNIQUE(habit_id, date) enforced at DB level
        }
    }
};
