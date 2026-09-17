import type { Metadata } from "next";
import { ContactPageClient } from "./contact-page-client";

export const metadata: Metadata = {
  title: "Contact bxbii | Let's Build",
  description: "Discuss industrial technology, partnerships and product development with bxbii.",
};

export default function Page() {
  return <ContactPageClient />;
}
