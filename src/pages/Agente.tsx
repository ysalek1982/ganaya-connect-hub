import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, DollarSign, Users, Clock, Shield, MessageSquare, ChevronRight } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { StadiumLights } from '@/components/home/StadiumLights';
import { ScrollReveal } from '@/components/home/ScrollReveal';
import AIChatDrawer from '@/components/chat/AIChatDrawer';
import { Button } from '@/components/ui/button';

const commissionTiers = [
  { range: '$1 – $500', percentage: '25%', level: 'Inicial', color: 'text-muted-foreground' },
  { range: '$501 – $750', percentage: '30%', level: 'Intermedio', color: 'text-gold' },
  { range: '$751 – $1.000', percentage: '35%', level: 'Avanzado', color: 'text-primary' },
  { range: '$1.001+', percentage: '40%', level: 'Elite', color: 'text-accent' },
];

const requirements = [
  { icon: Shield, title: 'Binance Verificada', desc: 'Cuenta activa para operar USDT P2P' },
  { icon: DollarSign, title: 'Banca Mínima $300', desc: 'Capital operativo para atender clientes' },
  { icon: MessageSquare, title: 'WhatsApp/Telegram', desc: 'Comunicación activa y respuesta rápida' },
  { icon: Clock, title: 'Disponibilidad', desc: 'Mínimo 3-5 horas diarias de atención' },
];

const dailyTasks = [
  'Responder consultas en menos de 5 minutos',
  'Registrar todas las transacciones',
  'Verificación en montos mayores',
  'Mantener orden y trazabilidad',
  'Reportar novedades al equipo',
];

const Agente = () => {
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <StadiumLights />
      <Header />

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="container mx-auto relative z-10">
          <ScrollReveal>
            <div className="max-w-4xl mx-auto text-center">
              <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                Oportunidad de Negocio
              </span>
              <h1 className="font-display text-4xl md:text-6xl font-bold mb-6">
                Generá ingresos como{' '}
                <span className="text-gradient">agente de Ganaya.bet</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Hasta <span className="text-primary font-bold">40%</span> por positivo mensual +{' '}
                <span className="text-gold font-bold">7%/5%</span> por tu red. 100% móvil, sin horarios fijos.
              </p>
              <Button onClick={() => setChatOpen(true)} variant="hero" size="lg" className="text-lg px-8">
                Postularme ahora
                <ChevronRight className="ml-2 w-5 h-5" />
              </Button>
              <p className="text-sm text-muted-foreground mt-4">
                Tu postulación se evalúa en minutos con nuestro asistente IA
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Commission Table */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <ScrollReveal>
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
                Cómo <span className="text-gradient">ganás</span>
              </h2>
              <p className="text-muted-foreground">
                Comisión sobre el <strong>positivo mensual</strong> (pérdidas netas de tus clientes)
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <div className="glass-card rounded-2xl overflow-hidden mb-8">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="p-4 text-left font-semibold">Positivo Mensual</th>
                    <th className="p-4 text-center font-semibold">Comisión</th>
                    <th className="p-4 text-right font-semibold">Nivel</th>
                  </tr>
                </thead>
                <tbody>
                  {commissionTiers.map((tier, i) => (
                    <tr key={i} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                      <td className="p-4 font-medium">{tier.range}</td>
                      <td className={`p-4 text-center font-display text-2xl font-bold ${tier.color}`}>
                        {tier.percentage}
                      </td>
                      <td className="p-4 text-right">
                        <span className={`px-3 py-1 rounded-full text-sm ${tier.color} bg-current/10`}>
                          {tier.level}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="glass-card rounded-xl p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 text-gold" />
                </div>
                <h3 className="font-display text-2xl font-bold text-gold mb-2">+7%</h3>
                <p className="text-muted-foreground">Línea 1 (referidos directos)</p>
              </div>
              <div className="glass-card rounded-xl p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-display text-2xl font-bold text-primary mb-2">+5%</h3>
                <p className="text-muted-foreground">Línea 2 (referidos de referidos)</p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Requirements */}
      <section className="py-20 px-4 bg-gradient-to-b from-transparent via-muted/30 to-transparent">
        <div className="container mx-auto max-w-5xl">
          <ScrollReveal>
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
                Requisitos para <span className="text-gradient">ser agente</span>
              </h2>
              <p className="text-muted-foreground">
                Verificamos estos puntos durante tu postulación
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {requirements.map((req, i) => (
              <ScrollReveal key={i} delay={i * 0.1}>
                <div className="glass-card rounded-xl p-6 h-full hover:border-primary/50 transition-colors">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <req.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{req.title}</h3>
                  <p className="text-sm text-muted-foreground">{req.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Daily Operations */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-3xl">
          <ScrollReveal>
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
                Operación <span className="text-gradient">diaria</span>
              </h2>
              <p className="text-muted-foreground">
                Lo que esperamos de un agente profesional
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <div className="glass-card rounded-xl p-8">
              <ul className="space-y-4">
                {dailyTasks.map((task, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-4 h-4 text-primary" />
                    </div>
                    <span>{task}</span>
                  </li>
                ))}
              </ul>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-2xl text-center">
          <ScrollReveal>
            <div className="glass-card rounded-2xl p-8 md:p-12 border-primary/20">
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
                ¿Listo para empezar?
              </h2>
              <p className="text-muted-foreground mb-8">
                Completá tu postulación en menos de 5 minutos. Nuestro asistente IA evaluará tu perfil al instante.
              </p>
              <Button onClick={() => setChatOpen(true)} variant="hero" size="lg" className="text-lg px-8">
                Postularme ahora
                <ChevronRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <Footer />

      {/* AI Chat Drawer */}
      <AIChatDrawer open={chatOpen} onOpenChange={setChatOpen} initialMessage="Quiero ser agente" />
    </div>
  );
};

export default Agente;
