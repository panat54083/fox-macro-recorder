// Fox Macro Recorder - Main Content Script (Entry Point)
// Creates Shadow DOM, initializes global state, sets up event listeners

// ==========================================
// Global State
// ==========================================
let foxShadowRoot = null;
let foxPanel = null;
let isRecording = false;
let isPlaying = false;
let shouldStopPlayback = false;
let recordingStartTime = null;
let recordedActions = [];
let activeTab = 'home';
let isPanelMinimized = false;
let isRandomDelayEnabled = false;
let randomDelayMin = 100;
let randomDelayMax = 500;

// ==========================================
// Shadow DOM Setup
// ==========================================
(function initFoxMacroRecorder() {
  // Create shadow host
  const shadowHost = document.createElement('div');
  shadowHost.id = 'fox-macro-shadow-host';
  shadowHost.style.cssText = 'all: initial; position: fixed; top: 0; left: 0; z-index: 2147483647; pointer-events: none;';
  document.body.appendChild(shadowHost);

  // Attach shadow root (open mode for extension compatibility)
  foxShadowRoot = shadowHost.attachShadow({ mode: 'open' });

  // Allow pointer events on actual elements inside shadow root
  const pointerStyle = document.createElement('style');
  pointerStyle.textContent = ':host { pointer-events: none; } :host > * { pointer-events: auto; }';
  foxShadowRoot.appendChild(pointerStyle);

  // Inject design system styles
  const styleEl = document.createElement('style');
  styleEl.textContent = getFoxStyles();
  foxShadowRoot.appendChild(styleEl);

  // Create panel
  createPanel();

  // Create FAB
  createFab();

  // Listen for clicks (recording)
  document.addEventListener('click', handleClick, true);
})();

// ==========================================
// Message Listener (popup communication)
// ==========================================
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'togglePanel') {
    if (foxPanel) {
      if (foxPanel.classList.contains('hidden') && !isPanelMinimized) {
        foxPanel.classList.remove('hidden');
        hideFab();
      } else if (isPanelMinimized) {
        expandPanel();
      } else {
        foxPanel.classList.add('hidden');
      }
      sendResponse({ isHidden: foxPanel.classList.contains('hidden') });
    }
  } else if (message.action === 'getPanelState') {
    sendResponse({ isHidden: foxPanel ? foxPanel.classList.contains('hidden') : false });
  } else if (message.action === 'reloadMacros') {
    loadMacros();
    sendResponse({ success: true });
  }
  return true;
});
