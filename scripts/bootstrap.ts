import nextEnv from '@next/env';
const {loadEnvConfig}=nextEnv;
loadEnvConfig(process.cwd());
const {mutate}=await import('../lib/db');
const {hashPassword}=await import('../lib/password');
const {randomUUID}=await import('node:crypto');
const email=process.env.ADMIN_EMAIL?.trim().toLowerCase(),password=process.env.ADMIN_PASSWORD;
if(!email||!password||password.length<16)throw new Error('Set ADMIN_EMAIL and an ADMIN_PASSWORD of at least 16 characters in your local environment.');
await mutate(s=>{if(s.users.some(u=>u.email===email))throw new Error('This account exists. Bootstrap does not overwrite users.');s.users.push({id:randomUUID(),name:process.env.ADMIN_NAME||'Store owner',email,password:hashPassword(password),role:'admin',disabled:false});s.audit.push({at:new Date().toISOString(),actor:'bootstrap',message:'Initial administrator created.'});});
console.log('Administrator created. Credentials were not printed.');
process.exit(0);

