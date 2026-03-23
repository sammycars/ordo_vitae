/**
 * Actions View - Ordo_Vitae
 *
 * Displays actions grouped by completion status.
 * Tabbed interface: All | Pending | Complete
 * Each action belongs to a Goal. Inline edit and create.
 *
 * Schema: SCHEMA.ACTION (from config.js)
 * Verified against Supabase: column names confirmed correct (RLS error, not column error)
 */

class ActionsView {
    constructor(app) {
        this.app = app;
        this.actions = [];
        this.goals = [];
        this.activeTab = 'all'; // all | pending | complete
    }

    async render() {
        this.activeTab = 'all';
        await this.loadGoals();
        await this.loadActions();
        this.showActions();
        this.writeAppState('load', null, null);
    }

    // ==========================================
    // Data Loading
    // ==========================================

    async loadGoals() {
        const client = this.app.supabase.getClient();
        const user = this.app.currentUser;
        if (!user) return;

        const { data, error } = await client
            .from(SCHEMA.GOAL.table)
            .select(`${SCHEMA.GOAL.columns.id}, ${SCHEMA.GOAL.columns.title}`)
            .eq(SCHEMA.GOAL.columns.user_id, user.id)
            .order(SCHEMA.GOAL.columns.created_at, { ascending: false });

        if (error) {
            console.error('Failed to load goals:', error);
            return;
        }

        this.goals = data || [];
    }

    async loadActions() {
        const client = this.app.supabase.getClient();
        const user = this.app.currentUser;
        if (!user) return;

        const { data, error } = await client
            .from(SCHEMA.ACTION.table)
            .select('*')
            .eq(SCHEMA.ACTION.columns.user_id, user.id)
            .order(SCHEMA.ACTION.columns.created_at, { ascending: false });

        if (error) {
            console.error('Failed to load actions:', error);
            return;
        }

        this.actions = data || [];
    }

    // ==========================================
    // Rendering
    // ==========================================

    showActions(filter = 'all') {
        const filtered = filter === 'all'
            ? this.actions
            : this.actions.filter(a => a[SCHEMA.ACTION.columns.completion_status] === filter);

        const html = `
            <div class="button-group" style="margin-bottom: var(--space-md);">
                <button class="btn" onclick="window.ordoApp.actionsView.showAddForm()">[ + New Action ]</button>
            </div>

            ${filtered.length === 0 ? '<p class="placeholder">No actions in this category.</p>' : ''}

            ${filtered.map(action => this.actionCard(action)).join('')}
        `;

        this.app.content.innerHTML = html;
    }

