/**
 * Weeks View - Ordo_Vitae
 */

class WeeksView {
    constructor(app) {
        this.app = app;
    }

    render() {
        const html = `
            <div class="card">
                <div class="card-header">
                    <span class="card-title">Weeks</span>
                    <button class="btn">[ + Add ]</button>
                </div>
                <p class="placeholder">Your weekly plan will appear here.</p>
            </div>
        `;
        
        this.app.content.innerHTML = html;
    }
}

window.WeeksView = WeeksView;