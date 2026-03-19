// Game Mechanics UI - Advantage diagram and special abilities

// Get icon for unit type/section
export function getSectionIcon(title) {
    const icons = {
        'Exploration': {
            style: 'background: linear-gradient(to bottom right, #3b82f6, #2563eb);',
            path: 'M17.9,17.39C17.64,16.59 16.89,16 16,16H15V13A1,1 0 0,0 14,12H8V10H10A1,1 0 0,0 11,9V7H13A2,2 0 0,0 15,5V4.59C17.93,5.77 20,8.64 20,12C20,14.08 19.2,15.97 17.9,17.39M11,19.93C7.05,19.44 4,16.08 4,12C4,11.38 4.08,10.78 4.21,10.21L9,15V16A2,2 0 0,0 11,18M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z',
            iconClass: 'text-white'
        },
        'Espionage': {
            style: 'background: linear-gradient(to bottom right, #8b5cf6, #7c3aed);',
            path: 'M10.7 12.5C10.7 12.8 9.4 13.2 8.4 13.2S6.3 12.5 6.3 12.3C6.3 12 7 11.1 8.6 11C9.5 10.9 10.5 11.5 10.7 12.5M15.4 11C14.4 10.9 13.5 11.5 13.3 12.5C13.3 12.8 14.5 13.2 15.6 13.2C16.7 13.2 17.7 12.5 17.7 12.3S17 11.1 15.4 11M22 12C22 17.5 17.5 22 12 22S2 17.5 2 12 6.5 2 12 2 22 6.5 22 12M20 11.2C20 9.2 19.3 8.5 16.7 8.5C14.1 8.5 13.3 9.6 12 9.6S10 8.5 7.3 8.5 4 9.1 4 11.2C4 14.6 5.5 16.5 7.6 16.5C9.2 16.5 10.4 14.5 12 14.5S14.7 16.5 16.4 16.5C18.5 16.5 20 14.6 20 11.2Z',
            iconClass: 'text-white'
        },
        'Officers': {
            style: 'background: linear-gradient(to bottom right, #eab308, #ca8a04);',
            path: 'M12 1L21 5V11C21 16.5 17.2 21.7 12 23C6.8 21.7 3 16.5 3 11V5L12 1M12 3.2L5 6.3V11.2C5 15.5 8.2 20 12 21C15.8 20 19 15.5 19 11.2V6.3L12 3.2M12 5.5L14 7.1L13 13H15V15H13V18H11V15H9V13H11L10 7.1L12 5.5Z',
            iconClass: 'text-white'
        },
        'Ranged': {
            style: 'background: green;',
            path: 'M19.03 6.03L20 7L22 2L17 4L17.97 4.97L16.15 6.79C10.87 2.16 3.3 3.94 2.97 4L2 4.26L2.5 6.2L3.29 6L10.12 12.82L6.94 16H5L2 19L4 20L5 22L8 19V17.06L11.18 13.88L18 20.71L17.81 21.5L19.74 22L20 21.03C20.06 20.7 21.84 13.13 17.21 7.85L19.03 6.03M4.5 5.78C6.55 5.5 11.28 5.28 14.73 8.21L10.82 12.12L4.5 5.78M18.22 19.5L11.88 13.18L15.79 9.27C18.72 12.72 18.5 17.45 18.22 19.5Z',
            iconClass: 'text-white'
        },
        'Shock': {
            style: 'background: crimson;',
            path: 'M6.2,2.44L18.1,14.34L20.22,12.22L21.63,13.63L19.16,16.1L22.34,19.28C22.73,19.67 22.73,20.3 22.34,20.69L21.63,21.4C21.24,21.79 20.61,21.79 20.22,21.4L17,18.23L14.56,20.7L13.15,19.29L15.27,17.17L3.37,5.27V2.44H6.2M15.89,10L20.63,5.26V2.44H17.8L13.06,7.18L15.89,10M10.94,15L8.11,12.13L5.9,14.34L3.78,12.22L2.37,13.63L4.84,16.1L1.66,19.29C1.27,19.68 1.27,20.31 1.66,20.7L2.37,21.41C2.76,21.8 3.39,21.8 3.78,21.41L7,18.23L9.44,20.7L10.85,19.29L8.73,17.17L10.94,15Z',
            iconClass: 'text-white'
        },
        'Tank': {
            style: 'background: white;',
            path: 'M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1M12 8.89C13.6 8.89 14.89 10.18 14.89 11.78S13.6 14.67 12 14.67 9.11 13.37 9.11 11.78 10.41 8.89 12 8.89M12 6L13.38 8C12.96 7.82 12.5 7.73 12 7.73S11.05 7.82 10.62 8L12 6M7 8.89L9.4 8.69C9.06 9 8.74 9.34 8.5 9.76C8.25 10.18 8.1 10.62 8 11.08L7 8.89M7 14.67L8.03 12.5C8.11 12.93 8.27 13.38 8.5 13.8C8.75 14.23 9.06 14.59 9.4 14.88L7 14.67M17 8.89L16 11.08C15.9 10.62 15.74 10.18 15.5 9.76C15.26 9.34 14.95 9 14.6 8.68L17 8.89M17 14.67L14.6 14.87C14.94 14.58 15.25 14.22 15.5 13.8C15.74 13.38 15.89 12.93 15.97 12.5L17 14.67M12 17.55L10.61 15.57C11.04 15.72 11.5 15.82 12 15.82C12.5 15.82 12.95 15.72 13.37 15.57L12 17.55Z',
            iconClass: 'text-black'
        },
        'Cavalry': {
            style: 'background: darkorange;',
            path: 'M20 8V16L17 17L13.91 11.5C13.65 11.04 12.92 11.27 13 11.81L14 21L4 17L5.15 8.94C5.64 5.53 8.56 3 12 3H20L18.42 5.37C19.36 5.88 20 6.86 20 8Z',
            iconClass: 'text-white'
        }
    };

    return icons[title] || { style: 'background: gray;', path: 'M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2Z', iconClass: 'text-white' };
}

