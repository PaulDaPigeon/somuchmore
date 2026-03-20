const path = require('path');

// Read package.json for version
const packageJson = require('./package.json');

// Userscript header
const userscriptHeader = `// ==UserScript==
// @name         Somuchmore
// @namespace    https://tampermonkey.net/
// @version      ${packageJson.version}
// @description  ${packageJson.description}
// @author       ${packageJson.author}
// @match        https://www.theresmoregame.com/play/*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_deleteValue
// @run-at       document-idle
// ==/UserScript==

`;

class UserscriptHeaderPlugin {
    apply(compiler) {
        compiler.hooks.emit.tapAsync('UserscriptHeaderPlugin', (compilation, callback) => {
            // Get the output filename
            const mainAsset = compilation.assets['somuchmore.user.js'];
            if (mainAsset) {
                const source = mainAsset.source();
                const newSource = userscriptHeader + source;

                compilation.assets['somuchmore.user.js'] = {
                    source: () => newSource,
                    size: () => newSource.length
                };
            }
            callback();
        });
    }
}

module.exports = {
    entry: './src/index.js',
    output: {
        filename: 'somuchmore.user.js',
        path: path.resolve(__dirname, 'dist'),
        clean: true,
    },
    mode: 'production',
    module: {
        rules: [
            {
                test: /\.svg$/,
                use: 'raw-loader'
            },
            {
                test: /\.(png|jpg|jpeg|gif)$/,
                type: 'asset/inline'
            }
        ]
    },
    optimization: {
        minimize: false, // Don't minify for easier debugging
    },
    plugins: [
        new UserscriptHeaderPlugin()
    ],
    devtool: false, // No source maps for userscripts
    stats: {
        colors: true,
        timings: true,
        builtAt: true,
    },
    infrastructureLogging: {
        level: 'info',
    },
};
