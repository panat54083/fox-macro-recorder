// Fox Macro Recorder - Design System & Styles
// All CSS is injected into Shadow DOM for complete isolation

function getFoxStyles() {
  return `
    /* ==========================================
       CSS Variables (Design System)
       ========================================== */
    :host {
      --fox-primary: #6366F1;
      --fox-primary-hover: #4F46E5;
      --fox-primary-light: #EEF2FF;
      --fox-gray-900: #111827;
      --fox-gray-700: #374151;
      --fox-gray-500: #6B7280;
      --fox-gray-400: #9CA3AF;
      --fox-gray-300: #D1D5DB;
      --fox-gray-200: #E5E7EB;
      --fox-gray-100: #F3F4F6;
      --fox-gray-50: #F9FAFB;
      --fox-white: #FFFFFF;
      --fox-red: #EF4444;
      --fox-red-light: #FEE2E2;
      --fox-blue: #3B82F6;
      --fox-blue-light: #DBEAFE;
      --fox-green: #10B981;
      --fox-green-light: #D1FAE5;
      --fox-orange: #F59E0B;
      --fox-orange-light: #FEF3C7;
      --fox-font: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Inter', sans-serif;
      --fox-mono: 'SF Mono', 'Consolas', 'Monaco', monospace;
      --fox-radius-sm: 6px;
      --fox-radius-md: 8px;
      --fox-radius-lg: 12px;
      --fox-shadow: 0 8px 32px rgba(0,0,0,0.18);
      --fox-shadow-lg: 0 12px 48px rgba(0,0,0,0.25);
      --fox-z-panel: 2147483647;
      --fox-z-toast: 2147483648;
    }

    /* ==========================================
       Reset & Base
       ========================================== */
    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    /* ==========================================
       Panel Container
       ========================================== */
    #fox-panel {
      position: fixed;
      top: 20px;
      right: 20px;
      width: 360px;
      min-width: 280px;
      max-width: 90vw;
      max-height: 90vh;
      background: var(--fox-white);
      border-radius: var(--fox-radius-lg);
      box-shadow: var(--fox-shadow);
      font-family: var(--fox-font);
      z-index: var(--fox-z-panel);
      overflow: hidden;
      font-size: 14px;
      color: var(--fox-gray-900);
      display: flex;
      flex-direction: column;
      transition: opacity 0.2s, transform 0.2s;
    }

    #fox-panel.hidden {
      display: none;
    }

    #fox-panel.resizing {
      transition: none;
      user-select: none;
    }

    /* Recording mode: minimal panel with only status + stop */
    #fox-panel.recording-mode {
      width: auto;
      min-width: 0;
      height: auto;
      max-height: none;
    }

    #fox-panel.recording-mode .fox-tabs,
    #fox-panel.recording-mode .fox-header-actions,
    #fox-panel.recording-mode .fox-btn-record,
    #fox-panel.recording-mode .fox-macro-select,
    #fox-panel.recording-mode .fox-btn-play-main,
    #fox-panel.recording-mode .fox-save-bar,
    #fox-panel.recording-mode .fox-macros,
    #fox-panel.recording-mode .fox-tab-content[data-tab="settings"],
    #fox-panel.recording-mode .fox-resize {
      display: none !important;
    }

    #fox-panel.recording-mode .fox-control-bar {
      border-bottom: none;
      justify-content: center;
      padding: 6px 12px;
    }

    #fox-panel.recording-mode .fox-ctrl-btn {
      width: 32px;
      height: 32px;
      font-size: 14px;
    }

    /* ==========================================
       Header
       ========================================== */
    .fox-header {
      background: var(--fox-primary);
      color: var(--fox-white);
      padding: 8px 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      cursor: move;
      user-select: none;
      flex-shrink: 0;
    }

    .fox-header-left {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .fox-logo {
      font-size: 16px;
      line-height: 1;
    }

    .fox-title {
      font-weight: 600;
      font-size: 14px;
    }

    .fox-tabs {
      display: flex;
      gap: 2px;
      align-items: center;
    }

    .fox-tab-btn {
      background: rgba(255,255,255,0.12);
      border: none;
      color: rgba(255,255,255,0.7);
      width: 32px;
      height: 32px;
      border-radius: var(--fox-radius-sm);
      cursor: pointer;
      font-size: 14px;
      transition: all 0.15s;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
    }

    .fox-tab-btn:hover {
      background: rgba(255,255,255,0.2);
      color: var(--fox-white);
    }

    .fox-tab-btn.active {
      background: rgba(255,255,255,0.25);
      color: var(--fox-white);
    }

    .fox-header-actions {
      display: flex;
      gap: 2px;
      align-items: center;
    }

    .fox-icon-btn {
      background: rgba(255,255,255,0.12);
      border: none;
      color: rgba(255,255,255,0.7);
      width: 28px;
      height: 28px;
      border-radius: var(--fox-radius-sm);
      cursor: pointer;
      font-size: 13px;
      transition: all 0.15s;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .fox-icon-btn:hover {
      background: rgba(255,255,255,0.2);
      color: var(--fox-white);
      transform: scale(1.05);
    }

    /* ==========================================
       Tab Content
       ========================================== */
    .fox-tab-content {
      display: none;
      flex: 1;
      overflow-y: auto;
      min-height: 0;
    }

    .fox-tab-content.active {
      display: flex;
      flex-direction: column;
    }

    /* ==========================================
       Home Tab
       ========================================== */
    .fox-control-bar {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 12px;
      border-bottom: 1px solid var(--fox-gray-200);
      flex-shrink: 0;
    }

    .fox-ctrl-btn {
      width: 40px;
      height: 40px;
      border: none;
      border-radius: 50%;
      font-size: 18px;
      cursor: pointer;
      transition: all 0.15s;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .fox-ctrl-btn:disabled {
      opacity: 0.35;
      cursor: not-allowed;
      transform: none !important;
    }

    .fox-btn-record {
      background: var(--fox-red);
      color: var(--fox-white);
    }

    .fox-btn-record:hover:not(:disabled) {
      background: #DC2626;
      transform: scale(1.08);
    }

    .fox-btn-stop {
      background: var(--fox-gray-400);
      color: var(--fox-white);
    }

    .fox-btn-stop:hover:not(:disabled) {
      background: var(--fox-gray-500);
      transform: scale(1.08);
    }

    .fox-macro-select {
      flex: 1;
      height: 36px;
      padding: 0 10px;
      border: 1px solid var(--fox-gray-300);
      border-radius: var(--fox-radius-sm);
      font-size: 13px;
      font-family: var(--fox-font);
      background: var(--fox-white);
      color: var(--fox-gray-900);
      cursor: pointer;
      min-width: 0;
    }

    .fox-macro-select:focus {
      outline: none;
      border-color: var(--fox-primary);
      box-shadow: 0 0 0 2px var(--fox-primary-light);
    }

    .fox-macro-select:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .fox-btn-play-main {
      background: var(--fox-blue-light);
      color: var(--fox-blue);
    }

    .fox-btn-play-main:hover:not(:disabled) {
      background: #BFDBFE;
      transform: scale(1.08);
    }

    .fox-btn-stop-main {
      background: var(--fox-red);
      color: var(--fox-white);
    }

    .fox-btn-stop-main:hover:not(:disabled) {
      background: #DC2626;
      transform: scale(1.08);
    }

    /* Status Strip */
    .fox-status-strip {
      display: none;
      align-items: center;
      justify-content: space-between;
      padding: 6px 12px;
      font-size: 12px;
      font-weight: 600;
      flex-shrink: 0;
    }

    .fox-status-strip.visible {
      display: flex;
    }

    .fox-status-strip.recording {
      background: var(--fox-red-light);
      color: var(--fox-red);
    }

    .fox-status-strip.playing {
      background: var(--fox-blue-light);
      color: var(--fox-blue);
    }

    .fox-status-left {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .fox-status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      animation: foxPulseDot 1s infinite;
    }

    .fox-status-strip.recording .fox-status-dot {
      background: var(--fox-red);
    }

    .fox-status-strip.playing .fox-status-dot {
      background: var(--fox-blue);
    }

    /* Save Bar */
    .fox-save-bar {
      display: none;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      border-bottom: 1px solid var(--fox-gray-200);
      flex-shrink: 0;
    }

    .fox-save-bar.visible {
      display: flex;
    }

    .fox-save-input {
      flex: 1;
      padding: 8px 10px;
      border: 2px solid var(--fox-gray-300);
      border-radius: var(--fox-radius-sm);
      font-size: 13px;
      font-family: var(--fox-font);
      transition: border-color 0.15s;
    }

    .fox-save-input:focus {
      outline: none;
      border-color: var(--fox-green);
      box-shadow: 0 0 0 2px var(--fox-green-light);
    }

    .fox-save-btn {
      width: 36px;
      height: 36px;
      border: none;
      border-radius: var(--fox-radius-sm);
      background: var(--fox-green);
      color: var(--fox-white);
      font-size: 16px;
      cursor: pointer;
      transition: all 0.15s;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .fox-save-btn:hover {
      background: #059669;
      transform: scale(1.05);
    }

    /* Macro List */
    .fox-macros {
      flex: 1;
      overflow-y: auto;
      padding: 8px;
      min-height: 0;
    }

    .fox-empty {
      color: var(--fox-gray-400);
      font-size: 13px;
      text-align: center;
      padding: 24px 12px;
    }

    .fox-macro-card {
      background: var(--fox-white);
      border-radius: var(--fox-radius-md);
      padding: 10px 12px;
      margin-bottom: 6px;
      border: 1px solid var(--fox-gray-200);
      transition: border-color 0.15s, background 0.2s;
    }

    .fox-macro-card:last-child {
      margin-bottom: 0;
    }

    .fox-macro-card:hover {
      border-color: var(--fox-gray-300);
    }

    /* Delete confirmation state */
    .fox-macro-card.confirm-delete {
      background: var(--fox-red-light);
      border-color: #FECACA;
    }

    .fox-macro-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .fox-macro-name {
      font-weight: 600;
      font-size: 13px;
      color: var(--fox-gray-900);
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .fox-macro-info {
      font-size: 11px;
      color: var(--fox-gray-400);
      margin-left: 8px;
      white-space: nowrap;
      font-family: var(--fox-mono);
    }

    .fox-macro-row2 {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      align-items: center;
      margin-top: 8px;
      gap: 6px;
    }

    .fox-macro-actions {
      display: flex;
      gap: 4px;
      flex-shrink: 0;
    }

    .fox-action-btn {
      width: 32px;
      height: 32px;
      border: none;
      border-radius: var(--fox-radius-sm);
      font-size: 13px;
      cursor: pointer;
      transition: all 0.15s;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .fox-action-btn:hover {
      transform: scale(1.1);
    }

    .fox-abtn-play {
      background: var(--fox-blue-light);
      color: var(--fox-blue);
    }

    .fox-abtn-play:hover { background: #BFDBFE; }

    .fox-abtn-stop {
      background: var(--fox-red);
      color: var(--fox-white);
    }

    .fox-abtn-edit {
      background: var(--fox-primary-light);
      color: var(--fox-primary);
    }

    .fox-abtn-edit:hover { background: #E0E7FF; }

    .fox-abtn-delete {
      background: var(--fox-red-light);
      color: var(--fox-red);
    }

    .fox-abtn-delete:hover { background: #FECACA; }

    /* Delete confirmation buttons */
    .fox-delete-confirm {
      display: flex;
      align-items: center;
      gap: 8px;
      width: 100%;
      margin-top: 8px;
    }

    .fox-delete-msg {
      flex: 1;
      font-size: 12px;
      font-weight: 500;
      color: var(--fox-red);
    }

    .fox-btn-cancel-delete {
      padding: 6px 12px;
      border: 1px solid var(--fox-gray-300);
      border-radius: var(--fox-radius-sm);
      background: var(--fox-white);
      color: var(--fox-gray-700);
      font-size: 12px;
      font-family: var(--fox-font);
      cursor: pointer;
      transition: all 0.15s;
    }

    .fox-btn-cancel-delete:hover {
      background: var(--fox-gray-50);
    }

    .fox-btn-confirm-delete {
      padding: 6px 12px;
      border: none;
      border-radius: var(--fox-radius-sm);
      background: var(--fox-red);
      color: var(--fox-white);
      font-size: 12px;
      font-weight: 500;
      font-family: var(--fox-font);
      cursor: pointer;
      transition: all 0.15s;
    }

    .fox-btn-confirm-delete:hover {
      background: #DC2626;
    }

    .fox-loop-controls {
      display: flex;
      gap: 6px;
      align-items: center;
      flex: 1;
      justify-content: flex-end;
      min-width: 110px;
    }

    .fox-loop-item {
      display: flex;
      align-items: center;
      gap: 3px;
      font-size: 12px;
      color: var(--fox-gray-500);
    }

    .fox-loop-item span {
      font-size: 12px;
    }

    .fox-loop-input {
      width: 50px;
      padding: 4px 4px;
      border: 1px solid var(--fox-gray-200);
      border-radius: 4px;
      font-size: 11px;
      font-family: var(--fox-font);
      text-align: center;
      transition: border-color 0.15s;
    }

    .fox-loop-input:focus {
      outline: none;
      border-color: var(--fox-primary);
      box-shadow: 0 0 0 2px var(--fox-primary-light);
    }

    /* ==========================================
       Edit Panel (Standalone Floating)
       ========================================== */
    #fox-edit-panel {
      position: fixed;
      top: 60px;
      right: 400px;
      width: 340px;
      max-width: 90vw;
      max-height: 80vh;
      background: var(--fox-white);
      border-radius: var(--fox-radius-lg);
      box-shadow: var(--fox-shadow-lg);
      font-family: var(--fox-font);
      z-index: var(--fox-z-panel);
      overflow: hidden;
      font-size: 14px;
      color: var(--fox-gray-900);
      display: flex;
      flex-direction: column;
    }

    .fox-edit-panel-header {
      background: var(--fox-primary);
      color: var(--fox-white);
      padding: 8px 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      cursor: move;
      user-select: none;
      flex-shrink: 0;
    }

    .fox-edit-panel-title {
      font-weight: 600;
      font-size: 13px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .fox-edit-panel-actions {
      display: flex;
      align-items: center;
      gap: 6px;
      flex-shrink: 0;
    }

    /* ==========================================
       Edit Components (shared)
       ========================================== */
    .fox-edit-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 12px;
      border-bottom: 1px solid var(--fox-gray-200);
      flex-shrink: 0;
    }

    .fox-back-btn {
      display: flex;
      align-items: center;
      gap: 4px;
      background: none;
      border: none;
      color: var(--fox-gray-500);
      font-size: 13px;
      font-family: var(--fox-font);
      cursor: pointer;
      padding: 4px 8px;
      border-radius: var(--fox-radius-sm);
      transition: all 0.15s;
    }

    .fox-back-btn:hover {
      background: var(--fox-gray-100);
      color: var(--fox-gray-900);
    }

    .fox-edit-save-btn {
      padding: 6px 16px;
      border: none;
      border-radius: var(--fox-radius-sm);
      background: var(--fox-green);
      color: var(--fox-white);
      font-size: 13px;
      font-weight: 500;
      font-family: var(--fox-font);
      cursor: pointer;
      transition: all 0.15s;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .fox-edit-save-btn:hover {
      background: #059669;
      transform: scale(1.02);
    }

    .fox-edit-body {
      padding: 12px;
      overflow-y: auto;
      flex: 1;
      min-height: 0;
    }

    .fox-edit-name {
      width: 100%;
      padding: 8px 10px;
      border: 2px solid var(--fox-gray-200);
      border-radius: var(--fox-radius-md);
      font-size: 14px;
      font-weight: 600;
      font-family: var(--fox-font);
      margin-bottom: 12px;
      transition: border-color 0.15s;
    }

    .fox-edit-name:focus {
      outline: none;
      border-color: var(--fox-primary);
      box-shadow: 0 0 0 2px var(--fox-primary-light);
    }

    .fox-section-label {
      font-size: 11px;
      font-weight: 600;
      color: var(--fox-gray-400);
      margin-bottom: 6px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .fox-actions-list {
      background: var(--fox-gray-50);
      border-radius: var(--fox-radius-md);
      padding: 6px;
      max-height: 240px;
      overflow-y: auto;
      margin-bottom: 12px;
    }

    .fox-action-item {
      background: var(--fox-white);
      border-radius: var(--fox-radius-sm);
      padding: 6px 8px;
      margin-bottom: 3px;
      display: flex;
      align-items: center;
      gap: 8px;
      border: 1px solid var(--fox-gray-200);
      transition: border-color 0.15s;
    }

    .fox-action-item:hover { border-color: var(--fox-gray-300); }
    .fox-action-item:last-child { margin-bottom: 0; }

    .fox-action-num {
      background: var(--fox-primary);
      color: var(--fox-white);
      min-width: 20px;
      height: 20px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 10px;
      font-weight: 600;
      flex-shrink: 0;
    }

    .fox-action-text {
      flex: 1;
      font-size: 11px;
      color: var(--fox-gray-500);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .fox-action-coords {
      display: flex;
      align-items: center;
      gap: 3px;
      font-size: 11px;
      color: var(--fox-gray-400);
    }

    .fox-coord-input {
      width: 44px;
      padding: 3px 4px;
      border: 1px solid var(--fox-gray-200);
      border-radius: 4px;
      font-size: 11px;
      font-family: var(--fox-mono);
      text-align: center;
      transition: border-color 0.15s;
    }

    .fox-coord-input:focus {
      outline: none;
      border-color: var(--fox-primary);
    }

    .fox-delay-chip {
      display: flex;
      align-items: center;
      gap: 2px;
      background: var(--fox-gray-100);
      padding: 3px 5px;
      border-radius: 4px;
      font-size: 10px;
      color: var(--fox-gray-500);
    }

    .fox-delay-input {
      width: 46px;
      padding: 3px 4px;
      border: 1px solid var(--fox-gray-200);
      border-radius: 4px;
      font-size: 11px;
      font-family: var(--fox-mono);
      text-align: center;
      transition: border-color 0.15s;
    }

    .fox-delay-input:focus {
      outline: none;
      border-color: var(--fox-primary);
    }

    /* ==========================================
       Inspector Panel (Standalone Floating)
       ========================================== */
    #fox-inspector-panel {
      position: fixed;
      top: 60px;
      left: 20px;
      width: 300px;
      max-width: 90vw;
      max-height: 80vh;
      background: var(--fox-white);
      border-radius: var(--fox-radius-lg);
      box-shadow: var(--fox-shadow-lg);
      font-family: var(--fox-font);
      z-index: var(--fox-z-panel);
      overflow: hidden;
      font-size: 14px;
      color: var(--fox-gray-900);
      display: flex;
      flex-direction: column;
    }

    .fox-inspector-panel-header {
      background: var(--fox-primary);
      color: var(--fox-white);
      padding: 8px 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      cursor: move;
      user-select: none;
      flex-shrink: 0;
    }

    .fox-inspector-panel-title {
      font-weight: 600;
      font-size: 13px;
    }

    /* ==========================================
       Inspector Components
       ========================================== */
    .fox-inspector-body {
      padding: 12px;
      flex: 1;
      overflow-y: auto;
    }

    .fox-insp-current {
      background: var(--fox-primary-light);
      border-radius: var(--fox-radius-md);
      padding: 12px;
      margin-bottom: 12px;
    }

    .fox-insp-coords {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 20px;
      font-weight: 600;
      color: var(--fox-primary);
      font-family: var(--fox-mono);
    }

    .fox-insp-icon { font-size: 14px; }

    .fox-insp-element {
      font-size: 12px;
      color: var(--fox-gray-500);
      margin-top: 6px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .fox-insp-tag { color: var(--fox-primary); font-weight: 500; }
    .fox-insp-id { color: #EC4899; }

    .fox-insp-empty {
      color: var(--fox-gray-400);
      font-size: 12px;
      text-align: center;
      padding: 12px;
    }

    .fox-snap-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 6px;
    }

    .fox-snap-clear {
      background: none;
      border: none;
      color: var(--fox-red);
      font-size: 11px;
      font-weight: 500;
      cursor: pointer;
      padding: 2px 6px;
    }

    .fox-snap-clear:hover { text-decoration: underline; }

    .fox-snap-list {
      max-height: 200px;
      overflow-y: auto;
    }

    .fox-snap-item {
      background: var(--fox-gray-50);
      border-radius: var(--fox-radius-sm);
      padding: 6px 10px;
      margin-bottom: 3px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .fox-snap-item:last-child { margin-bottom: 0; }

    .fox-snap-num {
      font-size: 11px;
      font-weight: 600;
      color: var(--fox-primary);
      min-width: 20px;
    }

    .fox-snap-coords {
      font-size: 12px;
      font-family: var(--fox-mono);
      color: var(--fox-gray-900);
    }

    .fox-snap-time {
      font-size: 10px;
      color: var(--fox-gray-400);
    }

    /* ==========================================
       Settings Tab
       ========================================== */
    .fox-settings-body {
      padding: 12px;
      flex: 1;
      overflow-y: auto;
    }

    .fox-settings-group {
      margin-bottom: 16px;
    }

    .fox-settings-group:last-child {
      margin-bottom: 0;
    }

    .fox-settings-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 12px;
      background: var(--fox-gray-50);
      border-radius: var(--fox-radius-md);
      margin-bottom: 6px;
    }

    .fox-settings-row:last-child { margin-bottom: 0; }

    .fox-settings-label {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      font-weight: 500;
      color: var(--fox-gray-900);
    }

    .fox-settings-icon { font-size: 15px; }

    .fox-toggle {
      position: relative;
      width: 40px;
      height: 22px;
      background: var(--fox-gray-300);
      border-radius: 11px;
      cursor: pointer;
      transition: background 0.2s;
      flex-shrink: 0;
    }

    .fox-toggle.active {
      background: var(--fox-primary);
    }

    .fox-toggle-knob {
      position: absolute;
      top: 2px;
      left: 2px;
      width: 18px;
      height: 18px;
      background: var(--fox-white);
      border-radius: 50%;
      box-shadow: 0 1px 3px rgba(0,0,0,0.2);
      transition: transform 0.2s;
    }

    .fox-toggle.active .fox-toggle-knob {
      transform: translateX(18px);
    }

    .fox-range-row {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      background: var(--fox-gray-50);
      border-radius: var(--fox-radius-md);
    }

    .fox-range-input {
      width: 60px;
      padding: 5px 8px;
      border: 1px solid var(--fox-gray-200);
      border-radius: var(--fox-radius-sm);
      font-size: 12px;
      font-family: var(--fox-font);
      text-align: center;
      transition: border-color 0.15s;
    }

    .fox-range-input:focus {
      outline: none;
      border-color: var(--fox-primary);
    }

    .fox-range-sep {
      color: var(--fox-gray-400);
      font-size: 12px;
    }

    .fox-range-unit {
      color: var(--fox-gray-400);
      font-size: 12px;
    }

    .fox-about {
      text-align: center;
      padding: 12px;
    }

    .fox-version {
      font-size: 12px;
      color: var(--fox-gray-400);
      margin-bottom: 8px;
    }

    .fox-about-links {
      display: flex;
      gap: 12px;
      justify-content: center;
      flex-wrap: wrap;
    }

    .fox-about-link {
      font-size: 12px;
      color: var(--fox-primary);
      text-decoration: none;
      cursor: pointer;
    }

    .fox-about-link:hover {
      text-decoration: underline;
    }

    /* ==========================================
       FAB (Floating Action Button)
       ========================================== */
    #fox-fab {
      position: fixed;
      bottom: 24px;
      right: 24px;
      width: 52px;
      height: 52px;
      border-radius: 50%;
      background: var(--fox-primary);
      color: var(--fox-white);
      border: none;
      cursor: pointer;
      font-size: 22px;
      display: none;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 16px rgba(99,102,241,0.4);
      z-index: var(--fox-z-panel);
      transition: all 0.2s;
      user-select: none;
    }

    #fox-fab:hover {
      transform: scale(1.08);
      box-shadow: 0 6px 24px rgba(99,102,241,0.5);
    }

    #fox-fab.visible {
      display: flex;
    }

    #fox-fab.recording {
      background: var(--fox-red);
      box-shadow: 0 4px 16px rgba(239,68,68,0.4);
      animation: foxFabPulse 1.5s infinite;
    }

    #fox-fab.playing {
      background: var(--fox-blue);
      box-shadow: 0 4px 16px rgba(59,130,246,0.4);
      animation: foxFabSpin 2s linear infinite;
    }

    /* ==========================================
       Toast Notifications
       ========================================== */
    .fox-toast {
      position: fixed;
      bottom: 24px;
      left: 50%;
      transform: translateX(-50%) translateY(20px);
      padding: 10px 20px;
      background: #1F2937F2;
      color: var(--fox-white);
      font-size: 13px;
      font-family: var(--fox-font);
      border-radius: var(--fox-radius-md);
      z-index: var(--fox-z-toast);
      opacity: 0;
      transition: opacity 0.2s, transform 0.2s;
      pointer-events: auto;
      cursor: pointer;
      white-space: nowrap;
      max-width: 380px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .fox-toast.visible {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }

    .fox-toast-icon {
      font-size: 14px;
      flex-shrink: 0;
    }

    .fox-toast.success .fox-toast-icon { color: var(--fox-green); }
    .fox-toast.error .fox-toast-icon { color: var(--fox-red); }
    .fox-toast.info .fox-toast-icon { color: var(--fox-blue); }

    /* ==========================================
       Resize Handles
       ========================================== */
    .fox-resize {
      position: absolute;
      z-index: 10;
    }

    .fox-resize-e { right: -4px; top: 12px; bottom: 12px; width: 8px; cursor: ew-resize; }
    .fox-resize-s { bottom: -4px; left: 12px; right: 12px; height: 8px; cursor: ns-resize; }
    .fox-resize-w { left: -4px; top: 12px; bottom: 12px; width: 8px; cursor: ew-resize; }
    .fox-resize-n { top: -4px; left: 12px; right: 12px; height: 8px; cursor: ns-resize; }
    .fox-resize-se { right: -4px; bottom: -4px; width: 16px; height: 16px; cursor: nwse-resize; }
    .fox-resize-sw { left: -4px; bottom: -4px; width: 16px; height: 16px; cursor: nesw-resize; }
    .fox-resize-ne { right: -4px; top: -4px; width: 16px; height: 16px; cursor: nesw-resize; }
    .fox-resize-nw { left: -4px; top: -4px; width: 16px; height: 16px; cursor: nwse-resize; }

    /* ==========================================
       Tooltips
       ========================================== */
    .fox-tooltip {
      position: fixed;
      background: var(--fox-gray-900);
      color: var(--fox-white);
      font-size: 11px;
      font-family: var(--fox-font);
      padding: 4px 8px;
      border-radius: 4px;
      z-index: 2147483649;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.15s;
      white-space: nowrap;
    }

    .fox-tooltip.visible {
      opacity: 1;
    }

    /* ==========================================
       Animations
       ========================================== */
    @keyframes foxPulseDot {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.5; transform: scale(0.8); }
    }

    @keyframes foxFabPulse {
      0%, 100% { box-shadow: 0 4px 16px rgba(239,68,68,0.4); }
      50% { box-shadow: 0 4px 24px rgba(239,68,68,0.7); }
    }

    @keyframes foxFabSpin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    @keyframes foxClickPulse {
      0% { transform: scale(1); opacity: 0.7; }
      100% { transform: scale(2); opacity: 0; }
    }

    @keyframes foxClickRipple {
      0% { transform: scale(0.5); opacity: 1; }
      50% { transform: scale(1.5); opacity: 0.6; }
      100% { transform: scale(3); opacity: 0; }
    }

    /* ==========================================
       Responsive
       ========================================== */
    @media (max-width: 768px) {
      #fox-panel {
        width: calc(100vw - 20px);
        right: 10px;
        top: 10px;
        max-height: 80vh;
      }

      .fox-ctrl-btn {
        width: 44px;
        height: 44px;
      }

      .fox-action-btn {
        width: 36px;
        height: 36px;
      }

      .fox-tab-btn {
        width: 36px;
        height: 36px;
      }
    }
  `;
}
