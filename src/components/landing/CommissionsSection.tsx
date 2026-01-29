import { motion } from 'framer-motion';
import { Percent, Users, ArrowDown, TrendingUp } from 'lucide-react';

const tiers = [
  { range: '$1 - $500', rate: '25%' },
  { range: '$501 - $750', rate: '30%' },
  { range: '$751 - $1,000', rate: '35%' },
  { range: '+$1,001', rate: '40%' },
];

export const CommissionsSection = () => {
  return (
    <section id="comisiones" className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            <span className="text-gradient-primary">Comisiones</span> + Cascada
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Comisiones calculadas sobre el total de positivos del ciclo mensual
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Commission tiers */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="glass-card rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Percent className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-display text-xl font-semibold">Escala de comisiones</h3>
            </div>
            
            <div className="space-y-3">
              {tiers.map((tier, index) => (
                <motion.div
                  key={tier.range}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-3 rounded-xl bg-card/50 border border-border hover:border-primary/30 transition-colors"
                >
                  <span className="text-foreground/80">{tier.range}</span>
                  <span className="font-display text-xl font-bold text-primary">{tier.rate}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Cascade bonus */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="glass-card rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-gold" />
              </div>
              <h3 className="font-display text-xl font-semibold">Bono en cascada</h3>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-primary/10 border border-primary/20">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center font-display font-bold text-primary">
                  7%
                </div>
                <div>
                  <p className="font-semibold text-foreground">Línea 1</p>
                  <p className="text-sm text-muted-foreground">Referidos directos</p>
                </div>
              </div>
              
              <div className="flex justify-center">
                <ArrowDown className="w-5 h-5 text-muted-foreground" />
              </div>
              
              <div className="flex items-center gap-4 p-4 rounded-xl bg-gold/10 border border-gold/20">
                <div className="w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center font-display font-bold text-gold">
                  5%
                </div>
                <div>
                  <p className="font-semibold text-foreground">Línea 2</p>
                  <p className="text-sm text-muted-foreground">Referidos de tus referidos</p>
                </div>
              </div>
            </div>

            {/* Example */}
            <div className="p-4 rounded-xl bg-card border border-border">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-foreground">Ejemplo</span>
              </div>
              <p className="text-sm text-muted-foreground">
                1 agente directo + 3 sub-agentes = <strong className="text-foreground">Ingreso Base + ~21% extra</strong>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
