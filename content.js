// Content script for recording clicks and playing back macros

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
let isRandomDelayEnabled = false;
let randomDelayMin = 100;
let randomDelayMax = 500;

// Create floating panel
function createPanel() {
  if (panel) return;

  panel = document.createElement('div');
  panel.id = 'macro-recorder-panel';
  panel.innerHTML = `
    <div class="mr-header">
      <span class="mr-title">🦊 Fox Macro Recorder</span>
      <div class="mr-header-actions">
        <button class="mr-inspector-btn" id="mr-inspector-btn" title="Position Inspector">🔍</button>
        <button class="mr-collapse-btn" id="mr-collapse-btn" title="Collapse Panel">−</button>
        <button class="mr-close-btn" id="mr-close-btn" title="Close Panel">×</button>
      </div>
    </div>
    <div class="mr-body">
      <div class="mr-status" id="mr-status">Ready</div>
      <div class="mr-controls">
        <button class="mr-btn mr-btn-record" id="mr-record">Record</button>
        <button class="mr-btn mr-btn-stop" id="mr-stop" disabled>Stop</button>
      </div>
      <div class="mr-random-delay">
        <label class="mr-checkbox-label">
          <input type="checkbox" id="mr-random-delay-toggle" class="mr-checkbox">
          <span>Random Delay</span>
        </label>
        <div class="mr-delay-range">
          <input type="number" id="mr-delay-min" class="mr-delay-input" value="100" min="0" max="10000" placeholder="Min">
          <span class="mr-delay-separator">-</span>
          <input type="number" id="mr-delay-max" class="mr-delay-input" value="500" min="0" max="10000" placeholder="Max">
          <span class="mr-delay-unit">ms</span>
        </div>
      </div>
      <div class="mr-save" id="mr-save" style="display: none;">
        <input type="text" id="mr-name" placeholder="Macro name...">
        <button class="mr-btn mr-btn-save" id="mr-save-btn">Save</button>
      </div>
      <div class="mr-macros">
        <div class="mr-macros-header">
          <span>Saved Macros</span>
        </div>
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
    .mr-header-actions {
      display: flex;
      gap: 8px;
      align-items: center;
    }
    .mr-inspector-btn {
      background: rgba(255,255,255,0.2);
      border: none;
      color: white;
      width: 32px;
      height: 32px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 18px;
      line-height: 1;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .mr-inspector-btn:hover { background: rgba(255,255,255,0.3); transform: scale(1.1); }
    .mr-inspector-btn.active { background: rgba(255,255,255,0.4); }
    .mr-collapse-btn {
      background: rgba(255,255,255,0.2);
      border: none;
      color: white;
      width: 32px;
      height: 32px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 24px;
      line-height: 1;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
    }
    .mr-collapse-btn:hover { background: rgba(255,255,255,0.3); transform: scale(1.1); }
    .mr-close-btn {
      background: rgba(255,255,255,0.2);
      border: none;
      color: white;
      width: 32px;
      height: 32px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 24px;
      line-height: 1;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .mr-close-btn:hover { background: rgba(255,255,255,0.3); transform: scale(1.1); }
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
    .mr-random-delay {
      margin-bottom: 14px;
      padding: 10px;
      background: #f0f7ff;
      border-radius: 8px;
      border: 1px solid #667eea33;
    }
    .mr-checkbox-label {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      font-size: 14px;
      color: #333;
    }
    .mr-checkbox {
      width: 18px;
      height: 18px;
      cursor: pointer;
      accent-color: #667eea;
    }
    .mr-delay-range {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 8px;
      padding-left: 26px;
    }
    .mr-delay-input {
      width: 70px;
      padding: 6px 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 13px;
      text-align: center;
    }
    .mr-delay-input:focus {
      outline: none;
      border-color: #667eea;
    }
    .mr-delay-separator {
      color: #999;
      font-weight: 500;
    }
    .mr-delay-unit {
      color: #666;
      font-size: 13px;
      font-weight: 500;
    }
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
    .mr-btn-edit { background: #9c27b0; color: white; padding: 8px 14px; font-size: 13px; }
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
    .mr-loop-controls {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      margin-top: 10px;
      padding-top: 10px;
      border-top: 1px solid #eee;
    }
    .mr-loop-control {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .mr-loop-label {
      font-size: 11px;
      color: #999;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }
    .mr-loop-control input {
      padding: 6px 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 13px;
      text-align: center;
      transition: border-color 0.2s;
    }
    .mr-loop-control input:focus {
      outline: none;
      border-color: #667eea;
    }
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
  const inspectorBtn = document.getElementById('mr-inspector-btn');
  const collapseBtn = document.getElementById('mr-collapse-btn');
  const closeBtn = document.getElementById('mr-close-btn');

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

  inspectorBtn.addEventListener('click', () => {
    toggleInspector();
  });

  collapseBtn.addEventListener('click', () => {
    panel.classList.toggle('minimized');
    // Update button icon based on state
    if (panel.classList.contains('minimized')) {
      collapseBtn.textContent = '+';
      collapseBtn.title = 'Expand Panel';
    } else {
      collapseBtn.textContent = '−';
      collapseBtn.title = 'Collapse Panel';
    }
  });

  closeBtn.addEventListener('click', () => {
    panel.classList.add('hidden');
  });

  // Random delay toggle
  const randomDelayToggle = document.getElementById('mr-random-delay-toggle');
  randomDelayToggle.addEventListener('change', async () => {
    isRandomDelayEnabled = randomDelayToggle.checked;
    await chrome.storage.local.set({ randomDelayEnabled: isRandomDelayEnabled });
  });

  // Random delay min/max inputs
  const delayMinInput = document.getElementById('mr-delay-min');
  const delayMaxInput = document.getElementById('mr-delay-max');

  delayMinInput.addEventListener('change', async () => {
    const value = parseInt(delayMinInput.value) || 0;
    randomDelayMin = Math.max(0, Math.min(value, randomDelayMax));
    delayMinInput.value = randomDelayMin;
    await chrome.storage.local.set({ randomDelayMin });
  });

  delayMaxInput.addEventListener('change', async () => {
    const value = parseInt(delayMaxInput.value) || 0;
    randomDelayMax = Math.max(randomDelayMin, value);
    delayMaxInput.value = randomDelayMax;
    await chrome.storage.local.set({ randomDelayMax });
  });

  // Load random delay setting
  loadRandomDelaySetting();
}

async function loadRandomDelaySetting() {
  const result = await chrome.storage.local.get(['randomDelayEnabled', 'randomDelayMin', 'randomDelayMax']);
  isRandomDelayEnabled = result.randomDelayEnabled || false;
  randomDelayMin = result.randomDelayMin || 100;
  randomDelayMax = result.randomDelayMax || 500;

  const toggle = document.getElementById('mr-random-delay-toggle');
  const minInput = document.getElementById('mr-delay-min');
  const maxInput = document.getElementById('mr-delay-max');

  if (toggle) {
    toggle.checked = isRandomDelayEnabled;
  }
  if (minInput) {
    minInput.value = randomDelayMin;
  }
  if (maxInput) {
    maxInput.value = randomDelayMax;
  }
}

async function loadMacros() {
  const list = document.getElementById('mr-macros-list');
  const result = await chrome.storage.local.get(['macros']);
  const macros = result.macros || [];

  if (macros.length === 0) {
    list.innerHTML = '<div class="mr-empty">No macros saved</div>';
    return;
  }

  list.innerHTML = macros.map(m => {
    const totalTime = m.actions.length > 0 ? m.actions[m.actions.length - 1].timestamp : 0;
    const loopCount = m.loopCount || 1;
    const loopDelay = m.loopDelay || 0;

    return `
    <div class="mr-macro-item" data-id="${m.id}">
      <div class="mr-macro-header">
        <span class="mr-macro-name">${m.name}</span>
        <span class="mr-macro-info">${m.actions.length} clicks · ${totalTime}ms total</span>
      </div>
      <div class="mr-macro-actions">
        <button class="mr-btn mr-btn-play" data-action="play">Play</button>
        <button class="mr-btn mr-btn-edit" data-action="edit">Edit</button>
        <button class="mr-btn mr-btn-export" data-action="export">Export</button>
        <button class="mr-btn mr-btn-delete" data-action="delete">Delete</button>
      </div>
      <div class="mr-loop-controls">
        <div class="mr-loop-control">
          <label class="mr-loop-label">Loop Count</label>
          <input type="number" class="mr-loop-count-input" value="${loopCount}" min="1" max="999" data-id="${m.id}">
        </div>
        <div class="mr-loop-control">
          <label class="mr-loop-label">Loop Delay (ms)</label>
          <input type="number" class="mr-loop-delay-input" value="${loopDelay}" min="0" data-id="${m.id}">
        </div>
      </div>
    </div>
    `;
  }).join('');

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

    item.querySelector('[data-action="edit"]').addEventListener('click', () => openEditPanel(id));
    item.querySelector('[data-action="export"]').addEventListener('click', () => exportMacro(id));
    item.querySelector('[data-action="delete"]').addEventListener('click', () => deleteMacro(id));

    // Loop controls
    const loopCountInput = item.querySelector('.mr-loop-count-input');
    const loopDelayInput = item.querySelector('.mr-loop-delay-input');

    loopCountInput.addEventListener('change', async () => {
      const newLoopCount = parseInt(loopCountInput.value) || 1;
      await updateMacroLoopSettings(id, newLoopCount, null);
    });

    loopDelayInput.addEventListener('change', async () => {
      const newLoopDelay = parseInt(loopDelayInput.value) || 0;
      await updateMacroLoopSettings(id, null, newLoopDelay);
    });
  });
}

async function updateMacroLoopSettings(id, loopCount, loopDelay) {
  const result = await chrome.storage.local.get(['macros']);
  const macros = result.macros || [];
  const macroIndex = macros.findIndex(m => m.id === id);

  if (macroIndex !== -1) {
    if (loopCount !== null) {
      macros[macroIndex].loopCount = loopCount;
    }
    if (loopDelay !== null) {
      macros[macroIndex].loopDelay = loopDelay;
    }
    await chrome.storage.local.set({ macros });
  }
}

async function playMacro(id, playBtn) {
  const result = await chrome.storage.local.get(['macros']);
  const macro = result.macros.find(m => m.id === id);
  if (macro) {
    const statusEl = document.getElementById('mr-status');
    const loopCount = macro.loopCount || 1;
    const loopDelay = macro.loopDelay || 0;

    isPlaying = true;
    shouldStopPlayback = false;
    statusEl.textContent = 'Playing...';
    statusEl.className = 'mr-status playing';

    // Change button to Stop
    if (playBtn) {
      playBtn.textContent = 'Stop';
      playBtn.className = 'mr-btn mr-btn-stop-macro';
    }

    // Loop through the macro the specified number of times
    for (let loop = 0; loop < loopCount; loop++) {
      if (shouldStopPlayback) break;

      await playActions(macro.actions, loop + 1, loopCount);

      // Add delay between loops (except after the last loop)
      if (loop < loopCount - 1 && loopDelay > 0 && !shouldStopPlayback) {
        let actualLoopDelay = loopDelay;

        // Add random delay if enabled
        if (isRandomDelayEnabled) {
          const randomDelay = Math.floor(Math.random() * (randomDelayMax - randomDelayMin + 1)) + randomDelayMin;
          actualLoopDelay += randomDelay;
        }

        if (statusEl) {
          statusEl.textContent = `⏸ Waiting ${actualLoopDelay}ms before loop ${loop + 2}/${loopCount}...`;
        }
        await new Promise(resolve => setTimeout(resolve, actualLoopDelay));
      }
    }

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

// Open edit panel for a macro
async function openEditPanel(id) {
  currentEditMacroId = id;
  const result = await chrome.storage.local.get(['macros']);
  const macro = result.macros.find(m => m.id === id);
  const allMacros = result.macros || [];

  if (!macro) return;

  // Create edit panel if it doesn't exist
  if (!editPanel) {
    editPanel = document.createElement('div');
    editPanel.id = 'macro-edit-panel';
    document.body.appendChild(editPanel);

    // Add styles for edit panel
    const editStyle = document.createElement('style');
    editStyle.id = 'macro-edit-panel-styles';
    editStyle.textContent = `
      #macro-edit-panel {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: min(600px, 90vw);
        max-height: 85vh;
        background: #fff;
        border-radius: 12px;
        box-shadow: 0 12px 48px rgba(0,0,0,0.3);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        z-index: 2147483648;
        overflow: hidden;
        font-size: 15px;
        display: none;
      }
      #macro-edit-panel.visible { display: block; }
      .me-header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 16px 20px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        cursor: move;
        user-select: none;
      }
      .me-title { font-weight: 600; font-size: 17px; }
      .me-close {
        background: rgba(255,255,255,0.2);
        border: none;
        color: white;
        width: 28px;
        height: 28px;
        border-radius: 50%;
        cursor: pointer;
        font-size: 18px;
        line-height: 1;
      }
      .me-close:hover { background: rgba(255,255,255,0.3); }
      .me-body { padding: 20px; overflow-y: auto; max-height: calc(85vh - 130px); }
      .me-section { margin-bottom: 24px; }
      .me-section-title {
        font-size: 14px;
        font-weight: 600;
        color: #666;
        margin-bottom: 10px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      .me-name-input {
        width: 100%;
        padding: 12px;
        border: 2px solid #ddd;
        border-radius: 8px;
        font-size: 15px;
        font-weight: 500;
        transition: border-color 0.2s;
      }
      .me-name-input:focus {
        outline: none;
        border-color: #667eea;
      }
      .me-actions-list {
        background: #f9f9f9;
        border-radius: 8px;
        padding: 12px;
        max-height: 300px;
        overflow-y: auto;
      }
      .me-action-item {
        background: white;
        border-radius: 6px;
        padding: 10px 12px;
        margin-bottom: 8px;
        display: flex;
        flex-direction: column;
        gap: 8px;
        border: 1px solid #eee;
      }
      .me-action-row {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .me-action-number {
        background: #667eea;
        color: white;
        width: 28px;
        height: 28px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 13px;
        font-weight: 600;
        flex-shrink: 0;
      }
      .me-action-info {
        flex: 1;
        font-size: 13px;
        color: #666;
      }
      .me-delay-label {
        font-size: 12px;
        color: #999;
        margin-right: 6px;
      }
      .me-delay-input {
        width: 80px;
        padding: 6px 10px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 13px;
        text-align: center;
      }
      .me-delay-input:focus {
        outline: none;
        border-color: #667eea;
      }
      .me-position-inputs {
        display: flex;
        gap: 8px;
        align-items: center;
      }
      .me-position-input {
        width: 70px;
        padding: 6px 8px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 13px;
        text-align: center;
      }
      .me-position-input:focus {
        outline: none;
        border-color: #667eea;
      }
      .me-position-label {
        font-size: 11px;
        color: #999;
        font-weight: 600;
      }
      .me-combine-select {
        width: 100%;
        padding: 10px 12px;
        border: 2px solid #ddd;
        border-radius: 8px;
        font-size: 14px;
        background: white;
        cursor: pointer;
        margin-bottom: 10px;
      }
      .me-combine-select:focus {
        outline: none;
        border-color: #667eea;
      }
      .me-combine-delay {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-top: 10px;
      }
      .me-combine-delay label {
        font-size: 14px;
        color: #666;
      }
      .me-combine-delay input {
        flex: 1;
        padding: 8px 12px;
        border: 1px solid #ddd;
        border-radius: 6px;
        font-size: 14px;
      }
      .me-btn-add-macro {
        background: #03a9f4;
        color: white;
        padding: 8px 16px;
        border: none;
        border-radius: 6px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        width: 100%;
        margin-top: 10px;
      }
      .me-btn-add-macro:hover {
        background: #0288d1;
      }
      .me-combined-item {
        background: #e3f2fd;
        border: 1px solid #90caf9;
        border-radius: 6px;
        padding: 10px 12px;
        margin-top: 8px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .me-combined-name {
        font-size: 14px;
        color: #1565c0;
        font-weight: 500;
      }
      .me-btn-remove-combined {
        background: #f44336;
        color: white;
        border: none;
        padding: 4px 10px;
        border-radius: 4px;
        font-size: 12px;
        cursor: pointer;
      }
      .me-footer {
        padding: 16px 20px;
        border-top: 1px solid #eee;
        display: flex;
        gap: 10px;
        background: #fafafa;
      }
      .me-btn {
        flex: 1;
        padding: 12px 20px;
        border: none;
        border-radius: 8px;
        font-size: 15px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
      }
      .me-btn-cancel {
        background: #e0e0e0;
        color: #666;
      }
      .me-btn-cancel:hover {
        background: #d5d5d5;
      }
      .me-btn-save {
        background: #4caf50;
        color: white;
      }
      .me-btn-save:hover {
        background: #45a049;
      }
      .me-loop-settings {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
      }
      .me-loop-field {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .me-loop-field label {
        font-size: 13px;
        color: #666;
        font-weight: 500;
      }
      .me-loop-input {
        padding: 10px 12px;
        border: 2px solid #ddd;
        border-radius: 6px;
        font-size: 14px;
        text-align: center;
      }
      .me-loop-input:focus {
        outline: none;
        border-color: #667eea;
      }
    `;
    document.head.appendChild(editStyle);
  }

  // Build actions list HTML
  let actionsHTML = macro.actions.map((action, index) => {
    const delay = index === 0 ? 0 : (action.timestamp - macro.actions[index - 1].timestamp);
    return `
      <div class="me-action-item">
        <div class="me-action-row">
          <div class="me-action-number">${index + 1}</div>
          <div class="me-action-info" style="flex: 1;">
            ${action.text ? `${action.text.slice(0, 30)}${action.text.length > 30 ? '...' : ''}` : 'Click'}
          </div>
          ${index > 0 ? `
            <span class="me-delay-label">Delay:</span>
            <input type="number" class="me-delay-input" data-index="${index}" value="${delay}" min="0">
            <span style="font-size: 12px; color: #999;">ms</span>
          ` : '<span style="font-size: 12px; color: #999;">First click</span>'}
        </div>
        <div class="me-position-inputs">
          <span class="me-position-label">X:</span>
          <input type="number" class="me-position-input me-x-input" data-index="${index}" value="${Math.round(action.x)}" min="0">
          <span class="me-position-label">Y:</span>
          <input type="number" class="me-position-input me-y-input" data-index="${index}" value="${Math.round(action.y)}" min="0">
        </div>
      </div>
    `;
  }).join('');

  // Build combine options (exclude current macro)
  const otherMacros = allMacros.filter(m => m.id !== id);
  const combineOptionsHTML = otherMacros.map(m =>
    `<option value="${m.id}">${m.name} (${m.actions.length} clicks)</option>`
  ).join('');

  editPanel.innerHTML = `
    <div class="me-header">
      <span class="me-title">🦊 Edit Macro</span>
      <button class="me-close" id="me-close">×</button>
    </div>
    <div class="me-body">
      <div class="me-section">
        <div class="me-section-title">Macro Name</div>
        <input type="text" class="me-name-input" id="me-name-input" value="${macro.name}">
      </div>

      <div class="me-section">
        <div class="me-section-title">Actions Timeline (${macro.actions.length} clicks)</div>
        <div class="me-actions-list">
          ${actionsHTML}
        </div>
      </div>

      ${otherMacros.length > 0 ? `
      <div class="me-section">
        <div class="me-section-title">Combine with Other Macros</div>
        <select class="me-combine-select" id="me-combine-select">
          <option value="">Select a macro to combine...</option>
          ${combineOptionsHTML}
        </select>
        <div id="me-combined-list"></div>
      </div>
      ` : ''}
    </div>
    <div class="me-footer">
      <button class="me-btn me-btn-cancel" id="me-cancel">Cancel</button>
      <button class="me-btn me-btn-save" id="me-save">Save Changes</button>
    </div>
  `;

  editPanel.classList.add('visible');

  // Make panel draggable
  makeDraggable(editPanel, editPanel.querySelector('.me-header'));

  // Track combined macros
  let combinedMacros = [];

  // Bind events
  document.getElementById('me-close').addEventListener('click', closeEditPanel);
  document.getElementById('me-cancel').addEventListener('click', closeEditPanel);

  // Combine functionality
  const combineSelect = document.getElementById('me-combine-select');
  const combinedList = document.getElementById('me-combined-list');

  if (combineSelect && combinedList) {
    combineSelect.addEventListener('change', () => {
      const selectedId = combineSelect.value;
      if (!selectedId) return;

      const selectedMacro = allMacros.find(m => m.id === selectedId);
      if (!selectedMacro) return;

      // Check if already added
      if (combinedMacros.find(cm => cm.id === selectedId)) {
        combineSelect.value = '';
        return;
      }

      combinedMacros.push({ id: selectedId, name: selectedMacro.name, delay: 0 });
      updateCombinedList();
      combineSelect.value = '';
    });
  }

  function updateCombinedList() {
    if (!combinedList) return;

    combinedList.innerHTML = combinedMacros.map((cm, idx) => `
      <div class="me-combined-item">
        <span class="me-combined-name">${cm.name}</span>
        <div style="display: flex; gap: 10px; align-items: center;">
          <input type="number" class="me-delay-input" data-combined-index="${idx}"
                 value="${cm.delay}" min="0" placeholder="Delay (ms)">
          <span style="font-size: 12px; color: #666;">ms before</span>
          <button class="me-btn-remove-combined" data-combined-index="${idx}">×</button>
        </div>
      </div>
    `).join('');

    // Bind remove buttons
    combinedList.querySelectorAll('.me-btn-remove-combined').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.combinedIndex);
        combinedMacros.splice(idx, 1);
        updateCombinedList();
      });
    });

    // Bind delay inputs
    combinedList.querySelectorAll('.me-delay-input').forEach(input => {
      input.addEventListener('change', () => {
        const idx = parseInt(input.dataset.combinedIndex);
        combinedMacros[idx].delay = parseInt(input.value) || 0;
      });
    });
  }

  document.getElementById('me-save').addEventListener('click', async () => {
    const newName = document.getElementById('me-name-input').value.trim() || macro.name;

    // Get updated delays and positions for actions
    const updatedActions = [...macro.actions];
    const delayInputs = editPanel.querySelectorAll('.me-delay-input[data-index]');
    const xInputs = editPanel.querySelectorAll('.me-x-input[data-index]');
    const yInputs = editPanel.querySelectorAll('.me-y-input[data-index]');

    // Update positions first
    xInputs.forEach(input => {
      const index = parseInt(input.dataset.index);
      const newX = parseFloat(input.value) || 0;
      updatedActions[index].x = newX;
    });

    yInputs.forEach(input => {
      const index = parseInt(input.dataset.index);
      const newY = parseFloat(input.value) || 0;
      updatedActions[index].y = newY;
    });

    // Then update delays
    delayInputs.forEach(input => {
      const index = parseInt(input.dataset.index);
      const newDelay = parseInt(input.value) || 0;

      if (index > 0) {
        // Calculate new timestamp based on previous action + new delay
        const prevTimestamp = updatedActions[index - 1].timestamp;
        updatedActions[index].timestamp = prevTimestamp + newDelay;

        // Update all subsequent actions
        for (let i = index + 1; i < updatedActions.length; i++) {
          const originalDelay = macro.actions[i].timestamp - macro.actions[i - 1].timestamp;
          updatedActions[i].timestamp = updatedActions[i - 1].timestamp + originalDelay;
        }
      }
    });

    // Handle combining macros
    let finalActions = updatedActions;
    if (combinedMacros.length > 0) {
      const result = await chrome.storage.local.get(['macros']);
      const allCurrentMacros = result.macros || [];

      let currentTime = updatedActions.length > 0 ?
        updatedActions[updatedActions.length - 1].timestamp : 0;

      // Add each combined macro
      for (const cm of combinedMacros) {
        const macroToAdd = allCurrentMacros.find(m => m.id === cm.id);
        if (!macroToAdd) continue;

        // Add delay before this macro
        currentTime += cm.delay;

        // Add all actions from this macro
        macroToAdd.actions.forEach(action => {
          finalActions.push({
            ...action,
            timestamp: currentTime + action.timestamp
          });
        });

        // Update current time
        if (macroToAdd.actions.length > 0) {
          currentTime += macroToAdd.actions[macroToAdd.actions.length - 1].timestamp;
        }
      }
    }

    // Save updated macro
    const result = await chrome.storage.local.get(['macros']);
    const macros = result.macros || [];
    const macroIndex = macros.findIndex(m => m.id === id);

    if (macroIndex !== -1) {
      macros[macroIndex] = {
        ...macro,
        name: newName,
        actions: finalActions
        // Loop settings are preserved from existing macro and updated via main panel
      };
      await chrome.storage.local.set({ macros });
      loadMacros();

      const statusEl = document.getElementById('mr-status');
      if (statusEl) {
        statusEl.textContent = 'Macro updated!';
        setTimeout(() => { statusEl.textContent = 'Ready'; }, 2000);
      }
    }

    closeEditPanel();
  });
}

function closeEditPanel() {
  if (editPanel) {
    editPanel.classList.remove('visible');
  }
  currentEditMacroId = null;
}

// Toggle inspector panel
function toggleInspector() {
  const inspectorBtn = document.getElementById('mr-inspector-btn');

  if (isInspectorActive) {
    // Deactivate inspector
    isInspectorActive = false;
    inspectorBtn.classList.remove('active');
    if (inspectorPanel) {
      inspectorPanel.classList.remove('visible');
    }
    document.removeEventListener('mousemove', trackMousePosition);
    document.removeEventListener('click', captureSnapshot, true);
  } else {
    // Activate inspector
    isInspectorActive = true;
    inspectorBtn.classList.add('active');
    if (!inspectorPanel) {
      createInspectorPanel();
    }
    inspectorPanel.classList.add('visible');
    document.addEventListener('mousemove', trackMousePosition);
    document.addEventListener('click', captureSnapshot, true);
  }
}

// Create inspector panel
function createInspectorPanel() {
  inspectorPanel = document.createElement('div');
  inspectorPanel.id = 'inspector-panel';
  document.body.appendChild(inspectorPanel);

  const inspectorStyle = document.createElement('style');
  inspectorStyle.id = 'inspector-panel-styles';
  inspectorStyle.textContent = `
    #inspector-panel {
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: min(400px, 90vw);
      max-height: 60vh;
      background: #fff;
      border-radius: 12px;
      box-shadow: 0 12px 48px rgba(0,0,0,0.3);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      z-index: 2147483647;
      overflow: hidden;
      font-size: 14px;
      display: none;
    }
    #inspector-panel.visible { display: block; }
    .insp-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 14px 18px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      cursor: move;
      user-select: none;
    }
    .insp-title { font-weight: 600; font-size: 16px; }
    .insp-close {
      background: rgba(255,255,255,0.2);
      border: none;
      color: white;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      cursor: pointer;
      font-size: 18px;
      line-height: 1;
    }
    .insp-close:hover { background: rgba(255,255,255,0.3); }
    .insp-body { padding: 16px; overflow-y: auto; max-height: calc(60vh - 120px); }
    .insp-current {
      background: #f0f7ff;
      border: 2px solid #667eea;
      border-radius: 8px;
      padding: 12px;
      margin-bottom: 16px;
    }
    .insp-current-title {
      font-size: 12px;
      font-weight: 600;
      color: #667eea;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 8px;
    }
    .insp-data-row {
      display: flex;
      gap: 12px;
      margin-bottom: 6px;
      font-size: 13px;
    }
    .insp-label {
      font-weight: 600;
      color: #666;
      min-width: 70px;
    }
    .insp-value {
      color: #333;
      font-family: 'Courier New', monospace;
    }
    .insp-element {
      color: #667eea;
      font-weight: 500;
      word-break: break-all;
    }
    .insp-snapshots {
      margin-top: 16px;
    }
    .insp-snapshots-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }
    .insp-snapshots-title {
      font-size: 13px;
      font-weight: 600;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }
    .insp-clear-btn {
      background: #f44336;
      color: white;
      border: none;
      padding: 4px 12px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 500;
      cursor: pointer;
    }
    .insp-clear-btn:hover { background: #d32f2f; }
    .insp-snapshot-list {
      max-height: 200px;
      overflow-y: auto;
    }
    .insp-snapshot-item {
      background: white;
      border: 1px solid #eee;
      border-radius: 6px;
      padding: 10px;
      margin-bottom: 8px;
    }
    .insp-snapshot-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 6px;
    }
    .insp-snapshot-time {
      font-size: 11px;
      color: #999;
    }
    .insp-empty {
      text-align: center;
      padding: 20px;
      color: #999;
      font-size: 13px;
    }
  `;
  document.head.appendChild(inspectorStyle);

  updateInspectorPanel(null);

  // Make panel draggable (called once after initial creation)
  makeDraggable(inspectorPanel, inspectorPanel.querySelector('.insp-header'));
}

// Track mouse position
function trackMousePosition(e) {
  if (!isInspectorActive) return;

  // Don't track if over any extension panels (inspector, main, or edit panel)
  if (e.target.closest('#inspector-panel') ||
      e.target.closest('#macro-recorder-panel') ||
      e.target.closest('#macro-edit-panel')) {
    return;
  }

  const element = e.target;

  const data = {
    x: e.clientX,
    y: e.clientY,
    pageX: e.pageX,
    pageY: e.pageY,
    element: element.tagName.toLowerCase(),
    elementId: element.id || '(none)',
    elementClass: element.className || '(none)',
    elementText: element.textContent?.slice(0, 50) || '(empty)'
  };

  updateInspectorPanel(data);
}

// Capture snapshot
function captureSnapshot(e) {
  if (!isInspectorActive) return;

  // Ignore clicks on any extension panels (inspector, main, or edit panel)
  if (e.target.closest('#inspector-panel') ||
      e.target.closest('#macro-recorder-panel') ||
      e.target.closest('#macro-edit-panel')) {
    return;
  }

  e.preventDefault();
  e.stopPropagation();

  const element = e.target;

  const snapshot = {
    time: new Date().toLocaleTimeString(),
    x: e.clientX,
    y: e.clientY,
    pageX: e.pageX,
    pageY: e.pageY,
    element: element.tagName.toLowerCase(),
    elementId: element.id || '(none)',
    elementClass: element.className || '(none)',
    elementText: element.textContent?.slice(0, 30) || '(empty)'
  };

  inspectorSnapshots.push(snapshot);
  updateInspectorPanel(null);
}

// Update inspector panel
function updateInspectorPanel(currentData) {
  if (!inspectorPanel) return;

  const currentHtml = currentData ? `
    <div class="insp-current">
      <div class="insp-current-title">Current Position</div>
      <div class="insp-data-row">
        <span class="insp-label">X:</span>
        <span class="insp-value">${currentData.x}</span>
      </div>
      <div class="insp-data-row">
        <span class="insp-label">Y:</span>
        <span class="insp-value">${currentData.y}</span>
      </div>
      <div class="insp-data-row">
        <span class="insp-label">Element:</span>
        <span class="insp-element">&lt;${currentData.element}&gt;</span>
      </div>
      <div class="insp-data-row">
        <span class="insp-label">ID:</span>
        <span class="insp-value">${currentData.elementId}</span>
      </div>
      <div class="insp-data-row">
        <span class="insp-label">Text:</span>
        <span class="insp-value">${currentData.elementText}</span>
      </div>
    </div>
  ` : `
    <div class="insp-current">
      <div class="insp-current-title">Current Position</div>
      <div class="insp-empty">Move mouse to see position</div>
    </div>
  `;

  const snapshotsHtml = inspectorSnapshots.length > 0 ?
    inspectorSnapshots.map((snap, idx) => `
      <div class="insp-snapshot-item">
        <div class="insp-snapshot-header">
          <span style="font-weight: 600; font-size: 12px;">#${idx + 1}</span>
          <span class="insp-snapshot-time">${snap.time}</span>
        </div>
        <div class="insp-data-row">
          <span class="insp-label">X, Y:</span>
          <span class="insp-value">${snap.x}, ${snap.y}</span>
        </div>
        <div class="insp-data-row">
          <span class="insp-label">Element:</span>
          <span class="insp-element">&lt;${snap.element}&gt;</span>
        </div>
        <div class="insp-data-row">
          <span class="insp-label">Text:</span>
          <span class="insp-value">${snap.elementText}</span>
        </div>
      </div>
    `).join('') :
    '<div class="insp-empty">Click anywhere to save position snapshot</div>';

  inspectorPanel.innerHTML = `
    <div class="insp-header">
      <span class="insp-title">🔍 Position Inspector</span>
      <button class="insp-close" id="insp-close">×</button>
    </div>
    <div class="insp-body">
      ${currentHtml}
      <div class="insp-snapshots">
        <div class="insp-snapshots-header">
          <span class="insp-snapshots-title">Snapshots (${inspectorSnapshots.length})</span>
          ${inspectorSnapshots.length > 0 ? '<button class="insp-clear-btn" id="insp-clear">Clear</button>' : ''}
        </div>
        <div class="insp-snapshot-list">
          ${snapshotsHtml}
        </div>
      </div>
    </div>
  `;

  // Bind close button
  const closeBtn = inspectorPanel.querySelector('#insp-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', toggleInspector);
  }

  // Bind clear button
  const clearBtn = inspectorPanel.querySelector('#insp-clear');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      inspectorSnapshots = [];
      updateInspectorPanel(null);
    });
  }

  // Re-bind drag handler (since innerHTML was replaced)
  const header = inspectorPanel.querySelector('.insp-header');
  if (header && !header.hasAttribute('data-drag-bound')) {
    makeDraggable(inspectorPanel, header);
    header.setAttribute('data-drag-bound', 'true');
  }
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
async function playActions(actions, currentLoop = 1, totalLoops = 1) {
  for (let i = 0; i < actions.length; i++) {
    // Check if playback should stop
    if (shouldStopPlayback) {
      break;
    }

    const action = actions[i];
    // Use the exact recorded timing between clicks
    let delay = i === 0 ? 500 : (actions[i].timestamp - actions[i - 1].timestamp) || 500;

    // Add random delay if enabled
    if (isRandomDelayEnabled) {
      const randomDelay = Math.floor(Math.random() * (randomDelayMax - randomDelayMin + 1)) + randomDelayMin;
      delay += randomDelay;
    }

    // Update status with progress
    const statusEl = document.getElementById('mr-status');
    if (statusEl && !shouldStopPlayback) {
      if (totalLoops > 1) {
        statusEl.textContent = `🔄 Loop ${currentLoop}/${totalLoops} • Click ${i + 1}/${actions.length}`;
      } else {
        statusEl.textContent = `Playing ${i + 1}/${actions.length}...`;
      }
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
