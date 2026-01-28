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
        width: min(480px, 90vw);
        max-height: 85vh;
        background: #fff;
        border-radius: 12px;
        box-shadow: 0 12px 48px rgba(0,0,0,0.3);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        z-index: 2147483648;
        overflow: hidden;
        font-size: 14px;
        display: none;
      }
      #macro-edit-panel.visible { display: block; }
      .me-header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 12px 16px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        cursor: move;
        user-select: none;
      }
      .me-title { font-weight: 600; font-size: 14px; }
      .me-close {
        background: rgba(255,255,255,0.2);
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
      .me-close:hover { background: rgba(255,255,255,0.3); transform: scale(1.05); }
      .me-body { padding: 16px; overflow-y: auto; max-height: calc(85vh - 110px); }
      .me-section { margin-bottom: 16px; }
      .me-section:last-child { margin-bottom: 0; }
      .me-section-label {
        font-size: 11px;
        font-weight: 600;
        color: #999;
        margin-bottom: 6px;
        text-transform: uppercase;
        letter-spacing: 0.3px;
      }
      .me-name-input {
        width: 100%;
        padding: 10px 12px;
        border: 2px solid #e0e0e0;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 600;
        transition: border-color 0.15s;
      }
      .me-name-input:focus { outline: none; border-color: #667eea; }
      .me-actions-list {
        background: #fafafa;
        border-radius: 8px;
        padding: 8px;
        max-height: 240px;
        overflow-y: auto;
      }
      .me-action-item {
        background: white;
        border-radius: 6px;
        padding: 8px 10px;
        margin-bottom: 4px;
        display: flex;
        align-items: center;
        gap: 10px;
        border: 1px solid #eee;
        transition: border-color 0.15s;
      }
      .me-action-item:hover { border-color: #ddd; }
      .me-action-item:last-child { margin-bottom: 0; }
      .me-action-num {
        background: #667eea;
        color: white;
        min-width: 22px;
        height: 22px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 11px;
        font-weight: 600;
      }
      .me-action-text {
        flex: 1;
        font-size: 12px;
        color: #666;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .me-action-coords {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 11px;
        color: #999;
      }
      .me-coord-input {
        width: 48px;
        padding: 4px 6px;
        border: 1px solid #e0e0e0;
        border-radius: 4px;
        font-size: 11px;
        text-align: center;
        transition: border-color 0.15s;
      }
      .me-coord-input:focus { outline: none; border-color: #667eea; }
      .me-delay-chip {
        display: flex;
        align-items: center;
        gap: 2px;
        background: #f5f5f5;
        padding: 4px 6px;
        border-radius: 4px;
        font-size: 11px;
        color: #666;
      }
      .me-delay-input {
        width: 50px;
        padding: 4px 6px;
        border: 1px solid #e0e0e0;
        border-radius: 4px;
        font-size: 11px;
        text-align: center;
        transition: border-color 0.15s;
      }
      .me-delay-input:focus { outline: none; border-color: #667eea; }
      .me-combine-select {
        width: 100%;
        padding: 8px 10px;
        border: 2px solid #e0e0e0;
        border-radius: 6px;
        font-size: 13px;
        background: white;
        cursor: pointer;
      }
      .me-combine-select:focus { outline: none; border-color: #667eea; }
      .me-combined-item {
        background: #e3f2fd;
        border: 1px solid #90caf9;
        border-radius: 6px;
        padding: 8px 10px;
        margin-top: 6px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .me-combined-name { font-size: 13px; color: #1565c0; font-weight: 500; }
      .me-combined-controls { display: flex; gap: 8px; align-items: center; }
      .me-btn-remove {
        background: none;
        border: none;
        color: #f44336;
        font-size: 16px;
        cursor: pointer;
        padding: 2px;
        line-height: 1;
      }
      .me-btn-remove:hover { transform: scale(1.1); }
      .me-footer {
        padding: 12px 16px;
        border-top: 1px solid #eee;
        display: flex;
        gap: 8px;
        background: #fafafa;
      }
      .me-btn {
        flex: 1;
        padding: 10px 16px;
        border: none;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.15s;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
      }
      .me-btn-cancel { background: #e0e0e0; color: #666; }
      .me-btn-cancel:hover { background: #d5d5d5; }
      .me-btn-save { background: #4caf50; color: white; }
      .me-btn-save:hover { background: #43a047; transform: scale(1.02); }
    `;
    document.head.appendChild(editStyle);
  }

  // Build actions list HTML
  let actionsHTML = macro.actions.map((action, index) => {
    const delay = index === 0 ? 0 : (action.timestamp - macro.actions[index - 1].timestamp);
    const text = action.text ? action.text.slice(0, 20) : 'Click';
    return `
      <div class="me-action-item">
        <div class="me-action-num">${index + 1}</div>
        <div class="me-action-text" title="${action.text || 'Click'}">${text}</div>
        <div class="me-action-coords">
          <input type="number" class="me-coord-input me-x-input" data-index="${index}" value="${Math.round(action.x)}" min="0" title="X">
          <span>,</span>
          <input type="number" class="me-coord-input me-y-input" data-index="${index}" value="${Math.round(action.y)}" min="0" title="Y">
        </div>
        ${index > 0 ? `
          <div class="me-delay-chip">
            <span>+</span>
            <input type="number" class="me-delay-input" data-index="${index}" value="${delay}" min="0" title="Delay (ms)">
          </div>
        ` : ''}
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
      <span class="me-title">✎ Edit</span>
      <button class="me-close" id="me-close">×</button>
    </div>
    <div class="me-body">
      <div class="me-section">
        <input type="text" class="me-name-input" id="me-name-input" value="${macro.name}" placeholder="Macro name">
      </div>

      <div class="me-section">
        <div class="me-section-label">${macro.actions.length} actions</div>
        <div class="me-actions-list">
          ${actionsHTML}
        </div>
      </div>

      ${otherMacros.length > 0 ? `
      <div class="me-section">
        <div class="me-section-label">Combine</div>
        <select class="me-combine-select" id="me-combine-select">
          <option value="">+ Add macro...</option>
          ${combineOptionsHTML}
        </select>
        <div id="me-combined-list"></div>
      </div>
      ` : ''}
    </div>
    <div class="me-footer">
      <button class="me-btn me-btn-cancel" id="me-cancel">×</button>
      <button class="me-btn me-btn-save" id="me-save">✓ Save</button>
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
        <div class="me-combined-controls">
          <div class="me-delay-chip">
            <span>+</span>
            <input type="number" class="me-delay-input" data-combined-index="${idx}"
                   value="${cm.delay}" min="0" title="Delay before (ms)">
          </div>
          <button class="me-btn-remove" data-combined-index="${idx}" title="Remove">×</button>
        </div>
      </div>
    `).join('');

    // Bind remove buttons
    combinedList.querySelectorAll('.me-btn-remove').forEach(btn => {
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

