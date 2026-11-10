"use client";
import Link from "next/link";
import Image from "next/image";
import {useEffect,useState} from "react";
import {useRouter} from "next/navigation";
import {createClient} from "@/lib/supabase/client";
import {configured} from "@/lib/supabase/config";
function Frame({title,children}:{title:string;children:React.ReactNode}){return <main className="card" style={{maxWidth:490,margin:"7vh auto",padding:32}}><Link href="/" className="logo" style={{color:"#552277"}}>Eagle<span>Score</span></Link><h1 style={{fontSize:29,marginTop:30}}>{title}</h1>{children}</main>}
export function LoginForm({admin=false}:{admin?:boolean}){
 const router=useRouter();const[email,setEmail]=useState("");const[password,setPassword]=useState("");const[error,setError]=useState("");const[busy,setBusy]=useState(false);
 async function login(e:React.FormEvent){e.preventDefault();setBusy(true);setError("");try{const db=createClient();const {error:e}=await db.auth.signInWithPassword({email,password});if(e){setError(e.message);return}const response=await fetch("/api/me",{cache:"no-store"});const who=await response.json().catch(()=>null);if(!who?.role){setError("Please verify your email before signing in. If you have already confirmed, contact support.");return}if(admin&&who.role!=="super_admin"){setError("This account does not have administrator permission.");return}router.replace(admin?"/admin/dashboard":"/dashboard");router.refresh()}catch{setError("Sign-in is not available. Check EagleScore configuration.")}finally{setBusy(false)}}
 async function reset(){if(!email){setError("Enter your email first.");return}setBusy(true);try{const db=createClient();const redirectTo=window.location.origin+"/auth/confirm?next=/auth/set-password";const {error:e}=await db.auth.resetPasswordForEmail(email,{redirectTo});setError(e?e.message:"If an account exists, password recovery instructions have been sent.")}catch{setError("Recovery service is unavailable.")}finally{setBusy(false)}}
 return <Frame title={admin?"Admin sign-in":"Member sign-in"}><p className="muted">Members can register with email verification. The administrator area requires separate privileges and MFA.</p>{!configured()?<p className="notice error">Supabase connection is not configured for EagleScore. Authentication is unavailable.</p>:<form onSubmit={login} className="stack"><label className="field">Email<input className="input" type="email" autoComplete="email" required value={email} onChange={e=>setEmail(e.target.value)}/></label><label className="field">Password<input className="input" type="password" autoComplete="current-password" required value={password} onChange={e=>setPassword(e.target.value)}/></label><button className="btn primary" type="submit" disabled={busy}>{busy?"Signing in…":"Sign in"}</button><button className="btn" type="button" onClick={reset} disabled={busy}>Forgot password?</button>{!admin&&<Link className="btn" href="/signup">Create an account</Link>}{error&&<p role="status" className="notice">{error}</p>}</form>}</Frame>
}
export function PasswordSetup(){
 const router=useRouter();const[password,setPassword]=useState("");const[error,setError]=useState("");const[busy,setBusy]=useState(false);
 const submit=async(e:React.FormEvent)=>{e.preventDefault();if(password.length<12){setError("Choose at least 12 characters.");return}setBusy(true);try{const db=createClient();const {error:e}=await db.auth.updateUser({password});if(e)setError(e.message);else{router.push("/dashboard");router.refresh()}}catch{setError("Unable to set the password.")}finally{setBusy(false)}};
 return <Frame title="Set your password"><p className="muted">After following your invitation or recovery email link, choose a strong password.</p><form className="stack" onSubmit={submit}><label className="field">New password<input className="input" type="password" required minLength={12} autoComplete="new-password" value={password} onChange={e=>setPassword(e.target.value)}/></label><button className="btn primary" disabled={busy}>Save password</button>{error&&<p role="alert" className="notice error">{error}</p>}</form></Frame>
}
export function MfaForm({email}:{email:string}){
 const router=useRouter();const[factor,setFactor]=useState("");const[code,setCode]=useState("");const[message,setMessage]=useState("");const[qr,setQr]=useState("");const[loading,setLoading]=useState(false);
 useEffect(()=>{if(!configured())return;let cancelled=false;const timer=setTimeout(async()=>{const db=createClient();const{data}=await db.auth.mfa.listFactors();if(!cancelled&&data?.totp?.[0])setFactor(data.totp[0].id)},0);return()=>{cancelled=true;clearTimeout(timer)}},[]);
 const enroll=async()=>{setLoading(true);try{const db=createClient();const{data,error}=await db.auth.mfa.enroll({factorType:"totp",friendlyName:"EagleScore Admin"});if(error)throw error;setFactor(data.id);setQr(data.totp.qr_code)}catch(e){setMessage(e instanceof Error?e.message:"Cannot enrol MFA")}finally{setLoading(false)}};
 const verify=async(e:React.FormEvent)=>{e.preventDefault();setLoading(true);try{const db=createClient();const challenge=await db.auth.mfa.challenge({factorId:factor});if(challenge.error)throw challenge.error;const result=await db.auth.mfa.verify({factorId:factor,challengeId:challenge.data.id,code});if(result.error)throw result.error;router.replace("/admin/dashboard");router.refresh()}catch(e){setMessage(e instanceof Error?e.message:"Invalid MFA code")}finally{setLoading(false)}};
 return <Frame title="Admin verification"><p className="muted">{email} · A second factor is required for administrator access.</p>{!factor?<button className="btn primary" onClick={enroll} disabled={loading}>Set up authenticator</button>:<form className="stack" onSubmit={verify}>{qr&&<div className="notice"><p>Scan this private QR code using your authenticator app. Do not share it.</p><Image src={qr} alt="Private authenticator enrolment QR code" width={192} height={192} unoptimized/></div>}<label className="field">6-digit authenticator code<input className="input" inputMode="numeric" minLength={6} maxLength={6} required value={code} onChange={e=>setCode(e.target.value)}/></label><button className="btn primary" disabled={loading}>Verify MFA</button></form>}{message&&<p role="alert" className="notice error">{message}</p>}</Frame>
}

