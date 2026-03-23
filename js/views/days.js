/**
 * Days View - Ordo_Vitae
 *
 * Displays days grouped by week.
 * Create and delete days.
 * Each day has: date, linked week.
 *
 * Schema: SCHEMA.DAY (from config.js)
 * Verified: day_id, user_id, day_week_id, day_date, day_created_at
 */

class DaysView {
    constructor(app) {
        this.app = app;
        this.days = [];
        this.weeks = [];
        this.quarters = [];
        this.weekMap = {};     // week_id -> week object
        this.quarterMap = {};  // quarter_id -> quarter object
        this.daysByWeek = {};  // week_id -> days array
    }

    async render() {
        await this.loadQuarters();
        await this.loadWeeks();
        await this.loadDays();
        this.showDays();
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
        this.weekMap = {};
        for (const w of this.weeks) {
            this.weekMap[w[SCHEMA.WEEK.columns.id]] = w;
        }
    }

    async loadDays() {
        const client = this.app.supabase.getClient();
        const user = this.app.currentUser;
        if (!user) return;

        const { data, error } = await client
            .from(SCHEMA.DAY.table)
            .select('*')
            .eq(SCHEMA.DAY.columns.user_id, user.id)
            .order(SCHEMA.DAY.columns.date, { ascending: true });

        if (error) {
            console.error('Failed to load days:', error);
            return;
        }

        this.days = data || [];

        // Index days by week_id
        this.daysByWeek = {};
        for (const d of this.days) {
            const wid = d[SCHEMA.DAY.columns.week_id];
            if (!this.daysByWeek[wid]) this.daysByWeek[wid] = [];
            this.daysByWeek[wid].push(d);
        }
    }

    // ==========================================
    // Rendering
    // ==========================================

    showDays() {
        // Group weeks by quarter
        const byQuarter = {};
        for (const w of this.weeks) {
            const qid = w[SCHEMA.WEEK.columns.quarter_id];
            if (!byQuarter[qid]) byQuarter[qid] = [];
            byQuarter[qid].push(w);
        }

        const fmt = d => {
            if (!d) return '—';
            const [y, m, day] = d.split('-');
            const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
            return `${months[parseInt(m)-1]} ${parseInt(day)}`;
        };

        const quarterSections = this.quarters.length === 0
            ? '<p class="placeholder">No quarters found. Create quarters and weeks first.</p>'
            : this.quarters.map(q => {
                const qid = q[SCHEMA.QUARTER.columns.id];
                const year = q[SCHEMA.QUARTER.columns.quarter_year];
                const qNum = q[SCHEMA.QUARTER.columns.quarter];
                const weeks = byQuarter[qid] || [];
                if (weeks.length === 0) return '';

                return `
                    <div class="card" style="margin-bottom: var(--space-lg);">
                        <div class="card-header">
                            <span class="card-title">Q${qNum} ${year}</span>
                            <span style="font-size: var(--font-size-sm); color: var(--text-muted);">
                                ${fmt(q[SCHEMA.QUARTER.columns.start_date])} – ${fmt(q[SCHEMA.QUARTER.columns.end_date])}
                            </span>
                        </div>
                        ${weeks.map(w => this.weekRow(w)).join('')}
                    </div>
                `;
            }).join('');

        const html = `
            <div class="button-group" style="margin-bottom: var(--space-md);">
                <button class="btn" onclick="window.ordoApp.daysView.showAddForm()">[ + Add Day ]</button>
                <button class="btn btn-secondary" onclick="window.ordoApp.daysView.autoGenerate()">[ Auto-Generate for All Weeks ]</button>
            </div>
            ${quarterSections || '<p class="placeholder">No weeks found. Create weeks first.</p>'}
        `;

        this.app.content.innerHTML = html;
    }

    weekRow(week) {
        const wid = week[SCHEMA.WEEK.columns.id];
        const start = week[SCHEMA.WEEK.columns.start_date] || '';
        const end = week[SCHEMA.WEEK.columns.end_date] || '';
        const days = this.daysByWeek[wid] || [];

        const fmt = d => {
            if (!d) return '—';
            const [y, m, day] = d.split('-');
            const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
            return `${months[parseInt(m)-1]} ${parseInt(day)}`;
        };

        // Build a 7-day grid for the week (Mon–Sun)
        const dayMap = {};
        for (const d of days) {
            dayMap[d[SCHEMA.DAY.columns.date]] = d;
        }

        const cells = [];
        const startDate = new Date(start + 'T00:00:00');
        for (let i = 0; i < 7; i++) {
            const d = new Date(startDate);
            d.setDate(startDate.getDate() + i);
            const ds = this.dateToStr(d);
            const dayObj = dayMap[ds];
            const isPast = d < new Date(new Date().toDateString());

            if (dayObj) {
                const dow = d.toLocaleDateString('en-US', { weekday: 'short' });
                cells.push(`
                    <div class="day-cell day-cell--filled" onclick="window.ordoApp.daysView.deleteDay('${dayObj[SCHEMA.DAY.columns.id]}')" title="Click to delete ${ds}">
                        <span class="day-cell-dow">${dow}</span>
                        <span class="day-cell-num">${d.getDate()}</span>
                    </div>
                `);
            } else {
                const dow = d.toLocaleDateString('en-US', { weekday: 'short' });
                cells.push(`
                    <div class="day-cell day-cell--empty" onclick="window.ordoApp.daysView.insertDayForDate('${ds}', '${wid}')" title="Click to add ${ds}">
                        <span class="day-cell-dow">${dow}</span>
                        <span class="day-cell-num">${d.getDate()}</span>
                    </div>
                `);
            }
        }

        return `
            <div style="margin-bottom: var(--space-md);">
                <div style="font-size: var(--font-size-sm); color: var(--text-muted); margin-bottom: var(--space-xs);">
                    ${fmt(start)} – ${fmt(end)}
                    <span style="margin-left: var(--space-sm); color: var(--text-secondary);">${days.length}/7 days logged</span>
                </div>
                <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px;">
                    ${cells.join('')}
                </div>
            </div>
        `;
    }

