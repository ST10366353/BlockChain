import { LandingHero } from "@/components/landing-hero"
import { UserTypeSelector } from "@/components/user-type-selector"

export default function Home() {
  return (
    <div className="min-h-screen">
      <LandingHero />
      <UserTypeSelector />
    </div>
  );
}
