import {requireMember} from "@/lib/auth/access";
import {Shell} from "@/components/shell";
import {RealWorkspace} from "@/components/real-workspace";
export const dynamic="force-dynamic";
export default async function Page(){const identity=await requireMember();return <Shell adminRole={identity.role==="super_admin"}><RealWorkspace kind="my-uploads" identity={identity}/></Shell>}
