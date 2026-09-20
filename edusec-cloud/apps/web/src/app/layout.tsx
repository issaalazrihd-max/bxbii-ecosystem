import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { IBM_Plex_Sans_Arabic } from "next/font/google";
import "./globals.css";

const arabicFont = IBM_Plex_Sans_Arabic({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-bxbii-arabic",
});

export const metadata: Metadata = {
  title: "bxbii",
  description: "bxbii Digital Business Ecosystem — technology, industrial solutions, R&D and professional programs.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const requestHeaders = await headers();
  const host = requestHeaders.get("host")?.split(":")[0].toLowerCase();
  const pathname = requestHeaders.get("x-pathname") || "";
  const isCloudHost = host === "app.bxbii.com";
  const isCloudRoute =
    pathname === "/login" ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/branches") ||
    pathname.startsWith("/cms") ||
    pathname.startsWith("/erp") ||
    pathname.startsWith("/operations") ||
    pathname.startsWith("/students") ||
    pathname.startsWith("/api/");

  if (isCloudHost && !isCloudRoute) redirect("/login");

  return (
    <html lang="en" dir="ltr" className={arabicFont.variable}>
      <body>{children}</body>
    </html>
  );
}
