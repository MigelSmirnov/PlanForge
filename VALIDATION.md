# PlanForge validation contract

A generated application is not complete merely because its files exist or its first screen renders. It is complete only after behavior, responsive layout, persistence, export, and source alignment have been verified.

## Required test matrix

| Area | Required checks |
|---|---|
| Specification | parses; schema version exists; field IDs are unique; all coordinates are inside source bounds |
| DOM | required elements exist; no duplicate element IDs; visible controls have accessible names |
| Controls | every visible button has a working action; save, cancel, previous, next, reset, import, export, and close behave correctly when present |
| Mobile layout | no overlapping controls; no horizontal page overflow; touch targets are at least 44 × 44 CSS px; safe areas are respected |
| Editor | opens for the selected field; stays inside the viewport; remains usable with the software keyboard; closes through save and cancel |
| Gestures | pan works; pinch zoom works; gestures do not accidentally activate markers or buttons |
| Persistence | saved values survive reload; reset removes only intended data; incompatible data is rejected or warned about |
| Import | valid project data loads; malformed JSON and wrong-plan data produce a visible error without corrupting current state |
| Export | uses full source dimensions; includes completed values; is independent of current pan and zoom; completed labels use opaque panels that cover baked-in placeholders; print/PDF uses the generated completed-plan SVG rather than the live UI |
| Geometry | screen/document transforms round-trip within tolerance; markers remain aligned after resize and orientation change |
| Runtime | main flow produces no uncaught exceptions or unhandled promise rejections |
| Source review | every generated marker is visually compared with the supplied plan; uncertain points are labelled as uncertain |

## Golden export regression

The proven v3-2 result is the behavioral baseline for fixed raster placeholders.

For every completed field, the exported SVG must contain this paint order:

```text
source image
→ opaque covering panel
→ entered value text
```

The export fails validation when any of these are true:

- the value is rendered as bare text over the source image;
- the original `?` remains visible beneath or beside the entered value;
- printing calls `window.print()` on the live application page;
- toolbar, dialogs, markers, or viewport clipping appear in PDF output;
- the exported result depends on current pan or zoom;
- the covering panel erases important nearby plan geometry.

Required regression checks:

1. Fill at least one short value and one long value.
2. Generate the completed SVG.
3. Assert that every completed field group contains an opaque `rect` or equivalent covering shape before its `text` node.
4. Assert that the SVG width, height, and viewBox equal the source dimensions.
5. Render 100% crops around completed fields and compare them with the expected reference behavior.
6. Confirm visually that no original placeholder is visible in completed field regions.
7. Trigger print/PDF and confirm it renders the same completed SVG without application chrome.

## Required viewport set

Automated layout checks and visual inspection must cover:

```text
320 × 568
360 × 800
390 × 844
412 × 915
768 × 1024
```

Also test at least one phone landscape viewport.

## Overlap test rule

For every pair of visible interactive controls, compare their rendered bounding rectangles. Fail when rectangles intersect beyond an explicitly documented intentional containment relationship.

The check must include:

- toolbar buttons;
- overflow/menu buttons;
- editor action buttons;
- bottom navigation or sheets;
- floating controls;
- marker controls when they are designed to remain separately tappable.

Do not hide an overlap by reducing opacity or z-index. Fix the layout.

## Visible-control rule

A visible control must be one of:

1. enabled and connected to working behavior;
2. intentionally disabled with a clear reason available to the user;
3. removed from the interface.

Placeholder buttons are release blockers.

## Mobile editor rule

At narrow widths, prefer a bottom sheet or full-width dialog that:

- fits inside the visual viewport;
- accounts for safe-area insets;
- keeps the active input and primary actions visible when the software keyboard opens;
- can be dismissed through an explicit cancel or close action;
- does not cover the selected value without providing clear context.

## Validation report

Each generated app must include a short report with this structure:

```md
# Validation report

## Environment
- Browser/runtime:
- Test command:
- Source dimensions:

## Automated results
- PASS/FAIL — specification validation
- PASS/FAIL — control actions
- PASS/FAIL — persistence
- PASS/FAIL — import rejection
- PASS/FAIL — export structure
- PASS/FAIL — placeholder-cover regression
- PASS/FAIL — print/PDF clean-output regression
- PASS/FAIL — coordinate transforms
- PASS/FAIL — responsive overlap checks
- PASS/FAIL — smoke flow

## Visual review
- PASS/FAIL — 320 × 568
- PASS/FAIL — 360 × 800
- PASS/FAIL — 390 × 844
- PASS/FAIL — 412 × 915
- PASS/FAIL — 768 × 1024
- PASS/FAIL — phone landscape
- PASS/FAIL — completed-field export crops

## Source alignment
- Confirmed fields:
- Probable/manual fields:
- Unreadable or unresolved regions:

## Unverified items
- None, or an explicit list with reasons.
```

## Completion language

Use **complete** only when all mandatory checks were executed and passed.

When some checks could not be executed, use language such as:

> The implementation is delivered, but validation is incomplete. The following checks were not executed: …

Never replace missing test evidence with a confident claim.