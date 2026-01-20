import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Hero } from '@/components/home/Hero';
import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Index = () => {
  const handleWhatsApp = () => {
    window.open('https://wa.me/595981123456?text=Hola!%20Quiero%20apostar%20en%20Ganaya.bet', '_blank');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        
        {/* Benefits Section */}
        <section id="beneficios" className="py-20 bg-card">
          <div className="container mx-auto px-4">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-center mb-12">
              ¿Por qué <span className="text-gradient-primary">Ganaya.bet</span>?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: '💬', title: 'Soporte WhatsApp', desc: 'Atención 24/7 con agentes locales' },
                { icon: '⚡', title: 'Recargas rápidas', desc: 'USDT/Binance en segundos' },
                { icon: '🛡️', title: 'Retiros guiados', desc: 'Tu agente te guía paso a paso' },
                { icon: '🏦', title: 'Pagos locales', desc: 'Transferencia a tu banco' },
              ].map((item, i) => (
                <div key={i} className="glass-card p-6 rounded-xl text-center hover:scale-105 transition-transform">
                  <div className="text-4xl mb-4">{item.icon}</div>
                  <h3 className="font-display font-semibold text-lg mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="como-funciona" className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-center mb-12">
              Cómo <span className="text-gradient-primary">funciona</span>
            </h2>
            <div className="max-w-3xl mx-auto">
              {[
                { step: 1, title: 'Contactás al agente', desc: 'Escribinos por WhatsApp' },
                { step: 2, title: 'Recargás', desc: 'USDT, Binance P2P u opción local' },
                { step: 3, title: 'Jugás', desc: 'Deportes y casino en vivo' },
                { step: 4, title: 'Retirás', desc: 'El agente te guía y paga' },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4 mb-8 last:mb-0">
                  <div className="w-12 h-12 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center flex-shrink-0">
                    <span className="font-display font-bold text-primary">{item.step}</span>
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-lg">{item.title}</h3>
                    <p className="text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-20 bg-card">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              {[
                { value: '+25%', label: 'Crecimiento anual iGaming LATAM' },
                { value: '85%', label: 'Usuarios móviles' },
                { value: '$8.5B', label: 'Proyección 2026' },
              ].map((stat, i) => (
                <div key={i}>
                  <div className="font-display text-4xl md:text-5xl font-bold text-gradient-primary mb-2">
                    {stat.value}
                  </div>
                  <p className="text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="py-20">
          <div className="container mx-auto px-4 max-w-3xl">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-center mb-12">
              Preguntas <span className="text-gradient-primary">frecuentes</span>
            </h2>
            <div className="space-y-4">
              {[
                { q: '¿Cómo recargo?', a: 'Contactá a tu agente por WhatsApp. Te guiará para recargar con USDT/Binance o método local.' },
                { q: '¿Cómo retiro?', a: 'Pedí tu retiro al agente. Verificamos y transferimos a tu banco en 24hs.' },
                { q: '¿Es seguro?', a: '100%. Tu agente es tu punto de contacto personal. Datos protegidos.' },
                { q: '¿Qué métodos hay en mi país?', a: 'USDT/Binance P2P es el más rápido. También aceptamos transferencias locales.' },
              ].map((item, i) => (
                <details key={i} className="glass-card rounded-xl p-4 group">
                  <summary className="font-semibold cursor-pointer list-none flex justify-between items-center">
                    {item.q}
                    <span className="text-primary group-open:rotate-45 transition-transform">+</span>
                  </summary>
                  <p className="mt-3 text-muted-foreground">{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />

      {/* Mobile sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background to-transparent md:hidden z-40">
        <Button variant="whatsapp" size="lg" className="w-full" onClick={handleWhatsApp}>
          <MessageCircle className="w-5 h-5" />
          WhatsApp 24/7
        </Button>
      </div>
    </div>
  );
};

export default Index;
