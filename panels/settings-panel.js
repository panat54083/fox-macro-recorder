// Fox Macro Recorder - Settings Tab

function renderSettingsTab() {
  const container = foxShadowRoot?.querySelector('#fox-settings-content');
  if (!container) return;

  container.innerHTML = `
    <div class="fox-settings-body">
      <div class="fox-settings-group">
        <div class="fox-section-label">PLAYBACK</div>
        <div class="fox-settings-row">
          <div class="fox-settings-label">
            <span class="fox-settings-icon">\uD83C\uDFB2</span>
            <span>Random Delay</span>
          </div>
          <div class="fox-toggle${isRandomDelayEnabled ? ' active' : ''}" id="fox-random-delay-toggle" title="Add random delays between clicks">
            <div class="fox-toggle-knob"></div>
          </div>
        </div>
        <div class="fox-range-row" title="Min and max delay range (ms)">
          <input type="number" id="fox-delay-min" class="fox-range-input" value="${randomDelayMin}" min="0" max="10000">
          <span class="fox-range-sep">\u2014</span>
          <input type="number" id="fox-delay-max" class="fox-range-input" value="${randomDelayMax}" min="0" max="10000">
          <span class="fox-range-unit">ms</span>
        </div>
      </div>

      <div class="fox-settings-group">
        <div class="fox-section-label">ABOUT</div>
        <div class="fox-about">
          <div class="fox-version">Fox Macro Recorder v2.0.0</div>
          <div class="fox-about-links">
            <a class="fox-about-link" href="https://buymeacoffee.com/panat.siriwong" target="_blank">Buy Me a Coffee</a>
          </div>
        </div>
      </div>
    </div>
  `;

  // Random delay toggle
  const toggle = container.querySelector('#fox-random-delay-toggle');
  toggle.addEventListener('click', async () => {
    isRandomDelayEnabled = !isRandomDelayEnabled;
    toggle.classList.toggle('active', isRandomDelayEnabled);
    await chrome.storage.local.set({ randomDelayEnabled: isRandomDelayEnabled });
    showToast('\u2713 Settings updated', 'success');
  });

  // Min/max inputs
  const minInput = container.querySelector('#fox-delay-min');
  const maxInput = container.querySelector('#fox-delay-max');

  minInput.addEventListener('change', async () => {
    const value = parseInt(minInput.value) || 0;
    randomDelayMin = Math.max(0, Math.min(value, randomDelayMax));
    minInput.value = randomDelayMin;
    await chrome.storage.local.set({ randomDelayMin });
  });

  maxInput.addEventListener('change', async () => {
    const value = parseInt(maxInput.value) || 0;
    randomDelayMax = Math.max(randomDelayMin, value);
    maxInput.value = randomDelayMax;
    await chrome.storage.local.set({ randomDelayMax });
  });
}
