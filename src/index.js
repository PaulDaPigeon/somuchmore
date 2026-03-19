// Somuchmore - Userscript for Theresmore game - Main Entry Point
import { Somuchmore } from './features/somuchmore';
import { initTimeToCap } from './features/time-to-cap';
import { initUIMenu } from './features/ui-menu';

(function() {
    'use strict';

    console.log('[Somuchmore] Starting userscript...');

    // Initialize Somuchmore
    Somuchmore.init().then(success => {
        if (success) {
            console.log('[Somuchmore] Ready! Use window.Somuchmore or window.MainStore');

            // Initialize features
            setTimeout(() => {
                if (window.MainStore) {
                    initTimeToCap();
                    initUIMenu();
                }
            }, 500);
        }
    });

})();
