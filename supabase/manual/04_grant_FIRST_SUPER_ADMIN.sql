-- IMPORTANT: DO NOT RUN until the same address was registered by script 03,
-- the user accepted the Supabase Auth invitation and the verification query
-- in script 05 shows email_verified=true, member_status=active, accepted_at set.
-- Edit: declare target_email text := 'REPLACE_WITH_APPROVED_ADMIN_EMAIL';
-- Use EXACTLY the same approved email as script 03, retaining the quotes.
-- This is a privileged role assignment and will NOT create an Auth user.
-- STOP: use this only AFTER first admin has accepted their invite and confirmed email.
-- Requires trusted project owner/operator running this directly in SQL Editor.
-- NEVER run a guessed UUID or role assignment from browser/API request.
do $$
declare target_email text := 'REPLACE_WITH_APPROVED_ADMIN_EMAIL';
declare user_id uuid;
declare candidate_count integer;
begin
 if target_email='REPLACE_WITH_APPROVED_ADMIN_EMAIL'
    or target_email !~* '^[^@[:space:]]+@[^@[:space:]]+[.][^@[:space:]]+$' then
   raise exception 'STOP: replace REPLACE_WITH_APPROVED_ADMIN_EMAIL with the approved email address inside single quotes, then run again';
 end if;
 select count(*) into candidate_count
 from auth.users where lower(email)=lower(target_email) and email_confirmed_at is not null;
 select id into user_id from auth.users
 where lower(email)=lower(target_email) and email_confirmed_at is not null limit 1;
 if candidate_count<>1 then raise exception 'STOP: expected one verified user for %, found %',target_email,candidate_count; end if;
 if not exists(select 1 from public.invitations
               where lower(email)=lower(target_email) and accepted_at is not null) then
    raise exception 'STOP: invitation not yet accepted for %',target_email;
 end if;
 if not exists(select 1 from public.profiles
               where id=user_id and status='active') then
    raise exception 'STOP: verified user is not an active, invited EagleScore member';
 end if;
 insert into public.user_roles(user_id,role) values(user_id,'super_admin')
 on conflict do nothing;
 insert into public.audit_logs(actor_id,action,target_id,details)
 values(user_id,'bootstrap.super_admin',user_id,jsonb_build_object('method','approved_manual_sql'));
 raise notice 'Super Admin granted for verified invited member %. Enrol TOTP at /auth/mfa.',target_email;
end $$;
