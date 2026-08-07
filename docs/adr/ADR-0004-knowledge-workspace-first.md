# ADR-0004 — Knowledge Workspace First

**Status:** Accepted  
**Date:** 2026-08  
**Deciders:** Founding Engineering Team

---

## Context

Resigna generates multiple deliverable types (Affinity Map, Persona, Journey Map, HMW). The question is whether to optimize around deliverable types or around the research data itself.

## Decision

The **Knowledge Workspace** is the central surface. It is designed and built before deliverable types are finalized.

The Knowledge Workspace is where:

- Research data is uploaded, organized, and reviewed
- Insights are tagged and clustered
- The AI processes data into deliverables
- Users review, edit, and export results

Deliverables are outputs of the Knowledge Workspace — not the primary surface.

## Consequences

- The product has a single, coherent core surface rather than multiple disconnected deliverable views.
- Adding a new deliverable type (e.g., Empathy Map) requires no structural changes.
- The Knowledge Workspace is where users spend most of their time — design investment here has maximum return.
- Navigation architecture (`modules/knowledge`) is reserved and prioritized.

## Alternatives Considered

- **Deliverable-first**: Rejected. Creates a fragmented product with no coherent information architecture.
- **Per-project canvas**: Rejected. Too open-ended for Sprint 0; Knowledge Workspace provides the right constraints.
