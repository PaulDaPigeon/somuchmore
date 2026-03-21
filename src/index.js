// Somuchmore - Userscript for Theresmore game - Main Entry Point
import { Somuchmore } from './features/somuchmore';
import { initTimeToCap } from './features/time-to-cap';
import { initUIMenu } from './features/ui/menu/ui-menu';
import { initGroupUnits } from './features/group-units';
import { initGameMechanicsDisplay } from './features/game-mechanics/game-mechanics';
import { initCloudSave } from './features/cloud-save/cloud-save';
import { initAutoClicker } from './features/auto-clicker';
import { Debug, initGameData } from './core/game-data';

(function() {
    'use strict';

    console.log('[Somuchmore] Starting userscript...');

    // Initialize Somuchmore
    Somuchmore.init().then(success => {
        if (success) {
            console.log('[Somuchmore] Ready! Use window.Somuchmore');

            // Expose debug helper under Somuchmore
            window.Somuchmore.debug = Debug;

            // Initialize features
            setTimeout(async () => {
                if (window.Somuchmore?.MainStore) {
                    // Preload game data definitions
                    await initGameData();

                    // Initialize features
                    initTimeToCap();
                    initAutoClicker();
                    await initCloudSave();
                    initUIMenu();
                    initGroupUnits();
                    initGameMechanicsDisplay();
                }
            }, 500);
        }
    });

})();
