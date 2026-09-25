# Noshutdown Platform Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply one original, professional, accessible, mobile-first Noshutdown design system to every page.

**Architecture:** Shared CSS tokens/components and shared UI JavaScript replace duplicated presentation and inline event handlers while page-specific modules retain unique behavior. The redesign consumes the hardened Supabase APIs defined by the security plan.

**Tech Stack:** Semantic HTML5, CSS custom properties, vanilla JavaScript modules, Supabase JS v2, Playwright browser tests, Vercel static hosting.

**Spec:** `docs/superpowers/specs/2026-09-25-platform-redesign-design.md`

## Global Constraints

- Preserve static hosting with no runtime build requirement.
- Keep the design original; do not copy Trowas branding, artwork, or exact styling.
- Apply the design to every HTML page in the repository.
- Maintain Turkish copy and existing product features unless the spec explicitly changes them.
- Keep touch targets at least 44 by 44 CSS pixels and respect reduced motion.

## Review Focus

- Long names, emails, URLs, and addresses must wrap without horizontal overflow.
- Missing optional profile fields must remove empty actions and sections cleanly.
- Keyboard focus must enter, remain within, and return from modal/drawer UI.
- Light card themes and arbitrary valid accent colors must retain readable contrast.
- Phone-sized layouts must preserve all primary actions without hover dependencies.

---

### Task 1: Establish the shared design system and browser test harness

**Files:**
- Create: `assets/css/tokens.css`
- Create: `assets/css/base.css`
- Create: `assets/css/components.css`
- Create: `assets/js/ui.js`
- Create: `playwright.config.js`
- Create: `tests/browser/shared-ui.spec.js`
- Modify: `package.json`

**Interfaces:**
- Produces: shared CSS classes and `NoshutdownUI` helpers for navigation, modal, toast, safe URL, and clipboard behavior.

- [ ] **Step 1: Write failing shared UI browser tests**

Test visible focus, 44px actions, drawer Escape handling, reduced-motion CSS, modal focus return, and viewport overflow at phone/desktop widths.

- [ ] **Step 2: Run focused browser tests and verify failure**

Run: `npm run test:browser -- tests/browser/shared-ui.spec.js`

- [ ] **Step 3: Implement tokens, base styles, shared components, and UI helpers**

Keep APIs data-attribute driven so static pages need no framework.

- [ ] **Step 4: Run unit and browser tests**

Run: `npm test && npm run test:browser -- tests/browser/shared-ui.spec.js`

- [ ] **Step 5: Commit**

```bash
git add assets package.json playwright.config.js tests/browser/shared-ui.spec.js
git commit -m "feat: add Noshutdown design system"
```

### Task 2: Redesign the public digital card

**Files:**
- Modify: `card.html`
- Create: `assets/css/card.css`
- Modify: `assets/js/card.js`
- Create: `tests/browser/card.spec.js`

**Interfaces:**
- Consumes: hardened card data functions and shared UI helpers.
- Produces: banner/avatar identity layout, conditional quick actions, information rows, map, business details, QR/share/contact modals, and owner-only edit action.

- [ ] **Step 1: Write failing card browser tests**

Cover demo rendering, optional fields, copy feedback, modal keyboard behavior, malicious strings as text, invalid URLs, owner edit visibility, light/dark themes, and mobile overflow.

- [ ] **Step 2: Run focused tests and verify failure**

Run: `npm run test:browser -- tests/browser/card.spec.js`

- [ ] **Step 3: Implement semantic card markup and responsive card styles**

- [ ] **Step 4: Connect conditional actions and accessible dialogs**

- [ ] **Step 5: Run full tests and visually inspect phone/desktop screenshots**

Run: `npm test && npm run test:browser -- tests/browser/card.spec.js`

- [ ] **Step 6: Commit**

```bash
git add card.html assets/css/card.css assets/js/card.js tests/browser/card.spec.js
git commit -m "feat: redesign public digital card"
```

### Task 3: Redesign the dashboard workspace

**Files:**
- Modify: `dashboard.html`
- Create: `assets/css/dashboard.css`
- Modify: `assets/js/dashboard.js`
- Create: `tests/browser/dashboard.spec.js`

**Interfaces:**
- Consumes: shared components and hardened dashboard data layer.
- Produces: sectioned editor, explicit save state, media controls, analytics cards, and responsive live preview.

- [ ] **Step 1: Write failing dashboard browser tests**

