import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { Check, X, Briefcase, Trophy, Sparkles, ArrowLeftRight } from 'lucide-react';
import { useLandingContent } from '@/hooks/useLandingContent';
import { useState, useCallback, useRef } from 'react';

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

const AnimatedRow = ({ row, index, delay }: { row: ComparisonRow; index: number; delay: number }) => {
  const [hoveredSide, setHoveredSide] = useState<'left' | 'right' | null>(null);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay: delay + index * 0.1 }}
      className="grid grid-cols-2 gap-3"
    >
      <motion.div
        onHoverStart={() => setHoveredSide('left')}
        onHoverEnd={() => setHoveredSide(null)}
        animate={hoveredSide === 'left' ? { scale: 1.03, x: -3 } : { scale: 1, x: 0 }}
        transition={{ type: 'spring', stiffness: 300 }}
        className={`flex items-center gap-2.5 p-3.5 rounded-xl border transition-all duration-300 ${
          hoveredSide === 'left'
            ? 'bg-destructive/10 border-destructive/30 shadow-lg shadow-destructive/5'
            : 'bg-destructive/5 border-destructive/10'
        }`}
      >
        <motion.div
          animate={hoveredSide === 'left' ? { rotate: 90, scale: 1.2 } : { rotate: 0, scale: 1 }}
          className="w-5 h-5 rounded-full bg-destructive/15 flex items-center justify-center shrink-0"
        >
          <X className="w-3 h-3 text-destructive" />
        </motion.div>
        <span className={`text-sm transition-colors ${hoveredSide === 'left' ? 'text-destructive line-through' : 'text-muted-foreground'}`}>
          {row.traditional}
        </span>
      </motion.div>

      <motion.div
        onHoverStart={() => setHoveredSide('right')}
        onHoverEnd={() => setHoveredSide(null)}
        animate={hoveredSide === 'right' ? { scale: 1.03, x: 3 } : { scale: 1, x: 0 }}
        transition={{ type: 'spring', stiffness: 300 }}
        className={`flex items-center gap-2.5 p-3.5 rounded-xl border transition-all duration-300 ${
          hoveredSide === 'right'
            ? 'bg-primary/10 border-primary/30 shadow-lg shadow-primary/5'
            : 'bg-primary/5 border-primary/15'
        }`}
      >
        <motion.div
          animate={hoveredSide === 'right' ? { scale: 1.3 } : { scale: 1 }}
          className="w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center shrink-0"
        >
          <Check className="w-3 h-3 text-primary" />
        </motion.div>
        <span className={`text-sm font-semibold transition-colors ${hoveredSide === 'right' ? 'text-primary' : 'text-foreground'}`}>
          {row.ganaya}
        </span>
      </motion.div>
    </motion.div>
  );
};

const ComparisonTable = ({ title, icon: Icon, rows, delay }: { title: string; icon: React.ComponentType<{ className?: string }>; rows: ComparisonRow[]; delay: number }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const springX = useSpring(mouseX, { stiffness: 100, damping: 20 });
  const glareOpacity = useMotionValue(0);

  const handleMouse = useCallback((e: React.MouseEvent) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set((e.clientX - rect.left) / rect.width);
    mouseY.set((e.clientY - rect.top) / rect.height);
    glareOpacity.set(0.06);
  }, [mouseX, mouseY, glareOpacity]);

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, type: 'spring', stiffness: 100 }}
      onMouseMove={handleMouse}
      onMouseLeave={() => glareOpacity.set(0)}
      className="relative bg-card/60 backdrop-blur-sm rounded-2xl p-7 lg:p-8 border border-border/50 hover:border-primary/30 transition-all duration-500 overflow-hidden"
    >
      {/* Mouse-follow glare */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          opacity: glareOpacity,
          background: useTransform(
            [springX, mouseY],
            ([x, y]: number[]) => `radial-gradient(circle at ${(x as number) * 100}% ${(y as number) * 100}%, white 0%, transparent 50%)`
          ),
        }}
      />

      <div className="flex items-center gap-3 mb-8">
        <motion.div
          whileHover={{ rotate: 10, scale: 1.1 }}
          className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center"
        >
          <Icon className="w-6 h-6 text-primary" />
        </motion.div>
        <h3 className="font-display text-xl font-bold">{title}</h3>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="text-xs font-bold text-destructive/70 uppercase tracking-wider px-3">Tradicional</div>
        <div className="text-xs font-bold text-primary/70 uppercase tracking-wider px-3 flex items-center gap-1">
          <Sparkles className="w-3 h-3" /> Ganaya
        </div>
      </div>

      <div className="space-y-2.5">
        {rows.map((row, index) => (
          <AnimatedRow key={index} row={row} index={index} delay={delay} />
        ))}
      </div>

      {/* Score bar */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: delay + 0.5 }}
        className="mt-6 pt-4 border-t border-border/30"
      >
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
          <span>Valoración general</span>
          <span className="text-primary font-bold">Ganaya gana</span>
        </div>
        <div className="h-2 rounded-full bg-border/30 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: '85%' }}
            viewport={{ once: true }}
            transition={{ delay: delay + 0.6, duration: 1, ease: 'easeOut' }}
            className="h-full rounded-full bg-gradient-to-r from-primary to-primary/60"
          />
        </div>
      </motion.div>
    </motion.div>
  );
};

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
          <p className="text-muted-foreground text-lg max-w-xl mx-auto leading-relaxed">{subtitle}</p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-6 max-w-5xl mx-auto">
          <ComparisonTable title="VS Empleos tradicionales" icon={Briefcase} rows={vsEmployment} delay={0} />
          <ComparisonTable title="VS Otras plataformas" icon={Trophy} rows={vsPlatforms} delay={0.15} />
        </div>
      </div>
    </section>
  );
};
