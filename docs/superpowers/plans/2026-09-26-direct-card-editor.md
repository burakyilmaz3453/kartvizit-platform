# Direct Card Editor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the detached dashboard form and iframe with a large, directly editable card that shares its rendering rules with the public card and provides modern, item-specific icon popovers.

**Architecture:** Extract a reusable card view from the current public card, then mount it in read-only mode on `card.html` and editor mode on `dashboard.html`. Keep dashboard state and Supabase persistence separate from rendering; keep icon definitions and popover behavior in focused modules.

**Tech Stack:** Static HTML/CSS, browser JavaScript, Supabase JS v2, local SVG assets, Node.js built-in test runner, Vercel.

**Spec:** `docs/superpowers/specs/2026-09-26-direct-card-editor-design.md`

## Global Constraints

- Preserve existing Supabase schema, owner-filtered writes, restricted public RPC, profile URLs, uploads, and analytics behavior.
- Do not write draft changes to Supabase before explicit save.
- Use safe DOM APIs and the existing URL validation helpers; no HTML string injection.
- Keep icons local at runtime and whitelist every persisted icon identifier by semantic slot.
- Remove the fake-phone iframe preview and detached all-icons grid.
- Preserve Vercel as the sole deployment target and retain its security headers.

## Review Focus

- Empty optional fields: editor shows an add affordance, public card hides the absent row.
- Legacy or unknown icon IDs: resolve to the correct slot default without rendering a generic person icon.
- Long names, addresses, and URLs: wrap without overflowing desktop or mobile card layouts.
- Unsaved image and social changes: remain in the draft after unrelated validation or save failures.
- Popover boundaries: remain keyboard accessible and inside a narrow mobile viewport.

---

### Task 1: Shared Card View Contract

**Files:**
- Create: `assets/js/card-view.js`
- Modify: `card.html`
- Modify: `assets/js/card.js`
- Test: `tests/security/card-view.test.mjs`

**Interfaces:**
- Produces: `NoshutdownCardView.mount(root, options)`, `render(profile)`, and `destroy()`.
- Consumes: `NoshutdownCardUtils` and `NoshutdownIcons`.

- [ ] **Step 1: Write failing shared-view tests** asserting both `card.html` and `dashboard.html` load `card-view.js`, the module exposes the mount/render contract, optional empty rows have editor/public behavior, and unsafe URLs still pass through card utilities.
- [ ] **Step 2: Run `node --test tests/security/card-view.test.mjs`** and verify failure because the shared module does not exist.
- [ ] **Step 3: Extract card structure and field rendering into `assets/js/card-view.js`** with read-only and editor hooks while retaining the existing public IDs/classes needed by card actions.
- [ ] **Step 4: Adapt `card.html` and `assets/js/card.js`** to mount the shared view in read-only mode without changing public RPC or analytics behavior.
- [ ] **Step 5: Run the focused test and `npm test`**; require zero failures.
- [ ] **Step 6: Commit** `feat: extract shared card view`.

### Task 2: Direct Editing and Draft State

**Files:**
- Create: `assets/js/dashboard-editor.js`
- Modify: `dashboard.html`
- Modify: `assets/js/dashboard-app.js`
- Remove references to: `assets/js/dashboard-preview.js`
- Test: `tests/security/dashboard-editor.test.mjs`
- Modify: `tests/security/card-customization.test.mjs`

**Interfaces:**
- Produces: `NoshutdownDashboardEditor.mount(root, {draft, onChange, onUpload, onRemoveImage})`, `getDraft()`, `validate()`, and `destroy()`.
- Consumes: `NoshutdownCardView.mount(..., {mode:'editor'})`.

- [ ] **Step 1: Write failing tests** asserting no `card-preview` iframe, no `icon-editor` grid, direct labeled controls exist in card order, draft mutation is local, phone codes are preserved, and serialization uses existing profile field names.
- [ ] **Step 2: Run the focused tests** and verify they fail on the legacy form/iframe structure.
- [ ] **Step 3: Replace dashboard workspace markup** with the utility strip, large card canvas, sticky save action, media controls, and editor-only add affordances.
- [ ] **Step 4: Implement immutable draft editing and validation** in `dashboard-editor.js`; style real inputs to match card typography and auto-grow multiline values.
- [ ] **Step 5: Rewire `dashboard-app.js`** so load creates baseline/draft, edits only mutate draft, save performs the existing owner-bound upsert, and before-unload/logout protect unsaved changes.
- [ ] **Step 6: Run focused tests and `npm test`**; require zero failures.
- [ ] **Step 7: Commit** `feat: edit profile directly on card`.

