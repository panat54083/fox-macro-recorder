# Release Notes - Version 2.0.0

## What's New

### Domain-Based Macro Organization
- Macros now have a **domain** field, auto-populated with the current page's hostname when recording stops
- Domain is editable in both the save bar and the edit panel
- Macro list is grouped by domain with section headers
- Added a **domain filter dropdown** to show only macros from a selected domain
- Quick-play dropdown shows domain alongside macro name for clarity
- Backward compatible: existing macros without a domain appear under "Ungrouped"

### Minimal Mode
- New toggle button in the header to switch between full and minimal mode
- Minimal mode shows only the control bar (record, stop, macro select, play)
- Hides tabs, save bar, domain filter, macro list, and settings for a compact footprint
- Icon switches between filled/outline square to indicate current mode

### Edit Panel Resize
- Edit panel now has resize grips at both bottom corners
- Bottom-right grip anchors the top-left corner (panel grows right and down)
- Bottom-left grip anchors the top-right corner (panel grows left and down)
- Uses pointer capture for smooth dragging and touch support
- Minimum size enforced at 260x200px

### Floating Panel Architecture
- Edit panel extracted into a standalone draggable floating panel
- Inspector panel extracted into a standalone draggable floating panel
- Recording mode now shows a minimal panel with only status and stop button

## UI/UX Enhancements

### Save Bar
- Redesigned from single row to stacked layout with name input on top, domain + save button below
- Domain input pre-fills with current hostname for quick saving

### Macro List
- Macros grouped under uppercase domain headers with subtle separators
- "Ungrouped" section at the bottom for macros without a domain

### Panel Cleanup
- Removed panel resize handles from main panel (was causing CSS issues)
- Removed combine, export/import features and dead code
- Removed help button, added Buy Me a Coffee link

## Technical Details

- Updated to Manifest v3 version 2.0.0
- New icons with multiple sizes (16, 48, 128)
- Icon generation script added
- No breaking changes to stored macro data — new `domain` field is optional

## Upgrade Notes

- Existing macros are fully compatible and will appear under "Ungrouped"
- No action required from users
- All settings and saved macros are preserved

---

**Full Changelog**: Compare v1.1.0...v2.0.0
