import { motion } from 'framer-motion';
import { DollarSign, Smartphone, Clock, UserCheck, CheckCircle2 } from 'lucide-react';

const requirements = [
  {
    icon: Smartphone,
    title: 'Smartphone + Internet',
    description: 'Conexión estable para operar',
    note: 'Todo desde tu celular',
  },
  {
    icon: Clock,
    title: 'Disponibilidad diaria',
    description: 'Al menos 2-3 horas por día',
    note: 'Tú manejas tu horario',
  },
  {
    icon: DollarSign,
    title: 'Banca operativa',
    description: 'Capital de trabajo para atender',
    note: 'Lo usás y lo recuperás',
  },
  {
    icon: UserCheck,
    title: 'Responsabilidad',
    description: 'Trato profesional con personas',
    note: 'Construís tu reputación',
  },
];

export const RequirementsSection = () => {
  return (
    <section id="requisitos" className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-gold/5 to-background" />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            <span className="text-gradient-gold">Requisitos</span> mínimos
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Barrera de entrada baja para que puedas comenzar rápido
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {requirements.map((req, index) => (
            <motion.div
              key={req.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="glass-card rounded-2xl p-6 group hover:border-gold/30 transition-all duration-300"
            >
              <div className="w-12 h-12 mb-4 rounded-xl bg-gold/10 flex items-center justify-center group-hover:bg-gold/20 transition-colors">
                <req.icon className="w-6 h-6 text-gold" />
              </div>
              <h3 className="font-display text-base font-semibold mb-1 text-foreground">
                {req.title}
              </h3>
              <p className="text-sm text-foreground/80 mb-2">
                {req.description}
              </p>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-primary" />
                {req.note}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <p className="text-sm text-muted-foreground bg-card/50 inline-block px-4 py-2 rounded-full border border-border">
            💡 No necesitás experiencia previa · Te capacitamos en todo
          </p>
        </motion.div>
      </div>
    </section>
  );
};
