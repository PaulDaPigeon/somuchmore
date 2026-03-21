// Time to Cap UI Handler

export function applySetting(enabled) {
    // Use exposed API if available
    if (window.Somuchmore?.timeToCap) {
        window.Somuchmore.timeToCap.apply(enabled);
    } else {
        // Fallback to direct DOM manipulation
        const cells = document.querySelectorAll('.somuchmore_ttc');
        cells.forEach(cell => {
            cell.style.display = enabled ? '' : 'none';
        });
    }
}
