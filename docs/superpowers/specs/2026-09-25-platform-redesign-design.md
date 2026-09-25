# Noshutdown Platform Redesign Design

## Goal

Redesign every public and authenticated page into one professional, mobile-first Noshutdown experience while preserving the existing static-site architecture and the approved Supabase security model.

The visual reference is the information hierarchy and usability of the Trowas digital-card page. The implementation must be original and use Noshutdown's own black, charcoal, ivory, and warm-gold identity rather than copying the reference's branding or exact layout.

## Product Principles

- A visitor must understand who the card owner is and reach a primary action within seconds.
- Public contact information must be readable, copyable, and usable with one hand on a phone.
- Owners must be able to update a profile without understanding the database model.
- Every page must look like one product, not a collection of independent HTML files.
- Accessibility, secure rendering, and responsive behavior are requirements rather than finishing touches.
- The site remains deployable as static files without a build step.

## Technical Approach

The project remains HTML, CSS, and browser JavaScript. A framework migration is intentionally avoided because it would add deployment and runtime complexity without improving the current product scale.

Shared presentation and behavior move into reusable assets:

- `assets/css/tokens.css`: color, typography, spacing, radius, elevation, and motion tokens.
- `assets/css/base.css`: reset, typography, focus behavior, page shell, and accessibility utilities.
- `assets/css/components.css`: buttons, navigation, footer, cards, form controls, alerts, modals, and reusable information rows.
- `assets/js/ui.js`: menu, modal, toast, copy, theme, and safe-link helpers.
- Page-specific CSS and JavaScript remain separate when behavior is unique.

Inline event handlers are removed. DOM listeners are registered from scripts loaded with `defer`. User-controlled values are assigned through DOM properties and `textContent`, never interpolated into HTML strings.

## Visual Language

### Color

- Canvas: near-black with subtle warm radial gradients.
- Surfaces: layered charcoal tones with thin low-contrast borders.
- Primary accent: warm gold, used for primary actions and key highlights rather than large backgrounds.
- Light surfaces: warm ivory rather than pure white.
- Status colors: accessible green, amber, and red tokens independent from the brand accent.

User-selected card accent colors continue to work. Components derive readable foreground and subtle tint values from the chosen accent.

### Typography

- Editorial headings and large names use Cormorant Garamond.
- Interface copy, forms, navigation, and metrics use DM Sans.
- Font sizes use a consistent fluid scale with readable minimums on mobile.
- Labels use restrained tracking; long Turkish text is never forced into all caps.

### Components

- Buttons share height, radius, focus ring, disabled state, loading state, and icon alignment.
- Panels use consistent padding, border, and elevation.
- Information rows include an icon, label/value group, optional primary action, and copy feedback.
- Forms include persistent labels, helper/error text, and clear focus states.
- Modals use focus management, Escape dismissal, labelled controls, and a mobile bottom-sheet treatment where appropriate.
- Motion respects `prefers-reduced-motion`.

## Global Navigation and Footer

Public pages use a shared sticky header with the Noshutdown wordmark, concise navigation, sign-in action, and primary create-card CTA. Mobile navigation opens as an accessible drawer with background scroll lock and Escape dismissal.

The shared footer contains product links, legal links, contact access, current year, and concise brand copy. Page-specific duplicate navigation/footer markup is normalized to the same semantic structure.

## Public Card Page

The card becomes the strongest expression of the new design:

1. A banner area supports the user's image or an accent-derived gradient fallback.
2. The avatar overlaps the banner and content surface.
3. Name, role, company, and biography form a compact identity block.
4. A responsive quick-action grid exposes call, email, WhatsApp, QR, save-contact, and share actions only when the corresponding data exists.
5. Contact information appears in grouped rows with one-tap actions and copy buttons.
6. Address content includes a map preview and a prominent directions action.
7. Social links use recognizable icons and validated outbound URLs.
8. Company and invoice information is presented in a distinct business-information panel.
9. The contact-owner flow opens in an accessible modal or mobile bottom sheet.
10. Owner edit controls are shown only when the authenticated user's ID owns the displayed profile.

The demo card remains available and uses representative local data. Public profile data is fetched through the approved `get_public_profile` RPC. View and click events use the approved analytics RPC functions.

## Dashboard

The dashboard uses a responsive two-column workspace:

- The editing column contains a section navigation and grouped forms for identity, contact details, social links, company details, appearance, media, password, and analytics.
- A preview column keeps a realistic live card preview visible on wider screens.
- On phones, the preview becomes a dedicated sheet or tab and the editor uses a single-column flow.
- Save state is explicit: idle, dirty, saving, saved, and failed.
- Field errors appear next to fields; global errors use an alert region.
- Upload controls show file requirements, local preview, progress, success, and removal.
- Analytics use compact metric cards and a ranked link-click list, with clear empty states.

