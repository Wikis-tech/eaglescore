#!/usr/bin/env bash
set -euo pipefail
if [ -z "$DATABASE_URL" ]; then echo "Disposable DATABASE_URL required"; exit 1; fi
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f supabase/migrations/20261110170000_public_signup_single_admin.sql >/dev/null
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL' >/dev/null
insert into auth.users(id,email,email_confirmed_at) values
('11111111-aaaa-4aaa-8aaa-111111111111','public.user@example.org',null);
do $$
begin
 if (select status from public.profiles where id='11111111-aaaa-4aaa-8aaa-111111111111')<>'pending' then
 raise exception 'Unconfirmed user was activated'; end if;
end$$;
update auth.users set email_confirmed_at=now() where id='11111111-aaaa-4aaa-8aaa-111111111111';
do $$
begin
 if not exists(select 1 from public.profiles p join public.user_roles r on p.id=r.user_id where p.id='11111111-aaaa-4aaa-8aaa-111111111111' and p.status='active' and r.role='member') then
 raise exception 'Confirmed user missing active member'; end if;
end$$;
insert into public.user_roles(user_id,role) values('11111111-aaaa-4aaa-8aaa-111111111111','super_admin');
select set_config('request.jwt.claim.sub','11111111-aaaa-4aaa-8aaa-111111111111',false);
select set_config('request.jwt.claims','{"aal":"aal2"}',false);
do $$ begin if app_private.is_admin() then raise exception 'Wrong admin email allowed'; end if; end$$;
insert into auth.users(id,email,email_confirmed_at)
values('22222222-aaaa-4aaa-8aaa-222222222222','admin@eaglescore.com.ng',now());
insert into public.user_roles(user_id,role) values('22222222-aaaa-4aaa-8aaa-222222222222','super_admin');
select set_config('request.jwt.claim.sub','22222222-aaaa-4aaa-8aaa-222222222222',false);
select set_config('request.jwt.claims','{"aal":"aal1"}',false);
do $$ begin if app_private.is_admin() then raise exception 'Admin accepted without MFA'; end if; end$$;
select set_config('request.jwt.claims','{"aal":"aal2"}',false);
do $$ begin if not app_private.is_admin() then raise exception 'Correct admin denied'; end if; end$$;
SQL
echo "PASS public signup and exclusive administrator database tests"
