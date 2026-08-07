# modules/renderers

**Status:** Reserved — not yet implemented.

## Purpose

The renderers module will own all external surface integrations that consume Resigna's platform API.

## Planned Surfaces

- **Figma Plugin** — thin renderer that displays deliverables in Figma canvas
- **Notion Integration** — exports deliverables to Notion pages
- **Confluence Integration** — exports to Confluence

## Architectural Rules (enforced by ADR-0002)

- Renderers are consumers of the platform API. They own ZERO business logic.
- The Figma plugin calls Resigna API endpoints — it does not process data itself.
- Adding a new renderer never requires changes to domain modules.
