---
name: planforge
summary: Build a small working annotation app for one supplied engineering plan and return a ready-to-run ZIP.
---

# PlanForge

Use the canonical skill instructions in:

```text
skills/plan-app-builder/SKILL.md
```

Build for the exact plan supplied by the user. Do not design a generic CAD editor, platform, monorepo, or reusable product unless explicitly requested.

The minimum successful result is a dependency-free HTML/CSS/JavaScript application that:

- renders the supplied plan without distortion;
- places predefined input markers in source-document coordinates;
- supports mobile-friendly value entry, pan, and zoom;
- saves values locally;
- imports and exports editable project JSON;
- exports the complete annotated plan;
- runs from a simple static HTTP server;
- is delivered as a working folder or ZIP.

Use `examples/apartment-dimensions/` as the reference implementation, but never copy its coordinates, field count, source dimensions, or labels into another plan.
