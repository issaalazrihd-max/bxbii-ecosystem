"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { operationsApi, OperationsData } from "@/lib/operations-api";

const MODULES = [
 {slug:"admissions",title:"Admissions & CRM",ar:"القبول وCRM",desc:"Leads, applications and follow-up pipeline.",icon:"◎",key:"crm"},
 {slug:"timetable",title:"Timetable",ar:"الجدول الدراسي",desc:"Sessions, rooms, trainers and weekly delivery.",icon:"▦",key:"sessions"},
 {slug:"attendance",title:"Attendance",ar:"الحضور والانصراف",desc:"Attendance, absences and excuse workflow.",icon:"✓",key:"attendance"},
 {slug:"exams",title:"Exams & Assessments",ar:"الاختبارات والتقييم",desc:"Assessments, scores, grades and progression.",icon:"▤",key:"assessments"},
 {slug:"certificates",title:"Certificates",ar:"الشهادات",desc:"Issuance, verification and certificate archive.",icon:"◇",key:"certificates"},
 {slug:"reports",title:"Reports & Analytics",ar:"التقارير والتحليلات",desc:"Executive KPIs across academic operations.",icon:"◫",key:"overview"},
 {slug:"settings",title:"System Settings",ar:"إعدادات النظام",desc:"Configuration, roles, numbering and integrations.",icon:"⚙",key:"overview"},
] as const;

export function OperationsCenter({active}:{active?:string}){
 const [data,setData]=useState<OperationsData>({rooms:[],sessions:[],attendance:[],assessments:[],certificates:[],crm:[]});
 const [loading,setLoading]=useState(true); const [error,setError]=useState("");
 useEffect(()=>{operationsApi.overview().then(setData).catch(e=>setError(e.message)).finally(()=>setLoading(false))},[]);
 const current=MODULES.find(x=>x.slug===active);
 if(current) return <ModuleView module={current} data={data} loading={loading} error={error}/>;
 return <Home data={data} loading={loading} error={error}/>;
}

function Home({data,loading,error}:{data:OperationsData;loading:boolean;error:string}){
 const cards=[
  ["Learners", "Students module", "/students"], ["Admissions & CRM", `${data.crm.length} activities`, "/operations/admissions"],
  ["Timetable", `${data.sessions.length} sessions`, "/operations/timetable"], ["Attendance", `${data.attendance.length} records`, "/operations/attendance"],
  ["Assessments", `${data.assessments.length} records`, "/operations/exams"], ["Certificates", `${data.certificates.length} issued`, "/operations/certificates"]
 ];
 return <div className="space-y-7" dir="ltr"><Header title="Institute Operations" sub="One workspace for admissions, academic delivery, attendance, assessment and certification."/><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{cards.map(([title,meta,href])=><Link key={href} href={href} className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-brand/30 hover:shadow-lg"><div className="text-lg font-black text-slate-950">{title}</div><div className="mt-2 text-sm text-slate-500">{meta}</div><div className="mt-5 text-xs font-bold text-brand">Open workspace →</div></Link>)}</div>{loading&&<Notice>Loading live operational data…</Notice>}{error&&<Notice>{error}</Notice>}<div className="grid gap-4 sm:grid-cols-3"><Kpi label="Rooms" value={data.rooms.length}/><Kpi label="Sessions" value={data.sessions.length}/><Kpi label="Certificates" value={data.certificates.length}/></div></div>
}

function ModuleView({module,data,loading,error}:{module:any;data:OperationsData;loading:boolean;error:string}){
 const rows=(data[module.key as keyof OperationsData]||[]) as any[];
 const columns=module.slug==="timetable"?["Date","Time","Topic","Status"]:module.slug==="attendance"?["Student","Session","Status","Excuse"]:module.slug==="exams"?["Assessment","Type","Score","Grade"]:module.slug==="certificates"?["Certificate","Title","Issue date","Status"]:["Reference","Type","Details","Status"];
 return <div className="space-y-6" dir="ltr"><Header title={module.title} sub={module.desc} ar={module.ar}/><div className="flex gap-2"><Link href="/operations" className="rounded-xl border bg-white px-4 py-2 text-sm font-bold text-slate-700">← All modules</Link><button className="rounded-xl bg-brand px-4 py-2 text-sm font-bold text-white">+ New record</button></div><div className="grid gap-4 sm:grid-cols-3"><Kpi label="Records" value={rows.length}/><Kpi label="Rooms" value={data.rooms.length}/><Kpi label="Today" value={rows.filter(x=>String(x.session_date||"").slice(0,10)===new Date().toISOString().slice(0,10)).length}/></div>{loading?<Notice>Loading live records…</Notice>:error?<Notice>{error}</Notice>:<div className="overflow-hidden rounded-2xl border bg-white shadow-sm"><div className="border-b p-5"><h2 className="font-black">Operational queue</h2><p className="mt-1 text-xs text-slate-400">Connected to the bxbii Cloud academic operations API.</p></div>{rows.length?<div className="overflow-x-auto"><table className="min-w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-400"><tr>{columns.map(c=><th key={c} className="px-5 py-3">{c}</th>)}</tr></thead><tbody className="divide-y">{rows.slice(0,100).map((x,i)=><tr key={x.id||i} className="hover:bg-slate-50">{columns.map((_,j)=><td key={j} className={`px-5 py-4 ${j===0?"font-semibold text-slate-800":"text-slate-500"}`}>{cell(module.slug,x,j)}</td>)}</tr>)}</tbody></table></div>:<div className="p-12 text-center text-sm text-slate-400">No records yet. Create the first record from this workspace.</div>}</div>}</div>
}
function cell(slug:any,x:any,j:number){if(slug==="timetable")return [x.session_date,`${x.start_time||""} – ${x.end_time||""}`,x.topic||"General session",x.status][j];if(slug==="attendance")return [x.student_id,x.session_id,x.status,x.excuse_status][j];if(slug==="exams")return [x.title,x.assessment_type,x.score==null?"Pending":`${x.score}/${x.max_score}`,x.grade||"—"][j];if(slug==="certificates")return [x.certificate_no,x.title_en,x.issue_date,x.status][j];return [x.id,x.activity_type||"—",x.subject||x.details||"—",x.status||"—"][j]}
function Header({title,sub,ar}:{title:string;sub:string;ar?:string}){return <div><div className="text-xs font-bold uppercase tracking-[.18em] text-brand">bxbii Cloud</div><h1 className="mt-1 text-3xl font-black tracking-tight text-slate-950">{title}</h1><p className="mt-2 max-w-2xl text-sm text-slate-500">{sub}</p>{ar&&<p className="mt-1 text-sm font-semibold text-slate-700" dir="rtl">{ar}</p>}</div>}
function Kpi({label,value}:{label:string;value:number}){return <div className="rounded-2xl border bg-white p-5 shadow-sm"><div className="text-xs font-bold uppercase tracking-wider text-slate-400">{label}</div><div className="mt-2 text-3xl font-black text-slate-950">{value}</div></div>}
function Notice({children}:{children:React.ReactNode}){return <div className="rounded-2xl border bg-white p-5 text-sm text-slate-500">{children}</div>}
