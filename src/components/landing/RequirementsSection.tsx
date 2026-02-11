import { motion } from 'framer-motion';
import { Smartphone, Clock, Wallet, UserCheck, CheckCircle2, Lightbulb } from 'lucide-react';

const requirements = [
  { icon: Smartphone, title: 'Smartphone + Internet', description: 'Conexión estable para operar', note: 'Todo desde tu celular' },
  { icon: Clock, title: 'Disponibilidad diaria', description: 'Al menos 2-3 horas por día', note: 'Tú manejas tu horario' },
  { icon: Wallet, title: 'Banca operativa', description: 'Capital de trabajo para atender', note: 'Lo usás y lo recuperás' },
  { icon: UserCheck, title: 'Mayor de 18 años', description: 'Requisito indispensable', note: 'Juego responsable' },
];

export const RequirementsSection = () => {
  return (
    <section id="requisitos" className="py-28 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-gold/[0.03] to-background" />
      <div className="absolute top-1/2 right-0 w-[300px] h-[300px] bg-gold/[0.04] rounded-full blur-[100px]" />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/10 border border-gold/20 text-gold text-sm font-semibold mb-6 uppercase tracking-wide">
            Lo que necesitás
          </span>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-5">
            <span className="text-gradient-gold">Requisitos</span> mínimos
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto leading-relaxed">
            Barrera de entrada baja para que puedas comenzar rápido
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-5xl mx-auto mb-10">
          {requirements.map((req, index) => (
            <motion.div
              key={req.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, type: 'spring', stiffness: 100 }}
              className="relative bg-card/60 backdrop-blur-sm rounded-2xl p-7 border border-border/50 hover:border-gold/30 transition-all duration-500 group hover:-translate-y-1"
            >
              {/* Top accent */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-0.5 rounded-b-full bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
              
              <div className="w-14 h-14 mb-6 rounded-2xl bg-gold/10 flex items-center justify-center group-hover:bg-gold/20 group-hover:scale-110 transition-all duration-300">
                <req.icon className="w-7 h-7 text-gold" />
              </div>
              <h3 className="font-display text-base font-bold mb-2 text-foreground">{req.title}</h3>
              <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{req.description}</p>
              <p className="text-xs text-primary flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {req.note}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-2 text-sm text-muted-foreground bg-card/60 px-5 py-3 rounded-full border border-border/50">
            <Lightbulb className="w-4 h-4 text-gold" />
            No necesitás experiencia previa · Te capacitamos en todo
          </div>
        </motion.div>
      </div>
    </section>
  );
};
