import { NextRequest, NextResponse } from "next/server";

const CLOUD_HOST = "app.bxbii.com";

export function middleware(request: NextRequest) {
  const host = request.headers.get("host")?.split(":")[0].toLowerCase();
  if (host !== CLOUD_HOST) return NextResponse.next();

  const { pathname } = request.nextUrl;

  const isCloudRoute =
    pathname === "/login" ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/branches") ||
    pathname.startsWith("/cms") ||
    pathname.startsWith("/erp") ||
    pathname.startsWith("/operations") ||
    pathname.startsWith("/students") ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname === "/favicon.ico";

  if (!isCloudRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!.*\\..*).*)"],
};
