-- PRIVILEGED ONE-TIME OPERATOR SCRIPT.
-- Run only after verifying ownership of admin@eaglescore.com.ng,
-- with the Supabase Email-confirmed account and active member profile.
-- The password must be chosen and stored privately in Supabase Auth.
do $$
declare uid uuid;
declare n integer;
begin
 select count(*) into n from auth.users
 where lower(email)='admin@eaglescore.com.ng' and email_confirmed_at is not null;
 select id into uid from auth.users
 where lower(email)='admin@eaglescore.com.ng' and email_confirmed_at is not null limit 1;
 if n<>1 then raise exception 'STOP: expected one verified admin Auth user, found %',n; end if;
 if not exists(select 1 from public.profiles where id=uid and status='active') then
   raise exception 'STOP: administrator membership is not active';
 end if;
 delete from public.user_roles where role='super_admin' and user_id<>uid;
 insert into public.user_roles(user_id,role) values(uid,'super_admin')
 on conflict do nothing;
 insert into public.audit_logs(actor_id,action,target_id,details)
 values(uid,'bootstrap.exclusive_super_admin',uid,jsonb_build_object('method','verified_owner_sql'));
 raise notice 'Exclusive Super Admin role assigned. Enrol TOTP MFA next.';
end $$;
