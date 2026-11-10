import {NextResponse,type NextRequest} from "next/server";
import {getIdentity} from "@/lib/auth/access";
export function sameOrigin(request:NextRequest){
 const origin=request.headers.get("origin");if(!origin)return false;
 try{return new URL(origin).host===request.nextUrl.host}catch{return false}
}
export async function validateAdminApi(request:NextRequest){
 const identity=await getIdentity();
 if(!identity)return {error:NextResponse.json({error:"Authentication required."},{status:401})};
 if(identity.role!=="super_admin")return {error:NextResponse.json({error:"Administrator role required."},{status:403})};
 if(!identity.aal2)return {error:NextResponse.json({error:"Multi-factor verification required."},{status:403})};
 if(request.method!=="GET"&&!sameOrigin(request))return {error:NextResponse.json({error:"Invalid request origin."},{status:403})};
 return {identity};
}
