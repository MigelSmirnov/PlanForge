---
name: plan-app-builder
description: Build a small working offline web application for one supplied engineering plan, drawing, scan, photo, SVG, or PDF. Use when a user wants to enter missing dimensions or other fixed values directly on a specific plan and receive a ready-to-run ZIP.
---

# Plan App Builder

Build a dedicated application for the supplied source. Do not design a platform, generic CAD editor, monorepo, or reusable product unless the user explicitly asks for one.

## Required result

Return a working folder or ZIP that runs with a simple static HTTP server and contains:

```text
index.html
styles.css
app.js
assets/plan.<ext>
plan-spec.json
README.md
```

Use plain HTML, CSS, and JavaScript by default. Avoid npm, frameworks, build steps, databases, authentication, and cloud services unless they are genuinely required.

## Workflow

1. Inspect the actual supplied plan at sufficient resolution.
2. Identify the exact user operation: for example, fill predetermined missing dimensions.
3. Record source width, height, units, interaction points, and uncertainties.
4. Create `plan-spec.json` with source-document coordinates, not screen coordinates.
5. Copy the source into `assets/` without modifying it unless modification is requested.
6. Generate the application from the specification.
7. Visually compare every marker with the source.
8. Test save, reload, import, export, pan, zoom, and mobile input.
9. Deliver the working application, not only a proposal or mockup.

## Minimal specification

```json
{
  "schemaVersion": 1,
  "id": "project-id",
  "source": {
    "kind": "image",
    "assetPath": "assets/plan.jpg",
    "width": 1536,
    "height": 1096,
    "fingerprint": "source-specific-id"
  },
  "units": "mm",
  "fields": [
    {
      "id": "D01",
      "kind": "dimension",
      "x": 350,
      "y": 260,
      "orientation": "horizontal",
      "label": "Upper opening",
      "unit": "mm",
      "required": true,
      "sourceConfidence": "probable"
    }
  ],
  "assumptions": []
}
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

## Source interpretation rules

- Treat OCR and computer-vision output as provisional until visually checked.
- Mark estimated positions as `probable` or `manual`; never present them as confirmed.
- Ask only questions that block a working first version.
- Do not infer missing dimensions from pixel distances unless scale is reliably calibrated.
- Do not publish a user's plan in a public repository without explicit permission. Use a synthetic example asset when demonstrating the skill publicly.

## Acceptance checks

Before delivery verify that:

- every field maps to an intended source location;
- field IDs are unique;
- all coordinates lie inside the source document;
- markers remain aligned after pan, zoom, resize, and orientation change;
- entered values survive reload;
- incompatible project JSON is rejected or warned about;
- export includes the complete plan and all completed values;
- the app runs from a static server without a build step.

## Reference implementation

Use `examples/apartment-dimensions/` as the smallest reference. Adapt it to the supplied source instead of copying its coordinates or field count.