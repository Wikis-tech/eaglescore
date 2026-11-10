-- EagleScore schema proposal. Review, run against a disposable test DB, then deploy to the correct EagleScore project.
-- Requires Supabase auth schema. No grants for client-side role mutation, review, publication or files.
create extension if not exists pgcrypto;
create schema if not exists app_private;
revoke all on schema app_private from public;
grant usage on schema app_private to authenticated;
create type public.member_status as enum ('pending','active','suspended');
create type public.score_state as enum ('draft','pending','returned','approved','archived');
create type public.member_role as enum ('member','music_director','super_admin');
create table public.profiles(id uuid primary key references auth.users(id) on delete cascade,
 email text not null,display_name text not null default '',status public.member_status not null default 'pending',
 created_at timestamptz not null default now(),updated_at timestamptz not null default now());
create table public.roles(name public.member_role primary key,description text not null);
insert into public.roles values ('member','Orchestra member'),('music_director','Musical reviewer'),('super_admin','Final approver and administrator');
create table public.user_roles(user_id uuid references public.profiles(id) on delete cascade,role public.member_role references public.roles(name),assigned_at timestamptz not null default now(),primary key(user_id,role));
create table public.invitations(id uuid primary key default gen_random_uuid(),email text not null,invited_by uuid references auth.users(id),expires_at timestamptz not null default now()+interval '14 days',accepted_at timestamptz,created_at timestamptz not null default now());
create unique index invitations_email_pending on public.invitations(lower(email)) where accepted_at is null;
create table public.works(id uuid primary key default gen_random_uuid(),title text not null check(length(title) between 1 and 240),hymn_number text,composer text,category text not null default 'Hymns',created_by uuid not null references public.profiles(id),created_at timestamptz not null default now());
create table public.arrangements(id uuid primary key default gen_random_uuid(),work_id uuid not null references public.works(id),title text,arranger text,concert_key text,time_signature text,owner_id uuid not null references public.profiles(id),created_at timestamptz not null default now());
create table public.scores(id uuid primary key default gen_random_uuid(),arrangement_id uuid not null references public.arrangements(id),owner_id uuid not null references public.profiles(id),status public.score_state not null default 'draft',published_version_id uuid,current_version_id uuid,created_at timestamptz not null default now(),updated_at timestamptz not null default now());
create table public.score_versions(id uuid primary key default gen_random_uuid(),score_id uuid not null references public.scores(id) on delete cascade,version_no integer not null check(version_no>0),status public.score_state not null default 'draft',title text not null,content jsonb,change_summary text,created_by uuid not null references public.profiles(id),created_at timestamptz not null default now(),unique(score_id,version_no),unique(id,score_id));
alter table public.scores add constraint published_version_belongs_to_score foreign key(published_version_id,id) references public.score_versions(id,score_id);
alter table public.scores add constraint current_version_belongs_to_score foreign key(current_version_id,id) references public.score_versions(id,score_id);
create table public.score_parts(id uuid primary key default gen_random_uuid(),version_id uuid not null references public.score_versions(id) on delete cascade,instrument text not null,written_key text,concert_key text,part_label text);
create table public.score_files(id uuid primary key default gen_random_uuid(),version_id uuid not null references public.score_versions(id) on delete cascade,part_id uuid references public.score_parts(id),object_key text not null unique,file_name text not null,mime_type text not null,bytes bigint not null check(bytes>0),sha256 text,uploaded_by uuid not null references public.profiles(id),created_at timestamptz not null default now());
create table public.submissions(id uuid primary key default gen_random_uuid(),version_id uuid not null unique references public.score_versions(id),submitted_by uuid not null references public.profiles(id),status public.score_state not null default 'pending' check(status in ('pending','returned','approved')),submitted_at timestamptz not null default now(),reviewed_at timestamptz);
create table public.reviews(id uuid primary key default gen_random_uuid(),submission_id uuid not null references public.submissions(id),reviewer_id uuid not null references public.profiles(id),review_type text not null check(review_type in ('technical','musical','copyright')),decision text not null check(decision in ('approved','returned','rejected')),comment text,created_at timestamptz not null default now());
create table public.copyright_records(id uuid primary key default gen_random_uuid(),version_id uuid not null unique references public.score_versions(id),rights_holder text not null,rights_basis text not null check(rights_basis in ('owned','licensed','permission','public_domain','unverified')),evidence_object_key text,can_view boolean not null default false,can_download boolean not null default false,can_print boolean not null default false,cleared_by uuid references public.profiles(id),cleared_at timestamptz);
create table public.collections(id uuid primary key default gen_random_uuid(),owner_id uuid not null references public.profiles(id),name text not null check(length(name) between 1 and 120),created_at timestamptz not null default now());
create table public.collection_items(collection_id uuid not null references public.collections(id) on delete cascade,score_id uuid not null references public.scores(id),primary key(collection_id,score_id));
create table public.favorites(user_id uuid not null references public.profiles(id),score_id uuid not null references public.scores(id),primary key(user_id,score_id));
create table public.audit_logs(id bigint generated always as identity primary key,actor_id uuid references auth.users(id),action text not null,target_id uuid,details jsonb not null default '{}',created_at timestamptz not null default now());
create table public.landing_content(id text primary key check(id='main'),published jsonb not null default '{}',draft jsonb,version integer not null default 0,updated_by uuid references auth.users(id),updated_at timestamptz not null default now());
insert into public.landing_content(id) values ('main');
create index scores_status_idx on public.scores(status);
create index score_versions_by_score_idx on public.score_versions(score_id,version_no);
create index submissions_status_idx on public.submissions(status);
create index audit_created_idx on public.audit_logs(created_at desc);

