    }
    .insp-clear-btn {
      background: #f44336;
      color: white;
      border: none;
      padding: 4px 12px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 500;
      cursor: pointer;
    }
    .insp-clear-btn:hover { background: #d32f2f; }
    .insp-snapshot-list {
      max-height: 200px;
      overflow-y: auto;
    }
    .insp-snapshot-item {
      background: white;
      border: 1px solid #eee;
      border-radius: 6px;
      padding: 10px;
      margin-bottom: 8px;
    }
    .insp-snapshot-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 6px;
    }
    .insp-snapshot-time {
      font-size: 11px;
      color: #999;
    }
    .insp-empty {
      text-align: center;
      padding: 20px;
      color: #999;
      font-size: 13px;
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

  const currentHtml = currentData ? `
    <div class="insp-current">
      <div class="insp-current-title">Current Position</div>
      <div class="insp-data-row">
        <span class="insp-label">X:</span>
        <span class="insp-value">${currentData.x}</span>
      </div>
      <div class="insp-data-row">
        <span class="insp-label">Y:</span>
        <span class="insp-value">${currentData.y}</span>
      </div>
      <div class="insp-data-row">
        <span class="insp-label">Element:</span>
        <span class="insp-element">&lt;${currentData.element}&gt;</span>
      </div>
      <div class="insp-data-row">
        <span class="insp-label">ID:</span>
        <span class="insp-value">${currentData.elementId}</span>
      </div>
      <div class="insp-data-row">
        <span class="insp-label">Text:</span>
        <span class="insp-value">${currentData.elementText}</span>
      </div>
    </div>
  ` : `
    <div class="insp-current">
      <div class="insp-current-title">Current Position</div>
      <div class="insp-empty">Move mouse to see position</div>
    </div>
  `;

  const snapshotsHtml = inspectorSnapshots.length > 0 ?
    inspectorSnapshots.map((snap, idx) => `
      <div class="insp-snapshot-item">
        <div class="insp-snapshot-header">
          <span style="font-weight: 600; font-size: 12px;">#${idx + 1}</span>
          <span class="insp-snapshot-time">${snap.time}</span>
