-- EagleScore post-install verification — read-only. Execute AFTER foundation SQL.
-- Expected: 18 public tables; all RLS enabled; member role records exist.
select count(*) as eaglescore_tables from pg_tables where schemaname='public' and tablename in
 ('profiles','roles','user_roles','invitations','works','arrangements','scores',
 'score_versions','score_parts','score_files','submissions','reviews','copyright_records',
 'collections','collection_items','favorites','audit_logs','landing_content');
select tablename,rowsecurity as rls_enabled from pg_tables
 where schemaname='public' and tablename in
 ('profiles','roles','user_roles','invitations','works','arrangements','scores',
 'score_versions','score_parts','score_files','submissions','reviews','copyright_records',
 'collections','collection_items','favorites','audit_logs','landing_content')
 order by tablename;
select name,description from public.roles order by name;
select has_table_privilege('anon','public.profiles','select') as anon_profiles_grant,
       has_table_privilege('anon','public.score_files','select') as anon_files_grant,
       has_column_privilege('anon','public.landing_content','published','select') as anon_published_grant,
       has_column_privilege('anon','public.landing_content','draft','select') as anon_draft_grant,
       has_table_privilege('authenticated','public.user_roles','insert') as members_can_assign_roles,
       has_table_privilege('authenticated','public.scores','update') as members_can_publish_scores;
-- Expected booleans: false, false, true, false, false, false.
-- IMPORTANT: grants alone do not test RLS; also run the isolated CI suite.
select tgname,tgenabled from pg_trigger
 where tgrelid='auth.users'::regclass and tgname like 'eaglescore_%' order by tgname;
select id,version,published,draft from public.landing_content where id='main';
-- Check the Supabase Database Security Advisor after running these statements.
