// Fox Macro Recorder - FAB (Floating Action Button) Component

let foxFab = null;

function createFab() {
  if (foxFab) return;

  foxFab = document.createElement('button');
  foxFab.id = 'fox-fab';
  foxFab.textContent = '🦊';
  foxFab.title = 'Open Fox Macro';

  foxFab.addEventListener('click', () => {
    expandPanel();
  });

  // Make FAB draggable
  makeFabDraggable(foxFab);

  foxShadowRoot.appendChild(foxFab);
}

function makeFabDraggable(fab) {
  let offsetX, offsetY, isDragging = false;
  let startX, startY, wasDragged = false;

  fab.addEventListener('mousedown', (e) => {
    isDragging = true;
    wasDragged = false;
    startX = e.clientX;
    startY = e.clientY;
    offsetX = e.clientX - fab.getBoundingClientRect().left;
    offsetY = e.clientY - fab.getBoundingClientRect().top;
    e.preventDefault();
  });

  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) wasDragged = true;
    fab.style.left = (e.clientX - offsetX) + 'px';
    fab.style.top = (e.clientY - offsetY) + 'px';
    fab.style.right = 'auto';
    fab.style.bottom = 'auto';
  });

  document.addEventListener('mouseup', () => {
    isDragging = false;
  });

  // Override click to ignore drag
  fab.addEventListener('click', (e) => {
    if (wasDragged) {
      e.stopImmediatePropagation();
      wasDragged = false;
    }
  }, true);
}

function showFab() {
  if (!foxFab) createFab();
  foxFab.classList.add('visible');
}

function hideFab() {
  if (foxFab) foxFab.classList.remove('visible');
}

function updateFabState() {
  if (!foxFab) return;
  foxFab.classList.remove('recording', 'playing');
  if (isRecording) {
    foxFab.classList.add('recording');
  } else if (isPlaying) {
    foxFab.classList.add('playing');
  }
}

function minimizePanel() {
  if (foxPanel) {
    foxPanel.classList.add('hidden');
  }
  isPanelMinimized = true;
  showFab();
  updateFabState();
}

function expandPanel() {
  if (foxPanel) {
    foxPanel.classList.remove('hidden');
  }
  isPanelMinimized = false;
  hideFab();
}
