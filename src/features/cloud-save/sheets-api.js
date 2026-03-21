// Google Sheets API wrapper

import { GOOGLE_SHEETS_API } from './constants';

export class SheetsAPI {
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
