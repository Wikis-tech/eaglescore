import {createServerClient} from "@supabase/ssr";
import {NextResponse,type NextRequest} from "next/server";
import {browserConfig,configured} from "./config";
export async function updateSession(request:NextRequest){
 if(!configured())return NextResponse.next({request});
 const {url,key}=browserConfig();let response=NextResponse.next({request});
 const supabase=createServerClient(url,key,{cookies:{
  getAll(){return request.cookies.getAll()},
  setAll(toSet){
   toSet.forEach(({name,value})=>request.cookies.set(name,value));
   response=NextResponse.next({request});
   toSet.forEach(({name,value,options})=>response.cookies.set(name,value,options));
  }
 }});
 await supabase.auth.getClaims();
 return response;
}
