// Tab Monitor - Tracks active tabs and button containers

export class TabMonitor {
    constructor() {
        this.currentMainTab = null;
        this.currentSubTab = null;
        this.listeners = [];
        this.observer = null;
    }

    // Extract clean tab name from button text
    extractTabName(text) {
        if (!text) return null;

        // Remove newlines and extra spaces
        let cleaned = text.replace(/\s+/g, ' ').trim();

        // Remove SVG content (appears as empty space or icon class)
        cleaned = cleaned.replace(/\s*\d+\s*\/\s*\d+\s*$/, ''); // Remove "146 / 875" pattern
        cleaned = cleaned.replace(/\s*\d+\s*$/, ''); // Remove trailing numbers like "Research 2"

        return cleaned.trim().toLowerCase();
    }

    // Get currently active main tab
    getActiveMainTab() {
        const mainTabs = document.getElementById('main-tabs');
        if (!mainTabs) return null;

        const activeButton = mainTabs.querySelector('button[aria-selected="true"]');
        if (!activeButton) return null;

        const text = activeButton.textContent;
        return this.extractTabName(text);
    }

    // Get currently active sub-tab
    getActiveSubTab() {
        const subTabs = document.querySelector('div[role="tabpanel"] div[aria-orientation="horizontal"]');
        if (!subTabs) return null;

        const activeButton = subTabs.querySelector('button[aria-selected="true"]');
        if (!activeButton) return null;

        const text = activeButton.textContent;
        return this.extractTabName(text);
    }

    // Get button container for current tab
    getButtonContainer() {
        const mainTab = this.getActiveMainTab();
        const subTab = this.getActiveSubTab();

        if (!mainTab || !subTab) return null;

        // Find the container with buttons
        return document.querySelector('div[role="tabpanel"] div.tab-container.sub-container .grid');
    }

    // Check if we're on a specific main tab
    isMainTabActive(tabName) {
        return this.getActiveMainTab() === tabName.toLowerCase();
    }

    // Check if we're on a specific sub-tab
    isSubTabActive(subTabName) {
        return this.getActiveSubTab() === subTabName.toLowerCase();
    }

    // Check if we're on specific main + sub tab combo
    isTabActive(mainTab, subTab) {
        return this.isMainTabActive(mainTab) && this.isSubTabActive(subTab);
    }

    // Register a listener for tab changes
    // Callback receives: { mainTab, subTab, container }
    // The callback is called immediately with current state
    onChange(callback) {
        this.listeners.push(callback);

        // Call immediately with current state
        const mainTab = this.getActiveMainTab();
        const subTab = this.getActiveSubTab();
        const container = this.getButtonContainer();

        try {
            callback({ mainTab, subTab, container });
        } catch (error) {
            console.error('[TabMonitor] Listener error:', error);
        }

        return () => {
            this.listeners = this.listeners.filter(cb => cb !== callback);
        };
    }

    // Notify all listeners of tab change
    notifyListeners() {
        const mainTab = this.getActiveMainTab();
        const subTab = this.getActiveSubTab();
        const container = this.getButtonContainer();

        // Check if anything changed
        if (mainTab === this.currentMainTab && subTab === this.currentSubTab) {
            return;
        }

        this.currentMainTab = mainTab;
        this.currentSubTab = subTab;

        console.log('[TabMonitor] Tab changed:', { mainTab, subTab });

        this.listeners.forEach(callback => {
            try {
                callback({ mainTab, subTab, container });
            } catch (error) {
                console.error('[TabMonitor] Listener error:', error);
            }
        });
    }

    // Start monitoring
    start() {
        if (this.observer) return;

        // Check initial state
        this.currentMainTab = this.getActiveMainTab();
        this.currentSubTab = this.getActiveSubTab();

        console.log('[TabMonitor] Starting tab monitoring - Initial state:', {
            mainTab: this.currentMainTab,
            subTab: this.currentSubTab
        });

        // Watch for DOM changes (tab clicks, etc.)
        this.observer = new MutationObserver(() => {
            this.notifyListeners();
        });

        this.observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['aria-selected']
        });
    }

    // Stop monitoring
    stop() {
        if (this.observer) {
            this.observer.disconnect();
            this.observer = null;
        }
    }
}

// Global singleton instance
let tabMonitorInstance = null;

export function getTabMonitor() {
    if (!tabMonitorInstance) {
        tabMonitorInstance = new TabMonitor();
        tabMonitorInstance.start();
    }
    return tabMonitorInstance;
}
