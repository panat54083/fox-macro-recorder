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
      width: min(280px, 90vw);
      background: #fff;
      border-radius: 12px;
      box-shadow: 0 12px 48px rgba(0,0,0,0.3);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      z-index: 2147483648;
      overflow: hidden;
      font-size: 14px;
      display: none;
    }
    #settings-panel.visible { display: block; }
    .settings-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 10px 14px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      cursor: move;
      user-select: none;
    }
    .settings-title { font-weight: 600; font-size: 14px; }
    .settings-close {
      background: rgba(255,255,255,0.15);
      border: none;
      color: white;
      width: 26px;
      height: 26px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 16px;
      line-height: 1;
      transition: all 0.15s;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .settings-close:hover { background: rgba(255,255,255,0.25); transform: scale(1.05); }
    .settings-body { padding: 14px; }
    .settings-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 12px;
      background: #fafafa;
      border-radius: 8px;
      margin-bottom: 8px;
    }
    .settings-row:last-child { margin-bottom: 0; }
    .settings-label {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      font-weight: 500;
      color: #333;
    }
    .settings-label-icon { font-size: 16px; }
    .settings-toggle {
      position: relative;
      width: 44px;
      height: 24px;
      background: #ddd;
      border-radius: 12px;
      cursor: pointer;
      transition: background 0.2s;
    }
    .settings-toggle.active { background: #667eea; }
    .settings-toggle-knob {
      position: absolute;
      top: 2px;
      left: 2px;
      width: 20px;
      height: 20px;
      background: white;
      border-radius: 50%;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      transition: transform 0.2s;
    }
    .settings-toggle.active .settings-toggle-knob { transform: translateX(20px); }
    .settings-range {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 12px;
      background: #fafafa;
      border-radius: 8px;
    }
    .settings-range-input {
      width: 56px;
      padding: 6px 8px;
      border: 1px solid #e0e0e0;
      border-radius: 6px;
      font-size: 13px;
      text-align: center;
      transition: border-color 0.15s;
    }
    .settings-range-input:focus { outline: none; border-color: #667eea; }
    .settings-range-sep { color: #999; font-size: 12px; }
    .settings-range-unit { color: #999; font-size: 12px; }
  `;
  document.head.appendChild(settingsStyle);

  settingsPanel.innerHTML = `
    <div class="settings-header">
      <span class="settings-title">⚙️ Settings</span>
      <button class="settings-close" id="settings-close">×</button>
    </div>
    <div class="settings-body">
      <div class="settings-row">
        <div class="settings-label">
          <span class="settings-label-icon">🎲</span>
          <span>Random Delay</span>
        </div>
        <div class="settings-toggle" id="settings-random-delay-toggle" title="Add random delays between clicks">
          <div class="settings-toggle-knob"></div>
        </div>
      </div>
      <div class="settings-range" title="Min and max delay range (ms)">
        <input type="number" id="settings-delay-min" class="settings-range-input" value="100" min="0" max="10000">
        <span class="settings-range-sep">—</span>
        <input type="number" id="settings-delay-max" class="settings-range-input" value="500" min="0" max="10000">
        <span class="settings-range-unit">ms</span>
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

  // Random delay toggle (custom toggle switch)
  const randomDelayToggle = document.getElementById('settings-random-delay-toggle');
  randomDelayToggle.addEventListener('click', async () => {
    isRandomDelayEnabled = !isRandomDelayEnabled;
    randomDelayToggle.classList.toggle('active', isRandomDelayEnabled);
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
      width: min(280px, 90vw);
      max-height: 50vh;
      background: #fff;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.25);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      z-index: 2147483647;
      overflow: hidden;
      font-size: 13px;
      display: none;
    }
    #inspector-panel.visible { display: block; }
    .insp-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 10px 14px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      cursor: move;
      user-select: none;
    }
    .insp-title { font-weight: 600; font-size: 14px; }
    .insp-close {
      background: rgba(255,255,255,0.15);
      border: none;
      color: white;
      width: 26px;
      height: 26px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 16px;
      line-height: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.15s;
    }
    .insp-close:hover { background: rgba(255,255,255,0.25); transform: scale(1.05); }
    .insp-body { padding: 12px; overflow-y: auto; max-height: calc(50vh - 50px); }
    .insp-current {
      background: #f5f7ff;
      border-radius: 8px;
      padding: 10px;
      margin-bottom: 10px;
    }
    .insp-coords {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 14px;
      font-weight: 600;
      color: #667eea;
      font-family: 'SF Mono', 'Courier New', monospace;
    }
    .insp-coords-icon { font-size: 12px; }
    .insp-element-info {
      font-size: 12px;
      color: #666;
      margin-top: 6px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .insp-element-tag { color: #667eea; font-weight: 500; }
    .insp-element-id { color: #e91e63; }
    .insp-empty { color: #bbb; font-size: 12px; text-align: center; padding: 12px; }
    .insp-snapshots { margin-top: 8px; }
    .insp-snapshots-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 6px;
    }
    .insp-snapshots-label {
      font-size: 11px;
      font-weight: 600;
      color: #999;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }
    .insp-clear-btn {
      background: none;
      border: none;
      color: #f44336;
      font-size: 11px;
      font-weight: 500;
      cursor: pointer;
      padding: 2px 6px;
    }
    .insp-clear-btn:hover { text-decoration: underline; }
    .insp-snapshot-list {
      max-height: 150px;
      overflow-y: auto;
    }
    .insp-snapshot-item {
      background: #fafafa;
      border-radius: 6px;
      padding: 8px 10px;
      margin-bottom: 4px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .insp-snapshot-item:last-child { margin-bottom: 0; }
    .insp-snap-num {
      font-size: 11px;
      font-weight: 600;
      color: #667eea;
      min-width: 20px;
    }
    .insp-snap-coords {
      font-size: 12px;
      font-family: 'SF Mono', 'Courier New', monospace;
      color: #333;
    }
    .insp-snap-time {
      font-size: 10px;
      color: #999;
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

  const elementInfo = currentData ?
    `<span class="insp-element-tag">&lt;${currentData.element}&gt;</span>${currentData.elementId !== '(none)' ? `<span class="insp-element-id">#${currentData.elementId}</span>` : ''}` : '';

  const currentHtml = currentData ? `
    <div class="insp-current">
      <div class="insp-coords">
        <span class="insp-coords-icon">✛</span>
        <span>${currentData.x}, ${currentData.y}</span>
      </div>
      <div class="insp-element-info" title="${currentData.elementText}">${elementInfo}</div>
    </div>
  ` : `
    <div class="insp-current">
      <div class="insp-empty">Move mouse to track position</div>
    </div>
  `;

  const snapshotsHtml = inspectorSnapshots.length > 0 ?
    inspectorSnapshots.map((snap, idx) => `
      <div class="insp-snapshot-item">
        <span class="insp-snap-num">${idx + 1}</span>
        <span class="insp-snap-coords">${snap.x}, ${snap.y}</span>
        <span class="insp-snap-time">${snap.time}</span>
      </div>
    `).join('') : '<div class="insp-empty">Click to capture snapshots</div>';

  inspectorPanel.innerHTML = `
    <div class="insp-header">
      <span class="insp-title">🔍 Inspector</span>
      <button class="insp-close" id="insp-close">×</button>
    </div>
    <div class="insp-body">
      ${currentHtml}
      <div class="insp-snapshots">
        <div class="insp-snapshots-header">
          <span class="insp-snapshots-label">Snapshots</span>
          ${inspectorSnapshots.length > 0 ? '<button class="insp-clear-btn" id="insp-clear">Clear</button>' : ''}
        </div>
        <div class="insp-snapshot-list">
          ${snapshotsHtml}
        </div>
      </div>
    </div>
  `;

  // Bind close button
  document.getElementById('insp-close').addEventListener('click', () => {
    toggleInspector();
  });

  // Bind clear button if it exists
  const clearBtn = document.getElementById('insp-clear');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      inspectorSnapshots = [];
      updateInspectorPanel(null);
    });
  }
}
