// Playback functionality

async function playMacro(id, playBtn) {
  const result = await chrome.storage.local.get(['macros']);
  const macro = result.macros.find(m => m.id === id);
  if (macro) {
    const statusEl = document.getElementById('mr-status');
    const loopCount = macro.loopCount || 1;
    const loopDelay = macro.loopDelay || 0;

    isPlaying = true;
    shouldStopPlayback = false;
    statusEl.textContent = 'Playing...';
    statusEl.className = 'mr-status playing';

    // Change button to Stop
    if (playBtn) {
      playBtn.textContent = 'Stop';
      playBtn.className = 'mr-btn mr-btn-stop-macro';
    }

    // Loop through the macro the specified number of times
    for (let loop = 0; loop < loopCount; loop++) {
      if (shouldStopPlayback) break;

      await playActions(macro.actions, loop + 1, loopCount);

      // Add delay between loops (except after the last loop)
      if (loop < loopCount - 1 && loopDelay > 0 && !shouldStopPlayback) {
        let actualLoopDelay = loopDelay;

        // Add random delay if enabled
        if (isRandomDelayEnabled) {
          const randomDelay = Math.floor(Math.random() * (randomDelayMax - randomDelayMin + 1)) + randomDelayMin;
          actualLoopDelay += randomDelay;
        }

        if (statusEl) {
          statusEl.textContent = `⏸ Waiting ${actualLoopDelay}ms before loop ${loop + 2}/${loopCount}...`;
        }
        await new Promise(resolve => setTimeout(resolve, actualLoopDelay));
      }
    }

    isPlaying = false;
    statusEl.textContent = shouldStopPlayback ? 'Stopped' : 'Ready';
    statusEl.className = 'mr-status';
    shouldStopPlayback = false;

    // Change button back to Play
    if (playBtn) {
      playBtn.textContent = 'Play';
      playBtn.className = 'mr-btn mr-btn-play';
    }
  }
}

// Simulate a click using coordinates
async function simulateClick(action, delay) {
  return new Promise(resolve => {
    setTimeout(() => {
      // Use exact recorded coordinates
      const clickX = action.x;
      const clickY = action.y;

      // Show feedback with playback effect
      showClickFeedback(clickX, clickY, '#2196f3', true);

      // Get element at coordinates
      const element = document.elementFromPoint(clickX, clickY);

      if (element) {
        // Highlight the element being clicked
        const originalOutline = element.style.outline;
        const originalTransition = element.style.transition;
        element.style.transition = 'outline 0.2s';
        element.style.outline = '3px solid #2196f3';
        setTimeout(() => {
          element.style.outline = originalOutline;
          element.style.transition = originalTransition;
        }, 500);

        // Dispatch mouse events at exact coordinates
        const mousedownEvent = new MouseEvent('mousedown', {
          bubbles: true,
          cancelable: true,
          clientX: clickX,
          clientY: clickY,
          view: window
        });
        element.dispatchEvent(mousedownEvent);

        const mouseupEvent = new MouseEvent('mouseup', {
          bubbles: true,
          cancelable: true,
          clientX: clickX,
          clientY: clickY,
          view: window
        });
        element.dispatchEvent(mouseupEvent);

        const clickEvent = new MouseEvent('click', {
          bubbles: true,
          cancelable: true,
          clientX: clickX,
          clientY: clickY,
          view: window
        });
        element.dispatchEvent(clickEvent);
      } else {
        console.log('No element at coordinates:', clickX, clickY);
      }

      resolve();
    }, delay);
  });
}

// Play back a sequence of actions with original timing
async function playActions(actions, currentLoop = 1, totalLoops = 1) {
  for (let i = 0; i < actions.length; i++) {
    // Check if playback should stop
    if (shouldStopPlayback) {
      break;
    }

    const action = actions[i];
    // Use the exact recorded timing between clicks
    let delay = i === 0 ? 500 : (actions[i].timestamp - actions[i - 1].timestamp) || 500;

    // Add random delay if enabled
    if (isRandomDelayEnabled) {
      const randomDelay = Math.floor(Math.random() * (randomDelayMax - randomDelayMin + 1)) + randomDelayMin;
      delay += randomDelay;
    }

    // Update status with progress
    const statusEl = document.getElementById('mr-status');
    if (statusEl && !shouldStopPlayback) {
      if (totalLoops > 1) {
        statusEl.textContent = `🔄 Loop ${currentLoop}/${totalLoops} • Click ${i + 1}/${actions.length}`;
      } else {
        statusEl.textContent = `Playing ${i + 1}/${actions.length}...`;
      }
    }

    await simulateClick(action, delay);
  }
}
