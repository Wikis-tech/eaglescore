import {requireAdmin} from "@/lib/auth/access";
import {Shell} from "@/components/shell";
import {RealWorkspace} from "@/components/real-workspace";
export const dynamic="force-dynamic";
export default async function Page(){const identity=await requireAdmin();return <Shell adminRole><RealWorkspace kind="admin/audit-logs" identity={identity}/></Shell>}
