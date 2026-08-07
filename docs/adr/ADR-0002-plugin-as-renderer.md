# ADR-0002 — Plugin as Renderer

**Status:** Accepted  
**Date:** 2026-08  
**Deciders:** Founding Engineering Team

---

## Context

The Figma plugin is a desired future surface. The question is: does it own logic, or does it consume logic from the platform?

## Decision

The Figma plugin is a thin renderer. It:

- Authenticates via Resigna's OAuth
- Fetches deliverables from Resigna's API
- Renders data in the Figma canvas

It does NOT:

- Process research data
- Call AI providers
- Own any state beyond UI display state
- Contain business rules

## Consequences

- Plugin development is dramatically simpler (UI only).
- Adding a Notion or Confluence renderer follows the same pattern.
- Business logic tested once on the platform; all renderers benefit automatically.
- Plugin can be built by a different team without risk of logic divergence.

## Enforcement

- `modules/renderers/` is architecturally isolated.
- Renderers may not import from domain or infrastructure modules.
- Renderers interact only with documented API endpoints.
