import {NextResponse} from "next/server";
import {getIdentity} from "@/lib/auth/access";
export const dynamic="force-dynamic";
export async function GET(){const identity=await getIdentity();return NextResponse.json(identity||{role:null},{headers:{"Cache-Control":"no-store"}})}
