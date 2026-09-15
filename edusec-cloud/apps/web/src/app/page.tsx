import { publicApi } from "@/lib/public-api";
import { PublicPageShell } from "@/components/public/public-page-shell";
import { HomePage } from "@/components/public/home-page";

export const metadata = {
  title: "bxbii — Learning, Technology & Impact",
  description: "Practical learning, technology and industry-led experiences.",
};

export default async function RootPage() {
  const [programs, partners] = await Promise.all([
    publicApi.getPrograms(),
    publicApi.getPartners(),
  ]);

  return (
    <PublicPageShell>
      <HomePage programs={programs ?? []} partners={partners ?? []} />
    </PublicPageShell>
  );
}
