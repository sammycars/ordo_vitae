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
        await this.loadQuarters();
        await this.loadGoals();
        // Default to first existing quarter
        this.activeQuarterTab = Object.keys(this.quarterMap)[0] || 'Q1';
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
        // Build a map: Q1 -> quarter_id, etc. using the actual quarter number from each row.
        this.quarterMap = {};
        this.quarterMapById = {}; // quarter_id -> label
        this.quarters.forEach((q) => {
            const qNum = q[SCHEMA.QUARTER.columns.quarter]; // 1-4
            const label = 'Q' + qNum;
            this.quarterMap[label] = q[SCHEMA.QUARTER.columns.id];
            this.quarterMapById[q[SCHEMA.QUARTER.columns.id]] = label;
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

        // Sort by realm: Personal, Family, Church, Work
        const realmOrder = { Personal: 0, Family: 1, Church: 2, Work: 3 };
        filtered.sort((a, b) => {
            const ra = realmOrder[a[SCHEMA.GOAL.columns.realm]] ?? 99;
            const rb = realmOrder[b[SCHEMA.GOAL.columns.realm]] ?? 99;
            return ra - rb;
        });

        // Get current quarter's date range
        const currentQuarterId = this.quarterMap[this.activeQuarterTab];
        const currentQuarter = this.quarters.find(q => q[SCHEMA.QUARTER.columns.id] === currentQuarterId);
        const fmt = d => {
            if (!d) return '';
            const [y, m, day] = d.split('-');
            const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
            return `${months[parseInt(m)-1]} ${parseInt(day)}`;
        };

        const quarterTitle = currentQuarter
            ? `${fmt(currentQuarter[SCHEMA.QUARTER.columns.start_date])} \u2013 ${fmt(currentQuarter[SCHEMA.QUARTER.columns.end_date])}`
            : 'All Goals';

        // Only render tabs for quarters that exist
        const allLabels = ['Q1', 'Q2', 'Q3', 'Q4'];
        const tabLabels = ['Quarter 1', 'Quarter 2', 'Quarter 3', 'Quarter 4'];
        const existingTabs = allLabels.filter(l => !!this.quarterMap[l]);

        const html = `
            <div class="tabs" id="goals-quarter-tabs">
                ${existingTabs.map((q, i) => `<div class="tab ${q === this.activeQuarterTab ? 'active' : ''}" data-quarter="${q}">[ ${tabLabels[allLabels.indexOf(q)]} ]</div>`).join('')}
            </div>

            <h2 style="margin: var(--space-md) 0 var(--space-sm) 0; font-size: 18px; font-weight: normal; color: var(--text-primary);">${quarterTitle}</h2>

            ${filtered.length === 0 ? '<p class="placeholder">No goals for ' + quarterTitle + '.</p>' : ''}

            ${filtered.map((goal, i) => this.goalCard(goal, i)).join('')}

            ${this.goals.length > 0 ? `
                <div style="margin-top: var(--space-lg); padding-top: var(--space-md); border-top: 1px solid var(--border);">
                    <p style="font-size: 11px; color: var(--text-muted); margin-bottom: var(--space-sm);">GOALS</p>
                    <div style="display: flex; gap: var(--space-md); flex-wrap: wrap;">
                        ${this.goals.map(g => `<span style="color: var(--text-secondary); font-size: 13px;">${this.escapeHtml(g[SCHEMA.GOAL.columns.title] || 'Untitled')}</span>`).join('')}
                    </div>
                </div>
            ` : ''}
        `;

        this.app.content.innerHTML = html;

        // Bind goal card buttons
        this.app.content.querySelectorAll('.edit-goal-btn').forEach(btn => {
            btn.addEventListener('click', () => this.toggleEdit(btn.dataset.goalId));
        });
        this.app.content.querySelectorAll('.delete-goal-btn').forEach(btn => {
            btn.addEventListener('click', () => this.deleteGoal(btn.dataset.goalId));
        });
        this.app.content.querySelectorAll('.save-goal-btn').forEach(btn => {
            btn.addEventListener('click', () => this.saveGoal(btn.dataset.goalId));
        });
        this.app.content.querySelectorAll('.cancel-goal-btn').forEach(btn => {
            btn.addEventListener('click', () => this.toggleEdit(btn.dataset.goalId));
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

        const createBtn = document.getElementById('create-goal-btn');
        if (createBtn) createBtn.addEventListener('click', () => this.insertGoal());
    }

    goalCard(goal, idx) {
        const realmOrder = ['Personal', 'Family', 'Church', 'Work'];
        const realm = realmOrder[idx] || '';
        const title = this.escapeHtml(goal[SCHEMA.GOAL.columns.title] || '');
        const status = goal[SCHEMA.GOAL.columns.completion_status] || '';
        const description = this.escapeHtml(goal[SCHEMA.GOAL.columns.description] || '');

        return `
            <div style="margin-bottom: 2px;">
                <div style="font-size: 16px; color: orange; margin-bottom: 1px;">${this.escapeHtml(realm) || 'No realm'}</div>
                <div class="card goal-card" data-id="${goal[SCHEMA.GOAL.columns.id]}" style="padding: 6px; margin-bottom: 4px;">
                    <div class="card-header" style="margin-bottom: 2px;">
                        <span class="card-title" style="color: white; font-size: 14px;">${title || 'Untitled'}</span>
                        <div style="display: flex; gap: var(--space-sm); align-items: center;">
                            <button class="btn btn-secondary edit-goal-btn" data-goal-id="${goal[SCHEMA.GOAL.columns.id]}" style="padding: 2px 6px; font-size: 11px;">[ Edit ]</button>
                            <button class="btn btn-danger delete-goal-btn" data-goal-id="${goal[SCHEMA.GOAL.columns.id]}" style="padding: 2px 6px; font-size: 11px;">[ Delete ]</button>
                        </div>
                    </div>
                    ${description ? `<p style="margin: 2px 0; color: var(--text-secondary); font-size: 13px;">${this.escapeHtml(description)}</p>` : ''}
                    <div class="goal-edit" style="display: none; margin-top: var(--space-sm);">
                    <input
                        type="text"
                        class="input goal-title-input"
                        placeholder="Goal title..."
                        value="${this.escapeHtml(title)}"
                        style="margin-bottom: 4px;"
                    >
                    <textarea
                        class="input goal-desc-input"
                        placeholder="Description (optional)..."
                        style="margin-bottom: 4px;"
                    >${this.escapeHtml(description)}</textarea>
                    <div style="display: flex; gap: var(--space-sm); flex-wrap: wrap; margin-top: 4px;">
                        <select class="input goal-status-input" style="max-width: 200px;">
                            <option value="planned" ${status === 'planned' ? 'selected' : ''}>Planned</option>
                            <option value="in_progress" ${status === 'in_progress' ? 'selected' : ''}>In Progress</option>
                            <option value="complete" ${status === 'complete' ? 'selected' : ''}>Complete</option>
                        </select>
                    </div>
                    <div style="margin-top: 4px;">
                        <button class="btn save-goal-btn" data-goal-id="${goal[SCHEMA.GOAL.columns.id]}" style="padding: 2px 6px; font-size: 11px;">[ Save ]</button>
                        <button class="btn btn-secondary cancel-goal-btn" data-goal-id="${goal[SCHEMA.GOAL.columns.id]}" style="padding: 2px 6px; font-size: 11px;">[ Cancel ]</button>
                    </div>
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
                    <select class="input goal-status-input" style="max-width: 200px;">
                        <option value="planned" selected>Planned</option>
                        <option value="in_progress">In Progress</option>
                        <option value="complete">Complete</option>
                    </select>
                </div>
                <div>
                    <button class="btn" id="create-goal-btn">[ Create ]</button>
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

    toggleEdit(goalId) {
        console.log('toggleEdit called with:', goalId);
        const card = document.querySelector(`.goal-card[data-id="${goalId}"]`);
        if (!card) { console.error('toggleEdit: no card found'); return; }
        const display = card.querySelector('.goal-display');
        const edit = card.querySelector('.goal-edit');
        if (!edit) { console.error('toggleEdit: no edit div'); return; }
        const isEditing = edit.style.display !== 'none';

        if (isEditing) {
            edit.style.display = 'none';
            display.style.display = 'block';
            const editBtn = card.querySelector('[data-action="edit"]');
            if (editBtn) editBtn.textContent = '[ Edit ]';
        } else {
            edit.style.display = 'block';
            display.style.display = 'none';
            const editBtn = card.querySelector('[data-action="edit"]');
            if (editBtn) editBtn.textContent = '[ Cancel ]';
        }
    }

    async insertGoal() {
        const user = this.app.currentUser;
        if (!user) return;

        const card = document.getElementById('new-goal-form');
        const title = card.querySelector('.goal-title-input').value.trim();
        const description = card.querySelector('.goal-desc-input').value.trim();
        const status = card.querySelector('.goal-status-input').value;

        if (!title) {
            this.app.showMessage('Goal title is required.', 'error');
            return;
        }

        const client = this.app.supabase.getClient();

        const insert = {
            [SCHEMA.GOAL.columns.title]: title,
            [SCHEMA.GOAL.columns.description]: description,
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
        console.log('saveGoal called with:', id);
        const user = this.app.currentUser;
        if (!user) return;

        const card = document.querySelector(`.goal-card[data-id="${id}"]`);
        const title = card.querySelector('.goal-title-input').value.trim();
        const description = card.querySelector('.goal-desc-input').value.trim();
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
