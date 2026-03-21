// Game Mechanics UI Handler
/* global unsafeWindow */

const realWindow = typeof unsafeWindow !== 'undefined' ? unsafeWindow : window;

export function applySetting(enabled) {
    console.log('[Somuchmore] Explain game mechanics:', enabled);

    // Apply to grouped view (if active)
    if (realWindow.Somuchmore?.groupArmy) {
        realWindow.Somuchmore.groupArmy.applyGameMechanics(enabled);
    }

    // Apply to standalone display (if active)
    if (realWindow.Somuchmore?.gameMechanics) {
        realWindow.Somuchmore.gameMechanics.apply(enabled);
    }
}
