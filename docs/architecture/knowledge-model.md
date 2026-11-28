# Knowledge Model schema

**Status:** Accepted for preview (28 Nov 2026) · **Migrations:** `supabase/migrations/0006`–`0010` (on top of `0005_security_rls_fixes`) · **Related:** ADR-0003, ADR-0004

The Knowledge Model is the single, normalized body of research for a project. `modules/research` writes into it, people review and organize it in the Knowledge Workspace, and `modules/ai` reads only from it to generate deliverables. This document explains the tables and the choices behind them.

Items marked **[GUESS]** are assumptions made without a decision from the product owner. Each one is cheap to change before the first real data lands.

## Overview

```
projects
 ├─ participants                       people who took part (pseudonymous)
 ├─ research_sessions ── participant   one interview / survey batch / observation / document
 │   └─ research_sources               uploaded file (Storage) or pasted text, plus extracted text
 │       └─ source_quotes              verbatim excerpt + position  (EVIDENCE, immutable)
 ├─ knowledge_items                    atomic typed statement (MODEL, editable, reviewable)
 │   ├─ knowledge_item_evidence ──► source_quotes   (many-to-many)
 │   ├─ knowledge_item_tags     ──► tags
 │   └─ cluster_items           ──► clusters        (affinity groups)
 └─ deliverables                       affinity_map | persona | journey_map | hmw
     └─ deliverable_versions           immutable JSON content per generation/edit
         └─ deliverable_evidence ──► knowledge_items / source_quotes  (per claim)
```

## Core idea: evidence vs. interpretation

The main design choice is splitting **what someone said** from **what we concluded**:

