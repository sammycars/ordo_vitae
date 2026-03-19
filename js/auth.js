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
        this.togglePasswordBtn = document.getElementById('toggle-password');
        this.loginBtn = document.getElementById('login-btn');
        this.signupBtn = document.getElementById('signup-btn');
        this.logoutBtn = document.getElementById('logout-btn');
    }

    /**
     * Initialize auth - check if user is already logged in
     */
    async init() {
        // Initialize Supabase client first
        await this.supabase.init();

        // Set up event listeners
        this.loginBtn.addEventListener('click', () => this.login());
        this.signupBtn.addEventListener('click', () => this.signup());
        this.logoutBtn.addEventListener('click', () => this.logout());
        this.togglePasswordBtn.addEventListener('click', () => this.togglePassword());

        // Listen for auth state changes
        this.supabase.onAuthChange((event, session) => {
            console.log('Auth event:', event, session ? 'user logged in' : 'no session');
            if (session) {
                this.currentUser = session.user;
                this.showDashboard();
            } else {
                this.currentUser = null;
                this.showLogin();
            }
        });

        // Check for existing session - wait for auth to initialize
        setTimeout(async () => {
            try {
                const { data: { session } } = await this.supabase.getClient().auth.getSession();
                if (session) {
                    this.currentUser = session.user;
                    this.showDashboard();
                } else {
                    this.showLogin();
                }
            } catch (err) {
                console.error('Auth check failed:', err);
                this.showLogin();
            }
        }, 500);

    /**
     * Handle login
     */
    async login() {
        const email = this.emailInput.value.trim();
        const password = this.passwordInput.value;

        if (!email || !password) {
            this.showMessage('Please enter email and password', 'error');
            return;
        }

        this.setLoading(true);

        try {
            const { data, error } = await this.supabase.signIn(email, password);
            
            if (error) throw error;
            
            // Show success - will transition via onAuthChange
            this.showMessage('Login successful! Loading...', 'success');
            
            // Manual check in case auth change doesn't fire
            setTimeout(async () => {
                const user = await this.supabase.getUser();
                if (user) {
                    this.currentUser = user;
                    this.showDashboard();
                }
            }, 1000);
            
            // Clear inputs
            this.emailInput.value = '';
            this.passwordInput.value = '';
            
        } catch (err) {
            this.showMessage('Login failed: ' + err.message, 'error');
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
            this.showMessage('Please enter email and password', 'error');
            return;
        }

        if (password.length < 6) {
            this.showMessage('Password must be at least 6 characters', 'error');
            return;
        }

        this.setLoading(true);

        try {
            const { data, error } = await this.supabase.signUp(email, password);
            
            if (error) throw error;
            
            this.showMessage('Check your email to confirm your account!\n(Look for noreply@mail.app.supabase.io)', 'success');
            
        } catch (err) {
            this.showMessage('Signup failed: ' + err.message, 'error');
        } finally {
            this.setLoading(false);
        }
    }

    /**
     * Show inline message
     */
    showMessage(text, type = 'info') {
        // Remove existing messages
        const existing = this.loginView.querySelector('.message');
        if (existing) existing.remove();

        const msg = document.createElement('div');
        msg.className = `message message-${type}`;
        msg.textContent = text;
        
        const form = this.loginView.querySelector('.auth-form');
        form.insertBefore(msg, form.firstChild);
    }

    /**
     * Toggle password visibility
     */
    togglePassword() {
        const isPassword = this.passwordInput.type === 'password';
        this.passwordInput.type = isPassword ? 'text' : 'password';
        this.togglePasswordBtn.textContent = isPassword ? '[ Hide ]' : '[ Show ]';
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
