import {requireMember} from "@/lib/auth/access";
import {UploadPage} from "@/components/screens";import {Shell} from "@/components/shell";
export default async function Page(){await requireMember();return <Shell><UploadPage/></Shell>}