create function app_private.active_member() returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.profiles p join auth.users u on u.id=p.id where p.id=(select auth.uid()) and p.status='active' and u.email_confirmed_at is not null);
$$;
create function app_private.is_admin() returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.user_roles r join public.profiles p on p.id=r.user_id join auth.users u on u.id=p.id where r.user_id=(select auth.uid()) and r.role='super_admin' and p.status='active' and u.email_confirmed_at is not null);
$$;
create function app_private.is_director() returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.user_roles r join public.profiles p on p.id=r.user_id where r.user_id=(select auth.uid()) and r.role='music_director' and p.status='active');
$$;
create function app_private.read_score(sid uuid) returns boolean language sql stable security definer set search_path='' as $$
 select app_private.active_member() and exists(select 1 from public.scores s where s.id=sid and
 (s.owner_id=(select auth.uid()) or app_private.is_admin() or (s.status='approved' and s.published_version_id is not null)));
$$;
revoke all on all functions in schema app_private from public,anon;
grant execute on function app_private.active_member(),app_private.is_admin(),app_private.is_director(),app_private.read_score(uuid) to authenticated;

create function app_private.new_member_profile() returns trigger language plpgsql security definer set search_path='' as $$
begin
 insert into public.profiles(id,email,display_name)
 values(new.id,coalesce(new.email,''),left(coalesce(new.raw_user_meta_data->>'full_name',''),140))
 on conflict(id) do nothing;
 return new;
end;$$;
create trigger eaglescore_new_auth_user after insert on auth.users for each row execute function app_private.new_member_profile();
create function app_private.confirm_invitation() returns trigger language plpgsql security definer set search_path='' as $$
declare invitation_id uuid;
begin
 if new.email_confirmed_at is not null and old.email_confirmed_at is null then
   select id into invitation_id from public.invitations where lower(email)=lower(new.email)
   and accepted_at is null and expires_at>now() order by created_at desc limit 1 for update;
   if invitation_id is not null then
     update public.invitations set accepted_at=now() where id=invitation_id;
     update public.profiles set status='active',email=new.email,updated_at=now() where id=new.id;
     insert into public.user_roles(user_id,role) values(new.id,'member') on conflict do nothing;
   end if;
 end if;
 return new;
end;$$;
create trigger eaglescore_confirm_auth_user after update of email_confirmed_at on auth.users for each row execute function app_private.confirm_invitation();

