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

**Critical**: All features must wait for `window.Somuchmore.MainStore` to be available before operating. Features use retry loops with MutationObserver to handle delayed DOM rendering.

### 2. Game Data Abstraction Layer

The game data abstraction is split into focused modules under `src/core/`:

- **`resources.js`**: `getValue()`, `getCap()`, `getIncome()` - for resource tracking
- **`army.js`**: `getCount()`, `getClass()`, `getAllIdsFromDisplayName()` - for unit management with classification logic
- **`buildings.js`**: Basic getters for building entities
- **`techs.js`**: Basic getters for technology entities
- **`debug.js`**: Debug helpers and cleanup hooks
- **`game-data.js`**: Re-exports all modules for convenient importing

**Important patterns**:
- Each module uses `window.Somuchmore.MainStore` via a private `getStore()` function
- Unit definitions (category, cap) are scraped from the game's bundled JavaScript on init
- Unit translations (display name → ID) are also scraped to handle dynamic content
- The abstraction layer allows features to survive game updates that change MainStore internals
- **Prefer small, focused modules over large monolithic files**

### 3. Feature Structure

Each feature follows this pattern:

```javascript
export function initFeature() {
    // 1. Check MainStore availability
    if (!window.Somuchmore?.MainStore) return false;

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

    // 6. Expose API under window.Somuchmore
    window.Somuchmore = window.Somuchmore || {};
    window.Somuchmore.featureName = {
        apply: (settings) => {...}
    };

    return true;
}
```

**Key conventions**:
- Features retry setup up to 15 times (game tabs load asynchronously)
- MutationObserver watches for DOM changes (React re-renders destroy injected elements)
- Settings are stored in `localStorage` under `somuchmore_settings`
- **All APIs must be exposed under `window.Somuchmore.*` to keep global namespace clean**
- Use `window.Somuchmore._privateMethod` for internal callbacks (prefix with underscore)

### 4. Settings System

Settings flow:
1. **Storage**: All settings in single `localStorage` key: `somuchmore_settings`
2. **UI Menu** (`src/features/ui/menu/ui-menu.js`): Sidebar with toggles/inputs
3. **Feature UI modules** (`src/features/ui/menu/*-ui.js`): Each feature has its own UI handler
4. **Real-time Updates**: UI menu calls feature-specific `applySetting()` functions

**Modular UI structure**:
- `ui-menu.js`: Core menu setup, settings persistence, toggle event handling
- `templates.js`: HTML template functions for menu content
- Feature-specific UI modules:
  - `time-to-cap-ui.js`: Time to cap visibility control
  - `group-units-ui.js`: Army grouping control
  - `game-mechanics-ui.js`: Game mechanics display control
  - `cloud-save-ui.js`: Cloud save UI, auth, dialogs

To add a new setting:
1. Add default value in `ui-menu.js` `loadSettings()`
2. Add UI control to `templates.js` `createContentArea()`
3. Create new `*-ui.js` module with `applySetting(enabled)` export
4. Import and call in `ui-menu.js` toggle handler
5. Feature exposes API under `window.Somuchmore.featureName`

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

Cloud save is organized as a multi-module feature in `src/features/cloud-save/`:

- **`constants.js`**: API endpoints, OAuth configuration
- **`secret-decoder.js`**: PNG-embedded client_secret decoding
- **`pkce.js`**: PKCE helper functions (code verifier, SHA-256, base64url)
- **`oauth.js`**: OAuth2PKCE class - authentication flow
- **`sheets-api.js`**: SheetsAPI class - Google Sheets operations (create, append, list, delete)
- **`controller.js`**: CloudSave class - main business logic (save/load/auto-save)
- **`cloud-save.js`**: Initialization and OAuth callback handling

**Flow**:
- **Auth**: Redirects to Google OAuth → returns with code → exchanges for token
- **Storage**: Access token in `localStorage`, client_secret PNG-obfuscated
- **Auto-save**: Optional 30-minute interval
- **Data format**: JSON saved to Google Sheets rows

The PNG secret embedding was implemented in a separate repository (not included here).

## Code Organization Principles

**Module size and responsibility**:
- Keep modules focused on a single responsibility
- Split files when they exceed ~300 lines or handle multiple concerns
- Prefer multiple small modules over one large file

