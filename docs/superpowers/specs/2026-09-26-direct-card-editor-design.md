# Direct Card Editor Design

## Purpose

Replace the dashboard's detached form and phone-sized iframe preview with a professional, large-format editor that is visually identical to the published digital card. The card itself becomes the editing surface: users edit content in context, see every unsaved change immediately, and open an item-specific icon chooser from a small pencil control beside that icon.

## Success Criteria

- The dashboard's central workspace is a large, responsive representation of the real published card rather than disconnected form sections.
- Name, company, title, biography, phones, email, website, address, tax details, and social links can be edited from their visible card location.
- Unsaved content, media, theme, order, visibility, and icon choices update immediately but reach Supabase only after explicit save.
- Published and editor rendering share structural and visual rules, preventing preview drift.
- Every icon pencil opens only variants belonging to that semantic family.
- Icon options have no visible names; accessible labels remain available.
- Icons are recognizable and consistent in stroke, optical size, corners, and weight.
- Existing profile URLs, Supabase columns, uploads, analytics, and owner-scoped persistence continue working.

## Chosen Approach

Extract the reusable visual card structure into a shared card-view module. The public card supplies read-only interaction behavior; the dashboard supplies edit controls and draft state to the same view. This avoids fragile iframe overlays and avoids maintaining another approximation of the card.

## Editor Layout

The desktop dashboard contains a restrained sticky header with brand, save state, card link, save, and logout actions; a compact utility strip for URL, views, clicks, theme, and accent color; and one centered large card-editing canvas using the public card's spacing, typography, colors, sections, and responsive behavior.

The canvas is not inside a fake phone. At desktop sizes it is wide enough to edit comfortably while retaining the public card's proportions. On narrow screens it becomes a full-width card editor.

## Direct Editing

Editable text appears normally until focused or hovered. A subtle outline and edit affordance then reveal editability. Real form controls styled with the card typography are used instead of `contenteditable`, preserving validation, mobile keyboards, accessibility, and reliable serialization.

- Short values use inline inputs.
- Biography and address use auto-growing textareas.
- Phone controls pair a country-code selector with the local number.
- URL and email inputs retain appropriate input types.
- Empty optional sections display a restrained "Bilgi ekle" placeholder only in editor mode.
- Social entries are edited in the visible social section with URL, move, remove, and icon controls. "Sosyal bağlantı ekle" replaces the separate social manager.
- Photo and cover expose contextual "Değiştir" and "Kaldır" controls; existing upload validation and replacement cleanup remain.

## Icon System

The mixed hand-authored paths are replaced with a curated local SVG catalog in one coherent modern outline style. Runtime external requests are unnecessary. Brand icons retain recognizable official geometry and brand color; interface and contact icons use theme colors.

Each visible icon has a small pencil button. It opens an anchored popover containing six to eight visual variants only for that slot. Call contains handset variants; mobile contains device variants; WhatsApp contains recognizable WhatsApp variants; save contains download or file-save variants and never a standalone person; Instagram contains recognizable Instagram variants; copy contains duplicate/copy variants.

One popover can be open at a time. It closes on selection, Escape, outside click, or focus leaving. The selected option exposes visible state and `aria-pressed`; triggers expose `aria-haspopup`, `aria-expanded`, and slot-specific labels. Unknown legacy identifiers resolve to the modern slot default. `icon_config` keeps its existing JSON keys.

## State and Data Flow

1. Fetch the authenticated profile with the existing owner-bound query.
2. Normalize it into an immutable draft and baseline snapshot.
3. Render the draft through the shared card view in editor mode.
4. Each interaction creates a draft patch, updates the visible card, and marks it dirty.
5. Save serializes existing profile fields and `icon_config`, then performs the owner-filtered upsert.
6. Successful save replaces the baseline and clears dirty state.

The public card continues reading through the restricted public RPC and renders the shared view in read-only mode. Dashboard editor interactions never emit analytics.

## Unsaved Changes and Errors

The save button remains reachable in the sticky header. Status reports saved, unsaved, saving, and failure states. Leaving with unsaved changes triggers the standard before-unload warning; logout with unsaved changes uses an in-app confirmation.

Existing URL allow-listing and safe DOM construction remain mandatory. Invalid URLs, email, and incomplete phones show errors beside the visible field. Save is blocked while errors exist. Upload or Supabase failures preserve the full draft. Icon identifiers are accepted only from their slot whitelist.

## Accessibility and Responsive Behavior

All controls have labels. Keyboard order follows card order. Popovers support Escape and restore trigger focus. Focus rings meet contrast needs and reduced-motion preferences are respected. On mobile, toolbar actions remain reachable, fields do not overflow, popovers stay inside the viewport, and the editor matches the published mobile card layout.

## Implementation Boundaries

- `card.html` remains the public route shell and public-action host.
- A shared card-view module owns card structure and rendering in read-only/editor modes.
- A dashboard-editor module owns draft mutation, direct fields, dirty state, validation, and serialization.
- An icon-picker module owns popover lifecycle and slot-specific selection.
- The icon catalog owns semantic definitions, whitelists, defaults, and SVG creation.
- Supabase and storage helpers remain separate from rendering.

## Testing and Verification

Automated tests prove that the legacy detached icon grid and phone iframe are absent; both surfaces consume the shared view; drafts do not write before save; serialization preserves existing Supabase fields; icon slots expose only semantic families and legacy IDs fall back safely; popover dismissal and keyboard behavior exist; URL safety, phone codes, social ordering, and image constraints remain; accessibility and responsive hooks exist; and Vercel/security checks continue passing.

Verification includes the complete test suite and visual inspection of editor and published card at desktop and mobile viewport sizes.
