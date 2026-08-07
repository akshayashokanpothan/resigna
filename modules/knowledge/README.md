# modules/knowledge

**Status:** Reserved — not yet implemented.

## Purpose

The Knowledge Workspace is the central surface of Resigna. All research flows in. All deliverables flow out.

## Planned Responsibilities

- Knowledge Model definition (normalized representation of research data)
- Knowledge graph construction from research sessions
- Tagging, clustering, and semantic organization
- Source of truth for all AI processing

## Architectural Notes

- Consumes normalized data from `modules/research`.
- `modules/ai` reads from the Knowledge Model to generate deliverables.
- See ADR-0004: Knowledge Workspace First.
