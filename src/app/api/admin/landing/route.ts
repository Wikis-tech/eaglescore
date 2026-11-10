import {NextResponse,type NextRequest} from "next/server";
import {validateAdminApi} from "@/lib/auth/api";
import {createAdminClient} from "@/lib/supabase/admin";
import {validateLanding} from "@/lib/landing-content";
export const dynamic="force-dynamic";
export async function GET(request:NextRequest){
 const check=await validateAdminApi(request);if(check.error)return check.error;
 try{const admin=createAdminClient();const {data,error}=await admin.from("landing_content").select("*").eq("id","main").single();if(error)throw error;return NextResponse.json(data,{headers:{"Cache-Control":"no-store"}})}catch{return NextResponse.json({error:"CMS unavailable."},{status:503})}
}
export async function PATCH(request:NextRequest){
 const check=await validateAdminApi(request);if(check.error)return check.error;
 const body=await request.json().catch(()=>null);
 const content=validateLanding(body?.content);
 if(!content||!Number.isInteger(body?.expectedVersion)||body.expectedVersion<0)return NextResponse.json({error:"Invalid content/version."},{status:400});
 try{const db=createAdminClient();
 const {data,error}=await db.from("landing_content").update({draft:content,version:body.expectedVersion+1,updated_by:check.identity.id,updated_at:new Date().toISOString()}).eq("id","main").eq("version",body.expectedVersion).select("version").maybeSingle();
 if(error)throw error;if(!data)return NextResponse.json({error:"Content changed. Refresh and retry."},{status:409});
 return NextResponse.json({ok:true,version:data.version})}catch{return NextResponse.json({error:"Unable to save draft."},{status:503})}
}
export async function POST(request:NextRequest){
 const check=await validateAdminApi(request);if(check.error)return check.error;
 const body=await request.json().catch(()=>null);
 const expected=body?.expectedVersion;
 if(!Number.isInteger(expected)||expected<0)return NextResponse.json({error:"Expected version required."},{status:400});
 try{const db=createAdminClient();
 const {data:record,error:e}=await db.from("landing_content").select("draft,version").eq("id","main").single();
 if(e||!record||record.version!==expected||!record.draft)return NextResponse.json({error:"No current draft to publish; refresh first."},{status:409});
 const clean=validateLanding(record.draft);if(!clean)return NextResponse.json({error:"Invalid saved draft."},{status:400});
 const {data,error}=await db.from("landing_content").update({published:clean,draft:null,version:expected+1,updated_by:check.identity.id,updated_at:new Date().toISOString()}).eq("id","main").eq("version",expected).select("version").maybeSingle();
 if(error)throw error;if(!data)return NextResponse.json({error:"Concurrent change detected."},{status:409});
 await db.from("audit_logs").insert({actor_id:check.identity.id,action:"landing.published",details:{version:data.version}});
 return NextResponse.json({ok:true,version:data.version});
 }catch{return NextResponse.json({error:"Unable to publish."},{status:503})}
}
