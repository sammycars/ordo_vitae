/**
 * Quarters View - Ordo_Vitae
 *
 * Displays quarters grouped by year.
 * Create, edit, and delete quarters.
 * Each quarter has: year, quarter number (1-4), start date, end date.
 *
 * Schema: SCHEMA.QUARTER (from config.js)
 * Verified against Supabase: quarter_id, user_id, quarter_year, quarter_quarter,
 *   quarter_start_date, quarter_end_date, quarter_created_at — all column names confirmed correct.
 */

class QuartersView {
    constructor(app) {
        this.app = app;
        this.quarters = [];
    }

    async render() {
        await this.loadQuarters();
        this.showQuarters();
    }

    // ==========================================
    // Data Loading
    // ==========================================

    async loadQuarters() {
        const client = this.app.supabase.getClient();
        const user = this.app.supabase.getUser();
        if (!user) return;

        const { data, error } = await client
            .from(SCHEMA.QUARTER.table)
            .select('*')
            .eq(SCHEMA.QUARTER.columns.user_id, user.id)
            .order(SCHEMA.QUARTER.columns.quarter_year, { ascending: false })
            .order(SCHEMA.QUARTER.columns.quarter, { ascending: true });

        if (error) {
            console.error('Failed to load quarters:', error);
            return;
        }

        this.quarters = data || [];
    }

    // ==========================================
    // Rendering
    // ==========================================

    showQuarters() {
        // Group by year
        const byYear = {};
        for (const q of this.quarters) {
            const year = q[SCHEMA.QUARTER.columns.quarter_year];
            if (!byYear[year]) byYear[year] = [];
            byYear[year].push(q);
        }

        const years = Object.keys(byYear).sort((a, b) => b - a);

        const yearSections = years.length === 0
            ? '<p class="placeholder">No quarters yet. Create your first quarter below.</p>'
            : years.map(year => this.yearSection(year, byYear[year])).join('');

        const html = `
            <div class="button-group" style="margin-bottom: var(--space-md);">
                <button class="btn" onclick="window.ordoApp.quartersView.showAddForm()">[ + New Quarter ]</button>
            </div>

            ${yearSections}
        `;

        this.app.content.innerHTML = html;
    }

    yearSection(year, quarters) {
        // Show Q1-Q4 slots, fill in existing ones
        const quarterSlots = [1, 2, 3, 4].map(qNum => {
            const existing = quarters.find(q => q[SCHEMA.QUARTER.columns.quarter] === qNum);
            if (existing) {
                return this.quarterCard(existing);
            } else {
                return this.emptyQuarterSlot(year, qNum);
            }
        });

        return `
            <div class="card" style="margin-bottom: var(--space-lg);">
                <div class="card-header">
                    <span class="card-title" style="font-size: var(--font-size-lg);">${year}</span>
                    <button class="btn btn-secondary" onclick="window.ordoApp.quartersView.showAddForm(${year})">[ + Add Quarter ]</button>
                </div>
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: var(--space-md); margin-top: var(--space-md);">
                    ${quarterSlots.join('')}
                </div>
            </div>
        `;
    }

    emptyQuarterSlot(year, qNum) {
        return `
            <div class="card" style="border: 1px dashed var(--border-color); opacity: 0.5;">
                <p style="color: var(--text-muted); margin: 0;">Q${qNum} ${year} — not set</p>
            </div>
        `;
    }

