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
        const colors = [
            '#ff4444', '#ff8844', '#ffee44', '#44ff44', '#44eeff',
            '#4444ff', '#ff44ff', '#ff4488', '#ffffff', '#00ff88'
        ];
        
        const html = `
            <div class="card">
                <div class="card-header">
                    <span class="card-title">Dev Tools</span>
                </div>
                <p class="text-muted" style="margin-bottom: var(--space-md);">
                    This is for development viewing and testing purposes only.
                </p>
                
                <!-- Top row: Status info -->
                <div class="dev-status-row" style="display: flex; gap: var(--space-lg); flex-wrap: wrap; margin-bottom: var(--space-lg);">
                    <div id="dev-content"></div>
                </div>
                
                <div class="dev-main" style="display: flex; gap: var(--space-xl); flex-wrap: wrap;">
                    <!-- Left: Font sizes -->
                    <div class="font-size-section" style="flex: 1; min-width: 300px;">
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
                    
                    <!-- Right: Colors -->
                    <div class="color-section" style="flex: 1; min-width: 300px;">
                        <strong>Colors:</strong>
                        <div class="color-preview" style="display: flex; flex-direction: column; gap: 4px; margin-top: var(--space-sm);">
                            ${colors.map((color, i) => 
                                `<div style="display: flex; justify-content: space-between; padding: 4px 8px; font-size: 14px; color: ${color};">
                                    <span>Confine yourself to the present.</span>
                                    <span><span style="margin-right: 8px;">${color}</span><span style="font-weight: bold;">#${i + 1}</span></span>
                                </div>`
                            ).join('')}
                        </div>
                    </div>
                </div>
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

        let html = '<div class="tests" style="display: flex; gap: var(--space-lg); flex-wrap: wrap;">';
        
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
                html += `<span style="color: var(--accent)">✓ ${user.email}</span>`;
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
