import {requireAdmin} from "@/lib/auth/access";
import {AdminAudit} from "@/components/screens";import {Shell} from "@/components/shell";import {AdminGate} from "@/components/admin-gate";export default async function Page(){await requireAdmin();return <Shell><AdminGate><AdminAudit/></AdminGate></Shell>}
