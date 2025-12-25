# 🦊 Fox Macro Recorder

> Cleverly record and replay your clicks like a sly fox - automate repetitive tasks with precision!

[![Vibe Coding Project](https://img.shields.io/badge/vibe-coding%20project-ff69b4?style=for-the-badge)](https://github.com/panat54083/fox-macro-recorder)

**Note:** This is a vibe coding project - built for fun, experimentation, and learning! While it's fully functional, it was created with a focus on exploring ideas and enjoying the development process. 🎨✨

## Single Purpose

**Record and replay mouse click sequences on web pages to automate repetitive clicking tasks.**

This extension has one clear purpose: to help users save time by recording their click actions and playing them back automatically, eliminating the need to manually repeat the same clicks over and over.

## What is Fox Macro Recorder?

Fox Macro Recorder is a Chrome extension that helps you automate repetitive clicking tasks on websites. Like a clever fox, it watches and learns your actions, then replays them exactly when you need them.

### What Can It Do?

- **📹 Record Click Actions**: Capture every mouse click you make on a webpage, including exact positions and timing
- **▶️ Replay Macros**: Play back your recorded clicks with the same timing and precision
- **💾 Save & Manage**: Store multiple macros locally and organize them by name
- **📤 Export/Import**: Share macros with others or backup your automation workflows as JSON files
- **🎯 Visual Feedback**: See exactly where clicks are happening with animated effects during playback
- **⏹️ Full Control**: Start, stop, and manage recordings with an easy-to-use interface

### Why Should You Install Fox Macro Recorder?

**Save Time on Repetitive Tasks**
- Filling out similar forms repeatedly
- Testing website functionality with the same click sequences
- Navigating through multi-step processes
- Performing repetitive data entry tasks

**Perfect for:**
- 🧪 **QA Testers**: Automate repetitive test cases and click sequences
- 💼 **Office Workers**: Speed up repetitive web-based workflows
- 🎓 **Students**: Automate repetitive online tasks
- 👨‍💻 **Developers**: Test user interactions and UI flows quickly
- 🎮 **Power Users**: Anyone who does the same clicks over and over

**Key Benefits:**
- ✅ No coding required - just click and record
- ✅ Works on any website
- ✅ Hidden by default - won't clutter your screen
- ✅ Precise coordinate-based clicking for accuracy
- ✅ Preserves original timing between clicks
- ✅ Lightweight and fast

## Installation

### From Source

1. Download or clone this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top right)
4. Click "Load unpacked"
5. Select the `fox-macro-recorder` folder
6. The Fox Macro Recorder icon will appear in your extensions

### Required Files

Make sure these icon files exist in the `icons/` folder:
- `icon16.png` (16x16px)
- `icon48.png` (48x48px)
- `icon128.png` (128x128px)

## How to Use

### Recording a Macro

1. Click the Fox Macro Recorder extension icon
2. Click "Show Panel" to display the control panel
3. Click the **Record** button
4. Perform your click actions on the webpage
5. Click **Stop** when finished
6. Enter a name for your macro and click **Save**

### Playing Back a Macro

1. Open the Fox Macro Recorder panel
2. Find your saved macro in the list
3. Click the **Play** button
4. Watch as your clicks are replayed with visual effects
5. Click **Stop** to interrupt playback if needed

### Managing Macros

- **Export**: Save a macro as a JSON file to share or backup
- **Import**: Load a macro from a JSON file (via extension popup)
- **Delete**: Remove macros you no longer need

### Panel Controls

- **Show/Hide Panel**: Toggle via extension popup (stays hidden by default)
- **Drag to Move**: Click and drag the panel header to reposition it
- **Status Indicator**: See real-time status (Ready, Recording, Playing)

## Features in Detail

### Coordinate-Based Clicking
Fox Macro Recorder uses exact screen coordinates for maximum accuracy. This means clicks land precisely where you recorded them, even if element IDs or classes change.

### Original Timing Preservation
The extension records the exact time between each click and replays them with the same delays, maintaining your natural workflow rhythm.

### Visual Playback Effects
During playback, you'll see:
- 🔵 Ripple effects at click locations
- ⚡ Glowing dots marking exact positions
- 🏷️ "CLICK" labels for clear visibility
- 🎨 Element highlights showing what's being clicked

### Privacy & Storage
- All macros are stored locally in your browser
- No data is sent to external servers
- Export/import works with simple JSON files

## Tips & Tricks

**🦊 Clever Fox Tip**: Make sure the page layout stays the same between recording and playback for best results. If the page scrolls or elements move, coordinates may not match.

**🎯 Accuracy**: For best accuracy, record at the same browser zoom level you'll use for playback.

**⏱️ Timing**: If a website is slow, the original timing might not be enough. Re-record during slower conditions for better results.

**📦 Organize**: Use descriptive names for your macros like "Login Flow" or "Form Submission Test" to stay organized.

## Technical Details

- **Manifest Version**: 3 (Latest Chrome Extension standard)
- **Permissions**: Storage only (to save your macros)
- **Works On**: All URLs (you choose where to use it)
- **Storage**: Chrome local storage API
- **File Format**: JSON for import/export

## File Structure

```
fox-macro-recorder/
├── manifest.json          # Extension configuration
├── content.js             # Main recorder logic & floating panel
├── popup/
│   ├── popup.html        # Extension popup UI
│   ├── popup.js          # Popup logic
└── icons/
    ├── icon16.png        # Extension icons
    ├── icon48.png
    └── icon128.png
```

## Version

**Current Version**: 1.0.0

## Chrome Web Store Submission

### Single Purpose Statement
**Record and replay mouse click sequences on web pages to automate repetitive clicking tasks.**

### Privacy & Permissions Justification

**Permissions Requested:**
1. **`storage`** - Required to save user-recorded macros locally in the browser's storage. Users can create, save, and manage multiple macros that persist across browser sessions.

2. **Content Script on `<all_urls>`** - The content script must run on all websites because users need to record and replay clicks on any webpage they choose. The extension cannot predict which sites users will automate, so it must be available everywhere. The content script only activates when users explicitly show the panel.

**Privacy Guarantees:**
- ✅ All data stored locally in browser (chrome.storage.local)
- ✅ No external servers or network connections
- ✅ No data collection, tracking, or analytics
- ✅ No user data sharing or transmission
- ✅ Content script is passive until user activates it
- ✅ Panel hidden by default to avoid interference

**Remote Code:**
- ❌ **NO remote code used** - All code is packaged within the extension
- ❌ No external scripts loaded from CDNs or remote servers
- ❌ No code execution from external sources
- ✅ Completely self-contained and reviewable

### Privacy Policy

**Required:** Chrome Web Store requires a publicly accessible privacy policy URL.

**Privacy Policy Location:** See [PRIVACY_POLICY.md](PRIVACY_POLICY.md) for the full privacy policy.

**For Chrome Web Store Submission:**
You need to host this privacy policy at a publicly accessible URL. Options:
1. **GitHub (Recommended):** If your repository is public, use:
   ```
   https://github.com/YOUR_USERNAME/fox-macro-recorder/blob/main/PRIVACY_POLICY.md
   ```
2. **GitHub Pages:** Host it as a webpage
3. **Your Website:** Upload to your personal/company website
4. **Google Docs:** Create a public Google Doc with the privacy policy

**Key Points:**
- ✅ We only store data locally (no transmission)
- ✅ No personal information collected
- ✅ No third-party services or analytics
- ✅ Users have full control over their data

### Recommended Categories
- Primary: Productivity
- Secondary: Developer Tools

### Keywords
macro, automation, click recorder, task automation, productivity, testing, QA, workflow

## License

This project is open source and available for personal and commercial use.

## Support

For issues, suggestions, or contributions, please create an issue in the repository.

---

**🦊 Happy automating, clever fox!**
