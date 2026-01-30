import { useState, useEffect } from 'react';
import { HeaderAgents } from '@/components/landing/HeaderAgents';
import { HeroAgents } from '@/components/landing/HeroAgents';
import { ProblemSection } from '@/components/landing/ProblemSection';
import { OpportunitySection } from '@/components/landing/OpportunitySection';
import { SolutionSection } from '@/components/landing/SolutionSection';
import { HowItWorksSection } from '@/components/landing/HowItWorksSection';
import { RequirementsSection } from '@/components/landing/RequirementsSection';
import { FlowSection } from '@/components/landing/FlowSection';
import { CommissionsSection } from '@/components/landing/CommissionsSection';
import { GrowthSection } from '@/components/landing/GrowthSection';
import { ComparisonSection } from '@/components/landing/ComparisonSection';
import { FAQSection } from '@/components/landing/FAQSection';
import { CTAFinalSection } from '@/components/landing/CTAFinalSection';
import { MobileStickyNavAgents } from '@/components/landing/MobileStickyNavAgents';
import { Footer } from '@/components/layout/Footer';
import { StadiumLights } from '@/components/home/StadiumLights';
import AgentChatDrawer from '@/components/landing/AgentChatDrawer';

const Index = () => {
  const [chatOpen, setChatOpen] = useState(false);

  // Set meta tags for agent recruitment
  useEffect(() => {
    document.title = 'Programa de Agentes | Ganaya.bet - Comisiones hasta 40%';
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', 'Crea tu ingreso como agente de Ganaya.bet. Comisiones escalables hasta 40% + bonos por red. 100% móvil, en tu país.');
    }
  }, []);

  const handleOpenChat = () => {
    setChatOpen(true);
  };

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden">
      {/* Subtle global ambient effect */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-30">
        <StadiumLights />
      </div>
      
      <HeaderAgents onOpenChat={handleOpenChat} />
      
      <main className="relative z-10">
        <HeroAgents onOpenChat={handleOpenChat} />
        <ProblemSection />
        <OpportunitySection />
        <SolutionSection />
        <HowItWorksSection />
        <FlowSection />
        <RequirementsSection />
        <CommissionsSection />
        <GrowthSection />
        <ComparisonSection />
        <FAQSection />
        <CTAFinalSection onOpenChat={handleOpenChat} />
      </main>
      
      <Footer />

      {/* Agent Chat Drawer - ONLY opens on user action, no auto-open */}
      <AgentChatDrawer open={chatOpen} onOpenChange={setChatOpen} />

      {/* Mobile sticky CTA */}
      <MobileStickyNavAgents onOpenChat={handleOpenChat} />
    </div>
  );
};

export default Index;
