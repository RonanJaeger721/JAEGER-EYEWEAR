// Local-only, temporary integration fixtures. Restores the catalogue and settings.
import nextEnv from '@next/env';
const {loadEnvConfig}=nextEnv;
loadEnvConfig(process.cwd());
import assert from 'node:assert/strict';
import {randomBytes,randomUUID} from 'node:crypto';
import {readFile} from 'node:fs/promises';
import {mutate,readState} from '../lib/db';
import {hashPassword} from '../lib/password';
const base=process.env.QA_URL||'http://localhost:3002';
if(!/^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(base)||process.env.VERCEL||process.env.DATABASE_URL)throw new Error('QA fixtures are restricted to local SQLite.');
const before=await readState();const suffix=randomUUID().slice(0,8),password=randomBytes(24).toString('base64url');
const qaEmail=`qa-${suffix}@example.test`,adminEmail=`qa-admin-${suffix}@example.test`,editorEmail=`qa-editor-${suffix}@example.test`;
await mutate(s=>{for(const [email,role] of [[adminEmail,'admin'],[editorEmail,'editor']] as const)s.users.push({id:randomUUID(),name:'Local QA',email,password:hashPassword(password),role,disabled:false});});
class Client {cookies=new Map<string,string>();async call(path:string,body?:unknown,form=false){const r=await fetch(base+path,{redirect:'manual',method:body===undefined?'GET':'POST',headers:{Origin:base,Cookie:[...this.cookies].map(([k,v])=>k+'='+v).join('; '),...(body!==undefined?{'Content-Type':form?'application/x-www-form-urlencoded':'application/json'}:{})},body:body===undefined?undefined:form?new URLSearchParams(body as Record<string,string>):JSON.stringify(body)});for(const value of r.headers.getSetCookie()){const pair=value.split(';')[0],i=pair.indexOf('=');this.cookies.set(pair.slice(0,i),pair.slice(i+1));}const text=await r.text();let data;try{data=JSON.parse(text);}catch{data=text;}return {status:r.status,data};}async login(email:string){const csrf=await this.call('/api/auth/csrf');const r=await this.call('/api/auth/callback/credentials',{email,password,csrfToken:csrf.data.csrfToken,callbackUrl:base+'/account'},true);assert.equal(r.status,302);assert.equal((await this.call('/api/store/me')).status,200);}}
let checks=0;const ok=(message:string)=>{checks++;console.log('PASS '+message);};
try{
 const guest=new Client(),customer=new Client(),admin=new Client(),editor=new Client();
 assert.equal((await guest.call('/api/store/admin')).status,401);assert.equal((await guest.call('/api/store/admin/settings',before.settings)).status,401);ok('Unauthenticated read and mutation denied');
 assert.equal((await customer.call('/api/store/register',{name:'QA customer',email:qaEmail,password})).status,200);await customer.login(qaEmail);await admin.login(adminEmail);await editor.login(editorEmail);ok('Registration and Auth.js signed sessions work');
 assert.equal((await customer.call('/api/store/admin')).status,403);assert.equal((await customer.call('/api/store/admin/product',before.products[0])).status,403);assert.equal((await editor.call('/api/store/admin/settings',before.settings)).status,403);ok('Customer and editor role boundaries enforced');
 const fixture=structuredClone(before.products[0]);fixture.id='qa-'+suffix;fixture.slug=fixture.id;fixture.name='LOCAL QA TEST FRAME — NOT INVENTORY';fixture.concept=false;fixture.verified=true;fixture.variants=[{...fixture.variants[0],id:'qa-variant-'+suffix,price:4500,stock:3,images:['/media/founder.webp']}];
 const bad=await admin.call('/api/store/admin/product',{...fixture,variants:[{...fixture.variants[0],stock:-5}]});assert.equal(bad.status,400);assert.equal((await admin.call('/api/store/admin/product',fixture)).status,200);ok('Admin product validation and persistence');
 const settings={...before.settings,launchApproved:true,manualOrdersEnabled:true,delivery:[{id:'qa',name:'LOCAL QA TEST DELIVERY',price:500,enabled:true}]};assert.equal((await admin.call('/api/store/admin/settings',settings)).status,200);ok('Admin content and delivery rules persist');
 const orderInput={key:randomUUID(),lines:[{productId:fixture.id,variantId:fixture.variants[0].id,quantity:2}],name:'QA customer',email:qaEmail,phone:'0000000000',address:'LOCAL QA TEST — no delivery',delivery:'qa',payment:'paid',total:1};
 const placed=await customer.call('/api/store/orders',orderInput);assert.equal(placed.status,200);assert.equal(placed.data.order.payment,'pending_payment');assert.equal(placed.data.order.total,9500);const id=placed.data.order.id;assert.equal((await customer.call('/api/store/orders',orderInput)).data.order.id,id);ok('Order saves once, server totals override client and payment stays pending');
 const oversell=await customer.call('/api/store/orders',{...orderInput,key:randomUUID()});assert.equal(oversell.status,400);ok('Inventory rejects overselling');
 assert.equal((await customer.call('/api/store/admin/order',{id,action:'verify',reference:'fake-123'})).status,403);assert.equal((await admin.call('/api/store/admin/order',{id,action:'verify',reference:'QA-only-receipt-'+suffix})).status,200);assert.equal((await admin.call('/api/store/admin/order',{id,action:'fulfil',fulfilment:'shipped'})).status,200);ok('Only admin verifies payment and fulfilment');
 assert.equal((await customer.call('/api/store/newsletter',{email:qaEmail,consent:true})).status,200);assert.equal((await customer.call('/api/store/unsubscribe',{})).status,200);assert.equal((await customer.call('/api/store/me')).data.subscribed,false);ok('Newsletter consent and unsubscribe saved');
 assert.equal((await guest.call('/api/store/contact',{email:qaEmail,name:'QA Test',message:'Local integration test enquiry; do not respond.'})).status,200);ok('Contact enquiries persist for admin');
 const file=new FormData();file.set('file',new Blob([await readFile('public/media/founder.webp')],{type:'image/webp'}),'qa.webp');const upload=await fetch(base+'/api/upload',{method:'POST',headers:{Origin:base,Cookie:[...admin.cookies].map(([k,v])=>k+'='+v).join('; ')},body:file});assert.equal(upload.status,200);const media=await upload.json();assert.match(media.url,/^\/uploads\//);assert.equal((await fetch(base+media.url)).status,200);ok('Authenticated image upload returns a working image URL');
 const forbidden=await fetch(base+'/api/store/contact',{method:'POST',headers:{Origin:'https://untrusted.invalid','Content-Type':'application/json'},body:JSON.stringify({})});assert.equal(forbidden.status,403);assert.equal((await guest.call('/api/payments/webhook',{payment:'paid'})).status,503);ok('Cross-origin writes and unconfigured payment webhooks fail closed');
 console.log(`${checks} integration checks passed.`);
}finally{
 await mutate(s=>{s.products=before.products;s.settings=before.settings;s.collections=before.collections;s.users=s.users.filter(u=>![qaEmail,adminEmail,editorEmail].includes(u.email));s.orders=s.orders.filter(o=>o.email!==qaEmail);s.messages=s.messages.filter(m=>m.email!==qaEmail);s.subscribers=s.subscribers.filter(x=>x.email!==qaEmail);s.audit=s.audit.filter(a=>![qaEmail,adminEmail,editorEmail].includes(a.actor));for(const k of Object.keys(s.attempts))if(k.includes(suffix))delete s.attempts[k];});
 console.log('Temporary QA accounts, orders, products and enquiries removed.');
}

