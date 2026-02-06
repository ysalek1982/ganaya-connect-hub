import { motion } from 'framer-motion';
import { Check, X, Briefcase, Trophy } from 'lucide-react';
import { useLandingContent } from '@/hooks/useLandingContent';

interface ComparisonRow {
  traditional: string;
  ganaya: string;
}

const defaultVsEmployment: ComparisonRow[] = [
  { traditional: 'Oficina y desplazamiento', ganaya: '100% móvil' },
  { traditional: 'Inventario físico', ganaya: 'Sin inventario, digital' },
  { traditional: 'Empleados que gestionar', ganaya: 'Negocio personal' },
  { traditional: 'Ingresos limitados', ganaya: 'Ingresos escalables' },
];

const defaultVsPlatforms: ComparisonRow[] = [
  { traditional: 'Comisiones 15–25% máx', ganaya: 'Hasta 40%' },
  { traditional: 'Banca inicial $500–$1,000', ganaya: '$300 para empezar' },
  { traditional: 'Sistemas complejos', ganaya: 'Operación simple' },
  { traditional: 'Multinivel confuso', ganaya: 'Modelo transparente' },
];

const ComparisonTable = ({ title, icon: Icon, rows, delay }: { title: string; icon: React.ComponentType<{ className?: string }>; rows: ComparisonRow[]; delay: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay }}
    className="bg-card/40 backdrop-blur-sm rounded-2xl p-6 lg:p-8 border border-border/50"
  >
    <div className="flex items-center gap-3 mb-6">
      <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <h3 className="font-display text-xl font-semibold">{title}</h3>
    </div>

    <div className="space-y-3">
      {rows.map((row, index) => (
        <div key={index} className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/5 border border-destructive/10">
            <X className="w-4 h-4 text-destructive shrink-0" />
            <span className="text-sm text-muted-foreground">{row.traditional}</span>
          </div>
          <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/5 border border-primary/10">
            <Check className="w-4 h-4 text-primary shrink-0" />
            <span className="text-sm text-foreground font-medium">{row.ganaya}</span>
          </div>
        </div>
      ))}
    </div>
  </motion.div>
);

export const CompetitiveSection = () => {
  const { data: content } = useLandingContent();

  if (content?.sectionsEnabled?.competitive === false) return null;

  const cms = content?.competitiveSection;
  const title = cms?.title || 'Ventajas competitivas';
  const subtitle = cms?.subtitle || 'Por qué Ganaya.bet es diferente';
  const vsEmployment = cms?.vsEmployment && cms.vsEmployment.length > 0 ? cms.vsEmployment : defaultVsEmployment;
  const vsPlatforms = cms?.vsPlatforms && cms.vsPlatforms.length > 0 ? cms.vsPlatforms : defaultVsPlatforms;

  return (
    <section id="ventajas" className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-[hsl(var(--surface-1))] to-background" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-4">
            Comparativa
          </span>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            <span className="text-gradient-primary">Ventajas</span> competitivas
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            {subtitle}
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <ComparisonTable title="VS Empleos tradicionales" icon={Briefcase} rows={vsEmployment} delay={0} />
          <ComparisonTable title="VS Otras plataformas" icon={Trophy} rows={vsPlatforms} delay={0.15} />
        </div>
      </div>
    </section>
  );
};
