/**
 * Goals View - Ordo_Vitae
 * 
 * Displays goals grouped by completion status.
 * Tabbed interface: All | Planned | In Progress | Complete
 * Each goal is editable inline.
 * 
 * Schema: SCHEMA.GOAL (from config.js)
 */

class GoalsView {
    constructor(app) {
        this.app = app;
        this.goals = [];
        this.activeTab = 'all'; // all | planned | in_progress | complete
    }

    async render() {
        this.activeTab = 'all';
        await this.loadGoals();
        this.showGoals();
    }

    async loadGoals() {
        const client = this.app.supabase.getClient();
        const user = this.app.supabase.getUser();
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

    showGoals(filter = 'all') {
        const filtered = filter === 'all'
            ? this.goals
            : this.goals.filter(g => g[SCHEMA.GOAL.columns.completion_status] === filter);

        const html = `
            <div class="tabs">
                <button class="tab ${this.activeTab === 'all' ? 'active' : ''}" onclick="window.ordoApp.goalsView.setTab('all')">[ All ]</button>
                <button class="tab ${this.activeTab === 'planned' ? 'active' : ''}" onclick="window.ordoApp.goalsView.setTab('planned')">[ Planned ]</button>
                <button class="tab ${this.activeTab === 'in_progress' ? 'active' : ''}" onclick="window.ordoApp.goalsView.setTab('in_progress')">[ In Progress ]</button>
                <button class="tab ${this.activeTab === 'complete' ? 'active' : ''}" onclick="window.ordoApp.goalsView.setTab('complete')">[ Complete ]</button>
            </div>

            <div class="button-group" style="margin-bottom: var(--space-md);">
                <button class="btn" onclick="window.ordoApp.goalsView.showAddForm()">[ + New Goal ]</button>
            </div>

            ${filtered.length === 0 ? '<p class="placeholder">No goals in this category.</p>' : ''}

            ${filtered.map(goal => this.goalCard(goal)).join('')}
        `;

        this.app.content.innerHTML = html;
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
                    <button class="btn btn-secondary" onclick="window.ordoApp.goalsView.showGoals('${this.activeTab}')">[ Cancel ]</button>
                </div>
            </div>
        `;

        this.app.content.innerHTML = html + this.app.content.innerHTML;
    }

    setTab(tab) {
        this.activeTab = tab;
        this.showGoals(tab);
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
        const user = this.app.supabase.getUser();
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

        const { error } = await client.from(SCHEMA.GOAL.table).insert({
            [SCHEMA.GOAL.columns.title]: title,
            [SCHEMA.GOAL.columns.description]: description,
            [SCHEMA.GOAL.columns.realm]: realm,
            [SCHEMA.GOAL.columns.completion_status]: status,
            [SCHEMA.GOAL.columns.user_id]: user.id
        });

        if (error) {
            console.error('Failed to create goal:', error);
            this.app.showMessage('Failed to create goal.', 'error');
            return;
        }

        await this.loadGoals();
        this.showGoals(this.activeTab);
    }

    async saveGoal(id) {
        const user = this.app.supabase.getUser();
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
        this.showGoals(this.activeTab);
    }

    async deleteGoal(id) {
        if (!confirm('Delete this goal?')) return;

        const user = this.app.supabase.getUser();
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
        this.showGoals(this.activeTab);
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
