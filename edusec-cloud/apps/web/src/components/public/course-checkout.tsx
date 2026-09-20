"use client";
import { useState } from "react";

export function CourseCheckout({slug,price}:{slug:string;price:number}){
  const [open,setOpen]=useState(false); const [busy,setBusy]=useState(false); const [error,setError]=useState("");
  async function pay(e:React.FormEvent<HTMLFormElement>){
    e.preventDefault(); setBusy(true); setError("");
    const data=new FormData(e.currentTarget);
    try{
      const res=await fetch("/api/course-checkout",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({slug,name:data.get("name"),email:data.get("email"),phone:data.get("phone")})});
      const json=await res.json();
      if(!res.ok) throw new Error(json.error||"Unable to start payment");
      window.location.href=json.redirectUrl;
    }catch(err){setError(err instanceof Error?err.message:"Unable to start payment");setBusy(false);}
  }
  if(!open) return <button onClick={()=>setOpen(true)} className="rounded-full bg-accent px-7 py-3 font-black text-white">Buy course · {price} OMR / شراء الدورة</button>;
  return <form onSubmit={pay} className="mt-6 grid gap-3 rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm">
    <input name="name" required placeholder="Full name / الاسم الكامل" className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-accent"/>
    <input name="email" type="email" required placeholder="Email / البريد الإلكتروني" className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-accent"/>
    <input name="phone" placeholder="Phone / رقم الهاتف" className="rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-accent"/>
    {error&&<p className="text-sm font-bold text-red-600">{error}</p>}
    <button disabled={busy} className="rounded-xl bg-accent px-5 py-3 font-black text-white disabled:opacity-50">{busy?"Redirecting… / جارٍ التحويل":"Continue to secure payment / الانتقال للدفع الآمن"}</button>
  </form>;
}
