// Somuchmore UI Menu

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
            explainGameMechanics: true // Default: enabled
        };
    };

    const saveSettings = (settings) => {
        localStorage.setItem('somuchmore_settings', JSON.stringify(settings));
    };

    let settings = loadSettings();

    // Fire icon SVG from ant-design
    const fireIconSVG =
`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" role="presentation" class="icon">
    <path d="M737 438.6c-9.6 15.5-21.1 30.7-34.4 45.6a73.1 73.1 0 0 1-51 24.4 73.36 73.36 0 0 1-53.4-18.8 74.01 74.01 0 0 1-24.4-59.8c3-47.4-12.4-103.1-45.8-165.7-16.9-31.4-37.1-58.2-61.2-80.4a240 240 0 0 1-12.1 46.5 354.26 354.26 0 0 1-58.2 101 349.6 349.6 0 0 1-58.6 56.8c-34 26.1-62 60-80.8 97.9a275.96 275.96 0 0 0-29.1 124c0 74.9 29.5 145.3 83 198.4 53.7 53.2 125 82.4 201 82.4s147.3-29.2 201-82.4c53.5-53 83-123.5 83-198.4 0-39.2-8.1-77.3-24-113.1-9.3-21-21-40.5-35-58.4z"/>
    <path d="M834.1 469.2A347.49 347.49 0 0 0 751.2 354l-29.1-26.7a8.09 8.09 0 0 0-13 3.3l-13 37.3c-8.1 23.4-23 47.3-44.1 70.8-1.4 1.5-3 1.9-4.1 2-1.1.1-2.8-.1-4.3-1.5-1.4-1.2-2.1-3-2-4.8 3.7-60.2-14.3-128.1-53.7-202C555.3 171 510 123.1 453.4 89.7l-41.3-24.3c-5.4-3.2-12.3 1-12 7.3l2.2 48c1.5 32.8-2.3 61.8-11.3 85.9-11 29.5-26.8 56.9-47 81.5a295.64 295.64 0 0 1-47.5 46.1 352.6 352.6 0 0 0-100.3 121.5A347.75 347.75 0 0 0 160 610c0 47.2 9.3 92.9 27.7 136a349.4 349.4 0 0 0 75.5 110.9c32.4 32 70 57.2 111.9 74.7C418.5 949.8 464.5 959 512 959s93.5-9.2 136.9-27.3A348.6 348.6 0 0 0 760.8 857c32.4-32 57.8-69.4 75.5-110.9a344.2 344.2 0 0 0 27.7-136c0-48.8-10-96.2-29.9-140.9zM713 808.5c-53.7 53.2-125 82.4-201 82.4s-147.3-29.2-201-82.4c-53.5-53.1-83-123.5-83-198.4 0-43.5 9.8-85.2 29.1-124 18.8-37.9 46.8-71.8 80.8-97.9a349.6 349.6 0 0 0 58.6-56.8c25-30.5 44.6-64.5 58.2-101a240 240 0 0 0 12.1-46.5c24.1 22.2 44.3 49 61.2 80.4 33.4 62.6 48.8 118.3 45.8 165.7a74.01 74.01 0 0 0 24.4 59.8 73.36 73.36 0 0 0 53.4 18.8c19.7-1 37.8-9.7 51-24.4 13.3-14.9 24.8-30.1 34.4-45.6 14 17.9 25.7 37.4 35 58.4 15.9 35.8 24 73.9 24 113.1 0 74.9-29.5 145.4-83 198.4z"/>
</svg>`;

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
                }
            });
        });
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
