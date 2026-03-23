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
        window.ordoApp.goalsView = this;
        this.goals = [];
        this.quarters = [];
        this.actionsByGoal = {};
        this.tasksByAction = {};
        this.activeQuarterTab = 'Q1';
        this.quarterMap = {};
    }

    async render() {
        await this.loadQuarters();
        await this.loadGoals();
        await this.loadActions();
        await this.loadTasks();
        // Default to first existing quarter
        this.activeQuarterTab = Object.keys(this.quarterMap)[0] || 'Q1';
        this.showGoals();
    }

    async loadActions() {
        const client = this.app.supabase.getClient();
        const user = this.app.currentUser;
        if (!user) return;

        const { data, error } = await client
            .from(SCHEMA.ACTION.table)
            .select('*')
            .eq(SCHEMA.ACTION.columns.user_id, user.id)
            .order(SCHEMA.ACTION.columns.created_at, { ascending: true });

        if (error) {
            console.error('Failed to load actions:', error);
            return;
        }

        this.actionsByGoal = {};
        for (const a of (data || [])) {
            const gid = a[SCHEMA.ACTION.columns.goal_id];
            if (!this.actionsByGoal[gid]) this.actionsByGoal[gid] = [];
            this.actionsByGoal[gid].push(a);
        }
    }

    async loadTasks() {
        const client = this.app.supabase.getClient();
        const user = this.app.currentUser;
        if (!user) return;

        const { data, error } = await client
            .from(SCHEMA.TASK.table)
            .select('*')
            .eq(SCHEMA.TASK.columns.user_id, user.id)
            .order(SCHEMA.TASK.columns.created_at, { ascending: true });

        if (error) {
            console.error('Failed to load tasks:', error);
            return;
        }

        this.tasksByAction = {};
        for (const t of (data || [])) {
            const aid = t[SCHEMA.TASK.columns.action_id];
            if (!this.tasksByAction[aid]) this.tasksByAction[aid] = [];
            this.tasksByAction[aid].push(t);
        }
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

            ${['Personal', 'Family', 'Church', 'Work'].map((realm) => {
                const realmOrder = ['Personal', 'Family', 'Church', 'Work'];
                const goalForRealm = filtered.find((g, idx) => realmOrder[idx] === realm);
                return goalForRealm
                    ? this.goalCard(goalForRealm)
                    : this.emptyGoalCard(realm);
            }).join('')}
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

        // [+ New] button on empty goal cards
        this.app.content.querySelectorAll('.add-goal-btn').forEach(btn => {
            btn.addEventListener('click', () => this.showAddForm(btn.dataset.realm));
        });
    }

    goalCard(goal, realm) {
        const title = this.escapeHtml(goal[SCHEMA.GOAL.columns.title] || '');
        const description = this.escapeHtml(goal[SCHEMA.GOAL.columns.description] || '');

        return `
            <div style="margin-bottom: 2px;">
                <div style="font-size: 16px; color: orange; margin-bottom: 1px;">${this.escapeHtml(realm) || 'No realm'}</div>
                <div class="card goal-card" data-id="${goal[SCHEMA.GOAL.columns.id]}" style="padding: 6px; margin-bottom: 4px; min-height: auto;">
                    <div class="card-header" style="margin-bottom: 2px;">
                        <span class="card-title" style="color: white; font-size: 14px;">${title || 'Untitled'}</span>
                        <div style="display: flex; gap: 4px; align-items: center;">
                            <button class="btn btn-secondary edit-goal-btn" data-goal-id="${goal[SCHEMA.GOAL.columns.id]}" style="padding: 2px 6px; font-size: 11px;">[ Edit ]</button>
                            <button class="btn btn-danger delete-goal-btn" data-goal-id="${goal[SCHEMA.GOAL.columns.id]}" style="padding: 2px 6px; font-size: 11px;">[ Delete ]</button>
                        </div>
                    </div>
                    ${description ? `<p style="margin: 2px 0; color: var(--text-secondary); font-size: 13px;">${this.escapeHtml(description)}</p>` : ''}
                    ${this.renderActionItems(goal[SCHEMA.GOAL.columns.id])}
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

                    <div style="margin-top: 4px;">
                        <button class="btn save-goal-btn" data-goal-id="${goal[SCHEMA.GOAL.columns.id]}" style="padding: 2px 6px; font-size: 11px;">[ Save ]</button>
                        <button class="btn btn-secondary cancel-goal-btn" data-goal-id="${goal[SCHEMA.GOAL.columns.id]}" style="padding: 2px 6px; font-size: 11px;">[ Cancel ]</button>
                    </div>
                </div>
            </div>
            </div>
        `;
    }

    renderTaskItems(actionId) {
        const tasks = this.tasksByAction[actionId] || [];
        return `
            <div style="padding-left: 16px; padding-top: 2px;">
                ${tasks.map(t => {
                    const tid = t[SCHEMA.TASK.columns.id];
                    const ttitle = this.escapeHtml(t[SCHEMA.TASK.columns.title] || '');
                    const isComplete = t[SCHEMA.TASK.columns.completion_status] === 'complete';
                    return `
                        <div style="display: flex; align-items: center; gap: 4px; margin-bottom: 1px;">
                            <span style="flex: 1; font-size: 13px; color: white; opacity: ${isComplete ? '0.3' : '0.7'}; text-decoration: ${isComplete ? 'line-through' : 'none'};">${ttitle}</span>
                            <button class="btn btn-secondary" style="padding: 1px 4px; font-size: 10px;" onclick="window.ordoApp.goalsView.toggleTaskEdit('${tid}')">[ Edit ]</button>
                            <button class="btn btn-danger" style="padding: 1px 4px; font-size: 10px;" onclick="window.ordoApp.goalsView.deleteTask('${tid}')">[x]</button>
                        </div>
                        <div class="task-edit-card" data-id="${tid}" style="display: none; padding-left: 16px; margin-bottom: 2px;">
                            <input type="text" class="input task-title-input" value="${ttitle}" style="width: 100%; color: white;">
                            <div style="display: flex; gap: 4px; margin-top: 2px;">
                                <button class="btn" style="padding: 1px 4px; font-size: 10px;" onclick="window.ordoApp.goalsView.saveTask('${tid}')">[ Save ]</button>
                                <button class="btn btn-secondary" style="padding: 1px 4px; font-size: 10px;" onclick="window.ordoApp.goalsView.toggleTaskEdit('${tid}')">[ Cancel ]</button>
                            </div>
                        </div>
                    `;
                }).join('')}
                <div style="display: flex; align-items: center; gap: 4px; opacity: 0.4;">
                    <span style="flex: 1; font-size: 13px; color: white;">New Task</span>
                    <button class="btn" style="padding: 1px 4px; font-size: 10px;" onclick="window.ordoApp.goalsView.addTaskForAction('${actionId}')">[ + ]</button>
                </div>
            </div>
        `;
    }

    toggleTaskEdit(taskId) {
        const card = document.querySelector(`.task-edit-card[data-id="${taskId}"]`);
        if (!card) return;
        const isVisible = card.style.display !== 'none';
        document.querySelectorAll('.task-edit-card').forEach(el => el.style.display = 'none');
        if (!isVisible) card.style.display = 'block';
    }

    async addTaskForAction(actionId) {
        const user = this.app.currentUser;
        if (!user) return;
        const client = this.app.supabase.getClient();
        await client.from(SCHEMA.TASK.table).insert({
            [SCHEMA.TASK.columns.action_id]: actionId,
            [SCHEMA.TASK.columns.title]: 'New Task',
            [SCHEMA.TASK.columns.completion_status]: 'pending',
            [SCHEMA.TASK.columns.user_id]: user.id
        });
        await this.loadTasks();
        await this.loadGoals();
    }

    async saveTask(taskId) {
        const user = this.app.currentUser;
        if (!user) return;
        const card = document.querySelector(`.task-edit-card[data-id="${taskId}"]`);
        if (!card) return;
        const title = card.querySelector('.task-title-input').value.trim();
        if (!title) return;
        const client = this.app.supabase.getClient();
        await client.from(SCHEMA.TASK.table)
            .update({ [SCHEMA.TASK.columns.title]: title })
            .eq(SCHEMA.TASK.columns.id, taskId)
            .eq(SCHEMA.TASK.columns.user_id, user.id);
        await this.loadTasks();
        await this.loadGoals();
    }

    async deleteTask(taskId) {
        if (!confirm('Delete this task?')) return;
        const user = this.app.currentUser;
        if (!user) return;
        const client = this.app.supabase.getClient();
        await client.from(SCHEMA.TASK.table)
            .delete()
            .eq(SCHEMA.TASK.columns.id, taskId)
            .eq(SCHEMA.TASK.columns.user_id, user.id);
        await this.loadTasks();
        await this.loadGoals();
    }

    renderActionItems(goalId) {
        const actions = this.actionsByGoal[goalId] || [];
        return `
            <div style="margin-top: 4px; padding-top: 4px; padding-left: 20px; border-top: 1px solid var(--border);">
                ${actions.length > 0 ? actions.map(a => {
                    const id = a[SCHEMA.ACTION.columns.id];
                    const title = this.escapeHtml(a[SCHEMA.ACTION.columns.title] || '');
                    const isComplete = a[SCHEMA.ACTION.columns.completion_status] === 'complete';
                    return `
                        <div style="margin-bottom: 4px;">
                            <div style="display: flex; align-items: center; gap: 4px;">
                                <span style="flex: 1; font-size: 14px; color: white; opacity: ${isComplete ? '0.4' : '1'}; text-decoration: ${isComplete ? 'line-through' : 'none'};">${title}</span>
                                <button class="btn btn-secondary" style="padding: 2px 6px; font-size: 11px;" onclick="window.ordoApp.goalsView.toggleActionEdit('${id}')">[ Edit ]</button>
                                <button class="btn btn-danger" style="padding: 2px 6px; font-size: 11px;" onclick="window.ordoApp.goalsView.deleteAction('${id}')">[ Delete ]</button>
                            </div>
                            <div class="action-edit-card" data-id="${id}" style="display: none; margin-top: 4px;">
                                <input type="text" class="input action-title-input" value="${title}" style="width: 100%; color: white;">
                                <div style="display: flex; gap: 4px; margin-top: 4px;">
                                    <button class="btn" style="padding: 2px 6px; font-size: 11px;" onclick="window.ordoApp.goalsView.saveAction('${id}')">[ Save ]</button>
                                    <button class="btn btn-secondary" style="padding: 2px 6px; font-size: 11px;" onclick="window.ordoApp.goalsView.toggleActionEdit('${id}')">[ Cancel ]</button>
                                </div>
                            </div>
                            ${this.renderTaskItems(id)}
                        </div>
                    `;
                }).join('') : ''}
                <div style="margin-bottom: 2px;">
                    <div style="display: flex; align-items: center; gap: 4px;">
                        <span style="flex: 1; font-size: 14px; color: white; opacity: 0.3;">New Action</span>
                        <button class="btn" style="padding: 2px 6px; font-size: 11px;" onclick="console.log('addAction clicked', window.ordoApp.goalsView); window.ordoApp.goalsView && window.ordoApp.goalsView.addActionForGoal('${goalId}')">[ + Add ]</button>
                    </div>
                </div>
            </div>
        `;
    }

    async addActionForGoal(goalId) {
        const user = this.app.currentUser;
        if (!user) return;
        const client = this.app.supabase.getClient();

        await client.from(SCHEMA.ACTION.table).insert({
            [SCHEMA.ACTION.columns.goal_id]: goalId,
            [SCHEMA.ACTION.columns.title]: 'New Action',
            [SCHEMA.ACTION.columns.completion_status]: 'pending',
            [SCHEMA.ACTION.columns.user_id]: user.id
        });

        await this.loadActions();
        // Find the new action before showGoals rebuilds the DOM
        const newAction = (this.actionsByGoal[goalId] || []).find(a => a[SCHEMA.ACTION.columns.title] === 'New Action');
        await this.showGoals();
        if (newAction) this.toggleActionEdit(newAction[SCHEMA.ACTION.columns.id]);
    }

    async deleteAction(actionId) {
        if (!confirm('Delete this action?')) return;
        const user = this.app.currentUser;
        if (!user) return;
        const client = this.app.supabase.getClient();
        await client.from(SCHEMA.ACTION.table)
            .delete()
            .eq(SCHEMA.ACTION.columns.id, actionId)
            .eq(SCHEMA.ACTION.columns.user_id, user.id);
        await this.loadActions();
        this.showGoals();
    }

    toggleActionEdit(actionId) {
        const card = document.querySelector(`.action-edit-card[data-id="${actionId}"]`);
        if (!card) return;
        const isVisible = card.style.display !== 'none';
        // Close all other edit forms
        document.querySelectorAll('.action-edit-card').forEach(el => el.style.display = 'none');
        if (!isVisible) {
            card.style.display = 'block';
        }
    }

    async saveAction(actionId) {
        const user = this.app.currentUser;
        if (!user) return;
        const card = document.querySelector(`.action-edit-card[data-id="${actionId}"]`);
        if (!card) return;
        const title = card.querySelector('.action-title-input').value.trim();
        if (!title) return;
        const client = this.app.supabase.getClient();
        await client.from(SCHEMA.ACTION.table)
            .update({ [SCHEMA.ACTION.columns.title]: title })
            .eq(SCHEMA.ACTION.columns.id, actionId)
            .eq(SCHEMA.ACTION.columns.user_id, user.id);
        await this.loadActions();
        this.showGoals();
    }

    emptyGoalCard(realm) {
        return `
            <div style="margin-bottom: 2px;">
                <div style="font-size: 16px; color: orange; margin-bottom: 1px;">${this.escapeHtml(realm)}</div>
                <div class="card goal-card" style="padding: 6px; margin-bottom: 4px; min-height: auto; opacity: 0.6; border-style: dashed;">
                    <div class="card-header" style="margin-bottom: 2px;">
                        <span style="color: var(--text-muted); font-size: 14px;">No Goal</span>
                        <button class="btn add-goal-btn" style="padding: 2px 8px; font-size: 11px;" data-realm="${this.escapeHtml(realm)}">[ + New ]</button>
                    </div>
                </div>
            </div>
        `;
    }

    showAddForm(preSelectedRealm) {
        this.selectedRealm = preSelectedRealm || null;
        const html = `
            <div class="card" id="new-goal-form" style="min-height: auto;">
                <div class="card-header">
                    <span class="card-title" style="color: orange;">${this.escapeHtml(this.selectedRealm || 'New Goal')}</span>
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

    async saveGoalTitle(goalId, newTitle) {
        const user = this.app.currentUser;
        if (!user) return;
        const title = newTitle.trim();
        if (!title) return;
        const client = this.app.supabase.getClient();
        await client.from(SCHEMA.GOAL.table)
            .update({ [SCHEMA.GOAL.columns.title]: title })
            .eq(SCHEMA.GOAL.columns.id, goalId)
            .eq(SCHEMA.GOAL.columns.user_id, user.id);
        await this.loadGoals();
        this.showGoals();
    }

    startEditGoalTitle(goalId, spanEl) {
        const currentText = spanEl.textContent;
        const input = document.createElement('input');
        input.type = 'text';
        input.value = currentText;
        input.style.cssText = 'color: white; font-size: 14px; background: transparent; border: none; border-bottom: 1px solid white; outline: none; width: 100%; padding: 0;';
        input.onkeydown = (e) => {
            if (e.key === 'Enter') { e.preventDefault(); input.blur(); }
            if (e.key === 'Escape') { input.value = currentText; input.blur(); }
        };
        input.onblur = () => {
            this.saveGoalTitle(goalId, input.value);
        };
        spanEl.replaceWith(input);
        input.focus();
        input.select();
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

        if (!title) {
            this.app.showMessage('Goal title is required.', 'error');
            return;
        }

        const client = this.app.supabase.getClient();

        const insert = {
            [SCHEMA.GOAL.columns.title]: title,
            [SCHEMA.GOAL.columns.description]: description,
            [SCHEMA.GOAL.columns.realm]: this.selectedRealm || '',
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

        if (!title) {
            this.app.showMessage('Goal title is required.', 'error');
            return;
        }

        const client = this.app.supabase.getClient();

        const { error } = await client.from(SCHEMA.GOAL.table)
            .update({
                [SCHEMA.GOAL.columns.title]: title,
                [SCHEMA.GOAL.columns.description]: description,
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
