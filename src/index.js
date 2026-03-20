// Somuchmore - Userscript for Theresmore game - Main Entry Point
import { Somuchmore } from './features/somuchmore';
import { initTimeToCap } from './features/time-to-cap';
import { initUIMenu } from './features/ui-menu';
import { intiGroupUnits } from './features/group-units';
import { initGameMechanicsDisplay } from './features/game-mechanics';
import { initCloudSave } from './features/cloud-save';
import { Debug, initGameData } from './core/game-data';

(function() {
    'use strict';

    console.log('[Somuchmore] Starting userscript...');

    // Initialize Somuchmore
    Somuchmore.init().then(success => {
        if (success) {
            console.log('[Somuchmore] Ready! Use window.Somuchmore or window.MainStore');

            // Expose debug helper
            window.somuchmoreDebug = Debug;

            // Initialize features
            setTimeout(async () => {
                if (window.MainStore) {
                    // Preload game data definitions
                    await initGameData();

                    // Initialize features
                    initTimeToCap();
                    await initCloudSave();
                    initUIMenu();
                    intiGroupUnits();
                    initGameMechanicsDisplay();
                }
            }, 500);
        }
    });

})();
