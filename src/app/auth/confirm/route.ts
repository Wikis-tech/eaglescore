import {NextResponse,type NextRequest} from "next/server";
import type {EmailOtpType} from "@supabase/supabase-js";
import {createClient} from "@/lib/supabase/server";
import {configured} from "@/lib/supabase/config";
export const dynamic="force-dynamic";
export async function GET(request:NextRequest){
 const url=new URL(request.url);
 const tokenHash=url.searchParams.get("token_hash");
 const type=url.searchParams.get("type");
 const next=url.searchParams.get("next");
 const safeNext=next?.startsWith("/")&&!next.startsWith("//")&&!next.includes("\\")?next:"/dashboard";
 const allowed=["invite","recovery","email","signup","magiclink"] as const;
 if(!configured()||!tokenHash||!type||!allowed.some(x=>x===type)){
   return NextResponse.redirect(new URL("/login?error=invalid_confirmation_link",url.origin));
 }
 try{
  const supabase=await createClient();
  const {error}=await supabase.auth.verifyOtp({token_hash:tokenHash,type:type as EmailOtpType});
  return NextResponse.redirect(new URL(error?"/login?error=confirmation_failed":safeNext,url.origin));
 }catch{
  return NextResponse.redirect(new URL("/login?error=confirmation_failed",url.origin));
 }
}
