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
        <button class="fox-tab-btn" id="fox-inspector-toggle" title="Inspector">\uD83D\uDD0D</button>
        <button class="fox-tab-btn" data-tab="settings" title="Settings">\u2699\uFE0F</button>
      </div>
      <div class="fox-header-actions">
        <button class="fox-icon-btn" id="fox-minimal-btn" title="Minimal mode">\u25A0</button>
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
        <div class="fox-save-domain-row">
          <input type="text" class="fox-save-domain" id="fox-save-domain" placeholder="Domain...">
          <button class="fox-save-btn" id="fox-save-btn" title="Save">\u2713</button>
        </div>
      </div>
      <div class="fox-domain-filter-bar">
        <select class="fox-domain-filter" id="fox-domain-filter" title="Filter by domain">
          <option value="__all__">All domains</option>
        </select>
      </div>
      <div class="fox-macros" id="fox-macros-list">
        <div class="fox-empty">No macros saved</div>
      </div>
    </div>

    <!-- Settings Tab -->
    <div class="fox-tab-content" data-tab="settings">
      <div id="fox-settings-content"></div>
    </div>
  `;

  // Hide by default
  foxPanel.classList.add('hidden');

  // Add to shadow root
  foxShadowRoot.appendChild(foxPanel);

  // Make draggable
  makeDraggable(foxPanel, foxPanel.querySelector('.fox-header'));

  // Bind events
  bindPanelEvents();

  // Load settings
  loadRandomDelaySetting();

  // Load macros
  loadMacros();

  // Render settings tab
  renderSettingsTab();
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
  foxShadowRoot.querySelectorAll('.fox-tab-btn[data-tab]').forEach(btn => {
    btn.addEventListener('click', () => {
      switchTab(btn.dataset.tab);
    });
  });

  // Inspector toggle (opens floating panel)
  foxShadowRoot.querySelector('#fox-inspector-toggle').addEventListener('click', toggleInspectorPanel);

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

  // Domain filter
  const domainFilter = foxShadowRoot.querySelector('#fox-domain-filter');
  domainFilter.addEventListener('change', () => loadMacros());

  // Minimal mode toggle
  const minimalBtn = foxShadowRoot.querySelector('#fox-minimal-btn');
  minimalBtn.addEventListener('click', () => {
    foxPanel.classList.toggle('minimal-mode');
    minimalBtn.textContent = foxPanel.classList.contains('minimal-mode') ? '\u25A1' : '\u25A0';
    minimalBtn.title = foxPanel.classList.contains('minimal-mode') ? 'Full mode' : 'Minimal mode';
  });

  // Minimize
  minimizeBtn.addEventListener('click', minimizePanel);

  // Close
  closeBtn.addEventListener('click', () => {
    foxPanel.classList.add('hidden');
  });
}

async function loadRandomDelaySetting() {
  const result = await chrome.storage.local.get(['randomDelayEnabled', 'randomDelayMin', 'randomDelayMax']);
  isRandomDelayEnabled = result.randomDelayEnabled || false;
  randomDelayMin = result.randomDelayMin || 100;
  randomDelayMax = result.randomDelayMax || 500;
}
