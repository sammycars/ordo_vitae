/**
 * Habits View - Ordo_Vitae
 *
 * Two-table habit tracking:
 *   - habit_father: the habit definition (name, target days, pause state)
 *   - habit_son: daily log entries (date, completion status)
 *
 * Layout: list of habit fathers, click to expand and see/log days.
 *
 * Schema: SCHEMA.HABIT_FATHER, SCHEMA.HABIT_SON (from config.js)
 * Verified: habit_father_id, user_id, habit_father_name, habit_father_target_days,
 *           habit_father_is_paused, habit_father_paused_reason, habit_father_created_at, habit_father_updated_at
 *           habit_son_id, user_id, habit_son_habit_id, habit_son_date, habit_son_completion_status, habit_son_created_at
 */

class HabitsView {
    constructor(app) {
        this.app = app;
        this.habits = [];       // habit_fathers
        this.sons = {};         // habit_id -> habit_sons[]
        this.activeHabitId = null;
        this.newHabitTargetDays = 7;
    }

    async render() {
        await this.loadHabits();
        this.showHabits();
    }

    // ==========================================
    // Data Loading
    // ==========================================

    async loadHabits() {
        const client = this.app.supabase.getClient();
        const user = this.app.currentUser;
        if (!user) return;

        const { data, error } = await client
            .from(SCHEMA.HABIT_FATHER.table)
            .select('*')
            .eq(SCHEMA.HABIT_FATHER.columns.user_id, user.id)
            .order(SCHEMA.HABIT_FATHER.columns.created_at, { ascending: false });

        if (error) {
            console.error('Failed to load habits:', error);
            return;
        }

        this.habits = data || [];
    }

    async loadSons(habitId) {
        const client = this.app.supabase.getClient();
        const user = this.app.currentUser;
        if (!user) return;

        // Load habit_sons for this habit (past 60 days + next 7 days)
        const today = new Date();
        const past = new Date(today);
        past.setDate(today.getDate() - 60);
        const future = new Date(today);
        future.setDate(today.getDate() + 7);

        const { data, error } = await client
            .from(SCHEMA.HABIT_SON.table)
            .select('*')
            .eq(SCHEMA.HABIT_SON.columns.user_id, user.id)
            .eq(SCHEMA.HABIT_SON.columns.habit_id, habitId)
            .gte(SCHEMA.HABIT_SON.columns.date, this.dateToStr(past))
            .lte(SCHEMA.HABIT_SON.columns.date, this.dateToStr(future))
            .order(SCHEMA.HABIT_SON.columns.date, { ascending: false });

        if (error) {
            console.error('Failed to load habit sons:', error);
            return;
        }

        this.sons[habitId] = data || [];
    }

    // ==========================================
    // Rendering
    // ==========================================

    showHabits() {
        if (this.habits.length === 0) {
            this.app.content.innerHTML = `
                <div class="button-group" style="margin-bottom: var(--space-md);">
                    <button class="btn" onclick="window.ordoApp.habitsView.showAddForm()">[ + New Habit ]</button>
                </div>
                <p class="placeholder">No habits yet. Create your first habit below.</p>
            `;
            return;
        }

        const habitCards = this.habits.map(h => this.habitCard(h)).join('');

        const html = `
            <div class="button-group" style="margin-bottom: var(--space-md);">
                <button class="btn" onclick="window.ordoApp.habitsView.showAddForm()">[ + New Habit ]</button>
            </div>
            ${habitCards}
        `;

        this.app.content.innerHTML = html;
    }

