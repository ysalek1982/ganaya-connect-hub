import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Hero } from '@/components/home/Hero';
import { ScrollReveal } from '@/components/home/ScrollReveal';
import { AnimatedCounter } from '@/components/home/AnimatedCounter';
import { StadiumLights } from '@/components/home/StadiumLights';
import { MessageCircle, Zap, Shield, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

const Index = () => {
  const handleWhatsApp = () => {
    window.open('https://wa.me/595981123456?text=Hola!%20Quiero%20apostar%20en%20Ganaya.bet', '_blank');
  };

  const benefits = [
    { icon: MessageCircle, title: 'Soporte WhatsApp', desc: 'Atención 24/7 con agentes locales', color: 'text-[#25D366]' },
    { icon: Zap, title: 'Recargas rápidas', desc: 'USDT/Binance en segundos', color: 'text-primary' },
    { icon: Shield, title: 'Retiros guiados', desc: 'Tu agente te guía paso a paso', color: 'text-gold' },
    { icon: Building, title: 'Pagos locales', desc: 'Transferencia a tu banco', color: 'text-accent' },
  ];

  const steps = [
    { step: 1, title: 'Contactás al agente', desc: 'Escribinos por WhatsApp' },
    { step: 2, title: 'Recargás', desc: 'USDT, Binance P2P u opción local' },
    { step: 3, title: 'Jugás', desc: 'Deportes y casino en vivo' },
    { step: 4, title: 'Retirás', desc: 'El agente te guía y paga' },
  ];

  const faqs = [
    { q: '¿Cómo recargo?', a: 'Contactá a tu agente por WhatsApp. Te guiará para recargar con USDT/Binance o método local.' },
    { q: '¿Cómo retiro?', a: 'Pedí tu retiro al agente. Verificamos y transferimos a tu banco en 24hs.' },
    { q: '¿Es seguro?', a: '100%. Tu agente es tu punto de contacto personal. Datos protegidos.' },
    { q: '¿Qué métodos hay en mi país?', a: 'USDT/Binance P2P es el más rápido. También aceptamos transferencias locales.' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        
        {/* Benefits Section */}
        <section id="beneficios" className="py-20 md:py-28 bg-card relative overflow-hidden">
          <StadiumLights />
          <div className="container mx-auto px-4 relative z-10">
            <ScrollReveal>
              <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-4">
                ¿Por qué <span className="text-gradient-primary">Ganaya.bet</span>?
              </h2>
              <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-12">
                La mejor experiencia de apuestas en LATAM con soporte real
              </p>
            </ScrollReveal>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {benefits.map((item, i) => (
                <ScrollReveal key={i} delay={i * 100}>
                  <motion.div 
                    className="glass-card p-6 md:p-8 rounded-2xl text-center group cursor-pointer h-full"
                    whileHover={{ scale: 1.03, y: -5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-card flex items-center justify-center group-hover:scale-110 transition-transform ${item.color}`}>
                      <item.icon className="w-8 h-8" />
                    </div>
                    <h3 className="font-display font-semibold text-lg mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </motion.div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="como-funciona" className="py-20 md:py-28 relative">
          <div className="container mx-auto px-4">
            <ScrollReveal>
              <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-4">
                Cómo <span className="text-gradient-primary">funciona</span>
              </h2>
              <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-12">
                4 pasos simples para empezar a ganar
              </p>
            </ScrollReveal>
            
            <div className="max-w-4xl mx-auto">
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-primary via-primary/50 to-transparent" />
                
                {steps.map((item, i) => (
                  <ScrollReveal key={i} delay={i * 150} direction={i % 2 === 0 ? 'left' : 'right'}>
                    <div className={`flex items-start gap-4 md:gap-8 mb-12 last:mb-0 ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                      <div className={`flex-1 ${i % 2 === 0 ? 'md:text-right' : 'md:text-left'} hidden md:block`}>
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          className="glass-card p-6 rounded-xl inline-block"
                        >
                          <h3 className="font-display font-semibold text-lg mb-1">{item.title}</h3>
                          <p className="text-muted-foreground">{item.desc}</p>
                        </motion.div>
                      </div>
                      
                      <div className="relative z-10">
                        <motion.div 
                          className="w-12 h-12 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center pulse-glow"
                          whileHover={{ scale: 1.1 }}
                        >
                          <span className="font-display font-bold text-primary">{item.step}</span>
                        </motion.div>
                      </div>
                      
                      <div className="flex-1 md:hidden">
                        <h3 className="font-display font-semibold text-lg">{item.title}</h3>
                        <p className="text-muted-foreground">{item.desc}</p>
                      </div>
                      
                      <div className="flex-1 hidden md:block" />
                    </div>
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-20 md:py-28 bg-card relative overflow-hidden">
          <StadiumLights />
          <div className="container mx-auto px-4 relative z-10">
            <ScrollReveal>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-center mb-12">
                El mercado <span className="text-gradient-primary">crece</span>
              </h2>
            </ScrollReveal>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <AnimatedCounter value={25} prefix="+" suffix="%" label="Crecimiento anual iGaming LATAM" delay={0} />
              <AnimatedCounter value={85} suffix="%" label="Usuarios móviles" delay={200} />
              <AnimatedCounter value={85} prefix="$" suffix="B" label="Proyección 2026" delay={400} />
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="py-20 md:py-28">
          <div className="container mx-auto px-4 max-w-3xl">
            <ScrollReveal>
              <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-4">
                Preguntas <span className="text-gradient-primary">frecuentes</span>
              </h2>
              <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-12">
                Todo lo que necesitás saber
              </p>
            </ScrollReveal>
            
            <div className="space-y-4">
              {faqs.map((item, i) => (
                <ScrollReveal key={i} delay={i * 100}>
                  <motion.details 
                    className="glass-card rounded-xl p-5 group cursor-pointer"
                    whileHover={{ scale: 1.01 }}
                  >
                    <summary className="font-semibold cursor-pointer list-none flex justify-between items-center">
                      {item.q}
                      <span className="text-primary text-xl group-open:rotate-45 transition-transform duration-300">+</span>
                    </summary>
                    <motion.p 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mt-4 text-muted-foreground border-t border-border pt-4"
                    >
                      {item.a}
                    </motion.p>
                  </motion.details>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />

      {/* Mobile sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background/95 to-transparent md:hidden z-40">
        <Button variant="whatsapp" size="lg" className="w-full shadow-lg" onClick={handleWhatsApp}>
          <MessageCircle className="w-5 h-5" />
          WhatsApp 24/7
        </Button>
      </div>
    </div>
  );
};

export default Index;
