// Fox Macro Recorder - Unified Panel with Tab-Based Layout

function createPanel() {
  if (foxPanel) return;

  foxPanel = document.createElement('div');
  foxPanel.id = 'fox-panel';
  foxPanel.innerHTML = `
    <div class="fox-header">
      <div class="fox-header-left">
        <span class="fox-logo">\uD83E\uDD8A</span>
        <span class="fox-title">Fox</span>
      </div>
      <div class="fox-tabs">
        <button class="fox-tab-btn active" data-tab="home" title="Home">\uD83C\uDFE0</button>
        <button class="fox-tab-btn" data-tab="inspector" title="Inspector">\uD83D\uDD0D</button>
        <button class="fox-tab-btn" data-tab="settings" title="Settings">\u2699\uFE0F</button>
      </div>
      <div class="fox-header-actions">
        <button class="fox-icon-btn" id="fox-minimize-btn" title="Minimize">\u2212</button>
        <button class="fox-icon-btn" id="fox-close-btn" title="Close">\u00D7</button>
      </div>
    </div>

    <!-- Home Tab -->
    <div class="fox-tab-content active" data-tab="home">
      <div class="fox-control-bar">
        <button class="fox-ctrl-btn fox-btn-record" id="fox-record-btn" title="Record">\u23FA</button>
        <button class="fox-ctrl-btn fox-btn-stop" id="fox-stop-btn" title="Stop" disabled>\u23F9</button>
        <select class="fox-macro-select" id="fox-macro-select" title="Select macro">
          <option value="">No macros</option>
        </select>
        <button class="fox-ctrl-btn fox-btn-play-main" id="fox-play-btn" title="Play" disabled>\u25B6</button>
      </div>
      <div class="fox-status-strip"></div>
      <div class="fox-save-bar">
        <input type="text" class="fox-save-input" id="fox-save-input" placeholder="Macro name...">
        <button class="fox-save-btn" id="fox-save-btn" title="Save">\u2713</button>
      </div>
      <div class="fox-macros" id="fox-macros-list">
        <div class="fox-empty">No macros saved</div>
      </div>
    </div>

    <!-- Inspector Tab -->
    <div class="fox-tab-content" data-tab="inspector">
      <div id="fox-inspector-content"></div>
    </div>

    <!-- Settings Tab -->
    <div class="fox-tab-content" data-tab="settings">
      <div id="fox-settings-content"></div>
    </div>

    <!-- Resize Handles -->
    <div class="fox-resize fox-resize-e" data-resize="e"></div>
    <div class="fox-resize fox-resize-s" data-resize="s"></div>
    <div class="fox-resize fox-resize-w" data-resize="w"></div>
    <div class="fox-resize fox-resize-n" data-resize="n"></div>
    <div class="fox-resize fox-resize-se" data-resize="se"></div>
    <div class="fox-resize fox-resize-sw" data-resize="sw"></div>
    <div class="fox-resize fox-resize-ne" data-resize="ne"></div>
    <div class="fox-resize fox-resize-nw" data-resize="nw"></div>
  `;

  // Hide by default
  foxPanel.classList.add('hidden');

  // Add to shadow root
  foxShadowRoot.appendChild(foxPanel);

  // Make draggable
  makeDraggable(foxPanel, foxPanel.querySelector('.fox-header'));

  // Bind events
  bindPanelEvents();

  // Setup resize
  setupResizeHandles();

  // Load settings
  loadRandomDelaySetting();

  // Load macros
  loadMacros();

  // Render settings tab
  renderSettingsTab();

  // Render inspector tab
  renderInspectorTab();
}

function bindPanelEvents() {
  const recordBtn = foxShadowRoot.querySelector('#fox-record-btn');
  const stopBtn = foxShadowRoot.querySelector('#fox-stop-btn');
  const saveBtn = foxShadowRoot.querySelector('#fox-save-btn');
  const saveInput = foxShadowRoot.querySelector('#fox-save-input');
  const playBtn = foxShadowRoot.querySelector('#fox-play-btn');
  const macroSelect = foxShadowRoot.querySelector('#fox-macro-select');
  const minimizeBtn = foxShadowRoot.querySelector('#fox-minimize-btn');
  const closeBtn = foxShadowRoot.querySelector('#fox-close-btn');

  // Tab switching
  foxShadowRoot.querySelectorAll('.fox-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      switchTab(btn.dataset.tab);
    });
  });

  // Record
  recordBtn.addEventListener('click', startRecording);

  // Stop
  stopBtn.addEventListener('click', () => {
    if (isRecording) stopRecording();
    if (isPlaying) shouldStopPlayback = true;
  });

  // Save
  saveBtn.addEventListener('click', saveMacro);

  // Enter key saves
  saveInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') saveMacro();
  });

  // Play from dropdown
  playBtn.addEventListener('click', async () => {
    if (isPlaying) {
      shouldStopPlayback = true;
    } else {
      const selectedId = macroSelect.value;
      if (selectedId) {
        await playMacro(selectedId, null);
      }
    }
  });

  // Minimize
  minimizeBtn.addEventListener('click', minimizePanel);

  // Close
  closeBtn.addEventListener('click', () => {
    foxPanel.classList.add('hidden');
  });
}

function setupResizeHandles() {
  foxShadowRoot.querySelectorAll('.fox-resize').forEach(handle => {
    handle.addEventListener('mousedown', (e) => {
      e.preventDefault();
      e.stopPropagation();

      const direction = handle.dataset.resize;
      const startX = e.clientX;
      const startY = e.clientY;
      const startWidth = foxPanel.offsetWidth;
      const startHeight = foxPanel.offsetHeight;
      const rect = foxPanel.getBoundingClientRect();

      foxPanel.classList.add('resizing');

      function onMouseMove(e) {
        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;

        let newWidth = startWidth;
        let newHeight = startHeight;

        if (direction.includes('e')) {
          newWidth = Math.max(280, Math.min(startWidth + deltaX, window.innerWidth - rect.left - 10));
        }
        if (direction.includes('w')) {
          const possibleWidth = startWidth - deltaX;
          if (possibleWidth >= 280 && possibleWidth <= window.innerWidth * 0.9) {
            newWidth = possibleWidth;
            foxPanel.style.left = (rect.left + deltaX) + 'px';
            foxPanel.style.right = 'auto';
          }
        }
        if (direction.includes('s')) {
          newHeight = Math.max(200, Math.min(startHeight + deltaY, window.innerHeight - rect.top - 10));
        }
        if (direction.includes('n')) {
          const possibleHeight = startHeight - deltaY;
          if (possibleHeight >= 200 && possibleHeight <= window.innerHeight * 0.9) {
            newHeight = possibleHeight;
            foxPanel.style.top = (rect.top + deltaY) + 'px';
          }
        }

        foxPanel.style.width = newWidth + 'px';
        foxPanel.style.height = newHeight + 'px';
      }

      function onMouseUp() {
        foxPanel.classList.remove('resizing');
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
}
