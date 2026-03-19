/**
 * Visions View - Ordo_Vitae
 * 
 * Handles the Visions tab: 3-Year, Fear, 1-Year
 */

class VisionsView {
    constructor(app) {
        this.app = app;
    }

    render() {
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
                    <textarea class="input vision-input" placeholder="Write your 3-year vision..."></textarea>
                </div>
            </div>
            
            <div class="tab-content" id="tab-fear">
                <div class="card">
                    <div class="card-header">
                        <span class="card-title">Fear Vision</span>
                    </div>
                    <textarea class="input vision-input" placeholder="Write your fear vision..."></textarea>
                </div>
            </div>
            
            <div class="tab-content" id="tab-1year">
                <div class="card">
                    <div class="card-header">
                        <span class="card-title">1-Year Vision</span>
                    </div>
                    <textarea class="input vision-input" placeholder="Write your 1-year vision..."></textarea>
                </div>
            </div>
        `;
        
        this.app.content.innerHTML = html;
        this.setupTabs();
        this.setupAutoResize();
    }

    setupAutoResize() {
        const textareas = document.querySelectorAll('.vision-input');
        textareas.forEach(textarea => {
            // Auto-resize on input
            textarea.addEventListener('input', function() {
                this.style.height = 'auto';
                this.style.height = this.scrollHeight + 'px';
            });
            
            // Initial resize
            textarea.style.height = 'auto';
            textarea.style.height = textarea.scrollHeight + 'px';
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
