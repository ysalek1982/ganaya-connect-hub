import { Link } from 'react-router-dom';
import { MessageCircle, Shield, FileText, AlertTriangle, Clock, ArrowUpRight, Zap, Trophy } from 'lucide-react';
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
      <div className="bg-destructive/5 border-b border-destructive/10 py-4">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8 text-sm text-muted-foreground">
            <motion.span
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-destructive/10 border border-destructive/20 text-destructive font-medium"
              animate={{ scale: [1, 1.03, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <AlertTriangle className="w-4 h-4" />
              +18 Únicamente
            </motion.span>
            <span className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              Juego Responsable
            </span>
            <span className="hidden sm:block text-muted-foreground/50">•</span>
            <span className="text-muted-foreground/70">Sin ganancias garantizadas</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-14 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
          {/* Brand */}
          <RevealItem delay={0}>
            <div className="md:col-span-2">
              <Link to="/" className="flex items-center gap-2.5 mb-6 group">
                <motion.div 
                  className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-[hsl(140,75%,40%)] flex items-center justify-center shadow-lg shadow-primary/20"
                  whileHover={{ scale: 1.1, rotate: 10 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="font-display font-bold text-primary-foreground text-xl">G</span>
                </motion.div>
                <div className="flex flex-col">
                  <span className="font-display font-bold text-xl text-foreground">
                    Ganaya<span className="text-primary">.bet</span>
                  </span>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                    Programa Agentes
                  </span>
                </div>
              </Link>
              <p className="text-muted-foreground text-sm max-w-sm mb-6 leading-relaxed">
                Programa de agentes con comisiones hasta 40%. 
                Opera desde tu móvil con soporte y capacitación continua.
              </p>
              {/* Quick stats */}
              <div className="flex items-center gap-4">
                <motion.a
                  href="https://wa.me/59176356972?text=Hola%2C%20quiero%20ser%20agente%20Ganaya.bet"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#25D366]/15 border border-[#25D366]/20 text-[#25D366] hover:bg-[#25D366]/25 transition-all text-sm font-semibold"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <MessageCircle className="w-4 h-4" />
                  Contactar por WhatsApp
                </motion.a>
              </div>
              <div className="flex items-center gap-3 mt-4">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 text-xs text-primary font-medium">
                  <Zap className="w-3 h-3" />
                  Registro en 2 min
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gold/10 border border-gold/20 text-xs text-gold font-medium">
                  <Trophy className="w-3 h-3" />
                  Hasta 40% comisión
                </div>
              </div>
            </div>
          </RevealItem>

          {/* Links */}
          <RevealItem delay={0.15}>
            <div>
              <h4 className="font-display font-semibold text-foreground mb-5 text-sm uppercase tracking-wide">
                Enlaces
              </h4>
              <ul className="space-y-3">
                {[
                  { href: '#como-funciona', label: 'Cómo funciona' },
                  { href: '#beneficios', label: 'Beneficios' },
                  { href: '#comisiones', label: 'Comisiones' },
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
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1.5 group"
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
              <h4 className="font-display font-semibold text-foreground mb-5 text-sm uppercase tracking-wide">
                Legal
              </h4>
              <ul className="space-y-3">
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
                    <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2 group">
                      <item.icon className="w-3.5 h-3.5 group-hover:text-primary transition-colors" />
                      {item.label}
                    </a>
                  </motion.li>
                ))}
              </ul>
              
              <div className="mt-6 pt-5 border-t border-border/30">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                  >
                    <Clock className="w-4 h-4 text-primary" />
                  </motion.div>
                  Soporte disponible
                </div>
              </div>
            </div>
          </RevealItem>
        </div>

        {/* Bottom */}
        <motion.div 
          className="mt-14 pt-6 border-t border-border/30 flex flex-col md:flex-row items-center justify-between gap-4"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.5 }}
        >
          <p className="text-sm text-muted-foreground/70">
            © {currentYear} Ganaya.bet · Todos los derechos reservados
          </p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground/60">
            {['Paraguay', 'Argentina', 'Colombia', 'Ecuador'].map((country, i) => (
              <motion.span 
                key={country} 
                className="flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
              >
                <span className="px-2.5 py-1 rounded-md bg-white/5 hover:bg-white/10 transition-colors cursor-default">
                  {country}
                </span>
                {i < 3 && <span className="text-white/10">·</span>}
              </motion.span>
            ))}
          </div>
        </motion.div>
      </div>
    </footer>
  );
};
