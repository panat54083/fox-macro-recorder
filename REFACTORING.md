# Fox Macro Recorder - Refactored Code Structure

## File Organization

The code has been reorganized into logical modules for better maintainability:

### Core Files

- **content-main.js** - Entry point with global state variables and initialization
- **utils.js** - Utility functions (makeDraggable, getSelector, showClickFeedback)
- **recording.js** - Recording functionality (handleClick)
- **playback.js** - Playback functionality (playMacro, simulateClick, playActions)
- **macros.js** - Macro CRUD operations (loadMacros, exportMacro, deleteMacro, updateMacroLoopSettings)

### Panel Modules (panels/ directory)

- **panels/main-panel.js** - Main recorder panel creation and event binding
- **panels/edit-panel.js** - Macro editing panel with action timeline editor
- **panels/inspector-panel.js** - Position inspector for click coordinates
- **panels/settings-panel.js** - Settings panel for random delay configuration

## Loading Order

The manifest.json loads files in this specific order to ensure dependencies are met:

1. utils.js (utilities needed by all modules)
2. recording.js (recording functions)
3. playback.js (playback functions)
4. macros.js (macro operations)
5. panels/main-panel.js (main UI)
6. panels/edit-panel.js (edit UI)
7. panels/inspector-panel.js (inspector UI)
8. panels/settings-panel.js (settings UI)
9. content-main.js (initialization and event listeners)

## Global Variables

All modules share access to global variables defined in content-main.js:
- isRecording, isPlaying, shouldStopPlayback
- recordingStartTime, recordedActions
- panel, editPanel, inspectorPanel, settingsPanel
- currentEditMacroId, inspectorSnapshots
- isInspectorActive
- isRandomDelayEnabled, randomDelayMin, randomDelayMax

## Benefits

- **Modularity**: Each file has a single responsibility
- **Maintainability**: Easier to locate and modify specific functionality
- **Readability**: Smaller files are easier to understand
- **Scalability**: Easy to add new features without modifying existing code
- **No Breaking Changes**: All functionality preserved exactly as before

## Original File

The original content.js file is preserved and can be restored if needed. The extension now uses the modular structure automatically via manifest.json configuration.
