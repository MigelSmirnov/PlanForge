---
name: planforge
summary: Build a small working plan-annotation web app from a user-supplied engineering plan image, SVG, or PDF page.
---

# PlanForge

Build a dedicated, minimal application for the exact plan supplied by the user. Do not design a generic CAD platform.

## Goal

Turn one supplied plan into a working offline-friendly web app where the user can enter missing dimensions or short notes at predefined points, save progress locally, and export the completed plan.

## Required workflow

1. Inspect the actual source at sufficient resolution.
2. Record the source width and height.
3. Identify every intended input point visible on the plan.
4. Mark uncertain positions as `probable`; never present guesses as confirmed.
5. Create `plan-spec.js` using source-document coordinates, not screen pixels.
6. Copy the files from `template/` into a new output folder.
7. Replace the sample plan with the user's source asset.
8. Update the title, units, fields, and source dimensions.
9. Run the app through a local HTTP server.
10. Verify every field visually against the original plan.
11. Deliver a ZIP containing a working application.

## Output structure

```text
output/
├── index.html
├── styles.css
├── app.js
├── plan-spec.js
├── plan.jpg
└── README.md
```

Use `plan.png`, `plan.svg`, or another extension when appropriate, and update `assetPath` accordingly.

## Plan specification

```js
window.PLAN_SPEC = {
  id: "project-id",
  title: "Plan dimensions",
  units: "mm",
  source: {
    assetPath: "plan.jpg",
    width: 1468,
    height: 1048
  },
  fields: [
    {
      id: "dim-01",
      x: 340,
      y: 245,
      label: "Dimension 1",
      orientation: "horizontal",
      confidence: "probable",
      required: true
    }
  ]
};
```

Coordinates must be measured in the source image coordinate system.

## Minimum application behavior

- Render the source plan without distortion.
- Place tappable field markers over the plan.
- Open a compact value editor on tap.
- Use decimal-friendly input.
- Show completed and empty states.
- Save values in `localStorage`.
- Support reset, project JSON download, project JSON import, SVG export, and browser print.
- Keep all annotations aligned during resize and zoom.
- Work without a build step or external dependencies.

## Scope limits

Do not add React, TypeScript, databases, authentication, collaboration, cloud storage, arbitrary drawing tools, OCR dependencies, or a reusable plugin system unless explicitly requested.

## Verification checklist

- Every field has a unique ID.
- Every field lies inside the source bounds.
- Every field maps to an intended location.
- Uncertain fields are visibly distinguishable during review.
- Values survive reload.
- Export contains the full plan, not only the visible viewport.
- The output opens through `python3 -m http.server 8080`.

## Delivery

Provide the ZIP and brief launch instructions. Clearly list assumptions that still require user confirmation.