**Directory structure**:
```
src/
├── assets/             # Static assets
│   └── icons/          # SVG icon files (referenced by game-mechanics)
│       ├── exploration.svg
│       ├── espionage.svg
│       ├── officers.svg
│       ├── ranged.svg
│       ├── shock.svg
│       ├── tank.svg
│       ├── cavalry.svg
│       ├── splash.svg
│       └── trample.svg
├── core/               # Core abstractions and utilities
│   ├── game-data.js    # Re-exports all game data modules
│   ├── resources.js    # Resource helpers
│   ├── army.js         # Army/unit helpers
│   ├── buildings.js    # Building helpers
│   ├── techs.js        # Technology helpers
│   ├── debug.js        # Debug utilities
│   └── store-detector.js
├── features/
│   ├── cloud-save/     # Multi-file feature (directory)
│   │   ├── cloud-save.js    # Main entry point
│   │   ├── controller.js    # Business logic
│   │   ├── oauth.js         # Auth flow
│   │   ├── sheets-api.js    # API client
│   │   ├── pkce.js          # Crypto utilities
│   │   ├── secret-decoder.js
│   │   └── constants.js
│   ├── game-mechanics/ # Multi-file feature (directory)
│   │   ├── game-mechanics.js # Main entry point
│   │   ├── icons.js          # Icon definitions
│   │   └── templates.js      # HTML templates
│   ├── ui/
│   │   ├── dialog.js
│   │   └── menu/       # Menu feature modules
│   │       ├── ui-menu.js          # Main menu controller
│   │       ├── templates.js        # HTML templates
│   │       ├── time-to-cap-ui.js   # Feature UI
│   │       ├── group-units-ui.js   # Feature UI
│   │       ├── game-mechanics-ui.js # Feature UI
│   │       └── cloud-save-ui.js    # Feature UI
│   ├── time-to-cap.js  # Single-file features
│   └── group-units.js
└── index.js
```

**When to split a file**:
- Business logic vs UI logic → separate files
- Multiple unrelated responsibilities → separate modules
- Large HTML templates → extract to templates file
- Reusable utilities → extract to shared module
- Feature exceeds ~300 lines → split into directory with focused modules

**When a feature needs its own directory**:
- Feature has 2+ files (logic + templates, logic + icons, etc.)
- Create `features/<feature-name>/` directory
- Main entry point: `<feature-name>.js`
- Supporting files: `templates.js`, `icons.js`, `constants.js`, etc.

**SVG assets**:
- Store SVG files in `src/assets/icons/`
- Import SVGs using webpack's `raw-loader` (configured in webpack.config.js)
- Use correct relative paths when importing:
  - From `src/features/ui/`: `../../assets/icons/filename.svg`
  - From `src/features/ui/menu/`: `../../../assets/icons/filename.svg`
  - From `src/features/game-mechanics/`: `../../assets/icons/filename.svg`
- SVG content imported as string, then parsed to extract path data
- SVG files are the source of truth - edit SVG files to update icons

## Webpack Userscript Build

The `UserscriptHeaderPlugin` in `webpack.config.js`:
- Injects `// ==UserScript==` metadata before bundled code
- Reads version from `package.json`
- Adds `@grant GM_*` directives for Tampermonkey APIs
- Sets `@run-at document-idle` to wait for game load

Output is a single `.user.js` file that Tampermonkey can install directly.

## Global Namespace Organization

**All userscript APIs are organized under `window.Somuchmore` to keep the global namespace clean:**

```javascript
window.Somuchmore = {
    // Core
    MainStore,           // Game state object
    debug,              // Debug helpers
    settings,           // Settings API

    // Features
    cloudSave,          // Cloud save API
    groupArmy,          // Army grouping
    gameMechanics,      // Game mechanics display

    // Internal (prefix with _)
    _cloudSaveUpdateUI, // Private callback
    _cleanupHook        // Private debug hook
};
```

**Rules:**
- Never add top-level `window.somuchmore*` properties (use `window.Somuchmore.*` instead)
- Private/internal APIs should be prefixed with underscore: `window.Somuchmore._privateMethod`
- Always use `window.Somuchmore.MainStore` (never `window.MainStore`)

## Testing in Development

1. Run `npm run dev` (watch mode)
2. Install `dist/somuchmore.user.js` in Tampermonkey
3. Changes auto-rebuild, **manually reload the game page** to test
4. Use browser console to inspect `window.Somuchmore` and its properties

## Planned Features

See `PLANNED_FEATURES.md` for the roadmap. Features are organized by priority phases. When implementing:
- Follow existing feature patterns (see "Feature Structure" above)
- Integrate with settings system
- Add to `src/index.js` initialization sequence
- During development: Mark subtask checkboxes as complete (`- [ ]` to `- [x]`)
- When feature is complete: Delete the entire feature section from `PLANNED_FEATURES.md`
