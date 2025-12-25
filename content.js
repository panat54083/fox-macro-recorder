// Content script for recording clicks and playing back macros

let isRecording = false;
let isPlaying = false;
let shouldStopPlayback = false;
let recordingStartTime = null;
let recordedActions = [];
let panel = null;

// Create floating panel
function createPanel() {
  if (panel) return;

  panel = document.createElement('div');
  panel.id = 'macro-recorder-panel';
  panel.innerHTML = `
    <div class="mr-header">
      <span class="mr-title">🦊 Fox Macro Recorder</span>
    </div>
    <div class="mr-body">
      <div class="mr-status" id="mr-status">Ready</div>
      <div class="mr-controls">
        <button class="mr-btn mr-btn-record" id="mr-record">Record</button>
        <button class="mr-btn mr-btn-stop" id="mr-stop" disabled>Stop</button>
      </div>
      <div class="mr-save" id="mr-save" style="display: none;">
        <input type="text" id="mr-name" placeholder="Macro name...">
        <button class="mr-btn mr-btn-save" id="mr-save-btn">Save</button>
      </div>
      <div class="mr-macros">
        <div class="mr-macros-header">Saved Macros</div>
        <div class="mr-macros-list" id="mr-macros-list">
          <div class="mr-empty">No macros saved</div>
        </div>
      </div>
    </div>
  `;

  const style = document.createElement('style');
  style.id = 'macro-recorder-panel-styles';
  style.textContent = `
    #macro-recorder-panel {
      position: fixed;
      top: 20px;
      right: 20px;
      width: min(400px, 90vw);
      max-height: 80vh;
      background: #fff;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.2);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      z-index: 2147483647;
      overflow: hidden;
      font-size: 15px;
    }
    #macro-recorder-panel.hidden { display: none; }
    #macro-recorder-panel.minimized .mr-body { display: none; }
    #macro-recorder-panel.minimized { width: auto; }
    .mr-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 14px 18px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      cursor: move;
      user-select: none;
    }
    .mr-title { font-weight: 600; font-size: 16px; }
    .mr-minimize {
      background: rgba(255,255,255,0.2);
      border: none;
      color: white;
      width: 24px;
      height: 24px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 16px;
      line-height: 1;
    }
    .mr-minimize:hover { background: rgba(255,255,255,0.3); }
    .mr-body { padding: 16px; overflow-y: auto; max-height: calc(80vh - 60px); }
    .mr-status {
      text-align: center;
      padding: 12px;
      border-radius: 8px;
      margin-bottom: 14px;
      font-weight: 500;
      font-size: 15px;
      background: #f0f0f0;
      color: #666;
    }
    .mr-status.recording {
      background: #ffebee;
      color: #c62828;
      animation: mr-pulse 1.5s infinite;
    }
    .mr-status.playing { background: #e3f2fd; color: #1565c0; }
    @keyframes mr-pulse { 0%,100%{opacity:1} 50%{opacity:0.6} }
    .mr-controls { display: flex; gap: 10px; margin-bottom: 14px; }
    .mr-btn {
      flex: 1;
      padding: 12px 16px;
      border: none;
      border-radius: 8px;
      font-size: 15px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }
    .mr-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .mr-btn-record { background: #ef5350; color: white; }
    .mr-btn-record:hover:not(:disabled) { background: #e53935; }
    .mr-btn-stop { background: #757575; color: white; }
    .mr-btn-stop:hover:not(:disabled) { background: #616161; }
    .mr-btn-save { background: #4caf50; color: white; }
    .mr-btn-play { background: #2196f3; color: white; padding: 8px 14px; font-size: 13px; }
    .mr-btn-export { background: #ff9800; color: white; padding: 8px 14px; font-size: 13px; }
    .mr-btn-delete { background: #f44336; color: white; padding: 8px 14px; font-size: 13px; }
    .mr-btn-import { background: #9c27b0; color: white; width: 100%; }
    .mr-btn-stop-macro { background: #ff5722; color: white; padding: 8px 14px; font-size: 13px; }
    .mr-save { display: flex; gap: 10px; margin-bottom: 14px; }
    .mr-save input {
      flex: 1;
      padding: 12px;
      border: 1px solid #ddd;
      border-radius: 8px;
      font-size: 15px;
    }
    .mr-save input:focus { outline: none; border-color: #4caf50; }
    .mr-macros {
      background: #f9f9f9;
      border-radius: 10px;
      padding: 14px;
      margin-bottom: 14px;
    }
    .mr-macros-header { font-size: 14px; color: #666; margin-bottom: 10px; font-weight: 600; }
    .mr-macros-list { max-height: 250px; overflow-y: auto; }
    .mr-empty { color: #999; font-size: 14px; text-align: center; padding: 20px; }
    .mr-macro-item {
      background: white;
      border-radius: 8px;
      padding: 12px;
      margin-bottom: 8px;
      border: 1px solid #eee;
    }
    .mr-macro-header { display: flex; justify-content: space-between; margin-bottom: 10px; align-items: center; }
    .mr-macro-name { font-weight: 500; font-size: 15px; }
    .mr-macro-info { font-size: 13px; color: #999; }
    .mr-macro-actions { display: flex; gap: 6px; }
    .mr-import { margin-top: 6px; }
  `;

  document.head.appendChild(style);
  document.body.appendChild(panel);

  // Hide panel by default
  panel.classList.add('hidden');

  // Make panel draggable
  makeDraggable(panel, panel.querySelector('.mr-header'));

  // Bind events
  bindPanelEvents();
  loadMacros();
}

