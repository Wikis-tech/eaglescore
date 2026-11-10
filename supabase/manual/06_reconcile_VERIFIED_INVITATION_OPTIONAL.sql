-- OPTIONAL recovery for a verified, invited user who remained "pending".
-- Use ONLY after reading 05_check_INVITATION_AFTER_ACCEPT_READ_ONLY.sql.
-- This script does NOT grant elevated roles. It activates ONE confirmed email
-- only if its unexpired, outstanding EagleScore invitation was registered first.
do $$
declare target_email text := 'REPLACE_WITH_APPROVED_ADMIN_EMAIL';
declare verified_user uuid;
declare invitation_id uuid;
declare matched_users int;
begin
 if target_email='REPLACE_WITH_APPROVED_ADMIN_EMAIL'
    or target_email !~* '^[^@[:space:]]+@[^@[:space:]]+[.][^@[:space:]]+$' then
   raise exception 'STOP: enter the verified invited email first';
 end if;
 select count(*) into matched_users from auth.users
  where lower(email)=lower(target_email) and email_confirmed_at is not null;
 if matched_users<>1 then raise exception 'STOP: exactly one verified auth user required, found %',matched_users; end if;
 select id into verified_user from auth.users
  where lower(email)=lower(target_email) and email_confirmed_at is not null
  limit 1;
 select id into invitation_id from public.invitations
  where lower(email)=lower(target_email) and accepted_at is null and expires_at>now()
  order by created_at desc limit 1 for update;
 if invitation_id is null then
  raise exception 'STOP: no current unaccepted and unexpired invitation for %',target_email;
 end if;
 update public.invitations set accepted_at=now() where id=invitation_id;
 update public.profiles set status='active',updated_at=now()
  where id=verified_user and status='pending';
 if not found then
  raise exception 'STOP: expected one pending profile to activate';
 end if;
 insert into public.user_roles(user_id,role) values(verified_user,'member')
  on conflict do nothing;
 insert into public.audit_logs(actor_id,action,target_id,details)
 values(verified_user,'bootstrap.invite_reconciled',verified_user,jsonb_build_object('method','reviewed_manual_sql'));
 raise notice 'Verified invitation reconciled for %. Re-run post-acceptance check.',target_email;
end $$;
