// Game Mechanics Display Feature - Shows game mechanics independently

import { getTabMonitor } from '../../core/tab-monitor';
import {
    createSpecialAbilitiesHTML,
    createAdvantageDiagramHTML,
    createAdvantageDiagramTooltipHTML
} from './templates';
import { getSectionIcon } from './icons';

// Export icon function for use by group-units
export { getSectionIcon };

// Create special abilities element (exported for group-units feature)
export function createSpecialAbilities() {
    const container = document.createElement('div');
    container.className = 'xl:flex flex-col items-center justify-center gap-2 px-3';
    container.innerHTML = createSpecialAbilitiesHTML();
    return container;
}

// Create advantage diagram element (exported for group-units feature)
export function createAdvantageDiagram() {
    const diagram = document.createElement('div');
    diagram.className = 'flex items-center justify-center relative px-3';

    const container = document.createElement('div');
    container.className = 'relative cursor-help';
    container.style.width = '70px';
    container.style.height = '70px';
    container.innerHTML = createAdvantageDiagramHTML();

    // Create tooltip element
    const tooltip = document.createElement('div');
    tooltip.className = 'absolute z-50 p-3 bg-white dark:bg-mydark-700 border border-gray-300 dark:border-mydark-200 rounded-lg shadow-lg pointer-events-none';
    tooltip.style.width = '320px';
    tooltip.style.top = '-10px';
    tooltip.style.left = '80px';
    tooltip.style.display = 'none';
    tooltip.innerHTML = createAdvantageDiagramTooltipHTML();

    // Add hover listeners
    container.addEventListener('mouseenter', () => {
        tooltip.style.display = 'block';
    });
    container.addEventListener('mouseleave', () => {
        tooltip.style.display = 'none';
    });

    container.appendChild(tooltip);
    diagram.appendChild(container);

    return diagram;
}

export function initGameMechanicsDisplay() {
    if (!window.Somuchmore?.MainStore) {
        console.error('[Somuchmore] MainStore not available');
        return false;
    }

    let advantageDiagramElement = null;
    let specialAbilitiesElement = null;
    let gameMechanicsBoxElement = null;
    const tabMonitor = getTabMonitor();

    // Create game mechanics box
    function createGameMechanicsBox() {
        const settings = window.Somuchmore?.settings?.get() || { explainGameMechanics: true };

        const box = document.createElement('div');
        box.className = 'flex flex-wrap w-full min-w-full mb-3 p-3 shadow rounded-lg ring-1 bg-gray-100 dark:bg-mydark-600 ring-gray-300 dark:ring-mydark-200';
        box.setAttribute('data-somuchmore-mechanics', 'true');

        const content = document.createElement('div');
        content.className = 'flex flex-wrap items-center w-full gap-4';
        content.style.justifyContent = 'center';

        // Add media query for large screens
        const mediaQuery = window.matchMedia('(min-width: 768px)');
        const updateJustification = () => {
            content.style.justifyContent = mediaQuery.matches ? 'space-between' : 'center';
        };
        updateJustification();
        mediaQuery.addEventListener('change', updateJustification);

        // Create and store diagram element
        advantageDiagramElement = createAdvantageDiagram();
        advantageDiagramElement.style.display = settings.explainGameMechanics ? '' : 'none';
        content.appendChild(advantageDiagramElement);

        // Create and store abilities element
        specialAbilitiesElement = createSpecialAbilities();
        specialAbilitiesElement.style.display = settings.explainGameMechanics ? '' : 'none';
        content.appendChild(specialAbilitiesElement);

        box.appendChild(content);
        return box;
    }

    // Add game mechanics box to layout
    function addGameMechanicsBox() {
        const container = tabMonitor.getButtonContainer();
        if (!container) return false;

        // Don't add if grouping is active (it handles its own game mechanics)
        const settings = window.Somuchmore?.settings?.get() || {};
        if (settings.groupUnitsByClass) {
            return false;
        }

        // Remove any existing game mechanics box
        removeGameMechanicsBox();

        gameMechanicsBoxElement = createGameMechanicsBox();
        container.parentElement.insertBefore(gameMechanicsBoxElement, container);

        console.log('[Somuchmore] Game mechanics box added');
        return true;
    }

    // Remove game mechanics box
    function removeGameMechanicsBox() {
        if (gameMechanicsBoxElement) {
            gameMechanicsBoxElement.remove();
            gameMechanicsBoxElement = null;
            advantageDiagramElement = null;
            specialAbilitiesElement = null;
        }

        // Also remove any orphaned boxes
        const existingBox = document.querySelector('[data-somuchmore-mechanics="true"]');
        if (existingBox) {
            existingBox.remove();
        }
    }

    // Handle tab changes
    function handleTabChange({ mainTab, subTab }) {
        const settings = window.Somuchmore?.settings?.get() || {};

        if (mainTab === 'army' && subTab === 'army') {
            // On army tab - show game mechanics if enabled and not grouped
            if (settings.explainGameMechanics && !settings.groupUnitsByClass) {
                setTimeout(() => addGameMechanicsBox(), 100);
            }
        } else {
            // Clean up when leaving army tab
            removeGameMechanicsBox();
        }
    }

    // Apply game mechanics setting
    function applyGameMechanicsSetting(enabled) {
        if (!tabMonitor.isTabActive('army', 'army')) {
            return;
        }

        const settings = window.Somuchmore?.settings?.get() || {};

        // Only handle if grouping is disabled (otherwise group-units handles it)
        if (!settings.groupUnitsByClass) {
            if (enabled) {
                addGameMechanicsBox();
            } else {
                removeGameMechanicsBox();
            }
        }
    }

    // Listen for tab changes
    tabMonitor.onChange(handleTabChange);

    // Expose API under Somuchmore
    window.Somuchmore = window.Somuchmore || {};
    window.Somuchmore.gameMechanics = {
        apply: applyGameMechanicsSetting
    };

    return true;
}
