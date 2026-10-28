import postgres from 'postgres';
import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { initialState } from './seed';
import { releaseExpired } from './commerce';
import type { State } from './types';

let pg: ReturnType<typeof postgres> | undefined;
let sqlite: import('node:sqlite').DatabaseSync | undefined;
export const storageReady = () => !!process.env.DATABASE_URL || !process.env.VERCEL;
function local() {
  if (!sqlite) {
    // Local-only persistent SQLite. Never use an ephemeral Vercel filesystem for orders.

    const dir = process.env.LOCAL_DATA_DIR || path.join(process.cwd(), '.data');
    mkdirSync(dir,{recursive:true}); sqlite = new DatabaseSync(path.join(dir,'store.sqlite'));
    sqlite.exec('PRAGMA journal_mode=WAL; CREATE TABLE IF NOT EXISTS store (id INTEGER PRIMARY KEY, data TEXT NOT NULL)');
    sqlite.prepare('INSERT OR IGNORE INTO store (id,data) VALUES (1,?)').run(JSON.stringify(initialState()));
  }
  return sqlite;
}
async function remote() {
  if(!pg) pg=postgres(process.env.DATABASE_URL!,{max:3,prepare:false,ssl:process.env.PGSSL==='disable'?false:'require'});
  await pg`CREATE TABLE IF NOT EXISTS jaeger_store (id INTEGER PRIMARY KEY, data JSONB NOT NULL)`;
  await pg`INSERT INTO jaeger_store (id,data) VALUES (1,${JSON.stringify(initialState())}::jsonb) ON CONFLICT (id) DO NOTHING`;
  return pg;
}
export async function readState(): Promise<State> {
  if(process.env.DATABASE_URL){const sql=await remote();const rows=await sql`SELECT data FROM jaeger_store WHERE id=1`;const state=rows[0].data as State;if(state.orders.some(o=>o.payment==='pending_payment'&&Date.parse(o.reservationUntil)<Date.now()))return mutate(s=>{releaseExpired(s);return s;});return state;}
  if(process.env.VERCEL) return initialState();
  const state=JSON.parse((local().prepare('SELECT data FROM store WHERE id=1').get() as {data:string}).data) as State;
  if(state.orders.some(o=>o.payment==='pending_payment'&&Date.parse(o.reservationUntil)<Date.now()))return mutate(s=>{releaseExpired(s);return s;});
  return state;
}
export async function mutate<T>(fn:(state:State)=>T):Promise<T>{
  if(!storageReady())throw new Error('Persistent storage is not connected. This preview cannot save data.');
  if(process.env.DATABASE_URL){const sql=await remote();return await sql.begin(async tx=>{const rows=await tx`SELECT data FROM jaeger_store WHERE id=1 FOR UPDATE`;const state=rows[0].data as State;const result=fn(state);await tx`UPDATE jaeger_store SET data=${JSON.stringify(state)}::jsonb WHERE id=1`;return result;}) as T;}
  const db=local();db.exec('BEGIN IMMEDIATE');try{const s=JSON.parse((db.prepare('SELECT data FROM store WHERE id=1').get() as {data:string}).data) as State;const result=fn(s);db.prepare('UPDATE store SET data=? WHERE id=1').run(JSON.stringify(s));db.exec('COMMIT');return result;}catch(e){db.exec('ROLLBACK');throw e;}
}

