import "server-only";
import {cookies} from "next/headers";
import {createServerClient} from "@supabase/ssr";
import {browserConfig} from "./config";
export async function createClient(){
 const {url,key}=browserConfig();const jar=await cookies();
 return createServerClient(url,key,{cookies:{
   getAll(){return jar.getAll()},
   setAll(cookiesToSet){
     try{cookiesToSet.forEach(({name,value,options})=>jar.set(name,value,options))}
     catch{/* Server Components cannot set cookies; proxy refreshes them. */}
   }
 }});
}
