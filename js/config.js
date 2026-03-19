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