- **`source_quotes`** are evidence. Exact text from a source, with its position (character offsets into the source's extracted text, plus optional media timestamps and page number). They cannot be edited, only deleted. While any quote points into a source, that source's `content_text` is locked, so offsets stay valid.
- **`knowledge_items`** are interpretation. A short typed statement (`observation`, `pain_point`, `need`, `goal`, `behaviour`, `motivation`, `quote`, `insight`) that people can edit, accept or reject. An item cites one or more quotes through `knowledge_item_evidence`, and a quote can back many items. An `insight` spanning three participants simply cites three quotes.

This keeps "every insight traceable back to the evidence" true even after heavy editing, and is the answer to open decision #4 in the source-of-truth doc ("how evidence links are stored").

## Tables

| Table                         | Purpose                             | Notes                                                                                                                                                                                             |
| ----------------------------- | ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `participants`                | Person in the research, per project | `label` (e.g. "P3") unique per project; `attributes` jsonb for role, segment etc. that Personas group on.                                                                                         |
| `research_sessions`           | One research activity               | `session_type`: interview, survey, observation, usability_test, document, notes. Optional single `participant_id`. `status`: draft → processing → ready / failed.                                 |
| `research_sources`            | Raw input for a session             | `source_kind` file (Storage path required) or paste (text required). `content_text` is the extracted text quotes point into. Records `normalizer` + `normalizer_version` that produced its items. |
| `source_quotes`               | Verbatim evidence                   | `quote_text`, `start_offset`/`end_offset`, `start_ms`/`end_ms`, `page_number`, `speaker`, `participant_id`. Immutable.                                                                            |
| `knowledge_items`             | Atomic unit of the model            | `item_type`, `content` (≤2000 chars), `origin` (normalizer / ai / manual), `review_status` (unreviewed / accepted / rejected), full-text `search` column.                                         |
| `knowledge_item_evidence`     | item ↔ quote                        | Composite key; both sides must be in the same project.                                                                                                                                            |
| `tags`, `knowledge_item_tags` | Labels on items                     | Tag names unique per project, case-insensitive. `category`: theme, sentiment, pain_point, need, behaviour, goal, custom. AI-applied tags keep `origin = 'ai'` and a `confidence` 0–1.             |
| `clusters`, `cluster_items`   | Affinity groups                     | Ordered (`position`) clusters and ordered items within them.                                                                                                                                      |
| `deliverables`                | Stable handle for an output         | `deliverable_type`, `status`, `current_version_id` (must belong to the same deliverable).                                                                                                         |
| `deliverable_versions`        | Immutable content snapshot          | `version` 1, 2, 3…; `content` jsonb; `content_schema` int for the per-type JSON shape; `origin` ai / manual; `ai_run_id`. Append-only: editing a deliverable inserts a new version.               |
| `deliverable_evidence`        | Claim → evidence                    | `claim_path` is a JSON Pointer into the version content (`/pain_points/2`). Cites an item, a quote, or both.                                                                                      |

## Integrity and security

- **One RLS rule everywhere.** Every table carries `project_id` and uses the same policy, `is_project_member(project_id)`: the caller must be in `workspace_members` for the project's workspace. The helper is `security definer` so it doesn't recurse through the `projects` / `workspace_members` policies. This matches the existing `projects` rule (any workspace member, full access).
- **No cross-project links.** Join tables and children use composite foreign keys on `(id, project_id)`, so the database itself rejects, for example, tagging a project-A item with a project-B tag, even if application code gets it wrong.
- **Storage.** Private bucket `research-sources`; object paths must start with the project id (`<project_id>/<source_id>/<filename>`). Same membership rule, malformed paths are denied.
- **Conventions from `0005_security_rls_fixes`.** Every new function pins `search_path = ''` and schema-qualifies table names; `auth.uid()` is wrapped as `(select auth.uid())`; policies apply `to authenticated` only; every foreign key has an index whose leading columns match it.
- **Deletes.** Deleting a project cascades to everything. Deleting a session or source cascades to its sources and quotes; knowledge items survive with `session_id` set to null. Deleting an item or quote that a deliverable cites sets that citation to null rather than rewriting the deliverable's history; a `deliverable_evidence` row with both sides null means "evidence removed" and the UI should flag that claim.

## Mapping to the pipeline

1. **Sprint 1–2 (`modules/research`):** create session and source → extract text into `content_text` → normalizer writes `source_quotes` and draft `knowledge_items` (`origin = 'normalizer'`) with evidence links → source `status = 'ready'`.
2. **Sprint 3 (`modules/knowledge`):** review items (`review_status`), edit, tag, cluster.
3. **Sprint 4 (`modules/ai`):** read items (accepted, or not rejected) with their quotes, tags and clusters → write a `deliverable_versions` row plus `deliverable_evidence` for every claim.

Adding a new source type (e.g. Loom) needs only a new normalizer value. Adding a deliverable type (e.g. Empathy Map) needs one line in the `deliverable_type` check constraint and a new content JSON shape; no new tables.

## Assumptions to confirm

1. **[DECIDED 28 Nov 2026: yes] Participants are a table, not free text.** Needed for Personas to group across sessions. A session links to at most one participant; group interviews and survey batches leave it empty and attach participants per quote/item instead.
2. **[GUESS] Quote position = character offsets into extracted text**, with timestamps/page as optional extras. This means a source's text is frozen once quoted. Re-processing a source means deleting its quotes first.
3. **[GUESS] Item types** (`observation, pain_point, need, goal, behaviour, motivation, quote, insight`). Pain point / need / behaviour also exist as **tag categories**, which is deliberate overlap: the type is what the item _is_, tags are how people slice them. Could drop one if it confuses users.
4. **[DECIDED 28 Nov 2026: yes] An item can be in several clusters.** Classic affinity mapping puts each note in exactly one group. If you want that rule, it's one unique index on `cluster_items (item_id)` (scoped per affinity map if there will be several).
5. **[GUESS] Clusters are project-wide, not per affinity map.** Simpler now; if you expect several competing affinity maps per project, clusters should hang off a deliverable instead.
6. **[GUESS] Any workspace member can do everything**, including delete, matching `projects`. Role-based limits (e.g. members can't delete sessions) can come later.
7. **[GUESS] Deliverable content is jsonb with a per-type version number** (`content_schema`) validated by zod in `modules/ai`, rather than a table per deliverable type. Keeps ADR-0004's "new deliverable needs no structural change".
8. **[GUESS] `ai_run_id` has no foreign key yet.** `ai_runs` (provider, model, tokens, cost) belongs to Sprint 4 and depends on open decision #3; the FK gets added with that table.
9. **No embeddings yet.** Semantic clustering will likely want `pgvector` on `knowledge_items`; left out until the AI provider is chosen. Full-text search on item content is included.

## Not in scope

`ai_runs`, embeddings, comments/collaboration, audit log, per-role permissions, and the deliverable content JSON shapes themselves.
