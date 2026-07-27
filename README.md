# PlanForge

PlanForge is a minimal skill and dependency-free template for turning a user-supplied engineering plan into a small working annotation app.

It is intentionally **not** a CAD platform or framework. A chat agent inspects one concrete plan, places predefined input points in source-image coordinates, copies the template, and delivers a working ZIP.

## Repository contents

```text
PlanForge/
├── SKILL.md
└── template/
    ├── index.html
    ├── styles.css
    ├── app.js
    └── plan-spec.js
```

## Generated app

The generated folder should also contain the source plan, for example:

```text
output/
├── index.html
├── styles.css
├── app.js
├── plan-spec.js
└── plan.jpg
```

## Run locally

```bash
cd output
python3 -m http.server 8080
```

Open `http://localhost:8080`.

## Included behavior

- fixed input markers over the supplied plan;
- pan, fit, and wheel zoom;
- dimension or note entry;
- local autosave;
- project JSON import/export;
- full-plan SVG export;
- browser printing;
- no build step and no external dependencies.

## Agent workflow

Read [`SKILL.md`](SKILL.md). The key rule is to build for the actual supplied plan, store field coordinates in source-document space, expose uncertainty, and visually verify every generated point before delivery.

## License

MIT