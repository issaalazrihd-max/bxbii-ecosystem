import { OperationsCenter } from "@/components/operations/operations-center";

export default function OperationsModulePage({ params }: { params: { slug: string } }) {
  return <OperationsCenter active={params.slug} />;
}
