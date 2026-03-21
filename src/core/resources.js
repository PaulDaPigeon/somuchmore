// Resource helpers
/* global unsafeWindow */

const realWindow = typeof unsafeWindow !== 'undefined' ? unsafeWindow : window;

/**
 * Get MainStore safely
 */
function getStore() {
    return realWindow.Somuchmore?.MainStore;
}

export const Resources = {
    // Get all resources
    getAll() {
        const store = getStore();
        return store?.run?.resources || [];
    },

    // Get resource by ID
    get(resourceId) {
        const store = getStore();
        const idx = store?.idxs?.resources?.[resourceId];
        if (idx === undefined) return null;
        return store?.run?.resources?.[idx] || null;
    },

    // Get resource value
    getValue(resourceId) {
        const resource = this.get(resourceId);
        return resource?.value || 0;
    },

    // Get resource cap
    getCap(resourceId) {
        const store = getStore();
        return store?.ResourcesStore?.getResourceCap?.(resourceId) || 0;
    },

    // Get resource income rate
    getIncome(resourceId) {
        const store = getStore();
        const resource = this.get(resourceId);
        if (!resource) return 0;
        return store?.ResourcesStore?.getTimerValue?.(resource) || 0;
    },

    // Check if manual clicking buttons are available (early game)
    // manual === 1 means buttons are present, manual === 2 means they're not
    isManualClickingAvailable() {
        const foodResource = this.get('food');
        if (!foodResource) return false;
        return foodResource.manual === 1;
    }
};
