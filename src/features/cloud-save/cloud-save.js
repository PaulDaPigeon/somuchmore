// Cloud Save - Initialization

import { Dialog } from '../ui/dialog';
import { CloudSave } from './controller';
import { decodeSecret } from './secret-decoder';

// Initialize and export
export async function initCloudSave() {
    const cloudSave = new CloudSave();

    // Expose to window for UI access under Somuchmore
    window.Somuchmore = window.Somuchmore || {};
    window.Somuchmore.cloudSave = cloudSave;

    // Pre-decode the secret for OAuth operations
    await decodeSecret();

    // Check if we're returning from OAuth flow
    const urlParams = new URLSearchParams(window.location.search);
    const authCode = urlParams.get('code');
    const isAuthPending = GM_getValue('cloud_save_auth_pending', null);

    if (authCode && isAuthPending === 'true') {
        console.log('[CloudSave] Processing OAuth callback...');

        // Get the code verifier
        const codeVerifier = GM_getValue('cloud_save_code_verifier');

        if (codeVerifier) {
            // Exchange the code for tokens
            cloudSave.oauth.exchangeCode(authCode, codeVerifier)
                .then(() => {
                    console.log('[CloudSave] Authentication successful!');
                    GM_deleteValue('cloud_save_auth_pending');

                    // Clean up URL
                    const cleanUrl = window.location.origin + window.location.pathname;
                    window.history.replaceState({}, document.title, cleanUrl);

                    // Update UI
                    if (window.Somuchmore?._cloudSaveUpdateUI) {
                        window.Somuchmore._cloudSaveUpdateUI();
                    }

                    // Show success message
                    Dialog.showMessage(
                        'Cloud Save Connected',
                        'Successfully connected to Google Drive! You can now save your game to the cloud.',
                        'success'
                    );
                })
                .catch((error) => {
                    console.error('[CloudSave] Authentication failed:', error);
                    GM_deleteValue('cloud_save_auth_pending');

                    // Clean up URL
                    const cleanUrl = window.location.origin + window.location.pathname;
                    window.history.replaceState({}, document.title, cleanUrl);

                    Dialog.showMessage(
                        'Authentication Failed',
                        `Cloud save authentication failed: ${error.message}`,
                        'error'
                    );
                });
        }
    }

    // Auto-start auto-save if authenticated
    if (cloudSave.isAuthenticated()) {
        // Start auto-save with default interval (30 minutes)
        cloudSave.startAutoSave(30);
    }

    console.log('[CloudSave] Module initialized');
    return cloudSave;
}
