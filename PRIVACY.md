# Privacy Policy for Somuchmore

**Last Updated:** March 20, 2026

## Overview

Somuchmore is a free, open-source browser userscript that enhances the Theresmore game experience with quality-of-life features and improvements. This privacy policy explains how the userscript handles your data.

## Data Collection

**We do not collect, transmit, or store any personal data on external servers.**

All data processing happens locally in your browser.

## Data Storage

### Local Storage (Tampermonkey)

The userscript stores the following data locally using Tampermonkey's storage API (`GM_setValue`):

- **Feature preferences** - Your settings for toggled features (time to cap display, unit grouping, etc.)
- **OAuth tokens** - If you enable cloud save, access and refresh tokens for Google OAuth are stored securely in Tampermonkey's sandboxed storage

This data:
- Never leaves your device
- Is only accessible by this userscript
- Is isolated from web pages and other scripts
- Can be deleted by uninstalling the userscript

### Cloud Save (Optional)

If you choose to enable the **Cloud Save** feature:

1. **Google OAuth Authentication**
   - You authenticate directly with Google (not through us)
   - We use OAuth 2.0 with PKCE for secure authorization
   - You grant permission to create and access spreadsheets in your Google Drive

2. **Google Drive Storage**
   - Game saves are stored in a Google Sheet in **your own Google Drive**
   - Only you have access to this data
   - The data is stored in your personal Google account
   - You can delete or revoke access at any time

3. **What Gets Saved**
   - Your game progress (resources, buildings, technologies, army units)
   - Your Somuchmore settings
   - Timestamp and version metadata

4. **Google's Privacy Policy**
   - Google's handling of your OAuth tokens and Drive data is governed by [Google's Privacy Policy](https://policies.google.com/privacy)
   - We have no access to your Google account or other files

## Third-Party Services

### Google OAuth & Drive API

When using Cloud Save:
- **Service**: Google OAuth 2.0 and Google Sheets API
- **Purpose**: Authenticate and store game saves in your Google Drive
- **Data Shared**: Only the minimum scope required (`https://www.googleapis.com/auth/drive.file` - access only to files created by this app)
- **Privacy Policy**: [Google Privacy Policy](https://policies.google.com/privacy)

### Theresmore Game

The userscript runs on `theresmoregame.com`:
- We do not modify or intercept communication with the game servers
- We only read game state from the browser's memory to enhance the UI
- The game's privacy policy applies to game data: [Theresmore Game](https://www.theresmoregame.com)

## Open Source & Client Credentials

This is an **open-source project**:
- All code is publicly available on GitHub
- The source code includes Google OAuth client credentials
- These credentials are necessary for the OAuth flow and are safe to expose in client-side applications
- Users authenticate with their own Google accounts - the credentials only identify this app to Google
- Google OAuth protects against abuse through rate limiting and consent screens
- Users can revoke access at any time through their Google account settings

## Your Rights & Control

You have complete control over your data:

### Local Data
- **View**: Check Tampermonkey's storage for this script
- **Delete**: Uninstall the userscript or clear Tampermonkey storage
- **Export**: Use Tampermonkey's export feature

### Cloud Save Data
- **Access**: Your Google Sheet is in your Drive (search for "Theresmore Save Data")
- **Delete**: Delete the spreadsheet from your Google Drive
- **Revoke Access**: Go to [Google Account Permissions](https://myaccount.google.com/permissions) and revoke access for "Somuchmore"

## Data Security

- **Local storage** is sandboxed by Tampermonkey and not accessible to web pages
- **OAuth tokens** use secure HTTPS transmission and are stored encrypted by your browser
- **No server-side storage** - we don't operate any servers or databases
- **Open source** - you can audit the code to verify these claims

## Children's Privacy

This userscript does not knowingly collect data from children. The Theresmore game's age requirements apply.

## Changes to This Policy

We may update this privacy policy as the userscript evolves. Changes will be:
- Documented in the GitHub repository
- Noted in release notes
- Reflected with an updated "Last Updated" date

## Contact

For questions or concerns about privacy:
- **GitHub Issues**: [github.com/PaulDaPigeon/somuchmore/issues](https://github.com/PaulDaPigeon/somuchmore/issues)
- **Repository**: [github.com/PaulDaPigeon/somuchmore](https://github.com/PaulDaPigeon/somuchmore)

## Summary

**In short:**
- ✅ We don't collect your data
- ✅ Everything stays on your device (except optional cloud saves in YOUR Google Drive)
- ✅ You control all your data
- ✅ Open source and auditable
- ✅ No analytics, tracking, or third-party data sharing
