"use client";

import { useEffect } from "react";
import { ProgramThemePage } from "@/components/public/program-theme-pages";

function setReactInputValue(element: HTMLInputElement | HTMLTextAreaElement, value: string) {
  const setter = Object.getOwnPropertyDescriptor(element.constructor.prototype, "value")?.set;
  setter?.call(element, value);
  element.dispatchEvent(new Event("input", { bubbles: true }));
  element.dispatchEvent(new Event("change", { bubbles: true }));
}

export function ContactPageClient() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const subject = params.get("subject");
    const program = params.get("program");

    const scrollToForm = () => {
      document.getElementById("contact-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    if (window.location.hash === "#contact-form") {
      const timer = window.setTimeout(scrollToForm, 120);
      return () => window.clearTimeout(timer);
    }

    if (!subject && !program) return;

    const timer = window.setTimeout(() => {
      const form = document.getElementById("contact-form");
      const subjectInput = form?.querySelector("input:nth-of-type(4)") as HTMLInputElement | null;
      if (subjectInput && subject) setReactInputValue(subjectInput, subject);
      scrollToForm();
    }, 150);

    return () => window.clearTimeout(timer);
  }, []);

  return <ProgramThemePage page="contact" />;
}
