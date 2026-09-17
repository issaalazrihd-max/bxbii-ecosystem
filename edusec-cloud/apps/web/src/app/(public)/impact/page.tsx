import type { Metadata } from "next";
import { TechnologyProgramsPage } from "@/components/public/technology-programs-page";

export const metadata: Metadata = {
  title: "Programs | bxbii",
  description: "Technology capability-building programs and learning pathways by bxbii.",
};

export default function Page() {
  return <TechnologyProgramsPage />;
}
