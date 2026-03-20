// Cloud Save Module - OAuth2 Implicit Grant for Google Sheets API

import { Dialog } from './dialog';

const GOOGLE_CLIENT_ID = '220592312923-7rasv9q1ammcvab6uasnpnbdco83mnl4.apps.googleusercontent.com';
const GOOGLE_SHEETS_API = 'https://sheets.googleapis.com/v4/spreadsheets';
const SCOPES = 'https://www.googleapis.com/auth/drive.file';
const REDIRECT_URI = 'https://www.theresmoregame.com/play/';

// OAuth2 Implicit Grant implementation
class OAuth2Implicit {
    constructor() {
        this.accessToken = null;
        this.expiresAt = null;
        this.loadTokens();
    }

    loadTokens() {
        try {
            this.accessToken = GM_getValue('cloud_save_access_token', null);
            this.expiresAt = GM_getValue('cloud_save_expires_at', null);
        } catch (e) {
            console.error('[CloudSave] Failed to load tokens:', e);
        }
    }

    saveTokens() {
        try {
            GM_setValue('cloud_save_access_token', this.accessToken);
            GM_setValue('cloud_save_expires_at', this.expiresAt);
        } catch (e) {
            console.error('[CloudSave] Failed to save tokens:', e);
        }
    }

    clearTokens() {
        this.accessToken = null;
        this.expiresAt = null;
        try {
            GM_deleteValue('cloud_save_access_token');
            GM_deleteValue('cloud_save_expires_at');
        } catch (e) {
            console.error('[CloudSave] Failed to clear tokens:', e);
        }
    }

    isAuthenticated() {
        return this.accessToken && this.expiresAt && Date.now() < this.expiresAt;
    }

    async startAuth() {
        // Mark auth as pending
        GM_setValue('cloud_save_auth_pending', 'true');

        // Build authorization URL for implicit grant
        const params = new URLSearchParams({
            client_id: GOOGLE_CLIENT_ID,
            redirect_uri: REDIRECT_URI,
            response_type: 'token',
            scope: SCOPES,
            prompt: 'consent'
        });

        const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;

        // Navigate to auth page (will redirect back with token in URL fragment)
        window.location.href = authUrl;
    }

    processTokenFromFragment(fragment) {
        // Parse token from URL fragment (#access_token=...&expires_in=...)
        const params = new URLSearchParams(fragment.substring(1));
        const accessToken = params.get('access_token');
        const expiresIn = params.get('expires_in');

        if (accessToken && expiresIn) {
            const expiresInSeconds = parseInt(expiresIn);
            const expiresInHours = (expiresInSeconds / 3600).toFixed(1);

            console.log(`[CloudSave] Token expires in: ${expiresInSeconds} seconds (${expiresInHours} hours)`);

            this.accessToken = accessToken;
            this.expiresAt = Date.now() + (expiresInSeconds * 1000);
            this.saveTokens();
            return true;
        }

        return false;
    }

    async ensureValidToken() {
        if (!this.accessToken) {
            throw new Error('Not authenticated');
        }

        // Check if token is expired
        if (Date.now() >= this.expiresAt) {
            throw new Error('Token expired - please reconnect');
        }
    }

    async getToken() {
        await this.ensureValidToken();
        return this.accessToken;
    }
}

// Google Sheets API wrapper
class SheetsAPI {
    constructor(oauth) {
        this.oauth = oauth;
        this.spreadsheetId = GM_getValue('cloud_save_spreadsheet_id', null);
    }

