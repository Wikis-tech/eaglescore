"use client";
import {useDemo} from "./demo-provider";
import {configured} from "@/lib/supabase/config";
export function AdminGate({children}:{children:React.ReactNode}){
 const{state,ready}=useDemo();
 if(configured())return <>{children}</>;
 if(!ready)return <div className="card">Loading demo…</div>;
 return state.role==="admin"?<>{children}</>:<div className="notice error">Admin preview only; real role checks run on the server when Supabase is configured.</div>;
}
