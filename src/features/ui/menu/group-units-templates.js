// Group Units Templates - HTML templates for unit grouping UI

// Create icon HTML for section headers
export function createIconHTML(icon) {
    const iconClass = icon.iconClass || 'text-white';
    return `
        <svg viewBox="0 0 24 24" role="presentation" class="w-4 h-4 ${iconClass}">
            <path d="${icon.path}" style="fill: currentcolor;"></path>
        </svg>
    `;
}

// Create exploration tooltip HTML
export function createExplorationTooltipHTML() {
    return `
        <p class="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">How does scouting work?</p>
        <p class="mb-2 text-sm text-gray-600 dark:text-gray-400">During a scouting mission your scouts can die, find resources, have nothing happen to them, find up to two enemies and up to one faction. If the enemy/faction limit is reached or all enemies/factions available are found, you get nothing instead.</p>
        <p class="mb-2 text-sm text-gray-600 dark:text-gray-400">In addition, there's a second roll if you found a faction/enemy. The game picks 1 out of 40 areas. If all enemies in the area are already found, you again gain nothing.</p>
        <p class="mb-2 text-sm text-gray-600 dark:text-gray-400">An enemy can be in one or more areas. This is why some battles are easier to find than others.</p>
        <p class="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">Chances:</p>
        <p class="mb-1 text-sm text-gray-600 dark:text-gray-400">• Zenyx familiars: 33.3% enemy, 50% loot, 16.7% nothing</p>
        <p class="mb-1 text-sm text-gray-600 dark:text-gray-400">• Explorers: 41.7% enemy, 16.7% kingdom, 16.7% loot, 16.7% nothing, 8.3% dying</p>
        <p class="text-sm text-gray-600 dark:text-gray-400">• Scouts and drones: 20% enemy, 20% kingdom, 20% loot, 30% nothing, 10% dying</p>
    `;
}

// Create unit grid HTML structure
export function createUnitGridHTML() {
    return '<div class="grid gap-3 grid-cols-fill-180 min-w-full px-12 xl:px-0"></div>';
}
