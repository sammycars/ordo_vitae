/**
 * Goals View - Ordo_Vitae
 *
 * Displays goals grouped by quarter and completion status.
 * Sub-tabs: Q1 | Q2 | Q3 | Q4
 * Each goal is editable inline.
 *
 * Schema: SCHEMA.GOAL (from config.js)
 */

class GoalsView {
    constructor(app) {
        this.app = app;
        this.goals = [];
        this.quarters = [];
        this.activeQuarterTab = 'Q1';
        this.quarterMap = {};
    }

    async render() {
        this.activeQuarterTab = 'Q1';
        await this.loadQuarters();
        await this.loadGoals();
        this.showGoals();
    }

    async loadQuarters() {
        const client = this.app.supabase.getClient();
        const user = this.app.currentUser;
        if (!user) return;

        const { data, error } = await client
            .from(SCHEMA.QUARTER.table)
            .select('*')
            .eq(SCHEMA.QUARTER.columns.user_id, user.id)
            .order(SCHEMA.QUARTER.columns.start_date, { ascending: true });

        if (error) {
            console.error('Failed to load quarters:', error);
            return;
        }

        this.quarters = data || [];
        // Build a map: Q1 -> quarter_id, etc.
        this.quarterMap = {};
        const labels = ['Q1', 'Q2', 'Q3', 'Q4'];
        this.quarters.forEach((q, i) => {
            if (i < 4) this.quarterMap[labels[i]] = q[SCHEMA.QUARTER.columns.id];
        });
    }

    async loadGoals() {
        const client = this.app.supabase.getClient();
        const user = this.app.currentUser;
        if (!user) return;

        const { data, error } = await client
            .from(SCHEMA.GOAL.table)
            .select('*')
            .eq(SCHEMA.GOAL.columns.user_id, user.id)
            .order(SCHEMA.GOAL.columns.created_at, { ascending: false });

        if (error) {
            console.error('Failed to load goals:', error);
            return;
        }

        this.goals = data || [];
    }

    showGoals() {
        const quarterId = this.quarterMap[this.activeQuarterTab];
        const filtered = quarterId
            ? this.goals.filter(g => g[SCHEMA.GOAL.columns.quarter_id] === quarterId)
            : this.goals;

        // Get current quarter's date range
        const currentQuarter = this.quarters.find((q, i) => {
            const labels = ['Q1', 'Q2', 'Q3', 'Q4'];
            return labels[i] === this.activeQuarterTab;
        });
        const fmt = d => {
            if (!d) return '';
            const [y, m, day] = d.split('-');
            const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
            return `${months[parseInt(m)-1]} ${parseInt(day)}, ${y}`;
        };

        const quarterLabels = {Q1: 'Quarter 1', Q2: 'Quarter 2', Q3: 'Quarter 3', Q4: 'Quarter 4'};
        const quarterName = quarterLabels[this.activeQuarterTab] || this.activeQuarterTab;
        const quarterTitle = currentQuarter
            ? `${quarterName}  ${fmt(currentQuarter[SCHEMA.QUARTER.columns.start_date] || '')} \u2013 ${fmt(currentQuarter[SCHEMA.QUARTER.columns.end_date] || '')}`
            : quarterName;

        // Build tab labels from actual quarter dates
        const labels = ['Q1', 'Q2', 'Q3', 'Q4'];
        const tabLabels = this.quarters.map((q, i) => {
            const start = q[SCHEMA.QUARTER.columns.start_date] || '';
            const end = q[SCHEMA.QUARTER.columns.end_date] || '';
            return `[ ${fmt(start)} \u2013 ${fmt(end)} ]`;
        });

        const html = `
            <div class="tabs" id="goals-quarter-tabs">
                ${labels.map((q, i) => `<div class="tab" data-quarter="${q}">${tabLabels[i] || q}</div>`).join('')}
            </div>

            <h2 style="margin: var(--space-md) 0 var(--space-sm) 0; font-size: var(--font-size-h3); font-weight: normal; color: var(--text-primary);">${quarterTitle}</h2>

            <div class="button-group" style="margin-bottom: var(--space-md);">
                <button class="btn" onclick="window.ordoApp.goalsView.showAddForm()">[ + New Goal ]</button>
            </div>

            ${filtered.length === 0 ? '<p class="placeholder">No goals for ' + quarterTitle + '.</p>' : ''}

            ${filtered.map(goal => this.goalCard(goal)).join('')}
        `;

        this.app.content.innerHTML = html;

        // Set initial active tab appearance
        const tabs = this.app.content.querySelectorAll('.tab');
        tabs.forEach(t => {
            if (t.dataset.quarter === this.activeQuarterTab) t.classList.add('active');
        });

        // Event delegation for quarter tab clicks
        this.app.content.querySelectorAll('.tab[data-quarter]').forEach(tab => {
            tab.addEventListener('click', () => {
                const q = tab.dataset.quarter;
                this.setQuarterTab(q);
            });
        });

        // Cancel button in add form
        const cancelBtn = document.getElementById('cancel-goal-btn');
        if (cancelBtn) cancelBtn.addEventListener('click', () => this.showGoals());
    }

