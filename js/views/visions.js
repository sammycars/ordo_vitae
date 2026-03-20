/**
 * Visions View - Ordo_Vitae
 * 
 * Handles the Visions tab: 3-Year, Fear, 1-Year
 * Uses SaveableTextarea for persistence
 */

class VisionsView {
    constructor(app) {
        this.app = app;
    }

    async render() {
        // Load existing visions from Supabase
        const visions = await this.loadVisions();
        
        const threeYear = visions.find(v => v.vision_kind === 'three_year');
        const fear = visions.find(v => v.vision_kind === 'fear');
        const oneYear = visions.find(v => v.vision_kind === 'one_year');

        const html = `
            <div class="tabs">
                <div class="tab active" data-tab="3year">3-Year Vision</div>
                <div class="tab" data-tab="fear">Fear Vision</div>
                <div class="tab" data-tab="1year">1-Year Vision</div>
            </div>
            
            <div class="tab-content active" id="tab-3year">
                <div class="card">
                    <div class="card-header">
                        <span class="card-title">3-Year Vision</span>
                    </div>
                    <div class="saveable-textarea">
                        <textarea 
                            class="input vision-input saveable-input" 
                            placeholder="Write your 3-year vision..."
                            data-table="ordovision"
                            data-field="vision_content"
                            data-kind="three_year"
                            ${threeYear?.vision_content ? 'readonly' : ''}
                        >${threeYear?.vision_content || ''}</textarea>
                        <div class="saveable-buttons">
                            <button class="btn btn-action" onclick="window.ordoApp.toggleEdit(this)">${threeYear?.vision_content ? '[ Edit ]' : '[ New ]'}</button>
                            <span class="save-status">${threeYear?.vision_content ? 'Saved' : ''}</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="tab-content" id="tab-fear">
                <div class="card">
                    <div class="card-header">
                        <span class="card-title">Fear Vision</span>
                    </div>
                    <div class="saveable-textarea">
                        <textarea 
                            class="input vision-input saveable-input" 
                            placeholder="Write your fear vision..."
                            data-table="ordovision"
                            data-field="vision_content"
                            data-kind="fear"
                            ${fear?.vision_content ? 'readonly' : ''}
                        >${fear?.vision_content || ''}</textarea>
                        <div class="saveable-buttons">
                            <button class="btn btn-action" onclick="window.ordoApp.toggleEdit(this)">${fear?.vision_content ? '[ Edit ]' : '[ New ]'}</button>
                            <span class="save-status">${fear?.vision_content ? 'Saved' : ''}</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="tab-content" id="tab-1year">
                <div class="card">
                    <div class="card-header">
                        <span class="card-title">1-Year Vision</span>
                    </div>
                    <div class="saveable-textarea">
                        <textarea 
                            class="input vision-input saveable-input" 
                            placeholder="Write your 1-year vision..."
                            data-table="ordovision"
                            data-field="vision_content"
                            data-kind="one_year"
                            ${oneYear?.vision_content ? 'readonly' : ''}
                        >${oneYear?.vision_content || ''}</textarea>
                        <div class="saveable-buttons">
                            <button class="btn btn-action" onclick="window.ordoApp.toggleEdit(this)">${oneYear?.vision_content ? '[ Edit ]' : '[ New ]'}</button>
                            <span class="save-status">${oneYear?.vision_content ? 'Saved' : ''}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        this.app.content.innerHTML = html;
        this.setupTabs();
        this.setupAutoResize();
    }

    /**
     * Load visions from Supabase
     */
    async loadVisions() {
        try {
            const client = this.app.supabase.getClient();
            const user = this.app.currentUser;
            
            if (!user) return [];
            
            const { data, error } = await client
                .from('ordovision')
                .select('*')
                .filter('user_id', 'eq', user.id);
            
            if (error) throw error;
            return data || [];
        } catch (err) {
            console.error('Failed to load visions:', err);
            return [];
        }
    }

    setupAutoResize() {
        const textareas = document.querySelectorAll('.vision-input');
        textareas.forEach(textarea => {
            // Auto-resize on input
            textarea.addEventListener('input', function() {
                const start = this.selectionStart;
                const end = this.selectionEnd;
                this.style.height = 'auto';
                this.style.height = this.scrollHeight + 'px';
                this.setSelectionRange(start, end);
            });
            
            // Initial resize (skip for already focused)
            if (document.activeElement !== textarea) {
                textarea.style.height = 'auto';
                textarea.style.height = textarea.scrollHeight + 'px';
            }
        });
    }

    setupTabs() {
        const tabs = document.querySelectorAll('.tab');
        const contents = document.querySelectorAll('.tab-content');
        
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const tabId = tab.dataset.tab;
                
                // Update active tab
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                // Show corresponding content
                contents.forEach(c => {
                    c.classList.toggle('active', c.id === `tab-${tabId}`);
                });
            });
        });
    }
}

// Export
window.VisionsView = VisionsView;
