// Fox Macro Recorder - Recording Functionality

function handleClick(event) {
  if (!isRecording) return;

  // Ignore clicks on the shadow host (our extension UI)
  if (event.target.closest('#fox-macro-shadow-host')) return;

  const element = event.target;
  const rect = element.getBoundingClientRect();

  const clickData = {
    type: 'click',
    selector: getSelector(element),
    x: event.clientX,
    y: event.clientY,
    pageX: event.pageX,
    pageY: event.pageY,
    elementX: event.clientX - rect.left,
    elementY: event.clientY - rect.top,
    timestamp: Date.now() - recordingStartTime,
    tagName: element.tagName.toLowerCase(),
    text: element.textContent?.slice(0, 50) || ''
  };

  recordedActions.push(clickData);

  // Update recording count in status strip
  const countEl = foxShadowRoot?.querySelector('.fox-rec-count');
  if (countEl) countEl.textContent = recordedActions.length;

  showClickFeedback(event.clientX, event.clientY, '#EF4444');
}

function startRecording() {
  isRecording = true;
  recordingStartTime = Date.now();
  recordedActions = [];

  // Update UI
  const statusStrip = foxShadowRoot?.querySelector('.fox-status-strip');
  const recordBtn = foxShadowRoot?.querySelector('#fox-record-btn');
  const stopBtn = foxShadowRoot?.querySelector('#fox-stop-btn');
  const saveBar = foxShadowRoot?.querySelector('.fox-save-bar');

  if (statusStrip) {
    statusStrip.className = 'fox-status-strip recording visible';
    statusStrip.innerHTML = `
      <div class="fox-status-left"><span class="fox-status-dot"></span><span>REC</span></div>
      <span class="fox-rec-count">0</span>
    `;
  }
  if (recordBtn) recordBtn.disabled = true;
  if (stopBtn) stopBtn.disabled = false;
  if (saveBar) saveBar.classList.remove('visible');
  if (foxPanel) foxPanel.classList.add('recording-mode');

  updateFabState();
  showToast('\u23FA Recording started', 'info');
}

function stopRecording() {
  isRecording = false;

  const statusStrip = foxShadowRoot?.querySelector('.fox-status-strip');
  const recordBtn = foxShadowRoot?.querySelector('#fox-record-btn');
  const stopBtn = foxShadowRoot?.querySelector('#fox-stop-btn');
  const saveBar = foxShadowRoot?.querySelector('.fox-save-bar');
  const saveInput = foxShadowRoot?.querySelector('#fox-save-input');

  if (statusStrip) {
    statusStrip.classList.remove('visible');
  }
  if (recordBtn) recordBtn.disabled = false;
  if (stopBtn) stopBtn.disabled = true;
  if (foxPanel) foxPanel.classList.remove('recording-mode');

  updateFabState();

  if (recordedActions.length > 0) {
    if (saveBar) saveBar.classList.add('visible');
    if (saveInput) {
      saveInput.value = '';
      saveInput.focus();
    }
    const domainInput = foxShadowRoot?.querySelector('#fox-save-domain');
    if (domainInput) {
      domainInput.value = window.location.hostname;
    }
    // Expand panel if minimized
    if (isPanelMinimized) expandPanel();
    // Switch to home tab
    if (activeTab !== 'home') switchTab('home');
  }
}
