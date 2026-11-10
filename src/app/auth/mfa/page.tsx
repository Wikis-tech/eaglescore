import {requireMember} from "@/lib/auth/access";
import {MfaForm} from "@/components/auth-forms";
export default async function MfaPage(){const identity=await requireMember();return <MfaForm email={identity.email}/>}
