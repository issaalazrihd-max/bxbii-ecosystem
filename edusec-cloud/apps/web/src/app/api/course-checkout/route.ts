import { NextResponse } from "next/server";
import { getCourseContent } from "@/lib/course-content";

const endpoint = "https://secure-oman.paytabs.com/payment/request";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const slug = String(body?.slug ?? "");
  const name = String(body?.name ?? "").trim();
  const email = String(body?.email ?? "").trim();
  const phone = String(body?.phone ?? "").trim();

  const course = getCourseContent(slug);
  if (!course) return NextResponse.json({ error: "Course not found" }, { status: 404 });
  if (!name || !email) return NextResponse.json({ error: "Name and email are required" }, { status: 400 });

  const profileId = process.env.PAYTABS_PROFILE_ID;
  const serverKey = process.env.PAYTABS_SERVER_KEY;
  if (!profileId || !serverKey) {
    return NextResponse.json({ error: "Payment gateway is not configured yet" }, { status: 503 });
  }

  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://bxbii.com";
  const cartId = `bxbii-${slug}-${crypto.randomUUID()}`;

  const payload = {
    profile_id: Number(profileId),
    tran_type: "sale",
    tran_class: "ecom",
    cart_id: cartId,
    cart_currency: course.currency,
    cart_amount: course.price,
    cart_description: `BXBII Online Course: ${slug}`,
    paypage_lang: "en",
    return: `${base}/api/course-payment-return`,
    callback: `${base}/api/course-payment-callback`,
    customer_details: {
      name,
      email,
      phone,
      street1: "Online",
      city: "Muscat",
      state: "Muscat",
      country: "OM",
      zip: "100",
    },
  };

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { authorization: serverKey, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    cache: "no-store",
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.redirect_url) {
    return NextResponse.json({ error: data?.message || "Unable to create payment page" }, { status: 502 });
  }
  return NextResponse.json({ redirectUrl: data.redirect_url });
}
