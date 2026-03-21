// Building helpers
/* global unsafeWindow */

const realWindow = typeof unsafeWindow !== 'undefined' ? unsafeWindow : window;

/**
 * Get MainStore safely
 */
function getStore() {
    return realWindow.Somuchmore?.MainStore;
}

export const Buildings = {
    // Get all buildings
    getAll() {
        const store = getStore();
        return store?.run?.buildings || [];
    },

    // Get building by ID
    get(buildingId) {
        const store = getStore();
        const idx = store?.idxs?.buildings?.[buildingId];
        if (idx === undefined) return null;
        return store?.run?.buildings?.[idx] || null;
    },

    // Get building count
    getCount(buildingId) {
        const building = this.get(buildingId);
        return building?.owned || building?.value || 0;
    }
};