-- Explicit RLS: all public tables are enabled; no client write path for privileged workflows.
alter table public.profiles enable row level security;
alter table public.roles enable row level security;
alter table public.user_roles enable row level security;
alter table public.invitations enable row level security;
alter table public.works enable row level security;
alter table public.arrangements enable row level security;
alter table public.scores enable row level security;
alter table public.score_versions enable row level security;
alter table public.score_parts enable row level security;
alter table public.score_files enable row level security;
alter table public.submissions enable row level security;
alter table public.reviews enable row level security;
alter table public.copyright_records enable row level security;
alter table public.collections enable row level security;
alter table public.collection_items enable row level security;
alter table public.favorites enable row level security;
alter table public.audit_logs enable row level security;
alter table public.landing_content enable row level security;
create policy profiles_select on public.profiles for select to authenticated using(id=(select auth.uid()) or (select app_private.is_admin()));
create policy roles_select on public.roles for select to authenticated using((select app_private.active_member()));
create policy member_roles_select on public.user_roles for select to authenticated using(user_id=(select auth.uid()) or (select app_private.is_admin()));
create policy invitations_admin_select on public.invitations for select to authenticated using((select app_private.is_admin()));
create policy works_select on public.works for select to authenticated using((select app_private.active_member()) and (created_by=(select auth.uid()) or (select app_private.is_admin()) or exists(select 1 from public.arrangements a join public.scores s on s.arrangement_id=a.id where a.work_id=works.id and s.status='approved' and s.published_version_id is not null)));
create policy works_insert on public.works for insert to authenticated with check((select app_private.active_member()) and created_by=(select auth.uid()));
create policy arrangements_select on public.arrangements for select to authenticated using((select app_private.active_member()) and (owner_id=(select auth.uid()) or (select app_private.is_admin()) or exists(select 1 from public.scores s where s.arrangement_id=arrangements.id and s.status='approved' and s.published_version_id is not null)));
create policy arrangements_insert on public.arrangements for insert to authenticated with check((select app_private.active_member()) and owner_id=(select auth.uid()) and exists(select 1 from public.works w where w.id=work_id and w.created_by=(select auth.uid())));
create policy scores_select on public.scores for select to authenticated using((select app_private.read_score(id)));
create policy scores_insert on public.scores for insert to authenticated with check((select app_private.active_member()) and owner_id=(select auth.uid()) and status='draft' and published_version_id is null and exists(select 1 from public.arrangements a where a.id=arrangement_id and a.owner_id=(select auth.uid())));
create policy versions_select on public.score_versions for select to authenticated using((select app_private.read_score(score_id)) and (created_by=(select auth.uid()) or (select app_private.is_admin()) or (status='approved' and exists(select 1 from public.scores s where s.id=score_id and s.published_version_id=score_versions.id))));
create policy versions_insert on public.score_versions for insert to authenticated with check(status='draft' and created_by=(select auth.uid()) and (select app_private.active_member()) and exists(select 1 from public.scores s where s.id=score_id and s.owner_id=(select auth.uid())));
create policy versions_update_own_draft on public.score_versions for update to authenticated using(status='draft' and created_by=(select auth.uid())) with check(status='draft' and created_by=(select auth.uid()));
create policy parts_select on public.score_parts for select to authenticated using(exists(select 1 from public.score_versions v where v.id=version_id));
create policy submissions_select on public.submissions for select to authenticated using(submitted_by=(select auth.uid()) or (select app_private.is_admin()) or (select app_private.is_director()));
create policy reviews_select on public.reviews for select to authenticated using((select app_private.is_admin()) or (select app_private.is_director()) or exists(select 1 from public.submissions s where s.id=submission_id and s.submitted_by=(select auth.uid())));
create policy copyright_select on public.copyright_records for select to authenticated using((select app_private.is_admin()) or exists(select 1 from public.score_versions v where v.id=version_id and v.created_by=(select auth.uid())));
create policy collections_select on public.collections for select to authenticated using(owner_id=(select auth.uid()) and (select app_private.active_member()));
create policy collections_insert on public.collections for insert to authenticated with check(owner_id=(select auth.uid()) and (select app_private.active_member()));
create policy collections_update on public.collections for update to authenticated using(owner_id=(select auth.uid()) and (select app_private.active_member())) with check(owner_id=(select auth.uid()) and (select app_private.active_member()));
create policy collections_delete on public.collections for delete to authenticated using(owner_id=(select auth.uid()));
create policy items_select on public.collection_items for select to authenticated using(exists(select 1 from public.collections c where c.id=collection_id and c.owner_id=(select auth.uid())));
create policy items_insert on public.collection_items for insert to authenticated with check(exists(select 1 from public.collections c where c.id=collection_id and c.owner_id=(select auth.uid())) and (select app_private.read_score(score_id)));
create policy items_delete on public.collection_items for delete to authenticated using(exists(select 1 from public.collections c where c.id=collection_id and c.owner_id=(select auth.uid())));
create policy favorites_select on public.favorites for select to authenticated using(user_id=(select auth.uid()));
create policy favorites_insert on public.favorites for insert to authenticated with check(user_id=(select auth.uid()) and (select app_private.read_score(score_id)));
create policy favorites_delete on public.favorites for delete to authenticated using(user_id=(select auth.uid()));
create policy audit_admin_select on public.audit_logs for select to authenticated using((select app_private.is_admin()));
create policy landing_public_select on public.landing_content for select to anon,authenticated using(id='main');

revoke all on all tables in schema public from anon,authenticated;
grant select(id,published,version) on public.landing_content to anon,authenticated;
grant select on public.profiles,public.roles,public.user_roles,public.invitations,public.works,public.arrangements,public.scores,public.score_versions,public.score_parts,public.submissions,public.reviews,public.copyright_records,public.collections,public.collection_items,public.favorites,public.audit_logs to authenticated;
grant insert on public.works,public.arrangements,public.scores,public.score_versions,public.collections,public.collection_items,public.favorites to authenticated;
grant update(name) on public.collections to authenticated;
grant update(title,content,change_summary) on public.score_versions to authenticated;
grant delete on public.collections,public.collection_items,public.favorites to authenticated;
-- score_files and privileged role/submission/review/publication rows intentionally unavailable for direct client mutation.

-- Explicit service-role privileges are needed even when RLS is bypassed.
grant usage on schema public to anon,authenticated,service_role;
grant all on all tables in schema public to service_role;
grant all on all sequences in schema public to service_role;
