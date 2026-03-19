/**
 * Habits View - Ordo_Vitae
 */

class HabitsView {
    constructor(app) {
        this.app = app;
    }

    render() {
        const html = `
            <div class="card">
                <div class="card-header">
                    <span class="card-title">Habits</span>
                    <button class="btn">[ + Add ]</button>
                </div>
                <p class="placeholder">Your habits will appear here.</p>
            </div>
        `;
        
        this.app.content.innerHTML = html;
    }
}

window.HabitsView = HabitsView;
