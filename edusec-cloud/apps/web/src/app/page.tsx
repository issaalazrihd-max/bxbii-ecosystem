import { PublicPageShell } from "@/components/public/public-page-shell";
import { EnhancedBxbiiHomePage } from "@/components/public/enhanced-bxbii-home-page";
import { HomepageNavCards } from "@/components/public/homepage-nav-cards";

export const metadata={title:"BXBII | Technology, Solutions, Industries & Training",description:"Explore BXBII technology, solutions, industries and training programs."};

export default function RootPage(){return <PublicPageShell><EnhancedBxbiiHomePage/><HomepageNavCards/></PublicPageShell>}
