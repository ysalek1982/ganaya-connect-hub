import { motion } from 'framer-motion';
import { Zap, MessageCircle, Wallet, Lock, ShieldCheck, Headphones } from 'lucide-react';

const benefits = [
  {
    icon: Zap,
    title: 'Retiros rápidos',
    description: 'Recibe tu dinero en minutos, no días',
    color: 'text-gold',
    bgColor: 'bg-gold/10',
  },
  {
    icon: MessageCircle,
    title: 'WhatsApp / Telegram',
    description: 'Atención directa por tu cajero personal',
    color: 'text-[#25D366]',
    bgColor: 'bg-[#25D366]/10',
  },
  {
    icon: Wallet,
    title: 'USDT / Binance',
    description: 'Opera con criptomonedas de forma segura',
    color: 'text-primary',
    bgColor: 'bg-primary/10',
  },
  {
    icon: Lock,
    title: 'Privacidad total',
    description: 'Tus datos y transacciones son confidenciales',
    color: 'text-accent',
    bgColor: 'bg-accent/10',
  },
  {
    icon: ShieldCheck,
    title: 'Control garantizado',
    description: 'Límites de depósito y juego responsable +18',
    color: 'text-gold',
    bgColor: 'bg-gold/10',
  },
  {
    icon: Headphones,
    title: 'Soporte 24/7',
    description: 'Siempre hay un cajero disponible para ti',
    color: 'text-primary',
    bgColor: 'bg-primary/10',
  },
];

export const BenefitsPremium = () => {
  return (
    <section className="py-20 md:py-28 relative">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[150px]" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            ¿Por qué <span className="text-gradient-primary">Ganaya</span>?
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            La mejor experiencia de casino online con atención personalizada
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {benefits.map((benefit, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -4 }}
              className="glass-card p-6 rounded-2xl hover:border-primary/30 transition-all group"
            >
              <div className={`w-12 h-12 ${benefit.bgColor} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <benefit.icon className={`w-6 h-6 ${benefit.color}`} />
              </div>
              <h3 className="font-display font-bold text-lg mb-2">{benefit.title}</h3>
              <p className="text-sm text-muted-foreground">{benefit.description}</p>
            </motion.div>
          ))}
        </div>

        {/* +18 Notice */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 text-muted-foreground text-sm">
            <ShieldCheck className="w-4 h-4" />
            <span>Juego responsable · Solo mayores de 18 años</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
