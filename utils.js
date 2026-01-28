// Utility functions

function makeDraggable(element, handle) {
  let offsetX, offsetY, isDragging = false;

  handle.addEventListener('mousedown', (e) => {
    isDragging = true;
    offsetX = e.clientX - element.offsetLeft;
    offsetY = e.clientY - element.offsetTop;
    e.preventDefault();
  });

  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    element.style.left = (e.clientX - offsetX) + 'px';
    element.style.top = (e.clientY - offsetY) + 'px';
    element.style.right = 'auto';
  });

  document.addEventListener('mouseup', () => { isDragging = false; });
}

// Generate a unique CSS selector for an element
function getSelector(element) {
  if (element.id) {
    return `#${element.id}`;
  }

  if (element.tagName === 'BODY') {
    return 'body';
  }

  const path = [];
  let current = element;

  while (current && current.tagName !== 'BODY') {
    let selector = current.tagName.toLowerCase();

    if (current.id) {
      selector = `#${current.id}`;
      path.unshift(selector);
      break;
    }

    if (current.className && typeof current.className === 'string') {
      const classes = current.className.trim().split(/\s+/).filter(c => c);
      if (classes.length > 0) {
        selector += '.' + classes.slice(0, 2).join('.');
      }
    }

    // Add nth-child if needed for uniqueness
    const parent = current.parentElement;
    if (parent) {
      const siblings = Array.from(parent.children).filter(
        child => child.tagName === current.tagName
      );
      if (siblings.length > 1) {
        const index = siblings.indexOf(current) + 1;
        selector += `:nth-of-type(${index})`;
      }
    }

    path.unshift(selector);
    current = current.parentElement;
  }

  return path.join(' > ');
}

// Show visual feedback for clicks
function showClickFeedback(x, y, color, isPlayback = false) {
  // Add animation keyframes if not exists
  if (!document.getElementById('macro-recorder-styles')) {
    const style = document.createElement('style');
    style.id = 'macro-recorder-styles';
    style.textContent = `
      @keyframes clickPulse {
        0% { transform: scale(1); opacity: 0.7; }
        100% { transform: scale(2); opacity: 0; }
      }
      @keyframes clickRipple {
        0% { transform: scale(0.5); opacity: 1; }
        50% { transform: scale(1.5); opacity: 0.6; }
        100% { transform: scale(3); opacity: 0; }
      }
      @keyframes cursorBlink {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }
    `;
    document.head.appendChild(style);
  }

  if (isPlayback) {
    // Create ripple effect
    const ripple = document.createElement('div');
    ripple.style.cssText = `
      position: fixed;
      left: ${x - 30}px;
      top: ${y - 30}px;
      width: 60px;
      height: 60px;
      border: 4px solid ${color};
      border-radius: 50%;
      pointer-events: none;
      z-index: 2147483646;
      animation: clickRipple 0.8s ease-out forwards;
    `;
    document.body.appendChild(ripple);
    setTimeout(() => ripple.remove(), 800);

    // Create center dot
    const dot = document.createElement('div');
    dot.style.cssText = `
      position: fixed;
      left: ${x - 12}px;
      top: ${y - 12}px;
      width: 24px;
      height: 24px;
      background: ${color};
      border-radius: 50%;
      pointer-events: none;
      z-index: 2147483646;
      box-shadow: 0 0 20px ${color};
      animation: clickPulse 0.6s ease-out forwards;
    `;
    document.body.appendChild(dot);
    setTimeout(() => dot.remove(), 600);

    // Create click text indicator
    const label = document.createElement('div');
    label.textContent = 'CLICK';
    label.style.cssText = `
      position: fixed;
      left: ${x + 20}px;
      top: ${y - 10}px;
      padding: 4px 10px;
      background: ${color};
      color: white;
      font-size: 12px;
      font-weight: bold;
      border-radius: 4px;
      pointer-events: none;
      z-index: 2147483646;
      font-family: -apple-system, sans-serif;
      animation: clickPulse 0.8s ease-out forwards;
    `;
    document.body.appendChild(label);
    setTimeout(() => label.remove(), 800);
  } else {
    // Simple dot for recording
    const dot = document.createElement('div');
    dot.style.cssText = `
      position: fixed;
      left: ${x - 10}px;
      top: ${y - 10}px;
      width: 20px;
      height: 20px;
      background: ${color};
      border-radius: 50%;
      pointer-events: none;
      z-index: 2147483646;
      opacity: 0.7;
      animation: clickPulse 0.5s ease-out forwards;
    `;
    document.body.appendChild(dot);
    setTimeout(() => dot.remove(), 500);
  }
}
