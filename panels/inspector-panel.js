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

// Toggle settings panel
function toggleSettings() {
  const settingsBtn = document.getElementById('mr-settings-btn');

  if (!settingsPanel) {
    createSettingsPanel();
  }

  const isVisible = settingsPanel.classList.contains('visible');

  if (isVisible) {
    settingsPanel.classList.remove('visible');
    settingsBtn.classList.remove('active');
  } else {
    settingsPanel.classList.add('visible');
    settingsBtn.classList.add('active');
  }
}

// Create settings panel
function createSettingsPanel() {
  settingsPanel = document.createElement('div');
  settingsPanel.id = 'settings-panel';
  document.body.appendChild(settingsPanel);

  const settingsStyle = document.createElement('style');
  settingsStyle.id = 'settings-panel-styles';
  settingsStyle.textContent = `
    #settings-panel {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: min(400px, 90vw);
      max-height: 60vh;
      background: #fff;
      border-radius: 12px;
      box-shadow: 0 12px 48px rgba(0,0,0,0.3);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      z-index: 2147483648;
      overflow: hidden;
      font-size: 15px;
      display: none;
    }
    #settings-panel.visible { display: block; }
    .settings-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 14px 18px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      cursor: move;
      user-select: none;
    }
    .settings-title { font-weight: 600; font-size: 16px; }
    .settings-close {
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
    .settings-close:hover { background: rgba(255,255,255,0.3); transform: scale(1.1); }
    .settings-body { padding: 20px; overflow-y: auto; max-height: calc(60vh - 70px); }
    .settings-section {
      margin-bottom: 24px;
      padding-bottom: 24px;
      border-bottom: 1px solid #eee;
    }
    .settings-section:last-child {
      margin-bottom: 0;
      padding-bottom: 0;
      border-bottom: none;
    }
    .settings-section-title {
      font-size: 14px;
      font-weight: 600;
      color: #666;
      margin-bottom: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .settings-random-delay {
      padding: 16px;
      background: #f0f7ff;
      border-radius: 8px;
      border: 1px solid #667eea33;
    }
    .settings-checkbox-label {
      display: flex;
      align-items: center;
      gap: 10px;
      cursor: pointer;
      font-size: 15px;
      color: #333;
      font-weight: 500;
      margin-bottom: 14px;
    }
    .settings-checkbox {
      width: 20px;
      height: 20px;
      cursor: pointer;
      accent-color: #667eea;
    }
    .settings-delay-range {
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding-left: 30px;
    }
    .settings-delay-field {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .settings-delay-label {
      font-size: 14px;
      color: #666;
      min-width: 80px;
      font-weight: 500;
    }
    .settings-delay-input {
      flex: 1;
      padding: 10px 12px;
      border: 2px solid #ddd;
      border-radius: 6px;
      font-size: 14px;
      text-align: center;
      transition: border-color 0.2s;
    }
    .settings-delay-input:focus {
      outline: none;
      border-color: #667eea;
    }
    .settings-delay-unit {
      color: #666;
      font-size: 14px;
      font-weight: 500;
    }
    .settings-help-text {
      font-size: 13px;
      color: #999;
      margin-top: 10px;
      line-height: 1.5;
    }
  `;
  document.head.appendChild(settingsStyle);

  settingsPanel.innerHTML = `
    <div class="settings-header">
      <span class="settings-title">⚙️ Settings</span>
      <button class="settings-close" id="settings-close">×</button>
    </div>
    <div class="settings-body">
      <div class="settings-section">
        <div class="settings-section-title">Random Delay</div>
        <div class="settings-random-delay">
          <label class="settings-checkbox-label">
            <input type="checkbox" id="settings-random-delay-toggle" class="settings-checkbox">
            <span>Enable Random Delay</span>
          </label>
          <div class="settings-delay-range">
            <div class="settings-delay-field">
              <span class="settings-delay-label">Minimum:</span>
              <input type="number" id="settings-delay-min" class="settings-delay-input" value="100" min="0" max="10000" placeholder="Min">
              <span class="settings-delay-unit">ms</span>
            </div>
            <div class="settings-delay-field">
              <span class="settings-delay-label">Maximum:</span>
              <input type="number" id="settings-delay-max" class="settings-delay-input" value="500" min="0" max="10000" placeholder="Max">
              <span class="settings-delay-unit">ms</span>
            </div>
          </div>
          <div class="settings-help-text">
            When enabled, a random delay between the min and max values will be added to each click during playback. This helps make automated clicks appear more natural.
          </div>
        </div>
      </div>
    </div>
  `;

  // Make panel draggable
  makeDraggable(settingsPanel, settingsPanel.querySelector('.settings-header'));

  // Load current settings
  loadRandomDelaySetting();

  // Bind events
  document.getElementById('settings-close').addEventListener('click', () => {
    toggleSettings();
  });

  // Random delay toggle
  const randomDelayToggle = document.getElementById('settings-random-delay-toggle');
  randomDelayToggle.addEventListener('change', async () => {
    isRandomDelayEnabled = randomDelayToggle.checked;
    await chrome.storage.local.set({ randomDelayEnabled: isRandomDelayEnabled });
  });

  // Random delay min/max inputs
  const delayMinInput = document.getElementById('settings-delay-min');
  const delayMaxInput = document.getElementById('settings-delay-max');

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
