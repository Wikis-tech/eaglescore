import type {Metadata} from "next";
import "./globals.css";
import "@/components/landing.css";
import {LandingContentProvider} from "@/components/landing-content-provider";
import {PwaRegister} from "@/components/pwa-register";
export const metadata:Metadata={title:"EagleScore | MFM Eagle Orchestra",description:"Secure digital music library for MFM Lagos Region One Eagle Orchestra",applicationName:"EagleScore"};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body><LandingContentProvider><PwaRegister/>{children}</LandingContentProvider></body></html>}
