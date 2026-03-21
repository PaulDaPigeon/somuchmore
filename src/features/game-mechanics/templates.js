// Game Mechanics Templates - HTML/SVG templates for game mechanics UI

import { getSectionIcon } from './icons';
import splashSvg from '../../assets/icons/splash.svg';
import trampleSvg from '../../assets/icons/trample.svg';

// Extract path data from SVG string
function extractPath(svgString) {
    const match = svgString.match(/d="([^"]+)"/);
    return match ? match[1] : '';
}

// Create special abilities explanation (splash & trample)
export function createSpecialAbilitiesHTML() {
    const splashPath = extractPath(splashSvg);
    const tramplePath = extractPath(trampleSvg);

    return `
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
}

// Create advantage diagram showing rock-paper-scissors mechanics
export function createAdvantageDiagramHTML() {
    const rangedIcon = getSectionIcon('Ranged');
    const shockIcon = getSectionIcon('Shock');
    const tankIcon = getSectionIcon('Tank');
    const cavalryIcon = getSectionIcon('Cavalry');

    return `
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
}

// Create tooltip content for advantage diagram
export function createAdvantageDiagramTooltipHTML() {
    return `
        <p class="mb-2 text-sm text-gray-600 dark:text-gray-400">Unit types are effective against other types, following the order: Tank → Cavalry → Ranged → Shock → Tank. If a unit is effective against another unit, it deals double damage.</p>
        <p class="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">Examples:</p>
        <p class="mb-2 text-sm text-gray-600 dark:text-gray-400">A unit with 10 attack fights against a unit with 20 defense. If it's effective, it will deal 20 damage instead of 10, killing in 1 attack instead of 2.</p>
        <p class="mb-2 text-sm text-gray-600 dark:text-gray-400">A unit with 5 attack fights against a unit with 20 defense. If it's effective, it will deal 10 damage instead of 5, killing in 2 attacks instead of 4.</p>
        <p class="text-sm text-gray-600 dark:text-gray-400">Effectiveness stops mattering once your attack exceeds the other unit's defense.</p>
    `;
}
