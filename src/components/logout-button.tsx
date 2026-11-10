"use client";
import {useRouter} from "next/navigation";
import {LogOut} from "lucide-react";
import {createClient} from "@/lib/supabase/client";
export function LogoutButton(){const router=useRouter();return <button className="btn" onClick={async()=>{await createClient().auth.signOut();router.replace("/login");router.refresh()}}><LogOut size={15}/> Sign out</button>}
