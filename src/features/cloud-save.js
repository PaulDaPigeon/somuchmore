// Cloud Save Module - OAuth2 with PKCE for Google Sheets API

import { Dialog } from './dialog';
import secretKeyPNG from '../assets/images/key.png';

const GOOGLE_CLIENT_ID = '220592312923-7rasv9q1ammcvab6uasnpnbdco83mnl4.apps.googleusercontent.com';
const GOOGLE_SHEETS_API = 'https://sheets.googleapis.com/v4/spreadsheets';
const SCOPES = 'https://www.googleapis.com/auth/drive.file';
const REDIRECT_URI = 'https://www.theresmoregame.com/play/';

let GOOGLE_CLIENT_SECRET = null;
let secretDecodePromise = null;

const decodeSecret = () => {
    if (secretDecodePromise) return secretDecodePromise;

    secretDecodePromise = new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            try {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                const imageData = ctx.getImageData(0, 0, img.width, img.height);
                const pixels = imageData.data;

                let secret = '';
                for (let i = 0; i < pixels.length; i += 4) {
                    const r = pixels[i];
                    if (r === 0 || r === 255) break; // Stop at null or padding
                    secret += String.fromCharCode(r);
                }

                GOOGLE_CLIENT_SECRET = secret;
                console.log('[CloudSave] Secret decoded successfully');
                resolve(secret);
            } catch (e) {
                console.error('[CloudSave] Failed to decode secret:', e);
                reject(e);
            }
        };
        img.onerror = (e) => {
            console.error('[CloudSave] Failed to load secret image:', e);
            reject(new Error('Failed to load secret image'));
        };
        img.src = secretKeyPNG;
    });

    return secretDecodePromise;
};

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
        GM_setValue('cloud_save_auth_pending', 'true');

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

        // Navigate to auth page (will redirect back with code)
        window.location.href = authUrl;
    }

    async exchangeCode(code, codeVerifier) {
        // Ensure secret is decoded
        await decodeSecret();

        const params = new URLSearchParams({
            client_id: GOOGLE_CLIENT_ID,
            code: code,
            code_verifier: codeVerifier,
            grant_type: 'authorization_code',
            redirect_uri: REDIRECT_URI
        });

        // Add client_secret (required for Web app clients)
        params.set('client_secret', GOOGLE_CLIENT_SECRET);

        const response = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: params.toString()
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('[CloudSave] Token exchange failed:', errorData);
            throw new Error(`Token exchange failed: ${response.status} - ${errorData.error}: ${errorData.error_description || ''}`);
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

        // Ensure secret is decoded
        await decodeSecret();

        const params = new URLSearchParams({
            client_id: GOOGLE_CLIENT_ID,
            refresh_token: this.refreshToken,
            grant_type: 'refresh_token',
            client_secret: GOOGLE_CLIENT_SECRET
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
export async function initCloudSave() {
    const cloudSave = new CloudSave();

    // Expose to window for UI access
    window.somuchmoreCloudSave = cloudSave;

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
                    if (window.somuchmoreCloudSaveUpdateUI) {
                        window.somuchmoreCloudSaveUpdateUI();
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