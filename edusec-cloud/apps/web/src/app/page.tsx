import { PublicPageShell } from "@/components/public/public-page-shell";
import { TechnologyHomePage } from "@/components/public/technology-home-page";

export const metadata = {
  title: "bxbii — Deep Technology & Product Innovation",
  description: "Semiconductor design, robotics, IoT, embedded systems and technology innovation from Oman.",
};

export default function RootPage() {
  return (
    <PublicPageShell>
      <TechnologyHomePage />
    </PublicPageShell>
  );
}
