"use client";

import { useEffect } from "react";
import { DeepTechPage } from "@/components/public/deep-tech-pages";

export function ContactPageClient() {
  useEffect(() => {
    if (window.location.hash !== "#contact-form") return;
    const scrollToForm = () => {
      document.getElementById("contact-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
    };
    const timer = window.setTimeout(scrollToForm, 120);
    return () => window.clearTimeout(timer);
  }, []);

  return <DeepTechPage page="contact" />;
}
