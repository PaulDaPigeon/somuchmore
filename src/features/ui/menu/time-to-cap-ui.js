// Time to Cap UI Handler
/* global unsafeWindow */

const realWindow = typeof unsafeWindow !== 'undefined' ? unsafeWindow : window;

export function applySetting(enabled) {
    // Use exposed API if available
    if (realWindow.Somuchmore?.timeToCap) {
        realWindow.Somuchmore.timeToCap.apply(enabled);
    } else {
        // Fallback to direct DOM manipulation
        const cells = document.querySelectorAll('.somuchmore_ttc');
        cells.forEach(cell => {
            cell.style.display = enabled ? '' : 'none';
        });
    }
}
