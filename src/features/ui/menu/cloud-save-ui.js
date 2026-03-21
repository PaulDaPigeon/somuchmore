// Cloud Save UI Handler
/* global unsafeWindow */

import { Dialog } from '../dialog';
import { createSaveItemInfo } from './templates';

const realWindow = typeof unsafeWindow !== 'undefined' ? unsafeWindow : window;

export function applySetting(enabled) {
    console.log('[Somuchmore] Cloud save auto-save:', enabled);
    if (realWindow.Somuchmore?.cloudSave) {
        if (enabled) {
            realWindow.Somuchmore.cloudSave.startAutoSave(30);
        } else {
            realWindow.Somuchmore.cloudSave.stopAutoSave();
        }
    }
}

export function showMessage(text, type = 'info') {
    const messageEl = document.getElementById('cloud-save-message');
    if (!messageEl) return;

    const colors = {
        success: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
        error: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200',
        info: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200',
        warning: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
    };

    messageEl.className = `mt-3 p-3 rounded-lg text-sm ${colors[type]}`;
    messageEl.textContent = text;
    messageEl.style.display = 'block';

    setTimeout(() => {
        messageEl.style.display = 'none';
    }, 5000);
}

export function updateUI() {
    const cloudSave = realWindow.Somuchmore?.cloudSave;
    if (!cloudSave) return;

    const statusEl = document.getElementById('cloud-save-status');
    const connectBtn = document.getElementById('cloud-save-connect-btn');
    const controlsEl = document.getElementById('cloud-save-controls');

    if (cloudSave.isAuthenticated()) {
        statusEl.textContent = 'Connected to Google Drive';
        statusEl.className = 'text-sm text-green-600 dark:text-green-400 mb-3';
        connectBtn.style.display = 'none';
        controlsEl.style.display = 'block';
    } else {
        statusEl.textContent = 'Not connected';
        statusEl.className = 'text-sm text-gray-600 dark:text-gray-400 mb-3';
        connectBtn.style.display = 'block';
        controlsEl.style.display = 'none';
    }
}

export function showSavesDialog(saves, cloudSave) {
    const existingDialog = document.getElementById('cloud-saves-list-dialog');
    if (existingDialog) {
        existingDialog.remove();
    }

    const dialog = document.createElement('div');
    dialog.id = 'cloud-saves-list-dialog';
    dialog.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50';

    const panel = document.createElement('div');
    panel.className = 'bg-white dark:bg-mydark-600 rounded-lg shadow-xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto';

    const title = document.createElement('h3');
    title.className = 'text-xl font-game mb-4 text-gray-800 dark:text-gray-200';
    title.textContent = 'Saved Games';

    const savesList = document.createElement('div');
    savesList.className = 'space-y-2 mb-4';

    saves.forEach(save => {
        const saveItem = document.createElement('div');
        saveItem.className = 'flex items-center justify-between p-3 bg-gray-100 dark:bg-mydark-500 rounded-lg';

        const saveInfo = document.createElement('div');
        const saveDate = new Date(save.timestamp);
        saveInfo.innerHTML = createSaveItemInfo(saveDate, save.version);

        const actions = document.createElement('div');
        actions.className = 'flex gap-2';

        const loadBtn = document.createElement('button');
        loadBtn.className = 'px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors';
        loadBtn.textContent = 'Load';
        loadBtn.addEventListener('click', async () => {
            try {
                await cloudSave.load(save);
            } catch (e) {
                Dialog.showMessage(
                    'Load Failed',
                    `Failed to load save: ${e.message}`,
                    'error'
                );
            }
        });

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors';
        deleteBtn.textContent = 'Delete';
        deleteBtn.addEventListener('click', async () => {
            const confirmed = await Dialog.showConfirm(
                'Delete Save',
                `Are you sure you want to delete the save from ${saveDate.toLocaleString()}?\n\nThis action cannot be undone.`,
                { confirmText: 'Delete', cancelText: 'Cancel', type: 'warning' }
            );

            if (confirmed) {
                try {
                    await cloudSave.deleteSave(save);
                    saveItem.remove();
                } catch (e) {
                    Dialog.showMessage(
                        'Delete Failed',
                        `Failed to delete save: ${e.message}`,
                        'error'
                    );
                }
            }
        });

        actions.appendChild(loadBtn);
        actions.appendChild(deleteBtn);
        saveItem.appendChild(saveInfo);
        saveItem.appendChild(actions);
        savesList.appendChild(saveItem);
    });

    const closeBtn = document.createElement('button');
    closeBtn.className = 'w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors';
    closeBtn.textContent = 'Close';
    closeBtn.addEventListener('click', () => dialog.remove());

    panel.appendChild(title);
    panel.appendChild(savesList);
    panel.appendChild(closeBtn);
    dialog.appendChild(panel);

    dialog.addEventListener('click', (e) => {
        if (e.target === dialog) {
            dialog.remove();
        }
    });

    document.body.appendChild(dialog);
}

