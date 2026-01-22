import { motion } from 'framer-motion';
import { TrendingUp, DollarSign, Users, Clock } from 'lucide-react';
import { ScrollReveal } from './ScrollReveal';
import { AnimatedCounter } from './AnimatedCounter';

const stats = [
  { 
    icon: TrendingUp, 
    value: 15000, 
    suffix: '+', 
    label: 'Apuestas hoy',
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    borderColor: 'border-primary/20'
  },
  { 
    icon: DollarSign, 
    value: 250000, 
    prefix: '$', 
    suffix: '', 
    label: 'Pagado esta semana',
    color: 'text-gold',
    bgColor: 'bg-gold/10',
    borderColor: 'border-gold/20'
  },
  { 
    icon: Users, 
    value: 5000, 
    suffix: '+', 
    label: 'Jugadores activos',
    color: 'text-[#25D366]',
    bgColor: 'bg-[#25D366]/10',
    borderColor: 'border-[#25D366]/20'
  },
  { 
    icon: Clock, 
    value: 3, 
    suffix: ' min', 
    label: 'Tiempo promedio de retiro',
    color: 'text-accent',
    bgColor: 'bg-accent/10',
    borderColor: 'border-accent/20'
  },
];

export const LiveStatsBar = () => {
  return (
    <section className="py-8 bg-card/50 border-y border-white/5 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          animate={{ x: ['0%', '100%'] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          className="absolute top-0 left-0 w-1/3 h-full bg-gradient-to-r from-transparent via-primary/5 to-transparent"
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <ScrollReveal key={i} delay={i * 100}>
                <motion.div
                  className={`flex items-center gap-4 p-4 rounded-2xl ${stat.bgColor} border ${stat.borderColor}`}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <div>
                    <div className="flex items-baseline gap-1">
                      {stat.prefix && <span className={`text-lg font-bold ${stat.color}`}>{stat.prefix}</span>}
                      <span className={`text-2xl md:text-3xl font-display font-bold ${stat.color}`}>
                        <AnimatedCounter value={stat.value} suffix="" label="" />
                      </span>
                      {stat.suffix && <span className={`text-lg font-bold ${stat.color}`}>{stat.suffix}</span>}
                    </div>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                </motion.div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
};
