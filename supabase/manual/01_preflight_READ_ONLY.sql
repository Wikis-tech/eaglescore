-- EagleScore manual SQL editor - PRE-FLIGHT (read only)
-- Run in your intended EagleScore project BEFORE the foundation migration.
-- The project ref must be checked in the Supabase dashboard URL by the operator.
select current_database() as database_name,
       current_user as database_role,
       current_setting('server_version') as postgres_version,
       now() as checked_at;
select to_regclass('auth.users') as supabase_auth_users,
       to_regclass('public.profiles') as eaglescore_profiles,
       to_regclass('public.scores') as eaglescore_scores,
       to_regclass('public.landing_content') as eaglescore_cms;
-- Any non-null EagleScore table means the foundation might already exist.
-- Stop and review rather than rerunning a CREATE TABLE migration.
