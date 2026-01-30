import { motion } from 'framer-motion';
import { Percent, Users, ArrowDown, TrendingUp, Sparkles } from 'lucide-react';
import { useLandingContent } from '@/hooks/useLandingContent';

const tiers = [
  { range: '$1 - $500', rate: '25%', active: false },
  { range: '$501 - $750', rate: '30%', active: false },
  { range: '$751 - $1,000', rate: '35%', active: false },
  { range: '+$1,001', rate: '40%', active: true },
];

export const CommissionsSection = () => {
  const { data: content } = useLandingContent();
  
  // Check if section is enabled
  if (content?.sectionsEnabled?.commissions === false) {
    return null;
  }
  
  // Get disclaimer from CMS
  const disclaimerShort = content?.socialProof?.disclaimerShort || '* Resultados dependen de tu gestión y actividad. Pago mensual según política.';
  return (
    <section id="comisiones" className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/[0.03] to-background" />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block px-3 py-1 rounded-full bg-gold/10 border border-gold/20 text-gold text-sm font-medium mb-4">
            Tu ganancia
          </span>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            <span className="text-gradient-primary">Comisiones</span> escalables
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Calculadas sobre el positivo mensual de tu operación
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Commission tiers */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-card/40 backdrop-blur-sm rounded-2xl p-6 lg:p-8 border border-border/50"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
                <Percent className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-display text-xl font-semibold">Escala de comisiones</h3>
                <p className="text-sm text-muted-foreground">Mientras más operes, más ganás</p>
              </div>
            </div>
            
            <div className="space-y-3">
              {tiers.map((tier, index) => (
                <motion.div
                  key={tier.range}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                    tier.active 
                      ? 'bg-primary/10 border-primary/30' 
                      : 'bg-card/50 border-border/50 hover:border-primary/20'
                  }`}
                >
                  <span className="text-foreground/80 font-medium">{tier.range}</span>
                  <div className="flex items-center gap-2">
                    {tier.active && <Sparkles className="w-4 h-4 text-primary" />}
                    <span className={`font-display text-2xl font-bold ${tier.active ? 'text-primary' : 'text-foreground'}`}>
                      {tier.rate}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Cascade bonus */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-card/40 backdrop-blur-sm rounded-2xl p-6 lg:p-8 border border-border/50"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-11 h-11 rounded-xl bg-gold/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-gold" />
              </div>
              <div>
                <h3 className="font-display text-xl font-semibold">Bono en cascada</h3>
                <p className="text-sm text-muted-foreground">Gana por tu red de sub-agentes</p>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-primary/10 border border-primary/20">
                <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center font-display font-bold text-primary text-xl">
                  7%
                </div>
                <div>
                  <p className="font-semibold text-foreground text-lg">Línea 1</p>
                  <p className="text-sm text-muted-foreground">Referidos directos</p>
                </div>
              </div>
              
              <div className="flex justify-center">
                <ArrowDown className="w-5 h-5 text-muted-foreground/50" />
              </div>
              
              <div className="flex items-center gap-4 p-4 rounded-xl bg-gold/10 border border-gold/20">
                <div className="w-14 h-14 rounded-full bg-gold/20 flex items-center justify-center font-display font-bold text-gold text-xl">
                  5%
                </div>
                <div>
                  <p className="font-semibold text-foreground text-lg">Línea 2</p>
                  <p className="text-sm text-muted-foreground">Referidos de tus referidos</p>
                </div>
              </div>
            </div>

            {/* Example */}
            <div className="p-4 rounded-xl bg-[hsl(var(--surface-2))] border border-border/50">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-foreground">Ejemplo</span>
              </div>
              <p className="text-sm text-muted-foreground">
                1 agente directo + 3 sub-agentes = <span className="text-foreground font-medium">Ingreso Base + ~21% extra</span>
              </p>
            </div>
          </motion.div>
        </div>

        {/* Disclaimer from CMS */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-10 text-sm text-muted-foreground/70"
        >
          {disclaimerShort}
        </motion.p>
      </div>
    </section>
  );
};
