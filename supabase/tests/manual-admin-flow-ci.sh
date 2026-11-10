#!/usr/bin/env bash
# Disposable PostgreSQL CI only. NEVER target a live Supabase project.
set -euo pipefail
: "${DATABASE_URL:?Provide the disposable CI database URL}"
sql_dir="supabase/manual"
substitute () { sed "s/REPLACE_WITH_APPROVED_ADMIN_EMAIL/$2/g" "$sql_dir/$1"; }
count_sql () { psql "$DATABASE_URL" -At -c "$1"; }
# Missing admin email must intentionally fail without creating an invitation.
if psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f "$sql_dir/03_prepare_FIRST_ADMIN_INVITATION.sql" >/dev/null 2>&1; then
 echo "FAIL: placeholder allowed in first admin invitation"; exit 1
fi
# Happy path: register invite BEFORE Supabase user is confirmed.
substitute "03_prepare_FIRST_ADMIN_INVITATION.sql" "first.admin@example.org" | psql "$DATABASE_URL" -v ON_ERROR_STOP=1 >/dev/null
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL' >/dev/null
insert into auth.users (id,email,email_confirmed_at)
values ('cccccccc-cccc-4ccc-8ccc-cccccccccccc','first.admin@example.org',null);
update auth.users set email_confirmed_at=now() where id='cccccccc-cccc-4ccc-8ccc-cccccccccccc';
SQL
check=$(count_sql "select count(*) from public.profiles p join public.invitations i on lower(i.email)=lower(p.email) where p.id='cccccccc-cccc-4ccc-8ccc-cccccccccccc' and p.status='active' and i.accepted_at is not null")
if [ "$check" != "1" ]; then echo "FAIL: invited user's confirmation did not activate profile"; exit 1; fi
substitute "04_grant_FIRST_SUPER_ADMIN.sql" "first.admin@example.org" | psql "$DATABASE_URL" -v ON_ERROR_STOP=1 >/dev/null
roles=$(count_sql "select count(*) from public.user_roles where user_id='cccccccc-cccc-4ccc-8ccc-cccccccccccc' and role='super_admin'")
if [ "$roles" != "1" ]; then echo "FAIL: verified active invited admin was not granted role"; exit 1; fi
# An uninvited already-verified user may not be promoted by 04.
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -c "insert into auth.users(id,email,email_confirmed_at) values('dddddddd-dddd-4ddd-8ddd-dddddddddddd','uninvited@example.org',now())" >/dev/null
if substitute "04_grant_FIRST_SUPER_ADMIN.sql" "uninvited@example.org" | psql "$DATABASE_URL" -v ON_ERROR_STOP=1 >/dev/null 2>&1; then
 echo "FAIL: uninvited user promoted"; exit 1
fi
# Optional recovery: a verified account created BEFORE the invitation has pending status.
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -c "insert into public.invitations(email) values('late.admin@example.org')" >/dev/null
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -c "insert into auth.users(id,email,email_confirmed_at) values('eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee','late.admin@example.org',now())" >/dev/null
substitute "06_reconcile_VERIFIED_INVITATION_OPTIONAL.sql" "late.admin@example.org" | psql "$DATABASE_URL" -v ON_ERROR_STOP=1 >/dev/null
reconciled=$(count_sql "select count(*) from public.profiles p join public.invitations i on lower(i.email)=lower(p.email) where p.id='eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee' and p.status='active' and i.accepted_at is not null")
if [ "$reconciled" != "1" ]; then echo "FAIL: manual verified invite recovery failed"; exit 1; fi
echo "PASS: placeholder guard, normal onboarding, verified admin role, uninvited denial, optional recovery"
