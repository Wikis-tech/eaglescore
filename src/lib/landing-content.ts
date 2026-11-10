export type LandingContent = {
  brand: string;
  nav: {how:string; features:string; about:string; demo:string; login:string; open:string};
  hero: {eyebrow:string; line1:string; line2:string; line3:string; description:string; cta:string; secondary:string; caption:string; badge:string};
  ticker: string[];
  workflow: {eyebrow:string; heading1:string; heading2:string; description:string; steps:{title:string;description:string}[]};
  features: {eyebrow:string; heading1:string; heading2:string; description:string; searchLabel:string; searchHeading:string; searchExample:string; searchNote:string; partsLabel:string; partsHeading:string; partsDescription:string; accessLabel:string; accessHeading:string; accessDescription:string};
  about: {eyebrow:string; heading1:string; heading2:string; description:string; cta:string};
  showcase: {brandTagline:string; workflowEyebrow:string; workflowTitle:string; workflowDescription:string; approvalTitle:string; approvalCaption:string; sampleResults:{title:string;description:string}[]; instruments:string[]; covers:{name:string;type:string;code:string}[]};
  footer: {caption:string};
  media: {hero:"collage"|"rehearsal"; workflow:"library"|"editor"; search:"library"|"reader"; parts:"reader"|"editor"; access:"library"|"rehearsal"; about:"rehearsal"|"reader"};
};
export const originalLanding:LandingContent = {
  brand:"EagleScore",
  nav:{how:"How it works",features:"Features",about:"Our orchestra",demo:"Music library",login:"Member login",open:"Open library"},
  hero:{eyebrow:"MFM LAGOS REGION ONE · EAGLE ORCHESTRA",line1:"EVERY SCORE.",line2:"ONE HOME.",line3:"ALWAYS READY.",description:"No more missing hymn sheets. Discover, organise and read your orchestra's approved scores — anywhere, on any device.",cta:"Enter the library",secondary:"See how it works",caption:"A DIGITAL HOME FOR EVERY PART OF THE PERFORMANCE",badge:"THE MUSIC STAYS WITH YOU"},
  ticker:["PDF SCORES","INSTRUMENT PARTS","HYMNS","MUSICXML PLANNED","DIGITAL ARCHIVE","REHEARSAL COLLECTIONS"],
  workflow:{eyebrow:"01 / THE WORKFLOW",heading1:"FROM PAPER",heading2:"TO PERFORMANCE.",description:"Your orchestra's music, organised in a few simple steps. Every submission is reviewed before it becomes part of the official collection.",steps:[{title:"UPLOAD",description:"Add a scan, PDF or a drafted music score."},{title:"REVIEW",description:"The authorised admin checks every submission."},{title:"FIND",description:"Search approved music by title or instrument."},{title:"PLAY",description:"Open your part on any screen, ready for rehearsal."}]},
  features:{eyebrow:"02 / MADE FOR MUSICIANS",heading1:"YOUR MUSIC.",heading2:"IN SYNC.",description:"Find the right music and the right part, whether you're rehearsing from a phone, tablet or laptop.",searchLabel:"SEARCH THAT MAKES SENSE",searchHeading:"Find an old hymn in seconds.",searchExample:"Amazing Grace",searchNote:"Illustrative search interface · Sample music only",partsLabel:"ALL YOUR PARTS",partsHeading:"One score. Many instruments.",partsDescription:"Choose your instrument and focus on the music you need.",accessLabel:"CONTROLLED SHARING",accessHeading:"Approved first. Accessible after.",accessDescription:"Admin-reviewed access, version history and permission-aware downloads are part of the product plan."},
  about:{eyebrow:"03 / BUILT FOR EAGLE ORCHESTRA",heading1:"LET THE MUSIC",heading2:"LIVE ON.",description:"Scores from yesterday should be ready for tomorrow. EagleScore brings continuity to the MFM Lagos Region One Eagle Orchestra — preserving arrangements, making rehearsals smoother and keeping every musician connected to the music.",cta:"Explore EagleScore"},
  showcase:{brandTagline:"THE ORCHESTRA LIBRARY",workflowEyebrow:"MADE FOR REAL REHEARSALS",workflowTitle:"From paper folders to a library you can trust.",workflowDescription:"A familiar music library experience, designed to keep every approved arrangement easy to find.",approvalTitle:"Approved library",approvalCaption:"Admin-reviewed submissions",sampleResults:[{title:"Amazing Grace",description:"VIOLIN · HYMNS"},{title:"Great Is Thy Faithfulness",description:"PIANO · HYMNS"}],instruments:["VIOLIN","CLARINET","PIANO","GUITAR","RECORDER","FULL SCORE"],covers:[{name:"AMAZING GRACE",type:"HYMN / VIOLIN",code:"ES · 024"},{name:"FAITHFULNESS",type:"HYMN / PIANO",code:"ES · 018"},{name:"PRAISE MEDLEY",type:"PRAISE / FULL SCORE",code:"ES · 041"},{name:"SUNDAY PRELUDE",type:"WORSHIP / CLARINET",code:"ES · 056"}]},
  footer:{caption:"AN EAGLE ORCHESTRA DIGITAL LIBRARY CONCEPT"},
  media:{hero:"collage",workflow:"library",search:"library",parts:"reader",access:"library",about:"rehearsal"}
};
export const LANDING_DRAFT_KEY = "eaglescore-landing-cms-draft-v1";
export const copyLanding = ():LandingContent => JSON.parse(JSON.stringify(originalLanding)) as LandingContent;
const allowedMedia:Record<keyof LandingContent["media"],readonly string[]> = {hero:["collage","rehearsal"],workflow:["library","editor"],search:["library","reader"],parts:["reader","editor"],access:["library","rehearsal"],about:["rehearsal","reader"]};
export function validateLanding(data:unknown):LandingContent|null{
 if(!data || typeof data!=="object")return null;
 const result=copyLanding(); const candidate=data as Record<string,unknown>;
 const apply=(target:Record<string,unknown>,source:Record<string,unknown>)=>{
   for(const key of Object.keys(target)){
     if(!(key in source))continue;
     const oldValue=target[key];const next=source[key];
     if(typeof oldValue==="string"){if(typeof next==="string")target[key]=next.slice(0,600);}
     else if(Array.isArray(oldValue)&&Array.isArray(next)){
       if(oldValue.every(x=>typeof x==="string"))target[key]=oldValue.map((v,i)=>typeof next[i]==="string"?(next[i] as string).slice(0,120):v);
       else for(let i=0;i<oldValue.length;i++)if(typeof next[i]==="object"&&next[i]!==null)apply(oldValue[i] as Record<string,unknown>,next[i] as Record<string,unknown>);
     }else if(typeof oldValue==="object"&&oldValue!==null&&typeof next==="object"&&next!==null)apply(oldValue as Record<string,unknown>,next as Record<string,unknown>);
   }
 };
 apply(result as unknown as Record<string,unknown>,candidate);
 for(const key of Object.keys(allowedMedia) as (keyof LandingContent["media"])[]){
    if(!allowedMedia[key].includes(result.media[key]))result.media[key]=originalLanding.media[key] as never;
 }
 return result;
}
export function updateLandingField(content:LandingContent,path:string,value:string):LandingContent{
 const updated=copyWith(content);
 const keys=path.split(".");
 let current:unknown=updated;
 for(const key of keys.slice(0,-1)){
    if(typeof current!=="object"||current===null||!(key in current))return updated;
    current=(current as Record<string,unknown>)[key];
 }
 const last=keys[keys.length-1];
 if(typeof current==="object"&&current!==null&&last in current&&typeof (current as Record<string,unknown>)[last]==="string"){
   (current as Record<string,string>)[last]=value.slice(0,600);
 }
 return validateLanding(updated)||copyLanding();
}
function copyWith(content:LandingContent):LandingContent{return JSON.parse(JSON.stringify(content)) as LandingContent;}
export const illustrationSources={library:"/illustrations/library.svg",editor:"/illustrations/editor.svg",reader:"/illustrations/reader.svg",rehearsal:"/illustrations/rehearsal.svg"} as const;
