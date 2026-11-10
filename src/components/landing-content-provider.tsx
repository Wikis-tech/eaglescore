"use client";
import {createContext,useContext,useEffect,useState} from "react";
import {usePathname} from "next/navigation";
import {copyLanding,LANDING_DRAFT_KEY,originalLanding,updateLandingField,validateLanding,type LandingContent} from "@/lib/landing-content";
type ContentContext={content:LandingContent;edit:(path:string,value:string)=>void;reset:()=>void;exportJson:()=>void;replace:(next:LandingContent,asDraft?:boolean)=>void;isDraft:boolean;hydrated:boolean};
const Context=createContext<ContentContext|null>(null);
export function LandingContentProvider({children}:{children:React.ReactNode}){
 const pathname=usePathname();const editor=pathname==="/admin/landing-editor";
 const [content,setContent]=useState<LandingContent>(originalLanding);
 const [hydrated,setHydrated]=useState(false);const [isDraft,setIsDraft]=useState(false);
 useEffect(()=>{
  let live=true;
  const load=async()=>{
   try{
    if(editor){const raw=localStorage.getItem(LANDING_DRAFT_KEY);if(raw){const valid=validateLanding(JSON.parse(raw));if(live&&valid){setContent(valid);setIsDraft(true);setHydrated(true);return}}}
    const res=await fetch("/api/landing",{cache:"no-store"});
    if(!res.ok)throw new Error("CMS response error");
    const valid=validateLanding(await res.json());if(live)setContent(valid||copyLanding());
   }catch{if(live)setContent(copyLanding())}
   if(live){setIsDraft(false);setHydrated(true)}
  };
  void load();return()=>{live=false};
 },[editor]);
 useEffect(()=>{if(!editor||!hydrated)return;try{if(isDraft)localStorage.setItem(LANDING_DRAFT_KEY,JSON.stringify(content));else localStorage.removeItem(LANDING_DRAFT_KEY)}catch{}},[editor,hydrated,isDraft,content]);
 const edit=(path:string,value:string)=>{if(editor){setContent(prev=>updateLandingField(prev,path,value));setIsDraft(true)}};
 const reset=()=>{if(editor){setContent(copyLanding());setIsDraft(false)}};
 const replace=(next:LandingContent,asDraft=true)=>{const safe=validateLanding(next);if(editor&&safe){setContent(safe);setIsDraft(asDraft)}};
 const exportJson=()=>{if(!editor)return;const file=new Blob([JSON.stringify(content,null,2)],{type:"application/json"});const url=URL.createObjectURL(file);const anchor=document.createElement("a");anchor.href=url;anchor.download="eaglescore-landing-draft.json";anchor.click();URL.revokeObjectURL(url)};
 return <Context.Provider value={{content,edit,reset,replace,exportJson,isDraft,hydrated}}>{children}</Context.Provider>;
}
export function useLandingContent(){const c=useContext(Context);if(!c)throw new Error("LandingContentProvider missing");return c}
