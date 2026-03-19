/**
 * Main Application - Ordo_Vitae
 * 
 * Core application logic and view management.
 * See: /projects/websites/design-principles.md
 */

class App {
    constructor() {
        this.supabase = window.ordoSupabase;
        this.currentUser = null;
        this.currentView = 'visions';
        
        // DOM elements
        this.content = document.querySelector('.content');
        this.navLinks = document.querySelectorAll('.nav-link[data-view]');
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
     * Load a specific view
     * @param {string} viewName 
     */
    async loadView(viewName) {
        this.currentView = viewName;
        
        // Update active nav link
        this.navLinks.forEach(link => {
            link.classList.toggle('active', link.dataset.view === viewName);
        });

        // Load view content
        switch (viewName) {
            case 'visions':
                await this.renderVisions();
                break;
            case 'goals':
                await this.renderGoals();
                break;
            case 'weekly':
                await this.renderWeekly();
                break;
            case 'daily':
                await this.renderDaily();
                break;
            default:
                this.content.innerHTML = '<p>View not found.</p>';
        }
    }

    /**
     * Render Visions view
     * See: Phase 4.1 - Implement visions (3-Year, Fear, 1-Year)
     */
    async renderVisions() {
        const html = `
            <div class="tabs">
                <div class="tab active" data-tab="3year">3-Year Vision</div>
                <div class="tab" data-tab="fear">Fear Vision</div>
                <div class="tab" data-tab="1year">1-Year Vision</div>
            </div>
            
            <div class="tab-content active" id="tab-3year">
                <div class="card">
                    <div class="card-header">
                        <span class="card-title">3-Year Vision</span>
                        <button class="btn">[ Edit ]</button>
                    </div>
                    <p class="placeholder">Your 3-year vision will appear here.</p>
                </div>
            </div>
            
            <div class="tab-content" id="tab-fear">
                <div class="card">
                    <div class="card-header">
                        <span class="card-title">Fear Vision</span>
                        <button class="btn">[ Edit ]</button>
                    </div>
                    <p class="placeholder">Your fear vision will appear here.</p>
                </div>
            </div>
            
            <div class="tab-content" id="tab-1year">
                <div class="card">
                    <div class="card-header">
                        <span class="card-title">1-Year Vision</span>
                        <button class="btn">[ Edit ]</button>
                    </div>
                    <p class="placeholder">Your 1-year vision will appear here.</p>
                </div>
            </div>
        `;
        
        this.content.innerHTML = html;
        this.setupTabs();
    }

    /**
     * Render Goals view
     * See: Phase 4.2 - Implement quarterly goals
     */
    async renderGoals() {
        const html = `
            <div class="card">
                <div class="card-header">
                    <span class="card-title">Quarterly Goals</span>
                    <button class="btn">[ + Add ]</button>
                </div>
                <p class="placeholder">Your quarterly goals will appear here.</p>
            </div>
        `;
        
        this.content.innerHTML = html;
    }

    /**
     * Render Weekly view
     * See: Phase 4.3 - Implement weekly planning
     */
    async renderWeekly() {
        const html = `
            <div class="card">
                <div class="card-header">
                    <span class="card-title">Weekly Plan</span>
                    <button class="btn">[ + Add ]</button>
                </div>
                <p class="placeholder">Your weekly plan will appear here.</p>
            </div>
        `;
        
        this.content.innerHTML = html;
    }

    /**
     * Render Daily view
     * See: Phase 4.4 - Implement daily planning
     */
    async renderDaily() {
        const html = `
            <div class="card">
                <div class="card-header">
                    <span class="card-title">Daily Plan</span>
                    <button class="btn">[ + Add ]</button>
                </div>
                <p class="placeholder">Your daily plan will appear here.</p>
            </div>
        `;
        
        this.content.innerHTML = html;
    }

    /**
     * Set up tab switching
     */
    setupTabs() {
        const tabs = document.querySelectorAll('.tab');
        const contents = document.querySelectorAll('.tab-content');
        
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const tabId = tab.dataset.tab;
                
                // Update active tab
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                // Show corresponding content
                contents.forEach(c => {
                    c.classList.toggle('active', c.id === `tab-${tabId}`);
                });
            });
        });
    }
}

// Initialize auth when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.ordoAuth.init();
});

// Export
window.ordoApp = new App();
