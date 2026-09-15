import { OperationsCenter } from "@/components/operations/operations-center";

export default async function OperationsModulePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <OperationsCenter active={slug} />;
}
