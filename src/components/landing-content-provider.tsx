"use client";
import {createContext,useContext,useEffect,useState} from "react";
import {copyLanding,LANDING_DRAFT_KEY,originalLanding,updateLandingField,validateLanding,type LandingContent} from "@/lib/landing-content";
type ContentContext = {content:LandingContent;edit:(path:string,value:string)=>void;reset:()=>void;exportJson:()=>void;isDraft:boolean;hydrated:boolean};
const Context=createContext<ContentContext|null>(null);
export function LandingContentProvider({children}:{children:React.ReactNode}){
 const [content,setContent]=useState<LandingContent>(originalLanding);
 const [hydrated,setHydrated]=useState(false);
 const [isDraft,setIsDraft]=useState(false);
 useEffect(()=>{const timer=window.setTimeout(()=>{
   try{const raw=localStorage.getItem(LANDING_DRAFT_KEY);if(raw){const valid=validateLanding(JSON.parse(raw));if(valid){setContent(valid);setIsDraft(true)}}}catch{ /* local storage may be unavailable */ }
   setHydrated(true);
 },0);return()=>clearTimeout(timer)},[]);
 useEffect(()=>{if(!hydrated)return;try{if(isDraft)localStorage.setItem(LANDING_DRAFT_KEY,JSON.stringify(content));else localStorage.removeItem(LANDING_DRAFT_KEY)}catch{/* quota or privacy mode */}},[content,isDraft,hydrated]);
 const edit=(path:string,value:string)=>{setContent(prev=>updateLandingField(prev,path,value));setIsDraft(true)};
 const reset=()=>{setContent(copyLanding());setIsDraft(false)};
 const exportJson=()=>{const file=new Blob([JSON.stringify(content,null,2)],{type:"application/json"});const url=URL.createObjectURL(file);const anchor=document.createElement("a");anchor.href=url;anchor.download="eaglescore-landing-draft.json";anchor.click();URL.revokeObjectURL(url)};
 useEffect(()=>{const sync=(event:StorageEvent)=>{if(event.key!==LANDING_DRAFT_KEY)return;if(!event.newValue){setContent(copyLanding());setIsDraft(false);return}try{const valid=validateLanding(JSON.parse(event.newValue));if(valid){setContent(valid);setIsDraft(true)}}catch{/* invalid external draft */}};window.addEventListener("storage",sync);return()=>window.removeEventListener("storage",sync)},[]);
 return <Context.Provider value={{content,edit,reset,exportJson,isDraft,hydrated}}>{children}</Context.Provider>;
}
export function useLandingContent(){const c=useContext(Context);if(!c)throw new Error("LandingContentProvider missing");return c}
