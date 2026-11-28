# Knowledge Model schema

**Status:** v2 draft for review (28 Nov 2026). Re-shaped to match the Product Vision & Build Source of Truth v1.0 (roadmap D14).
**Migrations:** `supabase/migrations/0006`–`0010`, on top of `0005_security_rls_fixes`. Merged to `dev` once as v1 (#10) but never applied to any live database, so they are rewritten in place.
**Related:** Product Vision sections 6–10 and 18, ADR-0003, ADR-0004, roadmap D12 and D14.

The Knowledge Model holds everything Resigna knows about a project's research, from the raw source to the decision it informed. It follows the vision's five layers, and every row can be traced both ways along this chain:

`Decision → Opportunity → Insight → Theme → Observation → Evidence → Source → Participant → Study → Project`

## What changed from v1

| v1                                               | v2                                                                                            | Why (vision section)                                           |
| ------------------------------------------------ | --------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| Project → session → source                       | Project → **study** → source. Sessions are gone; one interview is one source.                 | 7.3 Study holds goal, questions, methods, timeline.            |
| Participants with free-form attributes           | Participants with **consent status**, linked to studies through `study_participants`.         | 7.5, guardrail 8 (privacy and consent from the start).         |
| `source_quotes`                                  | **`evidence`**, still immutable, now checked to be a real excerpt of the source text.         | 7.6, guardrail 10 (AI must not fabricate quotations).          |
| One `knowledge_items` table typed by `item_type` | Separate **observations, themes, insights, opportunities, decisions** tables.                 | 6, 7.7–7.9, guardrail 12 (interface must tell these apart).    |
| Item → quote evidence (support only)             | **`evidence_links`** with a stance: supports, contradicts or context, to any layer.           | 8 (both directions), guardrail 11 (contradictions not hidden). |
| `origin` + `review_status`                       | Every AI-capable row has **origin, validation status, AI rationale, the AI's original text**. | 9, guardrails 2, 3, 9.                                         |
| Clusters                                         | Themes (clusters are themes).                                                                 | 7.8.                                                           |
| Deliverables                                     | **Artifacts**, same append-only versions and per-claim citations.                             | 7.10.                                                          |
| No canvas                                        | **`canvases` + `canvas_nodes`** for the FigJam-style workspace and two-way FigJam/Figma sync. | Roadmap D12.                                                   |

## Tables by layer

All tables carry `project_id`, use RLS through `is_project_member(project_id)`, and use composite `(id, project_id)` foreign keys so nothing can link across projects. Every foreign key is indexed.

### Layer 1: Collect (0007)

| Table                | Holds                                                                                                                                                                                                                                                                                                      |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `studies`            | A research activity in a project: `title`, `goal`, `research_questions[]`, `methods[]` (interview, survey, usability_test, observation, diary, desk_research, other), `status`, `starts_on`/`ends_on`.                                                                                                     |
| `participants`       | A person in the project's research. Pseudonymous `label` ("P04"), `attributes` jsonb, **`consent_status`** (pending, granted, limited, withdrawn), `consent_recorded_at`, `consent_notes`.                                                                                                                 |
| `study_participants` | Which participants took part in which studies (their participation history).                                                                                                                                                                                                                               |
| `research_sources`   | Original input under a study: `source_type` (interview_transcript, recording, document, notes, survey_response, feedback, support_ticket, spreadsheet, observation, other), optional `participant_id`, `conducted_at`, file or pasted text, extracted `content_text`, `is_sensitive`, processing `status`. |

### Layer 2: Organize (0008)

| Table                     | Holds                                                                                                                                                                                                                                                                                                                                            |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `evidence`                | A verbatim excerpt or data point from a source: `evidence_type` (quote, excerpt, response, data_point, field_note), `content`, character offsets, optional timestamps and page, `speaker`, `participant_id`. **Never edited**, only deleted. When offsets are given, the database checks that `content` is exactly that span of the source text. |
| `observations`            | Something noticed in the data, in the researcher's or AI's words. Optional `kind` (behaviour, pain_point, need, goal, motivation, expectation, other). Not an insight.                                                                                                                                                                           |
| `tags`, `tag_assignments` | Project tags with a category, assignable to evidence, observations, themes or insights.                                                                                                                                                                                                                                                          |

### Layer 3: Analyze, and Layer 4: Understand (0009)

| Table                | Holds                                                                                                                                                                          |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `themes`             | A recurring pattern across observations. `name`, `description`.                                                                                                                |
| `theme_observations` | Which observations a theme groups (an observation can sit in several themes, decided 28 Nov). Ordered by `position`.                                                           |
| `insights`           | An interpreted finding. Optional `study_id` (empty = cross-study). `confidence` (low, medium, high) only together with a written `confidence_basis`.                           |
| `insight_themes`     | Themes an insight is built on.                                                                                                                                                 |
| `evidence_links`     | Evidence → observation, theme, insight, opportunity or decision, with `stance`: **supports, contradicts, context**. One table so "everything this quote touches" is one query. |

### Layer 5: Act (0009)

| Table                                         | Holds                                                                                                                                        |
| --------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `opportunities`                               | `kind`: opportunity, how_might_we, recommendation, hypothesis, problem. Optional `priority` (now, next, later).                              |
| `opportunity_insights`                        | Insights an opportunity comes from.                                                                                                          |
| `decisions`                                   | A product or design decision: `status` (proposed, accepted, rejected, superseded), `rationale`, `decided_by`, `decided_at`, `superseded_by`. |
| `decision_insights`, `decision_opportunities` | What a decision rests on. Lets us answer "which decisions depend on this insight?".                                                          |

### Artifacts and canvas (0010)

| Table                | Holds                                                                                                                                                                                                                                                                 |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `artifacts`          | persona, journey_map, report, summary, opportunity_map, affinity_map, presentation. Points at its current version.                                                                                                                                                    |
| `artifact_versions`  | Append-only JSON content with a `content_schema` version. Never updated.                                                                                                                                                                                              |
| `artifact_citations` | Per claim (`claim_path`, a JSON Pointer): the insight, theme, observation or evidence it rests on. At least one target per row.                                                                                                                                       |
| `canvases`           | A canvas per project or study (`kind`: workspace, affinity_map), with optional link to a FigJam or Figma file.                                                                                                                                                        |
| `canvas_nodes`       | Position and size of one card on a canvas. A card shows one evidence, observation, theme, insight or opportunity, or is a free sticky `note`. Holds the Figma node id and a `sync_version` for two-way sync. Layout only: grouping is stored in `theme_observations`. |

## How AI and humans share the model

Every table AI can write to (`evidence`, `observations`, `themes`, `insights`, `opportunities`, `evidence_links`, `theme_observations`, `tag_assignments`) has:

- `origin`: human, ai or import. AI rows must carry `ai_rationale` (why it suggested this) and `ai_run_id`.
- `validation_status`: suggested, accepted, rejected. AI rows start as **suggested**; human rows start as accepted.
- `reviewed_by`, `reviewed_at`.
- On editable text tables, `ai_original_content`: when a person edits an AI suggestion, the AI's wording is kept, so the interface can show "edited from AI" and nothing changes silently.

Rules the database enforces:

1. **Original research is preserved.** Evidence can't be edited, and a source's text can't change once evidence points into it.
2. **No fabricated quotes.** Evidence with offsets must match the source text exactly.
3. **No unsupported insights.** An insight can't be marked accepted unless it has at least one accepted supporting evidence link, directly or through its themes' observations, or a written `evidence_unavailable_reason`.
4. **Contradictions stay visible.** Contradicting links are rows like any other; nothing removes them when an insight is accepted.
5. **No made-up scores.** Confidence is a level with a required written basis, not a number.

Evidence offsets count Unicode code points, as Postgres does. JavaScript string indexes count UTF-16 units, so the app converts before writing (they differ only for characters such as emoji).

## Conventions

- `0006` adds three migration-only helpers, not callable through the API: `km_enable_project_rls` (the one member-access policy), `km_add_updated_at_trigger`, and `km_index_foreign_keys` (an index for every foreign key, Supabase advisor 0001). 0007–0010 call them for every table.
- Join tables between layers (`insight_themes`, `opportunity_insights`, `decision_insights`, `decision_opportunities`) are plain links. Links that AI may suggest (`evidence_links`, `theme_observations`, `tag_assignments`) carry the review columns.
- A local Postgres test lives in `supabase/sql-tests/knowledge-model/`: run `stub.sql`, then migrations 0001–0010, then `test.sql` and `fkcheck.sql`.

## Feature check (vision section 21)

- **User problem:** research findings lose their link to the evidence, so teams can't trust or reuse them.
- **Where it fits:** the data foundation for all five layers.
- **Data it depends on:** workspaces and projects (0001–0005).
- **Traceability:** every layer links down to evidence, evidence to source, source to participant and study, in both directions.
- **AI participation:** AI writes suggested rows with a rationale and cited evidence.
- **Human control:** only people accept, edit or reject. Accepted insights need evidence. Edits keep the AI's original.

## Open questions

1. **Withdrawn consent.** Recommended: keep the rows but have the app and AI exclude evidence from participants whose consent is withdrawn, and offer a purge action. Alternative: delete their evidence automatically when consent is withdrawn.
2. **Who can delete.** For now any workspace member can do everything, matching `projects`. Role limits can come later.
3. **Cross-project links** (related themes across projects, vision section 10) are not in this schema. They need workspace-level tables and come with Phase 4.
4. **`ai_runs` table** (model, tokens, cost) comes with Sprint 4. `ai_run_id` has no foreign key until then.
5. **Embeddings** (`pgvector`) for similarity search wait until the AI provider is chosen. Full-text search is included on evidence, observations and insights.