The dashboard trusts `auth.getUser()` for identity refresh and relies on RLS for authorization. It never renders database values through `innerHTML`.

## Landing Page

The landing page keeps the premium editorial tone while improving conversion structure:

- A concise hero pairs the value proposition with an interactive-looking card preview.
- Primary and secondary actions distinguish creating a card from viewing the demo.
- A short proof strip communicates mobile readiness, secure ownership, and instant sharing without invented customer numbers.
- Product benefits are organized around create, personalize, share, and measure.
- A three-step workflow explains onboarding.
- NFC is introduced as an optional extension of the digital card.
- A final CTA repeats the core action without duplicating the entire hero.

Decorative effects remain lightweight and do not compromise text contrast or page performance.

## Authentication Pages

Login, registration, and password reset share one branded authentication shell:

- A compact product/value panel appears beside the form on desktop and above it on mobile.
- Forms retain visible labels, autocomplete attributes, password requirements, and accessible status messages.
- Registration explains username rules and terms clearly.
- Password minimum guidance is eight characters and matches the hardened Auth configuration.
- Error messages avoid account enumeration.

## Supporting Pages

- `nfc.html` becomes a focused product explainer with compatible-device guidance and setup steps.
- `iletisim.html` uses the shared form system, privacy note, and clear response expectations.
- `gizlilik.html` and `kullanim-sartlari.html` use a readable legal-document layout with table-of-contents navigation on large screens.
- `404.html` uses the same header, visual identity, and recovery actions as the rest of the site.

## Responsive Behavior

- Core breakpoints target small phones, large phones/tablets, and desktop layouts rather than specific devices.
- No essential interaction relies on hover.
- Touch targets are at least 44 by 44 CSS pixels.
- Long contact values wrap without pushing actions off-screen.
- The public card remains centered with a comfortable maximum width on desktop and becomes edge-to-edge with safe padding on mobile.
- Forms never use side-by-side fields when the available width makes labels or validation difficult to read.

## Accessibility

- Semantic landmarks, heading order, labels, button names, and live regions are required.
- Keyboard users can reach and operate navigation, copy actions, modals, QR controls, and all forms.
- Focus is visible and restored when a modal closes.
- Decorative icons are hidden from assistive technology; action icons receive accessible names through their buttons.
- Color is never the sole indicator of validation or selection.
- Reduced-motion and high-contrast preferences are respected where browser support permits.

## Security Integration

The redesign implements, rather than bypasses, the approved Supabase hardening design:

- Public profile reads use the restricted RPC.
- Profile ownership is enforced by RLS.
- Analytics writes use validated RPC functions.
- Storage writes are restricted to the current user's folder and validated for type and size.
- All user-controlled text and URLs use safe DOM APIs and protocol allowlists.
- Contact submissions retain server-side provider handling; reCAPTCHA is not presented as verified unless it is actually checked server-side.
- External dependencies are version pinned.
- Vercel is the sole deployment target. CSP is introduced only after scripts and event handlers are compatible with it.

## Verification

- Automated static tests verify there are no user-data `innerHTML` sinks or inline event handlers in migrated pages.
- Browser tests cover public card rendering, missing optional data, malicious profile strings, URL rejection, copy actions, modal keyboard behavior, and responsive overflow.
- Auth-flow checks cover registration, confirmation, login, logout, reset, and dashboard protection.
- Supabase tests cover cross-user profile access, public RPC output, analytics function validation, and Storage folder isolation.
- Each page is visually inspected at phone and desktop widths.
- Lighthouse-style checks target accessibility, obvious performance regressions, and missing metadata without requiring a perfect synthetic score.

## Rollout

1. Add shared assets and automated checks without changing production behavior.
2. Apply additive Supabase functions, constraints, and Storage restrictions.
3. Migrate registration, card, and dashboard data flows.
4. Redesign the card and dashboard.
5. Redesign landing, auth, legal, contact, NFC, and 404 pages.
6. Align deployment headers and enable the compatible CSP.
7. Apply final privilege revocations after the new client path is deployed and verified.

No production table rows or Storage buckets are deleted. Deployment and final privilege revocation are treated as separate checkpoints so an old frontend is not left incompatible with the database.

## Out of Scope

- Copying Trowas branding, proprietary artwork, or exact component styling.
- Migrating to a JavaScript framework.
- Adding billing, subscriptions, teams, or a native mobile application.
- Deleting the existing `Demo` Storage bucket without a separate data-retention decision.
- Claiming bot-proof analytics without a trusted rate-limiting service.
