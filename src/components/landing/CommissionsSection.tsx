import { motion, useSpring, useTransform, useMotionValue } from 'framer-motion';
import { Percent, Users, ArrowDown, TrendingUp, Sparkles, Crown, DollarSign } from 'lucide-react';
import { useLandingContent } from '@/hooks/useLandingContent';
import { Slider } from '@/components/ui/slider';
import { useState, useEffect, useRef } from 'react';

const tiers = [
  { min: 1, max: 500, rate: 25 },
  { min: 501, max: 750, rate: 30 },
  { min: 751, max: 1000, rate: 35 },
  { min: 1001, max: 2000, rate: 40 },
];

const getTier = (amount: number) => tiers.find(t => amount >= t.min && amount <= t.max) || tiers[tiers.length - 1];

const AnimatedNumber = ({ value, prefix = '', suffix = '' }: { value: number; prefix?: string; suffix?: string }) => {
  const spring = useSpring(0, { stiffness: 100, damping: 20 });
  const display = useTransform(spring, (v) => `${prefix}${Math.round(v).toLocaleString()}${suffix}`);
  
  useEffect(() => {
    spring.set(value);
  }, [value, spring]);
  
  return <motion.span className="tabular-nums">{display}</motion.span>;
};

export const CommissionsSection = () => {
  const { data: content } = useLandingContent();
  const [amount, setAmount] = useState(500);
  if (content?.sectionsEnabled?.commissions === false) return null;
  const disclaimerShort = content?.socialProof?.disclaimerShort || '* Resultados dependen de tu gestión y actividad. Pago mensual según política.';

  const currentTier = getTier(amount);
  const commission = Math.round(amount * (currentTier.rate / 100));
  const networkBonus = Math.round(commission * 0.12); // 7% + 5% cascade simplified
  const totalEstimated = commission + networkBonus;

  return (
    <section id="comisiones" className="py-28 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/[0.04] to-background" />
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
            Arrastrá el slider para calcular tu ganancia estimada
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {/* Interactive Calculator */}
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
                <h3 className="font-display text-xl font-bold">Calculadora de comisiones</h3>
                <p className="text-sm text-muted-foreground">Ajustá el monto y mirá tu ganancia</p>
              </div>
            </div>

            {/* Slider */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted-foreground">Positivo mensual</span>
                <motion.span
                  className="font-display text-2xl font-black text-primary"
                  layout
                >
                  <AnimatedNumber value={amount} prefix="$" />
                </motion.span>
              </div>
              <Slider
                value={[amount]}
                onValueChange={(v) => setAmount(v[0])}
                min={50}
                max={2000}
                step={50}
                className="my-4"
              />
              <div className="flex justify-between text-xs text-muted-foreground/60">
                <span>$50</span>
                <span>$2,000</span>
              </div>
            </div>

            {/* Tier indicator */}
            <div className="space-y-3 mb-6">
              {tiers.map((tier) => (
                <div
                  key={tier.rate}
                  className={`flex items-center justify-between p-3.5 rounded-xl border transition-all duration-300 ${
                    currentTier.rate === tier.rate
                      ? 'bg-primary/15 border-primary/40 shadow-lg shadow-primary/10 scale-[1.02]'
                      : 'bg-card/30 border-border/30 opacity-50'
                  }`}
                >
                  <span className="text-foreground/80 text-sm font-medium">
                    ${tier.min.toLocaleString()} – ${tier.max === 2000 ? '1,001+' : tier.max.toLocaleString()}
                  </span>
                  <div className="flex items-center gap-2">
                    {currentTier.rate === tier.rate && <Sparkles className="w-4 h-4 text-primary animate-pulse" />}
                    <span className={`font-display text-xl font-black ${currentTier.rate === tier.rate ? 'text-primary' : 'text-foreground/50'}`}>
                      {tier.rate}%
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Results */}
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 rounded-xl bg-primary/10 border border-primary/20">
                <p className="text-[10px] uppercase text-muted-foreground mb-1">Comisión</p>
                <p className="font-display text-lg font-black text-primary">
                  <AnimatedNumber value={commission} prefix="$" />
                </p>
              </div>
              <div className="text-center p-3 rounded-xl bg-gold/10 border border-gold/20">
                <p className="text-[10px] uppercase text-muted-foreground mb-1">Bono red</p>
                <p className="font-display text-lg font-black text-gold">
                  <AnimatedNumber value={networkBonus} prefix="+$" />
                </p>
              </div>
              <div className="text-center p-3 rounded-xl bg-primary/15 border border-primary/30">
                <p className="text-[10px] uppercase text-muted-foreground mb-1">Total est.</p>
                <p className="font-display text-lg font-black text-primary">
                  <AnimatedNumber value={totalEstimated} prefix="$" />
                </p>
              </div>
            </div>
          </motion.div>

          {/* Cascade bonus - kept similar */}
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
                <motion.div
                  animate={{ y: [0, 4, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center"
                >
                  <ArrowDown className="w-4 h-4 text-muted-foreground/50" />
                </motion.div>
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
