// Group Units UI Handler
/* global unsafeWindow */

const realWindow = typeof unsafeWindow !== 'undefined' ? unsafeWindow : window;

export function applySetting(enabled) {
    console.log('[Somuchmore] Group units:', enabled);
    if (realWindow.Somuchmore?.groupArmy) {
        realWindow.Somuchmore.groupArmy.apply(enabled);
    }
}
