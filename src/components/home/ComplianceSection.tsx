import { Shield, AlertTriangle, Lock, FileText } from 'lucide-react';
import { ScrollReveal } from './ScrollReveal';
import { useCMSSections } from '@/hooks/useCMSPromos';
import { motion } from 'framer-motion';

export const ComplianceSection = () => {
  const { data: sections } = useCMSSections();

  const section = sections?.find(s => s.key === 'compliance');
  if (section && !section.enabled) return null;

  const items = [
    { icon: AlertTriangle, label: '18+', color: 'text-accent', bg: 'bg-accent/10', border: 'border-accent/20' },
    { icon: Shield, label: 'Juego Responsable', color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/20' },
    { icon: Lock, label: 'Datos Protegidos', color: 'text-gold', bg: 'bg-gold/10', border: 'border-gold/20' },
    { icon: FileText, label: 'Términos Claros', color: 'text-[#25D366]', bg: 'bg-[#25D366]/10', border: 'border-[#25D366]/20' },
  ];

  return (
    <section className="py-12 bg-card/80 border-t border-b border-white/5">
      <div className="container mx-auto px-4">
        <ScrollReveal>
          <motion.div 
            className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
          >
            {items.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={i}
                  className={`flex items-center gap-3 px-5 py-3 rounded-full ${item.bg} border ${item.border} transition-all duration-300 hover:scale-105`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Icon className={`w-5 h-5 ${item.color}`} />
                  <span className="text-sm font-medium text-foreground">{item.label}</span>
                </motion.div>
              );
            })}
          </motion.div>
          
          <p className="text-center text-sm text-muted-foreground mt-6 max-w-2xl mx-auto">
            Jugar debe ser entretenimiento. Si sientes que pierdes el control, busca ayuda. 
            Mayores de 18 años únicamente. <a href="#" className="text-primary hover:underline">Más información</a>
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
};
