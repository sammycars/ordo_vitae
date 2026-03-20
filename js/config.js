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
 * See: docs/schema.sql — source of truth for actual Supabase columns
 * 
 * Every column used in code must be listed here. No magic strings allowed.
 * Before adding a column: verify it exists in Supabase AND document it in schema.sql
 */
const SCHEMA = {
    // VISION table (ordovision)
    // Schema: docs/schema.sql — ordovision
    VISION: {
        table: 'ordovision',
        kind: {
            three_year: 'three_year',
            fear: 'fear',
            one_year: 'one_year'
        },
        columns: {
            id:          'id',          // Primary key (Supabase auto-exposes as 'id')
            user_id:     'user_id',     // FK to auth.users
            vision_kind: 'vision_kind', // three_year | fear | one_year
            vision_content: 'vision_content', // The vision text
            created_at:  'created_at',  // Auto-set by Supabase
            updated_at:  'updated_at'   // Auto-set on update
        }
    }
};
