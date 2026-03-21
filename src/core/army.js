// Army/Unit helpers

/**
 * Get MainStore safely
 */
function getStore() {
    return window.Somuchmore?.MainStore;
}

export const Army = {
    // Get all unlocked units
    getAll() {
        const store = getStore();
        return store?.run?.army || [];
    },

    // Get unit by ID
    get(unitId) {
        const store = getStore();
        const idx = store?.idxs?.army?.[unitId];
        if (idx === undefined) return null;
        return store?.run?.army?.[idx] || null;
    },

    // Get unit count (total owned)
    getCount(unitId) {
        const unit = this.get(unitId);
        return unit?.value || 0;
    },

    // Get unit ID from display name using translations (first match)
    getIdFromDisplayName(displayName) {
        const ids = this.getAllIdsFromDisplayName(displayName);
        return ids && ids.length > 0 ? ids[0] : null;
    },

    // Get all possible unit IDs for a display name (handles duplicates like "Catapult")
    getAllIdsFromDisplayName(displayName) {
        if (!displayName) return [];

        const normalized = displayName.toLowerCase().trim();

        // Check translations cache (now stores arrays)
        if (this._translationsCache && this._translationsCache[normalized]) {
            const ids = this._translationsCache[normalized];
            return Array.isArray(ids) ? ids : [ids];
        }

        // Fallback: try to match by converting display name to snake_case
        const snakeCase = normalized.replace(/\s+/g, '_');

        // Check if this ID exists in our army data
        const army = this.getAll();
        const found = army.find(unit => unit.id === snakeCase);
        if (found) {
            return [snakeCase];
        }

        return [];
    },

    // Get units deployed away
    getAway(unitId) {
        const unit = this.get(unitId);
        return unit?.away || 0;
    },

    // Get unit cap
    getCap(unitId) {
        const store = getStore();
        return store?.ArmyStore?.getArmyCap?.(unitId) || 0;
    },

    // Get unit class/type from game definitions
    getClass(unitId) {
        const store = getStore();

        // Try to get unit definition from cache
        const definition = this._getUnitDefinition(unitId);

        if (!definition) {
            console.warn(`[GameData] No definition found for ${unitId}`);
            console.warn(`[GameData] Available definitions:`, this._definitionsCache ? this._definitionsCache.map(d => d.id).slice(0, 10) : 'none');
            return this.inferClassFromId(unitId);
        }

        // Units with cap of 1 are ALWAYS officers, regardless of category
        if (definition.cap === 1) {
            return 'officer';
        }

        if (definition.category !== undefined) {
            // Map category number to class name
            // Based on game code: category 0=utility/recon/spy, 1=ranged, 2=shock, 3=tank, 4=cavalry
            const categoryMap = {
                0: this._categorizeSpecialUnit(unitId, definition),
                1: 'ranged',
                2: 'shock',
                3: 'tank',
                4: 'cavalry'
            };

            const unitClass = categoryMap[definition.category];
            if (unitClass) {
                return unitClass;
            }
        }

        // Fallback: try to infer from unit ID
        console.warn(`[GameData] No definition found for ${unitId}, using inference`);
        return this.inferClassFromId(unitId);
    },

    // Get unit definition from cached definitions
    _getUnitDefinition(unitId) {
        // Load definitions if not already cached
        if (!this._definitionsCache && !this._loadingDefinitions) {
            this._loadingDefinitions = true;

            // Parse from game script asynchronously
            this._parseDefinitionsFromGameScript().then(defs => {
                this._definitionsCache = defs;
                this._loadingDefinitions = false;
            }).catch(e => {
                console.error('[GameData] Failed to load definitions:', e);
                this._loadingDefinitions = false;
            });
        }

        if (this._definitionsCache) {
            const def = this._definitionsCache.find(d => d.id === unitId);
            return def || null;
        }

        return null;
    },

    // Parse definitions from the main game script
    async _parseDefinitionsFromGameScript() {
        const code = await this._fetchGameScript();
        if (!code) return [];

        try {
            const definitions = [];
            // Match entire unit objects - capture everything between { and }
            const regex = /\{\s*id:\s*"([^"]+)",\s*type:\s*"(army|recon|spy|settlement)"([^}]+)\}/g;

            let match;
            while ((match = regex.exec(code)) !== null) {
                const [, id, type, rest] = match;

                // Extract category and cap from the rest of the object
                const categoryMatch = rest.match(/category:\s*(\d+)/);
                const capMatch = rest.match(/cap:\s*(\d+)/);

                if (!categoryMatch) continue; // Skip if no category

                const category = parseInt(categoryMatch[1]);
                const cap = capMatch ? parseInt(capMatch[1]) : undefined;

                definitions.push({
                    id,
                    type,
                    category,
                    cap
                });
            }

            console.log('[GameData] Loaded', definitions.length, 'unit definitions from game script');
            return definitions;
        } catch (error) {
            console.error('[GameData] Error parsing definitions:', error);
            return [];
        }
    },

    // Parse unit translations from the main game script
    async _parseTranslationsFromGameScript() {
        const code = await this._fetchGameScript();
        if (!code) return {};

        try {
            const translations = {};
            // Match: uni_unit_id: "Display Name"
            const regex = /uni_([a-z_]+):\s*"([^"]+)"/g;

            let match;
            while ((match = regex.exec(code)) !== null) {
                const [, unitId, displayName] = match;
                // Only store if it's not a description or plural
                if (!unitId.endsWith('_description') && !unitId.endsWith('_plural')) {
                    const key = displayName.toLowerCase();
                    // Store as array to handle duplicate display names
                    if (!translations[key]) {
                        translations[key] = [];
                    }
                    translations[key].push(unitId);
                }
            }

            return translations;
        } catch (error) {
            console.error('[GameData] Error parsing translations:', error);
            return {};
        }
    },

    // Fetch the main game script (shared helper)
    async _fetchGameScript() {
        // Find main game script
        const scripts = Array.from(document.querySelectorAll('script[src]'));
        const mainScript = scripts.find(s =>
            s.src.includes('main') || s.src.includes('bundle') || s.src.includes('app')
        );

        if (!mainScript) {
            console.error('[GameData] Could not find main game script');
            return null;
        }

        try {
            const response = await fetch(mainScript.src);
            const code = await response.text();
            return code;
        } catch (error) {
            console.error('[GameData] Error fetching game script:', error);
            return null;
        }
    },

    // Categorize special units (category 0)
    _categorizeSpecialUnit(unitId, definition) {
        // Category 0 includes: recon, spy, settlement
        // (cap=1 units are already handled as officers before this is called)

        // Check the type field from definition
        if (definition.type === 'recon') {
            return 'exploration';
        }
        if (definition.type === 'spy') {
            return 'espionage';
        }
        if (definition.type === 'settlement') {
            return 'officer'; // Settlement defenses act like officers
        }

        // Fallback for category 0
        return 'exploration';
    },

    // Debug helper - expose this to console for finding definitions
    _searchForDefinitions() {
        console.log('[GameData] Searching for army definitions...');

        // Try to find webpack require cache
        const webpackKeys = Object.keys(window).filter(k =>
            k.includes('webpack') || k.includes('__webpack') || k.includes('webpackChunk')
        );
        console.log('[GameData] Webpack-related keys:', webpackKeys);

        // Search for module cache in webpackChunkTheresmore
        if (window.webpackChunkTheresmore) {
            console.log('[GameData] Found webpackChunkTheresmore');
            const chunks = window.webpackChunkTheresmore;

            // Webpack chunks are arrays with [chunkIds, modules, ...]
            if (Array.isArray(chunks)) {
                console.log('[GameData] Searching through chunks...');

                for (const chunk of chunks) {
                    if (Array.isArray(chunk) && chunk[1]) {
                        const modules = chunk[1];
                        const moduleIds = Object.keys(modules);
                        console.log('[GameData] Found chunk with modules:', moduleIds.length, 'modules, IDs:', moduleIds);

                        // Search all modules for army definitions
                        for (const moduleId of moduleIds) {
                            const moduleFunc = modules[moduleId];
                            if (typeof moduleFunc !== 'function') continue;

                            const exports = {};
                            const require = () => ({});
                            require.d = (exp, defs) => {
                                if (typeof defs === 'object') {
                                    for (const key in defs) {
                                        try {
                                            Object.defineProperty(exp, key, {
                                                get: defs[key],
                                                enumerable: true
                                            });
                                        } catch (e) {
                                            // Skip
                                        }
                                    }
                                }
                            };

                            try {
                                moduleFunc(exports, exports, require);

                                // Check if exports has an array property with army definitions
                                for (const key in exports) {
                                    const value = exports[key];
                                    if (Array.isArray(value) && value.length > 10) {
                                        const archer = value.find(d => d && d.id === 'archer' && d.category !== undefined);
                                        if (archer) {
                                            console.log(`[GameData] Found army definitions in module ${moduleId}, export key "${key}"!`);
                                            console.log('[GameData] Sample (archer):', archer);
                                            return value;
                                        }
                                    }
                                }
                            } catch (e) {
                                // Module execution failed, continue
                            }
                        }

                        // Look for module 2039 (the army definitions module)
                        if (modules[2039]) {
                            console.log('[GameData] Found module 2039!');

                            // Try to extract the exports
                            const moduleFunc = modules[2039];
                            const exports = {};
                            const require = (id) => {
                                console.log('[GameData] Module requires:', id);
                                return {};
                            };
                            require.d = (exp, def) => {
                                Object.defineProperty(exp, def[0], {
                                    get: def[1]
                                });
                            };

                            try {
                                moduleFunc(exports, exports, require);
                                console.log('[GameData] Module exports:', exports);

                                if (exports._) {
                                    console.log('[GameData] Found army definitions in exports._!');
                                    console.log('[GameData] Sample (archer):', exports._.find(d => d.id === 'archer'));
                                    return exports._;
                                }
                            } catch (e) {
                                console.error('[GameData] Error executing module:', e);
                            }
                        }
                    }
                }
            }
        }

        // Alternative: search for the definitions in all objects
        const searchObject = (obj, path = '', maxDepth = 4, visited = new Set()) => {
            if (maxDepth === 0 || !obj || visited.has(obj)) return null;
            visited.add(obj);

            try {
                const keys = Object.keys(obj);
                for (const key of keys) {
                    if (key.startsWith('_react') || key.startsWith('__')) continue;

                    try {
                        const value = obj[key];
                        const currentPath = path ? `${path}.${key}` : key;

                        if (Array.isArray(value) && value.length > 10 && value.length < 200) {
                            // Check if this looks like army definitions
                            const sample = value[0];
                            if (sample && typeof sample === 'object' && sample.id && sample.category !== undefined) {
                                const archer = value.find(i => i.id === 'archer');
                                if (archer) {
                                    console.log(`[GameData] Found definitions at: ${currentPath}`);
                                    console.log('[GameData] Sample (archer):', archer);
                                    return value;
                                }
                            }
                        }

                        // Recurse into objects
                        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                            const found = searchObject(value, currentPath, maxDepth - 1, visited);
                            if (found) return found;
                        }
                    } catch (e) {
                        // Skip inaccessible properties
                    }
                }
            } catch (e) {
                // Skip
            }

            return null;
        };

        // Search MainStore and ArmyStore
        const store = getStore();
        if (store) {
            console.log('[GameData] Searching MainStore...');
            const found = searchObject(store, 'MainStore');
            if (found) return found;
        }

        return null;
    },

    // Fallback when no game data available - should rarely be used
    inferClassFromId(unitId) {
        console.warn(`[GameData] No game data for ${unitId}, cannot classify`);
        return 'other';
    }
};
