---
name: plan-app-builder
description: Build a small working mobile-first offline web application for one supplied engineering plan, drawing, scan, photo, SVG, or PDF. Use when a user wants to enter missing dimensions or other fixed values directly on a specific plan and receive a ready-to-open ZIP.
---

# Plan App Builder

Build a dedicated application for the supplied source. Do not design a platform, generic CAD editor, monorepo, or reusable product unless the user explicitly asks for one.

## Primary target

The primary target is a phone or tablet. The generated app must be usable without requiring the end user to run a development server.

Prefer a self-contained static package that can be opened directly from local files. If browser restrictions make a feature unavailable under `file://`, the app must degrade safely and the limitation must be stated. Do not make `python3 -m http.server` the default user workflow.

## Required result

Return a working folder or ZIP containing:

```text
index.html
styles.css
app.js
assets/plan.<ext>
plan-spec.js
README.md
```

Use plain HTML, CSS, and JavaScript by default. Avoid npm, frameworks, build steps, databases, authentication, and cloud services unless genuinely required.

## Workflow

1. Inspect the actual supplied plan at sufficient resolution.
2. Identify the exact user operation.
3. Record source width, height, units, interaction points, and uncertainties.
4. Create `plan-spec.js` with source-document coordinates, never screen coordinates.
5. Copy the source into `assets/` without modifying it unless requested.
6. Generate the application from the specification.
7. Run automated structural and interaction tests.
8. Visually verify the app at phone and tablet viewport sizes.
9. Compare every marker with the source.
10. Deliver the working ZIP, not only a proposal or mockup.

## Mobile interaction requirements

- Use a mobile-first layout.
- Respect safe-area insets.
- No toolbar button may overlap another control at 320, 360, 390, 412, and 768 CSS px widths.
- Touch targets must be at least 44 × 44 CSS px.
- Toolbars must wrap, scroll, collapse, or move into a menu instead of overlapping.
- Popovers and sheets must remain fully visible inside the viewport.
- On narrow screens, use a bottom sheet instead of a floating card where practical.
- The software keyboard must not hide the active input or action buttons.
- Pinch zoom and one-finger pan must not trigger annotation buttons accidentally.
- A visible control must always have a working event handler or be removed.

## Minimal specification

```js
window.PLAN_SPEC = {
  schemaVersion: 1,
  id: "project-id",
  source: {
    kind: "image",
    assetPath: "assets/plan.jpg",
    width: 1536,
    height: 1096,
    fingerprint: "source-specific-id"
  },
  units: "mm",
  fields: [
    {
      id: "D01",
      kind: "dimension",
      x: 350,
      y: 260,
      orientation: "horizontal",
      label: "Upper opening",
      unit: "mm",
      required: true,
      sourceConfidence: "probable"
    }
  ],
  assumptions: []
};
```

## Application behavior

For a fixed set of fields, implement only what is needed:

- plan image with an SVG overlay;
- tap a marker to enter a value;
- decimal numeric keyboard on mobile;
- previous and next field navigation;
- completed-field progress;
- pan and zoom, including pinch zoom;
- autosave to `localStorage`;
- editable project export and import as JSON;
- completed full-document export as SVG or browser print/PDF;
- exports independent of the current viewport transform.

## Mandatory automated tests

Create tests appropriate to the generated implementation. At minimum verify:

1. `plan-spec` parses and every field ID is unique.
2. Every field lies inside source bounds.
3. Required DOM elements exist.
4. Every visible button has a registered action.
5. Opening a field editor, saving, cancelling, previous, and next work.
6. Values survive reload through `localStorage`.
7. Invalid import is rejected with a visible error.
8. Export contains the full source dimensions and completed values.
9. Coordinate transforms round-trip within tolerance.
10. No control rectangles overlap at required mobile viewport widths.
11. The editor sheet remains inside the viewport at required widths and heights.
12. A smoke test completes the main flow without uncaught exceptions.

Do not mark the build complete if tests were not run. If browser automation is unavailable, provide the test files and clearly state which tests could not be executed.

## Visual verification

Capture or inspect rendered states at minimum for:

- 320 × 568;
- 360 × 800;
- 390 × 844;
- 412 × 915;
- 768 × 1024.

Verify empty state, selected marker, open editor, filled value, toolbar overflow, landscape orientation, and software-keyboard-safe layout.

## Source interpretation rules

- Treat OCR and computer-vision output as provisional until visually checked.
- Mark estimated positions as `probable` or `manual`; never present guesses as confirmed.
- Ask only questions that block a working first version.
- Do not infer missing dimensions from pixel distances unless scale is reliably calibrated.
- Do not publish a user's plan in a public repository without explicit permission.

## Acceptance checks

Before delivery verify that:

- every field maps to an intended source location;
- field IDs are unique;
- all coordinates lie inside the source document;
- markers remain aligned after pan, zoom, resize, and orientation change;
- controls do not overlap on supported mobile sizes;
- all visible buttons work;
- the editor cannot render outside the viewport;
- entered values survive reload;
- incompatible project JSON is rejected or warned about;
- export includes the complete plan and all completed values;
- the app opens directly from the delivered package where supported;
- all mandatory tests pass, or unexecuted tests are explicitly disclosed.

## Reference implementation

Use `examples/apartment-dimensions/` only as a structural reference. Adapt it to the supplied source instead of copying its coordinates, field count, or layout defects.