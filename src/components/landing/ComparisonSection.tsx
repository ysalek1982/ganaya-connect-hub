import { motion } from 'framer-motion';
import { X, Check } from 'lucide-react';

const comparisons = [
  {
    title: 'VS Empleos tradicionales',
    items: [
      { bad: 'Oficina y desplazamiento', good: '100% móvil' },
      { bad: 'Inventario físico', good: 'Sin inventario, digital' },
      { bad: 'Empleados que gestionar', good: 'Negocio personal' },
      { bad: 'Ingresos limitados', good: 'Ingresos escalables' },
    ],
  },
  {
    title: 'VS Otras plataformas',
    items: [
      { bad: 'Comisiones 15–25% máx', good: 'Hasta 40%' },
      { bad: 'Banca inicial $500–$1,000', good: '$300 para empezar' },
      { bad: 'Sistemas complejos', good: 'Operación simple' },
      { bad: 'Multinivel confuso', good: 'Modelo transparente' },
    ],
  },
];

export const ComparisonSection = () => {
  return (
    <section id="ventajas" className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-card/30 to-background" />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            <span className="text-gradient-primary">Ventajas</span> competitivas
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Por qué Ganaya.bet es diferente
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {comparisons.map((comparison, compIndex) => (
            <motion.div
              key={comparison.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: compIndex * 0.1 }}
              className="glass-card rounded-2xl p-6"
            >
              <h3 className="font-display text-lg font-semibold mb-6 text-center text-foreground">
                {comparison.title}
              </h3>
              
              <div className="space-y-4">
                {comparison.items.map((item, index) => (
                  <div key={index} className="grid grid-cols-2 gap-4">
                    {/* Bad */}
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-accent/10 border border-accent/20">
                      <X className="w-4 h-4 text-accent shrink-0" />
                      <span className="text-sm text-foreground/70 line-through decoration-accent/50">{item.bad}</span>
                    </div>
                    {/* Good */}
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-primary/10 border border-primary/20">
                      <Check className="w-4 h-4 text-primary shrink-0" />
                      <span className="text-sm text-foreground font-medium">{item.good}</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
