-- IMPORTANT: This script is a TEMPLATE, not a ready-to-run admin assignment.
-- On the line: declare target_email text := 'REPLACE_WITH_APPROVED_ADMIN_EMAIL';
-- change ONLY the text between quotes to the exact email approved for the
-- FIRST EagleScore Super Admin (e.g. 'choir.leader@example.org').
-- Do not use the example address. Do not remove the single quotes.
-- A P0001 "enter a valid approved admin email first" means the placeholder
-- was not replaced; NO row was written and no database migration failed.
-- Script 03 runs FIRST, before Supabase Auth > Users > Invite user.
-- EagleScore: run ONCE for the designated first trusted admin only.
-- Edit placeholder below to an address personally approved by orchestra leadership.
-- DOES NOT CREATE A USER or GRANT SUPER ADMIN.
-- After successful execution: Authentication > Users > Invite user (same email).
do $$
declare target_email text := 'REPLACE_WITH_APPROVED_ADMIN_EMAIL';
begin
 if target_email='REPLACE_WITH_APPROVED_ADMIN_EMAIL'
    or target_email !~* '^[^@[:space:]]+@[^@[:space:]]+[.][^@[:space:]]+$' then
   raise exception 'STOP: replace REPLACE_WITH_APPROVED_ADMIN_EMAIL with the approved email address inside single quotes, then run again';
 end if;
 if exists(select 1 from public.invitations
           where lower(email)=lower(target_email) and accepted_at is null) then
   raise exception 'STOP: an outstanding invitation already exists for %',target_email;
 end if;
 insert into public.invitations(email) values(lower(target_email));
 raise notice 'Invitation registered for %. Now send the email invitation using Supabase Auth > Users.',lower(target_email);
end $$;
