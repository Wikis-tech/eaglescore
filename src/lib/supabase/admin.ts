import "server-only";
import {createClient as createSupabaseClient} from "@supabase/supabase-js";
import {browserConfig} from "./config";
export function createAdminClient(){
 const secret=process.env.SUPABASE_SECRET_KEY;
 if(!secret)throw new Error("Server-only Supabase secret has not been configured.");
 const {url}=browserConfig();
 return createSupabaseClient(url,secret,{auth:{autoRefreshToken:false,persistSession:false}});
}
