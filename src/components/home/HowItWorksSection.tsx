import { motion } from 'framer-motion';
import { MessageCircle, CreditCard, Gamepad2, Wallet, ArrowRight, CheckCircle } from 'lucide-react';
import { ScrollReveal } from './ScrollReveal';
import { Button } from '@/components/ui/button';

const steps = [
  {
    number: '01',
    icon: MessageCircle,
    title: 'Contacta por WhatsApp',
    description: 'Escríbenos y en minutos creamos tu cuenta. Sin formularios complicados.',
    color: 'text-[#25D366]',
    bgColor: 'bg-[#25D366]/10',
    borderColor: 'border-[#25D366]/30',
  },
  {
    number: '02',
    icon: CreditCard,
    title: 'Recarga tu cuenta',
    description: 'Acepta transferencias, USDT o Binance. Tu agente te guía paso a paso.',
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    borderColor: 'border-primary/30',
  },
  {
    number: '03',
    icon: Gamepad2,
    title: 'Juega y gana',
    description: 'Deportes, casino en vivo, slots y más. Miles de opciones para ti.',
    color: 'text-gold',
    bgColor: 'bg-gold/10',
    borderColor: 'border-gold/30',
  },
  {
    number: '04',
    icon: Wallet,
    title: 'Retira fácil',
    description: 'Solicita tu retiro por WhatsApp y recibe en tu banco en minutos.',
    color: 'text-accent',
    bgColor: 'bg-accent/10',
    borderColor: 'border-accent/30',
  },
];

export const HowItWorksSection = () => {
  return (
    <section id="como-funciona" className="py-20 md:py-28 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/4 right-0 w-[400px] h-[400px] bg-gold/10 rounded-full blur-[120px]" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <ScrollReveal>
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 mb-6"
            >
              <CheckCircle className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">FÁCIL Y RÁPIDO</span>
            </motion.div>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              Cómo <span className="text-gradient-primary">Empezar</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              En solo 4 pasos ya estarás jugando con nosotros
            </p>
          </div>
        </ScrollReveal>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <ScrollReveal key={i} delay={i * 100}>
                <motion.div
                  className={`relative p-6 rounded-3xl border ${step.borderColor} bg-card/50 backdrop-blur-sm h-full group hover:shadow-lg transition-all duration-500`}
                  whileHover={{ y: -5 }}
                >
                  {/* Step number */}
                  <div className="absolute -top-3 -right-3 w-12 h-12 rounded-full bg-background border border-white/10 flex items-center justify-center">
                    <span className={`font-display font-bold text-sm ${step.color}`}>{step.number}</span>
                  </div>

                  {/* Connector line (desktop) */}
                  {i < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-0.5 bg-gradient-to-r from-white/20 to-transparent" />
                  )}

                  {/* Icon */}
                  <div className={`w-16 h-16 rounded-2xl ${step.bgColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className={`w-8 h-8 ${step.color}`} />
                  </div>

                  <h3 className="font-display font-bold text-lg mb-2">{step.title}</h3>
                  <p className="text-muted-foreground text-sm">{step.description}</p>
                </motion.div>
              </ScrollReveal>
            );
          })}
        </div>

        {/* CTA */}
        <ScrollReveal delay={400}>
          <div className="text-center">
            <Button 
              variant="hero" 
              size="xl"
              onClick={() => window.open('https://wa.me/59176356972?text=Hola, quiero empezar a jugar', '_blank')}
              className="shadow-lg shadow-primary/25"
            >
              <MessageCircle className="w-5 h-5" />
              Empezar Ahora
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};