    async habitCard(habit) {
        const id = habit[SCHEMA.HABIT_FATHER.columns.id];
        const name = this.escapeHtml(habit[SCHEMA.HABIT_FATHER.columns.name] || '');
        const target = habit[SCHEMA.HABIT_FATHER.columns.target_days] || 7;
        const isPaused = habit[SCHEMA.HABIT_FATHER.columns.is_paused] || false;
        const pausedReason = habit[SCHEMA.HABIT_FATHER.columns.paused_reason] || '';

        // Calculate recent completion rate (last 7 days with a log)
        await this.loadSons(id);
        const sons = this.sons[id] || [];

        const today = this.dateToStr(new Date());
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(new Date().getDate() - 7);
        const recentSons = sons.filter(s => {
            const d = s[SCHEMA.HABIT_SON.columns.date];
            return d >= this.dateToStr(sevenDaysAgo) && d <= today;
        });

        const completed = recentSons.filter(s => s[SCHEMA.HABIT_SON.columns.completion_status] === SCHEMA.HABIT_SON.status.complete).length;
        const total = recentSons.length;
        const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

        const statusBadge = isPaused
            ? `<span style="color: var(--text-muted); font-size: var(--font-size-xs);">[ Paused${pausedReason ? ': ' + this.escapeHtml(pausedReason) : ''} ]</span>`
            : `<span style="color: var(--object-color, #888); font-size: var(--font-size-xs);">${completed}/${target} days this week</span>`;

        const expanded = this.activeHabitId === id ? 'block' : 'none';

        return `
            <div class="card habit-card" data-id="${id}" style="margin-bottom: var(--space-md);">
                <div class="card-header" style="cursor: pointer;" onclick="window.ordoApp.habitsView.toggleExpand('${id}')">
                    <div style="display: flex; align-items: center; gap: var(--space-md); flex-wrap: wrap;">
                        <span class="card-title">${name}</span>
                        ${statusBadge}
                        ${!isPaused ? `
                            <div style="flex: 1; max-width: 120px; background: var(--bg-secondary); border-radius: 4px; height: 6px; overflow: hidden;">
                                <div style="width: ${rate}%; height: 100%; background: var(--object-color, #888); transition: width 0.3s;"></div>
                            </div>
                            <span style="font-size: var(--font-size-xs); color: var(--text-muted);">${rate}%</span>
                        ` : ''}
                    </div>
                    <div style="display: flex; gap: var(--space-sm);" onclick="event.stopPropagation()">
                        ${!isPaused
                            ? `<button class="btn btn-secondary" style="padding: 2px 6px; font-size: var(--font-size-xs);" onclick="window.ordoApp.habitsView.togglePause('${id}')">[ Pause ]</button>`
                            : `<button class="btn btn-secondary" style="padding: 2px 6px; font-size: var(--font-size-xs);" onclick="window.ordoApp.habitsView.togglePause('${id}')">[ Resume ]</button>`
                        }
                        <button class="btn btn-danger" style="padding: 2px 6px; font-size: var(--font-size-xs);" onclick="window.ordoApp.habitsView.deleteHabit('${id}')">[ Delete ]</button>
                    </div>
                </div>

                <div class="habit-expanded" id="habit-expand-${id}" style="display: ${expanded}; margin-top: var(--space-md);">
                    ${this.habitSonsGrid(id, sons)}
                </div>
            </div>
        `;
    }

    habitSonsGrid(habitId, sons) {
        const today = new Date();
        const sonMap = {};
        for (const s of sons) {
            sonMap[s[SCHEMA.HABIT_SON.columns.date]] = s;
        }

        // Show last 14 days + next 7 days = 21 days
        const days = [];
        for (let i = 13; i >= -7; i--) {
            const d = new Date(today);
            d.setDate(today.getDate() + i);
            days.push(d);
        }

        const cells = days.map(d => {
            const ds = this.dateToStr(d);
            const son = sonMap[ds];
            const isToday = ds === this.dateToStr(today);
            const isFuture = d > today;

            if (son) {
                const isComplete = son[SCHEMA.HABIT_SON.columns.completion_status] === SCHEMA.HABIT_SON.status.complete;
                return `
                    <div class="habit-son-cell ${isComplete ? 'habit-son-cell--done' : 'habit-son-cell--missed'}"
                         onclick="window.ordoApp.habitsView.toggleSon('${son[SCHEMA.HABIT_SON.columns.id]}', '${habitId}', '${ds}', ${isComplete})"
                         title="${ds}${isComplete ? ' ✓' : ' —'}">
                        <span class="habit-son-dow">${d.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                        <span class="habit-son-num">${d.getDate()}</span>
                        ${isComplete ? '<span class="habit-son-check">✓</span>' : ''}
                    </div>
                `;
            } else if (isFuture) {
                return `
                    <div class="habit-son-cell habit-son-cell--future" title="${ds} — future">
                        <span class="habit-son-dow">${d.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                        <span class="habit-son-num">${d.getDate()}</span>
                    </div>
                `;
            } else {
                return `
                    <div class="habit-son-cell habit-son-cell--empty"
                         onclick="window.ordoApp.habitsView.addSon('${habitId}', '${ds}')"
                         title="Log ${ds}">
                        <span class="habit-son-dow">${d.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                        <span class="habit-son-num">${d.getDate()}</span>
                    </div>
                `;
            }
        });

        const todayIdx = days.findIndex(d => this.dateToStr(d) === this.dateToStr(today));
        const beforeToday = cells.slice(0, todayIdx + 1);
        const afterToday = cells.slice(todayIdx + 1);

        return `
            <div style="display: grid; gap: var(--space-xs);">
                <div style="display: flex; gap: 4px; flex-wrap: wrap; justify-content: flex-start;">
                    ${beforeToday.join('')}
                </div>
                ${afterToday.length > 0 ? `
                    <div style="display: flex; gap: 4px; flex-wrap: wrap; justify-content: flex-start; opacity: 0.5;">
                        ${afterToday.join('')}
                    </div>
                ` : ''}
            </div>
            <p style="font-size: var(--font-size-xs); color: var(--text-muted); margin-top: var(--space-sm);">
                Click a day to log. Click a logged day to undo.
            </p>
        `;
    }

