# Apartment dimensions example

A minimal static application generated from the PlanForge skill.

The included plan is synthetic. It demonstrates the workflow without publishing a user's private drawing.

## Run

```bash
python3 -m http.server 8080
```

Open `http://localhost:8080/examples/apartment-dimensions/`.

## Included behavior

- fixed dimension markers from `plan-spec.json`;
- tap-to-enter values in millimetres;
- pan and wheel/pinch zoom;
- local autosave;
- project JSON export/import;
- full-plan SVG export.

When generating a real application, replace `assets/plan.svg` and rebuild the field coordinates from the actual supplied source.