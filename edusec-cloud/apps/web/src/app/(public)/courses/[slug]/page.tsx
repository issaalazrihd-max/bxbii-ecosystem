import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import crypto from "node:crypto";
import { cookies } from "next/headers";
import { publicApi } from "@/lib/public-api";
import { getCourseContent } from "@/lib/course-content";
import { CourseCheckout } from "@/components/public/course-checkout";

export const dynamic="force-dynamic";
export const metadata: Metadata={title:"Course | BXBII"};

function hasCourseAccess(slug:string){
  const raw=cookies().get("bxbii_course_access")?.value;
  if(!raw) return false;
  const [encoded,sig]=raw.split(".");
  const secret=process.env.COURSE_ACCESS_SECRET||process.env.PAYTABS_SERVER_KEY;
  if(!encoded||!sig||!secret) return false;
  const payload=Buffer.from(encoded,"base64url").toString("utf8");
  const expected=crypto.createHmac("sha256",secret).update(payload).digest("hex");
  if(!crypto.timingSafeEqual(Buffer.from(expected),Buffer.from(sig))) return false;
  const [courseSlug,,exp]=payload.split("|");
  return courseSlug===slug && Number(exp)>Math.floor(Date.now()/1000);
}

export default async function Page({params}:{params:{slug:string}}){
 const courses=(await publicApi.getCourses())??[];
 const course=courses.find(c=>c.slug===params.slug);
 const content=getCourseContent(params.slug);
 if(!course||!content) notFound();
 const access=hasCourseAccess(params.slug);
 const freeLessons=content.lessons.filter(x=>x.free);
 const paidLessons=content.lessons.filter(x=>!x.free);
 return <main className="min-h-screen bg-[#f7f8fa] text-slate-950">
  <section className="bg-[#08172e] py-20 text-white sm:py-24">
   <div className="mx-auto max-w-6xl px-5 sm:px-8">
    <Link href="/courses" className="text-sm font-bold text-blue-300">← Courses / الدورات</Link>
    <div className="mt-9 flex flex-wrap items-start justify-between gap-8">
      <div className="max-w-3xl">
       <span className="text-xs font-black uppercase tracking-[.18em] text-cyan-300">ONLINE COURSE / دورة أونلاين</span>
       <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-6xl">{course.enTitle}</h1>
       <h2 className="mt-3 text-2xl font-bold text-white/70" dir="rtl">{course.arTitle}</h2>
       <p className="mt-6 text-lg leading-8 text-white/65">{course.enDescription}</p>
       <p className="mt-2 text-lg leading-8 text-white/65" dir="rtl">{course.arDescription}</p>
      </div>
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5 min-w-[210px]">
       <div className="text-xs font-bold text-white/45">FULL COURSE / الدورة الكاملة</div>
       <div className="mt-2 text-3xl font-black">{content.price} OMR</div>
       <div className="mt-1 text-sm text-white/45">One-time payment · Online</div>
      </div>
    </div>
    <div className="mt-8 flex flex-wrap gap-3 text-sm font-bold text-white/60"><span className="rounded-xl bg-white/10 px-4 py-2">{content.level} / {content.arLevel}</span><span className="rounded-xl bg-white/10 px-4 py-2">Online / أونلاين</span><span className="rounded-xl bg-white/10 px-4 py-2">{course.enDuration}</span></div>
   </div>
  </section>

  <section className="py-14 sm:py-18">
   <div className="mx-auto grid max-w-6xl gap-8 px-5 sm:px-8 lg:grid-cols-[1fr_340px]">
    <div>
      <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
       <span className="text-xs font-black uppercase tracking-[.18em] text-accent">WHAT YOU WILL LEARN</span>
       <h2 className="mt-3 text-3xl font-black">Course outcomes / مخرجات الدورة</h2>
       <div className="mt-6 grid gap-3 sm:grid-cols-2">{content.outcomes.map((x,i)=><div key={x} className="rounded-xl bg-slate-50 p-4"><b>0{i+1}</b><p className="mt-2 text-sm text-slate-600">{x}</p><p className="mt-1 text-sm text-slate-400" dir="rtl">{content.arOutcomes[i]}</p></div>)}</div>
      </div>

      <div className="mt-8">
       <div className="flex items-end justify-between gap-4"><div><span className="text-xs font-black uppercase tracking-[.18em] text-accent">CURRICULUM</span><h2 className="mt-2 text-3xl font-black">Course content / محتوى الدورة</h2></div><span className="text-xs font-bold text-slate-400">{content.lessons.length} lessons</span></div>
       <div className="mt-6 space-y-4">
        {content.lessons.map((lesson,i)=>{
          const unlocked=Boolean(lesson.free)||access;
          return <article key={lesson.title} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-start gap-4 p-6">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#08172e] text-sm font-black text-white">{String(i+1).padStart(2,"0")}</span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2"><h3 className="text-lg font-black">{lesson.title}</h3>{lesson.free&&<span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-black text-emerald-700">FREE PREVIEW / مجاني</span>}{!lesson.free&&!access&&<span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-black text-slate-500">LOCKED / مقفل</span>}</div>
                <p className="mt-1 text-sm font-bold text-slate-400" dir="rtl">{lesson.arTitle}</p>
                {unlocked?<><p className="mt-4 leading-7 text-slate-600">{lesson.summary}</p><p className="mt-1 leading-7 text-slate-400" dir="rtl">{lesson.arSummary}</p><div className="mt-4 flex flex-wrap gap-2">{lesson.topics.map((topic,j)=><span key={topic} className="rounded-lg bg-slate-50 px-3 py-2 text-xs font-bold text-slate-500">{topic} · {lesson.arTopics[j]}</span>)}</div></>:<div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm font-bold text-slate-500">Pay to unlock this lesson and the rest of the course / ادفع لفتح هذا الدرس وبقية محتوى الدورة</div>}
              </div>
            </div>
          </article>
        })}
       </div>
      </div>
    </div>

    <aside className="h-fit lg:sticky lg:top-24">
      <div className="rounded-3xl bg-[#08172e] p-7 text-white shadow-xl">
       {access?<><span className="text-xs font-black uppercase tracking-[.18em] text-emerald-300">ACCESS ACTIVE</span><h2 className="mt-3 text-2xl font-black">You have full access</h2><p className="mt-3 text-sm leading-6 text-white/55">All lessons in this online course are unlocked for you.</p></>:<><span className="text-xs font-black uppercase tracking-[.18em] text-cyan-300">START FREE</span><h2 className="mt-3 text-2xl font-black">Try the introduction free</h2><p className="mt-3 text-sm leading-6 text-white/55">The first lesson is free. Pay once to unlock the complete course and all remaining lessons.</p><div className="mt-6"><CourseCheckout slug={params.slug} price={content.price}/></div></>}
      </div>
      <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-500"><b className="text-slate-900">Online delivery / تقديم أونلاين</b><p className="mt-2">Learn at your own pace with bilingual course content and practical activities.</p></div>
    </aside>
   </div>
  </section>
 </main>;
}