    async createSpreadsheet() {
        const token = await this.oauth.getToken();
        const response = await fetch(GOOGLE_SHEETS_API, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                properties: {
                    title: 'Theresmore Save Data'
                },
                sheets: [{
                    properties: {
                        title: 'Saves',
                        gridProperties: {
                            rowCount: 100,
                            columnCount: 3
                        }
                    }
                }]
            })
        });

        if (response.status === 429) {
            throw new Error('QUOTA_EXCEEDED');
        }

        if (!response.ok) {
            throw new Error(`Failed to create spreadsheet: ${response.status}`);
        }

        const data = await response.json();
        this.spreadsheetId = data.spreadsheetId;
        GM_setValue('cloud_save_spreadsheet_id', this.spreadsheetId);
        return this.spreadsheetId;
    }

    async appendSave(saveData) {
        if (!this.spreadsheetId) {
            await this.createSpreadsheet();
        }

        const token = await this.oauth.getToken();
        const timestamp = new Date().toISOString();
        const values = [[timestamp, saveData.version, JSON.stringify(saveData.data)]];

        const response = await fetch(
            `${GOOGLE_SHEETS_API}/${this.spreadsheetId}/values/Saves:append?valueInputOption=RAW`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ values })
            }
        );

        if (response.status === 429) {
            throw new Error('QUOTA_EXCEEDED');
        }

        if (!response.ok) {
            throw new Error(`Failed to save: ${response.status}`);
        }

        return await response.json();
    }

    async listSaves() {
        if (!this.spreadsheetId) {
            return [];
        }

        const token = await this.oauth.getToken();
        const response = await fetch(
            `${GOOGLE_SHEETS_API}/${this.spreadsheetId}/values/Saves`,
            {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }
        );

        if (response.status === 429) {
            throw new Error('QUOTA_EXCEEDED');
        }

        if (!response.ok) {
            return [];
        }

        const data = await response.json();
        if (!data.values || data.values.length === 0) {
            return [];
        }

        // Parse saves (skip header row if exists)
        return data.values.map((row, index) => ({
            index,
            timestamp: row[0],
            version: row[1],
            data: row[2]
        }));
    }

    async deleteSave(index) {
        if (!this.spreadsheetId) {
            return;
        }

        const token = await this.oauth.getToken();
        const response = await fetch(
            `${GOOGLE_SHEETS_API}/${this.spreadsheetId}:batchUpdate`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    requests: [{
                        deleteDimension: {
                            range: {
                                sheetId: 0,
                                dimension: 'ROWS',
                                startIndex: index,
                                endIndex: index + 1
                            }
                        }
                    }]
                })
            }
        );

        if (response.status === 429) {
            throw new Error('QUOTA_EXCEEDED');
        }

        if (!response.ok) {
            throw new Error(`Failed to delete save: ${response.status}`);
        }
    }
}

// Main CloudSave controller
export class CloudSave {
    constructor() {
        this.oauth = new OAuth2Implicit();
        this.sheets = new SheetsAPI(this.oauth);
        this.autoSaveInterval = null;
        this.quotaExceeded = false;
    }

    isAuthenticated() {
        return this.oauth.isAuthenticated();
    }

    async authenticate() {
        try {
            await this.oauth.startAuth();
            return true;
        } catch (e) {
            console.error('[CloudSave] Authentication failed:', e);
            throw e;
        }
    }

    disconnect() {
        this.oauth.clearTokens();
        this.sheets.spreadsheetId = null;
        GM_deleteValue('cloud_save_spreadsheet_id');
        this.stopAutoSave();
    }

    serializeGameState() {
        if (!window.MainStore) {
            throw new Error('MainStore not available');
        }

        // Get somuchmore settings
        const settings = window.somuchmoreSettings?.get() || {};

        // Serialize MainStore data (you may need to adjust this based on actual store structure)
        const gameData = {
            // Add the actual MainStore properties you want to save
            // For example:
            resources: window.MainStore.resources,
            buildings: window.MainStore.buildings,
            technologies: window.MainStore.technologies,
            army: window.MainStore.army,
            // ... add more as needed
        };

        return {
            version: '1.0.0',
            timestamp: Date.now(),
            settings: settings,
            data: gameData
        };
    }

