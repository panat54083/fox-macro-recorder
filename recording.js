// Recording functionality

// Handle click events during recording
function handleClick(event) {
  if (!isRecording) return;

  // Ignore clicks on the panel itself
  if (event.target.closest('#macro-recorder-panel')) return;

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

  // Visual feedback
  showClickFeedback(event.clientX, event.clientY, '#ef5350');
}