    // ==========================================
    // Add Form
    // ==========================================

    showAddForm() {
        // Group weeks for the select
        const weekOptions = this.weeks.map(w => {
            const wid = w[SCHEMA.WEEK.columns.id];
            const start = w[SCHEMA.WEEK.columns.start_date] || '';
            const end = w[SCHEMA.WEEK.columns.end_date] || '';
            return `<option value="${wid}">${start} – ${end}</option>`;
        }).join('');

        const today = this.dateToStr(new Date());

        const html = `
            <div class="card" id="new-day-form" style="margin-bottom: var(--space-lg);">
                <div class="card-header">
                    <span class="card-title">Add Day</span>
                </div>
                <div style="display: grid; gap: var(--space-sm); max-width: 400px;">
                    <div>
                        <label style="font-size: var(--font-size-xs); color: var(--text-muted); display: block; margin-bottom: 2px;">Date</label>
                        <input type="date" class="input" id="nd-date" value="${today}" style="width: 100%;">
                    </div>
                    <div>
                        <label style="font-size: var(--font-size-xs); color: var(--text-muted); display: block; margin-bottom: 2px;">Week</label>
                        <select class="input" id="nd-week" style="width: 100%;">
                            ${weekOptions || '<option value="">No weeks available</option>'}
                        </select>
                    </div>
                    <div>
                        <button class="btn" onclick="window.ordoApp.daysView.insertDay()">[ Add ]</button>
                        <button class="btn btn-secondary" onclick="window.ordoApp.daysView.showDays()">[ Cancel ]</button>
                    </div>
                </div>
            </div>
        `;

        this.app.content.innerHTML = html + this.app.content.innerHTML;
    }

    // ==========================================
    // Auto-Generate
    // ==========================================

    async autoGenerate() {
        const user = this.app.currentUser;
        if (!user) return;

        const client = this.app.supabase.getClient();
        let created = 0;

        for (const week of this.weeks) {
            const wid = week[SCHEMA.WEEK.columns.id];
            const startStr = week[SCHEMA.WEEK.columns.start_date];
            const endStr = week[SCHEMA.WEEK.columns.end_date];
            if (!startStr || !endStr) continue;

            const start = new Date(startStr + 'T00:00:00');
            const end = new Date(endStr + 'T00:00:00');
            const daysToInsert = [];

            let d = new Date(start);
            while (d <= end) {
                const ds = this.dateToStr(d);
                daysToInsert.push({
                    [SCHEMA.DAY.columns.week_id]: wid,
                    [SCHEMA.DAY.columns.date]: ds,
                    [SCHEMA.DAY.columns.user_id]: user.id
                });
                d.setDate(d.getDate() + 1);
            }

            if (daysToInsert.length === 0) continue;

            // Upsert: delete existing days for this week, then insert all
            // (day_date is UNIQUE so we use upsert)
            const { error } = await client.from(SCHEMA.DAY.table)
                .upsert(daysToInsert, { onConflict: SCHEMA.DAY.columns.date, ignoreDuplicates: true });

            if (!error) created += daysToInsert.length;
        }

        this.app.showMessage(`Auto-generated days for all weeks.`, 'success');
        await this.loadDays();
        this.showDays();
    }

    // ==========================================
    // CRUD Operations
    // ==========================================

    async insertDay() {
        const user = this.app.currentUser;
        if (!user) return;

        const date = document.getElementById('nd-date').value;
        const weekId = document.getElementById('nd-week').value;

        if (!date || !weekId) {
            this.app.showMessage('Date and week are required.', 'error');
            return;
        }

        const client = this.app.supabase.getClient();

        const { error } = await client.from(SCHEMA.DAY.table).upsert({
            [SCHEMA.DAY.columns.user_id]: user.id,
            [SCHEMA.DAY.columns.week_id]: weekId,
            [SCHEMA.DAY.columns.date]: date
        }, { onConflict: SCHEMA.DAY.columns.date, ignoreDuplicates: true });

        if (error) {
            console.error('Failed to add day:', error);
            this.app.showMessage('Failed to add day: ' + error.message, 'error');
            return;
        }

        await this.loadDays();
        this.showDays();
    }

    async insertDayForDate(date, weekId) {
        const user = this.app.currentUser;
        if (!user) return;

        const client = this.app.supabase.getClient();

        const { error } = await client.from(SCHEMA.DAY.table).upsert({
            [SCHEMA.DAY.columns.user_id]: user.id,
            [SCHEMA.DAY.columns.week_id]: weekId,
            [SCHEMA.DAY.columns.date]: date
        }, { onConflict: SCHEMA.DAY.columns.date, ignoreDuplicates: true });

        if (error) {
            console.error('Failed to add day:', error);
            return;
        }

        await this.loadDays();
        this.showDays();
    }

    async deleteDay(id) {
        if (!confirm('Remove this day?')) return;

        const user = this.app.currentUser;
        if (!user) return;

        const client = this.app.supabase.getClient();

        const { error } = await client.from(SCHEMA.DAY.table)
            .delete()
            .eq(SCHEMA.DAY.columns.id, id)
            .eq(SCHEMA.DAY.columns.user_id, user.id);

        if (error) {
            console.error('Failed to delete day:', error);
            this.app.showMessage('Failed to delete day.', 'error');
            return;
        }

        await this.loadDays();
        this.showDays();
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

window.DaysView = DaysView;
