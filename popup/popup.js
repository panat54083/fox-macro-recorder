const toggleBtn = document.getElementById('toggleBtn');
const statusDot = document.getElementById('statusDot');
const statusText = document.getElementById('statusText');
const importBtn = document.getElementById('importBtn');
const importFile = document.getElementById('importFile');

function updateUI(isHidden) {
  if (isHidden) {
    toggleBtn.className = 'btn btn-toggle';
    statusDot.className = 'status-dot hidden';
    statusText.textContent = 'Hidden';
  } else {
    toggleBtn.className = 'btn btn-toggle active';
    statusDot.className = 'status-dot visible';
    statusText.textContent = 'Visible';
  }
}

function showMessage(msg, isError = false) {
  statusDot.className = isError ? 'status-dot hidden' : 'status-dot visible';
  statusText.textContent = msg;
}

// Get current state on popup open
chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
  try {
    const response = await chrome.tabs.sendMessage(tabs[0].id, { action: 'getPanelState' });
    updateUI(response.isHidden);
  } catch (e) {
    showMessage('Refresh page', true);
  }
});

// Toggle button click
toggleBtn.addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  try {
    const response = await chrome.tabs.sendMessage(tab.id, { action: 'togglePanel' });
    updateUI(response.isHidden);
  } catch (e) {
    showMessage('Refresh page', true);
  }
});

// Import button click
importBtn.addEventListener('click', () => {
  importFile.click();
});

// Handle file import
importFile.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  try {
    const text = await file.text();
    const macro = JSON.parse(text);

    if (!macro.actions || !Array.isArray(macro.actions)) {
      throw new Error('Invalid macro format');
    }

    // Assign new ID to avoid conflicts
    macro.id = Date.now().toString();

    // Get existing macros
    const result = await chrome.storage.local.get(['macros']);
    const macros = result.macros || [];

    // Add new macro
    macros.push(macro);
    await chrome.storage.local.set({ macros });

    // Reload macros in content script
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    try {
      await chrome.tabs.sendMessage(tab.id, { action: 'reloadMacros' });
    } catch (e) {
      // Content script might not be loaded
    }

    showMessage('Imported!');

    // Reset after 2 seconds
    setTimeout(() => {
      chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
        try {
          const response = await chrome.tabs.sendMessage(tabs[0].id, { action: 'getPanelState' });
          updateUI(response.isHidden);
        } catch (e) {
          showMessage('Refresh page', true);
        }
      });
    }, 2000);
  } catch (e) {
    showMessage('Import failed', true);
  }

  // Reset file input
  importFile.value = '';
});
