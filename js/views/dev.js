/**
 * Dev View - Ordo_Vitae
 * 
 * Development and testing view - for Tim only
 */

class DevView {
    constructor(app) {
        this.app = app;
    }

    render() {
        const html = `
            <div class="card">
                <div class="card-header">
                    <span class="card-title">Dev Tools</span>
                </div>
                <p class="text-muted" style="margin-bottom: var(--space-md);">
                    This is for development viewing and testing purposes only.
                </p>
                
                <div class="font-size-controls" style="margin-bottom: var(--space-lg);">
                    <strong>Font Size:</strong>
                    <div class="font-size-preview" style="display: flex; flex-direction: column; gap: var(--space-sm); margin-top: var(--space-sm);">
                        ${[8, 10, 12, 14, 16, 18].map((size, i) => 
                            `<div style="font-size: ${size}px;">
                                <span style="color: var(--text-muted); margin-right: var(--space-sm);">#${i + 1}</span>
                                <span>Confine yourself to the present.</span>
                            </div>`
                        ).join('')}
                    </div>
                </div>
                
                <div id="dev-content"></div>
            </div>
        `;
        
        this.app.content.innerHTML = html;
        
        // Run any dev tests
        this.runDevTests();
    }

    /**
     * Run development tests
     */
    async runDevTests() {
        const container = document.getElementById('dev-content');
        if (!container) return;

        let html = '<div class="tests">';
        
        // Test 1: Config
        html += '<div class="test-item">';
        html += '<strong>Config:</strong> ';
        try {
            const config = window.ORDO_CONFIG;
            if (config?.supabase?.url) {
                html += '<span style="color: var(--accent)">✓ Loaded</span>';
            } else {
                html += '<span style="color: var(--danger)">✗ Missing</span>';
            }
        } catch (e) {
            html += '<span style="color: var(--danger)">✗ Error</span>';
        }
        html += '</div>';
        
        // Test 2: Auth
        html += '<div class="test-item">';
        html += '<strong>Auth:</strong> ';
        try {
            const user = await this.app.supabase.getUser();
            if (user) {
                html += `<span style="color: var(--accent)">✓ Logged in as ${user.email}</span>`;
            } else {
                html += '<span style="color: var(--warning)">○ Not logged in</span>';
            }
        } catch (e) {
            html += '<span style="color: var(--danger)">✗ Error</span>';
        }
        html += '</div>';
        
        // Test 3: Quotes
        html += '<div class="test-item">';
        html += '<strong>Quotes:</strong> ';
        if (this.app.quoteRotator?.quotes?.length) {
            html += `<span style="color: var(--accent)">✓ ${this.app.quoteRotator.quotes.length} loaded</span>`;
        } else {
            html += '<span style="color: var(--danger)">✗ Not loaded</span>';
        }
        html += '</div>';
        
        html += '</div>';
        container.innerHTML = html;
    }
}

window.DevView = DevView;
