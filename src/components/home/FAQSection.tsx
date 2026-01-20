import { motion } from 'framer-motion';
import { HelpCircle, ChevronDown } from 'lucide-react';
import { ScrollReveal } from './ScrollReveal';
import { useCMSFAQ, useCMSSections } from '@/hooks/useCMSPromos';
import { useState } from 'react';

export const FAQSection = () => {
  const { data: sections } = useCMSSections();
  const { data: faqs, isLoading } = useCMSFAQ();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const section = sections?.find(s => s.key === 'faq');
  if (section && !section.enabled) return null;

  if (isLoading) {
    return (
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-20 glass-card rounded-2xl animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!faqs?.length) return null;

  return (
    <section id="faq" className="py-20 md:py-28 relative overflow-hidden">
      {/* Background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[200px]" />
      
      <div className="container mx-auto px-4 max-w-4xl relative z-10">
        <ScrollReveal>
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 mb-6"
            >
              <HelpCircle className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">RESUELVE TUS DUDAS</span>
            </motion.div>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              {section?.title || 'Preguntas'} <span className="text-gradient-primary">Frecuentes</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              {section?.subtitle || 'Todo lo que necesitás saber para empezar'}
            </p>
          </div>
        </ScrollReveal>

        <div className="space-y-4">
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i;
            
            return (
              <ScrollReveal key={faq.id} delay={i * 100}>
                <motion.div
                  className={`rounded-2xl overflow-hidden border transition-all duration-300 ${
                    isOpen 
                      ? 'border-primary/50 shadow-[0_0_30px_-10px_hsl(var(--primary)/0.3)]' 
                      : 'border-white/10 hover:border-white/20'
                  } bg-card/50 backdrop-blur-sm`}
                  initial={false}
                >
                  <button
                    className="w-full p-6 flex items-center justify-between text-left"
                    onClick={() => setOpenIndex(isOpen ? null : i)}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                        isOpen ? 'bg-primary/20' : 'bg-white/5'
                      }`}>
                        <span className={`font-display font-bold text-sm ${isOpen ? 'text-primary' : 'text-muted-foreground'}`}>
                          {String(i + 1).padStart(2, '0')}
                        </span>
                      </div>
                      <span className={`font-semibold text-lg transition-colors ${isOpen ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {faq.question}
                      </span>
                    </div>
                    <motion.div
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                      className={`flex-shrink-0 ml-4 ${isOpen ? 'text-primary' : 'text-muted-foreground'}`}
                    >
                      <ChevronDown className="w-5 h-5" />
                    </motion.div>
                  </button>
                  
                  <motion.div
                    initial={false}
                    animate={{ 
                      height: isOpen ? 'auto' : 0,
                      opacity: isOpen ? 1 : 0 
                    }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-6 pt-0">
                      <div className="pl-14 text-muted-foreground leading-relaxed border-t border-white/5 pt-4">
                        {faq.answer}
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
};
