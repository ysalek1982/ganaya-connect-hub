import { Link } from 'react-router-dom';
import { Shield, FileText, AlertTriangle, Clock, ArrowUpRight, Zap, Trophy, Globe, Users } from 'lucide-react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

const RevealItem = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay }}
    >
      {children}
    </motion.div>
  );
};

const footerStats = [
  { icon: Users, value: '1,500+', label: 'Agentes' },
  { icon: Globe, value: '5', label: 'Países' },
  { icon: Trophy, value: '40%', label: 'Comisión máx' },
  { icon: Zap, value: '<1h', label: 'Respuesta' },
];

export const Footer = () => {
  const currentYear = new Date().getFullYear();
  const footerRef = useRef<HTMLElement>(null);
  const inView = useInView(footerRef, { once: true, margin: '-100px' });

  return (
    <footer ref={footerRef} className="relative bg-[hsl(var(--surface-1))] border-t border-border/30 overflow-hidden">
      {/* Animated top border */}
      <motion.div
        className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent"
        initial={{ scaleX: 0 }}
        animate={inView ? { scaleX: 1 } : {}}
        transition={{ duration: 1.2, ease: 'easeOut' }}
      />

      {/* Compliance Banner */}
      <div className="bg-destructive/5 border-b border-destructive/10 py-3 sm:py-4">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 md:gap-8 text-xs sm:text-sm text-muted-foreground">
            <motion.span
              className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-destructive/10 border border-destructive/20 text-destructive font-medium"
              animate={{ scale: [1, 1.03, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <AlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              +18 Únicamente
            </motion.span>
            <span className="flex items-center gap-1.5 sm:gap-2">
              <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
              Juego Responsable
            </span>
            <span className="hidden sm:block text-muted-foreground/50">•</span>
            <span className="text-muted-foreground/70 text-[11px] sm:text-sm">Sin ganancias garantizadas</span>
          </div>
        </div>
      </div>

      {/* Stats strip */}
      <div className="border-b border-border/20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-border/20">
            {footerStats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: i * 0.1 }}
                className="flex items-center justify-center gap-1.5 sm:gap-2.5 py-3 sm:py-5 group"
              >
                <stat.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary/60 group-hover:text-primary transition-colors" />
                <span className="font-display font-black text-sm sm:text-lg text-foreground">{stat.value}</span>
                <span className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider">{stat.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10 sm:py-14 md:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 sm:gap-12 md:gap-8">
          {/* Brand */}
          <RevealItem delay={0}>
            <div>
              <Link to="/" className="flex items-center gap-2.5 mb-4 sm:mb-6 group">
                <motion.div 
                  className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-primary to-[hsl(140,75%,40%)] flex items-center justify-center shadow-lg shadow-primary/20"
                  whileHover={{ scale: 1.1, rotate: 10 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="font-display font-bold text-primary-foreground text-lg sm:text-xl">G</span>
                </motion.div>
                <div className="flex flex-col">
                  <span className="font-display font-bold text-lg sm:text-xl text-foreground">
                    Ganaya<span className="text-primary">.bet</span>
                  </span>
                  <span className="text-[9px] sm:text-[10px] text-muted-foreground uppercase tracking-wider">
                    Programa Agentes
                  </span>
                </div>
              </Link>
              <p className="text-muted-foreground text-xs sm:text-sm max-w-sm mb-4 sm:mb-6 leading-relaxed">
                Programa de agentes con comisiones hasta 40%. 
                Opera desde tu móvil con soporte y capacitación continua.
              </p>
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-primary/10 border border-primary/20 text-[10px] sm:text-xs text-primary font-medium">
                  <Zap className="w-3 h-3" />
                  Registro en 2 min
                </div>
                <div className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-gold/10 border border-gold/20 text-[10px] sm:text-xs text-gold font-medium">
                  <Trophy className="w-3 h-3" />
                  100% móvil
                </div>
              </div>
            </div>
          </RevealItem>

          {/* Links */}
          <RevealItem delay={0.15}>
            <div>
              <h4 className="font-display font-semibold text-foreground mb-4 sm:mb-5 text-xs sm:text-sm uppercase tracking-wide">
                Navegación
              </h4>
              <ul className="space-y-2 sm:space-y-3">
                {[
                  { href: '#como-funciona', label: 'Cómo funciona' },
                  { href: '#beneficios', label: 'Beneficios' },
                  { href: '#comisiones', label: 'Comisiones' },
                  { href: '#ventajas', label: 'Ventajas competitivas' },
                  { href: '#faq', label: 'Preguntas frecuentes' },
                ].map((link, i) => (
                  <motion.li 
                    key={link.href}
                    initial={{ opacity: 0, x: -10 }}
                    animate={inView ? { opacity: 1, x: 0 } : {}}
                    transition={{ delay: 0.3 + i * 0.08 }}
                  >
                    <a 
                      href={link.href} 
                      className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1.5 group"
                    >
                      {link.label}
                      <ArrowUpRight className="w-3 h-3 opacity-0 -translate-y-0.5 translate-x-0.5 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all duration-200" />
                    </a>
                  </motion.li>
                ))}
              </ul>
            </div>
          </RevealItem>

          {/* Legal */}
          <RevealItem delay={0.25}>
            <div>
              <h4 className="font-display font-semibold text-foreground mb-4 sm:mb-5 text-xs sm:text-sm uppercase tracking-wide">
                Legal
              </h4>
              <ul className="space-y-2 sm:space-y-3">
                {[
                  { icon: Shield, label: 'Privacidad de datos' },
                  { icon: FileText, label: 'Términos y condiciones' },
                  { icon: AlertTriangle, label: 'Juego responsable' },
                ].map((item, i) => (
                  <motion.li 
                    key={item.label}
                    initial={{ opacity: 0, x: -10 }}
                    animate={inView ? { opacity: 1, x: 0 } : {}}
                    transition={{ delay: 0.4 + i * 0.08 }}
                  >
                    <a href="#" className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2 group">
                      <item.icon className="w-3 h-3 sm:w-3.5 sm:h-3.5 group-hover:text-primary transition-colors" />
                      {item.label}
                    </a>
                  </motion.li>
                ))}
              </ul>
              
              <div className="mt-5 sm:mt-6 pt-4 sm:pt-5 border-t border-border/30">
                <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground mb-2">
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                  >
                    <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                  </motion.div>
                  Soporte disponible 24/7
                </div>
              </div>
            </div>
          </RevealItem>
        </div>

        {/* Bottom */}
        <motion.div 
          className="mt-10 sm:mt-14 pt-5 sm:pt-6 border-t border-border/30 flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.5 }}
        >
          <p className="text-xs sm:text-sm text-muted-foreground/70">
            © {currentYear} Ganaya.bet · Todos los derechos reservados
          </p>
          <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-muted-foreground/60">
            {[
              { flag: '🇵🇾', name: 'Paraguay' },
              { flag: '🇦🇷', name: 'Argentina' },
              { flag: '🇨🇴', name: 'Colombia' },
              { flag: '🇪🇨', name: 'Ecuador' },
              { flag: '🇺🇸', name: 'EE.UU.' },
            ].map((country, i) => (
              <motion.span 
                key={country.name} 
                className="flex items-center gap-1"
                whileHover={{ scale: 1.05 }}
              >
                <span className="px-2 py-1 rounded-md bg-white/5 hover:bg-white/10 transition-colors cursor-default flex items-center gap-1">
                  <span>{country.flag}</span>
                  <span className="hidden sm:inline">{country.name}</span>
                </span>
                {i < 4 && <span className="text-white/10">·</span>}
              </motion.span>
            ))}
          </div>
        </motion.div>
      </div>
    </footer>
  );
};