    goalCard(goal) {
        const status = goal[SCHEMA.GOAL.columns.completion_status];
        const realm = goal[SCHEMA.GOAL.columns.realm] || '';
        const title = this.escapeHtml(goal[SCHEMA.GOAL.columns.title] || '');
        const description = this.escapeHtml(goal[SCHEMA.GOAL.columns.description] || '');
        const isComplete = status === SCHEMA.GOAL.status.complete;

        return `
            <div class="card goal-card" data-id="${goal[SCHEMA.GOAL.columns.id]}">
                <div class="card-header">
                    <span class="card-title">${this.escapeHtml(title)}</span>
                    <div style="display: flex; gap: var(--space-sm); align-items: center;">
                        ${realm ? `<span class="realm-tag">${this.escapeHtml(realm)}</span>` : ''}
                        <button class="btn btn-secondary" onclick="window.ordoApp.goalsView.toggleEdit(this)">[ Edit ]</button>
                        <button class="btn btn-danger" onclick="window.ordoApp.goalsView.deleteGoal('${goal[SCHEMA.GOAL.columns.id]}')">[ Delete ]</button>
                    </div>
                </div>
                ${description ? `<p style="margin: var(--space-sm) 0; color: var(--text-secondary);">${this.escapeHtml(description)}</p>` : ''}
                <div class="goal-display">
                    <p style="font-size: var(--font-size-sm); color: var(--text-muted);">
                        Status: ${status} ${isComplete ? '✓' : ''}
                    </p>
                </div>
                <div class="goal-edit" style="display: none; margin-top: var(--space-md);">
                    <input
                        type="text"
                        class="input goal-title-input"
                        placeholder="Goal title..."
                        value="${this.escapeHtml(title)}"
                    >
                    <textarea
                        class="input goal-desc-input"
                        placeholder="Description (optional)..."
                        style="margin-top: var(--space-sm);"
                    >${this.escapeHtml(description)}</textarea>
                    <div style="display: flex; gap: var(--space-md); margin-top: var(--space-sm); flex-wrap: wrap;">
                        <select class="input goal-realm-input" style="max-width: 200px;">
                            <option value="">— Realm —</option>
                            <option value="Personal" ${realm === 'Personal' ? 'selected' : ''}>Personal</option>
                            <option value="Family" ${realm === 'Family' ? 'selected' : ''}>Family</option>
                            <option value="Ministry" ${realm === 'Ministry' ? 'selected' : ''}>Ministry</option>
                            <option value="Work" ${realm === 'Work' ? 'selected' : ''}>Work</option>
                        </select>
                        <select class="input goal-status-input" style="max-width: 200px;">
                            <option value="planned" ${status === 'planned' ? 'selected' : ''}>Planned</option>
                            <option value="in_progress" ${status === 'in_progress' ? 'selected' : ''}>In Progress</option>
                            <option value="complete" ${status === 'complete' ? 'selected' : ''}>Complete</option>
                        </select>
                    </div>
                    <div style="margin-top: var(--space-sm);">
                        <button class="btn" onclick="window.ordoApp.goalsView.saveGoal('${goal[SCHEMA.GOAL.columns.id]}')">[ Save ]</button>
                        <button class="btn btn-secondary" onclick="window.ordoApp.goalsView.toggleEdit(this)">[ Cancel ]</button>
                    </div>
                </div>
            </div>
        `;
    }

    showAddForm() {
        const html = `
            <div class="card" id="new-goal-form">
                <div class="card-header">
                    <span class="card-title">New Goal</span>
                </div>
                <input
                    type="text"
                    class="input goal-title-input"
                    placeholder="Goal title..."
                    style="width: 100%; margin-bottom: var(--space-sm);"
                >
                <textarea
                    class="input goal-desc-input"
                    placeholder="Description (optional)..."
                    style="width: 100%; margin-bottom: var(--space-sm);"
                ></textarea>
                <div style="display: flex; gap: var(--space-md); margin-bottom: var(--space-sm); flex-wrap: wrap;">
                    <select class="input goal-realm-input" style="max-width: 200px;">
                        <option value="">— Realm —</option>
                        <option value="Personal">Personal</option>
                        <option value="Family">Family</option>
                        <option value="Ministry">Ministry</option>
                        <option value="Work">Work</option>
                    </select>
                    <select class="input goal-status-input" style="max-width: 200px;">
                        <option value="planned" selected>Planned</option>
                        <option value="in_progress">In Progress</option>
                        <option value="complete">Complete</option>
                    </select>
                </div>
                <div>
                    <button class="btn" onclick="window.ordoApp.goalsView.insertGoal()">[ Create ]</button>
                    <button class="btn btn-secondary" id="cancel-goal-btn">[ Cancel ]</button>
                </div>
            </div>
        `;

        this.app.content.innerHTML = html + this.app.content.innerHTML;
    }

