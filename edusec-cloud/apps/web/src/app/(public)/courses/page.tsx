import type { Metadata } from "next";
import { CoursesPage } from "@/components/public/courses-page";

export const metadata: Metadata = { title: "الدورات | bxbii", description: "دورات bxbii العملية في التقنية والبيانات والذكاء الاصطناعي والأمن السيبراني." };
export default function Page() { return <CoursesPage />; }