function makeDraggable(element, handle) {
  let offsetX, offsetY, isDragging = false;

  handle.addEventListener('mousedown', (e) => {
    isDragging = true;
    offsetX = e.clientX - element.offsetLeft;
    offsetY = e.clientY - element.offsetTop;
    e.preventDefault();
  });

  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    element.style.left = (e.clientX - offsetX) + 'px';
    element.style.top = (e.clientY - offsetY) + 'px';
    element.style.right = 'auto';
  });

  document.addEventListener('mouseup', () => { isDragging = false; });
}

function bindPanelEvents() {
  const recordBtn = document.getElementById('mr-record');
  const stopBtn = document.getElementById('mr-stop');
  const saveBtn = document.getElementById('mr-save-btn');
  const nameInput = document.getElementById('mr-name');
  const saveSection = document.getElementById('mr-save');
  const statusEl = document.getElementById('mr-status');

  recordBtn.addEventListener('click', () => {
    isRecording = true;
    recordingStartTime = Date.now();
    recordedActions = [];
    statusEl.textContent = 'Recording...';
    statusEl.className = 'mr-status recording';
    recordBtn.disabled = true;
    stopBtn.disabled = false;
    saveSection.style.display = 'none';
  });

  stopBtn.addEventListener('click', () => {
    isRecording = false;
    statusEl.textContent = `Recorded ${recordedActions.length} clicks`;
    statusEl.className = 'mr-status';
    recordBtn.disabled = false;
    stopBtn.disabled = true;

    if (recordedActions.length > 0) {
      saveSection.style.display = 'flex';
      nameInput.value = '';
      nameInput.focus();
    }
  });

  saveBtn.addEventListener('click', async () => {
    const name = nameInput.value.trim() || `Macro ${Date.now()}`;
    const macro = {
      id: Date.now().toString(),
      name: name,
      createdAt: new Date().toISOString(),
      actions: recordedActions
    };

    const result = await chrome.storage.local.get(['macros']);
    const macros = result.macros || [];
    macros.push(macro);
    await chrome.storage.local.set({ macros });

    saveSection.style.display = 'none';
    recordedActions = [];
    statusEl.textContent = 'Ready';
    loadMacros();
  });
}

async function loadMacros() {
  const list = document.getElementById('mr-macros-list');
  const result = await chrome.storage.local.get(['macros']);
  const macros = result.macros || [];

  if (macros.length === 0) {
    list.innerHTML = '<div class="mr-empty">No macros saved</div>';
    return;
  }

  list.innerHTML = macros.map(m => `
    <div class="mr-macro-item" data-id="${m.id}">
      <div class="mr-macro-header">
        <span class="mr-macro-name">${m.name}</span>
        <span class="mr-macro-info">${m.actions.length} clicks</span>
      </div>
      <div class="mr-macro-actions">
        <button class="mr-btn mr-btn-play" data-action="play">Play</button>
        <button class="mr-btn mr-btn-export" data-action="export">Export</button>
        <button class="mr-btn mr-btn-delete" data-action="delete">Delete</button>
      </div>
    </div>
  `).join('');

  list.querySelectorAll('.mr-macro-item').forEach(item => {
    const id = item.dataset.id;
    const playBtn = item.querySelector('[data-action="play"]');

    playBtn.addEventListener('click', async () => {
      if (isPlaying) {
        // Stop playback
        shouldStopPlayback = true;
      } else {
        // Start playback - button will be updated by playMacro
        await playMacro(id, playBtn);
      }
    });

    item.querySelector('[data-action="export"]').addEventListener('click', () => exportMacro(id));
    item.querySelector('[data-action="delete"]').addEventListener('click', () => deleteMacro(id));
  });
}

