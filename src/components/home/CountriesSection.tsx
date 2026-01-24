import { motion } from 'framer-motion';
import { MapPin, Check } from 'lucide-react';

const countries = [
  { code: 'CL', name: 'Chile', flag: '🇨🇱' },
  { code: 'AR', name: 'Argentina', flag: '🇦🇷' },
  { code: 'PY', name: 'Paraguay', flag: '🇵🇾' },
  { code: 'CO', name: 'Colombia', flag: '🇨🇴' },
  { code: 'EC', name: 'Ecuador', flag: '🇪🇨' },
  { code: 'US', name: 'USA', flag: '🇺🇸' },
];

export const CountriesSection = () => {
  return (
    <section className="py-16 md:py-24 relative">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 mb-6">
            <MapPin className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Cobertura LATAM</span>
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            Países <span className="text-gradient-primary">disponibles</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Operamos con cajeros locales en cada país para una atención más cercana
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 max-w-4xl mx-auto">
          {countries.map((country, i) => (
            <motion.div
              key={country.code}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ scale: 1.05, y: -4 }}
              className="glass-card p-5 rounded-2xl text-center cursor-pointer group hover:border-primary/40 transition-all"
            >
              <div className="text-4xl mb-3">{country.flag}</div>
              <h3 className="font-semibold text-foreground mb-1">{country.name}</h3>
              <div className="flex items-center justify-center gap-1 text-xs text-primary">
                <Check className="w-3 h-3" />
                <span>Activo</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
