import { PublicPageShell } from "@/components/public/public-page-shell";
import { HomePage } from "@/components/public/home-page";

export default function RootPage() {
  return (
    <PublicPageShell>
      <HomePage />
    </PublicPageShell>
  );
}
