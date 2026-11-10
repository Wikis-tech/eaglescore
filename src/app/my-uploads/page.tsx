import {requireMember} from "@/lib/auth/access";
import {MyUploads} from "@/components/screens";import {Shell} from "@/components/shell";
export default async function Page(){await requireMember();return <Shell><MyUploads/></Shell>}
