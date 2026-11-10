import {requireAdmin} from "@/lib/auth/access";
import {Shell} from "@/components/shell";
import {MembersManager} from "@/components/members-manager";
export const dynamic="force-dynamic";
export default async function Page(){await requireAdmin();return <Shell adminRole><MembersManager/></Shell>}
