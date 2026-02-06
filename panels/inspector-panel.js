// Fox Macro Recorder - Inspector Tab

let isInspectorActive = false;
let inspectorSnapshots = [];

function renderInspectorTab() {
  const container = foxShadowRoot?.querySelector('#fox-inspector-content');
  if (!container) return;

  updateInspectorContent(null);
}

function activateInspector() {
  if (isInspectorActive) return;
  isInspectorActive = true;
  document.addEventListener('mousemove', trackMousePosition);
  document.addEventListener('click', captureSnapshot, true);
  showToast('\uD83D\uDD0D Inspector activated', 'info');
}

function deactivateInspector() {
  if (!isInspectorActive) return;
  isInspectorActive = false;
  document.removeEventListener('mousemove', trackMousePosition);
  document.removeEventListener('click', captureSnapshot, true);
}

function trackMousePosition(e) {
  if (!isInspectorActive) return;
  if (e.target.closest('#fox-macro-shadow-host')) return;

  const element = e.target;
  const data = {
    x: e.clientX,
    y: e.clientY,
    pageX: e.pageX,
    pageY: e.pageY,
    element: element.tagName.toLowerCase(),
    elementId: element.id || '',
    elementClass: element.className || '',
    elementText: element.textContent?.slice(0, 50) || ''
  };

  updateInspectorContent(data);
}

function captureSnapshot(e) {
  if (!isInspectorActive) return;
  if (e.target.closest('#fox-macro-shadow-host')) return;

  e.preventDefault();
  e.stopPropagation();

  const element = e.target;
  inspectorSnapshots.push({
    time: new Date().toLocaleTimeString(),
    x: e.clientX,
    y: e.clientY,
    pageX: e.pageX,
    pageY: e.pageY,
    element: element.tagName.toLowerCase(),
    elementId: element.id || '',
    elementText: element.textContent?.slice(0, 30) || ''
  });

  updateInspectorContent(null);
}

function updateInspectorContent(currentData) {
  const container = foxShadowRoot?.querySelector('#fox-inspector-content');
  if (!container) return;

  const currentHTML = currentData ? `
    <div class="fox-insp-current">
      <div class="fox-insp-coords">
        <span class="fox-insp-icon">\u271B</span>
        <span>${currentData.x}, ${currentData.y}</span>
      </div>
      <div class="fox-insp-element">
        <span class="fox-insp-tag">&lt;${currentData.element}&gt;</span>${currentData.elementId ? `<span class="fox-insp-id">#${currentData.elementId}</span>` : ''}
      </div>
    </div>
  ` : `
    <div class="fox-insp-current">
      <div class="fox-insp-empty">Move mouse to track position</div>
    </div>
  `;

  const snapshotsHTML = inspectorSnapshots.length > 0 ?
    inspectorSnapshots.map((snap, idx) => `
      <div class="fox-snap-item">
        <span class="fox-snap-num">${idx + 1}</span>
        <span class="fox-snap-coords">${snap.x}, ${snap.y}</span>
        <span class="fox-snap-time">${snap.time}</span>
      </div>
    `).join('') : '<div class="fox-insp-empty">Click to capture snapshots</div>';

  container.innerHTML = `
    <div class="fox-inspector-body">
      ${currentHTML}
      <div class="fox-snap-header">
        <span class="fox-section-label">SNAPSHOTS</span>
        ${inspectorSnapshots.length > 0 ? '<button class="fox-snap-clear" id="fox-snap-clear">Clear</button>' : ''}
      </div>
      <div class="fox-snap-list">${snapshotsHTML}</div>
    </div>
  `;

  // Bind clear
  const clearBtn = container.querySelector('#fox-snap-clear');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      inspectorSnapshots = [];
      updateInspectorContent(null);
    });
  }
}
