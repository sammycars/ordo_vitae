/**
 * Weeks View - Ordo_Vitae
 *
 * Displays weeks grouped by quarter.
 * Create, edit, and delete weeks.
 * Each week has: start date, end date, linked quarter.
 *
 * Schema: SCHEMA.WEEK (from config.js)
 * Verified: week_id, user_id, week_quarter_id, week_start_date, week_end_date, week_created_at
 */

class WeeksView {
    constructor(app) {
        this.app = app;
        this.weeks = [];
        this.quarters = [];
        this.quarterMap = {}; // quarter_id -> quarter object
    }

    async render() {
        await this.loadQuarters();
        await this.loadWeeks();
        this.showWeeks();
    }

    // ==========================================
    // Data Loading
    // ==========================================

    async loadQuarters() {
        const client = this.app.supabase.getClient();
        const user = this.app.currentUser;
        if (!user) return;

        const { data, error } = await client
            .from(SCHEMA.QUARTER.table)
            .select('*')
            .eq(SCHEMA.QUARTER.columns.user_id, user.id)
            .order(SCHEMA.QUARTER.columns.quarter_year, { ascending: true })
            .order(SCHEMA.QUARTER.columns.quarter, { ascending: true });

        if (error) {
            console.error('Failed to load quarters:', error);
            return;
        }

        this.quarters = data || [];
        this.quarterMap = {};
        for (const q of this.quarters) {
            this.quarterMap[q[SCHEMA.QUARTER.columns.id]] = q;
        }
    }

    async loadWeeks() {
        const client = this.app.supabase.getClient();
        const user = this.app.currentUser;
        if (!user) return;

        const { data, error } = await client
            .from(SCHEMA.WEEK.table)
            .select('*')
            .eq(SCHEMA.WEEK.columns.user_id, user.id)
            .order(SCHEMA.WEEK.columns.start_date, { ascending: true });

        if (error) {
            console.error('Failed to load weeks:', error);
            return;
        }

        this.weeks = data || [];
    }

    // ==========================================
    // Rendering
    // ==========================================

    showWeeks() {
        // Group weeks by quarter_id
        const byQuarter = {};
        for (const w of this.weeks) {
            const qid = w[SCHEMA.WEEK.columns.quarter_id];
            if (!byQuarter[qid]) byQuarter[qid] = [];
            byQuarter[qid].push(w);
        }

        const quarterSections = this.quarters.length === 0
            ? '<p class="placeholder">No quarters found. Create quarters first.</p>'
            : this.quarters.map(q => this.quarterSection(q, byQuarter[q[SCHEMA.QUARTER.columns.id]] || [])).join('');

        const html = `
            <div class="button-group" style="margin-bottom: var(--space-md);">
                <button class="btn" onclick="window.ordoApp.weeksView.showAddForm()">[ + New Week ]</button>
                <button class="btn btn-secondary" onclick="window.ordoApp.weeksView.autoGenerate()">[ Auto-Generate for All Quarters ]</button>
            </div>
            ${quarterSections}
        `;

        this.app.content.innerHTML = html;
    }

    quarterSection(quarter, weeks) {
        const qid = quarter[SCHEMA.QUARTER.columns.id];
        const year = quarter[SCHEMA.QUARTER.columns.quarter_year];
        const qNum = quarter[SCHEMA.QUARTER.columns.quarter];
        const start = quarter[SCHEMA.QUARTER.columns.start_date];
        const end = quarter[SCHEMA.QUARTER.columns.end_date];

        const fmt = d => {
            if (!d) return '—';
            const [y, m, day] = d.split('-');
            const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
            return `${months[parseInt(m)-1]} ${parseInt(day)}`;
        };

        // Fill in Q1-Q4 slots for this quarter
        const weekSlots = weeks.length === 0
            ? '<p class="placeholder" style="font-size: var(--font-size-sm);">No weeks yet.</p>'
            : weeks.map(w => this.weekCard(w)).join('');

        return `
            <div class="card" style="margin-bottom: var(--space-lg);">
                <div class="card-header">
                    <span class="card-title">Q${qNum} ${year}</span>
                    <span style="font-size: var(--font-size-sm); color: var(--text-muted);">
                        ${fmt(start)} – ${fmt(end)}
                    </span>
                </div>
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: var(--space-md); margin-top: var(--space-md);">
                    ${weekSlots}
                </div>
                <div style="margin-top: var(--space-md);">
                    <button class="btn btn-secondary" style="font-size: var(--font-size-sm);" onclick="window.ordoApp.weeksView.showAddForm('${qid}')">[ + Add Week to Q${qNum} ]</button>
                    <button class="btn btn-secondary" style="font-size: var(--font-size-sm);" onclick="window.ordoApp.weeksView.autoGenerateQuarter('${qid}')">[ Auto-Generate Q${qNum} ]</button>
                </div>
            </div>
        `;
    }

