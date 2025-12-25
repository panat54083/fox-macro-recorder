const toggleBtn = document.getElementById('toggleBtn');
const btnIcon = document.getElementById('btnIcon');
const btnText = document.getElementById('btnText');
const status = document.getElementById('status');
const importBtn = document.getElementById('importBtn');
const importFile = document.getElementById('importFile');

function updateUI(isHidden) {
  if (isHidden) {
    toggleBtn.className = 'btn btn-show';
    btnIcon.textContent = '👁';
    btnText.textContent = 'Show Panel';
    status.textContent = 'Panel is hidden';
    status.className = 'status hidden-status';
  } else {
    toggleBtn.className = 'btn btn-hide';
    btnIcon.textContent = '🙈';
    btnText.textContent = 'Hide Panel';
    status.textContent = 'Panel is visible on page';
    status.className = 'status';
  }
}

// Get current state on popup open
chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
  try {
    const response = await chrome.tabs.sendMessage(tabs[0].id, { action: 'getPanelState' });
    updateUI(response.isHidden);
  } catch (e) {
    status.textContent = 'Refresh page to use';
    status.className = 'status hidden-status';
  }
});

// Toggle button click
toggleBtn.addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  try {
    const response = await chrome.tabs.sendMessage(tab.id, { action: 'togglePanel' });
    updateUI(response.isHidden);
  } catch (e) {
    status.textContent = 'Refresh page to use';
    status.className = 'status hidden-status';
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

    status.textContent = 'Macro imported!';
    status.className = 'status';

    // Reset after 2 seconds
    setTimeout(() => {
      chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
        try {
          const response = await chrome.tabs.sendMessage(tabs[0].id, { action: 'getPanelState' });
          updateUI(response.isHidden);
        } catch (e) {
          status.textContent = 'Refresh page to use';
          status.className = 'status hidden-status';
        }
      });
    }, 2000);
  } catch (e) {
    status.textContent = 'Import failed';
    status.className = 'status hidden-status';
  }

  // Reset file input
  importFile.value = '';
});
