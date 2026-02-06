// Fox Macro Recorder - Edit Tab

let currentEditMacroId = null;

async function showEditTab(id) {
  currentEditMacroId = id;
  switchTab('edit');

  const container = foxShadowRoot?.querySelector('#fox-edit-content');
  if (!container) return;

  const result = await chrome.storage.local.get(['macros']);
  const macro = result.macros.find(m => m.id === id);
  const allMacros = result.macros || [];

  if (!macro) {
    container.innerHTML = '<div class="fox-empty" style="padding:32px">Macro not found</div>';
    return;
  }

  // Build actions list
  const actionsHTML = macro.actions.map((action, index) => {
    const delay = index === 0 ? 0 : (action.timestamp - macro.actions[index - 1].timestamp);
    const text = action.text ? action.text.slice(0, 20) : 'Click';
    return `
      <div class="fox-action-item">
        <div class="fox-action-num">${index + 1}</div>
        <div class="fox-action-text" title="${action.text || 'Click'}">${text}</div>
        <div class="fox-action-coords">
          <input type="number" class="fox-coord-input fox-x-input" data-index="${index}" value="${Math.round(action.x)}" min="0" title="X">
          <span>,</span>
          <input type="number" class="fox-coord-input fox-y-input" data-index="${index}" value="${Math.round(action.y)}" min="0" title="Y">
        </div>
        ${index > 0 ? `
          <div class="fox-delay-chip">
            <span>+</span>
            <input type="number" class="fox-delay-input" data-index="${index}" value="${delay}" min="0" title="Delay (ms)">
          </div>
        ` : ''}
      </div>
    `;
  }).join('');

  // Build combine options
  const otherMacros = allMacros.filter(m => m.id !== id);
  const combineHTML = otherMacros.length > 0 ? `
    <div class="fox-combine-section">
      <div class="fox-section-label">COMBINE</div>
      <select class="fox-combine-select" id="fox-combine-select">
        <option value="">+ Add macro...</option>
        ${otherMacros.map(m =>
          `<option value="${m.id}">${m.name} (${m.actions.length})</option>`
        ).join('')}
      </select>
      <div id="fox-combined-list"></div>
    </div>
  ` : '';

  container.innerHTML = `
    <div class="fox-edit-header">
      <button class="fox-back-btn" id="fox-edit-back">\u2190 Back</button>
      <button class="fox-edit-save-btn" id="fox-edit-save">\u2713 Save</button>
    </div>
    <div class="fox-edit-body">
      <input type="text" class="fox-edit-name" id="fox-edit-name" value="${macro.name}" placeholder="Macro name">
      <div class="fox-section-label">ACTIONS (${macro.actions.length})</div>
      <div class="fox-actions-list">${actionsHTML}</div>
      ${combineHTML}
    </div>
  `;

  // Track combined macros
  let combinedMacros = [];

  // Back button
  container.querySelector('#fox-edit-back').addEventListener('click', () => {
    currentEditMacroId = null;
    switchTab('home');
  });

  // Combine functionality
  const combineSelect = container.querySelector('#fox-combine-select');
  const combinedList = container.querySelector('#fox-combined-list');

  if (combineSelect && combinedList) {
    combineSelect.addEventListener('change', () => {
      const selectedId = combineSelect.value;
      if (!selectedId) return;

      const selectedMacro = allMacros.find(m => m.id === selectedId);
      if (!selectedMacro || combinedMacros.find(cm => cm.id === selectedId)) {
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
      <div class="fox-combined-item">
        <span class="fox-combined-name">${cm.name}</span>
        <div class="fox-combined-controls">
          <div class="fox-delay-chip">
            <span>+</span>
            <input type="number" class="fox-delay-input" data-combined-index="${idx}" value="${cm.delay}" min="0" title="Delay before (ms)">
          </div>
          <button class="fox-btn-remove" data-combined-index="${idx}" title="Remove">\u00D7</button>
        </div>
      </div>
    `).join('');

    combinedList.querySelectorAll('.fox-btn-remove').forEach(btn => {
      btn.addEventListener('click', () => {
        combinedMacros.splice(parseInt(btn.dataset.combinedIndex), 1);
        updateCombinedList();
      });
    });

    combinedList.querySelectorAll('.fox-delay-input').forEach(input => {
      input.addEventListener('change', () => {
        combinedMacros[parseInt(input.dataset.combinedIndex)].delay = parseInt(input.value) || 0;
      });
    });
  }

  // Save
  container.querySelector('#fox-edit-save').addEventListener('click', async () => {
    const newName = container.querySelector('#fox-edit-name').value.trim() || macro.name;

    const updatedActions = [...macro.actions];
    const xInputs = container.querySelectorAll('.fox-x-input[data-index]');
    const yInputs = container.querySelectorAll('.fox-y-input[data-index]');
    const delayInputs = container.querySelectorAll('.fox-delay-input[data-index]');

    // Update positions
    xInputs.forEach(input => {
      updatedActions[parseInt(input.dataset.index)].x = parseFloat(input.value) || 0;
    });
    yInputs.forEach(input => {
      updatedActions[parseInt(input.dataset.index)].y = parseFloat(input.value) || 0;
    });

    // Update delays
    delayInputs.forEach(input => {
      const index = parseInt(input.dataset.index);
      const newDelay = parseInt(input.value) || 0;
      if (index > 0) {
        updatedActions[index].timestamp = updatedActions[index - 1].timestamp + newDelay;
        for (let i = index + 1; i < updatedActions.length; i++) {
          const originalDelay = macro.actions[i].timestamp - macro.actions[i - 1].timestamp;
          updatedActions[i].timestamp = updatedActions[i - 1].timestamp + originalDelay;
        }
      }
    });

    // Handle combines
    let finalActions = updatedActions;
    if (combinedMacros.length > 0) {
      const combineResult = await chrome.storage.local.get(['macros']);
      const allCurrentMacros = combineResult.macros || [];
      let currentTime = updatedActions.length > 0 ? updatedActions[updatedActions.length - 1].timestamp : 0;

      for (const cm of combinedMacros) {
        const macroToAdd = allCurrentMacros.find(m => m.id === cm.id);
        if (!macroToAdd) continue;
        currentTime += cm.delay;
        macroToAdd.actions.forEach(action => {
          finalActions.push({ ...action, timestamp: currentTime + action.timestamp });
        });
        if (macroToAdd.actions.length > 0) {
          currentTime += macroToAdd.actions[macroToAdd.actions.length - 1].timestamp;
        }
      }
    }

    // Save
    const saveResult = await chrome.storage.local.get(['macros']);
    const macros = saveResult.macros || [];
    const macroIndex = macros.findIndex(m => m.id === id);

    if (macroIndex !== -1) {
      macros[macroIndex] = { ...macro, name: newName, actions: finalActions };
      await chrome.storage.local.set({ macros });
      loadMacros();
      showToast('\u2713 Macro updated', 'success');
    }

    currentEditMacroId = null;
    switchTab('home');
  });
}
