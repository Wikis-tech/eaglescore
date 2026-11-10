import {requireMember} from "@/lib/auth/access";
import {ScoreDetails} from "@/components/screens";import {Shell} from "@/components/shell";
export default async function Page(){await requireMember();return <Shell><ScoreDetails/></Shell>}
