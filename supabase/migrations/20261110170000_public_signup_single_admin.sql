-- EagleScore Step 3 ADDITIVE migration. Apply only after the foundation.
-- Does not create or reset passwords. No elevation from user metadata.
begin;
create or replace function app_private.confirm_invitation()
returns trigger language plpgsql security definer set search_path='' as $$
declare invitation_id uuid;
begin
 if new.email_confirmed_at is not null and old.email_confirmed_at is null then
   select i.id into invitation_id from public.invitations i
   where lower(i.email)=lower(new.email) and i.accepted_at is null
   and i.expires_at>now() order by i.created_at desc limit 1 for update;
   if invitation_id is not null then
     update public.invitations set accepted_at=now() where id=invitation_id;
   end if;
   update public.profiles set
     status=case when status='suspended' then status else 'active'::public.member_status end,
     email=coalesce(new.email,email),updated_at=now() where id=new.id;
   if exists(select 1 from public.profiles where id=new.id and status='active') then
     insert into public.user_roles(user_id,role) values(new.id,'member')
     on conflict do nothing;
   end if;
 end if;
 return new;
end;$$;
create or replace function app_private.new_member_profile()
returns trigger language plpgsql security definer set search_path='' as $$
begin
 insert into public.profiles(id,email,display_name,status)
 values(new.id,coalesce(new.email,''),left(coalesce(new.raw_user_meta_data->>'full_name',''),140),
 case when new.email_confirmed_at is not null then 'active'::public.member_status
 else 'pending'::public.member_status end)
 on conflict(id) do nothing;
 if new.email_confirmed_at is not null then
   insert into public.user_roles(user_id,role) values(new.id,'member') on conflict do nothing;
 end if;
 return new;
end;$$;
create or replace function app_private.is_admin()
returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.user_roles r
 join public.profiles p on p.id=r.user_id
 join auth.users u on u.id=p.id
 where r.user_id=(select auth.uid()) and r.role='super_admin'
 and lower(u.email)='admin@eaglescore.com.ng'
 and u.email_confirmed_at is not null and p.status='active');
$$;
-- Remove any elevated account which does not belong to the designated mailbox.
delete from public.user_roles r
using auth.users u
where r.user_id=u.id and r.role='super_admin'
and lower(coalesce(u.email,''))<>'admin@eaglescore.com.ng';
revoke insert,update,delete on public.user_roles from anon,authenticated;
revoke insert,update,delete on public.profiles from anon,authenticated;
commit;