// Create special abilities explanation (splash & trample)
export function createSpecialAbilities() {
    const container = document.createElement('div');
    container.className = 'xl:flex flex-col items-center justify-center gap-2 px-3';

    const splashPath = 'M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12C22,10.84 21.79,9.69 21.39,8.61L19.79,10.21C19.93,10.8 20,11.4 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4C12.6,4 13.2,4.07 13.79,4.21L15.4,2.6C14.31,2.21 13.16,2 12,2M19,2L15,6V7.5L12.45,10.05C12.3,10 12.15,10 12,10A2,2 0 0,0 10,12A2,2 0 0,0 12,14A2,2 0 0,0 14,12C14,11.85 14,11.7 13.95,11.55L16.5,9H18L22,5H19V2M12,6A6,6 0 0,0 6,12A6,6 0 0,0 12,18A6,6 0 0,0 18,12H16A4,4 0 0,1 12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8V6Z';
    const tramplePath = 'M6.91 5.5L9.21 7.79L7.79 9.21L5.5 6.91L3.21 9.21L1.79 7.79L4.09 5.5L1.79 3.21L3.21 1.79L5.5 4.09L7.79 1.79L9.21 3.21M22.21 16.21L20.79 14.79L18.5 17.09L16.21 14.79L14.79 16.21L17.09 18.5L14.79 20.79L16.21 22.21L18.5 19.91L20.79 22.21L22.21 20.79L19.91 18.5M20.4 6.83L17.18 11L15.6 9.73L16.77 8.23A9.08 9.08 0 0 0 10.11 13.85A4.5 4.5 0 1 1 7.5 13A4 4 0 0 1 8.28 13.08A11.27 11.27 0 0 1 16.43 6.26L15 5.18L16.27 3.6M10 17.5A2.5 2.5 0 1 0 7.5 20A2.5 2.5 0 0 0 10 17.5Z';

    container.innerHTML = `
        <!-- Splash -->
        <div class="flex items-center gap-2">
            <div class="p-1 rounded-full shadow-md" style="background: linear-gradient(to bottom right, #f97316, #ea580c);">
                <svg viewBox="0 0 24 24" role="presentation" class="w-4 h-4 text-white">
                    <path d="${splashPath}" style="fill: currentcolor;"></path>
                </svg>
            </div>
            <div class="text-sm text-gray-700 dark:text-gray-300" style="max-width: 180px;">
                <span class="font-semibold">Splash:</span> Hits multiple units simultaneously
            </div>
        </div>

        <!-- Trample -->
        <div class="flex items-center gap-2">
            <div class="p-1 rounded-full shadow-md" style="background: linear-gradient(to bottom right, #a855f7, #9333ea);">
                <svg viewBox="0 0 24 24" role="presentation" class="w-4 h-4 text-white">
                    <path d="${tramplePath}" style="fill: currentcolor;"></path>
                </svg>
            </div>
            <div class="text-sm text-gray-700 dark:text-gray-300" style="max-width: 180px;">
                <span class="font-semibold">Trample:</span> Percentage of residual damage carries to next unit
            </div>
        </div>
    `;

    return container;
}

