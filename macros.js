// Macro operations (CRUD)

async function loadMacros() {
  const list = document.getElementById('mr-macros-list');
  const result = await chrome.storage.local.get(['macros']);
  const macros = result.macros || [];

  if (macros.length === 0) {
    list.innerHTML = '<div class="mr-empty">No macros saved</div>';
    return;
  }

  list.innerHTML = macros.map(m => {
    const totalTime = m.actions.length > 0 ? m.actions[m.actions.length - 1].timestamp : 0;
    const loopCount = m.loopCount || 1;
    const loopDelay = m.loopDelay || 0;

    return `
    <div class="mr-macro-item" data-id="${m.id}">
      <div class="mr-macro-header">
        <span class="mr-macro-name">${m.name}</span>
        <span class="mr-macro-info">${m.actions.length} clicks · ${totalTime}ms total</span>
      </div>
      <div class="mr-macro-actions">
        <button class="mr-btn mr-btn-play" data-action="play">Play</button>
        <button class="mr-btn mr-btn-edit" data-action="edit">Edit</button>
        <button class="mr-btn mr-btn-export" data-action="export">Export</button>
        <button class="mr-btn mr-btn-delete" data-action="delete">Delete</button>
      </div>
      <div class="mr-loop-controls">
        <div class="mr-loop-control">
          <label class="mr-loop-label">Loop Count</label>
          <input type="number" class="mr-loop-count-input" value="${loopCount}" min="1" max="999" data-id="${m.id}">
        </div>
        <div class="mr-loop-control">
          <label class="mr-loop-label">Loop Delay (ms)</label>
          <input type="number" class="mr-loop-delay-input" value="${loopDelay}" min="0" data-id="${m.id}">
        </div>
      </div>
    </div>
    `;
  }).join('');

  list.querySelectorAll('.mr-macro-item').forEach(item => {
    const id = item.dataset.id;
    const playBtn = item.querySelector('[data-action="play"]');

    playBtn.addEventListener('click', async () => {
      if (isPlaying) {
        // Stop playback
        shouldStopPlayback = true;
      } else {
        // Start playback - button will be updated by playMacro
        await playMacro(id, playBtn);
      }
    });

    item.querySelector('[data-action="edit"]').addEventListener('click', () => openEditPanel(id));
    item.querySelector('[data-action="export"]').addEventListener('click', () => exportMacro(id));
    item.querySelector('[data-action="delete"]').addEventListener('click', () => deleteMacro(id));

    // Loop controls
    const loopCountInput = item.querySelector('.mr-loop-count-input');
    const loopDelayInput = item.querySelector('.mr-loop-delay-input');

    loopCountInput.addEventListener('change', async () => {
      const newLoopCount = parseInt(loopCountInput.value) || 1;
      await updateMacroLoopSettings(id, newLoopCount, null);
    });

    loopDelayInput.addEventListener('change', async () => {
      const newLoopDelay = parseInt(loopDelayInput.value) || 0;
      await updateMacroLoopSettings(id, null, newLoopDelay);
    });
  });
}

async function updateMacroLoopSettings(id, loopCount, loopDelay) {
  const result = await chrome.storage.local.get(['macros']);
  const macros = result.macros || [];
  const macroIndex = macros.findIndex(m => m.id === id);

  if (macroIndex !== -1) {
    if (loopCount !== null) {
      macros[macroIndex].loopCount = loopCount;
    }
    if (loopDelay !== null) {
      macros[macroIndex].loopDelay = loopDelay;
    }
    await chrome.storage.local.set({ macros });
  }
}

async function exportMacro(id) {
  const result = await chrome.storage.local.get(['macros']);
  const macro = result.macros.find(m => m.id === id);
  if (!macro) return;

  const blob = new Blob([JSON.stringify(macro, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${macro.name.replace(/[^a-z0-9]/gi, '_')}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

async function deleteMacro(id) {
  const result = await chrome.storage.local.get(['macros']);
  const macros = result.macros.filter(m => m.id !== id);
  await chrome.storage.local.set({ macros });
  loadMacros();
}