Cover unauthenticated redirect, section navigation, dirty/saving/saved/error states, validation placement, upload requirements, empty analytics, and phone/desktop layout.

- [ ] **Step 2: Run focused tests and verify failure**

Run: `npm run test:browser -- tests/browser/dashboard.spec.js`

- [ ] **Step 3: Implement the desktop workspace and mobile editor flow**

- [ ] **Step 4: Add accessible validation, save state, upload state, and analytics UI**

- [ ] **Step 5: Run tests and visual checks**

- [ ] **Step 6: Commit**

```bash
git add dashboard.html assets/css/dashboard.css assets/js/dashboard.js tests/browser/dashboard.spec.js
git commit -m "feat: redesign profile dashboard"
```

### Task 4: Redesign landing and authentication pages

**Files:**
- Modify: `index.html`
- Modify: `login.html`
- Modify: `register.html`
- Modify: `reset.html`
- Create: `assets/css/marketing.css`
- Create: `assets/css/auth.css`
- Create: `tests/browser/marketing-auth.spec.js`

**Interfaces:**
- Consumes: shared design system and hardened auth handlers.
- Produces: premium landing conversion flow and consistent accessible auth shell.

- [ ] **Step 1: Write failing landing/auth tests**

Cover navigation, primary/secondary CTAs, auth labels/autocomplete/status regions, password guidance, responsive layout, and no invented proof metrics.

- [ ] **Step 2: Run focused tests and verify failure**

- [ ] **Step 3: Implement the landing hierarchy and card preview**

- [ ] **Step 4: Implement the shared authentication shell**

- [ ] **Step 5: Run tests and visual checks**

- [ ] **Step 6: Commit**

```bash
git add index.html login.html register.html reset.html assets/css/marketing.css assets/css/auth.css tests/browser/marketing-auth.spec.js
git commit -m "feat: redesign landing and authentication"
```

### Task 5: Redesign supporting and legal pages

**Files:**
- Modify: `nfc.html`
- Modify: `iletisim.html`
- Modify: `gizlilik.html`
- Modify: `kullanim-sartlari.html`
- Modify: `404.html`
- Create: `assets/css/content.css`
- Create: `tests/browser/content-pages.spec.js`

**Interfaces:**
- Consumes: shared header, footer, content panels, form components, and legal typography.
- Produces: consistent NFC, contact, legal, and recovery experiences.

- [ ] **Step 1: Write failing content-page tests**

Check landmarks, heading order, shared navigation/footer, legal readability, contact statuses, 404 recovery links, and responsive overflow.

- [ ] **Step 2: Run focused tests and verify failure**

- [ ] **Step 3: Implement NFC and contact layouts**

- [ ] **Step 4: Implement legal-document and 404 layouts**

- [ ] **Step 5: Run tests and visual checks**

- [ ] **Step 6: Commit**

```bash
git add nfc.html iletisim.html gizlilik.html kullanim-sartlari.html 404.html assets/css/content.css tests/browser/content-pages.spec.js
git commit -m "feat: redesign supporting pages"
```

### Task 6: Align deployment security and perform whole-platform verification

**Files:**
- Modify: `vercel.json`
- Delete: `netlify.toml`
- Delete: `_headers`
- Delete: `_redirects`
- Modify: `README.md`
- Create: `tests/security/deployment-contract.test.mjs`

**Interfaces:**
- Consumes: event-handler-free pages and pinned dependency URLs.
- Produces: matching routing/cache/security behavior for supported static hosts.

- [ ] **Step 1: Write failing deployment-contract tests**

Assert equivalent username rewrites, 404 behavior where supported, CSP, frame/content/referrer/permissions headers, and consistent canonical production domain usage.

- [ ] **Step 2: Run tests and verify failure**

- [ ] **Step 3: Make Vercel the sole deployment configuration**

Only enable CSP directives compatible with the completed script extraction.

- [ ] **Step 4: Update README with local server, rewrite testing, Supabase migration, and verification instructions**

- [ ] **Step 5: Run the complete automated suite**

Run: `npm test && npm run test:browser`

Expected: zero failures.

- [ ] **Step 6: Inspect every page at phone and desktop widths**

Check console errors, keyboard flow, horizontal overflow, loading/empty/error states, and public demo behavior.

- [ ] **Step 7: Commit**

```bash
git add -A vercel.json netlify.toml _headers _redirects README.md tests/security/deployment-contract.test.mjs
git commit -m "chore: finalize platform security and deployment"
```
