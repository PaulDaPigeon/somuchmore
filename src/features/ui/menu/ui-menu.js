// Somuchmore UI Menu
/* global unsafeWindow */

import fireIconSVG from '../../../assets/icons/fire.svg';
import cloudIconSVG from '../../../assets/icons/cloud.svg';
import { createCloseButton, createContentArea } from './templates';
import * as TimeToCapUI from './time-to-cap-ui';
import * as GroupUnitsUI from './group-units-ui';
import * as GameMechanicsUI from './game-mechanics-ui';
import * as CloudSaveUI from './cloud-save-ui';
import * as AutoClickerUI from './auto-clicker-ui';

const realWindow = typeof unsafeWindow !== 'undefined' ? unsafeWindow : window;

export function initUIMenu() {
    if (!realWindow.Somuchmore?.MainStore) {
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
            cloudSaveAutoSave: false, // Default: disabled
            autoClickerEnabled: false, // Default: disabled
            autoClickerInterval: 100 // Default: 100ms
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

        const parentContainer = document.querySelector('header div.w-2\\/3.lg\\:w-1\\/4');
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
        closeBtn.innerHTML = createCloseButton();
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
        contentArea.innerHTML = createContentArea(settings, cloudIconSVG);

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
                    TimeToCapUI.applySetting(settings[settingName]);
                } else if (settingName === 'groupUnitsByClass') {
                    GroupUnitsUI.applySetting(settings[settingName]);
                } else if (settingName === 'explainGameMechanics') {
                    GameMechanicsUI.applySetting(settings[settingName]);
                } else if (settingName === 'cloudSaveAutoSave') {
                    CloudSaveUI.applySetting(settings[settingName]);
                } else if (settingName === 'autoClickerEnabled') {
                    // Toggle visibility of options
                    const optionsEl = contentArea.querySelector('#autoclicker-options');
                    if (optionsEl) {
                        optionsEl.style.display = settings[settingName] ? 'block' : 'none';
                    }
                    AutoClickerUI.applySetting(settings[settingName]);
                }
            });
        });

        // Setup interval input handler
        const intervalInput = contentArea.querySelector('#autoclicker-interval');
        if (intervalInput) {
            intervalInput.addEventListener('change', () => {
                const value = parseInt(intervalInput.value);
                if (value >= 50 && value <= 5000) {
                    settings.autoClickerInterval = value;
                    saveSettings(settings);
                    // Restart auto-clicker with new interval if enabled
                    if (settings.autoClickerEnabled) {
                        AutoClickerUI.applySetting(true);
                    }
                }
            });
        }

        // Setup cloud save event listeners
        CloudSaveUI.setupHandlers();
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
            TimeToCapUI.applySetting(settings.timeToCapEnabled);
            GroupUnitsUI.applySetting(settings.groupUnitsByClass);
            GameMechanicsUI.applySetting(settings.explainGameMechanics);
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

    // Expose settings for other modules under Somuchmore
    realWindow.Somuchmore = realWindow.Somuchmore || {};
    realWindow.Somuchmore.settings = {
        get: () => settings,
        isTimeToCapEnabled: () => settings.timeToCapEnabled,
        isGroupUnitsByClass: () => settings.groupUnitsByClass
    };

    return true;
}
