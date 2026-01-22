import { motion } from 'framer-motion';
import { ScrollReveal } from './ScrollReveal';

// Payment methods and partners logos (using text/icons as placeholders)
const paymentMethods = [
  { name: 'USDT', icon: '₮' },
  { name: 'Binance', icon: 'B' },
  { name: 'Bitcoin', icon: '₿' },
  { name: 'Transferencia', icon: '🏦' },
  { name: 'QR', icon: '📱' },
];

const providers = [
  { name: 'Pragmatic', color: 'text-primary' },
  { name: 'Evolution', color: 'text-gold' },
  { name: 'Spribe', color: 'text-accent' },
  { name: 'Playtech', color: 'text-[#25D366]' },
  { name: 'NetEnt', color: 'text-purple-400' },
  { name: 'Red Tiger', color: 'text-orange-400' },
];

export const PartnersSection = () => {
  return (
    <section className="py-12 md:py-16 border-t border-b border-white/5 bg-card/30">
      <div className="container mx-auto px-4">
        <ScrollReveal>
          <div className="space-y-8">
            {/* Payment Methods */}
            <div>
              <p className="text-center text-xs text-muted-foreground uppercase tracking-wider mb-6">
                Métodos de pago aceptados
              </p>
              <motion.div 
                className="flex flex-wrap items-center justify-center gap-4 md:gap-8"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
              >
                {paymentMethods.map((method, i) => (
                  <motion.div
                    key={i}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 hover:border-primary/30 transition-colors"
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    whileHover={{ scale: 1.05 }}
                  >
                    <span className="text-lg">{method.icon}</span>
                    <span className="text-sm font-medium text-muted-foreground">{method.name}</span>
                  </motion.div>
                ))}
              </motion.div>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              <span className="text-xs text-muted-foreground/50">powered by</span>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            </div>

            {/* Game Providers */}
            <motion.div 
              className="flex flex-wrap items-center justify-center gap-6 md:gap-10"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
            >
              {providers.map((provider, i) => (
                <motion.div
                  key={i}
                  className={`font-display font-bold text-lg md:text-xl opacity-50 hover:opacity-100 transition-opacity cursor-default ${provider.color}`}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 0.5, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ scale: 1.1, opacity: 1 }}
                >
                  {provider.name}
                </motion.div>
              ))}
            </motion.div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};
