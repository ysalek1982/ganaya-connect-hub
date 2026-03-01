import { motion, useInView } from 'framer-motion';
import { useRef, useState } from 'react';
import { ArrowRight, Wallet, TrendingUp } from 'lucide-react';

export const IncomeComparison = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const [sliderVal, setSliderVal] = useState(50);

  const networkSize = Math.round((sliderVal / 100) * 50);
  const directIncome = networkSize * 18;
  const subAgents = Math.floor(networkSize / 10);
  const subIncome = subAgents * 45;
  const totalIncome = directIncome + subIncome;

  return (
    <section ref={ref} className="py-12 sm:py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-gold/[0.03] to-background" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8 sm:mb-12"
        >
          <span className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-gold/10 border border-gold/20 text-gold text-xs sm:text-sm font-semibold mb-4 sm:mb-6 uppercase tracking-wide">
            <Wallet className="w-4 h-4" />
            Simulador de ingresos
          </span>
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">
            ¿Cuánto podrías <span className="text-gradient-gold">ganar</span>?
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base max-w-lg mx-auto">
            Mové el control para ver tu proyección según el tamaño de tu red
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto"
        >
          <div className="bg-card/60 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-5 sm:p-8 md:p-10 border border-border/50 relative overflow-hidden">
            {/* Top glow */}
            <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />

            {/* Slider */}
            <div className="mb-6 sm:mb-8">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs sm:text-sm text-muted-foreground">Tamaño de tu red</span>
                <motion.span
                  key={networkSize}
                  initial={{ scale: 1.3 }}
                  animate={{ scale: 1 }}
                  className="text-xs sm:text-sm font-bold text-primary"
                >
                  {networkSize} clientes activos
                </motion.span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={sliderVal}
                onChange={(e) => setSliderVal(Number(e.target.value))}
                className="w-full h-2 bg-border/30 rounded-full appearance-none cursor-pointer touch-pan-y [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-7 [&::-webkit-slider-thumb]:h-7 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:shadow-primary/30 [&::-webkit-slider-thumb]:cursor-grab [&::-webkit-slider-thumb]:active:cursor-grabbing"
              />
            </div>

            {/* Income breakdown */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-6">
              <div className="text-center p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-primary/5 border border-primary/15">
                <p className="text-[9px] sm:text-xs text-muted-foreground mb-1 uppercase tracking-wide">Comisiones</p>
                <motion.p
                  key={directIncome}
                  initial={{ scale: 1.2 }}
                  animate={{ scale: 1 }}
                  className="font-display text-lg sm:text-2xl font-black text-primary"
                >
                  ${directIncome}
                </motion.p>
                <p className="text-[9px] sm:text-[10px] text-muted-foreground">por mes</p>
              </div>

              <div className="flex items-center justify-center">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gold/10 flex items-center justify-center">
                  <span className="text-gold font-black text-sm sm:text-base">+</span>
                </div>
              </div>

              <div className="text-center p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-gold/5 border border-gold/15">
                <p className="text-[9px] sm:text-xs text-muted-foreground mb-1 uppercase tracking-wide">Bonos red</p>
                <motion.p
                  key={subIncome}
                  initial={{ scale: 1.2 }}
                  animate={{ scale: 1 }}
                  className="font-display text-lg sm:text-2xl font-black text-gold"
                >
                  ${subIncome}
                </motion.p>
                <p className="text-[9px] sm:text-[10px] text-muted-foreground">{subAgents} sub-agentes</p>
              </div>
            </div>

            {/* Total */}
            <motion.div
              className="text-center p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-gradient-to-r from-primary/10 via-gold/10 to-primary/10 border border-primary/20"
              animate={{ scale: [1, 1.01, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <p className="text-xs sm:text-sm text-muted-foreground mb-1.5 sm:mb-2 font-medium">Ingreso mensual proyectado</p>
              <motion.p
                key={totalIncome}
                initial={{ scale: 1.3, color: 'hsl(160, 84%, 55%)' }}
                animate={{ scale: 1, color: 'hsl(160, 84%, 45%)' }}
                transition={{ type: 'spring', stiffness: 200 }}
                className="font-display text-4xl sm:text-5xl md:text-6xl font-black text-primary"
              >
                ${totalIncome}
              </motion.p>
              <p className="text-[10px] sm:text-xs text-muted-foreground/60 mt-1.5 sm:mt-2">* Proyección referencial. Depende de tu actividad y gestión.</p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
