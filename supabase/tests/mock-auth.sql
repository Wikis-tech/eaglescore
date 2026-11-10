-- Minimal isolated PostgreSQL fixture, never execute on a live Supabase project.
create role anon nologin;
create role authenticated nologin;
create role service_role nologin;
create schema auth;
create table auth.users(id uuid primary key,email text,email_confirmed_at timestamptz,raw_user_meta_data jsonb not null default '{}');
create function auth.uid() returns uuid language sql stable as $$
 select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid
$$;
grant usage on schema auth to authenticated;
grant execute on function auth.uid() to authenticated;

-- Supabase auth.jwt() fixture for disposable PostgreSQL RLS/MFA testing.
create function auth.jwt() returns jsonb language sql stable as $$
select coalesce(nullif(current_setting('request.jwt.claims',true),''),'{}')::jsonb
$$;
grant execute on function auth.jwt() to authenticated;
