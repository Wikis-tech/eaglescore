"use client";
import {createBrowserClient} from "@supabase/ssr";
import {browserConfig} from "./config";
export function createClient(){const {url,key}=browserConfig();return createBrowserClient(url,key)}