### Task 3: Modern Semantic Icon Catalog

**Files:**
- Modify: `assets/js/icon-catalog.js`
- Test: `tests/security/icon-catalog.test.mjs`
- Modify: `tests/security/card-customization.test.mjs`

**Interfaces:**
- Produces: `options[slot]` with six to eight semantic IDs, `resolve(slot,id)`, and `createSvg(id)` with consistent 24px geometry.
- Consumes: no network resources.

- [ ] **Step 1: Write failing catalog tests** for semantic family membership, six-to-eight choices, recognizable brand paths, consistent SVG attributes, and legacy-ID fallback; explicitly prohibit person icons in save and WhatsApp icons in work-phone slots.
- [ ] **Step 2: Run focused tests** and verify failure against the current three-choice mixed catalog.
- [ ] **Step 3: Replace the catalog** with one coherent outline set and official recognizable brand geometry, retaining current slot keys and safe fallback behavior.
- [ ] **Step 4: Run focused tests and `npm test`**; require zero failures.
- [ ] **Step 5: Commit** `feat: add modern semantic icon catalog`.

### Task 4: Per-Icon Popover Picker

**Files:**
- Create: `assets/js/icon-picker.js`
- Modify: `assets/js/card-view.js`
- Modify: `dashboard.html`
- Test: `tests/security/icon-picker.test.mjs`

**Interfaces:**
- Produces: `NoshutdownIconPicker.attach(trigger, {slot, value, onSelect})` and `close()`.
- Consumes: `NoshutdownIcons.options`, `resolve`, `labels`, and `createSvg`.

- [ ] **Step 1: Write failing picker tests** for slot-only options, hidden visual names, accessible labels, selected state, Escape/outside-click dismissal, single-open behavior, and focus restoration.
- [ ] **Step 2: Run the focused test** and verify failure because the picker module does not exist.
- [ ] **Step 3: Implement anchored popover behavior** and add one compact pencil trigger beside each editable icon in editor mode only.
- [ ] **Step 4: Connect selection to draft `icon_config`** and immediate card rerender without persistence.
- [ ] **Step 5: Run focused tests and `npm test`**; require zero failures.
- [ ] **Step 6: Commit** `feat: add contextual icon picker`.

### Task 5: Professional Styling, Responsive QA, and Deployment

**Files:**
- Modify: `assets/css/dashboard.css`
- Modify: `assets/css/card.css`
- Modify: `assets/css/redesign.css`
- Modify: `tests/security/visual-contract.test.mjs`
- Modify: `tests/security/dashboard-contract.test.mjs`

**Interfaces:**
- Consumes the shared card/editor/picker class hooks from Tasks 1–4.
- Produces final desktop and mobile layouts without changing data contracts.

- [ ] **Step 1: Write failing visual-contract tests** for large canvas layout, sticky compact toolbar, inline control states, responsive popover containment, visible focus, reduced motion, wrapping, and the absence of phone-frame/preview-column styles.
- [ ] **Step 2: Run focused tests** and verify failure on legacy dashboard CSS.
- [ ] **Step 3: Implement the final visual system** using the published card tokens and responsive breakpoints; remove obsolete form, phone-frame, preview, and all-icons-grid styles.
- [ ] **Step 4: Run `node --check` on every changed JavaScript file, `npm test`, and `git diff --check`**; require clean exits and zero test failures.
- [ ] **Step 5: Start the local site and visually inspect** authenticated dashboard and public card at desktop and mobile viewport sizes, including long fields, empty rows, every icon family, keyboard picker flow, images, and unsaved state.
- [ ] **Step 6: Commit** `feat: complete direct card editing experience`.
- [ ] **Step 7: Push `main`, wait for Vercel, and verify** the deployed asset signatures plus live dashboard/public-card rendering before reporting completion.
