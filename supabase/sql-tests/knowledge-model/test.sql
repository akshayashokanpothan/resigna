-- Knowledge Model v2 scenario test. Run after test/stub.sql and migrations 0001–0010.
\set ON_ERROR_STOP 1
insert into auth.users (id, email) values ('aaaaaaaa-0000-0000-0000-000000000001','a@example.com'),('bbbbbbbb-0000-0000-0000-000000000002','b@example.com');
select set_config('request.jwt.claim.sub','aaaaaaaa-0000-0000-0000-000000000001',false);
set role authenticated;
\set P1 '''11111111-0000-0000-0000-000000000001'''
\set P2 '''22222222-0000-0000-0000-000000000002'''
insert into projects (id, workspace_id, name) select :P1, w.id, 'Healthcare Patient Experience' from workspaces w where owner_id = auth.uid();
insert into projects (id, workspace_id, name) select :P2, w.id, 'Other' from workspaces w where owner_id = auth.uid();
insert into studies (id, project_id, title, goal, research_questions, methods, status) values ('51000000-0000-0000-0000-000000000001',:P1,'Appointment Experience','Understand booking','{"Where do patients get stuck?"}','{interview}','active');
insert into participants (id, project_id, label, consent_status, consent_recorded_at) values ('5a000000-0000-0000-0000-000000000004',:P1,'P04','granted',now());
insert into study_participants (study_id, participant_id, project_id) values ('51000000-0000-0000-0000-000000000001','5a000000-0000-0000-0000-000000000004',:P1);
insert into research_sources (id, project_id, study_id, participant_id, title, source_type, input_method, content_text) values ('50000000-0000-0000-0000-000000000004',:P1,'51000000-0000-0000-0000-000000000001','5a000000-0000-0000-0000-000000000004','Patient Interview #04','interview_transcript','paste','Interviewer: Tell me more. P04: I wasn''t sure whether my appointment was actually confirmed, so I called the hospital again.');
-- offsets 32..124 = the quote
insert into evidence (id, project_id, source_id, participant_id, content, start_offset, end_offset, speaker) values ('e0000000-0000-0000-0000-000000000001',:P1,'50000000-0000-0000-0000-000000000004','5a000000-0000-0000-0000-000000000004','I wasn''t sure whether my appointment was actually confirmed, so I called the hospital again.',32,124,'P04');
insert into evidence (id, project_id, source_id, evidence_type, content) values ('e0000000-0000-0000-0000-000000000002',:P1,'50000000-0000-0000-0000-000000000004','field_note','Patient checked phone repeatedly.');
insert into observations (id, project_id, study_id, kind, content) values ('0b000000-0000-0000-0000-000000000001',:P1,'51000000-0000-0000-0000-000000000001','pain_point','Patient unsure whether booking was confirmed');
insert into observations (id, project_id, kind, content, origin, validation_status, ai_rationale) values ('0b000000-0000-0000-0000-000000000002',:P1,'behaviour','Patient re-contacts the hospital to check','ai','suggested','Called the hospital again');
insert into evidence_links (project_id, evidence_id, observation_id) values (:P1,'e0000000-0000-0000-0000-000000000001','0b000000-0000-0000-0000-000000000001');
insert into themes (id, project_id, name) values ('7e000000-0000-0000-0000-000000000001',:P1,'Lack of confirmation and reassurance');
insert into theme_observations (theme_id, observation_id, project_id) values ('7e000000-0000-0000-0000-000000000001','0b000000-0000-0000-0000-000000000001',:P1),('7e000000-0000-0000-0000-000000000001','0b000000-0000-0000-0000-000000000002',:P1);
insert into insights (id, project_id, study_id, statement, confidence, confidence_basis) values ('15000000-0000-0000-0000-000000000001',:P1,'51000000-0000-0000-0000-000000000001','Patients experience uncertainty between booking and confirmation','high','7 of 12 interviews');
insert into insight_themes (insight_id, theme_id, project_id) values ('15000000-0000-0000-0000-000000000001','7e000000-0000-0000-0000-000000000001',:P1);
update insights set validation_status = 'accepted', reviewed_by = auth.uid(), reviewed_at = now() where id = '15000000-0000-0000-0000-000000000001';
insert into evidence_links (project_id, evidence_id, insight_id, stance, note) values (:P1,'e0000000-0000-0000-0000-000000000002','15000000-0000-0000-0000-000000000001','contradicts','Some patients just wait');
insert into insights (id, project_id, statement, validation_status, evidence_unavailable_reason) values ('15000000-0000-0000-0000-000000000003',:P1,'Stakeholder belief: cancellations are rare','accepted','From stakeholder interview, no participant evidence yet');
insert into opportunities (id, project_id, kind, title, priority) values ('0f000000-0000-0000-0000-000000000001',:P1,'how_might_we','How might we reassure patients right after booking?','now');
insert into opportunity_insights (opportunity_id, insight_id, project_id) values ('0f000000-0000-0000-0000-000000000001','15000000-0000-0000-0000-000000000001',:P1);
insert into decisions (id, project_id, title, status, decided_by, decided_at) values ('de000000-0000-0000-0000-000000000001',:P1,'Send instant booking confirmation by SMS','accepted',auth.uid(),now());
insert into decision_insights (decision_id, insight_id, project_id) values ('de000000-0000-0000-0000-000000000001','15000000-0000-0000-0000-000000000001',:P1);
insert into decision_opportunities (decision_id, opportunity_id, project_id) values ('de000000-0000-0000-0000-000000000001','0f000000-0000-0000-0000-000000000001',:P1);
insert into tags (id, project_id, name, category) values ('7a000000-0000-0000-0000-000000000001',:P1,'Booking','journey_stage');
insert into tag_assignments (project_id, tag_id, evidence_id) values (:P1,'7a000000-0000-0000-0000-000000000001','e0000000-0000-0000-0000-000000000001');
insert into tag_assignments (project_id, tag_id, insight_id) values (:P1,'7a000000-0000-0000-0000-000000000001','15000000-0000-0000-0000-000000000001');
insert into artifacts (id, project_id, artifact_type, title) values ('a0000000-0000-0000-0000-000000000001',:P1,'persona','Anxious booker');
insert into artifact_versions (id, project_id, artifact_id, version, content, origin) values ('a1000000-0000-0000-0000-000000000001',:P1,'a0000000-0000-0000-0000-000000000001',1,'{"pain_points":["unsure if confirmed"]}','ai');
insert into artifact_citations (project_id, version_id, claim_path, insight_id, evidence_id) values (:P1,'a1000000-0000-0000-0000-000000000001','/pain_points/0','15000000-0000-0000-0000-000000000001','e0000000-0000-0000-0000-000000000001');
update artifacts set current_version_id = 'a1000000-0000-0000-0000-000000000001' where id = 'a0000000-0000-0000-0000-000000000001';
insert into canvases (id, project_id, study_id, name, kind, external_tool, external_file_key) values ('ca000000-0000-0000-0000-000000000001',:P1,'51000000-0000-0000-0000-000000000001','Affinity map','affinity_map','figjam','FILEKEY');
insert into canvas_nodes (project_id, canvas_id, node_type, theme_id, x, y, external_node_id) values (:P1,'ca000000-0000-0000-0000-000000000001','theme','7e000000-0000-0000-0000-000000000001',0,0,'1:2');
insert into canvas_nodes (project_id, canvas_id, node_type, observation_id, x, y) values (:P1,'ca000000-0000-0000-0000-000000000001','observation','0b000000-0000-0000-0000-000000000001',20,40);
insert into canvas_nodes (project_id, canvas_id, node_type, note_text) values (:P1,'ca000000-0000-0000-0000-000000000001','note','Ask about cancellations next round');
insert into storage.objects (bucket_id, name) values ('research-sources','11111111-0000-0000-0000-000000000001/x/a.txt');
select 'search ok' where exists (select 1 from evidence where search @@ plainto_tsquery('english','appointment confirmed'))
  and exists (select 1 from insights where search @@ plainto_tsquery('english','uncertainty booking'));
