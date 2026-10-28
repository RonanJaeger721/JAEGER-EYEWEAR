import type {Metadata} from 'next';
import {readState,storageReady} from '@/lib/db';
import {StoreProvider} from '@/components/store-provider';
import {Header,Footer} from '@/components/shell';
import './globals.css';
export const dynamic='force-dynamic';
export const metadata:Metadata={metadataBase:new URL(process.env.NEXT_PUBLIC_SITE_URL||'https://jaeger-eyewear.vercel.app'),title:{default:'JAEGER EYEWEAR — A Different Perspective.',template:'%s | JAEGER EYEWEAR'},description:'An individual point of view. Discover the proposed first collection of JAEGER EYEWEAR. A pre-launch exploration of contemporary silhouettes.',robots:{index:false,follow:false},openGraph:{title:'JAEGER EYEWEAR — A Different Perspective.',description:'Collection 001. A study in form and individuality. Pre-launch concept preview.',images:[{url:'/media/campaign.webp',width:1536,height:1024}]},twitter:{card:'summary_large_image'}};
export default async function RootLayout({children}:{children:React.ReactNode}){const state=await readState();const ready=storageReady();return <html lang="en"><body><StoreProvider catalog={{products:state.products.filter(p=>!p.archived),collections:state.collections.sort((a,b)=>a.order-b.order),settings:state.settings,storageReady:ready,orderingOpen:ready&&state.settings.launchApproved&&state.settings.manualOrdersEnabled}}><Header/><main id="main">{children}</main><Footer/></StoreProvider></body></html>;}
