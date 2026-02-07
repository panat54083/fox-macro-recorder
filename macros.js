// Fox Macro Recorder - Macro Operations (CRUD)

let deleteConfirmMacroId = null;
let deleteConfirmTimer = null;

async function loadMacros() {
  const list = foxShadowRoot?.querySelector('#fox-macros-list');
  if (!list) return;

  const result = await chrome.storage.local.get(['macros']);
  const allMacros = result.macros || [];

  // Populate domain filter dropdown
  const domainFilter = foxShadowRoot?.querySelector('#fox-domain-filter');
  const selectedDomain = domainFilter?.value ?? '__all__';
  if (domainFilter) {
    const allDomains = [...new Set(allMacros.map(m => m.domain || ''))].sort((a, b) => {
      if (!a) return 1;
      if (!b) return -1;
      return a.localeCompare(b);
    });
    domainFilter.innerHTML = '<option value="__all__">All domains</option>' +
      allDomains.map(d => `<option value="${d}"${d === selectedDomain ? ' selected' : ''}>${d || 'Ungrouped'}</option>`).join('');
  }

  // Filter macros by selected domain
  const macros = selectedDomain !== '__all__'
    ? allMacros.filter(m => (m.domain || '') === selectedDomain)
    : allMacros;

  // Update macro select dropdown (uses filtered list)
  updateMacroSelect(macros);

  if (macros.length === 0) {
    list.innerHTML = '<div class="fox-empty">No macros saved</div>';
    return;
  }

  // Group macros by domain
  const groups = {};
  macros.forEach(m => {
    const domain = m.domain || '';
    if (!groups[domain]) groups[domain] = [];
    groups[domain].push(m);
  });

  // Sort domain keys: named domains first (alphabetically), ungrouped last
  const domainKeys = Object.keys(groups).sort((a, b) => {
    if (!a) return 1;
    if (!b) return -1;
    return a.localeCompare(b);
  });

  list.innerHTML = domainKeys.map(domain => {
    const header = `<div class="fox-domain-group-header">${domain || 'Ungrouped'}</div>`;
    const cards = groups[domain].map(m => {
      const totalTime = m.actions.length > 0 ? m.actions[m.actions.length - 1].timestamp : 0;
      const loopCount = m.loopCount || 1;
      const loopDelay = m.loopDelay || 0;
      const info = formatMacroInfo(m.actions.length, totalTime);
      const isConfirming = deleteConfirmMacroId === m.id;

      return `
      <div class="fox-macro-card${isConfirming ? ' confirm-delete' : ''}" data-id="${m.id}">
        ${isConfirming ? `
          <div class="fox-macro-row">
            <span class="fox-macro-name">Delete "${m.name}"?</span>
          </div>
          <div class="fox-delete-confirm">
            <button class="fox-btn-cancel-delete" data-action="cancel-delete">Cancel</button>
            <button class="fox-btn-confirm-delete" data-action="confirm-delete">Confirm Delete</button>
          </div>
        ` : `
          <div class="fox-macro-row">
            <span class="fox-macro-name">${m.name}</span>
            <span class="fox-macro-info">${info}</span>
          </div>
          <div class="fox-macro-row2">
            <div class="fox-macro-actions">
              <button class="fox-action-btn fox-abtn-play" data-action="play" title="Play">\u25B6</button>
              <button class="fox-action-btn fox-abtn-edit" data-action="edit" title="Edit">\u270E</button>
              <button class="fox-action-btn fox-abtn-delete" data-action="delete" title="Delete">\uD83D\uDDD1</button>
            </div>
            <div class="fox-loop-controls">
              <div class="fox-loop-item" title="Loop count">
                <span>\uD83D\uDD01</span>
                <input type="number" class="fox-loop-input fox-loop-count" value="${loopCount}" min="1" max="999" data-id="${m.id}">
              </div>
              <div class="fox-loop-item" title="Delay between loops (ms)">
                <span>\u23F1</span>
                <input type="number" class="fox-loop-input fox-loop-delay" value="${loopDelay}" min="0" data-id="${m.id}">
              </div>
            </div>
          </div>
        `}
      </div>
      `;
    }).join('');
    return header + cards;
  }).join('');

  // Bind events
  list.querySelectorAll('.fox-macro-card').forEach(card => {
    const id = card.dataset.id;

    // Play
    const playBtn = card.querySelector('[data-action="play"]');
    if (playBtn) {
      playBtn.addEventListener('click', async () => {
        if (isPlaying) {
          shouldStopPlayback = true;
        } else {
          await playMacro(id, playBtn);
        }
      });
    }

    // Edit
    card.querySelector('[data-action="edit"]')?.addEventListener('click', () => {
      openEditPanel(id);
    });

    // Delete (first click)
    card.querySelector('[data-action="delete"]')?.addEventListener('click', () => {
      showDeleteConfirm(id);
    });

    // Cancel delete
    card.querySelector('[data-action="cancel-delete"]')?.addEventListener('click', () => {
      cancelDeleteConfirm();
    });

    // Confirm delete
    card.querySelector('[data-action="confirm-delete"]')?.addEventListener('click', () => {
      confirmDelete(id);
    });

    // Loop controls
    const loopCountInput = card.querySelector('.fox-loop-count');
    const loopDelayInput = card.querySelector('.fox-loop-delay');

    loopCountInput?.addEventListener('change', async () => {
      await updateMacroLoopSettings(id, parseInt(loopCountInput.value) || 1, null);
    });

    loopDelayInput?.addEventListener('change', async () => {
      await updateMacroLoopSettings(id, null, parseInt(loopDelayInput.value) || 0);
    });
  });
}

