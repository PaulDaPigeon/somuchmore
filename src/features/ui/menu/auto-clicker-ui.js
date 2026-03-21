// Auto-Clicker UI Handler
/* global unsafeWindow */

const realWindow = typeof unsafeWindow !== 'undefined' ? unsafeWindow : window;

export function applySetting(enabled) {
    console.log('[Somuchmore] Auto-clicker:', enabled);
    if (realWindow.Somuchmore?.autoClicker) {
        realWindow.Somuchmore.autoClicker.apply(enabled);
    }
}
