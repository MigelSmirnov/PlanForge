---
name: plan-app-builder
description: Build and verify a small mobile-first offline web application for one supplied engineering plan, drawing, scan, photo, SVG, or PDF. Use when a user wants a ready-to-open app for entering fixed dimensions or notes directly on a specific plan.
---

# Plan App Builder

This file is an execution contract for coding models.

Build a dedicated application for the exact source supplied by the user. Do not design a platform, generic CAD editor, monorepo, or reusable product unless explicitly requested.

## Golden implementation rule

The code in `template/` and the working `examples/apartment-dimensions/` app are executable references, not loose inspiration.

- Start from the template code.
- Preserve its working interaction and export behavior unless a requirement forces a change.
- Do not reimplement proven behavior from memory.
- Do not simplify completed-value export to bare text over the raster image.
- When changing the template, rerun the same validation scenarios and compare the result with the reference.

The proven v3-2 behavior is authoritative for fixed dimension placeholders: a completed value is rendered inside an opaque, compact panel positioned over the original `?`. This panel covers the question mark baked into the source image. Printing/PDF must use the same generated completed-plan SVG, not `window.print()` on the application UI.

## Completion contract

The task is complete only when every required item below exists and every applicable validation check has passed.

### Required delivery

- [ ] `index.html`
- [ ] `styles.css`
- [ ] `app.js`
- [ ] `plan-spec.js`
- [ ] `assets/plan.<ext>`
- [ ] `README.md`
- [ ] automated test files
- [ ] a ZIP or working folder containing the complete app
- [ ] a validation report listing tests run, results, screenshots inspected, and any unverified items

Use plain HTML, CSS, and JavaScript by default. Do not add npm, frameworks, build steps, databases, authentication, cloud services, or a backend unless genuinely required by the user's task.

## Primary target

The primary target is a phone or tablet.

- [ ] The end user does not need to run a development server for the normal workflow.
- [ ] The delivered package opens locally where browser capabilities permit.
- [ ] Features blocked under `file://` degrade safely and are documented.
- [ ] A local HTTP server may be used for development and testing, but must not be presented as the main mobile user workflow.

## Required workflow

1. Inspect the supplied plan at sufficient resolution.
2. Determine the exact user operation.
3. Record source width, height, units, interaction points, and uncertainties.
4. Create `plan-spec.js` using source-document coordinates, never viewport pixels.
5. Copy the original source into `assets/` without modifying it unless requested.
6. Copy and adapt the proven template; do not rewrite it from scratch.
7. Run structural, interaction, persistence, export, and responsive-layout tests.
8. Inspect rendered states at required phone and tablet sizes.
9. Compare every marker and every completed export label with the source.
10. Fix all failures and rerun the affected tests.
11. Deliver the app only after the definition of done is satisfied.

## Minimal plan specification

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

Coordinates must be measured in the source document coordinate system.

## Required application behavior

- [ ] Render the source without distortion.
- [ ] Place tappable markers using the plan specification.
- [ ] Open a compact value editor when a marker is tapped.
- [ ] Use decimal-friendly mobile input.
- [ ] Support save, cancel, previous field, and next field.
- [ ] Show empty, selected, invalid, and completed states.
- [ ] Support one-finger pan and pinch zoom without accidental marker activation.
- [ ] Autosave values locally.
- [ ] Import and export editable project JSON.
- [ ] Export the complete annotated plan, independent of the current pan and zoom.
- [ ] Reject or warn about incompatible project files.
- [ ] Remove any visible control that does not have working behavior.

## Exact completed-export contract

For a raster plan where `?` placeholders are already baked into the image:

1. Keep the source image as the export background.
2. For every completed field, render an opaque panel before the value text.
3. The panel must be large enough to cover the original question mark at that field.
4. Render the entered value on top of the panel.
5. Use the same generated full-document SVG for SVG download and print/PDF.
6. Never print the live application viewport or toolbar.
7. Never export completed values as bare transparent text over the original `?`.

Canonical label shape:

```js
const width = Math.max(48, String(value).length * 13 + 18);
const label = `
  <g transform="translate(${field.x} ${field.y})">
    <rect x="${-width / 2}" y="-16" width="${width}" height="32" rx="7"
      fill="#f4fff8" stroke="#1f7a45" stroke-width="3"/>
    <text x="0" y="1" text-anchor="middle" dominant-baseline="central"
      font-family="Arial,sans-serif" font-size="18" font-weight="700"
      fill="#1f7a45">${escapedValue}</text>
  </g>`;
```

