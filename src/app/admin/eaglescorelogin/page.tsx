import Link from "next/link";import {LockKeyhole,ArrowRight,ShieldAlert,Music2} from "lucide-react";
export const metadata={title:"EagleScore | Admin Sign-in"};
export default function AdminLogin(){
 return <main className="es-admin-auth"><div className="es-admin-auth-panel">
  <Link href="/" className="es-admin-mark"><Music2 size={24}/> EAGLESCORE</Link>
  <div className="es-admin-auth-eyebrow">ORCHESTRA CONTENT MANAGEMENT</div>
  <h1>Admin sign-in</h1>
  <p>Manage the pages and images that welcome members to EagleScore.</p>
  <div className="es-admin-disabled"><LockKeyhole size={20}/><div><strong>Secure sign-in is coming in Step 3.</strong><p>The website does not yet have Supabase authentication or administrator permissions. A public password form here would be misleading and unsafe.</p></div></div>
  <Link href="/admin/landing-editor" className="es-admin-auth-button">Open local CMS preview <ArrowRight size={18}/></Link>
  <p className="es-admin-auth-note"><ShieldAlert size={16}/> Preview changes remain in this browser only. They do not publish to the public site or affect other visitors.</p>
  <Link href="/" className="es-admin-back">← Return to EagleScore</Link>
 </div><div className="es-admin-auth-art" aria-hidden="true"><div className="es-admin-auth-art-label">EAGLESCORE / CONTENT STUDIO</div><div className="es-admin-auth-art-motif">𝄞</div><div className="es-admin-auth-art-caption">A BETTER HOME FOR EVERY SCORE.</div></div></main>
}
