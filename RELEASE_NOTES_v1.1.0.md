# Release Notes - Version 1.1.0

## 🎉 What's New

### Settings Panel
- Added a dedicated floating settings panel accessible via the ⚙️ button in the main panel header
- Cleaner, more organized interface with settings separated from the main controls

### Improved Random Delay Configuration
- Moved random delay settings to the new settings panel for better organization
- Enhanced UI with clear labels (Minimum/Maximum) and help text
- More intuitive configuration with proper field spacing and visual hierarchy
- Better accessibility with larger touch targets and improved contrast

### Code Architecture Improvements
- Refactored monolithic codebase into 9 focused modules for better maintainability
- Organized code by functionality:
  - `utils.js` - Shared utility functions
  - `recording.js` - Recording logic
  - `playback.js` - Playback functionality
  - `macros.js` - Macro CRUD operations
  - `panels/` directory - All UI panels separated for clarity
- Improved code scalability and easier future enhancements

## 🎨 UI/UX Enhancements

### Main Panel
- Removed clutter by moving settings to dedicated panel
- More streamlined appearance with focus on core recording/playback controls
- Added settings button with consistent styling matching other header buttons

### Settings Panel
- Professional design matching the extension's visual style
- Draggable and repositionable like other panels
- Clear visual separation of settings sections
- Helpful descriptive text explaining feature functionality

## 🔧 Technical Details

- No breaking changes - all existing macros and functionality work exactly as before
- All features preserved with enhanced organization
- Improved code maintainability for future development
- Better module separation following best practices

## 📦 Files Changed

- Updated `manifest.json` to version 1.1.0 and new modular structure
- Split `content.js` into focused modules
- Added comprehensive `REFACTORING.md` documentation

## 🐛 Bug Fixes

- None - this is a feature and enhancement release

## 🚀 Upgrade Notes

- Existing macros and settings are fully compatible
- No action required from users
- Settings will migrate automatically to the new panel

---

**Full Changelog**: Compare v1.0.0...v1.1.0
