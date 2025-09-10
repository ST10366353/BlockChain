import { LandingHero } from "@/components/landing-hero"
import { UserTypeSelector } from "@/components/user-type-selector"
import { FeaturesSection } from "@/components/features-section"
import { SecuritySection } from "@/components/security-section"

export default function Home() {
  return (
    <div className="min-h-screen">
      <LandingHero />
      <FeaturesSection />
      <SecuritySection />
      <UserTypeSelector />
    </div>
  );
}
