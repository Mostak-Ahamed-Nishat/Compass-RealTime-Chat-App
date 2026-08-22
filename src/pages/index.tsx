import React, { useRef } from 'react'
import {
  SiteHeader,
  HeroSection,
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
      <SiteHeader />
      <main>
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <SocialProofSection />
        <FinalCtaSection />
      </main>
      <SiteFooter />
    </div>
  )
}
