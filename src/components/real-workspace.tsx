import "server-only";
import Link from "next/link";
import {BookOpen,FileText,FolderOpen,Upload,Music,ShieldCheck,Settings,Info} from "lucide-react";
import {createClient} from "@/lib/supabase/server";
import type {SessionIdentity} from "@/lib/auth/access";

type Workspace = "dashboard"|"library"|"my-uploads"|"collections"|"upload"|"editor"|"settings"|"admin/dashboard"|"admin/submissions"|"admin/reviews"|"admin/scores"|"admin/audit-logs"|"admin/settings";
const definitions:Record<Workspace,{title:string;description:string}>={
 dashboard:{title:"My dashboard",description:"Your authenticated EagleScore workspace."},
 library:{title:"Music library",description:"Only records accessible to approved orchestra members appear here."},
 "my-uploads":{title:"My uploads",description:"Your owned score records and submission status."},
 collections:{title:"My collections",description:"Your private rehearsal folders."},
 upload:{title:"Upload a score",description:"Secure file uploads and copyright review are part of Step 4."},
 editor:{title:"Music score editor",description:"Music notation and sol-fa editors will be enabled in Step 5."},
 settings:{title:"My account",description:"Verified membership and account security."},
 "admin/dashboard":{title:"Administration",description:"Live moderation and membership overview."},
 "admin/submissions":{title:"Submissions",description:"Submitted revisions awaiting review."},
 "admin/reviews":{title:"Review history",description:"Recorded musical and copyright review decisions."},
 "admin/scores":{title:"Score records",description:"Score records visible under your administrative permissions."},
 "admin/audit-logs":{title:"Audit events",description:"Events recorded by trusted administrator actions."},
 "admin/settings":{title:"Admin settings",description:"Administrative tools and publication controls."}
};
type Row=Record<string,unknown>;
function Empty({title,detail}:{title:string;detail:string}){return <div className="card" style={{padding:30}}><Info size={24} color="#552277"/><h2 style={{fontSize:19,marginTop:12}}>{title}</h2><p className="muted">{detail}</p></div>}
function Rows({rows,primary,secondary}:{rows:Row[];primary:string;secondary?:string}){return <div className="card stack">{rows.map((row,i)=><div className="item" key={String(row.id??i)}><FileText size={19}/><div className="item-info"><strong>{String(row[primary]??"Untitled")}</strong>{secondary&&<div className="muted small">{String(row[secondary]??"")}</div>}</div></div>)}</div>}
async function loadRows(kind:Workspace,uid:string){
 const db=await createClient();
 const specs:Partial<Record<Workspace,{table:string;fields:string;order:string;owner?:boolean}>>={
  library:{table:"scores",fields:"id,status,created_at,arrangement_id",order:"created_at"},
  "my-uploads":{table:"scores",fields:"id,status,created_at,arrangement_id",order:"created_at",owner:true},
  collections:{table:"collections",fields:"id,name,created_at",order:"created_at",owner:true},
  "admin/submissions":{table:"submissions",fields:"id,status,submitted_at",order:"submitted_at"},
  "admin/reviews":{table:"reviews",fields:"id,review_type,decision,created_at",order:"created_at"},
  "admin/scores":{table:"scores",fields:"id,status,created_at,arrangement_id",order:"created_at"},
  "admin/audit-logs":{table:"audit_logs",fields:"id,action,created_at",order:"created_at"}
 };
 const spec=specs[kind];if(!spec)return {rows:[] as Row[],error:null as string|null};
 let query=db.from(spec.table).select(spec.fields).order(spec.order,{ascending:false}).limit(75);
 if(spec.owner)query=query.eq("owner_id",uid);
 if(kind==="library")query=query.eq("status","approved");
 const {data,error}=await query;
 return {rows:(data??[]) as unknown as Row[],error:error?.message??null};
}
export async function RealWorkspace({kind,identity}:{kind:Workspace;identity:SessionIdentity}){
 const {title,description}=definitions[kind];
 const {rows,error}=await loadRows(kind,identity.id);
 const isAdmin=kind.startsWith("admin/");
 const primary=kind==="collections"?"name":kind==="admin/audit-logs"?"action":kind==="admin/reviews"?"decision":"id";
 const secondary=kind==="admin/reviews"?"review_type":kind==="admin/audit-logs"?"created_at":"status";
 return <div className="stack">
  <div className="page-head"><div><div className="eyebrow">EagleScore · {isAdmin?"Secure administration":"Verified membership"}</div><h1>{title}</h1><p className="muted">{description}</p></div></div>
  {kind==="dashboard"&&<div className="grid grid-3"><div className="card"><BookOpen/><h2>Music library</h2><p className="muted">Browse approved scores when they become available.</p><Link className="btn" href="/library">Open library</Link></div><div className="card"><FolderOpen/><h2>Collections</h2><p className="muted">Organise your rehearsals and favourites.</p><Link className="btn" href="/collections">My collections</Link></div><div className="card"><ShieldCheck/><h2>Membership</h2><p className="muted">Your signed-in account is active and verified.</p></div></div>}
  {kind==="settings"&&<div className="card"><h2>Account details</h2><p><strong>Email:</strong> {identity.email}</p><p><strong>Role:</strong> {identity.role.replaceAll("_"," ")}</p><p><strong>Security:</strong> {identity.aal2?"MFA verified for this session":"Standard authenticated session"}</p><p className="muted">Membership and role changes are controlled by the organisation's administrator.</p></div>}
  {kind==="admin/settings"&&<div className="card"><h2>Administrator tools</h2><p className="muted">Access to these tools is verified by the server, including MFA.</p><div className="flex wrap"><Link className="btn primary" href="/admin/members">Manage members</Link><Link className="btn" href="/admin/landing-editor">Edit landing page</Link></div></div>}
  {kind==="admin/dashboard"&&<div className="grid grid-3"><div className="card"><ShieldCheck/><h2>Member administration</h2><p className="muted">Invite verified members and assign permissions.</p><Link className="btn" href="/admin/members">Manage members</Link></div><div className="card"><FileText/><h2>Submissions</h2><p className="muted">Review records as the score workflow is activated.</p><Link className="btn" href="/admin/submissions">View submissions</Link></div><div className="card"><Settings/><h2>Website content</h2><p className="muted">Publish public landing copy after review.</p><Link className="btn" href="/admin/landing-editor">Open content studio</Link></div></div>}
  {(kind==="upload"||kind==="editor")&&<Empty title="This feature is not accepting real files yet" detail="Step 3 has completed the access-control foundation. The next development phase will connect private storage, validated uploads and the score reader. No demonstration submissions will be created."/>}
  {error&&<div className="notice error" role="alert">Unable to load authorised data. Check EagleScore database permissions. Details: {error}</div>}
  {!error&&["library","my-uploads","collections","admin/submissions","admin/reviews","admin/scores","admin/audit-logs"].includes(kind)&&(rows.length?<Rows rows={rows} primary={primary} secondary={secondary}/>:<Empty title="No records available yet" detail={kind==="library"?"No approved scores have been published. The library is empty until uploads and approvals are enabled.":"There are no records in this section yet. No sample data is being displayed."}/>)}
  {kind==="library"&&<p className="muted small"><Music size={15} style={{display:"inline"}}/> Music titles, instrument parts and real PDF links will be connected in Step 4.</p>}
  {kind==="my-uploads"&&<p className="muted small"><Upload size={15} style={{display:"inline"}}/> Uploads remain unavailable until secure file handling is implemented.</p>}
 </div>;
}
export async function RealScoreDetails({scoreId,identity}:{scoreId:string;identity:SessionIdentity}){
 const db=await createClient();
 const {data:score,error}=await db.from("scores").select("id,status,published_version_id,owner_id,arrangement_id").eq("id",scoreId).maybeSingle();
 if(error||!score)return <div className="stack"><h1>Score unavailable</h1><p className="muted">This score doesn't exist or your account does not have access.</p><Link href="/library">Return to library</Link></div>;
 const owner=score.owner_id===identity.id;
 return <div className="stack"><h1>Score record</h1><div className="card"><p>Score ID: {score.id}</p><p>Status: {score.status}</p><p>Access: {owner?"Owned by you":"Authorised member"}</p></div><Empty title="Reader not yet activated" detail="Step 4 will provide secure PDF and instrument-part access after upload, copyright and publication controls are implemented."/><Link className="btn" href="/library">Back to library</Link></div>;
}