select 'trace ok: decision → ' || i.statement || ' → ' || o.content || ' → ' || left(e.content, 30) || ' → ' || s.title || ' → ' || p.label || ' → ' || st.title as trace
from decision_insights di join insights i on i.id = di.insight_id
join insight_themes it on it.insight_id = i.id join theme_observations tobs on tobs.theme_id = it.theme_id
join observations o on o.id = tobs.observation_id join evidence_links l on l.observation_id = o.id
join evidence e on e.id = l.evidence_id join research_sources s on s.id = e.source_id
join participants p on p.id = e.participant_id join studies st on st.id = s.study_id;
select 'reverse ok: evidence touches ' || count(*) || ' rows' from evidence_links where evidence_id in ('e0000000-0000-0000-0000-000000000001','e0000000-0000-0000-0000-000000000002');

\set ON_ERROR_STOP 0
\echo ---- EXPECTED FAILURES BELOW (each line should be an ERROR) ----
\echo [1 fabricated quote: text does not match source at offsets]
insert into evidence (project_id, source_id, content, start_offset, end_offset) values (:P1,'50000000-0000-0000-0000-000000000004','I loved the booking flow',32,56);
\echo [2 evidence edit]
update evidence set content = 'edited' where id = 'e0000000-0000-0000-0000-000000000002';
\echo [3 source text edit while evidence exists]
update research_sources set content_text = 'changed' where id = '50000000-0000-0000-0000-000000000004';
\echo [4 accept insight with no evidence]
insert into insights (id, project_id, statement) values ('15000000-0000-0000-0000-000000000002',:P1,'Unsupported claim');
update insights set validation_status = 'accepted' where id = '15000000-0000-0000-0000-000000000002';
\echo [5 AI row without rationale]
insert into observations (project_id, content, origin, validation_status) values (:P1,'x','ai','suggested');
\echo [6 AI row accepted without review]
insert into themes (project_id, name, origin, validation_status, ai_rationale) values (:P1,'x','ai','accepted','because');
\echo [7 confidence without basis]
insert into insights (project_id, statement, confidence) values (:P1,'x','high');
\echo [8 evidence link to two targets]
insert into evidence_links (project_id, evidence_id, observation_id, theme_id) values (:P1,'e0000000-0000-0000-0000-000000000001','0b000000-0000-0000-0000-000000000002','7e000000-0000-0000-0000-000000000001');
\echo [9 cross-project link]
insert into themes (id, project_id, name) values ('7e000000-0000-0000-0000-0000000000ff',:P2,'Other theme');
insert into theme_observations (theme_id, observation_id, project_id) values ('7e000000-0000-0000-0000-0000000000ff','0b000000-0000-0000-0000-000000000001',:P1);
\echo [10 note card that also points at knowledge]
insert into canvas_nodes (project_id, canvas_id, node_type, note_text, theme_id) values (:P1,'ca000000-0000-0000-0000-000000000001','note','x','7e000000-0000-0000-0000-000000000001');
\echo [11 artifact version edit]
update artifact_versions set version = 2 where id = 'a1000000-0000-0000-0000-000000000001';
\echo [12 citation with no target]
insert into artifact_citations (project_id, version_id, claim_path) values (:P1,'a1000000-0000-0000-0000-000000000001','/x');
\echo [13 consent granted without a date]
insert into participants (project_id, label, consent_status) values (:P1,'P99','granted');
\echo [14 publish without a time]
update artifacts set status = 'published' where id = 'a0000000-0000-0000-0000-000000000001';
\echo [15 migration helper not callable by app users]
select km_index_foreign_keys('studies');

