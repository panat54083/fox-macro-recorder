// Fox Macro Recorder - Playback Functionality

async function playMacro(id, playBtn) {
  const result = await chrome.storage.local.get(['macros']);
  const macro = result.macros.find(m => m.id === id);
  if (!macro) return;

  const statusStrip = foxShadowRoot?.querySelector('.fox-status-strip');
  const loopCount = macro.loopCount || 1;
  const loopDelay = macro.loopDelay || 0;

  isPlaying = true;
  shouldStopPlayback = false;

  // Update status strip
  if (statusStrip) {
    statusStrip.className = 'fox-status-strip playing visible';
    statusStrip.innerHTML = `
      <div class="fox-status-left"><span class="fox-status-dot"></span><span>PLAY</span></div>
      <span class="fox-play-progress"></span>
    `;
  }

  // Change play button to stop
  if (playBtn) {
    playBtn.textContent = '\u23F9';
    playBtn.className = 'fox-action-btn fox-abtn-stop';
    playBtn.title = 'Stop';
  }

  // Update main play button
  const mainPlayBtn = foxShadowRoot?.querySelector('#fox-play-btn');
  if (mainPlayBtn) {
    mainPlayBtn.textContent = '\u23F9';
    mainPlayBtn.className = 'fox-ctrl-btn fox-btn-stop-main';
    mainPlayBtn.title = 'Stop';
  }

  // Disable macro select during playback
  const macroSelect = foxShadowRoot?.querySelector('#fox-macro-select');
  if (macroSelect) macroSelect.disabled = true;

  updateFabState();

  // Loop
  for (let loop = 0; loop < loopCount; loop++) {
    if (shouldStopPlayback) break;

    await playActions(macro.actions, loop + 1, loopCount);

    // Delay between loops
    if (loop < loopCount - 1 && loopDelay > 0 && !shouldStopPlayback) {
      let actualLoopDelay = loopDelay;
      if (isRandomDelayEnabled) {
        actualLoopDelay += Math.floor(Math.random() * (randomDelayMax - randomDelayMin + 1)) + randomDelayMin;
      }

      const progressEl = foxShadowRoot?.querySelector('.fox-play-progress');
      if (progressEl) progressEl.textContent = `\u23F8 ${loop + 2}/${loopCount}`;

      await new Promise(resolve => setTimeout(resolve, actualLoopDelay));
    }
  }

  // Reset state
  isPlaying = false;
  const stopped = shouldStopPlayback;
  shouldStopPlayback = false;

  if (statusStrip) statusStrip.classList.remove('visible');

  // Reset play button
  if (playBtn) {
    playBtn.textContent = '\u25B6';
    playBtn.className = 'fox-action-btn fox-abtn-play';
    playBtn.title = 'Play';
  }

  if (mainPlayBtn) {
    mainPlayBtn.textContent = '\u25B6';
    mainPlayBtn.className = 'fox-ctrl-btn fox-btn-play-main';
    mainPlayBtn.title = 'Play';
  }

  if (macroSelect) macroSelect.disabled = false;

  updateFabState();
  showToast(stopped ? '\u23F9 Playback stopped' : '\u2713 Playback complete', stopped ? 'info' : 'success');
}

async function simulateClick(action, delay) {
  return new Promise(resolve => {
    setTimeout(() => {
      const clickX = action.x;
      const clickY = action.y;

      showClickFeedback(clickX, clickY, '#3B82F6', true);

      const element = document.elementFromPoint(clickX, clickY);

      if (element) {
        const originalOutline = element.style.outline;
        const originalTransition = element.style.transition;
        element.style.transition = 'outline 0.2s';
        element.style.outline = '3px solid #3B82F6';
        setTimeout(() => {
          element.style.outline = originalOutline;
          element.style.transition = originalTransition;
        }, 500);

        ['mousedown', 'mouseup', 'click'].forEach(type => {
          element.dispatchEvent(new MouseEvent(type, {
            bubbles: true, cancelable: true,
            clientX: clickX, clientY: clickY, view: window
          }));
        });
      }

      resolve();
    }, delay);
  });
}

async function playActions(actions, currentLoop = 1, totalLoops = 1) {
  for (let i = 0; i < actions.length; i++) {
    if (shouldStopPlayback) break;

    const action = actions[i];
    let delay = i === 0 ? 500 : (actions[i].timestamp - actions[i - 1].timestamp) || 500;

    if (isRandomDelayEnabled) {
      delay += Math.floor(Math.random() * (randomDelayMax - randomDelayMin + 1)) + randomDelayMin;
    }

    // Update progress
    const progressEl = foxShadowRoot?.querySelector('.fox-play-progress');
    if (progressEl && !shouldStopPlayback) {
      progressEl.textContent = totalLoops > 1
        ? `${currentLoop}/${totalLoops} \u00B7 ${i + 1}/${actions.length}`
        : `${i + 1}/${actions.length}`;
    }

    await simulateClick(action, delay);
  }
}