// Create advantage diagram showing rock-paper-scissors mechanics
export function createAdvantageDiagram() {
    const diagram = document.createElement('div');
    diagram.className = 'flex items-center justify-center relative px-3';

    const rangedIcon = getSectionIcon('Ranged');
    const shockIcon = getSectionIcon('Shock');
    const tankIcon = getSectionIcon('Tank');
    const cavalryIcon = getSectionIcon('Cavalry');

    const container = document.createElement('div');
    container.className = 'relative cursor-help';
    container.style.width = '70px';
    container.style.height = '70px';

    container.innerHTML = `
        <!-- Top-left: Tank -->
        <div class="absolute" style="top: 0; left: 0;">
            <div class="p-1 rounded-full shadow-md" style="${tankIcon.style}">
                <svg viewBox="0 0 24 24" role="presentation" class="w-4 h-4 ${tankIcon.iconClass}">
                    <path d="${tankIcon.path}" style="fill: currentcolor;"></path>
                </svg>
            </div>
        </div>

        <!-- Top-right: Cavalry -->
        <div class="absolute" style="top: 0; right: 0;">
            <div class="p-1 rounded-full shadow-md" style="${cavalryIcon.style}">
                <svg viewBox="0 0 24 24" role="presentation" class="w-4 h-4 ${cavalryIcon.iconClass}">
                    <path d="${cavalryIcon.path}" style="fill: currentcolor;"></path>
                </svg>
            </div>
        </div>

        <!-- Bottom-right: Ranged -->
        <div class="absolute" style="bottom: 0; right: 0;">
            <div class="p-1 rounded-full shadow-md" style="${rangedIcon.style}">
                <svg viewBox="0 0 24 24" role="presentation" class="w-4 h-4 ${rangedIcon.iconClass}">
                    <path d="${rangedIcon.path}" style="fill: currentcolor;"></path>
                </svg>
            </div>
        </div>

        <!-- Bottom-left: Shock -->
        <div class="absolute" style="bottom: 0; left: 0;">
            <div class="p-1 rounded-full shadow-md" style="${shockIcon.style}">
                <svg viewBox="0 0 24 24" role="presentation" class="w-4 h-4 ${shockIcon.iconClass}">
                    <path d="${shockIcon.path}" style="fill: currentcolor;"></path>
                </svg>
            </div>
        </div>

        <!-- Arrows connecting units clockwise forming square -->
        <!-- Top: Tank → Cavalry (right arrow) -->
        <svg class="absolute" style="top: 8px; left: 24px; width: 22px; height: 8px;" viewBox="0 0 22 8">
            <path d="M0 4 L18 4 L14 0.5 M18 4 L14 7.5" stroke="rgba(200,200,200,0.8)" stroke-width="2" fill="none"/>
        </svg>

        <!-- Right: Cavalry → Ranged (down arrow) -->
        <svg class="absolute" style="top: 24px; right: 8px; width: 8px; height: 22px;" viewBox="0 0 8 22">
            <path d="M4 0 L4 18 L0.5 14 M4 18 L7.5 14" stroke="rgba(200,200,200,0.8)" stroke-width="2" fill="none"/>
        </svg>

        <!-- Bottom: Ranged → Shock (left arrow) -->
        <svg class="absolute" style="bottom: 8px; right: 24px; width: 22px; height: 8px;" viewBox="0 0 22 8">
            <path d="M22 4 L4 4 L8 0.5 M4 4 L8 7.5" stroke="rgba(200,200,200,0.8)" stroke-width="2" fill="none"/>
        </svg>

        <!-- Left: Shock → Tank (up arrow) -->
        <svg class="absolute" style="bottom: 24px; left: 8px; width: 8px; height: 22px;" viewBox="0 0 8 22">
            <path d="M4 22 L4 4 L0.5 8 M4 4 L7.5 8" stroke="rgba(200,200,200,0.8)" stroke-width="2" fill="none"/>
        </svg>
    `;

    // Create tooltip element separately and add hover listeners
    const tooltip = document.createElement('div');
    tooltip.className = 'absolute z-50 p-3 bg-white dark:bg-mydark-700 border border-gray-300 dark:border-mydark-200 rounded-lg shadow-lg pointer-events-none';
    tooltip.style.width = '320px';
    tooltip.style.top = '-10px';
    tooltip.style.left = '80px';
    tooltip.style.display = 'none';
    tooltip.innerHTML = `
        <p class="mb-2 text-sm text-gray-600 dark:text-gray-400">Unit types are effective against other types, following the order: Tank → Cavalry → Ranged → Shock → Tank. If a unit is effective against another unit, it deals double damage.</p>
        <p class="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">Examples:</p>
        <p class="mb-2 text-sm text-gray-600 dark:text-gray-400">A unit with 10 attack fights against a unit with 20 defense. If it's effective, it will deal 20 damage instead of 10, killing in 1 attack instead of 2.</p>
        <p class="mb-2 text-sm text-gray-600 dark:text-gray-400">A unit with 5 attack fights against a unit with 20 defense. If it's effective, it will deal 10 damage instead of 5, killing in 2 attacks instead of 4.</p>
        <p class="text-sm text-gray-600 dark:text-gray-400">Effectiveness stops mattering once your attack exceeds the other unit's defense.</p>
    `;

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

// Game Mechanics Display Feature - Shows game mechanics independently
import { getTabMonitor } from '../core/tab-monitor';

export function initGameMechanicsDisplay() {
    if (!window.MainStore) {
        console.error('[Somuchmore] MainStore not available');
        return false;
    }

    let advantageDiagramElement = null;
    let specialAbilitiesElement = null;
    let gameMechanicsBoxElement = null;
    const tabMonitor = getTabMonitor();

    // Create game mechanics box
    function createGameMechanicsBox() {
        const settings = window.somuchmoreSettings?.get() || { explainGameMechanics: true };

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
        const settings = window.somuchmoreSettings?.get() || {};
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
        const settings = window.somuchmoreSettings?.get() || {};

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

        const settings = window.somuchmoreSettings?.get() || {};

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

    // Expose API
    window.somuchmoreGameMechanics = {
        apply: applyGameMechanicsSetting
    };

    return true;
}
