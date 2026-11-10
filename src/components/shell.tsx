"use client";
import Link from "next/link";
import {usePathname} from "next/navigation";
import {useEffect,useState} from "react";
import {LogoutButton} from "@/components/logout-button";
import {BookOpen,LayoutDashboard,Upload,FileClock,PenTool,FolderOpen,Settings,Shield,Users,ClipboardCheck,ScrollText,House} from "lucide-react";
const member=[["/dashboard","Dashboard",LayoutDashboard],["/library","Music library",BookOpen],["/upload","Upload music",Upload],["/editor","Music editor",PenTool],["/my-uploads","My uploads",FileClock],["/collections","Collections",FolderOpen],["/settings","Settings",Settings]] as const;
const admin=[["/admin/dashboard","Admin dashboard",Shield],["/admin/submissions","Submissions",ClipboardCheck],["/admin/reviews","Reviews",ClipboardCheck],["/admin/scores","Scores",BookOpen],["/admin/members","Members",Users],["/admin/audit-logs","Audit logs",ScrollText],["/admin/settings","Admin settings",Settings],["/admin/landing-editor","Landing page editor",Settings]] as const;
export function Shell({children,adminRole=false}:{children:React.ReactNode;adminRole?:boolean}){
 const path=usePathname();const [isAdmin,setIsAdmin]=useState(adminRole);
 useEffect(()=>{const ctrl=new AbortController();fetch("/api/me",{cache:"no-store",signal:ctrl.signal}).then(r=>r.ok?r.json():null).then(x=>{if(x)setIsAdmin(x.role==="super_admin")}).catch(()=>{});return()=>ctrl.abort()},[]);
 return <div className="shell"><aside className="sidebar"><Link href="/" className="logo">🦅 Eagle<span>Score</span></Link><div className="subtitle">MFM LAGOS REGION ONE · EAGLE ORCHESTRA</div><nav className="nav" aria-label="Primary">{member.map(([href,label,Icon])=><Link key={href} className={path===href?"active":""} href={href}><Icon/>{label}</Link>)}{isAdmin&&admin.map(([href,label,Icon])=><Link key={href} className={path===href?"active":""} href={href}><Icon/>{label}</Link>)}</nav></aside><div><header className="topbar"><span className="small muted"><House size={14} style={{display:"inline"}}/> {path}</span><div className="flex"><span className="tag">Verified members only</span><LogoutButton/></div></header><main className="content">{children}<div className="footer">EagleScore · Secure member workspace · MFM Lagos Region One Eagle Orchestra</div></main></div></div>;
}
