import {requireAdmin} from "@/lib/auth/access";
import {AdminMembers} from "@/components/screens";import {Shell} from "@/components/shell";import {AdminGate} from "@/components/admin-gate";export default async function Page(){await requireAdmin();return <Shell><AdminGate><AdminMembers/></AdminGate></Shell>}