\echo ---- OTHER USER ----
select set_config('request.jwt.claim.sub','bbbbbbbb-0000-0000-0000-000000000002',false);
select 'B sees ' || (select count(*) from studies) || ' studies, ' || (select count(*) from evidence) || ' evidence, ' || (select count(*) from insights) || ' insights, ' || (select count(*) from decisions) || ' decisions, ' || (select count(*) from canvas_nodes) || ' cards, ' || (select count(*) from storage.objects) || ' files';
\echo [16 B writes into A project]
insert into observations (project_id, content) values (:P1,'intruder');
\echo [17 B uploads into A project]
insert into storage.objects (bucket_id, name) values ('research-sources','11111111-0000-0000-0000-000000000001/x/b.txt');

\echo ---- DELETE BEHAVIOUR (as A) ----
select set_config('request.jwt.claim.sub','aaaaaaaa-0000-0000-0000-000000000001',false);
delete from evidence where id = 'e0000000-0000-0000-0000-000000000001';
select 'after evidence delete: links=' || (select count(*) from evidence_links where evidence_id = 'e0000000-0000-0000-0000-000000000001') || ' citations kept=' || (select count(*) from artifact_citations) || ' citation evidence nulled=' || (select count(*) from artifact_citations where evidence_id is null);
delete from evidence where id = 'e0000000-0000-0000-0000-000000000002';
update research_sources set content_text = 'now editable' where id = '50000000-0000-0000-0000-000000000004';
select 'source text editable after evidence removed: ' || (content_text = 'now editable') from research_sources where id = '50000000-0000-0000-0000-000000000004';
delete from projects where id = :P1;
select 'after project delete: studies=' || (select count(*) from studies) || ' insights=' || (select count(*) from insights) || ' cards=' || (select count(*) from canvas_nodes);
