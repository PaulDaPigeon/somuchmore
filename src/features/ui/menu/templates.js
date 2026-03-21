// UI Menu HTML Templates

export function createCloseButton() {
    return `
        <button type="button" class="somuchmore_close-btn text-gray-400 hover:text-gray-500">
            <span class="sr-only">Close</span>
            <svg viewBox="0 0 24 24" role="presentation" class="h-6 w-6" aria-hidden="true">
                <path d="M13.46,12L19,17.54V19H17.54L12,13.46L6.46,19H5V17.54L10.54,12L5,6.46V5H6.46L12,10.54L17.54,5H19V6.46L13.46,12Z" style="fill: currentcolor;"></path>
            </svg>
        </button>
    `;
}

export function createContentArea(settings, cloudIconSVG) {
    return `
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
}

export function createSaveItemInfo(saveDate, version) {
    return `
        <div class="text-sm font-medium text-gray-800 dark:text-gray-200">${saveDate.toLocaleString()}</div>
        <div class="text-xs text-gray-600 dark:text-gray-400">Version: ${version}</div>
    `;
}
