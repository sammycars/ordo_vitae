/**
 * Saveable Textarea Component - Ordo_Vitae
 * 
 * A textarea with Save/Saved state buttons
 */

class SaveableTextarea {
    /**
     * @param {object} options
     * @param {string} options.table - Supabase table name
     * @param {string} options.id - Record ID (or null for new)
     * @param {string} options.field - Field name to save
     * @param {string} options.value - Initial value
     * @param {string} options.placeholder - Placeholder text
     * @param {function} options.onSave - Callback after successful save
     */
    constructor(options) {
        this.table = options.table;
        this.id = options.id;
        this.field = options.field;
        this.value = options.value || '';
        this.placeholder = options.placeholder || 'Enter text...';
        this.onSave = options.onSave;
        
        this.isSaving = false;
        this.isSaved = false;
    }

    /**
     * Render the component
     * @returns {string} HTML
     */
    render() {
        return `
            <div class="saveable-textarea">
                <textarea 
                    class="input vision-input saveable-input" 
                    placeholder="${this.placeholder}"
                    data-field="${this.field}"
                    data-table="${this.table}"
                    data-id="${this.id || ''}"
                >${this.value}</textarea>
                <div class="saveable-buttons">
                    <button class="btn btn-save" onclick="window.ordoApp.saveTextarea(this)">[ Save ]</button>
                    <span class="save-status"></span>
                </div>
            </div>
        `;
    }

    /**
     * Render with saved state
     */
    renderSaved() {
        return `
            <div class="saveable-textarea">
                <textarea 
                    class="input vision-input saveable-input" 
                    placeholder="${this.placeholder}"
                    data-field="${this.field}"
                    data-table="${this.table}"
                    data-id="${this.id || ''}"
                >${this.value}</textarea>
                <div class="saveable-buttons">
                    <button class="btn btn-saved" disabled>[ Saved ]</button>
                </div>
            </div>
        `;
    }
}

window.SaveableTextarea = SaveableTextarea;
