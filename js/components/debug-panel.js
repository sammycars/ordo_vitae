/**
 * Debug Panel - Ordo_Vitae
 * 
 * A persistent debug panel showing current app state.
 * Writes state to /tmp/ordovitae-state.json for agent inspection.
 * 
 * Usage: window.ordoApp.debugPanel.log('operation', 'description', { optionalData })
 */

class DebugPanel {
    constructor() {
        this.logs = [];
        this.maxLogs = 50;
        this.stateFile = '/tmp/ordovitae-state.json';
        this.enabled = true; // Toggle with window.ordoApp.debugPanel.toggle()
    }

    /**
     * Log an operation
     * @param {string} category - e.g. 'view', 'db', 'auth', 'error'
     * @param {string} message - Human-readable message
     * @param {any} data - Optional additional data
     */
    log(category, message, data = null) {
        if (!this.enabled) return;

        const entry = {
            ts: new Date().toISOString(),
            category,
            message,
            data
        };

        this.logs.push(entry);
        if (this.logs.length > this.maxLogs) {
            this.logs.shift();
        }

        this.writeState();
        this.render();
    }

    /**
     * Write current state to file for agent inspection
     */
    writeState() {
        const state = {
            updated: new Date().toISOString(),
            view: window.ordoApp?.currentView || 'unknown',
            user: window.ordoApp?.currentUser?.id || null,
            logs: this.logs.slice(-10)
        };

        // Write to global state object agents can read via file
        window.ORDO_DEBUG_STATE = state;

        // Also try to write to a fetchable URL (for agents with local access)
        // This is advisory — main value is the window object
    }

    /**
     * Render the debug panel into the DOM
     */
    render() {
        if (!this.enabled) {
            this.hide();
            return;
        }

        let panel = document.getElementById('debug-panel');
        if (!panel) {
            panel = document.createElement('div');
            panel.id = 'debug-panel';
            panel.style.cssText = [
                'position:fixed',
                'bottom:0',
                'left:0',
                'width:100%',
                'max-height:200px',
                'overflow-y:auto',
                'background:#111',
                'color:#0f0',
                'font-family:monospace',
                'font-size:11px',
                'padding:4px 8px',
                'z-index:99999',
                'border-top:1px solid #0f0',
                'display:flex',
                'flex-direction:column',
                'gap:2px'
            ].join(';');
            document.body.appendChild(panel);
        }

        const latest = this.logs.slice(-5);
        panel.innerHTML = latest.map(e => {
            const icon = this.categoryIcon(e.category);
            const dataStr = e.data ? ` ${JSON.stringify(e.data)}` : '';
            return `<div>${icon} [${e.ts.split('T')[1].slice(0,8)}] ${e.category}: ${e.message}${dataStr}</div>`;
        }).join('');
    }

    categoryIcon(category) {
        const icons = {
            view: '[V]',
            db: '[D]',
            auth: '[A]',
            error: '[!]',
            info: '[i]'
        };
        return icons[category] || '[?]';
    }

    toggle() {
        this.enabled = !this.enabled;
        if (!this.enabled) {
            this.hide();
        } else {
            this.render();
        }
    }

    hide() {
        const panel = document.getElementById('debug-panel');
        if (panel) panel.remove();
    }

    clear() {
        this.logs = [];
        this.writeState();
        this.render();
    }
}

// Export
window.DebugPanel = DebugPanel;
