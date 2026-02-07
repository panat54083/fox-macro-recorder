// Fox Macro Recorder - Edit Panel (Standalone Floating Panel)

let currentEditMacroId = null;
let foxEditPanel = null;

function openEditPanel(id) {
  // Close existing edit panel if open
  closeEditPanel();

  currentEditMacroId = id;

  // Load macro data then build panel
  chrome.storage.local.get(['macros']).then(result => {
    const macro = result.macros.find(m => m.id === id);
    if (!macro) {
      showToast('Macro not found', 'error');
      return;
    }

    foxEditPanel = document.createElement('div');
    foxEditPanel.id = 'fox-edit-panel';

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

    foxEditPanel.innerHTML = `
      <div class="fox-edit-panel-header">
        <div class="fox-edit-panel-title">\u270F\uFE0F Edit: ${macro.name}</div>
        <div class="fox-edit-panel-actions">
          <button class="fox-edit-save-btn" id="fox-edit-save">\u2713 Save</button>
          <button class="fox-icon-btn" id="fox-edit-close" title="Close">\u00D7</button>
        </div>
      </div>
      <div class="fox-edit-body">
        <input type="text" class="fox-edit-name" id="fox-edit-name" value="${macro.name}" placeholder="Macro name">
        <input type="text" class="fox-edit-domain" id="fox-edit-domain" value="${macro.domain || ''}" placeholder="Domain (e.g. example.com)">
        <div class="fox-section-label">ACTIONS (${macro.actions.length})</div>
        <div class="fox-actions-list">${actionsHTML}</div>
      </div>
    `;

    foxShadowRoot.appendChild(foxEditPanel);

    // Make draggable by header
    makeDraggable(foxEditPanel, foxEditPanel.querySelector('.fox-edit-panel-header'));

    // Close button
    foxEditPanel.querySelector('#fox-edit-close').addEventListener('click', closeEditPanel);

    // Save
    foxEditPanel.querySelector('#fox-edit-save').addEventListener('click', async () => {
      const newName = foxEditPanel.querySelector('#fox-edit-name').value.trim() || macro.name;
      const newDomain = foxEditPanel.querySelector('#fox-edit-domain').value.trim();

      const updatedActions = [...macro.actions];
      const xInputs = foxEditPanel.querySelectorAll('.fox-x-input[data-index]');
      const yInputs = foxEditPanel.querySelectorAll('.fox-y-input[data-index]');
      const delayInputs = foxEditPanel.querySelectorAll('.fox-delay-input[data-index]');

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
        macros[macroIndex] = { ...macro, name: newName, domain: newDomain, actions: updatedActions };
        await chrome.storage.local.set({ macros });
        loadMacros();
        showToast('\u2713 Macro updated', 'success');
      }

      closeEditPanel();
    });
  });
}

function closeEditPanel() {
  if (foxEditPanel) {
    foxEditPanel.remove();
    foxEditPanel = null;
    currentEditMacroId = null;
  }
}
