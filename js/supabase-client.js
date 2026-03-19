/**
 * Supabase Client - Ordo_Vitae
 * 
 * Handles all database interactions.
 * See: /projects/websites/design-principles.md Section 1.4 (Abstraction Layers)
 */

class SupabaseClient {
    constructor() {
        this.client = null;
        this.initialized = false;
    }

    /**
     * Initialize the Supabase client
     */
    async init() {
        if (this.initialized) return;

        const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
        
        this.client = createClient(
            window.ORDO_CONFIG.supabase.url,
            window.ORDO_CONFIG.supabase.anonKey
        );
        
        this.initialized = true;
    }

    /**
     * Get the Supabase client instance
     */
    getClient() {
        if (!this.initialized) {
            throw new Error('SupabaseClient not initialized. Call init() first.');
        }
        return this.client;
    }

    /**
     * Sign up a new user
     * @param {string} email 
     * @param {string} password 
     */
    async signUp(email, password) {
        await this.init();
        return await this.client.auth.signUp({ email, password });
    }

    /**
     * Sign in an existing user
     * @param {string} email 
     * @param {string} password 
     */
    async signIn(email, password) {
        await this.init();
        return await this.client.auth.signInWithPassword({ email, password });
    }

    /**
     * Sign out the current user
     */
    async signOut() {
        await this.init();
        return await this.client.auth.signOut();
    }

    /**
     * Get the current user
     */
    async getUser() {
        await this.init();
        const { data: { user } } = await this.client.auth.getUser();
        return user;
    }

    /**
     * Subscribe to auth changes
     * @param {function} callback 
     */
    onAuthChange(callback) {
        this.client.auth.onAuthStateChange(callback);
    }

    // ==========================================
    // Data Access Methods (Repository Pattern)
    // See: /projects/websites/design-principles.md Section 1.4
    // ==========================================

    /**
     * Fetch a single record by ID
     * @param {string} table 
     * @param {string} id 
     */
    async getById(table, id) {
        const { data, error } = await this.client
            .from(table)
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    }

    /**
     * Fetch records with filters
     * @param {string} table 
     * @param {object} filters 
     * @param {string} orderBy 
     */
    async getMany(table, filters = {}, orderBy = 'created_at') {
        let query = this.client.from(table).select('*');

        // Apply filters
        for (const [key, value] of Object.entries(filters)) {
            if (value === null) {
                query = query.is(key, null);
            } else if (Array.isArray(value)) {
                query = query.in(key, value);
            } else {
                query = query.eq(key, value);
            }
        }

        // Apply ordering
        query = query.order(orderBy, { ascending: false });

        const { data, error } = await query;

        if (error) throw error;
        return data;
    }

    /**
     * Insert a new record
     * @param {string} table 
     * @param {object} record 
     */
    async insert(table, record) {
        const { data, error } = await this.client
            .from(table)
            .insert(record)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    /**
     * Update an existing record
     * @param {string} table 
     * @param {string} id 
     * @param {object} updates 
     */
    async update(table, id, updates) {
        const { data, error } = await this.client
            .from(table)
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    /**
     * Delete a record
     * @param {string} table 
     * @param {string} id 
     */
    async delete(table, id) {
        const { error } = await this.client
            .from(table)
            .delete()
            .eq('id', id);

        if (error) throw error;
    }
}

// Export singleton instance
window.ordoSupabase = new SupabaseClient();
