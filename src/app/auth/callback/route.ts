import {NextResponse,type NextRequest} from "next/server";
import {createClient} from "@/lib/supabase/server";
import {configured} from "@/lib/supabase/config";
export async function GET(request:NextRequest){
 const {searchParams,origin}=new URL(request.url);
 const code=searchParams.get("code");
 const next=searchParams.get("next");
 // Prevent open redirects from invitation/recovery links.
 const safeNext=next?.startsWith("/")&&!next.startsWith("//")&&!next.includes("\\")?next:"/dashboard";
 if(!configured()||!code)return NextResponse.redirect(new URL("/login?error=invalid_callback",origin));
 const db=await createClient();const {error}=await db.auth.exchangeCodeForSession(code);
 return NextResponse.redirect(new URL(error?"/login?error=callback_failed":safeNext,origin));
}
