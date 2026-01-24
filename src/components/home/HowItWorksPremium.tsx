import { motion } from 'framer-motion';
import { MessageCircle, UserCheck, CreditCard, Gamepad2, Send, Star, Briefcase, TrendingUp } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const HowItWorksPremium = () => {
  const playerSteps = [
    {
      icon: MessageCircle,
      title: 'Escribes',
      description: 'Contacta por WhatsApp o Telegram',
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      icon: UserCheck,
      title: 'Cajero te asiste',
      description: 'Un agente personal te guía',
      color: 'text-gold',
      bgColor: 'bg-gold/10',
    },
    {
      icon: CreditCard,
      title: 'Recargas/Retiras',
      description: 'USDT vía Binance, rápido y seguro',
      color: 'text-accent',
      bgColor: 'bg-accent/10',
    },
    {
      icon: Gamepad2,
      title: 'Juegas',
      description: 'Casino en vivo y deportes',
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
  ];

  const agentSteps = [
    {
      icon: Send,
      title: 'Postulas',
      description: 'Completa el formulario de cajero',
      color: 'text-gold',
      bgColor: 'bg-gold/10',
    },
    {
      icon: Star,
      title: 'Evaluación',
      description: 'Revisamos tu perfil y experiencia',
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      icon: Briefcase,
      title: 'Te asignan línea',
      description: 'Recibes tu link y herramientas',
      color: 'text-accent',
      bgColor: 'bg-accent/10',
    },
    {
      icon: TrendingUp,
      title: 'Ganas comisiones',
      description: 'Por cada jugador que refieras',
      color: 'text-gold',
      bgColor: 'bg-gold/10',
    },
  ];

  const renderSteps = (steps: typeof playerSteps) => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
      {steps.map((step, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.1 }}
          className="relative"
        >
          {/* Connector line */}
          {i < steps.length - 1 && (
            <div className="hidden md:block absolute top-10 left-[60%] w-[80%] h-px bg-gradient-to-r from-primary/30 to-transparent" />
          )}
          
          <div className="glass-card p-6 rounded-2xl text-center h-full hover:border-primary/30 transition-colors">
            <div className={`w-14 h-14 ${step.bgColor} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
              <step.icon className={`w-7 h-7 ${step.color}`} />
            </div>
            <div className="text-xs text-muted-foreground mb-1">Paso {i + 1}</div>
            <h3 className="font-display font-bold text-lg mb-2">{step.title}</h3>
            <p className="text-sm text-muted-foreground">{step.description}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );

  return (
    <section className="py-20 md:py-28 relative">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            ¿Cómo <span className="text-gradient-primary">funciona</span>?
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Proceso simple y directo, ya sea que quieras jugar o ganar como cajero
          </p>
        </motion.div>

        <Tabs defaultValue="player" className="max-w-4xl mx-auto">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-10">
            <TabsTrigger value="player" className="gap-2">
              <Gamepad2 className="w-4 h-4" />
              Soy Jugador
            </TabsTrigger>
            <TabsTrigger value="agent" className="gap-2">
              <Briefcase className="w-4 h-4" />
              Quiero ser Cajero
            </TabsTrigger>
          </TabsList>

          <TabsContent value="player">
            {renderSteps(playerSteps)}
          </TabsContent>

          <TabsContent value="agent">
            {renderSteps(agentSteps)}
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
};
