import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { HeroPremium } from '@/components/home/HeroPremium';
import { HowItWorksPremium } from '@/components/home/HowItWorksPremium';
import { CountriesSection } from '@/components/home/CountriesSection';
import { BenefitsPremium } from '@/components/home/BenefitsPremium';
import { FAQPremium } from '@/components/home/FAQPremium';
import { ComplianceSection } from '@/components/home/ComplianceSection';
import { MobileStickyNav } from '@/components/home/MobileStickyNav';
import { StadiumLights } from '@/components/home/StadiumLights';
import { SectionDivider } from '@/components/home/SectionDivider';
import FloatingChatButton from '@/components/chat/FloatingChatButton';
import AIChatDrawer from '@/components/chat/AIChatDrawer';
import { useCMSSEO } from '@/hooks/useCMSPromos';
import { useRefCode } from '@/hooks/useRefCode';

const Index = () => {
  const { data: seo } = useCMSSEO('home');
  const [chatOpen, setChatOpen] = useState(false);
  const [autoOpenDone, setAutoOpenDone] = useState(false);
  
  // Capture ref_code from URL on page load
  const refCode = useRefCode();

  // Auto-open chat after 8 seconds (once per session)
  useEffect(() => {
    const hasAutoOpened = sessionStorage.getItem('chat_auto_opened');
    if (!hasAutoOpened && !autoOpenDone) {
      const timer = setTimeout(() => {
        setChatOpen(true);
        sessionStorage.setItem('chat_auto_opened', 'true');
        setAutoOpenDone(true);
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [autoOpenDone]);

  // Update meta tags dynamically based on ref_code
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const hasRef = params.get('ref');
    
    if (hasRef) {
      document.title = 'Atención personalizada | Ganaya.bet';
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute('content', 'Recarga y retira en minutos con soporte personalizado. Casino online con atención por cajeros.');
      }
    } else if (seo?.meta_title) {
      document.title = seo.meta_title;
      if (seo?.meta_description) {
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) {
          metaDesc.setAttribute('content', seo.meta_description);
        }
      }
    }
  }, [seo]);

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden">
      {/* Subtle global ambient effect */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-40">
        <StadiumLights />
      </div>
      
      <Header />
      <main className="relative z-10">
        <HeroPremium onOpenChat={() => setChatOpen(true)} />
        <SectionDivider variant="primary" />
        <HowItWorksPremium />
        <SectionDivider variant="gold" />
        <CountriesSection />
        <SectionDivider variant="accent" />
        <BenefitsPremium />
        <SectionDivider variant="primary" />
        <FAQPremium />
        <ComplianceSection />
      </main>
      <Footer />

      {/* Floating Chat Button */}
      <FloatingChatButton onClick={() => setChatOpen(true)} isOpen={chatOpen} />

      {/* AI Chat Drawer */}
      <AIChatDrawer open={chatOpen} onOpenChange={setChatOpen} />

      {/* Mobile sticky CTA */}
      <MobileStickyNav />
    </div>
  );
};

export default Index;
