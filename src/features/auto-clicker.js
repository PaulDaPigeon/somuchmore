// Auto-Clicker for First Age Resources
/* global unsafeWindow */
import { Resources } from '../core/game-data';

const realWindow = typeof unsafeWindow !== 'undefined' ? unsafeWindow : window;

export function initAutoClicker() {
    if (!realWindow.Somuchmore?.MainStore) {
        console.error('[Somuchmore] MainStore not available');
        return false;
    }

    let intervalId = null;
    let buttonIndex = 0;
    const resources = ['food', 'wood', 'stone'];

    // Click next button in round-robin sequence
    function clickNextButton() {
        // Safety check: stop if buttons no longer available
        if (!Resources.isManualClickingAvailable()) {
            console.log('[Somuchmore] Auto-clicker: manual buttons no longer available, stopping');
            stopClicking();
            return;
        }

        buttonIndex = (buttonIndex % resources.length) + 1;
        const button = document.querySelector(`div.flex.flex-wrap.gap-3 button:nth-child(${buttonIndex})`);
        if (button && !button.disabled) {
            button.click();
        }
    }

    // Start auto-clicking
    function startClicking() {
        if (intervalId) return; // Already running

        // Don't start if manual clicking buttons aren't available
        if (!Resources.isManualClickingAvailable()) {
            console.log('[Somuchmore] Auto-clicker: manual buttons not available, not starting');
            return;
        }

        const settings = realWindow.Somuchmore?.settings?.get() || { autoClickerInterval: 100 };
        intervalId = setInterval(clickNextButton, settings.autoClickerInterval / resources.length);
        console.log(`[Somuchmore] Auto-clicker started (${settings.autoClickerInterval}ms interval, ${settings.autoClickerInterval / resources.length}ms per button)`);
    }

    // Stop auto-clicking
    function stopClicking() {
        if (intervalId) {
            clearInterval(intervalId);
            intervalId = null;
            console.log('[Somuchmore] Auto-clicker stopped');
        }
    }

    // Apply settings (called when settings change)
    function applySetting(enabled, interval) {
        stopClicking();
        if (enabled) {
            startClicking();
        }
    }

    // Initialize
    const settings = realWindow.Somuchmore?.settings?.get() || { autoClickerEnabled: false };
    console.log('[Somuchmore] Auto-clicker initialized');

    // Only start if buttons are available
    if (settings.autoClickerEnabled && Resources.isManualClickingAvailable()) {
        startClicking();
    } else if (settings.autoClickerEnabled && !Resources.isManualClickingAvailable()) {
        console.log('[Somuchmore] Auto-clicker: setting is enabled but buttons not available, not starting');
    }

    // Expose API under Somuchmore
    realWindow.Somuchmore = realWindow.Somuchmore || {};
    realWindow.Somuchmore.autoClicker = {
        apply: applySetting,
        isRunning: () => intervalId !== null,
        isAvailable: () => Resources.isManualClickingAvailable(),
        _cleanup: () => stopClicking()
    };

    return true;
}
