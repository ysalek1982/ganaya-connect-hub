import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Hero } from '@/components/home/Hero';
import { LobbiesSection } from '@/components/home/LobbiesSection';
import { PromosCarouselSection } from '@/components/home/PromosCarouselSection';
import { SpotlightGamesSection } from '@/components/home/SpotlightGamesSection';
import { BenefitsSection } from '@/components/home/BenefitsSection';
import { FAQSection } from '@/components/home/FAQSection';
import { ComplianceSection } from '@/components/home/ComplianceSection';
import { MobileStickyNav } from '@/components/home/MobileStickyNav';
import { StadiumLights } from '@/components/home/StadiumLights';
import { SectionDivider } from '@/components/home/SectionDivider';
import { TestimonialsSection } from '@/components/home/TestimonialsSection';
import { PartnersSection } from '@/components/home/PartnersSection';
import FloatingChatButton from '@/components/chat/FloatingChatButton';
import { useCMSSEO } from '@/hooks/useCMSPromos';
import { useEffect } from 'react';

const Index = () => {
  const { data: seo } = useCMSSEO('home');

  // Update meta tags dynamically
  useEffect(() => {
    if (seo?.meta_title) {
      document.title = seo.meta_title;
    }
    if (seo?.meta_description) {
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute('content', seo.meta_description);
      }
    }
    if (seo?.og_image_url) {
      const ogImage = document.querySelector('meta[property="og:image"]');
      if (ogImage) {
        ogImage.setAttribute('content', seo.og_image_url);
      }
    }
  }, [seo]);

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden">
      {/* Subtle global ambient effect */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-50">
        <StadiumLights />
      </div>
      
      <Header />
      <main className="relative z-10">
        <Hero />
        <SectionDivider variant="primary" />
        <LobbiesSection />
        <SectionDivider variant="gold" />
        <PromosCarouselSection />
        <SectionDivider variant="accent" />
        <SpotlightGamesSection />
        <SectionDivider variant="primary" />
        <BenefitsSection />
        <SectionDivider variant="gold" />
        <TestimonialsSection />
        <PartnersSection />
        <FAQSection />
        <ComplianceSection />
      </main>
      <Footer />

      {/* Floating Chat */}
      <FloatingChatButton />

      {/* Mobile sticky CTA - Now dynamic from CMS */}
      <MobileStickyNav />
    </div>
  );
};

export default Index;
