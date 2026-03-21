// Game Mechanics UI Handler

export function applySetting(enabled) {
    console.log('[Somuchmore] Explain game mechanics:', enabled);

    // Apply to grouped view (if active)
    if (window.Somuchmore?.groupArmy) {
        window.Somuchmore.groupArmy.applyGameMechanics(enabled);
    }

    // Apply to standalone display (if active)
    if (window.Somuchmore?.gameMechanics) {
        window.Somuchmore.gameMechanics.apply(enabled);
    }
}
