"use client";
import Link from "next/link";
import Image from "next/image";
import {useEffect,useState} from "react";
import {ArrowRight,BookOpen,Check,ChevronDown,FileMusic,FolderOpen,Menu,Music2,Play,Search,ShieldCheck,UploadCloud,X} from "lucide-react";
import {useLandingContent} from "./landing-content-provider";
import {illustrationSources} from "@/lib/landing-content";
import "./landing.css";

const cardTones=["lavender","cream","red","dark"];
const stepIcons=[UploadCloud,ShieldCheck,Search,BookOpen];
function ScoreTile({card,index}:{card:{name:string;type:string;code:string;tone:string};index:number}){
 return <div className={"es-art-card es-art-"+card.tone} style={{"--order":String(index)} as React.CSSProperties} aria-hidden="true">
 <div className="es-art-top"><span>E / S</span><span>{card.code}</span></div>
 <div className="es-art-title">{card.name}</div><div className="es-art-rule"/>
 <svg viewBox="0 0 236 98" className="es-art-staff" aria-hidden="true"><g stroke="currentColor" strokeWidth="1" opacity=".53">{[28,38,48,58,68].map(y=><line key={y} x1="1" x2="235" y1={y} y2={y}/>)}</g><text x="8" y="70" fontSize="46" fill="currentColor">𝄞</text>{[0,1,2,3].map(v=><g key={v} transform={"translate("+(76+v*38)+" "+(53-((v+index)%3)*9)+")"} fill="currentColor" stroke="currentColor"><ellipse cx="0" cy="0" rx="7" ry="4" transform="rotate(-23)"/><line x1="6" y1="-1" x2="6" y2="-30" strokeWidth="1.6"/></g>)}</svg>
 <div className="es-art-bottom"><span>{card.type}</span><Music2 size={14}/></div>
 </div>;
}
function Illustration({source,alt,className}:{source:keyof typeof illustrationSources;alt:string;className?:string}){return <div className={"es-illustration "+(className||"")}><Image src={illustrationSources[source]} width={920} height={580} alt={alt} unoptimized/></div>}
export default function MarketingLanding(){
 const {content:c,isDraft}=useLandingContent();
 const [open,setOpen]=useState(false);
 const covers=c.showcase.covers.map((cover,i)=>({...cover,tone:cardTones[i%cardTones.length]}));
 const [playing,setPlaying]=useState(true);
 useEffect(()=>{if(typeof IntersectionObserver==="undefined"||window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;const elements=document.querySelectorAll<HTMLElement>(".es-scroll-reveal");const observer=new IntersectionObserver(entries=>{for(const entry of entries){if(entry.isIntersecting){entry.target.classList.remove("es-reveal-init");observer.unobserve(entry.target)}}},{threshold:.08,rootMargin:"0px 0px -30px 0px"});for(const element of elements){element.classList.add("es-reveal-init");observer.observe(element)}return()=>{observer.disconnect();for(const el of elements)el.classList.remove("es-reveal-init")}},[]);
 return <div className="es-landing">
  <a className="es-skip" href="#main">Skip to content</a>
  <header className="es-site-header"><nav className="es-nav" aria-label="Main navigation">
   <Link href="/" className="es-brand" aria-label="EagleScore home"><span className="es-brand-icon"><Music2 size={24} strokeWidth={2.5}/></span><span>{c.brand.slice(0,-5).toUpperCase()}<span>{c.brand.slice(-5).toUpperCase()}</span><small>{c.showcase.brandTagline}</small></span></Link>
   <div className={"es-menu "+(open?"is-open":"")} id="landing-navigation">
    <a href="#how-it-works" onClick={()=>setOpen(false)}>{c.nav.how}</a>
    <a href="#features" onClick={()=>setOpen(false)}>{c.nav.features}</a>
    <a href="#about" onClick={()=>setOpen(false)}>{c.nav.about}</a>
    <Link href="/signup" onClick={()=>setOpen(false)}>Create account</Link>
   </div>
   <div className="es-nav-actions"><Link href="/login" className="es-login">{c.nav.login}</Link><Link href="/dashboard" className="es-button es-button-light">{c.nav.open}<ArrowRight size={16}/></Link></div>
   <button type="button" className="es-mobile-toggle" aria-label={open?"Close menu":"Open menu"} aria-expanded={open} aria-controls="landing-navigation" onClick={()=>setOpen(v=>!v)}>{open?<X size={23}/>:<Menu size={23}/>}</button>
  </nav></header>
  <main id="main">
   <section className="es-hero" aria-labelledby="hero-heading">
    <div className="es-ambient es-ambient-one"/><div className="es-ambient es-ambient-two"/>
    <div className="es-hero-text">
     <span className="es-kicker"><span className="es-kicker-dot"/>{c.hero.eyebrow}</span>
     <h1 id="hero-heading"><span className="es-hero-line">{c.hero.line1}</span><span className="es-hero-line">{c.hero.line2}</span><span className="es-hero-line es-hero-accent">{c.hero.line3}</span></h1>
     <p>{c.hero.description}</p>
     <div className="es-hero-actions"><Link href="/dashboard" className="es-button es-button-red">{c.hero.cta}<ArrowRight size={19}/></Link><a href="#how-it-works" className="es-text-link">{c.hero.secondary}<ChevronDown size={18}/></a></div>
     <div className="es-hero-foot"><span className="es-foot-line"/><span>{c.hero.caption}</span></div>
     {isDraft&&<Link className="es-draft-indicator" href="/admin/landing-editor">LOCAL CMS PREVIEW · EDIT CONTENT</Link>}
    </div>
    <div className={"es-visual "+(playing?"es-visual-playing":"es-visual-paused")} aria-label="Decorative illustration of orchestra music scores">
     {c.media.hero==="collage"?<div className="es-visual-grid" aria-hidden="true">{[...covers,...covers].map((card,i)=><ScoreTile key={i} card={card} index={i}/>)}</div>:<Illustration source="rehearsal" alt="Original illustration representing orchestra musicians" className="es-hero-alternative"/>}
     <div className="es-visual-shade"/><div className="es-floating-label"><span className="es-pulse"/>{c.hero.badge}</div>
     {c.media.hero==="collage"&&<button type="button" className="es-motion-toggle" onClick={()=>setPlaying(v=>!v)} aria-label={playing?"Pause visual animation":"Play visual animation"}><Play size={14} fill="currentColor" style={{display:playing?"none":"block"}}/><span>{playing?"Ⅱ":""}</span></button>}
    </div>
   </section>
   <section className="es-ticker" aria-label="Supported music formats"><div>{c.ticker.map((v,i)=><span className="es-ticker-item" key={i}>{v}<span aria-hidden="true">✦</span></span>)}</div></section>
   <section id="how-it-works" className="es-section es-section-light">
    <div className="es-section-intro"><div><span className="es-section-number">{c.workflow.eyebrow}</span><h2>{c.workflow.heading1}<br/><span>{c.workflow.heading2}</span></h2></div><p>{c.workflow.description}</p></div>
    <div className="es-process-grid">{c.workflow.steps.map((step,i)=>{const Icon=stepIcons[i];return <article key={i} className="es-process-card es-scroll-reveal"><div className="es-process-top"><span>0{i+1}</span><Icon size={26}/></div><h3>{step.title}</h3><p>{step.description}</p></article>})}</div>
    <div className="es-workflow-visual es-scroll-reveal"><Illustration source={c.media.workflow} alt={c.media.workflow==="library"?"Original illustration of a digital sheet music library":"Original illustration of a music notation editor"}/><div><span className="es-image-eyebrow">{c.showcase.workflowEyebrow}</span><h3>{c.showcase.workflowTitle}</h3><p>{c.showcase.workflowDescription}</p></div></div>
   </section>
   <section id="features" className="es-section es-section-dark">
    <div className="es-section-intro"><div><span className="es-section-number">{c.features.eyebrow}</span><h2>{c.features.heading1}<br/><span>{c.features.heading2}</span></h2></div><p>{c.features.description}</p></div>
    <div className="es-feature-grid">
     <article className="es-feature-card es-feature-main es-scroll-reveal"><div className="es-feature-overline"><Search size={16}/>{c.features.searchLabel}</div><h3>{c.features.searchHeading}</h3><div className="es-search-demo"><Search size={22}/><span>{c.features.searchExample}</span><span className="es-search-shortcut">↵</span></div><div className="es-search-results">{c.showcase.sampleResults.map((s,i)=><div key={i}><FileMusic size={18}/><strong>{s.title}</strong><span>{s.description}</span></div>)}</div><Illustration source={c.media.search} alt="Original illustration of searchable digital music sheets"/><p className="es-small-note">{c.features.searchNote}</p></article>
     <article className="es-feature-card es-feature-secondary es-scroll-reveal"><span className="es-feature-overline"><FolderOpen size={16}/>{c.features.partsLabel}</span><h3>{c.features.partsHeading}</h3><div className="es-part-grid">{c.showcase.instruments.map((t,i)=><span key={i}>{t}</span>)}</div><Illustration source={c.media.parts} alt="Original illustration of a musical instrument score"/><p>{c.features.partsDescription}</p></article>
     <article className="es-feature-card es-feature-secondary"><span className="es-feature-overline"><ShieldCheck size={16}/>{c.features.accessLabel}</span><h3>{c.features.accessHeading}</h3><div className="es-approval-sim"><span><Check size={18}/> {c.showcase.approvalTitle}</span><span className="es-approval-muted">{c.showcase.approvalCaption}</span></div><Illustration source={c.media.access} alt="Original illustration representing music approval and archive access"/><p>{c.features.accessDescription}</p></article>
    </div>
   </section>
   <section id="about" className="es-section es-about"><div><span className="es-section-number">{c.about.eyebrow}</span><h2>{c.about.heading1}<br/><span>{c.about.heading2}</span></h2><Illustration source={c.media.about} alt="Original illustration celebrating the orchestra" className="es-about-illustration"/></div><div className="es-about-right es-scroll-reveal"><p>{c.about.description}</p><Link href="/dashboard" className="es-button es-button-red">{c.about.cta}<ArrowRight size={18}/></Link><span className="es-small-note">Frontend demonstration — not yet a live member archive.</span></div></section>
  </main>
  <footer className="es-footer"><Link href="/" className="es-brand"><span className="es-brand-icon"><Music2 size={20}/></span><span>{c.brand.slice(0,-5).toUpperCase()}<span>{c.brand.slice(-5).toUpperCase()}</span></span></Link><span>{c.footer.caption}</span><div><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link><Link href="/login">Member login</Link><Link href="/admin/eaglescorelogin">Admin</Link></div></footer>
 </div>;
}
