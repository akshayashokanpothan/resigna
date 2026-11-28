# modules/research

**Status:** Phase 2 (Research foundation), built 28 Nov 2026.

Owns layer 1 of the Knowledge Model, Collect: studies, participants with consent, and research sources (`supabase/migrations/0007`, functions in `0011`).

## What it does

- **Studies** inside a project: title, goal, research questions, methods, status and timeline.
- **Sources** inside a study: paste text, or upload `.txt .md .vtt .srt .csv` (text read in the browser, status `ready`) or `.pdf .docx` (stored in the private `research-sources` bucket, status `pending` until text extraction lands in Phase 3). Source text is never edited; only its details are.
- **Participants**: pseudonymous labels (P01…), attributes, consent (`pending`, `granted`, `limited`, `withdrawn`). "Delete with all data" calls `purge_participant()`, which removes their sources, evidence and the participant in one transaction and returns the file paths to remove from storage.
- **Search** (`/research`): projects, studies (title, goal) and sources (title, file name, full text through `search_research_sources()`, with a snippet).

## Public API

See `index.ts`: types, `researchService()`, query hooks, and the page components `ProjectResearch`, `StudyDetail`, `SourceDetail`, `ResearchSearch`.

## Notes

- Every call goes through RLS (`is_project_member`); both SQL functions are `security invoker`.
- Withdrawn consent keeps rows (decision of 28 Nov 2026) but is flagged on every source of that participant; analysis features must exclude them.
- Feeds `modules/knowledge` (evidence, Phase 3), never `modules/ai` directly.
