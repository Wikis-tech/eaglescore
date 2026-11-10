-- EagleScore: run ONCE for the designated first trusted admin only.
-- Edit placeholder below to an address personally approved by orchestra leadership.
-- DOES NOT CREATE A USER or GRANT SUPER ADMIN.
-- After successful execution: Authentication > Users > Invite user (same email).
do $$
declare target_email text := 'REPLACE_WITH_APPROVED_ADMIN_EMAIL';
begin
 if target_email='REPLACE_WITH_APPROVED_ADMIN_EMAIL'
    or target_email !~* '^[^@[:space:]]+@[^@[:space:]]+[.][^@[:space:]]+$' then
   raise exception 'STOP: enter a valid approved admin email first';
 end if;
 if exists(select 1 from public.invitations
           where lower(email)=lower(target_email) and accepted_at is null) then
   raise exception 'STOP: an outstanding invitation already exists for %',target_email;
 end if;
 insert into public.invitations(email) values(lower(target_email));
 raise notice 'Invitation registered for %. Now send the email invitation using Supabase Auth > Users.',lower(target_email);
end $$;