export function setupHandlers() {
    const cloudSave = realWindow.Somuchmore?.cloudSave;
    if (!cloudSave) {
        console.warn('[Somuchmore] Cloud save not initialized');
        return;
    }

    // Update UI initially
    updateUI();

    // Expose update function so cloud-save.js can call it after OAuth completes
    realWindow.Somuchmore._cloudSaveUpdateUI = updateUI;

    // Connect button
    const connectBtn = document.getElementById('cloud-save-connect-btn');
    connectBtn?.addEventListener('click', async () => {
        try {
            // Will navigate away to Google OAuth
            await cloudSave.authenticate();
        } catch (e) {
            console.error('[CloudSave] Connection failed:', e);
            showMessage('Failed to connect: ' + e.message, 'error');
        }
    });

    // Disconnect button
    const disconnectBtn = document.getElementById('cloud-save-disconnect-btn');
    disconnectBtn?.addEventListener('click', async () => {
        const confirmed = await Dialog.showConfirm(
            'Disconnect Cloud Save',
            'Are you sure you want to disconnect cloud save? Your saves will remain in Google Drive, but you will need to reconnect to access them.',
            { confirmText: 'Disconnect', cancelText: 'Cancel', type: 'warning' }
        );

        if (confirmed) {
            cloudSave.disconnect();
            updateUI();
            showMessage('Disconnected from Google Drive', 'info');
        }
    });

    // Save button
    const saveBtn = document.getElementById('cloud-save-save-btn');
    saveBtn?.addEventListener('click', async () => {
        try {
            saveBtn.disabled = true;
            saveBtn.textContent = 'Saving...';
            await cloudSave.save();
            showMessage('Game saved successfully!', 'success');
        } catch (e) {
            console.error('[CloudSave] Save failed:', e);
            if (e.message === 'QUOTA_EXCEEDED') {
                showMessage('Google API quota exceeded. Please try again later.', 'warning');
            } else {
                showMessage('Failed to save: ' + e.message, 'error');
            }
        } finally {
            saveBtn.disabled = false;
            saveBtn.textContent = 'Save Now';
        }
    });

    // List/Load button
    const listBtn = document.getElementById('cloud-save-list-btn');
    listBtn?.addEventListener('click', async () => {
        try {
            listBtn.disabled = true;
            listBtn.textContent = 'Loading...';

            const saves = await cloudSave.listSaves();

            if (saves.length === 0) {
                showMessage('No saves found', 'info');
                return;
            }

            // Create saves list dialog
            showSavesDialog(saves, cloudSave);
        } catch (e) {
            console.error('[CloudSave] Failed to list saves:', e);
            showMessage('Failed to load saves: ' + e.message, 'error');
        } finally {
            listBtn.disabled = false;
            listBtn.textContent = 'View Saves';
        }
    });
}
