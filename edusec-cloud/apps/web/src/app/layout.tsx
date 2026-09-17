import type { Metadata } from "next";
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr" className={arabicFont.variable}>
      <body>{children}</body>
    </html>
  );
}
