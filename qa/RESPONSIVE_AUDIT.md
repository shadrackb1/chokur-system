# Chokur System — Responsive & Touch-First Interface Audit

Comprehensive responsiveness and touch ergonomics audit conducted across all breakpoints:
- Small phone: 320x568 (iPhone SE / low-end Android)
- Typical Android: 360x800 (Samsung Galaxy / Transsion Tecno / Infinix)
- Modern phone: 390x844 (iPhone 14/15/16)
- Large phone: 430x932 (iPhone Pro Max / Pixel Pro)
- Phone landscape: 844x390
- Small tablet: 600x960
- Tablet portrait: 768x1024 (iPad)
- Tablet landscape: 1024x768 & 1180x820
- Laptop / Desktop: 1280x720, 1440x900, 1920x1080
- Ultrawide: 2560x1440
- Accessibility: 200% Font Zoom, Reduced Motion

---

## Audit Findings Table

| Route / Component | Issue Description | Severity | Target Breakpoints | Root Cause | Planned Fix |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Global / App Shell** | Sidebar fixed at `w-[220px]` and `main` with hardcoded `ml-[220px]` causes severe page overflow and 65% screen obstruction on mobile | **BLOCKER** | `< 768px`, `< 1024px` | Hardcoded desktop left offset and fixed sidebar | Implement responsive shell: 56px Bottom Tab Bar on `< 768px` (`env(safe-area-inset-bottom)`), collapsible 72px rail on tablet portrait (768-1023px), persistent 200px sidebar on landscape tablet (1024-1279px), full 220px on desktop (≥ 1280px). Remove `ml-[220px]` on mobile. |
| **Global / TopNavBar** | TopNavBar has hardcoded `left-[220px]`, dropdown menus exceed screen width on phones | **BLOCKER** | `< 768px` | Desktop-only offset and wide absolute popovers | Adapt `left-0 md:left-[72px] lg:left-[200px] xl:left-[220px]`. Convert dropdowns on phones into touch-friendly bottom sheets with large touch targets (≥ 48px). |
| **Viewport & CSS** | Viewport meta lacks `viewport-fit=cover`; missing safe-area insets; pull-to-refresh interferes with editing | **BLOCKER** | Mobile Safari & Android Chrome | Incomplete viewport meta tag & missing overscroll lock | Update meta tag to `width=device-width, initial-scale=1, viewport-fit=cover`. Add `overscroll-behavior-y: contain`, `env(safe-area-inset-*)`, and define fluid clamp typography. |
| **Marks Entry** | Massive 12-column table is unusable on phones; tiny tap targets (< 36px); input font < 16px triggers iOS Safari auto-zoom; virtual keyboard covers active cells | **BLOCKER** | `< 768px` | Desktop-only table matrix with no touch adaptation | Build a dedicated **Student-by-student** mobile entry mode (default on phone) with large numeric inputs (`inputmode="numeric"`, `enterkeyhint="next"`), live grade chips, Previous/Next buttons (≥ 48px), swipe gestures, and student picker sheet. Add a **Subject-by-subject** mode. Keep Grid mode with horizontal momentum scrolling. Ensure input font size ≥ 16px to prevent iOS auto-zoom. |
| **Report Cards** | Split master-detail layout crushes preview on phones to unreadable sliver; buttons overflow | **BLOCKER** | `< 768px` | Two-pane flex layout with fixed 320px left sidebar | On phones (< 768px), display searchable student roster; tapping a student navigates to a full-screen, responsive card preview scaled to fit mobile width with pinch-zoom support, back button, and Web Share API. Tablets (≥ 768px) keep side-by-side view. |
| **Rankings** | Table causes horizontal scroll on phones; column headers too narrow for touch; sorting unreachable | **MAJOR** | `< 768px` | 10-column rigid desktop tabular structure | Render compact two-line touch cards on phones (Rank, Name, Grade Chip, Aggregate, Avg, Status) with tap-to-expand drawer. Provide dedicated touch Sort & Filter bottom sheet. |
| **Subject Analysis** | Benchmark bar chart labels get clipped at 320-360px; table overflows screen; controls wrap awkwardly | **MAJOR** | `< 768px`, `< 480px` | Fixed-width label columns and rigid 10-column table | Make chart labels fluid or wrap on narrow screens. Convert table rows into stacked cards on mobile with prominent average, pass rate, and expandable breakdown. |
| **Grade Distribution** | 12-tier table causes horizontal page overflow on small phones; chart cramped at 320px | **MAJOR** | `< 768px`, 320px | Table structure designed for desktop monitors | Make 5-column chart responsive at 320px with clear value labels. Render 12-tier breakdown as a clean vertical touch ledger on mobile. |
| **Students & Classes** | Management tables overflow viewport; modal dialogs clipped on mobile screens | **MAJOR** | `< 768px` | Rigid tables and desktop centered dialogs | Convert tables into touch cards on phones with quick actions. Transform modals into bottom sheets on mobile. |
| **Profile & WhatsApp Inbox** | Feature missing: teachers lack quick parent WhatsApp communication and profile settings | **MAJOR** | All sizes | Missing view in routing | Create `ProfileInboxView.tsx` with teacher profile and realistic WhatsApp broadcast/inbox thread. On phones, fix composer above virtual keyboard and safe area like a native messaging app. |
| **Touch & Accessibility** | Touch targets < 44px; hover-only visual cues; sticky-hover on mobile; missing PWA install | **MAJOR** | Touch devices | Desktop hover states and unoptimized buttons | Ensure min 44x44px touch targets; wrap hover styles with `@media (hover: hover)`; set `touch-action: manipulation`; implement PWA manifest, service worker, and in-app install prompt. |
| **Ultrawide Monitors** | Content stretches across 2560px with awkward gaps | **MINOR** | `≥ 1600px` | Missing centered max-width constraints | Constrain workspace canvas with `max-w-[1440px] mx-auto` and comfortable padding. |

---

## Action Plan & Execution Order
1. **Foundations**: Viewport meta, responsive tokens, fluid typography, safe-area variables, safe touch styling.
2. **Responsive App Shell**: Bottom tab bar on phones, collapsible rail on tablet portrait, persistent sidebar on landscape/desktop.
3. **Marks Entry Responsive Overhaul**: Student-by-student mode (default on phone), Subject-by-subject mode, and Grid mode with device mode persistence.
4. **Rankings Mobile Cards & Touch Sort Sheet**: Two-line cards with C+ divider and bottom sheet filters.
5. **Report Cards Mobile Flow**: Single-pane list to full-screen scaled card preview with PDF download, print, and native share.
6. **Subject Analysis & Grade Distribution**: Fluid charts, mobile cards, touch tabs.
7. **Students & Classes + Settings**: Responsive touch cards, single-column mobile forms, bottom sheet modals.
8. **Profile & WhatsApp Inbox**: WhatsApp thread with mobile composer pinned above virtual keyboard and safe area.
9. **PWA Integration**: Web App Manifest, Service Worker, icons, install prompt hook and button.
10. **Verification**: Playwright responsive test script across all required viewports.
