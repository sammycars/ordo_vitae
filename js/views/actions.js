/**
 * Actions View - Ordo_Vitae
 */

class ActionsView {
    constructor(app) {
        this.app = app;
    }

    render() {
        const html = `
            <div class="card">
                <div class="card-header">
                    <span class="card-title">Actions</span>
                    <button class="btn">[ + Add ]</button>
                </div>
                <p class="placeholder">Your actions will appear here.</p>
            </div>
        `;
        
        this.app.content.innerHTML = html;
    }
}

window.ActionsView = ActionsView;
