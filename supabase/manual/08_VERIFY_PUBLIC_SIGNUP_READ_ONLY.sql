-- Read-only verification after the follow-up migration and registration.
select to_regprocedure('app_private.confirm_invitation()') as confirmation_function,
to_regprocedure('app_private.is_admin()') as exclusive_admin_function;
select u.id,u.email,(u.email_confirmed_at is not null) as verified,
p.status,array_remove(array_agg(r.role::text),null) as roles
from auth.users u left join public.profiles p on p.id=u.id
left join public.user_roles r on r.user_id=u.id
where lower(u.email)='admin@eaglescore.com.ng'
group by u.id,u.email,u.email_confirmed_at,p.status;
select count(*) as other_super_admin_accounts
from public.user_roles r join auth.users u on u.id=r.user_id
where r.role='super_admin' and lower(u.email)<>'admin@eaglescore.com.ng';
