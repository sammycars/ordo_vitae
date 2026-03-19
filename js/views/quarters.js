/**
 * Quarters View - Ordo_Vitae
 */

class QuartersView {
    constructor(app) {
        this.app = app;
    }

    render() {
        const html = `
            <div class="card">
                <div class="card-header">
                    <span class="card-title">Quarters</span>
                    <button class="btn">[ + Add ]</button>
                </div>
                <p class="placeholder">Your quarterly plan will appear here.</p>
            </div>
        `;
        
        this.app.content.innerHTML = html;
    }
}

window.QuartersView = QuartersView;
