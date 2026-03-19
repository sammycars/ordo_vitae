/**
 * Main Application - Ordo_Vitae
 * 
 * Core application logic and view management.
 * See: /projects/websites/design-principles.md
 * 
 * Views are loaded from separate files in js/views/
 */

class App {
    constructor() {
        this.supabase = window.ordoSupabase;
        this.currentUser = null;
        this.currentView = 'visions';
        
        // DOM elements
        this.content = document.querySelector('.content');
        this.navLinks = document.querySelectorAll('.nav-link[data-view]');
        
        // View instances
        this.views = {};
    }

    /**
     * Initialize the app with the logged-in user
     */
    async init(user) {
        this.currentUser = user;
        
        // Set up navigation
        this.setupNavigation();
        
        // Set up theme
        this.setupTheme();
        
        // Load initial view
        await this.loadView('visions');
    }

    /**
     * Set up navigation between views
     */
    setupNavigation() {
        this.navLinks.forEach(link => {
            link.addEventListener('click', async (e) => {
                e.preventDefault();
                const view = e.target.dataset.view;
                if (view) {
                    await this.loadView(view);
                }
            });
        });
    }

    /**
     * Set up theme (dark/light mode)
     */
    setupTheme() {
        const savedTheme = localStorage.getItem('ordo-theme') || 'dark';
        document.documentElement.setAttribute('data-theme', savedTheme);
    }

    /**
     * Toggle theme
     */
    toggleTheme() {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('ordo-theme', next);
    }

    /**
     * Get or create a view instance
     * @param {string} viewName 
     */
    getView(viewName) {
        if (!this.views[viewName]) {
            const className = viewName.charAt(0).toUpperCase() + viewName.slice(1) + 'View';
            if (window[className]) {
                this.views[viewName] = new window[className](this);
            }
        }
        return this.views[viewName];
    }

    /**
     * Load a specific view
     * @param {string} viewName 
     */
    async loadView(viewName) {
        this.currentView = viewName;
        
        // Update active nav link
        this.navLinks.forEach(link => {
            link.classList.toggle('active', link.dataset.view === viewName);
        });

        // Get view instance and render
        const view = this.getView(viewName);
        if (view && view.render) {
            view.render();
            
            // Run diagnostics after view renders
            setTimeout(() => {
                const diag = new window.Diagnostics(this);
                diag.run();
            }, 100);
        } else {
            this.content.innerHTML = '<p>View not found.</p>';
        }
    }
}

// Initialize auth when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.ordoAuth.init();
});

// Export
window.ordoApp = new App();
