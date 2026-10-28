'use client';
export default function ErrorPage({reset}:{reset:()=>void}){return <section className="section empty"><span className="eyebrow">A MOMENT TO REFOCUS</span><h1>Let’s try that again.</h1><p>We couldn’t complete this request.</p><button className="button" onClick={reset}>Try again</button></section>;}