    // ==========================================
    // Add Form
    // ==========================================

    showAddForm() {
        const html = `
            <div class="card" id="new-habit-form" style="margin-bottom: var(--space-lg);">
                <div class="card-header">
                    <span class="card-title">New Habit</span>
                </div>
                <div style="display: grid; gap: var(--space-sm); max-width: 480px;">
                    <div>
                        <label style="font-size: var(--font-size-xs); color: var(--text-muted); display: block; margin-bottom: 2px;">Habit Name</label>
                        <input type="text" class="input" id="nh-name" placeholder="e.g. Read Scripture" style="width: 100%;">
                    </div>
                    <div>
                        <label style="font-size: var(--font-size-xs); color: var(--text-muted); display: block; margin-bottom: 2px;">Target Days per Week (1–7)</label>
                        <select class="input" id="nh-target" style="width: 100%;">
                            ${[1,2,3,4,5,6,7].map(n => `<option value="${n}" ${n === 7 ? 'selected' : ''}>${n} day${n > 1 ? 's' : ''} / week</option>`).join('')}
                        </select>
                    </div>
                    <div>
                        <button class="btn" onclick="window.ordoApp.habitsView.insertHabit()">[ Create ]</button>
                        <button class="btn btn-secondary" onclick="window.ordoApp.habitsView.showHabits()">[ Cancel ]</button>
                    </div>
                </div>
            </div>
        `;

        this.app.content.innerHTML = html + this.app.content.innerHTML;
    }

    // ==========================================
    // CRUD Operations
    // ==========================================

    toggleExpand(habitId) {
        this.activeHabitId = this.activeHabitId === habitId ? null : habitId;
        // Re-render just the expanded content
        this.loadSons(habitId).then(() => {
            const card = document.querySelector(`.habit-card[data-id="${habitId}"]`);
            if (!card) return;
            const expandDiv = document.getElementById(`habit-expand-${habitId}`);
            if (!expandDiv) return;
            expandDiv.style.display = this.activeHabitId === habitId ? 'block' : 'none';
        });
    }

    async insertHabit() {
        const user = this.app.currentUser;
        if (!user) return;

        const name = document.getElementById('nh-name').value.trim();
        const targetDays = parseInt(document.getElementById('nh-target').value) || 7;

        if (!name) {
            this.app.showMessage('Habit name is required.', 'error');
            return;
        }

        const client = this.app.supabase.getClient();

        const { data, error } = await client.from(SCHEMA.HABIT_FATHER.table).insert({
            [SCHEMA.HABIT_FATHER.columns.user_id]: user.id,
            [SCHEMA.HABIT_FATHER.columns.name]: name,
            [SCHEMA.HABIT_FATHER.columns.target_days]: targetDays,
            [SCHEMA.HABIT_FATHER.columns.is_paused]: false
        }).select().single();

        if (error) {
            console.error('Failed to create habit:', error);
            this.app.showMessage('Failed to create habit: ' + error.message, 'error');
            return;
        }

        // Auto-create habit_sons for today + next 6 days
        await this.seedSons(data[SCHEMA.HABIT_FATHER.columns.id], 7);

        await this.loadHabits();
        this.showHabits();
    }

