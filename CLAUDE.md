# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Somuchmore is a **Tampermonkey userscript** that adds quality-of-life enhancements to the Theresmore web game (https://www.theresmoregame.com/play/). The script injects features into the running game by accessing its internal state through `window.MainStore`.

## Build Commands

```bash
# Development (watch mode with auto-rebuild)
npm run dev

# Production build
npm run build

# Output: dist/somuchmore.user.js
```

The build uses webpack with a custom plugin that injects Tampermonkey metadata headers into the output. The userscript header (version, @match, @grant directives) is generated from package.json.

## Core Architecture

### 1. MainStore Detection and Initialization

The entire userscript depends on finding the game's internal state object (`MainStore`). This happens in three stages:

1. **Store Detection** (`src/core/store-detector.js`): Searches for MainStore in React fiber tree or window object
2. **Somuchmore Init** (`src/features/somuchmore.js`): Wraps the store and exposes helper methods
3. **Feature Init** (`src/index.js`): Initializes all features after MainStore is available

The initialization sequence in `src/index.js`:
```javascript
Somuchmore.init() → initGameData() → [features initialize]
```

**Critical**: All features must wait for `window.MainStore` to be available before operating. Features use retry loops with MutationObserver to handle delayed DOM rendering.

### 2. Game Data Abstraction Layer

`src/core/game-data.js` provides a stable API to access game state, hiding MainStore's internal structure:

- **Resources**: `getValue()`, `getCap()`, `getIncome()` - for resource tracking
- **Army**: `getCount()`, `getClass()`, `getAllIdsFromDisplayName()` - for unit management
- **Buildings**, **Techs**: Basic getters for game entities

**Important patterns**:
- Unit definitions (category, cap) are scraped from the game's bundled JavaScript on init
- Unit translations (display name → ID) are also scraped to handle dynamic content
- The abstraction layer allows features to survive game updates that change MainStore internals

### 3. Feature Structure

Each feature follows this pattern:

```javascript
export function initFeature() {
    // 1. Check MainStore availability
    if (!window.MainStore) return false;

    // 2. Load/define settings
    const settings = loadSettings();

    // 3. Setup DOM manipulation/event listeners
    function setup() {
        // Find elements, inject UI, start loops
    }

    // 4. Retry mechanism for delayed DOM
    function trySetup() {
        const success = setup();
        if (!success && attempts < 15) {
            setTimeout(trySetup, 1000);
        }
    }

    // 5. MutationObserver to reapply on DOM changes
    const observer = new MutationObserver(...)

    // 6. Expose API for settings updates
    window.somuchmoreFeatureName = {
        apply: (settings) => {...}
    };

    return true;
}
```

**Key conventions**:
- Features retry setup up to 15 times (game tabs load asynchronously)
- MutationObserver watches for DOM changes (React re-renders destroy injected elements)
- Settings are stored in `localStorage` under `somuchmore_settings`
- Features expose `window.somuchmore*` APIs for integration with the UI menu

### 4. Settings System

Settings flow:
1. **Storage**: All settings in single `localStorage` key: `somuchmore_settings`
2. **UI Menu** (`src/features/ui-menu.js`): Sidebar with toggles/inputs
3. **Apply Functions**: Each feature exposes `apply(settings)` via `window.somuchmore*`
4. **Real-time Updates**: UI menu calls apply functions when settings change

To add a new setting:
1. Add default value in `ui-menu.js` `loadSettings()`
2. Add UI control in `contentArea.innerHTML`
3. Add event handler logic in toggle/input listeners
4. Create `applyFeatureSettings()` function that calls `window.somuchmoreFeature.apply()`
5. Feature exposes `window.somuchmoreFeature = { apply: ... }`

### 5. DOM Integration Patterns

Features inject into the game's Tailwind-styled UI:

**Finding elements**: Use specific selectors (classes, attributes, text content) because the game's React structure changes frequently.

**Injecting elements**:
- Add class prefixes like `somuchmore_*` to avoid conflicts
- Match Tailwind classes from existing elements
- Use MutationObserver to detect when injected elements are removed

**Example** (time-to-cap feature):
```javascript
// Find table by checking if rows contain resource names
const resourceIds = Resources.getAll().map(r => r.id);
for (let row of rows) {
    const text = firstCell.textContent.toLowerCase();
    if (resourceIds.some(id => text.includes(id))) {
        return table; // Found it
    }
}
```

### 6. Cloud Save Architecture

Cloud save uses OAuth2 PKCE flow + Google Drive API:

- **Auth flow**: Redirects to Google OAuth, returns to game with code, exchanges for token
- **Storage**: Access token in `localStorage`, PNG obfuscation for client_secret
- **Auto-save**: Optional 30-minute interval (configurable via UI)
- **Data format**: Base64-encoded JSON uploaded to Google Drive

The PNG secret embedding was implemented in a separate repository (not included here).

## Webpack Userscript Build

The `UserscriptHeaderPlugin` in `webpack.config.js`:
- Injects `// ==UserScript==` metadata before bundled code
- Reads version from `package.json`
- Adds `@grant GM_*` directives for Tampermonkey APIs
- Sets `@run-at document-idle` to wait for game load

Output is a single `.user.js` file that Tampermonkey can install directly.

## Testing in Development

1. Run `npm run dev` (watch mode)
2. Install `dist/somuchmore.user.js` in Tampermonkey
3. Changes auto-rebuild, **manually reload the game page** to test
4. Use browser console to inspect `window.Somuchmore`, `window.MainStore`, `window.somuchmoreDebug`

## Planned Features

See `PLANNED_FEATURES.md` for the roadmap. Features are organized by priority phases. When implementing:
- Follow existing feature patterns (see "Feature Structure" above)
- Integrate with settings system
- Add to `src/index.js` initialization sequence
- During development: Mark subtask checkboxes as complete (`- [ ]` to `- [x]`)
- When feature is complete: Delete the entire feature section from `PLANNED_FEATURES.md`
