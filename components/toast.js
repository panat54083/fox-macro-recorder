// Fox Macro Recorder - Toast/Snackbar System

let foxToastQueue = [];
let foxToastActive = null;

function showToast(message, type = 'info', duration = 2000) {
  if (!foxShadowRoot) return;

  // Remove existing toast
  if (foxToastActive) {
    foxToastActive.remove();
    foxToastActive = null;
  }

  const icons = {
    success: '✓',
    error: '⚠',
    info: 'ℹ'
  };

  const toast = document.createElement('div');
  toast.className = `fox-toast ${type}`;
  toast.innerHTML = `<span class="fox-toast-icon">${icons[type] || icons.info}</span><span>${message}</span>`;

  foxShadowRoot.appendChild(toast);
  foxToastActive = toast;

  // Animate in
  requestAnimationFrame(() => {
    toast.classList.add('visible');
  });

  // Click to dismiss
  toast.addEventListener('click', () => {
    dismissToast(toast);
  });

  // Auto dismiss
  setTimeout(() => {
    dismissToast(toast);
  }, duration);
}

function dismissToast(toast) {
  if (!toast || !toast.parentNode) return;
  toast.classList.remove('visible');
  setTimeout(() => {
    if (toast.parentNode) toast.remove();
    if (foxToastActive === toast) foxToastActive = null;
  }, 200);
}
