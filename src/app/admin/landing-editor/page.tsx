import {requireAdmin} from "@/lib/auth/access";
import LandingEditor from "@/components/landing-editor";
export const metadata={title:"EagleScore | Landing Page Studio",robots:{index:false,follow:false}};
export const dynamic="force-dynamic";
export default async function Page(){await requireAdmin();return <LandingEditor/>}
