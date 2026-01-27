'use client';

import HeroSection from './HeroSection';
import FeaturesSection from './FeaturesSection';
import MatchupsSection from './MatchupsSection';
import LifestyleSection from './LifestyleSection';
import CommunitySection from './CommunitySection';
import CTASection from './CTASection';
import Footer from './Footer';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden">
      <HeroSection />
      <FeaturesSection />
      <MatchupsSection />
      <LifestyleSection />
      <CommunitySection />
      <CTASection />
      <Footer />
    </div>
  );
}