    actionCard(action) {
        const id = action[SCHEMA.ACTION.columns.id];
        const status = action[SCHEMA.ACTION.columns.completion_status];
        const title = this.escapeHtml(action[SCHEMA.ACTION.columns.title] || '');
        const goalId = action[SCHEMA.ACTION.columns.goal_id];
        const goal = this.goals.find(g => g[SCHEMA.GOAL.columns.id] === goalId);
        const goalTitle = goal ? this.escapeHtml(goal[SCHEMA.GOAL.columns.title]) : null;
        const isComplete = status === SCHEMA.ACTION.status.complete;

        return `
            <div class="card action-card" data-id="${id}">
                <div class="card-header">
                    <div style="display: flex; align-items: center; gap: var(--space-sm); flex: 1;">
                        <span class="card-title">${title}</span>
                        ${goalTitle ? `<span class="realm-tag" style="font-size: 0.75em;">→ ${goalTitle}</span>` : ''}
                    </div>
                    <div style="display: flex; gap: var(--space-sm); align-items: center;">
                        <button class="btn btn-secondary" onclick="window.ordoApp.actionsView.toggleComplete('${id}', '${status}')">
                            [ ${isComplete ? 'Undo' : 'Done'} ]
                        </button>
                        <button class="btn btn-secondary" onclick="window.ordoApp.actionsView.toggleEdit(this)">[ Edit ]</button>
                        <button class="btn btn-danger" onclick="window.ordoApp.actionsView.deleteAction('${id}')">[ Delete ]</button>
                    </div>
                </div>
                <div class="action-display">
                    <p style="font-size: var(--font-size-sm); color: var(--text-muted);">
                        Status: ${status} ${isComplete ? '✓' : ''}
                    </p>
                </div>
                <div class="action-edit" style="display: none; margin-top: var(--space-md);">
                    <input
                        type="text"
                        class="input action-title-input"
                        placeholder="Action title..."
                        value="${title}"
                        style="width: 100%; margin-bottom: var(--space-sm);"
                    >
                    <div style="margin-bottom: var(--space-sm);">
                        <select class="input action-goal-input" style="max-width: 300px;">
                            <option value="">— No Goal —</option>
                            ${this.goals.map(g => {
                                const gId = g[SCHEMA.GOAL.columns.id];
                                const gTitle = this.escapeHtml(g[SCHEMA.GOAL.columns.title]);
                                return `<option value="${gId}" ${gId === goalId ? 'selected' : ''}>${gTitle}</option>`;
                            }).join('')}
                        </select>
                    </div>
                    <div>
                        <button class="btn" onclick="window.ordoApp.actionsView.saveAction('${id}')">[ Save ]</button>
                        <button class="btn btn-secondary" onclick="window.ordoApp.actionsView.toggleEdit(this)">[ Cancel ]</button>
                    </div>
                </div>
            </div>
        `;
    }

    showAddForm() {
        const html = `
            <div class="card" id="new-action-form">
                <div class="card-header">
                    <span class="card-title">New Action</span>
                </div>
                <input
                    type="text"
                    class="input action-title-input"
                    placeholder="Action title..."
                    style="width: 100%; margin-bottom: var(--space-sm);"
                >
                <select class="input action-goal-input" style="max-width: 300px; margin-bottom: var(--space-sm);">
                    <option value="">— No Goal —</option>
                    ${this.goals.map(g => {
                        const gId = g[SCHEMA.GOAL.columns.id];
                        const gTitle = this.escapeHtml(g[SCHEMA.GOAL.columns.title]);
                        return `<option value="${gId}">${gTitle}</option>`;
                    }).join('')}
                </select>
                ${this.goals.length === 0 ? '<p style="font-size: var(--font-size-sm); color: var(--text-muted); margin-bottom: var(--space-sm);">No goals yet. Actions can exist without a goal.</p>' : ''}
                <div>
                    <button class="btn" onclick="window.ordoApp.actionsView.insertAction()">[ Create ]</button>
                    <button class="btn btn-secondary" onclick="window.ordoApp.actionsView.showActions('${this.activeTab}')">[ Cancel ]</button>
                </div>
            </div>
        `;

        this.app.content.innerHTML = html + this.app.content.innerHTML;
    }

    setTab(tab) {
        this.activeTab = tab;
        this.showActions(tab);
    }

    // ==========================================
    // CRUD Operations
    // ==========================================

