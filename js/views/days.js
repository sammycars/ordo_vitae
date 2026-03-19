/**
 * Days View - Ordo_Vitae
 */

class DaysView {
    constructor(app) {
        this.app = app;
    }

    render() {
        const html = `
            <div class="card">
                <div class="card-header">
                    <span class="card-title">Days</span>
                    <button class="btn">[ + Add ]</button>
                </div>
                <p class="placeholder">Your daily plan will appear here.</p>
            </div>
        `;
        
        this.app.content.innerHTML = html;
    }
}

window.DaysView = DaysView;
