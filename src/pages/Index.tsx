import { useState, useEffect } from 'react';
import { HeaderAgents } from '@/components/landing/HeaderAgents';
import { HeroAgents } from '@/components/landing/HeroAgents';
import { SocialProofStrip } from '@/components/landing/SocialProofStrip';
import { StatsBar } from '@/components/landing/StatsBar';
import { ProblemSection } from '@/components/landing/ProblemSection';
import { OpportunitySection } from '@/components/landing/OpportunitySection';
import { VideoSection } from '@/components/landing/VideoSection';
import { HowItWorksSection } from '@/components/landing/HowItWorksSection';
import { BenefitsSection } from '@/components/landing/BenefitsSection';
import { ForWhoSection } from '@/components/landing/ForWhoSection';
import { RequirementsSection } from '@/components/landing/RequirementsSection';
import { FlowSection } from '@/components/landing/FlowSection';
import { CommissionsSection } from '@/components/landing/CommissionsSection';
import { CompetitiveSection } from '@/components/landing/CompetitiveSection';
import { TestimonialsSection } from '@/components/landing/TestimonialsSection';
import { GrowthSection } from '@/components/landing/GrowthSection';
import { ResultsShowcase } from '@/components/landing/ResultsShowcase';
import { IncomeComparison } from '@/components/landing/IncomeComparison';
import { AcquisitionSection } from '@/components/landing/AcquisitionSection';
import { NextStepsSection } from '@/components/landing/NextStepsSection';
import { FAQSection } from '@/components/landing/FAQSection';
import { CTAFinalSection } from '@/components/landing/CTAFinalSection';
import { MobileStickyNavAgents } from '@/components/landing/MobileStickyNavAgents';
import { SectionDivider } from '@/components/landing/SectionDivider';
import { Footer } from '@/components/layout/Footer';
import { StadiumLights } from '@/components/home/StadiumLights';
import AgentChatDrawer from '@/components/landing/AgentChatDrawer';
import { CursorGlow } from '@/components/landing/CursorGlow';
import { ScrollToTop } from '@/components/landing/ScrollToTop';
import { LiveNotifications } from '@/components/landing/LiveNotifications';
import { motion, useScroll, useSpring } from 'framer-motion';

const Index = () => {
  const [chatOpen, setChatOpen] = useState(false);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  useEffect(() => {
    document.title = 'Programa de Agentes | Ganaya.bet - Comisiones hasta 40%';
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', 'Crea tu ingreso como agente de Ganaya.bet. Comisiones escalables hasta 40% + bonos por red. 100% móvil, en tu país.');
    }
  }, []);

  const handleOpenChat = () => setChatOpen(true);

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden">
      {/* Global scroll progress bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-primary via-[hsl(var(--gold))] to-primary z-[60] origin-left"
        style={{ scaleX }}
      />

      <CursorGlow />
      <div className="fixed inset-0 pointer-events-none z-0 opacity-30">
        <StadiumLights />
      </div>
      
      <HeaderAgents onOpenChat={handleOpenChat} />
      
      <main className="relative z-10">
        <HeroAgents onOpenChat={handleOpenChat} />
        <SocialProofStrip />
        <StatsBar />
        <SectionDivider variant="primary" />
        <ProblemSection />
        <SectionDivider variant="subtle" />
        <OpportunitySection />
        <SectionDivider variant="primary" />
        <VideoSection />
        <SectionDivider variant="subtle" />
        <HowItWorksSection onOpenChat={handleOpenChat} />
        <SectionDivider variant="primary" />
        <BenefitsSection onOpenChat={handleOpenChat} />
        <SectionDivider variant="gold" />
        <ForWhoSection />
        <SectionDivider variant="subtle" />
        <RequirementsSection />
        <SectionDivider variant="primary" />
        <FlowSection />
        <SectionDivider variant="gold" />
        <CommissionsSection />
        <IncomeComparison />
        <SectionDivider variant="subtle" />
        <CompetitiveSection />
        <SectionDivider variant="gold" />
        <TestimonialsSection />
        <SectionDivider variant="primary" />
        <GrowthSection />
        <ResultsShowcase />
        <SectionDivider variant="subtle" />
        <AcquisitionSection />
        <SectionDivider variant="primary" />
        <NextStepsSection onOpenChat={handleOpenChat} />
        <SectionDivider variant="subtle" />
        <FAQSection />
        <CTAFinalSection onOpenChat={handleOpenChat} />
      </main>
      
      <div className="h-20 md:hidden" />
      
      <Footer />
      <AgentChatDrawer open={chatOpen} onOpenChange={setChatOpen} />
      <MobileStickyNavAgents onOpenChat={handleOpenChat} />
      <ScrollToTop />
      <LiveNotifications />
    </div>
  );
};

export default Index;
