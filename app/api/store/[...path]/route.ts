import { NextRequest,NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/auth';
import { readState,mutate,storageReady } from '@/lib/db';
import { hashPassword } from '@/lib/password';
import { createOrder,releaseExpired,verifyManualPayment } from '@/lib/commerce';
import { productSchema,collectionSchema,settingsSchema,orderSchema } from '@/lib/validation';
import { randomUUID } from 'node:crypto';
import type { State } from '@/lib/types';
export const runtime='nodejs';
export const dynamic='force-dynamic';
function cleanOrder(o:State['orders'][number]){const {key,...rest}=o;void key;return rest;}
export async function GET(req:NextRequest,{params}:{params:Promise<{path:string[]}>}){
  const route=(await params).path.join('/');
  try{
    const state=await readState();
    if(route==='catalog') return NextResponse.json({products:state.products.filter(p=>!p.archived),collections:state.collections.sort((a,b)=>a.order-b.order),settings:state.settings,storageReady:storageReady(),orderingOpen:storageReady()&&state.settings.launchApproved&&state.settings.manualOrdersEnabled});
    const session=process.env.AUTH_SECRET?await auth():null;const user=state.users.find(u=>u.id===session?.user?.id&&!u.disabled);
    if(!user)return NextResponse.json({error:'Please sign in.'},{status:401});
    if(route==='me')return NextResponse.json({user:{id:user.id,name:user.name,email:user.email,role:user.role},orders:state.orders.filter(o=>o.userId===user.id).map(cleanOrder),subscribed:state.subscribers.some(s=>s.email===user.email&&s.active)});
    if(route==='admin'&&(user.role==='admin'||user.role==='editor'))return NextResponse.json({products:state.products,collections:state.collections,settings:state.settings,orders:user.role==='admin'?state.orders.map(cleanOrder):[],customers:user.role==='admin'?state.users.map(({password,...u})=>{void password;return u;}):[],subscribers:user.role==='admin'?state.subscribers:[],messages:user.role==='admin'?state.messages:[],audit:state.audit,role:user.role,storageReady:storageReady()});
    return NextResponse.json({error:'Access denied.'},{status:403});
  }catch{return NextResponse.json({error:'The store is temporarily unavailable. Please try again.'},{status:503});}
}
export async function POST(req:NextRequest,{params}:{params:Promise<{path:string[]}>}){
  const route=(await params).path.join('/');
  try{
    const origin=req.headers.get('origin');if(!origin||new URL(origin).host!==req.headers.get('host'))return NextResponse.json({error:'Invalid request origin.'},{status:403});
    if(!storageReady())return NextResponse.json({error:'This preview is read-only until persistent storage is connected.'},{status:503});
    if(Number(req.headers.get('content-length')||0)>100000)return NextResponse.json({error:'Request too large.'},{status:413});
    const raw=await req.text();if(raw.length>100000)throw new Error('Request too large.');const body=JSON.parse(raw);
    if(route==='register'){
      const input=z.object({name:z.string().trim().min(2).max(100),email:z.email().max(254).transform(v=>v.toLowerCase()),password:z.string().min(12).max(128)}).parse(body);
      const result=await mutate(s=>{const recent=s.attempts['register'];if(recent&&recent.until>Date.now()&&recent.count>=10)throw new Error('Registration limit reached. Please try later.');s.attempts['register']={count:recent&&recent.until>Date.now()?recent.count+1:1,until:Date.now()+3600000};if(s.users.some(u=>u.email===input.email))throw new Error('Unable to create this account. Try signing in.');s.users.push({...input,id:randomUUID(),password:hashPassword(input.password),role:'customer',disabled:false});return {ok:true};});return NextResponse.json(result);
    }
    if(route==='newsletter'){
      const input=z.object({email:z.email().max(254).transform(v=>v.toLowerCase()),consent:z.literal(true)}).parse(body);await mutate(s=>{const existing=s.subscribers.find(x=>x.email===input.email);if(existing){existing.active=true;existing.consentAt=new Date().toISOString();}else s.subscribers.push({email:input.email,active:true,consentAt:new Date().toISOString()});});return NextResponse.json({ok:true,message:'You’re on the list. A different perspective is coming.'});
    }
    if(route==='contact'){
      const input=z.object({name:z.string().trim().min(2).max(100),email:z.email().max(254),message:z.string().trim().min(10).max(3000)}).parse(body);await mutate(s=>{if(s.messages.filter(m=>m.email===input.email&&Date.parse(m.createdAt)>Date.now()-3600000).length>=3)throw new Error('Your previous messages are saved. Please allow time for a reply.');s.messages.push({...input,id:randomUUID(),createdAt:new Date().toISOString()});});return NextResponse.json({ok:true,message:'Your enquiry is saved for the JAEGER team.'});
    }
    const session=process.env.AUTH_SECRET?await auth():null;const snapshot=await readState();const user=snapshot.users.find(u=>u.id===session?.user?.id&&!u.disabled);if(!user)return NextResponse.json({error:'Please sign in.'},{status:401});
    if(route==='orders') {const input=orderSchema.parse(body);const order=await mutate(s=>createOrder(s,{...input,userId:user.id,email:user.email},!!process.env.LOCAL_TEST_ORDERS&&!process.env.VERCEL));return NextResponse.json({order:cleanOrder(order)});}
    if(route==='unsubscribe'){await mutate(s=>{const sub=s.subscribers.find(x=>x.email===user.email);if(sub)sub.active=false;});return NextResponse.json({ok:true});}
    if(!route.startsWith('admin/')||!['admin','editor'].includes(user.role))return NextResponse.json({error:'Access denied.'},{status:403});
    if(user.role!=='admin'&&!['admin/product','admin/collection','admin/content'].includes(route))return NextResponse.json({error:'Administrator access required.'},{status:403});
    await mutate(s=>{
      const current=s.users.find(u=>u.id===user.id&&!u.disabled);if(!current||current.role!==user.role)throw new Error('Permissions changed. Sign in again.');
      releaseExpired(s);
      if(route==='admin/product'){const p=productSchema.parse(body);if(new Set(p.variants.map(v=>v.id)).size!==p.variants.length)throw new Error('Variant IDs must be unique.');if(!p.concept&&p.verified&&p.variants.some(v=>v.images.some(src=>src.endsWith('.svg'))))throw new Error('Replace concept illustrations with verified product photographs before selling.');if(s.products.some(x=>x.id!==p.id&&x.slug===p.slug))throw new Error('Product slug already exists.');const i=s.products.findIndex(x=>x.id===p.id);if(i<0)s.products.push(p);else s.products[i]=p;}
      else if(route==='admin/collection'){const c=collectionSchema.parse(body);if(c.products.some(id=>!s.products.some(p=>p.id===id)))throw new Error('Collection contains an unknown product.');const i=s.collections.findIndex(x=>x.id===c.id);if(i<0)s.collections.push(c);else s.collections[i]=c;}
      else if(route==='admin/settings'||route==='admin/content'){const v=settingsSchema.parse(body);if(user.role==='editor'){s.settings={...s.settings,announcement:v.announcement,heroTitle:v.heroTitle,heroCopy:v.heroCopy,heroImage:v.heroImage,campaignImage:v.campaignImage,faqs:v.faqs};}else s.settings=v;}
      else if(route==='admin/order') {const v=z.object({id:z.uuid(),action:z.enum(['verify','fulfil','cancel']),reference:z.string().max(200).optional(),fulfilment:z.enum(['processing','shipped','delivered']).optional()}).parse(body);const o=s.orders.find(o=>o.id===v.id);if(!o)throw new Error('Order not found.');if(v.action==='verify')verifyManualPayment(s,v.id,v.reference||'',user.email);if(v.action==='fulfil'){if(o.payment!=='paid')throw new Error('Verify payment before fulfilment.');o.fulfilment=v.fulfilment||'processing';o.history.push({at:new Date().toISOString(),message:`Fulfilment: ${o.fulfilment}`});}if(v.action==='cancel'){if(o.payment!=='pending_payment')throw new Error('Only pending orders can be cancelled here.');o.payment='cancelled';for(const l of o.items){const variant=s.products.find(p=>p.id===l.productId)?.variants.find(v=>v.id===l.variantId);if(variant)variant.stock+=l.quantity;}o.history.push({at:new Date().toISOString(),message:'Cancelled; reserved inventory released.'});}}
      else if(route==='admin/subscriber'){const v=z.object({email:z.email(),active:z.literal(false)}).parse(body);const sub=s.subscribers.find(x=>x.email===v.email);if(sub)sub.active=false;}
      else throw new Error('Unknown management operation.');
      s.audit.push({at:new Date().toISOString(),actor:user.email,message:route});
    });return NextResponse.json({ok:true});
  }catch(e){if(e instanceof z.ZodError)return NextResponse.json({error:e.issues.map(i=>`${i.path.join('.')}: ${i.message}`).join('; ')},{status:400});return NextResponse.json({error:e instanceof Error?e.message:'Unable to save. Please try again.'},{status:400});}
}

