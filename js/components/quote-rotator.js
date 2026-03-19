/**
 * Quote Rotator Component - Ordo_Vitae
 * 
 * Displays rotating Marcus Aurelius quotes with fade effect
 */

class QuoteRotator {
    constructor(app) {
        this.app = app;
        this.quotes = [];
        this.currentQuote = null;
        this.quoteElement = document.getElementById('quote-text');
        this.quoteContainer = document.getElementById('quote-container');
        this.quoteInterval = null;
        this.isRotating = false;
    }

    /**
     * Load quotes from data file
     */
    async loadQuotes() {
        try {
            const response = await fetch('data/quotes.json');
            const data = await response.json();
            this.quotes = data.quotes;
        } catch (err) {
            console.error('Failed to load quotes:', err);
        }
    }

    /**
     * Get a random quote (different from current)
     */
    getRandomQuote() {
        if (this.quotes.length === 0) return null;
        if (this.quotes.length === 1) return this.quotes[0];
        
        let quote;
        do {
            quote = this.quotes[Math.floor(Math.random() * this.quotes.length)];
        } while (quote === this.currentQuote && this.quotes.length > 1);
        
        return quote;
    }

    /**
     * Rotate to next quote with fade effect
     */
    rotateQuote() {
        if (!this.quoteElement || this.isRotating) return;
        
        const quote = this.getRandomQuote();
        if (!quote) return;

        this.isRotating = true;
        
        // Fade out
        this.quoteElement.classList.add('fade-out');

        setTimeout(() => {
            // Change quote
            this.quoteElement.textContent = `"${quote.text}"`;
            this.currentQuote = quote;
            
            // Fade in
            this.quoteElement.classList.remove('fade-out');
            
            // Reset rotating flag after fade completes
            setTimeout(() => {
                this.isRotating = false;
            }, 1000);
        }, 1000); // Wait for fade out to complete
    }

    /**
     * Start automatic rotation
     */
    start(intervalMs = 8000) {
        if (this.quoteInterval) {
            clearInterval(this.quoteInterval);
        }
        
        // Initial quote
        this.rotateQuote();
        
        // Rotate periodically
        this.quoteInterval = setInterval(() => {
            this.rotateQuote();
        }, intervalMs);
    }

    /**
     * Stop rotation
     */
    stop() {
        if (this.quoteInterval) {
            clearInterval(this.quoteInterval);
            this.quoteInterval = null;
        }
    }
}

window.QuoteRotator = QuoteRotator;
