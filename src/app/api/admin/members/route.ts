import {NextResponse,type NextRequest} from "next/server";
import {validateAdminApi} from "@/lib/auth/api";
import {createAdminClient} from "@/lib/supabase/admin";
export const dynamic="force-dynamic";
export async function GET(request:NextRequest){
 const check=await validateAdminApi(request);if(check.error)return check.error;
 try{const db=createAdminClient();const {data,error}=await db.from("profiles").select("id,email,display_name,status,created_at,user_roles(role)").order("created_at",{ascending:false}).limit(200);if(error)throw error;return NextResponse.json({members:data},{headers:{"Cache-Control":"no-store"}})}catch{return NextResponse.json({error:"Member directory unavailable."},{status:503})}
}
export async function PATCH(request:NextRequest){
 const check=await validateAdminApi(request);if(check.error)return check.error;
 const body=await request.json().catch(()=>null);
 const id=typeof body?.userId==="string"?body.userId:"";
 const action=body?.action;
 const role=body?.role;
 if(!/^[0-9a-f]{8}-[0-9a-f-]{27,}$/i.test(id)||!["suspend","reactivate","grant","revoke"].includes(action))return NextResponse.json({error:"Invalid member request."},{status:400});
 if(id===check.identity.id)return NextResponse.json({error:"Administrators cannot change their own account from this screen."},{status:403});
 if(["grant","revoke"].includes(action)&&!["member","music_director"].includes(role))return NextResponse.json({error:"Invalid role."},{status:400});
 try{
  const db=createAdminClient();
  const {data:target,error:lookup}=await db.from("profiles").select("id,status").eq("id",id).maybeSingle();
  if(lookup||!target)return NextResponse.json({error:"Member not found."},{status:404});
  let result;
  if(action==="suspend"||action==="reactivate"){result=await db.from("profiles").update({status:action==="suspend"?"suspended":"active",updated_at:new Date().toISOString()}).eq("id",id)}
  else if(action==="grant"){result=await db.from("user_roles").upsert({user_id:id,role},{onConflict:"user_id,role",ignoreDuplicates:true})}
  else{result=await db.from("user_roles").delete().eq("user_id",id).eq("role",role)}
  if(result.error)throw result.error;
  await db.from("audit_logs").insert({actor_id:check.identity.id,action:"member."+action,target_id:id,details:role?{role}:{}});
  return NextResponse.json({ok:true});
 }catch{return NextResponse.json({error:"Member update failed."},{status:503})}
}