Equivalent styling is allowed only when visual tests prove that the baked-in placeholder is fully hidden without erasing important nearby plan lines.

## Mobile UI contract

The following are release blockers:

- controls overlap;
- icons or buttons cover one another;
- a toolbar extends beyond the viewport without wrapping, scrolling, collapsing, or moving into a menu;
- an editor card or sheet renders partly outside the viewport;
- the software keyboard hides the active input or primary action buttons;
- any touch target is smaller than 44 × 44 CSS px;
- safe-area insets are ignored;
- a popover is used on a narrow screen when a viewport-safe bottom sheet is required;
- pan or pinch gestures accidentally activate controls;
- a visible button has no working event handler.

## Mandatory automated tests

Create tests appropriate to the generated implementation. At minimum verify:

- [ ] `plan-spec` parses successfully.
- [ ] Every field ID is unique.
- [ ] Every field lies inside source bounds.
- [ ] Required DOM elements exist.
- [ ] Every visible button is enabled intentionally and has a registered action.
- [ ] Field editor open, save, cancel, previous, and next work.
- [ ] Values survive reload through local persistence.
- [ ] Invalid import is rejected with a visible error.
- [ ] Export uses full source dimensions and includes completed values.
- [ ] Every completed export group contains an opaque covering shape before its text.
- [ ] Print/PDF is generated from the completed-plan SVG, not the live UI.
- [ ] A filled field does not leave the original `?` visible beneath or beside its value.
- [ ] Document-to-screen and screen-to-document coordinate transforms round-trip within tolerance.
- [ ] Control rectangles do not overlap at required viewport sizes.
- [ ] Editor sheet bounds remain inside the viewport.
- [ ] The main user flow completes without uncaught exceptions.

Do not claim that the app is complete when tests were not run. When browser automation is unavailable, still provide the tests and explicitly list every test that remains unexecuted.

## Required visual verification

Inspect rendered states at minimum at:

- [ ] 320 × 568
- [ ] 360 × 800
- [ ] 390 × 844
- [ ] 412 × 915
- [ ] 768 × 1024
- [ ] at least one phone landscape viewport

At each applicable size inspect:

- [ ] empty state
- [ ] selected marker
- [ ] open editor
- [ ] filled value
- [ ] exported completed value at 100% crop
- [ ] toolbar overflow behavior
- [ ] bottom-sheet or dialog bounds
- [ ] software-keyboard-safe layout

## Source interpretation rules

- Treat OCR and computer-vision output as provisional until visually checked.
- Mark estimated positions as `probable` or `manual`; never present guesses as confirmed.
- Ask only questions that block a working first version.
- Do not infer missing real-world dimensions from pixel distances unless scale is reliably calibrated.
- Do not publish a user's plan in a public repository without explicit permission.
- Never copy coordinates or field counts from the reference example.
- Preserve proven template behavior; do not preserve known defects.

## Definition of done

Before delivery all applicable statements must be true:

- [ ] Every field maps to an intended source location.
- [ ] Marker uncertainty is represented honestly.
- [ ] Markers remain aligned after pan, zoom, resize, and orientation change.
- [ ] Controls do not overlap on supported mobile sizes.
- [ ] All visible buttons work.
- [ ] The editor remains fully inside the viewport.
- [ ] Values survive reload.
- [ ] Invalid or incompatible project data is handled visibly and safely.
- [ ] Export contains the complete plan and all completed values.
- [ ] Completed values hide baked-in placeholders exactly as in the proven reference.
- [ ] Print/PDF contains only the completed plan, not application chrome.
- [ ] The package supports the intended mobile opening workflow.
- [ ] All mandatory tests pass, or any unexecuted checks are clearly disclosed.
- [ ] A validation report is included.

Read `VALIDATION.md` in the repository root for the required test matrix and reporting format.

## Reference implementation

Use `template/` as the code baseline and `examples/apartment-dimensions/` as the behavioral reference. Adapt source dimensions, asset, coordinates, labels, and units. Do not replace the reference export pipeline with a new interpretation.