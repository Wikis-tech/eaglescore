import {NextResponse} from "next/server";
import {createClient} from "@supabase/supabase-js";
import {browserConfig,configured} from "@/lib/supabase/config";
import {originalLanding,validateLanding} from "@/lib/landing-content";
export const dynamic="force-dynamic";
export async function GET(){
 if(!configured())return NextResponse.json(originalLanding,{headers:{"Cache-Control":"no-store"}});
 try{const {url,key}=browserConfig();const db=createClient(url,key);
 const {data,error}=await db.from("landing_content").select("published").eq("id","main").single();
 if(error)throw error;
 const valid=validateLanding(data?.published);
 return NextResponse.json(valid||originalLanding,{headers:{"Cache-Control":"no-store"}});
 }catch{return NextResponse.json(originalLanding,{headers:{"Cache-Control":"no-store"}})}
}
