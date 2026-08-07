# ADR-0003 — Shared Research Knowledge Model

**Status:** Accepted  
**Date:** 2026-08  
**Deciders:** Founding Engineering Team

---

## Context

Research data enters Resigna in many forms: interview transcripts, survey responses, field observation notes, uploaded documents. AI deliverable generation needs a consistent input format.

## Decision

All research data — regardless of source — is normalized into a shared **Knowledge Model** before AI processing. The AI module consumes the Knowledge Model, never raw source data.

```
Raw Research Data (any format)
        ↓
modules/research  (ingestion + normalization)
        ↓
Knowledge Model (shared schema)
        ↓
modules/ai  (generates deliverables from Knowledge Model)
        ↓
Deliverables (Affinity Map, Persona, Journey Map, HMW)
```

## Consequences

- Adding a new research source (e.g., Loom recording) requires only a new normalizer, not changes to AI logic.
- AI prompt engineering is done against a stable schema.
- The Knowledge Model becomes a competitive moat — a structured representation of UX knowledge.

## Alternatives Considered

- **Direct AI call per source type**: Rejected. Prompt engineering chaos at scale; sources are not interchangeable.
- **Preprocessing in AI module**: Rejected. Violates layer separation; AI module should be purely generative.
