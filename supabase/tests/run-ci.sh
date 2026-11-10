#!/usr/bin/env bash
set -euo pipefail
if [ -z "$DATABASE_URL" ]; then echo "No disposable DATABASE_URL"; exit 1; fi
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f supabase/tests/mock-auth.sql >/dev/null
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f supabase/migrations/20261110120000_eaglescore_foundation.sql >/dev/null
count=$(psql "$DATABASE_URL" -Atc "select count(*) from pg_tables where schemaname='public' and not rowsecurity")
if [ "$count" != "0" ]; then echo "FAIL: public table without RLS"; exit 1; fi
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -c "set role anon; select id,published from public.landing_content" >/dev/null
if psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -c "set role anon; select draft from public.landing_content" >/dev/null 2>&1; then echo "FAIL: CMS draft leak"; exit 1; fi
if psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -c "set role authenticated; insert into public.user_roles(user_id,role) values(gen_random_uuid(),'super_admin')" >/dev/null 2>&1; then echo "FAIL: role escalation"; exit 1; fi
if psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -c "set role authenticated; update public.scores set status='approved'" >/dev/null 2>&1; then echo "FAIL: client publication"; exit 1; fi
if psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -c "set role authenticated; select object_key from public.score_files" >/dev/null 2>&1; then echo "FAIL: private object keys exposed"; exit 1; fi
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL' >/dev/null
insert into auth.users(id,email,email_confirmed_at) values
('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','a@example.org',now()),
('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','b@example.org',now());
update public.profiles set status='active';
insert into public.user_roles(user_id,role) values
('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','member'),
('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','member');
insert into public.works(id,title,created_by) values
('11111111-1111-4111-8111-111111111111','Private B work','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb');
insert into public.arrangements(id,work_id,owner_id) values
('22222222-2222-4222-8222-222222222222','11111111-1111-4111-8111-111111111111','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb');
insert into public.scores(id,arrangement_id,owner_id,status) values
('33333333-3333-4333-8333-333333333333','22222222-2222-4222-8222-222222222222','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','draft');
SQL
private_count=$(psql "$DATABASE_URL" -Atc "begin; set local role authenticated; select set_config('request.jwt.claim.sub','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',true); select count(*) from public.scores where id='33333333-3333-4333-8333-333333333333'; rollback;" | grep -E '^[0-9]+$' | tail -1)
if [ "$private_count" != "0" ]; then echo "FAIL: cross-member draft access"; exit 1; fi
echo "PASS: migration, RLS, CMS privacy, role privileges, cross-member isolation"
