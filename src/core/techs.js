// Tech helpers

/**
 * Get MainStore safely
 */
function getStore() {
    return window.Somuchmore?.MainStore;
}

export const Techs = {
    // Get all techs
    getAll() {
        const store = getStore();
        return store?.run?.techs || [];
    },

    // Get tech by ID
    get(techId) {
        const store = getStore();
        const idx = store?.idxs?.techs?.[techId];
        if (idx === undefined) return null;
        return store?.run?.techs?.[idx] || null;
    },

    // Check if tech is owned
    isOwned(techId) {
        const tech = this.get(techId);
        return tech?.owned > 0;
    }
};