    async save() {
        try {
            if (this.quotaExceeded) {
                throw new Error('QUOTA_EXCEEDED');
            }

            const saveData = this.serializeGameState();
            await this.sheets.appendSave(saveData);
            console.log('[CloudSave] Save successful');
            return true;
        } catch (e) {
            if (e.message === 'QUOTA_EXCEEDED') {
                this.quotaExceeded = true;
                this.stopAutoSave();
                console.error('[CloudSave] Quota exceeded - auto-save disabled');
            }
            throw e;
        }
    }

    async listSaves() {
        try {
            return await this.sheets.listSaves();
        } catch (e) {
            console.error('[CloudSave] Failed to list saves:', e);
            return [];
        }
    }

    async load(save) {
        try {
            const saveData = JSON.parse(save.data);

            // Verify data integrity
            if (!saveData.data || typeof saveData.data !== 'object') {
                throw new Error('Invalid save data');
            }

            // Ask for confirmation
            const confirmed = await Dialog.showConfirm(
                'Load Save',
                `Load save from ${new Date(saveData.timestamp).toLocaleString()}?\n\nThis will overwrite your current game state!`,
                { confirmText: 'Load', cancelText: 'Cancel', type: 'warning' }
            );

            if (!confirmed) {
                return false;
            }

            // Restore MainStore data
            if (window.MainStore && saveData.data) {
                Object.assign(window.MainStore, saveData.data);
            }

            // Restore settings
            if (saveData.settings) {
                localStorage.setItem('somuchmore_settings', JSON.stringify(saveData.settings));
            }

            console.log('[CloudSave] Load successful');

            // Reload page to apply changes
            window.location.reload();

            return true;
        } catch (e) {
            console.error('[CloudSave] Failed to load save:', e);
            throw e;
        }
    }

    async deleteSave(save) {
        try {
            await this.sheets.deleteSave(save.index);
            console.log('[CloudSave] Delete successful');
            return true;
        } catch (e) {
            console.error('[CloudSave] Failed to delete save:', e);
            throw e;
        }
    }

    startAutoSave(intervalMinutes = 30) {
        this.stopAutoSave();

        if (!this.isAuthenticated() || this.quotaExceeded) {
            return;
        }

        this.autoSaveInterval = setInterval(async () => {
            try {
                await this.save();
            } catch (e) {
                console.error('[CloudSave] Auto-save failed:', e);
            }
        }, intervalMinutes * 60 * 1000);

        console.log(`[CloudSave] Auto-save enabled (every ${intervalMinutes} minutes)`);
    }

    stopAutoSave() {
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
            this.autoSaveInterval = null;
            console.log('[CloudSave] Auto-save disabled');
        }
    }
}

// Initialize and export
export function initCloudSave() {
    const cloudSave = new CloudSave();

    // Expose to window for UI access
    window.somuchmoreCloudSave = cloudSave;

    // Check if we're returning from OAuth flow (implicit grant uses URL fragment)
    const fragment = window.location.hash;
    const isAuthPending = GM_getValue('cloud_save_auth_pending', null);

    if (fragment && isAuthPending === 'true') {
        console.log('[CloudSave] Processing OAuth callback...');

        try {
            const success = cloudSave.oauth.processTokenFromFragment(fragment);

            if (success) {
                console.log('[CloudSave] Authentication successful!');
                GM_deleteValue('cloud_save_auth_pending');

                // Clean up URL
                const cleanUrl = window.location.origin + window.location.pathname;
                window.history.replaceState({}, document.title, cleanUrl);

                // Update UI
                if (window.somuchmoreCloudSaveUpdateUI) {
                    window.somuchmoreCloudSaveUpdateUI();
                }

                // Show success message
                Dialog.showMessage(
                    'Cloud Save Connected',
                    'Successfully connected to Google Drive! You can now save your game to the cloud.',
                    'success'
                );
            } else {
                throw new Error('Failed to extract token from URL');
            }
        } catch (error) {
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