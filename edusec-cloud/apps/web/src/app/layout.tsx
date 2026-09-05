import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "bxbii",
  description: "bxbii Digital Business Ecosystem — training, institute management, and more, in one platform.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
