import { motion } from 'framer-motion';
import { ScrollReveal } from './ScrollReveal';
import { useCMSFAQ, useCMSSections } from '@/hooks/useCMSPromos';

export const FAQSection = () => {
  const { data: sections } = useCMSSections();
  const { data: faqs, isLoading } = useCMSFAQ();

  const section = sections?.find(s => s.key === 'faq');
  if (section && !section.enabled) return null;

  if (isLoading) {
    return (
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-16 glass-card rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!faqs?.length) return null;

  return (
    <section id="faq" className="py-20 md:py-28">
      <div className="container mx-auto px-4 max-w-3xl">
        <ScrollReveal>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-4">
            {section?.title || 'Preguntas'} <span className="text-gradient-primary">Frecuentes</span>
          </h2>
          <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-12">
            {section?.subtitle || 'Todo lo que necesitás saber'}
          </p>
        </ScrollReveal>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <ScrollReveal key={faq.id} delay={i * 100}>
              <motion.details
                className="glass-card rounded-xl p-5 group cursor-pointer"
                whileHover={{ scale: 1.01 }}
              >
                <summary className="font-semibold cursor-pointer list-none flex justify-between items-center">
                  {faq.question}
                  <span className="text-primary text-xl group-open:rotate-45 transition-transform duration-300">+</span>
                </summary>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-4 text-muted-foreground border-t border-border pt-4"
                >
                  {faq.answer}
                </motion.p>
              </motion.details>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
};
