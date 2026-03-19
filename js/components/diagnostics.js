/**
 * Diagnostics Component - Ordo_Vitae
 * 
 * Status indicators at the bottom of each view.
 * Green = all good, Red = problem
 */

class Diagnostics {
    constructor(app) {
        this.app = app;
        this.status = {
            supabase: 'checking',
            variables: 'checking',
            javascript: 'ok'
        };
    }

    /**
     * Run all diagnostics and render the status bar
     */
    async run() {
        await this.checkSupabase();
        this.checkVariables();
        this.checkJavaScript();
        this.render();
    }

    /**
     * Check Supabase connection, auth, and API
     */
    async checkSupabase() {
        try {
            const client = this.app.supabase.getClient();
            // Try a simple auth check
            const { data, error } = await client.auth.getSession();
            
            if (error) {
                this.status.supabase = 'error';
                return;
            }
            
            // Try a simple API call (e.g., get user)
            await client.auth.getUser();
            this.status.supabase = 'ok';
        } catch (err) {
            console.error('Supabase check failed:', err);
            this.status.supabase = 'error';
        }
    }

    /**
     * Check that all config variables are present
     */
    checkVariables() {
        try {
            const config = window.ORDO_CONFIG;
            
            if (!config) {
                this.status.variables = 'error';
                return;
            }
            
            if (!config.supabase?.url || !config.supabase?.anonKey) {
                this.status.variables = 'error';
                return;
            }
            
            if (!config.supabase.url.startsWith('http')) {
                this.status.variables = 'error';
                return;
            }
            
            this.status.variables = 'ok';
        } catch (err) {
            this.status.variables = 'error';
        }
    }

    /**
     * Check for JS errors (assumes we're running if we got here)
     */
    checkJavaScript() {
        // If this component loaded and is running, JS is OK
        this.status.javascript = 'ok';
    }

    /**
     * Render the diagnostics bar
     */
    render() {
        const colors = {
            ok: '#00ff88',
            error: '#ff4444',
            checking: '#ffaa00'
        };

        const html = `
            <div class="diagnostics">
                <span class="diag-label">Status:</span>
                <span class="diag-item" style="color: ${colors[this.status.supabase]}">Supabase</span>
                <span class="diag-item" style="color: ${colors[this.status.variables]}">Variables</span>
                <span class="diag-item" style="color: ${colors[this.status.javascript]}">JavaScript</span>
            </div>
        `;

        // Add to page if not already there
        let diag = document.querySelector('.diagnostics');
        if (!diag) {
            const content = document.querySelector('.content');
            if (content) {
                content.insertAdjacentHTML('beforeend', html);
            }
        }
    }
}

window.Diagnostics = Diagnostics;
