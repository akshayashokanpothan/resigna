# ADR-0001 — Platform First

**Status:** Accepted  
**Date:** 2026-08  
**Deciders:** Founding Engineering Team

---

## Context

Resigna began with a Figma plugin concept. There was risk of building business logic inside the plugin and treating the web app as secondary.

## Decision

The web application is the product. All business logic lives on the platform (web app + API). External surfaces — Figma plugin, integrations, CLI — are consumers of the platform API.

## Consequences

- The web app is the source of truth for all business rules.
- The Figma plugin is a thin renderer (see ADR-0002).
- Scaling the platform scales all surfaces simultaneously.
- API-first architecture enables future mobile apps, public API, and third-party integrations.

## Alternatives Considered

- **Plugin-first**: Rejected. Business logic in Figma plugin is untestable and non-portable.
- **Dual ownership**: Rejected. Leads to logic duplication and inconsistency.