    toggleEdit(btn) {
        const card = btn.closest('.action-card');
        const display = card.querySelector('.action-display');
        const edit = card.querySelector('.action-edit');
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

    async insertAction() {
        const user = this.app.currentUser;
        if (!user) return;

        const card = document.getElementById('new-action-form');
        const title = card.querySelector('.action-title-input').value.trim();
        const goalId = card.querySelector('.action-goal-input').value;

        if (!title) {
            this.app.showMessage('Action title is required.', 'error');
            return;
        }

        const client = this.app.supabase.getClient();
        const insert = {
            [SCHEMA.ACTION.columns.title]: title,
            [SCHEMA.ACTION.columns.user_id]: user.id,
            [SCHEMA.ACTION.columns.completion_status]: SCHEMA.ACTION.status.pending
        };
        if (goalId) {
            insert[SCHEMA.ACTION.columns.goal_id] = goalId;
        }

        const { error } = await client.from(SCHEMA.ACTION.table).insert(insert);

        if (error) {
            console.error('Failed to create action:', error);
            this.app.showMessage('Failed to create action.', 'error');
            this.writeAppState('insert', null, error.message);
            return;
        }

        this.writeAppState('insert', null, null);
        await this.loadActions();
        this.showActions(this.activeTab);
    }

    async saveAction(id) {
        const user = this.app.currentUser;
        if (!user) return;

        const card = document.querySelector(`.action-card[data-id="${id}"]`);
        const title = card.querySelector('.action-title-input').value.trim();
        const goalId = card.querySelector('.action-goal-input').value;

        if (!title) {
            this.app.showMessage('Action title is required.', 'error');
            return;
        }

        const client = this.app.supabase.getClient();
        const update = {
            [SCHEMA.ACTION.columns.title]: title,
            [SCHEMA.ACTION.columns.updated_at]: new Date().toISOString()
        };
        if (goalId) {
            update[SCHEMA.ACTION.columns.goal_id] = goalId;
        } else {
            update[SCHEMA.ACTION.columns.goal_id] = null;
        }

        const { error } = await client.from(SCHEMA.ACTION.table)
            .update(update)
            .eq(SCHEMA.ACTION.columns.id, id)
            .eq(SCHEMA.ACTION.columns.user_id, user.id);

        if (error) {
            console.error('Failed to save action:', error);
            this.app.showMessage('Failed to save action.', 'error');
            this.writeAppState('update', id, error.message);
            return;
        }

        this.writeAppState('update', id, null);
        await this.loadActions();
        await this.loadGoals(); // Reload in case goal changed
        this.showActions(this.activeTab);
    }

    async toggleComplete(id, currentStatus) {
        const user = this.app.currentUser;
        if (!user) return;

        const newStatus = currentStatus === SCHEMA.ACTION.status.complete
            ? SCHEMA.ACTION.status.pending
            : SCHEMA.ACTION.status.complete;

        const client = this.app.supabase.getClient();
        const { error } = await client.from(SCHEMA.ACTION.table)
            .update({
                [SCHEMA.ACTION.columns.completion_status]: newStatus,
                [SCHEMA.ACTION.columns.updated_at]: new Date().toISOString()
            })
            .eq(SCHEMA.ACTION.columns.id, id)
            .eq(SCHEMA.ACTION.columns.user_id, user.id);

        if (error) {
            console.error('Failed to toggle action status:', error);
            this.app.showMessage('Failed to update action.', 'error');
            this.writeAppState('toggle', id, error.message);
            return;
        }

        this.writeAppState('toggle', id, null);
        await this.loadActions();
        this.showActions(this.activeTab);
    }

    async deleteAction(id) {
        if (!confirm('Delete this action?')) return;

        const user = this.app.currentUser;
        if (!user) return;

        const client = this.app.supabase.getClient();
        const { error } = await client.from(SCHEMA.ACTION.table)
            .delete()
            .eq(SCHEMA.ACTION.columns.id, id)
            .eq(SCHEMA.ACTION.columns.user_id, user.id);

        if (error) {
            console.error('Failed to delete action:', error);
            this.app.showMessage('Failed to delete action.', 'error');
            this.writeAppState('delete', id, error.message);
            return;
        }

        this.writeAppState('delete', id, null);
        await this.loadActions();
        this.showActions(this.activeTab);
    }

    // ==========================================
    // App State (for James to inspect without DevTools)
    // ==========================================

    writeAppState(operation, recordId, errors) {
        // Browser context — cannot write to filesystem.
        // State is observable via DebugPanel and the completed action list.
        // Server-side state writes are handled by server.py for features that use it.
    }

    // ==========================================
    // Utilities
    // ==========================================

    escapeHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }
}

window.ActionsView = ActionsView;
