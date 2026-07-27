# PlanForge

PlanForge is a model-readable execution contract for generating and verifying a small mobile-first annotation app from one supplied engineering plan.

It is intentionally not a CAD platform. A coding model must inspect the actual PNG, JPG, SVG, or PDF page, identify fixed input points, build the app, run tests, visually inspect mobile layouts, and return a ready-to-open package.

## Use with a coding model

Give the model this repository URL together with the plan and a direct request such as:

```text
Use the PlanForge skill from this repository.
Build a minimal mobile-first app for the attached plan so I can enter the missing dimensions marked on it.
Run the mandatory tests and include the validation report.
Return a ready-to-open ZIP.
```

Canonical instructions:

```text
skills/plan-app-builder/SKILL.md
```

Mandatory validation contract:

```text
VALIDATION.md
```

Smallest reference implementation:

```text
examples/apartment-dimensions/
```

## Required delivery

```text
output/
├── index.html
├── styles.css
├── app.js
├── plan-spec.js
├── assets/
│   └── plan.<ext>
├── tests/
├── VALIDATION-REPORT.md
└── README.md
```

The generated app must:

- use the supplied plan rather than a generic demo;
- prioritize phone and tablet use;
- avoid requiring a development server for the normal end-user workflow;
- support fixed input markers, pan, and pinch zoom;
- save values locally;
- import and export editable project data;
- export the complete annotated plan independently of the current viewport;
- store coordinates in source-document space;
- expose uncertain marker positions honestly;
- contain no overlapping controls or placeholder buttons;
- pass the mandatory automated and visual checks, or explicitly disclose unexecuted validation.

## Definition of done

A model must not call the app complete merely because the files exist or the page opens.

Completion requires evidence that:

- all visible controls work;
- the editor remains usable on narrow screens and with the software keyboard;
- controls do not overlap at the required phone and tablet viewports;
- values survive reload;
- invalid import is handled safely;
- export contains the full plan;
- coordinate transforms are stable;
- every marker was compared with the original source;
- the validation report is included.

See [`VALIDATION.md`](VALIDATION.md) for the full test matrix and reporting format.

## Repository layout

```text
PlanForge/
├── skills/plan-app-builder/SKILL.md
├── VALIDATION.md
├── examples/apartment-dimensions/
├── template/
├── SKILL.md
└── README.md
```

The root `SKILL.md` is a short entry point. The file under `skills/plan-app-builder/` is the canonical execution contract.

## Development-only reference launch

The included example may be served during development with any static server. This is a developer convenience, not the required mobile user workflow.

## License

MIT