    weekCard(week) {
        const id = week[SCHEMA.WEEK.columns.id];
        const start = week[SCHEMA.WEEK.columns.start_date] || '';
        const end = week[SCHEMA.WEEK.columns.end_date] || '';
        const startDisplay = start ? this.formatDate(start) : '—';
        const endDisplay = end ? this.formatDate(end) : '—';
        const duration = this.calcDuration(start, end);

        return `
            <div class="card" data-id="${id}" style="padding: var(--space-md);">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: var(--space-xs);">
                    <strong style="font-size: var(--font-size-sm);">${startDisplay} – ${endDisplay}</strong>
                    <div style="display: flex; gap: var(--space-xs);">
                        <button class="btn btn-secondary" style="padding: 2px 6px; font-size: var(--font-size-xs);" onclick="window.ordoApp.weeksView.toggleEdit('${id}')">[ Edit ]</button>
                        <button class="btn btn-danger" style="padding: 2px 6px; font-size: var(--font-size-xs);" onclick="window.ordoApp.weeksView.deleteWeek('${id}')">[ Delete ]</button>
                    </div>
                </div>
                ${duration ? `<p style="font-size: var(--font-size-xs); color: var(--text-muted); margin: 0;">${duration}</p>` : ''}

                <div class="week-edit" id="edit-${id}" style="display: none; margin-top: var(--space-md);">
                    <div style="display: grid; gap: var(--space-sm);">
                        <div>
                            <label style="font-size: var(--font-size-xs); color: var(--text-muted); display: block; margin-bottom: 2px;">Start Date</label>
                            <input type="date" class="input" id="ew-start-${id}" value="${start}" style="width: 100%;">
                        </div>
                        <div>
                            <label style="font-size: var(--font-size-xs); color: var(--text-muted); display: block; margin-bottom: 2px;">End Date</label>
                            <input type="date" class="input" id="ew-end-${id}" value="${end}" style="width: 100%;">
                        </div>
                        <div style="display: flex; gap: var(--space-sm);">
                            <button class="btn" onclick="window.ordoApp.weeksView.saveWeek('${id}')">[ Save ]</button>
                            <button class="btn btn-secondary" onclick="window.ordoApp.weeksView.toggleEdit('${id}')">[ Cancel ]</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // ==========================================
    // Add Form
    // ==========================================

    showAddForm(preselectedQuarterId) {
        const quarterOptions = this.quarters.map(q => {
            const qid = q[SCHEMA.QUARTER.columns.id];
            const year = q[SCHEMA.QUARTER.columns.quarter_year];
            const qNum = q[SCHEMA.QUARTER.columns.quarter];
            const sel = qid === preselectedQuarterId ? 'selected' : '';
            return `<option value="${qid}" ${sel}>Q${qNum} ${year}</option>`;
        }).join('');

        const defaultStart = preselectedQuarterId && this.quarterMap[preselectedQuarterId]
            ? this.quarterMap[preselectedQuarterId][SCHEMA.QUARTER.columns.start_date]
            : '';

        const html = `
            <div class="card" id="new-week-form" style="margin-bottom: var(--space-lg);">
                <div class="card-header">
                    <span class="card-title">New Week</span>
                </div>
                <div style="display: grid; gap: var(--space-sm);">
                    <div>
                        <label style="font-size: var(--font-size-xs); color: var(--text-muted); display: block; margin-bottom: 2px;">Quarter</label>
                        <select class="input" id="nw-quarter" style="width: 100%;">
                            ${quarterOptions || '<option value="">No quarters available</option>'}
                        </select>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-sm);">
                        <div>
                            <label style="font-size: var(--font-size-xs); color: var(--text-muted); display: block; margin-bottom: 2px;">Start Date</label>
                            <input type="date" class="input" id="nw-start" value="${defaultStart}" style="width: 100%;">
                        </div>
                        <div>
                            <label style="font-size: var(--font-size-xs); color: var(--text-muted); display: block; margin-bottom: 2px;">End Date</label>
                            <input type="date" class="input" id="nw-end" style="width: 100%;">
                        </div>
                    </div>
                    <div>
                        <button class="btn" onclick="window.ordoApp.weeksView.insertWeek()">[ Create ]</button>
                        <button class="btn btn-secondary" onclick="window.ordoApp.weeksView.showWeeks()">[ Cancel ]</button>
                    </div>
                </div>
            </div>
        `;

        this.app.content.innerHTML = html + this.app.content.innerHTML;
    }

    // ==========================================
    // Auto-Generate
    // ==========================================

    /**
     * Auto-generate weeks for a single quarter.
     * Weeks run Monday–Sunday, starting from the quarter's start date.
     */
    async autoGenerateQuarter(quarterId) {
        const quarter = this.quarterMap[quarterId];
        if (!quarter) return;

        const startStr = quarter[SCHEMA.QUARTER.columns.start_date];
        const endStr = quarter[SCHEMA.QUARTER.columns.end_date];
        if (!startStr || !endStr) return;

        const start = new Date(startStr + 'T00:00:00');
        const end = new Date(endStr + 'T00:00:00');

        // Align start to the following Monday
        const day = start.getDay(); // 0=Sun, 1=Mon, ...
        const daysToMon = day === 0 ? 1 : 8 - day;
        const firstMon = new Date(start);
        firstMon.setDate(start.getDate() + daysToMon);

        const weeksToInsert = [];
        let weekStart = new Date(firstMon);

        while (weekStart <= end) {
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 6);
            const s = this.dateToStr(weekStart);
            const e = weekEnd <= end ? this.dateToStr(weekEnd) : endStr;
            weeksToInsert.push({
                [SCHEMA.WEEK.columns.quarter_id]: quarterId,
                [SCHEMA.WEEK.columns.start_date]: s,
                [SCHEMA.WEEK.columns.end_date]: e
            });
            weekStart.setDate(weekStart.getDate() + 7);
        }

        if (weeksToInsert.length === 0) return;

        const user = this.app.currentUser;
        if (!user) return;

        const client = this.app.supabase.getClient();

        // Insert all weeks (ignore duplicates via start_date unique constraint if any)
        const { error } = await client.from(SCHEMA.WEEK.table).insert(
            weeksToInsert.map(w => ({ ...w, [SCHEMA.WEEK.columns.user_id]: user.id }))
        );

        if (error) {
            console.error('Failed to auto-generate weeks:', error);
            this.app.showMessage('Failed to generate weeks: ' + error.message, 'error');
            return;
        }

        await this.loadWeeks();
        this.showWeeks();
    }

    async autoGenerate() {
        // Generate for all quarters
        for (const q of this.quarters) {
            await this.autoGenerateQuarter(q[SCHEMA.QUARTER.columns.id]);
        }
    }

    // ==========================================
    // CRUD Operations
    // ==========================================

    toggleEdit(id) {
        const editDiv = document.getElementById(`edit-${id}`);
        if (!editDiv) return;
        editDiv.style.display = editDiv.style.display === 'none' ? 'block' : 'none';
    }

    async insertWeek() {
        const user = this.app.currentUser;
        if (!user) return;

        const quarterId = document.getElementById('nw-quarter').value;
        const startDate = document.getElementById('nw-start').value;
        const endDate = document.getElementById('nw-end').value;

        if (!quarterId || !startDate || !endDate) {
            this.app.showMessage('Quarter, start date, and end date are required.', 'error');
            return;
        }

        if (startDate >= endDate) {
            this.app.showMessage('End date must be after start date.', 'error');
            return;
        }

        const client = this.app.supabase.getClient();

        const { error } = await client.from(SCHEMA.WEEK.table).insert({
            [SCHEMA.WEEK.columns.user_id]: user.id,
            [SCHEMA.WEEK.columns.quarter_id]: quarterId,
            [SCHEMA.WEEK.columns.start_date]: startDate,
            [SCHEMA.WEEK.columns.end_date]: endDate
        });

        if (error) {
            console.error('Failed to create week:', error);
            this.app.showMessage('Failed to create week: ' + error.message, 'error');
            return;
        }

        await this.loadWeeks();
        this.showWeeks();
    }

    async saveWeek(id) {
        const user = this.app.currentUser;
        if (!user) return;

        const startDate = document.getElementById(`ew-start-${id}`).value;
        const endDate = document.getElementById(`ew-end-${id}`).value;

        if (!startDate || !endDate) {
            this.app.showMessage('Start and end dates are required.', 'error');
            return;
        }

        if (startDate >= endDate) {
            this.app.showMessage('End date must be after start date.', 'error');
            return;
        }

        const client = this.app.supabase.getClient();

        const { error } = await client.from(SCHEMA.WEEK.table)
            .update({
                [SCHEMA.WEEK.columns.start_date]: startDate,
                [SCHEMA.WEEK.columns.end_date]: endDate
            })
            .eq(SCHEMA.WEEK.columns.id, id)
            .eq(SCHEMA.WEEK.columns.user_id, user.id);

        if (error) {
            console.error('Failed to save week:', error);
            this.app.showMessage('Failed to save week.', 'error');
            return;
        }

        await this.loadWeeks();
        this.showWeeks();
    }

    async deleteWeek(id) {
        if (!confirm('Delete this week?')) return;

        const user = this.app.currentUser;
        if (!user) return;

        const client = this.app.supabase.getClient();

        const { error } = await client.from(SCHEMA.WEEK.table)
            .delete()
            .eq(SCHEMA.WEEK.columns.id, id)
            .eq(SCHEMA.WEEK.columns.user_id, user.id);

        if (error) {
            console.error('Failed to delete week:', error);
            this.app.showMessage('Failed to delete week.', 'error');
            return;
        }

        await this.loadWeeks();
        this.showWeeks();
    }

    // ==========================================
    // Utilities
    // ==========================================

    formatDate(dateStr) {
        if (!dateStr) return '';
        const d = new Date(dateStr + 'T00:00:00');
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }

    calcDuration(start, end) {
        if (!start || !end) return '';
        const s = new Date(start);
        const e = new Date(end);
        const diff = Math.round((e - s) / (1000 * 60 * 60 * 24)) + 1;
        return `${diff} day${diff !== 1 ? 's' : ''}`;
    }

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

window.WeeksView = WeeksView;
