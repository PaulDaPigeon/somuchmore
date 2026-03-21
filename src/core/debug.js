// Debug helpers
/* global unsafeWindow */
import { Army } from './army';

const realWindow = typeof unsafeWindow !== 'undefined' ? unsafeWindow : window;

/**
 * Get MainStore safely
 */
function getStore() {
    return realWindow.Somuchmore?.MainStore;
}

export const Debug = {
    // Parse definitions from the loaded game script
    async parseDefinitionsFromScript() {
        console.log('[GameData] Searching for main game script...');

        // Find script tags
        const scripts = Array.from(document.querySelectorAll('script[src]'));
        console.log('[GameData] Found', scripts.length, 'script tags with src');

        // Look for the main game bundle (usually largest or has "main" in name)
        const mainScript = scripts.find(s =>
            s.src.includes('main') ||
            s.src.includes('bundle') ||
            s.src.includes('app')
        );

        if (!mainScript) {
            console.error('[GameData] Could not find main game script');
            return null;
        }

        console.log('[GameData] Fetching script:', mainScript.src);

        try {
            const response = await fetch(mainScript.src);
            const code = await response.text();
            console.log('[GameData] Fetched', code.length, 'characters');

            // Search for the army definitions pattern
            // Looking for: id: "archer", ... category: 1
            const definitions = [];

            // Pattern: id:"unitId"...category:N
            // We'll extract blocks that look like unit definitions
            const regex = /\{\s*id:\s*"([^"]+)",\s*type:\s*"(army|recon|spy|settlement)"[^}]*?category:\s*(\d+)[^}]*?\}/g;

            let match;
            while ((match = regex.exec(code)) !== null) {
                const [, id, type, category] = match;
                definitions.push({
                    id,
                    type,
                    category: parseInt(category)
                });
            }

            if (definitions.length > 0) {
                console.log('[GameData] ✓ Parsed', definitions.length, 'unit definitions!');
                console.log('[GameData] Sample:', definitions.find(d => d.id === 'archer'));

                // Cache it
                Army._definitionsCache = definitions;
                return definitions;
            } else {
                console.warn('[GameData] No definitions found in script');
                return null;
            }
        } catch (error) {
            console.error('[GameData] Error fetching/parsing script:', error);
            return null;
        }
    },

    searchForDefinitions() {
        return Army._searchForDefinitions();
    },

    // Hook into Array.prototype.findIndex to capture definitions during gameplay
    captureDefinitions(keepHookActive = false) {
        console.log('[GameData] Setting up capture hook...');
        console.log('[GameData] Trigger a fight, scout, or spy action to capture definitions');

        const store = getStore();
        if (!store || !store.ArmyStore) {
            console.error('[GameData] MainStore or ArmyStore not available');
            return null;
        }

        // Temporarily hook Array.prototype.findIndex
        const originalFindIndex = Array.prototype.findIndex;
        let capturedArray = null;

        const hookFunction = function(callback) {
            // Check if this array looks like army definitions
            if (!capturedArray && this.length > 10 && this.length < 200) {
                const sample = this[0];
                if (sample && typeof sample === 'object' && sample.id && sample.category !== undefined) {
                    // Verify it has army units
                    const hasArcher = this.some(d => d.id === 'archer');
                    if (hasArcher) {
                        console.log('[GameData] ✓ Captured definitions array!', this.length, 'definitions');
                        console.log('[GameData] Sample (archer):', this.find(d => d.id === 'archer'));
                        capturedArray = this;
                        Army._definitionsCache = this;

                        // Restore original method automatically
                        if (!keepHookActive) {
                            Array.prototype.findIndex = originalFindIndex;
                            console.log('[GameData] Hook removed, definitions cached');
                        }
                    }
                }
            }
            return originalFindIndex.call(this, callback);
        };

        Array.prototype.findIndex = hookFunction;

        // Store cleanup function under Somuchmore
        realWindow.Somuchmore = realWindow.Somuchmore || {};
        realWindow.Somuchmore._cleanupHook = () => {
            Array.prototype.findIndex = originalFindIndex;
            console.log('[GameData] Hook manually removed');
        };

        console.log('[GameData] Hook active! Now trigger a fight/scout/spy action.');
        console.log('[GameData] Run realWindow.Somuchmore._cleanupHook() to remove hook manually');

        return 'Hook active - trigger an action';
    }
};
