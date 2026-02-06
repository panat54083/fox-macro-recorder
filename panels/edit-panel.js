// Fox Macro Recorder - Edit Tab

let currentEditMacroId = null;

async function showEditTab(id) {
  currentEditMacroId = id;
  switchTab('edit');

  const container = foxShadowRoot?.querySelector('#fox-edit-content');
  if (!container) return;

  const result = await chrome.storage.local.get(['macros']);
  const macro = result.macros.find(m => m.id === id);

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

  container.innerHTML = `
    <div class="fox-edit-header">
      <button class="fox-back-btn" id="fox-edit-back">\u2190 Back</button>
      <button class="fox-edit-save-btn" id="fox-edit-save">\u2713 Save</button>
    </div>
    <div class="fox-edit-body">
      <input type="text" class="fox-edit-name" id="fox-edit-name" value="${macro.name}" placeholder="Macro name">
      <div class="fox-section-label">ACTIONS (${macro.actions.length})</div>
      <div class="fox-actions-list">${actionsHTML}</div>
    </div>
  `;

  // Back button
  container.querySelector('#fox-edit-back').addEventListener('click', () => {
    currentEditMacroId = null;
    switchTab('home');
  });

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

    // Save
    const saveResult = await chrome.storage.local.get(['macros']);
    const macros = saveResult.macros || [];
    const macroIndex = macros.findIndex(m => m.id === id);

    if (macroIndex !== -1) {
      macros[macroIndex] = { ...macro, name: newName, actions: updatedActions };
      await chrome.storage.local.set({ macros });
      loadMacros();
      showToast('\u2713 Macro updated', 'success');
    }

    currentEditMacroId = null;
    switchTab('home');
  });
}