export function SignupForm(){
 const[name,setName]=useState("");
 const[email,setEmail]=useState("");
 const[password,setPassword]=useState("");
 const[confirm,setConfirm]=useState("");
 const[message,setMessage]=useState("");
 const[error,setError]=useState("");
 const[busy,setBusy]=useState(false);
 async function submit(e:React.FormEvent){
  e.preventDefault();setError("");setMessage("");
  if(password.length<12){setError("Choose a password of at least 12 characters.");return}
  if(password!==confirm){setError("Passwords do not match.");return}
  if(!configured()){setError("Registration is not configured.");return}
  setBusy(true);
  try{
   const db=createClient();
   const {error:signUpError}=await db.auth.signUp({
     email:email.trim().toLowerCase(),password,
     options:{data:{full_name:name.trim().slice(0,140)},
              emailRedirectTo:window.location.origin+"/auth/confirm?next=/dashboard"}
   });
   if(signUpError){setError(signUpError.message);return}
   setMessage("Check your inbox for a verification link. Your account cannot access the library until the email is confirmed.");
   setPassword("");setConfirm("");
  }catch{setError("Registration is currently unavailable. Please try again later.")}
  finally{setBusy(false)}
 }
 return <Frame title="Create your EagleScore account">
  <p className="muted">Create a member account with your own email address. Confirmation is required before login.</p>
  <form className="stack" onSubmit={submit}>
   <label className="field">Full name<input className="input" required maxLength={140} autoComplete="name" value={name} onChange={e=>setName(e.target.value)}/></label>
   <label className="field">Email<input className="input" required type="email" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)}/></label>
   <label className="field">Password<input className="input" required type="password" minLength={12} autoComplete="new-password" value={password} onChange={e=>setPassword(e.target.value)}/></label>
   <label className="field">Confirm password<input className="input" required type="password" minLength={12} autoComplete="new-password" value={confirm} onChange={e=>setConfirm(e.target.value)}/></label>
   <button className="btn primary" disabled={busy}>{busy?"Creating account…":"Create account"}</button>
   {message&&<p role="status" className="notice">{message}</p>}
   {error&&<p role="alert" className="notice error">{error}</p>}
  </form>
  <p className="muted">Already registered? <Link href="/login">Sign in</Link></p>
 </Frame>
}
