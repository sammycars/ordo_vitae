/**
 * Goals View - Ordo_Vitae
 */

class GoalsView {
    constructor(app) {
        this.app = app;
    }

    render() {
        const html = `
            <div class="card">
                <div class="card-header">
                    <span class="card-title">Goals</span>
                    <button class="btn">[ + Add ]</button>
                </div>
                <p class="placeholder">Your goals will appear here.</p>
            </div>
        `;
        
        this.app.content.innerHTML = html;
    }
}

window.GoalsView = GoalsView;