    quarterCard(quarter) {
        const id = quarter[SCHEMA.QUARTER.columns.id];
        const qNum = quarter[SCHEMA.QUARTER.columns.quarter];
        const year = quarter[SCHEMA.QUARTER.columns.quarter_year];
        const start = quarter[SCHEMA.QUARTER.columns.start_date] || '';
        const end = quarter[SCHEMA.QUARTER.columns.end_date] || '';

        const startDisplay = start ? this.formatDate(start) : '—';
        const endDisplay = end ? this.formatDate(end) : '—';
        const duration = this.calcDuration(start, end);

        return `
            <div class="card quarter-card" data-id="${id}" style="padding: var(--space-md);">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: var(--space-sm);">
                    <strong style="font-size: var(--font-size-md);">Q${qNum} ${year}</strong>
                    <div style="display: flex; gap: var(--space-xs);">
                        <button class="btn btn-secondary" style="padding: 2px 6px; font-size: var(--font-size-xs);" onclick="window.ordoApp.quartersView.toggleEdit('${id}')">[ Edit ]</button>
                        <button class="btn btn-danger" style="padding: 2px 6px; font-size: var(--font-size-xs);" onclick="window.ordoApp.quartersView.deleteQuarter('${id}')">[ Delete ]</button>
                    </div>
                </div>
                <p style="font-size: var(--font-size-sm); color: var(--text-secondary); margin: 0;">
                    ${startDisplay} → ${endDisplay}
                </p>
                ${duration ? `<p style="font-size: var(--font-size-xs); color: var(--text-muted); margin: var(--space-xs) 0 0;">${duration}</p>` : ''}

                <div class="quarter-edit" id="edit-${id}" style="display: none; margin-top: var(--space-md);">
                    <div style="display: grid; gap: var(--space-sm);">
                        <div>
                            <label style="font-size: var(--font-size-xs); color: var(--text-muted); display: block; margin-bottom: 2px;">Quarter</label>
                            <select class="input" id="eq-quarter-${id}" style="width: 100%;">
                                <option value="1" ${qNum === 1 ? 'selected' : ''}>Q1</option>
                                <option value="2" ${qNum === 2 ? 'selected' : ''}>Q2</option>
                                <option value="3" ${qNum === 3 ? 'selected' : ''}>Q3</option>
                                <option value="4" ${qNum === 4 ? 'selected' : ''}>Q4</option>
                            </select>
                        </div>
                        <div>
                            <label style="font-size: var(--font-size-xs); color: var(--text-muted); display: block; margin-bottom: 2px;">Start Date</label>
                            <input type="date" class="input" id="eq-start-${id}" value="${start}" style="width: 100%;">
                        </div>
                        <div>
                            <label style="font-size: var(--font-size-xs); color: var(--text-muted); display: block; margin-bottom: 2px;">End Date</label>
                            <input type="date" class="input" id="eq-end-${id}" value="${end}" style="width: 100%;">
                        </div>
                        <div style="display: flex; gap: var(--space-sm);">
                            <button class="btn" onclick="window.ordoApp.quartersView.saveQuarter('${id}')">[ Save ]</button>
                            <button class="btn btn-secondary" onclick="window.ordoApp.quartersView.toggleEdit('${id}')">[ Cancel ]</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // ==========================================
    // Add Form
    // ==========================================

    showAddForm(suggestedYear) {
        const year = suggestedYear || new Date().getFullYear();
        const defaultQ1Start = `${year}-01-01`;
        const defaultQ1End = `${year}-03-31`;

        const existingYears = [...new Set(this.quarters.map(q => q[SCHEMA.QUARTER.columns.quarter_year]))];
        const yearOptions = [];
        for (let y = new Date().getFullYear() - 1; y <= new Date().getFullYear() + 2; y++) {
            yearOptions.push(`<option value="${y}" ${y === parseInt(year) ? 'selected' : ''}>${y}</option>`);
        }

        const html = `
            <div class="card" id="new-quarter-form" style="margin-bottom: var(--space-lg);">
                <div class="card-header">
                    <span class="card-title">New Quarter</span>
                </div>
                <div style="display: grid; gap: var(--space-sm);">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-sm);">
                        <div>
                            <label style="font-size: var(--font-size-xs); color: var(--text-muted); display: block; margin-bottom: 2px;">Year</label>
                            <select class="input" id="nq-year" style="width: 100%;">
                                ${yearOptions.join('')}
                            </select>
                        </div>
                        <div>
                            <label style="font-size: var(--font-size-xs); color: var(--text-muted); display: block; margin-bottom: 2px;">Quarter</label>
                            <select class="input" id="nq-quarter" style="width: 100%;">
                                <option value="1">Q1 (Jan–Mar)</option>
                                <option value="2">Q2 (Apr–Jun)</option>
                                <option value="3">Q3 (Jul–Sep)</option>
                                <option value="4">Q4 (Oct–Dec)</option>
                            </select>
                        </div>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-sm);">
                        <div>
                            <label style="font-size: var(--font-size-xs); color: var(--text-muted); display: block; margin-bottom: 2px;">Start Date</label>
                            <input type="date" class="input" id="nq-start" value="${defaultQ1Start}" style="width: 100%;">
                        </div>
                        <div>
                            <label style="font-size: var(--font-size-xs); color: var(--text-muted); display: block; margin-bottom: 2px;">End Date</label>
                            <input type="date" class="input" id="nq-end" value="${defaultQ1End}" style="width: 100%;">
                        </div>
                    </div>
                    <div>
                        <button class="btn" onclick="window.ordoApp.quartersView.insertQuarter()">[ Create ]</button>
                        <button class="btn btn-secondary" onclick="window.ordoApp.quartersView.showQuarters()">[ Cancel ]</button>
                    </div>
                </div>
            </div>
        `;

        // Prepend to content
        this.app.content.innerHTML = html + this.app.content.innerHTML;

        // Auto-update default dates when quarter changes
        document.getElementById('nq-quarter').addEventListener('change', (e) => {
            const q = parseInt(e.target.value);
            const y = parseInt(document.getElementById('nq-year').value);
            const [s, en] = getQuarterDateRange(q, y);
            document.getElementById('nq-start').value = s;
            document.getElementById('nq-end').value = en;
        });

        document.getElementById('nq-year').addEventListener('change', (e) => {
            const q = parseInt(document.getElementById('nq-quarter').value);
            const y = parseInt(e.target.value);
            const [s, en] = getQuarterDateRange(q, y);
            document.getElementById('nq-start').value = s;
            document.getElementById('nq-end').value = en;
        });
    }

    // ==========================================
    // CRUD Operations
    // ==========================================

    toggleEdit(id) {
        const editDiv = document.getElementById(`edit-${id}`);
        if (!editDiv) return;
        editDiv.style.display = editDiv.style.display === 'none' ? 'block' : 'none';
    }

    async insertQuarter() {
        const user = this.app.supabase.getUser();
        if (!user) return;

        const year = parseInt(document.getElementById('nq-year').value);
        const quarterNum = parseInt(document.getElementById('nq-quarter').value);
        const startDate = document.getElementById('nq-start').value;
        const endDate = document.getElementById('nq-end').value;

        if (!startDate || !endDate) {
            this.app.showMessage('Start and end dates are required.', 'error');
            return;
        }

        if (startDate >= endDate) {
            this.app.showMessage('End date must be after start date.', 'error');
            return;
        }

        const client = this.app.supabase.getClient();

        const { error } = await client.from(SCHEMA.QUARTER.table).insert({
            [SCHEMA.QUARTER.columns.user_id]: user.id,
            [SCHEMA.QUARTER.columns.quarter_year]: year,
            [SCHEMA.QUARTER.columns.quarter]: quarterNum,
            [SCHEMA.QUARTER.columns.start_date]: startDate,
            [SCHEMA.QUARTER.columns.end_date]: endDate
        });

        if (error) {
            console.error('Failed to create quarter:', error);
            this.app.showMessage('Failed to create quarter: ' + error.message, 'error');
            return;
        }

        await this.loadQuarters();
        this.showQuarters();
    }

    async saveQuarter(id) {
        const user = this.app.supabase.getUser();
        if (!user) return;

        const quarterNum = parseInt(document.getElementById(`eq-quarter-${id}`).value);
        const startDate = document.getElementById(`eq-start-${id}`).value;
        const endDate = document.getElementById(`eq-end-${id}`).value;

        if (!startDate || !endDate) {
            this.app.showMessage('Start and end dates are required.', 'error');
            return;
        }

        if (startDate >= endDate) {
            this.app.showMessage('End date must be after start date.', 'error');
            return;
        }

        const client = this.app.supabase.getClient();

        const { error } = await client.from(SCHEMA.QUARTER.table)
            .update({
                [SCHEMA.QUARTER.columns.quarter]: quarterNum,
                [SCHEMA.QUARTER.columns.start_date]: startDate,
                [SCHEMA.QUARTER.columns.end_date]: endDate
            })
            .eq(SCHEMA.QUARTER.columns.id, id)
            .eq(SCHEMA.QUARTER.columns.user_id, user.id);

        if (error) {
            console.error('Failed to save quarter:', error);
            this.app.showMessage('Failed to save quarter.', 'error');
            return;
        }

        await this.loadQuarters();
        this.showQuarters();
    }

    async deleteQuarter(id) {
        if (!confirm('Delete this quarter?')) return;

        const user = this.app.supabase.getUser();
        if (!user) return;

        const client = this.app.supabase.getClient();

        const { error } = await client.from(SCHEMA.QUARTER.table)
            .delete()
            .eq(SCHEMA.QUARTER.columns.id, id)
            .eq(SCHEMA.QUARTER.columns.user_id, user.id);

        if (error) {
            console.error('Failed to delete quarter:', error);
            this.app.showMessage('Failed to delete quarter.', 'error');
            return;
        }

        await this.loadQuarters();
        this.showQuarters();
    }

    // ==========================================
    // Utilities
    // ==========================================

    formatDate(dateStr) {
        if (!dateStr) return '';
        const d = new Date(dateStr + 'T00:00:00');
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }

    calcDuration(start, end) {
        if (!start || !end) return '';
        const s = new Date(start);
        const e = new Date(end);
        const diff = Math.round((e - s) / (1000 * 60 * 60 * 24));
        return `~${diff} days`;
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

// Helper: default quarter date ranges
function getQuarterDateRange(q, year) {
    const ranges = {
        1: [`${year}-01-01`, `${year}-03-31`],
        2: [`${year}-04-01`, `${year}-06-30`],
        3: [`${year}-07-01`, `${year}-09-30`],
        4: [`${year}-10-01`, `${year}-12-31`]
    };
    return ranges[q] || [`${year}-01-01`, `${year}-03-31`];
}

window.QuartersView = QuartersView;
