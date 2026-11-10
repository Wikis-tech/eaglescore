-- IMPORTANT: change ONLY the address inside the lower(...) WHERE clause
-- to exactly the SAME approved email used in script 03. 
-- If the placeholder remains, this query runs but returns ZERO rows.
-- That is NOT proof that an invitation was accepted.
-- Change only the email string. Run after invitation link is accepted.
select u.id,u.email,(u.email_confirmed_at is not null) as email_verified,
       p.status as member_status,
       array_remove(array_agg(distinct ur.role::text),null) as roles,
       max(i.accepted_at) as invite_accepted_at
from auth.users u
left join public.profiles p on p.id=u.id
left join public.user_roles ur on ur.user_id=u.id
left join public.invitations i on lower(i.email)=lower(u.email)
where lower(u.email)=lower('REPLACE_WITH_APPROVED_ADMIN_EMAIL')
group by u.id,u.email,u.email_confirmed_at,p.status;
-- Expected: email_verified = true, member_status = active,
-- roles contains member, invite_accepted_at is NOT NULL.
-- If a profile is stuck pending, do NOT disable RLS; investigate the trigger
-- and whether the invitation was registered before confirmation.
