import { notFound } from "next/navigation";
import { OperationsCenter, OPERATIONS_MODULES } from "@/components/operations/operations-center";

export function generateStaticParams() {
  return OPERATIONS_MODULES.map((module) => ({ module: module.slug }));
}

export default function OperationsModulePage({ params }: { params: { module: string } }) {
  if (!OPERATIONS_MODULES.some((module) => module.slug === params.module)) notFound();
  return <OperationsCenter active={params.module} />;
}
