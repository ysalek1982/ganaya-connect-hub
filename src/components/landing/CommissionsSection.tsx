import { motion } from 'framer-motion';
import { Percent, Users, ArrowDown, TrendingUp, Sparkles, Crown } from 'lucide-react';
import { useLandingContent } from '@/hooks/useLandingContent';

const tiers = [
  { range: '$1 - $500', rate: '25%', active: false },
  { range: '$501 - $750', rate: '30%', active: false },
  { range: '$751 - $1,000', rate: '35%', active: false },
  { range: '+$1,001', rate: '40%', active: true },
];

export const CommissionsSection = () => {
  const { data: content } = useLandingContent();
  if (content?.sectionsEnabled?.commissions === false) return null;
  const disclaimerShort = content?.socialProof?.disclaimerShort || '* Resultados dependen de tu gestión y actividad. Pago mensual según política.';

  return (
    <section id="comisiones" className="py-28 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/[0.04] to-background" />
      {/* Dramatic ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/[0.06] rounded-full blur-[150px]" />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/10 border border-gold/20 text-gold text-sm font-semibold mb-6 uppercase tracking-wide">
            <Crown className="w-4 h-4" />
            Tu ganancia
          </span>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-5">
            <span className="text-gradient-primary">Comisiones</span> escalables
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto leading-relaxed">
            Calculadas sobre el positivo mensual de tu operación
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {/* Commission tiers */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ type: 'spring', stiffness: 80 }}
            className="bg-card/60 backdrop-blur-sm rounded-2xl p-7 lg:p-8 border border-border/50"
          >
            <div className="flex items-center gap-3 mb-7">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Percent className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-display text-xl font-bold">Escala de comisiones</h3>
                <p className="text-sm text-muted-foreground">Mientras más operes, más ganás</p>
              </div>
            </div>
            
            <div className="space-y-3">
              {tiers.map((tier, index) => (
                <motion.div
                  key={tier.range}
                  initial={{ opacity: 0, x: -15 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-300 ${
                    tier.active 
                      ? 'bg-primary/15 border-primary/40 shadow-lg shadow-primary/10' 
                      : 'bg-card/50 border-border/50 hover:border-primary/20 hover:bg-card/70'
                  }`}
                >
                  <span className="text-foreground/80 font-medium">{tier.range}</span>
                  <div className="flex items-center gap-2">
                    {tier.active && <Sparkles className="w-4 h-4 text-primary animate-pulse" />}
                    <span className={`font-display text-2xl font-black ${tier.active ? 'text-primary' : 'text-foreground'}`}>
                      {tier.rate}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Cascade bonus */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ type: 'spring', stiffness: 80 }}
            className="bg-card/60 backdrop-blur-sm rounded-2xl p-7 lg:p-8 border border-border/50"
          >
            <div className="flex items-center gap-3 mb-7">
              <div className="w-12 h-12 rounded-2xl bg-gold/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-gold" />
              </div>
              <div>
                <h3 className="font-display text-xl font-bold">Bono en cascada</h3>
                <p className="text-sm text-muted-foreground">Gana por tu red de sub-agentes</p>
              </div>
            </div>

            <div className="space-y-4 mb-7">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="flex items-center gap-4 p-5 rounded-xl bg-primary/10 border border-primary/25"
              >
                <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center font-display font-black text-primary text-2xl shadow-lg shadow-primary/10">
                  7%
                </div>
                <div>
                  <p className="font-bold text-foreground text-lg">Línea 1</p>
                  <p className="text-sm text-muted-foreground">Referidos directos</p>
                </div>
              </motion.div>
              
              <div className="flex justify-center">
                <div className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center">
                  <ArrowDown className="w-4 h-4 text-muted-foreground/50" />
                </div>
              </div>
              
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="flex items-center gap-4 p-5 rounded-xl bg-gold/10 border border-gold/25"
              >
                <div className="w-16 h-16 rounded-2xl bg-gold/20 flex items-center justify-center font-display font-black text-gold text-2xl shadow-lg shadow-gold/10">
                  5%
                </div>
                <div>
                  <p className="font-bold text-foreground text-lg">Línea 2</p>
                  <p className="text-sm text-muted-foreground">Referidos de tus referidos</p>
                </div>
              </motion.div>
            </div>

            {/* Example */}
            <div className="p-4 rounded-xl bg-[hsl(var(--surface-2))] border border-border/50">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                <span className="text-sm font-bold text-foreground">Ejemplo</span>
              </div>
              <p className="text-sm text-muted-foreground">
                1 agente directo + 3 sub-agentes = <span className="text-foreground font-semibold">Ingreso Base + ~21% extra</span>
              </p>
            </div>
          </motion.div>
        </div>

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
