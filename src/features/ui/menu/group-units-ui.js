// Group Units UI Handler

export function applySetting(enabled) {
    console.log('[Somuchmore] Group units:', enabled);
    if (window.Somuchmore?.groupArmy) {
        window.Somuchmore.groupArmy.apply(enabled);
    }
}
