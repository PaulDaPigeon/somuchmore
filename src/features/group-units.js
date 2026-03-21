// Group Army Units by Class
import { getTabMonitor } from '../core/tab-monitor';
import { Army } from '../core/game-data';
import { getSectionIcon } from './game-mechanics/icons';
import { createAdvantageDiagram, createSpecialAbilities } from './game-mechanics/game-mechanics';
import { createExplorationTooltipHTML, createIconHTML } from './ui/menu/group-units-templates';

export function initGroupUnits() {
    if (!window.Somuchmore?.MainStore) {
        console.error('[Somuchmore] MainStore not available');
        return false;
    }

    let isGrouped = false;
    let advantageDiagramElement = null;
    let specialAbilitiesElement = null;
    let originalContainer = null;
    let originalParent = null;
    let groupedWrapper = null;
    const tabMonitor = getTabMonitor();

    // Get unit class/type
    function getUnitClass(unitId) {
        const unitClass = Army.getClass(unitId);
        if (!unitClass) return 'other';

        // Return class directly - should already be normalized
        return unitClass;
    }

    // Create section box (like Build tab categories)
    function createSectionBox(title, units) {
        const box = document.createElement('div');
        box.className = 'flex flex-wrap w-full min-w-full mt-3 p-3 shadow rounded-lg ring-1 bg-gray-100 dark:bg-mydark-600 ring-gray-300 dark:ring-mydark-200';

        // Create header with icon
        const header = document.createElement('div');
        header.className = 'w-full pb-3 font-bold text-center xl:text-left flex items-center justify-center xl:justify-start text-gray-800 dark:text-gray-200 relative';

        const icon = getSectionIcon(title);

        // Create icon container
        const iconDiv = document.createElement('div');
        iconDiv.className = 'p-1.5 rounded-full mr-2 shadow-md';
        iconDiv.style.cssText = icon.style;
        iconDiv.innerHTML = createIconHTML(icon);

        // Create title text
        const titleSpan = document.createElement('span');
        titleSpan.textContent = title;

        header.appendChild(iconDiv);
        header.appendChild(titleSpan);

        // Add tooltip for Exploration section
        if (title === 'Exploration') {
            header.style.cursor = 'help';

            const tooltip = document.createElement('div');
            tooltip.className = 'absolute z-50 p-3 bg-white dark:bg-mydark-700 border border-gray-300 dark:border-mydark-200 rounded-lg shadow-lg pointer-events-none';
            tooltip.style.width = '400px';
            tooltip.style.top = '100%';
            tooltip.style.left = '0';
            tooltip.style.marginTop = '8px';
            tooltip.style.display = 'none';
            tooltip.innerHTML = createExplorationTooltipHTML();

            header.addEventListener('mouseenter', () => {
                tooltip.style.display = 'block';
            });
            header.addEventListener('mouseleave', () => {
                tooltip.style.display = 'none';
            });

            header.appendChild(tooltip);
        }

        // Create grid for units
        const grid = document.createElement('div');
        grid.className = 'grid gap-3 grid-cols-fill-180 min-w-full px-12 xl:px-0';

        // Add units to grid
        units.forEach(unitRow => {
            const wrapper = document.createElement('div');
            wrapper.className = 'flex flex-col';
            wrapper.appendChild(unitRow);
            grid.appendChild(wrapper);
        });

        box.appendChild(header);
        box.appendChild(grid);

        return box;
    }

    // Find unit ID by display name, checking against owned units
    function findUnitIdByName(name, ownedUnitIds) {
        // Get all possible translations for this display name
        const possibleIds = Army.getAllIdsFromDisplayName(name);

        if (!possibleIds || possibleIds.length === 0) {
            return null;
        }

        // If only one match, return it
        if (possibleIds.length === 1) {
            return possibleIds[0];
        }

        // Multiple matches (e.g., "Catapult" -> battering_ram, catapult)
        // Return the one the player actually owns
        for (const id of possibleIds) {
            if (ownedUnitIds.includes(id)) {
                console.log(`[Somuchmore] Disambiguated "${name}": chose ${id} from [${possibleIds.join(', ')}]`);
                return id;
            }
        }

        // Fallback to first match if none owned (shouldn't happen)
        console.warn(`[Somuchmore] No owned unit found for "${name}" among [${possibleIds.join(', ')}]`);
        return possibleIds[0];
    }

    // Restore original layout
    function restoreOriginal() {
        if (!originalContainer || !originalParent || !groupedWrapper) {
            return false;
        }

        console.log('[Somuchmore] Restoring original layout...');

        // Replace grouped wrapper with original container
        originalParent.replaceChild(originalContainer, groupedWrapper);

        // Clear references
        groupedWrapper = null;
        advantageDiagramElement = null;
        specialAbilitiesElement = null;
        isGrouped = false;

        console.log('[Somuchmore] Original layout restored');
        return true;
    }

    // Group units in the given container
    function groupUnits(container) {
        if (!container || isGrouped) {
            return false;
        }

        console.log('[Somuchmore] Organizing army units...');

        // Store original container and parent for restoration
        originalContainer = container.cloneNode(true);
        originalParent = container.parentElement;

        // Get all direct children (these are the flex containers)
        const allChildren = Array.from(container.children);

        // Separate selector row from unit rows
        let selectorRow = null;
        const unitRows = [];

        allChildren.forEach(child => {
            const buttons = child.querySelectorAll('button');
            if (buttons.length === 0) return;

            const firstButtonText = buttons[0].textContent.trim();
            if (firstButtonText === '+1' || firstButtonText === '+10' || firstButtonText === '+50') {
                selectorRow = child;
            } else {
                unitRows.push(child);
            }
        });

        if (!selectorRow || unitRows.length === 0) {
            console.warn('[Somuchmore] Could not find selector or unit rows');
            return false;
        }

        // Classify units
        const classified = {
            exploration: [],
            espionage: [],
            officer: [],
            ranged: [],
            shock: [],
            tank: [],
            cavalry: [],
            other: []
        };

        // Get runtime army data to match against
        const armyUnits = Army.getAll();
        const ownedUnitIds = armyUnits.map(u => u.id);

        unitRows.forEach(row => {
            const button = row.querySelector('button');
            if (!button) return;

            // Extract unit name (first non-empty text, remove trailing numbers)
            let unitName = button.textContent.trim().split('\n')[0].trim();
            // Remove trailing numbers (e.g., "Explorer42" -> "Explorer", "Strategist1" -> "Strategist")
            unitName = unitName.replace(/\d+$/, '').trim();

            // Get possible unit IDs from translation (might return multiple for same display name)
            const unitId = findUnitIdByName(unitName, ownedUnitIds);

            if (unitId) {
                const unitClass = getUnitClass(unitId);
                console.log(`[Somuchmore] ${unitName} -> ${unitId} -> ${unitClass}`);
                if (classified[unitClass]) {
                    classified[unitClass].push(row);
                } else {
                    console.warn(`[Somuchmore] Unknown class "${unitClass}" for ${unitId}, moving to other`);
                    classified.other.push(row);
                }
            } else {
                console.warn(`[Somuchmore] Could not find unit ID for: ${unitName}`);
                classified.other.push(row);
            }
        });

        // Create a flex wrapper
        groupedWrapper = document.createElement('div');
        groupedWrapper.className = 'flex flex-col gap-3 w-full';

        // Add selector box with advantage diagram
        const selectorBox = document.createElement('div');
        selectorBox.className = 'flex flex-wrap w-full min-w-full p-3 shadow rounded-lg ring-1 bg-gray-100 dark:bg-mydark-600 ring-gray-300 dark:ring-mydark-200';

        // Create container for buttons and diagram
        const selectorContent = document.createElement('div');
        selectorContent.className = 'flex flex-wrap items-center w-full gap-4';
        selectorContent.style.justifyContent = 'center';

        // Add media query for large screens
        const mediaQuery = window.matchMedia('(min-width: 768px)');
        const updateJustification = () => {
            selectorContent.style.justifyContent = mediaQuery.matches ? 'space-between' : 'center';
        };
        updateJustification();
        mediaQuery.addEventListener('change', updateJustification);

        // Buttons row
        const selectorGrid = document.createElement('div');
        selectorGrid.className = 'grid gap-3 grid-cols-fill-180 flex-shrink-0';
        const selectorWrapper = document.createElement('div');
        selectorWrapper.className = 'flex flex-col px-3';
        selectorWrapper.appendChild(selectorRow);
        selectorGrid.appendChild(selectorWrapper);

        // Load settings to check if game mechanics should be shown
        const settings = window.Somuchmore?.settings?.get() || { explainGameMechanics: true };

        selectorContent.appendChild(selectorGrid);

        // Create and store diagram element
        advantageDiagramElement = createAdvantageDiagram();
        advantageDiagramElement.style.display = settings.explainGameMechanics ? '' : 'none';
        selectorContent.appendChild(advantageDiagramElement);

        // Create and store abilities element
        specialAbilitiesElement = createSpecialAbilities();
        specialAbilitiesElement.style.display = settings.explainGameMechanics ? '' : 'none';
        selectorContent.appendChild(specialAbilitiesElement);

        selectorBox.appendChild(selectorContent);
        groupedWrapper.appendChild(selectorBox);

        // Add sections as separate boxes
        const sections = [
            { key: 'exploration', title: 'Exploration' },
            { key: 'espionage', title: 'Espionage' },
            { key: 'officer', title: 'Officers' },
            { key: 'ranged', title: 'Ranged' },
            { key: 'shock', title: 'Shock' },
            { key: 'tank', title: 'Tank' },
            { key: 'cavalry', title: 'Cavalry' }
        ];

        sections.forEach(section => {
            if (classified[section.key].length > 0) {
                const box = createSectionBox(section.title, classified[section.key]);
                groupedWrapper.appendChild(box);
            }
        });

        // Add other units at the end if any
        if (classified.other.length > 0) {
            const box = createSectionBox('Other', classified.other);
            groupedWrapper.appendChild(box);
        }

        // Replace container with grouped wrapper
        originalParent.replaceChild(groupedWrapper, container);

        isGrouped = true;
        console.log('[Somuchmore] Army grouped!');
        return true;
    }

    // Handle tab changes
    function handleTabChange({ mainTab, subTab, container }) {
        const settings = window.Somuchmore?.settings?.get() || {};

        // Check if we're on Army tab
        if (mainTab === 'army' && subTab === 'army') {
            if (!container) return;

            // We're on the right tab - apply grouping if enabled
            if (settings.groupUnitsByClass && !isGrouped) {
                setTimeout(() => groupUnits(container), 100);
            }
        } else {
            // Reset state when leaving the army tab
            if (isGrouped) {
                isGrouped = false;
                originalContainer = null;
                originalParent = null;
                groupedWrapper = null;
            }
            advantageDiagramElement = null;
            specialAbilitiesElement = null;
        }
    }

    // Apply grouping setting
    function applySetting(enabled) {
        if (!tabMonitor.isTabActive('army', 'army')) {
            return;
        }

        if (enabled) {
            // Enable grouping
            if (isGrouped) {
                return; // Already grouped
            }

            // Group units
            const container = tabMonitor.getButtonContainer();
            if (container) {
                groupUnits(container);
            }

            // Notify game-mechanics to remove standalone box since we show it in grouped view
            if (window.Somuchmore?.gameMechanics?.refresh) {
                window.Somuchmore.gameMechanics.refresh();
            }
        } else {
            // Disable grouping - restore original layout
            if (isGrouped) {
                restoreOriginal();
            }

            // Notify game-mechanics to add standalone box back if enabled
            if (window.Somuchmore?.gameMechanics?.refresh) {
                window.Somuchmore.gameMechanics.refresh();
            }
        }
    }

    // Listen for tab changes (called immediately with current state)
    tabMonitor.onChange(handleTabChange);

    // Apply game mechanics setting (only when grouped)
    function applyGameMechanics(enabled) {
        if (!tabMonitor.isTabActive('army', 'army') || !isGrouped) {
            return;
        }

        // In grouped view - toggle visibility of game mechanics
        if (advantageDiagramElement) {
            advantageDiagramElement.style.display = enabled ? '' : 'none';
        }
        if (specialAbilitiesElement) {
            specialAbilitiesElement.style.display = enabled ? '' : 'none';
        }
    }

    // Expose API under Somuchmore
    window.Somuchmore = window.Somuchmore || {};
    window.Somuchmore.groupArmy = {
        apply: applySetting,
        isGrouped: () => isGrouped,
        applyGameMechanics: applyGameMechanics
    };

    return true;
}
