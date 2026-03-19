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
        url: 'YOUR_SUPABASE_URL',
        anonKey: 'YOUR_SUPABASE_ANON_KEY'
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