async function playMacro(id, playBtn) {
  const result = await chrome.storage.local.get(['macros']);
  const macro = result.macros.find(m => m.id === id);
  if (macro) {
    const statusEl = document.getElementById('mr-status');

    isPlaying = true;
    shouldStopPlayback = false;
    statusEl.textContent = 'Playing...';
    statusEl.className = 'mr-status playing';

    // Change button to Stop
    if (playBtn) {
      playBtn.textContent = 'Stop';
      playBtn.className = 'mr-btn mr-btn-stop-macro';
    }

    await playActions(macro.actions);

    isPlaying = false;
    statusEl.textContent = shouldStopPlayback ? 'Stopped' : 'Ready';
    statusEl.className = 'mr-status';
    shouldStopPlayback = false;

    // Change button back to Play
    if (playBtn) {
      playBtn.textContent = 'Play';
      playBtn.className = 'mr-btn mr-btn-play';
    }
  }
}

async function exportMacro(id) {
  const result = await chrome.storage.local.get(['macros']);
  const macro = result.macros.find(m => m.id === id);
  if (!macro) return;

  const blob = new Blob([JSON.stringify(macro, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${macro.name.replace(/[^a-z0-9]/gi, '_')}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

async function deleteMacro(id) {
  const result = await chrome.storage.local.get(['macros']);
  const macros = result.macros.filter(m => m.id !== id);
  await chrome.storage.local.set({ macros });
  loadMacros();
}

// Initialize panel when page loads
createPanel();

// Always listen for clicks (handleClick checks isRecording)
document.addEventListener('click', handleClick, true);

// Generate a unique CSS selector for an element
function getSelector(element) {
  if (element.id) {
    return `#${element.id}`;
  }

  if (element.tagName === 'BODY') {
    return 'body';
  }

  const path = [];
  let current = element;

  while (current && current.tagName !== 'BODY') {
    let selector = current.tagName.toLowerCase();

    if (current.id) {
      selector = `#${current.id}`;
      path.unshift(selector);
      break;
    }

    if (current.className && typeof current.className === 'string') {
      const classes = current.className.trim().split(/\s+/).filter(c => c);
      if (classes.length > 0) {
        selector += '.' + classes.slice(0, 2).join('.');
      }
    }

    // Add nth-child if needed for uniqueness
    const parent = current.parentElement;
    if (parent) {
      const siblings = Array.from(parent.children).filter(
        child => child.tagName === current.tagName
      );
      if (siblings.length > 1) {
        const index = siblings.indexOf(current) + 1;
        selector += `:nth-of-type(${index})`;
      }
    }

    path.unshift(selector);
    current = current.parentElement;
  }

  return path.join(' > ');
}

// Handle click events during recording
function handleClick(event) {
  if (!isRecording) return;

  // Ignore clicks on the panel itself
  if (event.target.closest('#macro-recorder-panel')) return;

  const element = event.target;
  const rect = element.getBoundingClientRect();

  const clickData = {
    type: 'click',
    selector: getSelector(element),
    x: event.clientX,
    y: event.clientY,
    pageX: event.pageX,
    pageY: event.pageY,
    elementX: event.clientX - rect.left,
    elementY: event.clientY - rect.top,
    timestamp: Date.now() - recordingStartTime,
    tagName: element.tagName.toLowerCase(),
    text: element.textContent?.slice(0, 50) || ''
  };

  recordedActions.push(clickData);

  // Visual feedback
  showClickFeedback(event.clientX, event.clientY, '#ef5350');
}

// Show visual feedback for clicks
function showClickFeedback(x, y, color, isPlayback = false) {
  // Add animation keyframes if not exists
  if (!document.getElementById('macro-recorder-styles')) {
    const style = document.createElement('style');
    style.id = 'macro-recorder-styles';
    style.textContent = `
      @keyframes clickPulse {
        0% { transform: scale(1); opacity: 0.7; }
        100% { transform: scale(2); opacity: 0; }
      }
      @keyframes clickRipple {
        0% { transform: scale(0.5); opacity: 1; }
        50% { transform: scale(1.5); opacity: 0.6; }
        100% { transform: scale(3); opacity: 0; }
      }
      @keyframes cursorBlink {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }
    `;
    document.head.appendChild(style);
  }

  if (isPlayback) {
    // Create ripple effect
    const ripple = document.createElement('div');
    ripple.style.cssText = `
      position: fixed;
      left: ${x - 30}px;
      top: ${y - 30}px;
      width: 60px;
      height: 60px;
      border: 4px solid ${color};
      border-radius: 50%;
      pointer-events: none;
      z-index: 2147483646;
      animation: clickRipple 0.8s ease-out forwards;
    `;
    document.body.appendChild(ripple);
    setTimeout(() => ripple.remove(), 800);

    // Create center dot
    const dot = document.createElement('div');
    dot.style.cssText = `
      position: fixed;
      left: ${x - 12}px;
      top: ${y - 12}px;
      width: 24px;
      height: 24px;
      background: ${color};
      border-radius: 50%;
      pointer-events: none;
      z-index: 2147483646;
      box-shadow: 0 0 20px ${color};
      animation: clickPulse 0.6s ease-out forwards;
    `;
    document.body.appendChild(dot);
    setTimeout(() => dot.remove(), 600);

    // Create click text indicator
    const label = document.createElement('div');
    label.textContent = 'CLICK';
    label.style.cssText = `
      position: fixed;
      left: ${x + 20}px;
      top: ${y - 10}px;
      padding: 4px 10px;
      background: ${color};
      color: white;
      font-size: 12px;
      font-weight: bold;
      border-radius: 4px;
      pointer-events: none;
      z-index: 2147483646;
      font-family: -apple-system, sans-serif;
      animation: clickPulse 0.8s ease-out forwards;
    `;
    document.body.appendChild(label);
    setTimeout(() => label.remove(), 800);
  } else {
    // Simple dot for recording
    const dot = document.createElement('div');
    dot.style.cssText = `
      position: fixed;
      left: ${x - 10}px;
      top: ${y - 10}px;
      width: 20px;
      height: 20px;
      background: ${color};
      border-radius: 50%;
      pointer-events: none;
      z-index: 2147483646;
      opacity: 0.7;
      animation: clickPulse 0.5s ease-out forwards;
    `;
    document.body.appendChild(dot);
    setTimeout(() => dot.remove(), 500);
  }
}

// Simulate a click using coordinates
async function simulateClick(action, delay) {
  return new Promise(resolve => {
    setTimeout(() => {
      // Use exact recorded coordinates
      const clickX = action.x;
      const clickY = action.y;

      // Show feedback with playback effect
      showClickFeedback(clickX, clickY, '#2196f3', true);

      // Get element at coordinates
      const element = document.elementFromPoint(clickX, clickY);

      if (element) {
        // Highlight the element being clicked
        const originalOutline = element.style.outline;
        const originalTransition = element.style.transition;
        element.style.transition = 'outline 0.2s';
        element.style.outline = '3px solid #2196f3';
        setTimeout(() => {
          element.style.outline = originalOutline;
          element.style.transition = originalTransition;
        }, 500);

        // Dispatch mouse events at exact coordinates
        const mousedownEvent = new MouseEvent('mousedown', {
          bubbles: true,
          cancelable: true,
          clientX: clickX,
          clientY: clickY,
          view: window
        });
        element.dispatchEvent(mousedownEvent);

        const mouseupEvent = new MouseEvent('mouseup', {
          bubbles: true,
          cancelable: true,
          clientX: clickX,
          clientY: clickY,
          view: window
        });
        element.dispatchEvent(mouseupEvent);

        const clickEvent = new MouseEvent('click', {
          bubbles: true,
          cancelable: true,
          clientX: clickX,
          clientY: clickY,
          view: window
        });
        element.dispatchEvent(clickEvent);
      } else {
        console.log('No element at coordinates:', clickX, clickY);
      }

      resolve();
    }, delay);
  });
}

// Play back a sequence of actions with original timing
async function playActions(actions) {
  for (let i = 0; i < actions.length; i++) {
    // Check if playback should stop
    if (shouldStopPlayback) {
      break;
    }

    const action = actions[i];
    // Use the exact recorded timing between clicks
    const delay = i === 0 ? 500 : (actions[i].timestamp - actions[i - 1].timestamp) || 500;

    // Update status with progress
    const statusEl = document.getElementById('mr-status');
    if (statusEl && !shouldStopPlayback) {
      statusEl.textContent = `Playing ${i + 1}/${actions.length}...`;
    }

    await simulateClick(action, delay);
  }
}

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
