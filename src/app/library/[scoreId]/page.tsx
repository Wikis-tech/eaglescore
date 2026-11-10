import {requireMember} from "@/lib/auth/access";
import {Shell} from "@/components/shell";
import {RealScoreDetails} from "@/components/real-workspace";
export const dynamic="force-dynamic";
export default async function Page({params}:{params:Promise<{scoreId:string}>}){const identity=await requireMember();const {scoreId}=await params;return <Shell adminRole={identity.role==="super_admin"}><RealScoreDetails scoreId={scoreId} identity={identity}/></Shell>}
