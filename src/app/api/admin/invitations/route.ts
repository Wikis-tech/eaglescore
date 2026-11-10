import {NextResponse,type NextRequest} from "next/server";
import {validateAdminApi} from "@/lib/auth/api";
import {createAdminClient} from "@/lib/supabase/admin";
export const dynamic="force-dynamic";
export async function POST(request:NextRequest){
 const checked=await validateAdminApi(request);if(checked.error)return checked.error;
 const body=await request.json().catch(()=>null);
 const email=typeof body?.email==="string"?body.email.trim().toLowerCase():"";
 if(email.length>254||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return NextResponse.json({error:"Invalid email address."},{status:400});
 try{
  const db=createAdminClient();
  const {data:existing}=await db.from("invitations").select("id").eq("email",email).is("accepted_at",null).maybeSingle();
  if(existing)return NextResponse.json({error:"An open invitation already exists."},{status:409});
  const {data:inv,error:insertError}=await db.from("invitations").insert({email,invited_by:checked.identity.id}).select("id").single();
  if(insertError||!inv)throw insertError||new Error("Invitation could not be stored");
  const base=process.env.NEXT_PUBLIC_SITE_URL||request.nextUrl.origin;
  const {error:inviteError}=await db.auth.admin.inviteUserByEmail(email,{redirectTo:new URL("/auth/callback?next=/auth/set-password",base).toString()});
  if(inviteError){await db.from("invitations").delete().eq("id",inv.id);return NextResponse.json({error:"Invitation delivery failed."},{status:503})}
  await db.from("audit_logs").insert({actor_id:checked.identity.id,action:"member.invited",details:{invitation_id:inv.id}});
  return NextResponse.json({ok:true},{status:201});
 }catch{return NextResponse.json({error:"Invitation service unavailable."},{status:503})}
}
