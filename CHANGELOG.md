# Changelog

## 1.0.5 — 2026-10-17

- Keep inline multiple selection in draft mode until OK; restart the draft after OK, Cancel and form reset, and synchronize external value changes.

## 1.0.4 — 2026-10-17

- Reject user selection in disabled single selects, including visible inline options; re-enabling restores interaction.

## 1.0.3 — 2026-10-17

- Honor disabled optgroups in rendering, selection APIs, bulk actions and draft confirmation, while retaining existing disabled selections.

## 1.0.2 — 2026-10-17

- Respect custom Content-Type headers case-insensitively without appending the default form encoding to JSON requests.

## 1.0.1 — 2026-10-17

- Preserve single-select values across repeated initialization and UI rebuilds, and accept native change events without restoring the placeholder.
- Add browser regression tests; retain the initial placeholder and form-reset behavior.
