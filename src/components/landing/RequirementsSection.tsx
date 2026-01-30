import { motion } from 'framer-motion';
import { Smartphone, Clock, Wallet, UserCheck, CheckCircle2 } from 'lucide-react';

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
    icon: Wallet,
    title: 'Banca operativa',
    description: 'Capital de trabajo para atender',
    note: 'Lo usás y lo recuperás',
  },
  {
    icon: UserCheck,
    title: 'Mayor de 18 años',
    description: 'Requisito indispensable',
    note: 'Juego responsable',
  },
];

export const RequirementsSection = () => {
  return (
    <section id="requisitos" className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-gold/[0.03] to-background" />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block px-3 py-1 rounded-full bg-gold/10 border border-gold/20 text-gold text-sm font-medium mb-4">
            Lo que necesitás
          </span>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            <span className="text-gradient-gold">Requisitos</span> mínimos
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Barrera de entrada baja para que puedas comenzar rápido
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto mb-10">
          {requirements.map((req, index) => (
            <motion.div
              key={req.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-card/40 backdrop-blur-sm rounded-2xl p-6 border border-border/50 hover:border-gold/20 transition-all duration-300 group"
            >
              <div className="w-12 h-12 mb-5 rounded-xl bg-gold/10 flex items-center justify-center group-hover:bg-gold/20 transition-colors">
                <req.icon className="w-6 h-6 text-gold" />
              </div>
              <h3 className="font-display text-base font-semibold mb-2 text-foreground">
                {req.title}
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                {req.description}
              </p>
              <p className="text-xs text-primary flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
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
          <p className="text-sm text-muted-foreground bg-card/40 inline-block px-5 py-2.5 rounded-full border border-border/50">
            💡 No necesitás experiencia previa · Te capacitamos en todo
          </p>
        </motion.div>
      </div>
    </section>
  );
};
