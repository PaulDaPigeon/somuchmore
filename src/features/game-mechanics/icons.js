// Game Mechanics Icons - Icon definitions for unit types
// Imports SVG files from assets and extracts path data

import explorationSvg from '../../assets/icons/exploration.svg';
import espionageSvg from '../../assets/icons/espionage.svg';
import officersSvg from '../../assets/icons/officers.svg';
import rangedSvg from '../../assets/icons/ranged.svg';
import shockSvg from '../../assets/icons/shock.svg';
import tankSvg from '../../assets/icons/tank.svg';
import cavalrySvg from '../../assets/icons/cavalry.svg';
import defaultSvg from '../../assets/icons/default.svg';

// Extract path data from SVG string
function extractPath(svgString) {
    const match = svgString.match(/d="([^"]+)"/);
    return match ? match[1] : '';
}

// Get icon for unit type/section
export function getSectionIcon(title) {
    const icons = {
        'Exploration': {
            style: 'background: linear-gradient(to bottom right, #3b82f6, #2563eb);',
            path: extractPath(explorationSvg),
            iconClass: 'text-white'
        },
        'Espionage': {
            style: 'background: linear-gradient(to bottom right, #8b5cf6, #7c3aed);',
            path: extractPath(espionageSvg),
            iconClass: 'text-white'
        },
        'Officers': {
            style: 'background: linear-gradient(to bottom right, #eab308, #ca8a04);',
            path: extractPath(officersSvg),
            iconClass: 'text-white'
        },
        'Ranged': {
            style: 'background: green;',
            path: extractPath(rangedSvg),
            iconClass: 'text-white'
        },
        'Shock': {
            style: 'background: crimson;',
            path: extractPath(shockSvg),
            iconClass: 'text-white'
        },
        'Tank': {
            style: 'background: white;',
            path: extractPath(tankSvg),
            iconClass: 'text-black'
        },
        'Cavalry': {
            style: 'background: darkorange;',
            path: extractPath(cavalrySvg),
            iconClass: 'text-white'
        }
    };

    return icons[title] || {
        style: 'background: gray;',
        path: extractPath(defaultSvg),
        iconClass: 'text-white'
    };
}
