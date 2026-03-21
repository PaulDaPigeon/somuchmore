// CloudSave Controller - Main business logic

import { Dialog } from '../ui/dialog';
import { OAuth2PKCE } from './oauth';
import { SheetsAPI } from './sheets-api';

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
        if (!window.Somuchmore?.MainStore) {
            throw new Error('MainStore not available');
        }

        // Get somuchmore settings
        const settings = window.Somuchmore?.settings?.get() || {};

        // Serialize MainStore data
        const gameData = {
            resources: window.Somuchmore?.MainStore.resources,
            buildings: window.Somuchmore?.MainStore.buildings,
            technologies: window.Somuchmore?.MainStore.technologies,
            army: window.Somuchmore?.MainStore.army,
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
            if (window.Somuchmore?.MainStore && saveData.data) {
                Object.assign(window.Somuchmore?.MainStore, saveData.data);
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
