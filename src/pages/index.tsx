import React, { useRef } from 'react'
import {
  SiteHeader,
  HeroSection,
  ConnectMarqueeSection,
  DistanceSection,
  MomentsScrollSection,
  FamilyCloseSection,
  OnboardingCarouselSection,
  InstantPulseSection,
  LanguageSection,
  CursorFollower,
  WhatsInsideSection,
  TestimonialsSection,
  FinalCtaSection,
  SiteFooter,
  useScrollReveals,
} from '@/components/landing'

export default function LandingPage() {
  const pageRef = useRef<HTMLDivElement>(null)
  useScrollReveals(pageRef)

  return (
    <div ref={pageRef} className="min-h-screen bg-[#0b0b12]">
      <CursorFollower />
      <SiteHeader />
      <main>
        <HeroSection />
        <ConnectMarqueeSection />
        <DistanceSection />
        <MomentsScrollSection />
        <FamilyCloseSection />
        <OnboardingCarouselSection />
        <InstantPulseSection />
        <LanguageSection />
        <WhatsInsideSection />
        <TestimonialsSection />
        <FinalCtaSection />
      </main>
      <SiteFooter />
    </div>
  )
}
