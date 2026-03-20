// Cloud Save Module - PKCE OAuth2 with Google Sheets API

const GOOGLE_CLIENT_ID = 'YOUR_CLIENT_ID_HERE.apps.googleusercontent.com';
const GOOGLE_SHEETS_API = 'https://sheets.googleapis.com/v4/spreadsheets';
const SCOPES = 'https://www.googleapis.com/auth/spreadsheets';
const REDIRECT_URI = 'https://theresmore.com'; // Must match OAuth2 config

// PKCE helpers
function generateRandomString(length) {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
    let result = '';
    const randomValues = new Uint8Array(length);
    crypto.getRandomValues(randomValues);
    for (let i = 0; i < length; i++) {
        result += charset[randomValues[i] % charset.length];
    }
    return result;
}

async function sha256(plain) {
    const encoder = new TextEncoder();
    const data = encoder.encode(plain);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return hash;
}

function base64UrlEncode(arrayBuffer) {
    const bytes = new Uint8Array(arrayBuffer);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary)
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
}

// OAuth2 PKCE implementation
class OAuth2PKCE {
    constructor() {
        this.accessToken = null;
        this.refreshToken = null;
        this.expiresAt = null;
        this.loadTokens();
    }

    loadTokens() {
        try {
            this.accessToken = GM_getValue('cloud_save_access_token', null);
            this.refreshToken = GM_getValue('cloud_save_refresh_token', null);
            this.expiresAt = GM_getValue('cloud_save_expires_at', null);
        } catch (e) {
            console.error('[CloudSave] Failed to load tokens:', e);
        }
    }

    saveTokens() {
        try {
            GM_setValue('cloud_save_access_token', this.accessToken);
            GM_setValue('cloud_save_refresh_token', this.refreshToken);
            GM_setValue('cloud_save_expires_at', this.expiresAt);
        } catch (e) {
            console.error('[CloudSave] Failed to save tokens:', e);
        }
    }

    clearTokens() {
        this.accessToken = null;
        this.refreshToken = null;
        this.expiresAt = null;
        try {
            GM_deleteValue('cloud_save_access_token');
            GM_deleteValue('cloud_save_refresh_token');
            GM_deleteValue('cloud_save_expires_at');
        } catch (e) {
            console.error('[CloudSave] Failed to clear tokens:', e);
        }
    }

    isAuthenticated() {
        return this.accessToken && this.expiresAt && Date.now() < this.expiresAt;
    }

    async startAuth() {
        // Generate PKCE parameters
        const codeVerifier = generateRandomString(128);
        const codeChallenge = base64UrlEncode(await sha256(codeVerifier));

        // Store verifier for later
        GM_setValue('cloud_save_code_verifier', codeVerifier);

        // Build authorization URL
        const params = new URLSearchParams({
            client_id: GOOGLE_CLIENT_ID,
            redirect_uri: REDIRECT_URI,
            response_type: 'code',
            scope: SCOPES,
            code_challenge: codeChallenge,
            code_challenge_method: 'S256',
            access_type: 'offline',
            prompt: 'consent'
        });

        const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;

        // Open auth window
        window.open(authUrl, '_blank');

        // Wait for callback (user needs to paste the code)
        return new Promise((resolve, reject) => {
            window.somuchmoreCloudSave._authCallback = async (code) => {
                try {
                    await this.exchangeCode(code, codeVerifier);
                    resolve(true);
                } catch (e) {
                    reject(e);
                }
            };
        });
    }

    async exchangeCode(code, codeVerifier) {
        const params = new URLSearchParams({
            client_id: GOOGLE_CLIENT_ID,
            code: code,
            code_verifier: codeVerifier,
            grant_type: 'authorization_code',
            redirect_uri: REDIRECT_URI
        });

        const response = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: params.toString()
        });

        if (!response.ok) {
            throw new Error(`Token exchange failed: ${response.status}`);
        }

        const data = await response.json();
        this.accessToken = data.access_token;
        this.refreshToken = data.refresh_token;
        this.expiresAt = Date.now() + (data.expires_in * 1000);
        this.saveTokens();

        // Clear verifier
        GM_deleteValue('cloud_save_code_verifier');
    }

    async refreshAccessToken() {
        if (!this.refreshToken) {
            throw new Error('No refresh token available');
        }

        const params = new URLSearchParams({
            client_id: GOOGLE_CLIENT_ID,
            refresh_token: this.refreshToken,
            grant_type: 'refresh_token'
        });

        const response = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: params.toString()
        });

        if (!response.ok) {
            throw new Error(`Token refresh failed: ${response.status}`);
        }

        const data = await response.json();
        this.accessToken = data.access_token;
        this.expiresAt = Date.now() + (data.expires_in * 1000);
        this.saveTokens();
    }

    async ensureValidToken() {
        if (!this.accessToken) {
            throw new Error('Not authenticated');
        }

        // Refresh if expired or expiring soon (5 minutes buffer)
        if (Date.now() >= (this.expiresAt - 300000)) {
            await this.refreshAccessToken();
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
        this.oauth = new OAuth2PKCE();
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
            const confirm = window.confirm(
                `Load save from ${new Date(saveData.timestamp).toLocaleString()}?\n\n` +
                'This will overwrite your current game state!'
            );

            if (!confirm) {
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

    // Auto-start auto-save if authenticated
    if (cloudSave.isAuthenticated()) {
        // Start auto-save with default interval (30 minutes)
        cloudSave.startAutoSave(30);
    }

    console.log('[CloudSave] Module initialized');
    return cloudSave;
}