    async seedSons(habitId, count) {
        const user = this.app.currentUser;
        if (!user) return;

        const client = this.app.supabase.getClient();
        const today = new Date();
        const inserts = [];

        for (let i = 0; i < count; i++) {
            const d = new Date(today);
            d.setDate(today.getDate() + i);
            inserts.push({
                [SCHEMA.HABIT_SON.columns.user_id]: user.id,
                [SCHEMA.HABIT_SON.columns.habit_id]: habitId,
                [SCHEMA.HABIT_SON.columns.date]: this.dateToStr(d),
                [SCHEMA.HABIT_SON.columns.completion_status]: SCHEMA.HABIT_SON.status.pending
            });
        }

        if (inserts.length === 0) return;

        await client.from(SCHEMA.HABIT_SON.table)
            .upsert(inserts, { onConflict: `${SCHEMA.HABIT_SON.columns.habit_id},${SCHEMA.HABIT_SON.columns.date}`, ignoreDuplicates: true });
    }

    async togglePause(habitId) {
        const user = this.app.currentUser;
        if (!user) return;

        const habit = this.habits.find(h => h[SCHEMA.HABIT_FATHER.columns.id] === habitId);
        if (!habit) return;

        const isPaused = habit[SCHEMA.HABIT_FATHER.columns.is_paused] || false;
        const newPaused = !isPaused;

        const client = this.app.supabase.getClient();

        const { error } = await client.from(SCHEMA.HABIT_FATHER.table)
            .update({ [SCHEMA.HABIT_FATHER.columns.is_paused]: newPaused })
            .eq(SCHEMA.HABIT_FATHER.columns.id, habitId)
            .eq(SCHEMA.HABIT_FATHER.columns.user_id, user.id);

        if (error) {
            console.error('Failed to toggle pause:', error);
            return;
        }

        await this.loadHabits();
        this.showHabits();
    }

    async deleteHabit(habitId) {
        if (!confirm('Delete this habit and all its logs?')) return;

        const user = this.app.currentUser;
        if (!user) return;

        const client = this.app.supabase.getClient();

        // Delete sons first
        await client.from(SCHEMA.HABIT_SON.table)
            .delete()
            .eq(SCHEMA.HABIT_SON.columns.habit_id, habitId)
            .eq(SCHEMA.HABIT_SON.columns.user_id, user.id);

        // Delete father
        const { error } = await client.from(SCHEMA.HABIT_FATHER.table)
            .delete()
            .eq(SCHEMA.HABIT_FATHER.columns.id, habitId)
            .eq(SCHEMA.HABIT_FATHER.columns.user_id, user.id);

        if (error) {
            console.error('Failed to delete habit:', error);
            this.app.showMessage('Failed to delete habit.', 'error');
            return;
        }

        this.activeHabitId = null;
        await this.loadHabits();
        this.showHabits();
    }

    async addSon(habitId, date) {
        const user = this.app.currentUser;
        if (!user) return;

        const client = this.app.supabase.getClient();

        const { error } = await client.from(SCHEMA.HABIT_SON.table).upsert({
            [SCHEMA.HABIT_SON.columns.user_id]: user.id,
            [SCHEMA.HABIT_SON.columns.habit_id]: habitId,
            [SCHEMA.HABIT_SON.columns.date]: date,
            [SCHEMA.HABIT_SON.columns.completion_status]: SCHEMA.HABIT_SON.status.complete
        }, { onConflict: `${SCHEMA.HABIT_SON.columns.habit_id},${SCHEMA.HABIT_SON.columns.date}` });

        if (error) {
            console.error('Failed to add son:', error);
            return;
        }

        await this.loadSons(habitId);
        await this.loadHabits();
        this.showHabits();
        this.activeHabitId = habitId;
    }

    async toggleSon(sonId, habitId, date, isCurrentlyComplete) {
        const user = this.app.currentUser;
        if (!user) return;

        const client = this.app.supabase.getClient();
        const newStatus = isCurrentlyComplete
            ? SCHEMA.HABIT_SON.status.pending
            : SCHEMA.HABIT_SON.status.complete;

        const { error } = await client.from(SCHEMA.HABIT_SON.table)
            .update({ [SCHEMA.HABIT_SON.columns.completion_status]: newStatus })
            .eq(SCHEMA.HABIT_SON.columns.id, sonId)
            .eq(SCHEMA.HABIT_SON.columns.user_id, user.id);

        if (error) {
            console.error('Failed to toggle son:', error);
            return;
        }

        await this.loadSons(habitId);
        await this.loadHabits();
        this.showHabits();
        this.activeHabitId = habitId;
    }

    // ==========================================
    // Utilities
    // ==========================================

    dateToStr(d) {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
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

window.HabitsView = HabitsView;
