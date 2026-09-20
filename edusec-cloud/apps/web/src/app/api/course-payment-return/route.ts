import { NextResponse } from "next/server";
import crypto from "node:crypto";

function validSignature(values: Record<string,string>, signature:string, key:string) {
  const fields = Object.entries(values).filter(([k,v]) => k !== "signature" && v !== "").sort(([a],[b]) => a.localeCompare(b));
  const query = fields.map(([k,v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join("&");
  const digest = crypto.createHmac("sha256", key).update(query).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature));
}
function sign(payload:string, secret:string) {
  return crypto.createHmac("sha256",secret).update(payload).digest("hex");
}

export async function POST(req:Request) {
  const form = await req.formData();
  const values:Record<string,string> = {};
  form.forEach((v,k)=>{ values[k]=String(v); });
  const signature=values.signature;
  const key=process.env.PAYTABS_SERVER_KEY;
  const secret=process.env.COURSE_ACCESS_SECRET || key;
  const status=values.respStatus;
  const cartId=values.cartId || "";
  const email=values.customerEmail || "";
  if (!key || !secret || !signature || !validSignature(values,signature,key) || status !== "A" || !cartId.startsWith("bxbii-")) {
    return NextResponse.redirect(new URL("/courses?payment=failed", req.url));
  }
  const slug=cartId.replace(/^bxbii-/,"").replace(/-[0-9a-f-]{36}$/,"");
  if (!slug || !email) return NextResponse.redirect(new URL("/courses?payment=failed", req.url));

  const exp=Math.floor(Date.now()/1000)+60*60*24*365;
  const payload=`${slug}|${email.toLowerCase()}|${exp}`;
  const token=`${Buffer.from(payload).toString("base64url")}.${sign(payload,secret)}`;
  const response=NextResponse.redirect(new URL(`/courses/${slug}?payment=success`, req.url));
  response.cookies.set("bxbii_course_access",token,{httpOnly:true,secure:true,sameSite:"lax",path:"/",maxAge:60*60*24*365});
  return response;
}