    setQuarterTab(tab) {
        this.activeQuarterTab = tab;
        this.showGoals();
    }

    toggleEdit(btn) {
        const card = btn.closest('.goal-card');
        const display = card.querySelector('.goal-display');
        const edit = card.querySelector('.goal-edit');
        const isEditing = edit.style.display !== 'none';

        if (isEditing) {
            edit.style.display = 'none';
            display.style.display = 'block';
            btn.textContent = '[ Edit ]';
        } else {
            edit.style.display = 'block';
            display.style.display = 'none';
            btn.textContent = '[ Cancel ]';
        }
    }

    async insertGoal() {
        const user = this.app.currentUser;
        if (!user) return;

        const card = document.getElementById('new-goal-form');
        const title = card.querySelector('.goal-title-input').value.trim();
        const description = card.querySelector('.goal-desc-input').value.trim();
        const realm = card.querySelector('.goal-realm-input').value;
        const status = card.querySelector('.goal-status-input').value;

        if (!title) {
            this.app.showMessage('Goal title is required.', 'error');
            return;
        }

        const client = this.app.supabase.getClient();

        const insert = {
            [SCHEMA.GOAL.columns.title]: title,
            [SCHEMA.GOAL.columns.description]: description,
            [SCHEMA.GOAL.columns.realm]: realm,
            [SCHEMA.GOAL.columns.completion_status]: status,
            [SCHEMA.GOAL.columns.user_id]: user.id
        };

        // Set the quarter_id to match the active quarter tab
        const quarterId = this.quarterMap[this.activeQuarterTab];
        if (quarterId) {
            insert[SCHEMA.GOAL.columns.quarter_id] = quarterId;
        }

        const { error } = await client.from(SCHEMA.GOAL.table).insert(insert);

        if (error) {
            console.error('Failed to create goal:', error);
            this.app.showMessage('Failed to create goal.', 'error');
            return;
        }

        await this.loadGoals();
        this.showGoals();
    }

    async saveGoal(id) {
        const user = this.app.currentUser;
        if (!user) return;

        const card = document.querySelector(`.goal-card[data-id="${id}"]`);
        const title = card.querySelector('.goal-title-input').value.trim();
        const description = card.querySelector('.goal-desc-input').value.trim();
        const realm = card.querySelector('.goal-realm-input').value;
        const status = card.querySelector('.goal-status-input').value;

        if (!title) {
            this.app.showMessage('Goal title is required.', 'error');
            return;
        }

        const client = this.app.supabase.getClient();

        const { error } = await client.from(SCHEMA.GOAL.table)
            .update({
                [SCHEMA.GOAL.columns.title]: title,
                [SCHEMA.GOAL.columns.description]: description,
                [SCHEMA.GOAL.columns.realm]: realm,
                [SCHEMA.GOAL.columns.completion_status]: status,
                [SCHEMA.GOAL.columns.updated_at]: new Date().toISOString()
            })
            .eq(SCHEMA.GOAL.columns.id, id)
            .eq(SCHEMA.GOAL.columns.user_id, user.id);

        if (error) {
            console.error('Failed to save goal:', error);
            this.app.showMessage('Failed to save goal.', 'error');
            return;
        }

        await this.loadGoals();
        this.showGoals();
    }

    async deleteGoal(id) {
        if (!confirm('Delete this goal?')) return;

        const user = this.app.currentUser;
        if (!user) return;

        const client = this.app.supabase.getClient();

        const { error } = await client.from(SCHEMA.GOAL.table)
            .delete()
            .eq(SCHEMA.GOAL.columns.id, id)
            .eq(SCHEMA.GOAL.columns.user_id, user.id);

        if (error) {
            console.error('Failed to delete goal:', error);
            this.app.showMessage('Failed to delete goal.', 'error');
            return;
        }

        await this.loadGoals();
        this.showGoals();
    }

    escapeHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }
}

window.GoalsView = GoalsView;
