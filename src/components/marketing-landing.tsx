"use client";
import Link from "next/link";
import {useState} from "react";
import {ArrowRight,BookOpen,Check,ChevronDown,FileMusic,FolderOpen,Menu,Music2,Play,Search,ShieldCheck,UploadCloud,X} from "lucide-react";
import "./landing.css";

const scoreCards=[
 {name:"AMAZING GRACE",type:"HYMN / VIOLIN",code:"ES · 024",tone:"lavender",notes:["G4","B4","D5","B4"],rotation:"-9deg"},
 {name:"FAITHFULNESS",type:"HYMN / PIANO",code:"ES · 018",tone:"cream",notes:["C4","E4","G4","E4"],rotation:"7deg"},
 {name:"PRAISE MEDLEY",type:"PRAISE / FULL SCORE",code:"ES · 041",tone:"red",notes:["A4","C5","E5","C5"],rotation:"-5deg"},
 {name:"SUNDAY PRELUDE",type:"WORSHIP / CLARINET",code:"ES · 056",tone:"dark",notes:["D4","F4","A4","F4"],rotation:"9deg"}
];
const process=[{icon:UploadCloud,title:"UPLOAD",description:"Add a scan, PDF or a drafted music score."},{icon:ShieldCheck,title:"REVIEW",description:"The authorised admin checks every submission."},{icon:Search,title:"FIND",description:"Search approved music by title or instrument."},{icon:BookOpen,title:"PLAY",description:"Open your part on any screen, ready for rehearsal."}];
function ScoreTile({card,index}:{card:typeof scoreCards[number];index:number}){return <div className={"es-art-card es-art-"+card.tone} style={{"--tilt":card.rotation,"--order":String(index)} as React.CSSProperties} aria-hidden="true"><div className="es-art-top"><span> E / S </span><span>{card.code}</span></div><div className="es-art-title">{card.name}</div><div className="es-art-rule"/><svg viewBox="0 0 236 98" className="es-art-staff" role="img" aria-label="Decorative music notation"><g stroke="currentColor" strokeWidth="1" opacity=".53">{[28,38,48,58,68].map(y=><line key={y} x1="1" x2="235" y1={y} y2={y}/>)}</g><text x="8" y="70" fontSize="46" fill="currentColor">𝄞</text>{[0,1,2,3].map((v)=><g key={v} transform={`translate(${76+v*38} ${53-((v+index)%3)*9})`} fill="currentColor" stroke="currentColor"><ellipse cx="0" cy="0" rx="7" ry="4" transform="rotate(-23)"/><line x1="6" y1="-1" x2="6" y2="-30" strokeWidth="1.6"/></g>)}</svg><div className="es-art-bottom"><span>{card.type}</span><Music2 size={14}/></div></div>}
export default function MarketingLanding(){
 const [open,setOpen]=useState(false);const [playing,setPlaying]=useState(true);
 return <div className="es-landing">
  <a className="es-skip" href="#main">Skip to content</a>
  <header className="es-site-header">
   <nav className="es-nav" aria-label="Main navigation">
    <Link href="/" className="es-brand" aria-label="EagleScore home"><span className="es-brand-icon"><Music2 size={24} strokeWidth={2.5}/></span><span>EAGLE<span>SCORE</span><small>THE ORCHESTRA LIBRARY</small></span></Link>
    <div className={"es-menu "+(open?"is-open":"")} id="landing-navigation">
      <a href="#how-it-works" onClick={()=>setOpen(false)}>How it works</a>
      <a href="#features" onClick={()=>setOpen(false)}>Features</a>
      <a href="#about" onClick={()=>setOpen(false)}>Our orchestra</a>
      <Link href="/library" onClick={()=>setOpen(false)}>Explore demo</Link>
    </div>
    <div className="es-nav-actions"><Link href="/login" className="es-login">Member login</Link><Link href="/dashboard" className="es-button es-button-light">Open library <ArrowRight size={16}/></Link></div>
    <button type="button" className="es-mobile-toggle" aria-label={open?"Close menu":"Open menu"} aria-expanded={open} aria-controls="landing-navigation" onClick={()=>setOpen(v=>!v)}>{open?<X size={23}/>:<Menu size={23}/>}</button>
   </nav>
  </header>
  <main id="main">
   <section className="es-hero" aria-labelledby="hero-heading">
    <div className="es-ambient es-ambient-one"/><div className="es-ambient es-ambient-two"/>
    <div className="es-hero-text">
      <span className="es-kicker"><span className="es-kicker-dot"/> MFM LAGOS REGION ONE · EAGLE ORCHESTRA</span>
      <h1 id="hero-heading">EVERY SCORE.<br/><span>ONE HOME.</span><br/><em>ALWAYS READY.</em></h1>
      <p>No more missing hymn sheets. Discover, organise and read your orchestra&apos;s approved scores — anywhere, on any device.</p>
      <div className="es-hero-actions"><Link href="/dashboard" className="es-button es-button-red">Enter the library <ArrowRight size={19}/></Link><a href="#how-it-works" className="es-text-link">See how it works <ChevronDown size={18}/></a></div>
      <div className="es-hero-foot"><span className="es-foot-line"/><span>A DIGITAL HOME FOR EVERY PART OF THE PERFORMANCE</span></div>
    </div>
    <div className={"es-visual "+(playing?"es-visual-playing":"es-visual-paused")} aria-label="Decorative animated collage of fictional orchestra score covers">
      <div className="es-visual-grid" aria-hidden="true">{[...scoreCards,...scoreCards].map((card,i)=><ScoreTile key={i} card={card} index={i}/>)}</div>
      <div className="es-visual-shade"/>
      <div className="es-floating-label"><span className="es-pulse"/> THE MUSIC STAYS WITH YOU</div>
      <button type="button" className="es-motion-toggle" onClick={()=>setPlaying(v=>!v)} aria-label={playing?"Pause visual animation":"Play visual animation"}><Play size={14} fill="currentColor" style={{display:playing?"none":"block"}}/><span>{playing?"Ⅱ":""}</span></button>
    </div>
   </section>
   <section className="es-ticker" aria-label="Supported music formats"><div>PDF SCORES <span>✦</span> INSTRUMENT PARTS <span>✦</span> HYMNS <span>✦</span> MUSICXML PLANNED <span>✦</span> DIGITAL ARCHIVE <span>✦</span> REHEARSAL COLLECTIONS</div></section>
   <section id="how-it-works" className="es-section es-section-light"><div className="es-section-intro"><span className="es-section-number">01 / THE WORKFLOW</span><h2>FROM PAPER<br/>TO <span>PERFORMANCE.</span></h2><p>Your orchestra&apos;s music, organised in a few simple steps. Every submission is reviewed before it becomes part of the official collection.</p></div><div className="es-process-grid">{process.map(({icon:Icon,title,description},i)=><article key={title} className="es-process-card"><div className="es-process-top"><span>0{i+1}</span><Icon size={26}/></div><h3>{title}</h3><p>{description}</p></article>)}</div></section>
   <section id="features" className="es-section es-section-dark"><div className="es-section-intro"><span className="es-section-number">02 / MADE FOR MUSICIANS</span><h2>YOUR MUSIC.<br/><span>IN SYNC.</span></h2><p>Find the right music and the right part, whether you&apos;re rehearsing from a phone, tablet or laptop.</p></div><div className="es-feature-grid"><div className="es-feature-card es-feature-main"><div className="es-feature-overline"><Search size={16}/> SEARCH THAT MAKES SENSE</div><h3>Find an old hymn<br/>in seconds.</h3><div className="es-search-demo"><Search size={22}/><span>Amazing Grace</span><span className="es-search-shortcut">↵</span></div><div className="es-search-results"><div><FileMusic size={18}/><strong>Amazing Grace</strong><span>VIOLIN · HYMNS</span></div><div><FileMusic size={18}/><strong>Great Is Thy Faithfulness</strong><span>PIANO · HYMNS</span></div></div><p className="es-small-note">Illustrative search interface · Sample music only</p></div><div className="es-feature-card es-feature-secondary"><span className="es-feature-overline"><FolderOpen size={16}/> ALL YOUR PARTS</span><h3>One score.<br/>Many instruments.</h3><div className="es-part-grid"><span>VIOLIN</span><span>CLARINET</span><span>PIANO</span><span>GUITAR</span><span>RECORDER</span><span>FULL SCORE</span></div><p>Choose your instrument and focus on the music you need.</p></div><div className="es-feature-card es-feature-secondary"><span className="es-feature-overline"><ShieldCheck size={16}/> CONTROLLED SHARING</span><h3>Approved first.<br/>Accessible after.</h3><div className="es-approval-sim"><span><Check size={18}/> Approved library</span><span className="es-approval-muted">Admin-reviewed submissions</span></div><p>Admin-reviewed access, version history and permission-aware downloads are part of the product plan.</p></div></div></section>
   <section id="about" className="es-section es-about"><div><span className="es-section-number">03 / BUILT FOR EAGLE ORCHESTRA</span><h2>LET THE MUSIC<br/><span>LIVE ON.</span></h2></div><div className="es-about-right"><p>Scores from yesterday should be ready for tomorrow. EagleScore brings continuity to the MFM Lagos Region One Eagle Orchestra — preserving arrangements, making rehearsals smoother and keeping every musician connected to the music.</p><Link href="/dashboard" className="es-button es-button-red">Explore EagleScore <ArrowRight size={18}/></Link><span className="es-small-note">Frontend demonstration — not yet a live member archive.</span></div></section>
  </main>
  <footer className="es-footer"><Link href="/" className="es-brand"><span className="es-brand-icon"><Music2 size={20}/></span><span>EAGLE<span>SCORE</span></span></Link><span>AN EAGLE ORCHESTRA DIGITAL LIBRARY CONCEPT</span><div><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link><Link href="/login">Member login</Link></div></footer>
 </div>
}
