# Release Notes - Version 1.0.0

## 🎉 Initial Release

Welcome to **Fox Macro Recorder** - your clever companion for automating repetitive clicking tasks on any website!

## ✨ Core Features

### Click Recording & Playback
- **Record clicks** anywhere on a webpage with precise coordinate capture
- **Visual feedback** during recording with animated click indicators
- **Accurate playback** that replays clicks at exact recorded positions
- **Real-time status updates** showing recording progress and playback state

### Macro Management
- **Save macros** with custom names for easy identification
- **Macro library** displaying all saved macros with click count and duration
- **Export macros** to JSON files for backup or sharing
- **Import macros** from JSON files to restore or share with others
- **Delete macros** when no longer needed
- **Edit macros** with comprehensive timeline editor

### Advanced Editing
- **Action Timeline Editor** showing every recorded click with timestamps
- **Adjust delays** between clicks for fine-tuned playback
- **Edit coordinates** (X, Y positions) for each click action
- **Combine macros** to create complex automation sequences
- **Configure delays** between combined macros

### Loop Controls
- **Loop count** - Repeat macros multiple times automatically
- **Loop delay** - Add custom delay between loop iterations
- **Visual progress** showing current loop and click number during playback

### Random Delay Feature
- **Enable/disable** random delays between clicks
- **Configurable range** (min/max in milliseconds)
- Makes automated clicks appear more natural and human-like
- Helps avoid detection by anti-automation systems

### Position Inspector 🔍
- **Live coordinate tracking** as you move your mouse
- **Element inspection** showing tag name, ID, class, and text
- **Click snapshots** to save specific positions for reference
- **Snapshot history** with timestamps
- **Draggable panel** that can be positioned anywhere on screen

### User Interface
- **Floating panels** that don't interfere with page content
- **Draggable interface** - move panels anywhere you need
- **Collapsible main panel** to minimize screen space
- **Hide/show toggle** from extension popup
- **Beautiful gradient design** with smooth animations
- **Responsive layout** works on any screen size

## 🎨 Visual Design

- Modern purple gradient theme (🦊 fox-inspired)
- Smooth animations and transitions
- Clear visual feedback for all actions
- Professional button styling with hover effects
- Color-coded status indicators:
  - 🔴 Red for recording
  - 🔵 Blue for playing
  - ⚪ Gray for ready/idle

## 🎯 Use Cases

Perfect for:
- **Testing** - Automate repetitive testing workflows
- **Data entry** - Speed up form filling and data input
- **Gaming** - Automate grinding and repetitive game actions
- **Web scraping** - Click through multiple pages automatically
- **Demonstrations** - Record and replay user interactions
- **Accessibility** - Help users with mobility challenges

## 🔧 Technical Highlights

- Chrome Extension Manifest V3 compliant
- Local storage for macro persistence
- No server required - everything runs locally
- Works on all websites (universal `<all_urls>` permission)
- Efficient event handling with bubble phase capture
- Precise coordinate-based clicking system

## 📦 What's Included

- Main recorder panel with recording controls
- Macro library with CRUD operations
- Position inspector tool
- Edit panel with timeline and combining features
- Import/export functionality
- Extension popup for quick panel toggle

## 🚀 Getting Started

1. Click the Fox Macro Recorder icon in your browser toolbar
2. Click "Show Panel" to display the recorder
3. Click "Record" to start recording clicks
4. Click anywhere on the page - each click is captured
5. Click "Stop" when finished
6. Give your macro a name and click "Save"
7. Use "Play" to replay your recorded clicks!

## 🐛 Known Limitations

- Only records clicks (not keyboard input or scrolling)
- Requires page to remain in same state for reliable playback
- Dynamic content may affect playback accuracy
- Some websites with strict security may block automated clicks

## 📝 Notes

- All macros are stored locally in your browser
- No data is sent to external servers
- Extension works completely offline once installed
- Compatible with Chrome and Chromium-based browsers

---

**Initial Release Date**: January 2026
**License**: Check repository for license information
**Support**: Report issues on the project repository
