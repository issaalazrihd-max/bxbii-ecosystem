import type { Metadata } from "next";
import { redirect } from "next/navigation";
export const metadata: Metadata={title:"Social Impact | bxbii",description:"Capability-building and technology education initiatives by bxbii."};
export default function TrainingPage(){redirect("/impact")}
