import "server-only";
import {redirect,notFound} from "next/navigation";
import {createClient} from "@/lib/supabase/server";
import {configured} from "@/lib/supabase/config";
export type SessionIdentity={id:string;email:string;role:"member"|"music_director"|"super_admin";aal2:boolean};
export async function getIdentity():Promise<SessionIdentity|null>{
 if(!configured())return null;
 const db=await createClient();
 const {data:{user},error}=await db.auth.getUser();
 if(error||!user||!user.email_confirmed_at)return null;
 const {data:profile,error:profileError}=await db.from("profiles").select("status").eq("id",user.id).maybeSingle();
 if(profileError||profile?.status!=="active")return null;
 const {data:roles,error:rolesError}=await db.from("user_roles").select("role").eq("user_id",user.id);
 if(rolesError||!roles?.length)return null;
 const authorisedAdmin=roles.some(r=>r.role==="super_admin")&&user.email?.toLowerCase()==="admin@eaglescore.com.ng";
 const role=authorisedAdmin?"super_admin":roles.some(r=>r.role==="music_director")?"music_director":"member";
 const {data:aal}=await db.auth.mfa.getAuthenticatorAssuranceLevel();
 return {id:user.id,email:user.email||"",role,aal2:aal?.currentLevel==="aal2"};
}
export async function requireMember(){const identity=await getIdentity();if(!identity)redirect("/login");return identity}
export async function requireAdmin(){
 const identity=await getIdentity();
 if(!identity)redirect("/admin/eaglescorelogin");
 if(identity.role!=="super_admin"||identity.email.toLowerCase()!=="admin@eaglescore.com.ng")notFound();
 if(!identity.aal2)redirect("/auth/mfa");
 return identity;
}