function updateMacroSelect(macros) {
  const select = foxShadowRoot?.querySelector('#fox-macro-select');
  if (!select) return;

  if (macros.length > 0) {
    select.innerHTML = macros.map(m =>
      `<option value="${m.id}">${m.name}${m.domain ? ` (${m.domain})` : ''}</option>`
    ).join('');
    select.disabled = false;
  } else {
    select.innerHTML = '<option value="">No macros</option>';
    select.disabled = true;
  }

  const playBtn = foxShadowRoot?.querySelector('#fox-play-btn');
  if (playBtn) playBtn.disabled = macros.length === 0;
}

function showDeleteConfirm(macroId) {
  if (deleteConfirmTimer) clearTimeout(deleteConfirmTimer);
  deleteConfirmMacroId = macroId;
  loadMacros();

  // Auto-cancel after 5 seconds
  deleteConfirmTimer = setTimeout(() => {
    if (deleteConfirmMacroId === macroId) {
      cancelDeleteConfirm();
    }
  }, 5000);
}

function cancelDeleteConfirm() {
  if (deleteConfirmTimer) clearTimeout(deleteConfirmTimer);
  deleteConfirmMacroId = null;
  deleteConfirmTimer = null;
  loadMacros();
}

async function confirmDelete(id) {
  if (deleteConfirmTimer) clearTimeout(deleteConfirmTimer);
  deleteConfirmMacroId = null;
  deleteConfirmTimer = null;

  const result = await chrome.storage.local.get(['macros']);
  const macros = result.macros.filter(m => m.id !== id);
  await chrome.storage.local.set({ macros });
  loadMacros();
  showToast('\u2713 Macro deleted', 'success');
}

async function updateMacroLoopSettings(id, loopCount, loopDelay) {
  const result = await chrome.storage.local.get(['macros']);
  const macros = result.macros || [];
  const macroIndex = macros.findIndex(m => m.id === id);

  if (macroIndex !== -1) {
    if (loopCount !== null) macros[macroIndex].loopCount = loopCount;
    if (loopDelay !== null) macros[macroIndex].loopDelay = loopDelay;
    await chrome.storage.local.set({ macros });
  }
}

async function deleteMacro(id) {
  const result = await chrome.storage.local.get(['macros']);
  const macros = result.macros.filter(m => m.id !== id);
  await chrome.storage.local.set({ macros });
  loadMacros();
}

async function saveMacro() {
  const saveInput = foxShadowRoot?.querySelector('#fox-save-input');
  const domainInput = foxShadowRoot?.querySelector('#fox-save-domain');
  const saveBar = foxShadowRoot?.querySelector('.fox-save-bar');

  const name = saveInput?.value.trim() || `Macro ${Date.now()}`;
  const domain = domainInput?.value.trim() || '';
  const macro = {
    id: Date.now().toString(),
    name: name,
    domain: domain,
    createdAt: new Date().toISOString(),
    actions: recordedActions
  };

  const result = await chrome.storage.local.get(['macros']);
  const macros = result.macros || [];
  macros.push(macro);
  await chrome.storage.local.set({ macros });

  if (saveBar) saveBar.classList.remove('visible');
  recordedActions = [];
  loadMacros();
  showToast('\u2713 Macro saved', 'success');
}
