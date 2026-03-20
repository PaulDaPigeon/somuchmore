// Somuchmore UI Menu

import { Dialog } from './dialog';
import fireIconSVG from '../assets/icons/fire.svg';
import cloudIconSVG from '../assets/icons/cloud.svg';

export function initUIMenu() {
    if (!window.MainStore) {
        console.error('[Somuchmore] MainStore not available');
        return false;
    }

    // Load settings from localStorage
    const loadSettings = () => {
        const settings = localStorage.getItem('somuchmore_settings');
        if (settings) {
            return JSON.parse(settings);
        }
        return {
            timeToCapEnabled: true, // Default: enabled
            groupUnitsByClass: true, // Default: enabled
            explainGameMechanics: true, // Default: enabled
            cloudSaveAutoSave: false // Default: disabled
        };
    };

    const saveSettings = (settings) => {
        localStorage.setItem('somuchmore_settings', JSON.stringify(settings));
    };

    let settings = loadSettings();

    let menuOpen = false;

    // Create menu icon button
    function createMenuIcon() {
        if (document.querySelector('.somuchmore_menu-icon')) {
            return false;
        }

        const parentContainer = document.querySelector('header div.w-2\\/3.lg\\:w-1\\/4:nth-last-child(2)');
        if (!parentContainer) {
            console.warn('[Somuchmore] Icon container not found, retrying...');
            return false;
        }

        const iconButton = document.createElement('button');
        iconButton.type = 'button';
        iconButton.className = 'somuchmore_menu-icon py-1.5 px-3 transition-all duration-200';
        iconButton.innerHTML = fireIconSVG;
        iconButton.title = 'Somuchmore';

        // Get both paths: first is fill, second is outline
        const paths = iconButton.querySelectorAll('svg path');
        const fillPath = paths[0];
        const outlinePath = paths[1];

        // Set default: outline only (no fill)
        if (fillPath) {
            fillPath.style.fill = 'none';
        }
        if (outlinePath) {
            outlinePath.style.fill = 'deeppink';
        }

        // Add hover effect: fill + outline + glow
        iconButton.addEventListener('mouseenter', () => {
            iconButton.style.filter = 'drop-shadow(0 0 8px deeppink) drop-shadow(0 0 12px deeppink)';
            if (fillPath) {
                fillPath.style.fill = 'deeppink';
            }
        });

        iconButton.addEventListener('mouseleave', () => {
            iconButton.style.filter = '';
            if (fillPath) {
                fillPath.style.fill = 'none';
            }
        });

        iconButton.addEventListener('click', toggleMenu);

        parentContainer.appendChild(iconButton);
        return true;
    }

    // Create sidebar overlay
    function createSidebar() {
        if (document.querySelector('.somuchmore_dialog')) return;

        // Create dialog container
        const dialog = document.createElement('div');
        dialog.className = 'somuchmore_dialog relative z-50';
        dialog.role = 'dialog';
        dialog.setAttribute('aria-modal', 'true');
        dialog.style.display = 'none';

        // Create backdrop
        const backdrop = document.createElement('div');
        backdrop.className = 'somuchmore_backdrop fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-60 transition-opacity';
        backdrop.addEventListener('click', toggleMenu);

        // Create fixed container
        const container = document.createElement('div');
        container.className = 'fixed z-10 inset-0 pointer-events-none';

        // Create flex wrapper
        const wrapper = document.createElement('div');
        wrapper.className = 'flex items-center justify-end min-h-full text-center pointer-events-none';

        // Create panel
        const panel = document.createElement('div');
        panel.className = 'somuchmore_panel relative bg-gray-100 dark:bg-mydark-600 px-4 py-5 text-left overflow-hidden shadow-xl transform transition-all h-screen lg:max-w-sm lg:w-full lg:p-6 pointer-events-auto';

        // Close button
        const closeBtn = document.createElement('div');
        closeBtn.className = 'absolute top-0 right-0 z-20 pt-4 pr-4';
        closeBtn.innerHTML = `
            <button type="button" class="somuchmore_close-btn text-gray-400 hover:text-gray-500">
                <span class="sr-only">Close</span>
                <svg viewBox="0 0 24 24" role="presentation" class="h-6 w-6" aria-hidden="true">
                    <path d="M13.46,12L19,17.54V19H17.54L12,13.46L6.46,19H5V17.54L10.54,12L5,6.46V5H6.46L12,10.54L17.54,5H19V6.46L13.46,12Z" style="fill: currentcolor;"></path>
                </svg>
            </button>
        `;
        closeBtn.querySelector('button').addEventListener('click', toggleMenu);

        // Content wrapper
        const contentWrapper = document.createElement('div');
        contentWrapper.className = 'lg:flex lg:items-start';

        const contentInner = document.createElement('div');
        contentInner.className = 'w-full';

        // Title
        const title = document.createElement('h3');
        title.className = 'text-2xl leading-6 font-game';
        title.textContent = 'Somuchmore';

        // Scrollable content area
        const scrollArea = document.createElement('div');
        scrollArea.className = 'mt-5 overflow-y-auto';

        const contentArea = document.createElement('div');
        contentArea.className = 'relative flex flex-col px-2 pb-5 bg-logo h-[calc(100vh-100px)] space-y-4';
        contentArea.innerHTML = `
            <div class="bg-white dark:bg-mydark-500 rounded-xl p-5 shadow-lg border border-gray-200 dark:border-mydark-300">
                <h4 class="font-game mb-4 text-gray-800 dark:text-gray-200 flex items-center">
                    <svg viewBox="0 0 24 24" role="presentation" class="icon mr-2 w-5 h-5" style="color: deeppink;">
                        <path d="M17.45,15.18L22,7.31V19L22,21H2V3H4V15.54L9.5,6L16,9.78L20.24,2.45L21.97,3.45L16.74,12.5L10.23,8.75L4.31,19H6.57L10.96,11.44L17.45,15.18Z" style="fill: currentcolor;"></path>
                    </svg>
                    Resources
                </h4>
                <div class="space-y-1">
                    <div class="flex items-center justify-between py-2 px-3 bg-gray-50 dark:bg-mydark-600 rounded-lg">
                        <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Display time to cap</span>
                        <button class="somuchmore_toggle ${settings.timeToCapEnabled ? '' : 'bg-gray-200 dark:bg-gray-700'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none" style="background-color: ${settings.timeToCapEnabled ? 'deeppink' : ''}" role="switch" type="button" tabindex="0" aria-checked="${settings.timeToCapEnabled}" data-setting="timeToCapEnabled">
                            <span class="${settings.timeToCapEnabled ? 'translate-x-5' : 'translate-x-0'} pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"></span>
                        </button>
                    </div>
                </div>
            </div>
            <div class="bg-white dark:bg-mydark-500 rounded-xl p-5 shadow-lg border border-gray-200 dark:border-mydark-300">
                <h4 class="font-game mb-4 text-gray-800 dark:text-gray-200 flex items-center">
                    <svg viewBox="0 0 24 24" role="presentation" class="icon mr-2 w-5 h-5" style="color: deeppink;">
                        <path d="M6.2,2.44L18.1,14.34L20.22,12.22L21.63,13.63L19.16,16.1L22.34,19.28C22.73,19.67 22.73,20.3 22.34,20.69L21.63,21.4C21.24,21.79 20.61,21.79 20.22,21.4L17,18.23L14.56,20.7L13.15,19.29L15.27,17.17L3.37,5.27V2.44H6.2M15.89,10L20.63,5.26V2.44H17.8L13.06,7.18L15.89,10M10.94,15L8.11,12.13L5.9,14.34L3.78,12.22L2.37,13.63L4.84,16.1L1.66,19.29C1.27,19.68 1.27,20.31 1.66,20.7L2.37,21.41C2.76,21.8 3.39,21.8 3.78,21.41L7,18.23L9.44,20.7L10.85,19.29L8.73,17.17L10.94,15Z" style="fill: currentcolor;"></path>
                    </svg>
                    Army
                </h4>
                <div class="space-y-1">
                    <div class="flex items-center justify-between py-2 px-3 bg-gray-50 dark:bg-mydark-600 rounded-lg">
                        <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Group units by class</span>
                        <button class="somuchmore_toggle ${settings.groupUnitsByClass ? '' : 'bg-gray-200 dark:bg-gray-700'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none" style="background-color: ${settings.groupUnitsByClass ? 'deeppink' : ''}" role="switch" type="button" tabindex="0" aria-checked="${settings.groupUnitsByClass}" data-setting="groupUnitsByClass">
                            <span class="${settings.groupUnitsByClass ? 'translate-x-5' : 'translate-x-0'} pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"></span>
                        </button>
                    </div>
                    <div class="flex items-center justify-between py-2 px-3 bg-gray-50 dark:bg-mydark-600 rounded-lg">
                        <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Explain game mechanics</span>
                        <button class="somuchmore_toggle ${settings.explainGameMechanics ? '' : 'bg-gray-200 dark:bg-gray-700'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none" style="background-color: ${settings.explainGameMechanics ? 'deeppink' : ''}" role="switch" type="button" tabindex="0" aria-checked="${settings.explainGameMechanics}" data-setting="explainGameMechanics">
                            <span class="${settings.explainGameMechanics ? 'translate-x-5' : 'translate-x-0'} pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"></span>
                        </button>
                    </div>
                </div>
            </div>
            <div class="bg-white dark:bg-mydark-500 rounded-xl p-5 shadow-lg border border-gray-200 dark:border-mydark-300">
                <h4 class="font-game mb-4 text-gray-800 dark:text-gray-200 flex items-center">
                    <span class="icon mr-2 w-5 h-5" style="color: deeppink; display: inline-flex;">${cloudIconSVG}</span>
                    Cloud Save
                </h4>
                <div class="space-y-3" id="somuchmore-cloud-save-section">
                    <div class="text-center py-2">
                        <p class="text-sm text-gray-600 dark:text-gray-400 mb-3" id="cloud-save-status">Not connected</p>
                        <button class="w-full px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white text-sm font-medium rounded-lg transition-colors border-0 cursor-pointer" style="background-color: deeppink; color: white;" id="cloud-save-connect-btn">
                            Connect Google Account
                        </button>
                    </div>
                    <div id="cloud-save-controls" style="display: none;">
                        <div class="space-y-2">
                            <div class="flex gap-2">
                                <button class="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors" id="cloud-save-save-btn">
                                    Save Now
                                </button>
                                <button class="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors" id="cloud-save-list-btn">
                                    View Saves
                                </button>
                            </div>
                            <div class="flex items-center justify-between py-2 px-3 bg-gray-50 dark:bg-mydark-600 rounded-lg">
                                <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Auto-save (30 min)</span>
                                <button class="somuchmore_toggle ${settings.cloudSaveAutoSave ? '' : 'bg-gray-200 dark:bg-gray-700'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none" style="background-color: ${settings.cloudSaveAutoSave ? 'deeppink' : ''}" role="switch" type="button" tabindex="0" aria-checked="${settings.cloudSaveAutoSave}" data-setting="cloudSaveAutoSave">
                                    <span class="${settings.cloudSaveAutoSave ? 'translate-x-5' : 'translate-x-0'} pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"></span>
                                </button>
                            </div>
                            <button class="w-full px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors" id="cloud-save-disconnect-btn">
                                Disconnect
                            </button>
                        </div>
                        <div id="cloud-save-message" class="mt-3 p-3 rounded-lg text-sm" style="display: none;"></div>
                    </div>
                </div>
            </div>
        `;

        scrollArea.appendChild(contentArea);
        contentInner.appendChild(title);
        contentInner.appendChild(scrollArea);
        contentWrapper.appendChild(contentInner);
        panel.appendChild(closeBtn);
        panel.appendChild(contentWrapper);
        wrapper.appendChild(panel);
        container.appendChild(wrapper);
        dialog.appendChild(backdrop);
        dialog.appendChild(container);

        document.body.appendChild(dialog);

        // Setup toggle event listeners
        const toggleButtons = contentArea.querySelectorAll('.somuchmore_toggle');
        toggleButtons.forEach(toggleButton => {
            toggleButton.addEventListener('click', () => {
                const settingName = toggleButton.getAttribute('data-setting');
                settings[settingName] = !settings[settingName];
                saveSettings(settings);

                // Update toggle UI
                const span = toggleButton.querySelector('span');
                if (settings[settingName]) {
                    toggleButton.style.backgroundColor = 'deeppink';
                    toggleButton.classList.remove('bg-gray-200', 'dark:bg-gray-700');
                    toggleButton.setAttribute('aria-checked', 'true');
                    span.classList.remove('translate-x-0');
                    span.classList.add('translate-x-5');
                } else {
                    toggleButton.style.backgroundColor = '';
                    toggleButton.classList.add('bg-gray-200', 'dark:bg-gray-700');
                    toggleButton.setAttribute('aria-checked', 'false');
                    span.classList.remove('translate-x-5');
                    span.classList.add('translate-x-0');
                }

                // Apply setting
                if (settingName === 'timeToCapEnabled') {
                    applyTimeToCapSetting(settings[settingName]);
                } else if (settingName === 'groupUnitsByClass') {
                    applyGroupUnitsSetting(settings[settingName]);
                } else if (settingName === 'explainGameMechanics') {
                    applyGameMechanicsSetting(settings[settingName]);
                } else if (settingName === 'cloudSaveAutoSave') {
                    applyCloudSaveAutoSave(settings[settingName]);
                }
            });
        });

        // Setup cloud save event listeners
        setupCloudSaveHandlers();
    }

    // Apply time to cap setting
    function applyTimeToCapSetting(enabled) {
        const cells = document.querySelectorAll('.somuchmore_ttc');
        cells.forEach(cell => {
            cell.style.display = enabled ? '' : 'none';
        });
    }

    // Apply group units setting
    function applyGroupUnitsSetting(enabled) {
        console.log('[Somuchmore] Group units:', enabled);
        if (window.somuchmoreGroupArmy) {
            window.somuchmoreGroupArmy.apply(enabled);
        }
    }

    // Apply game mechanics setting
    function applyGameMechanicsSetting(enabled) {
        console.log('[Somuchmore] Explain game mechanics:', enabled);

        // Apply to grouped view (if active)
        if (window.somuchmoreGroupArmy) {
            window.somuchmoreGroupArmy.applyGameMechanics(enabled);
        }

        // Apply to standalone display (if active)
        if (window.somuchmoreGameMechanics) {
            window.somuchmoreGameMechanics.apply(enabled);
        }
    }

    // Apply cloud save auto-save setting
    function applyCloudSaveAutoSave(enabled) {
        console.log('[Somuchmore] Cloud save auto-save:', enabled);
        if (window.somuchmoreCloudSave) {
            if (enabled) {
                window.somuchmoreCloudSave.startAutoSave(30);
            } else {
                window.somuchmoreCloudSave.stopAutoSave();
            }
        }
    }

    // Show cloud save message
    function showCloudSaveMessage(text, type = 'info') {
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

    // Update cloud save UI based on auth status
    function updateCloudSaveUI() {
        const cloudSave = window.somuchmoreCloudSave;
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

    // Setup cloud save handlers
    function setupCloudSaveHandlers() {
        const cloudSave = window.somuchmoreCloudSave;
        if (!cloudSave) {
            console.warn('[Somuchmore] Cloud save not initialized');
            return;
        }

        // Update UI initially
        updateCloudSaveUI();

        // Expose update function so cloud-save.js can call it after OAuth completes
        window.somuchmoreCloudSaveUpdateUI = updateCloudSaveUI;

        // Connect button
        const connectBtn = document.getElementById('cloud-save-connect-btn');
        connectBtn?.addEventListener('click', async () => {
            try {
                // Will navigate away to Google OAuth
                await cloudSave.authenticate();
            } catch (e) {
                console.error('[CloudSave] Connection failed:', e);
                showCloudSaveMessage('Failed to connect: ' + e.message, 'error');
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
                updateCloudSaveUI();
                showCloudSaveMessage('Disconnected from Google Drive', 'info');
            }
        });

        // Save button
        const saveBtn = document.getElementById('cloud-save-save-btn');
        saveBtn?.addEventListener('click', async () => {
            try {
                saveBtn.disabled = true;
                saveBtn.textContent = 'Saving...';
                await cloudSave.save();
                showCloudSaveMessage('Game saved successfully!', 'success');
            } catch (e) {
                console.error('[CloudSave] Save failed:', e);
                if (e.message === 'QUOTA_EXCEEDED') {
                    showCloudSaveMessage('Google API quota exceeded. Please try again later.', 'warning');
                } else {
                    showCloudSaveMessage('Failed to save: ' + e.message, 'error');
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
                    showCloudSaveMessage('No saves found', 'info');
                    return;
                }

                // Create saves list dialog
                showSavesDialog(saves, cloudSave);
            } catch (e) {
                console.error('[CloudSave] Failed to list saves:', e);
                showCloudSaveMessage('Failed to load saves: ' + e.message, 'error');
            } finally {
                listBtn.disabled = false;
                listBtn.textContent = 'View Saves';
            }
        });
    }

    // Show saves list dialog
    function showSavesDialog(saves, cloudSave) {
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
            saveInfo.innerHTML = `
                <div class="text-sm font-medium text-gray-800 dark:text-gray-200">${saveDate.toLocaleString()}</div>
                <div class="text-xs text-gray-600 dark:text-gray-400">Version: ${save.version}</div>
            `;

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

    // Toggle menu open/close
    function toggleMenu() {
        menuOpen = !menuOpen;
        const dialog = document.querySelector('.somuchmore_dialog');

        if (menuOpen) {
            dialog.style.display = 'block';
        } else {
            dialog.style.display = 'none';
        }
    }

    // Setup
    function setup() {
        if (!createMenuIcon()) return false;
        createSidebar();

        // Apply initial settings
        setTimeout(() => {
            applyTimeToCapSetting(settings.timeToCapEnabled);
            applyGroupUnitsSetting(settings.groupUnitsByClass);
            applyGameMechanicsSetting(settings.explainGameMechanics);
        }, 1000);

        return true;
    }

    // Try to setup with retries
    let attempts = 0;
    function trySetup() {
        attempts++;
        const success = setup();

        if (!success && attempts < 15) {
            setTimeout(trySetup, 1000);
        }
    }

    trySetup();

    // Expose settings for other modules
    window.somuchmoreSettings = {
        get: () => settings,
        isTimeToCapEnabled: () => settings.timeToCapEnabled,
        isGroupUnitsByClass: () => settings.groupUnitsByClass
    };

    return true;
}
