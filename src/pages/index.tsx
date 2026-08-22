import React, { useRef } from 'react'
import {
  SiteHeader,
  HeroSection,
  ConnectMarqueeSection,
  DistanceSection,
  MomentsScrollSection,
  CursorFollower,
  FeaturesSection,
  HowItWorksSection,
  SocialProofSection,
  FinalCtaSection,
  SiteFooter,
  useScrollReveals,
} from '@/components/landing'

export default function LandingPage() {
  const pageRef = useRef<HTMLDivElement>(null)
  useScrollReveals(pageRef)

  return (
    <div ref={pageRef} className="min-h-screen bg-white">
      <CursorFollower />
      <SiteHeader />
      <main>
        <div id="dark-intro">
          <HeroSection />
          <ConnectMarqueeSection />
          <DistanceSection />
          <MomentsScrollSection />
        </div>
        <FeaturesSection />
        <HowItWorksSection />
        <SocialProofSection />
        <FinalCtaSection />
      </main>
      <SiteFooter />
    </div>
  )
}
