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
            { hex: '#ff4444', name: 'red' },
            { hex: '#ff8844', name: 'orange' },
            { hex: '#d2b48c', name: 'tan' },
            { hex: '#00ff88', name: 'mint' },
            { hex: '#44eeff', name: 'cyan' },
            { hex: '#4444ff', name: 'blue' },
            { hex: '#ff44ff', name: 'magenta' },
            { hex: '#ff4488', name: 'pink' },
            { hex: '#ffffff', name: 'white' },
            { hex: '#666666', name: 'grey' }
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
                        
                        <strong style="margin-top: var(--space-lg); display: block;">Buttons:</strong>
                        <div style="display: flex; gap: var(--space-md); flex-wrap: wrap; margin-top: var(--space-sm); align-items: center;">
                            <button class="btn" style="color: #ffffff;">[ Edit ]</button>
                            <button class="btn" style="color: #44eeff;">[ Save ]</button>
                            <button class="btn">[ Saved ]</button>
                            <button class="btn" style="color: #ff44ff;">[ New ]</button>
                            <button class="btn btn-danger">[ Delete ]</button>
                            <button class="btn" style="color: #ff8844;">[ Unschedule ]</button>
                        </div>
                    </div>
                    
                    <!-- Right: Colors -->
                    <div class="color-section" style="flex: 1; min-width: 300px;">
                        <strong>Colors:</strong>
                        <div class="color-preview" style="display: flex; flex-direction: column; gap: 4px; margin-top: var(--space-sm);">
                            ${colors.map((c, i) => 
                                `<div style="display: flex; justify-content: space-between; padding: 4px 8px; font-size: 14px; color: ${c.hex};">
                                    <span>Confine yourself to the present.</span>
                                    <span><span style="margin-right: 8px;">${c.name}</span><span style="font-weight: bold;">#${i + 1}</span></span>
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

        let html = '<div class="tests" style="display: flex; gap: var(--space-lg); flex-wrap: wrap; flex-direction: row;">';
        
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
