# modules/research

**Status:** Reserved — not yet implemented.

## Purpose

The research module will own all functionality related to research data ingestion, storage, and management.

## Planned Responsibilities

- Research session management (interview, survey, observation)
- Raw data ingestion (transcript upload, manual entry)
- Normalization into the shared Knowledge Model (see `modules/knowledge`)
- Research tagging and organization

## Public API (planned)

```ts
// To be defined in Sprint 2
export type { ResearchSession, ResearchNote };
export { useResearchSessions };
export { ResearchUploader };
```

## Architectural Notes

- This module feeds into `modules/knowledge` — never into `modules/ai` directly.
- AI providers consume the Knowledge Model, not raw research data.
- See ADR-0003 for the Shared Research Knowledge Model decision.
