/**
 * Authentication Module - Ordo_Vitae
 * 
 * Handles login, signup, logout via Supabase Auth.
 * See: /projects/websites/design-principles.md Section 2.2 (Authentication)
 */

class Auth {
    constructor() {
        this.supabase = window.ordoSupabase;
        this.currentUser = null;
        
        // DOM elements
        this.loginView = document.getElementById('login-view');
        this.dashboardView = document.getElementById('dashboard-view');
        this.emailInput = document.getElementById('email');
        this.passwordInput = document.getElementById('password');
        this.loginBtn = document.getElementById('login-btn');
        this.signupBtn = document.getElementById('signup-btn');
        this.logoutBtn = document.getElementById('logout-btn');
    }

    /**
     * Initialize auth - check if user is already logged in
     */
    async init() {
        // Set up event listeners
        this.loginBtn.addEventListener('click', () => this.login());
        this.signupBtn.addEventListener('click', () => this.signup());
        this.logoutBtn.addEventListener('click', () => this.logout());

        // Listen for auth state changes
        this.supabase.onAuthChange((event, session) => {
            if (session) {
                this.currentUser = session.user;
                this.showDashboard();
            } else {
                this.currentUser = null;
                this.showLogin();
            }
        });

        // Check for existing session
        try {
            const user = await this.supabase.getUser();
            if (user) {
                this.currentUser = user;
                this.showDashboard();
            } else {
                this.showLogin();
            }
        } catch (err) {
            console.error('Auth check failed:', err);
            this.showLogin();
        }
    }

    /**
     * Handle login
     */
    async login() {
        const email = this.emailInput.value.trim();
        const password = this.passwordInput.value;

        if (!email || !password) {
            alert('Please enter email and password');
            return;
        }

        this.setLoading(true);

        try {
            const { data, error } = await this.supabase.signIn(email, password);
            
            if (error) throw error;
            
            // Clear inputs
            this.emailInput.value = '';
            this.passwordInput.value = '';
            
        } catch (err) {
            alert('Login failed: ' + err.message);
        } finally {
            this.setLoading(false);
        }
    }

    /**
     * Handle signup
     */
    async signup() {
        const email = this.emailInput.value.trim();
        const password = this.passwordInput.value;

        if (!email || !password) {
            alert('Please enter email and password');
            return;
        }

        if (password.length < 6) {
            alert('Password must be at least 6 characters');
            return;
        }

        this.setLoading(true);

        try {
            const { data, error } = await this.supabase.signUp(email, password);
            
            if (error) throw error;
            
            alert('Check your email to confirm your account!');
            
        } catch (err) {
            alert('Signup failed: ' + err.message);
        } finally {
            this.setLoading(false);
        }
    }

    /**
     * Handle logout
     */
    async logout() {
        try {
            await this.supabase.signOut();
        } catch (err) {
            console.error('Logout failed:', err);
        }
    }

    /**
     * Show login view
     */
    showLogin() {
        this.loginView.classList.remove('hidden');
        this.dashboardView.classList.add('hidden');
    }

    /**
     * Show dashboard view
     */
    showDashboard() {
        this.loginView.classList.add('hidden');
        this.dashboardView.classList.remove('hidden');
        
        // Initialize the main app
        window.ordoApp.init(this.currentUser);
    }

    /**
     * Set loading state on buttons
     */
    setLoading(loading) {
        this.loginBtn.disabled = loading;
        this.signupBtn.disabled = loading;
        this.loginBtn.textContent = loading ? '...' : '[ Login ]';
        this.signupBtn.textContent = loading ? '...' : '[ Sign Up ]';
    }
}

// Export
window.ordoAuth = new Auth();
