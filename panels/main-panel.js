// Main panel creation and management

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
        <button class="mr-settings-btn" id="mr-settings-btn" title="Settings">⚙️</button>
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
    .mr-settings-btn {
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
    .mr-settings-btn:hover { background: rgba(255,255,255,0.3); transform: scale(1.1); }
    .mr-settings-btn.active { background: rgba(255,255,255,0.4); }
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
      line-height: 0;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0;
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

function bindPanelEvents() {
  const recordBtn = document.getElementById('mr-record');
  const stopBtn = document.getElementById('mr-stop');
  const saveBtn = document.getElementById('mr-save-btn');
  const nameInput = document.getElementById('mr-name');
  const saveSection = document.getElementById('mr-save');
  const statusEl = document.getElementById('mr-status');
  const inspectorBtn = document.getElementById('mr-inspector-btn');
  const settingsBtn = document.getElementById('mr-settings-btn');
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

  settingsBtn.addEventListener('click', () => {
    toggleSettings();
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

  // Load random delay setting
  loadRandomDelaySetting();
}

async function loadRandomDelaySetting() {
  const result = await chrome.storage.local.get(['randomDelayEnabled', 'randomDelayMin', 'randomDelayMax']);
  isRandomDelayEnabled = result.randomDelayEnabled || false;
  randomDelayMin = result.randomDelayMin || 100;
  randomDelayMax = result.randomDelayMax || 500;

  // Update settings panel if it exists
  const toggle = document.getElementById('settings-random-delay-toggle');
  const minInput = document.getElementById('settings-delay-min');
  const maxInput = document.getElementById('settings-delay-max');

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
