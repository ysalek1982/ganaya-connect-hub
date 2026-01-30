import { motion } from 'framer-motion';
import { MessageSquare, UserCheck, Link2 } from 'lucide-react';

const steps = [
  {
    icon: MessageSquare,
    step: 1,
    title: 'Postulás por chat',
    description: 'Completás una entrevista rápida de 2 minutos con nuestro asistente.',
    color: 'primary',
  },
  {
    icon: UserCheck,
    step: 2,
    title: 'Te contactamos',
    description: 'Evaluamos tu perfil y coordinamos un onboarding personalizado.',
    color: 'gold',
  },
  {
    icon: Link2,
    step: 3,
    title: 'Comenzás a operar',
    description: 'Recibís tu enlace, tu banca y empezás a generar ingresos.',
    color: 'primary',
  },
];

export const HowItWorksSection = () => {
  return (
    <section id="como-funciona" className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            <span className="text-gradient-primary">Cómo funciona</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            En 3 simples pasos comenzás a generar ingresos
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6">
            {steps.map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                className="glass-card rounded-2xl p-6 text-center relative group hover:border-primary/30 transition-all duration-300"
              >
                {/* Step number */}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-primary flex items-center justify-center font-display font-bold text-primary-foreground text-sm shadow-lg shadow-primary/30">
                  {item.step}
                </div>
                
                <div 
                  className="w-16 h-16 mx-auto mb-4 mt-2 rounded-2xl flex items-center justify-center transition-colors"
                  style={{
                    backgroundColor: item.color === 'primary' ? 'hsl(var(--primary) / 0.1)' : 'hsl(var(--gold) / 0.1)',
                  }}
                >
                  <item.icon 
                    className="w-8 h-8" 
                    style={{
                      color: item.color === 'primary' ? 'hsl(var(--primary))' : 'hsl(var(--gold))',
                    }}
                  />
                </div>
                
                <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
