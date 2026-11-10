import type {Metadata} from "next";
import "./globals.css";import "@/components/landing.css";
import {DemoProvider} from "@/components/demo-provider";
import {LandingContentProvider} from "@/components/landing-content-provider";
import {PwaRegister} from "@/components/pwa-register";
export const metadata:Metadata={title:"EagleScore | MFM Eagle Orchestra",description:"Digital music library and score management prototype",applicationName:"EagleScore"};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body><DemoProvider><LandingContentProvider><PwaRegister/>{children}</LandingContentProvider></DemoProvider></body></html>}
