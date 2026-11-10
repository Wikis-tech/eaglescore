import {requireMember} from "@/lib/auth/access";
import {Dashboard} from "@/components/screens";import {Shell} from "@/components/shell";
export default async function Page(){await requireMember();return <Shell><Dashboard/></Shell>}
