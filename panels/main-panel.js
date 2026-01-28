// Main panel creation and management

// Helper to format duration
function formatDuration(ms) {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

// Create floating panel
function createPanel() {
  if (panel) return;

  panel = document.createElement('div');
  panel.id = 'macro-recorder-panel';
  panel.innerHTML = `
    <div class="mr-header">
      <span class="mr-title">🦊 Fox Macro</span>
      <div class="mr-header-actions">
        <button class="mr-icon-btn" id="mr-inspector-btn" title="Inspector">🔍</button>
        <button class="mr-icon-btn" id="mr-settings-btn" title="Settings">⚙️</button>
        <button class="mr-icon-btn" id="mr-collapse-btn" title="Minimize">−</button>
        <button class="mr-icon-btn" id="mr-close-btn" title="Close">×</button>
      </div>
    </div>
    <div class="mr-body">
      <div class="mr-status" id="mr-status"><span class="mr-status-dot"></span><span class="mr-status-text">Ready</span></div>
      <div class="mr-controls">
        <button class="mr-ctrl-btn mr-btn-record" id="mr-record" title="Start Recording">⏺</button>
        <button class="mr-ctrl-btn mr-btn-stop" id="mr-stop" title="Stop" disabled>⏹</button>
      </div>
      <div class="mr-save" id="mr-save" style="display: none;">
        <input type="text" id="mr-name" placeholder="Macro name...">
        <button class="mr-save-btn" id="mr-save-btn" title="Save">✓</button>
      </div>
      <div class="mr-macros">
        <div class="mr-macros-list" id="mr-macros-list">
          <div class="mr-empty">No macros saved</div>
        </div>
      </div>
    </div>
    <div class="mr-resize-handle mr-resize-handle-e" data-resize="e"></div>
    <div class="mr-resize-handle mr-resize-handle-s" data-resize="s"></div>
    <div class="mr-resize-handle mr-resize-handle-w" data-resize="w"></div>
    <div class="mr-resize-handle mr-resize-handle-n" data-resize="n"></div>
    <div class="mr-resize-handle mr-resize-handle-se" data-resize="se"></div>
    <div class="mr-resize-handle mr-resize-handle-sw" data-resize="sw"></div>
    <div class="mr-resize-handle mr-resize-handle-ne" data-resize="ne"></div>
    <div class="mr-resize-handle mr-resize-handle-nw" data-resize="nw"></div>
  `;

  const style = document.createElement('style');
  style.id = 'macro-recorder-panel-styles';
  style.textContent = `
    #macro-recorder-panel {
      position: fixed;
      top: 20px;
      right: 20px;
      width: 380px;
      min-width: 280px;
      max-width: 90vw;
      min-height: 200px;
      max-height: 90vh;
      background: #fff;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.2);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      z-index: 2147483647;
      overflow: visible;
      font-size: 14px;
      display: flex;
      flex-direction: column;
    }
    #macro-recorder-panel.hidden { display: none; }
    #macro-recorder-panel.minimized .mr-body { display: none; }
    #macro-recorder-panel.minimized .mr-resize-handle { display: none; }
    #macro-recorder-panel.minimized { width: auto; min-width: auto; min-height: auto; }
    #macro-recorder-panel.resizing { transition: none; user-select: none; }
    .mr-resize-handle {
      position: absolute;
      z-index: 10;
    }
    .mr-resize-handle-e {
      right: -4px;
      top: 12px;
      bottom: 12px;
      width: 8px;
      cursor: ew-resize;
    }
    .mr-resize-handle-s {
      bottom: -4px;
      left: 12px;
      right: 12px;
      height: 8px;
      cursor: ns-resize;
    }
    .mr-resize-handle-w {
      left: -4px;
      top: 12px;
      bottom: 12px;
      width: 8px;
      cursor: ew-resize;
    }
    .mr-resize-handle-n {
      top: -4px;
      left: 12px;
      right: 12px;
      height: 8px;
      cursor: ns-resize;
    }
    .mr-resize-handle-se {
      right: -4px;
      bottom: -4px;
      width: 16px;
      height: 16px;
      cursor: nwse-resize;
    }
    .mr-resize-handle-sw {
      left: -4px;
      bottom: -4px;
      width: 16px;
      height: 16px;
      cursor: nesw-resize;
    }
    .mr-resize-handle-ne {
      right: -4px;
      top: -4px;
      width: 16px;
      height: 16px;
      cursor: nesw-resize;
    }
    .mr-resize-handle-nw {
      left: -4px;
      top: -4px;
      width: 16px;
      height: 16px;
      cursor: nwse-resize;
    }
    .mr-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 10px 14px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      cursor: move;
      user-select: none;
    }
    .mr-title { font-weight: 600; font-size: 14px; }
    .mr-header-actions { display: flex; gap: 4px; align-items: center; }
    .mr-icon-btn {
      background: rgba(255,255,255,0.15);
      border: none;
      color: white;
      width: 28px;
      height: 28px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
      transition: all 0.15s;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .mr-icon-btn:hover { background: rgba(255,255,255,0.25); transform: scale(1.05); }
    .mr-icon-btn.active { background: rgba(255,255,255,0.35); }
    .mr-body { padding: 12px; overflow-y: auto; flex: 1; min-height: 0; }
    .mr-status {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 8px 12px;
      border-radius: 6px;
      margin-bottom: 10px;
      font-weight: 500;
      font-size: 13px;
      background: #f5f5f5;
      color: #666;
    }
    .mr-status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #9e9e9e;
    }
    .mr-status.recording { background: #ffebee; color: #c62828; }
    .mr-status.recording .mr-status-dot { background: #ef5350; animation: mr-pulse-dot 1s infinite; }
    .mr-status.playing { background: #e3f2fd; color: #1565c0; }
    .mr-status.playing .mr-status-dot { background: #2196f3; animation: mr-pulse-dot 1s infinite; }
    @keyframes mr-pulse-dot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(0.8)} }
    .mr-controls { display: flex; gap: 8px; margin-bottom: 10px; justify-content: center; }
    .mr-ctrl-btn {
      width: 52px;
      height: 52px;
      border: none;
      border-radius: 50%;
      font-size: 22px;
      cursor: pointer;
      transition: all 0.15s;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .mr-ctrl-btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none !important; }
    .mr-btn-record { background: #ef5350; color: white; }
    .mr-btn-record:hover:not(:disabled) { background: #e53935; transform: scale(1.08); }
    .mr-btn-stop { background: #757575; color: white; }
    .mr-btn-stop:hover:not(:disabled) { background: #616161; transform: scale(1.08); }
    .mr-save { display: flex; gap: 8px; margin-bottom: 10px; }
    .mr-save input {
      flex: 1;
      padding: 10px 12px;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      font-size: 14px;
      transition: border-color 0.15s;
    }
    .mr-save input:focus { outline: none; border-color: #4caf50; }
    .mr-save-btn {
      width: 44px;
      height: 44px;
      border: none;
      border-radius: 8px;
      background: #4caf50;
      color: white;
      font-size: 20px;
      cursor: pointer;
      transition: all 0.15s;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .mr-save-btn:hover { background: #43a047; transform: scale(1.05); }
    .mr-macros {
      background: #fafafa;
      border-radius: 8px;
      padding: 10px;
      flex: 1;
      display: flex;
      flex-direction: column;
      min-height: 0;
      overflow: hidden;
    }
    .mr-macros-list { max-height: none; overflow-y: auto; flex: 1; }
    .mr-empty { color: #bbb; font-size: 13px; text-align: center; padding: 24px 12px; }
    .mr-macro-item {
      background: white;
      border-radius: 8px;
      padding: 10px 12px;
      margin-bottom: 6px;
      border: 1px solid #eee;
      transition: border-color 0.15s;
    }
    .mr-macro-item:hover { border-color: #ddd; }
    .mr-macro-row { display: flex; justify-content: space-between; align-items: center; }
    .mr-macro-name { font-weight: 600; font-size: 13px; color: #333; flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .mr-macro-info { font-size: 11px; color: #999; margin-left: 8px; white-space: nowrap; }
    .mr-macro-row2 { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; margin-top: 8px; gap: 8px 12px; }
    .mr-macro-actions { display: flex; gap: 4px; flex-shrink: 0; }
    .mr-action-btn {
      width: 32px;
      height: 32px;
      border: none;
      border-radius: 6px;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.15s;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .mr-action-btn:hover { transform: scale(1.1); }
    .mr-btn-play { background: #e3f2fd; color: #1976d2; }
    .mr-btn-play:hover { background: #bbdefb; }
    .mr-btn-edit { background: #f3e5f5; color: #7b1fa2; }
    .mr-btn-edit:hover { background: #e1bee7; }
    .mr-btn-export { background: #fff3e0; color: #f57c00; }
    .mr-btn-export:hover { background: #ffe0b2; }
    .mr-btn-delete { background: #ffebee; color: #d32f2f; }
    .mr-btn-delete:hover { background: #ffcdd2; }
    .mr-btn-stop-macro { background: #ff5722; color: white; }
    .mr-loop-controls { display: flex; gap: 6px; align-items: center; flex: 1 1 auto; justify-content: flex-end; min-width: 120px; }
    .mr-loop-item {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 13px;
      color: #666;
      flex: 1 1 48px;
      max-width: 80px;
    }
    .mr-loop-item input {
      width: 100%;
      min-width: 48px;
      padding: 5px 4px;
      border: 1px solid #e0e0e0;
      border-radius: 6px;
      font-size: 12px;
      text-align: center;
      transition: border-color 0.15s;
    }
    .mr-loop-item input:focus { outline: none; border-color: #667eea; }
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
    statusEl.querySelector('.mr-status-text').textContent = 'REC';
    statusEl.className = 'mr-status recording';
    recordBtn.disabled = true;
    stopBtn.disabled = false;
    saveSection.style.display = 'none';
  });

  stopBtn.addEventListener('click', () => {
    isRecording = false;
    statusEl.querySelector('.mr-status-text').textContent = `${recordedActions.length} recorded`;
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
    statusEl.querySelector('.mr-status-text').textContent = 'Ready';
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

  // Setup resize handles
  setupResizeHandles();

  // Load random delay setting
  loadRandomDelaySetting();
}

function setupResizeHandles() {
  const handles = panel.querySelectorAll('.mr-resize-handle');

  handles.forEach(handle => {
    handle.addEventListener('mousedown', (e) => {
      e.preventDefault();
      e.stopPropagation();

      const direction = handle.dataset.resize;
      const startX = e.clientX;
      const startY = e.clientY;
      const startWidth = panel.offsetWidth;
      const startHeight = panel.offsetHeight;
      const rect = panel.getBoundingClientRect();

      panel.classList.add('resizing');

      function onMouseMove(e) {
        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;

        let newWidth = startWidth;
        let newHeight = startHeight;
        let newLeft = rect.left;
        let newTop = rect.top;

        // Handle horizontal resize
        if (direction.includes('e')) {
          newWidth = Math.max(280, Math.min(startWidth + deltaX, window.innerWidth - rect.left - 10));
        }
        if (direction.includes('w')) {
          const possibleWidth = startWidth - deltaX;
          if (possibleWidth >= 280 && possibleWidth <= window.innerWidth * 0.9) {
            newWidth = possibleWidth;
            newLeft = rect.left + deltaX;
          }
        }

        // Handle vertical resize
        if (direction.includes('s')) {
          newHeight = Math.max(200, Math.min(startHeight + deltaY, window.innerHeight - rect.top - 10));
        }
        if (direction.includes('n')) {
          const possibleHeight = startHeight - deltaY;
          if (possibleHeight >= 200 && possibleHeight <= window.innerHeight * 0.9) {
            newHeight = possibleHeight;
            newTop = rect.top + deltaY;
          }
        }

        panel.style.width = newWidth + 'px';
        panel.style.height = newHeight + 'px';

        if (direction.includes('w')) {
          panel.style.left = newLeft + 'px';
          panel.style.right = 'auto';
        }
        if (direction.includes('n')) {
          panel.style.top = newTop + 'px';
        }
      }

      function onMouseUp() {
        panel.classList.remove('resizing');
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
      }

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    });
  });
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
    toggle.classList.toggle('active', isRandomDelayEnabled);
  }
  if (minInput) {
    minInput.value = randomDelayMin;
  }
  if (maxInput) {
    maxInput.value = randomDelayMax;
  }
}
