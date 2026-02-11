import { motion } from 'framer-motion';
import { Check, X, Briefcase, Trophy, Sparkles } from 'lucide-react';
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
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay, type: 'spring', stiffness: 100 }}
    className="bg-card/60 backdrop-blur-sm rounded-2xl p-7 lg:p-8 border border-border/50 hover:border-primary/30 transition-all duration-500"
  >
    <div className="flex items-center gap-3 mb-8">
      <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
        <Icon className="w-6 h-6 text-primary" />
      </div>
      <h3 className="font-display text-xl font-bold">{title}</h3>
    </div>

    {/* Column headers */}
    <div className="grid grid-cols-2 gap-3 mb-4">
      <div className="text-xs font-bold text-destructive/70 uppercase tracking-wider px-3">Tradicional</div>
      <div className="text-xs font-bold text-primary/70 uppercase tracking-wider px-3 flex items-center gap-1">
        <Sparkles className="w-3 h-3" /> Ganaya
      </div>
    </div>

    <div className="space-y-2.5">
      {rows.map((row, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, x: -10 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: delay + index * 0.08 }}
          className="grid grid-cols-2 gap-3"
        >
          <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-destructive/5 border border-destructive/10">
            <div className="w-5 h-5 rounded-full bg-destructive/15 flex items-center justify-center shrink-0">
              <X className="w-3 h-3 text-destructive" />
            </div>
            <span className="text-sm text-muted-foreground">{row.traditional}</span>
          </div>
          <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-primary/5 border border-primary/15">
            <div className="w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
              <Check className="w-3 h-3 text-primary" />
            </div>
            <span className="text-sm text-foreground font-semibold">{row.ganaya}</span>
          </div>
        </motion.div>
      ))}
    </div>
  </motion.div>
);

export const CompetitiveSection = () => {
  const { data: content } = useLandingContent();
  if (content?.sectionsEnabled?.competitive === false) return null;

  const cms = content?.competitiveSection;
  const subtitle = cms?.subtitle || 'Por qué Ganaya.bet es diferente';
  const vsEmployment = cms?.vsEmployment && cms.vsEmployment.length > 0 ? cms.vsEmployment : defaultVsEmployment;
  const vsPlatforms = cms?.vsPlatforms && cms.vsPlatforms.length > 0 ? cms.vsPlatforms : defaultVsPlatforms;

  return (
    <section id="ventajas" className="py-28 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-[hsl(var(--surface-1))] to-background" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-primary/[0.03] rounded-full blur-[120px]" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-semibold mb-6 uppercase tracking-wide">
            <Trophy className="w-4 h-4" />
            Comparativa
          </span>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-5">
            <span className="text-gradient-primary">Ventajas</span> competitivas
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto leading-relaxed">
            {subtitle}
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-6 max-w-5xl mx-auto">
          <ComparisonTable title="VS Empleos tradicionales" icon={Briefcase} rows={vsEmployment} delay={0} />
          <ComparisonTable title="VS Otras plataformas" icon={Trophy} rows={vsPlatforms} delay={0.15} />
        </div>
      </div>
    </section>
  );
};
