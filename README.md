# PlanForge

PlanForge is a small, model-readable skill for generating a working annotation app from one supplied engineering plan.

It is intentionally not a CAD platform. A coding model inspects the actual PNG, JPG, SVG, or PDF page, identifies fixed input points, writes a plan specification, adapts the included dependency-free example, verifies marker alignment, and returns a ready-to-run ZIP.

## Use with a coding model

Give the model this repository URL together with the plan and a direct request such as:

```text
Use the PlanForge skill from this repository.
Build a minimal working app for the attached plan so I can enter the missing dimensions marked on it.
Return a ready-to-run ZIP.
```

The canonical instructions are in:

```text
skills/plan-app-builder/SKILL.md
```

The smallest working reference is in:

```text
examples/apartment-dimensions/
```

## Required output

```text
output/
├── index.html
├── styles.css
├── app.js
├── plan-spec.json
├── assets/
│   └── plan.<ext>
└── README.md
```

The generated app must:

- use the supplied plan rather than a generic demo;
- run without npm or a build step;
- support fixed input markers, pan and zoom;
- save values locally;
- import and export editable project JSON;
- export the complete annotated plan as SVG or through browser print/PDF;
- store coordinates in source-document space;
- expose uncertain marker positions instead of presenting guesses as confirmed.

## Run the reference example

```bash
python3 -m http.server 8080
```

Open:

```text
http://localhost:8080/examples/apartment-dimensions/
```

## Repository layout

```text
PlanForge/
├── skills/plan-app-builder/SKILL.md
├── examples/apartment-dimensions/
├── template/
├── SKILL.md
└── README.md
```

`SKILL.md` at the repository root is a short entry point. The file under `skills/plan-app-builder/` is the canonical version.

## License

MIT
