// Fox Macro Recorder - Main Content Script
// This file serves as the entry point and manages global state

// Global state variables
let isRecording = false;
let isPlaying = false;
let shouldStopPlayback = false;
let recordingStartTime = null;
let recordedActions = [];
let panel = null;
let editPanel = null;
let currentEditMacroId = null;
let inspectorPanel = null;
let isInspectorActive = false;
let inspectorSnapshots = [];
let settingsPanel = null;
let isRandomDelayEnabled = false;
let randomDelayMin = 100;
let randomDelayMax = 500;

// Initialize panel when page loads
createPanel();

// Always listen for clicks (handleClick checks isRecording)
document.addEventListener('click', handleClick, true);

// Listen for messages from popup to toggle panel visibility
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'togglePanel') {
    if (panel) {
      panel.classList.toggle('hidden');
      sendResponse({ isHidden: panel.classList.contains('hidden') });
    }
  } else if (message.action === 'getPanelState') {
    sendResponse({ isHidden: panel ? panel.classList.contains('hidden') : false });
  } else if (message.action === 'reloadMacros') {
    loadMacros();
    sendResponse({ success: true });
  }
  return true;
});
