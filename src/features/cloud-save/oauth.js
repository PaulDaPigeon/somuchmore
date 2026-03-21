// OAuth2 PKCE implementation

import { GOOGLE_CLIENT_ID, REDIRECT_URI, SCOPES } from './constants';
import { decodeSecret, getClientSecret } from './secret-decoder';
import { generateRandomString, sha256, base64UrlEncode } from './pkce';

export class OAuth2PKCE {
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
        params.set('client_secret', getClientSecret());

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
            client_secret: getClientSecret()
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
