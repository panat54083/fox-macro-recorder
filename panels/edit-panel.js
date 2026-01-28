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

