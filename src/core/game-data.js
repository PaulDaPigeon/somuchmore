// Game Data Access - Main export file

// Re-export all game data helpers
export { Resources } from './resources';
export { Army } from './army';
export { Buildings } from './buildings';
export { Techs } from './techs';
export { Debug } from './debug';

// Import for initGameData
import { Army } from './army';

/**
 * Initialize game data - preload unit definitions and translations
 */
export async function initGameData() {
    console.log('[GameData] Initializing game data...');

    try {
        // Load definitions and translations in parallel
        const [defs, translations] = await Promise.all([
            Army._parseDefinitionsFromGameScript(),
            Army._parseTranslationsFromGameScript()
        ]);

        Army._definitionsCache = defs;
        Army._translationsCache = translations;

        console.log('[GameData] ✓ Preloaded', defs.length, 'unit definitions');
        console.log('[GameData] ✓ Preloaded', Object.keys(translations).length, 'unit translations');
        return true;
    } catch (e) {
        console.error('[GameData] Failed to preload data:', e);
        return false;
    }
}
