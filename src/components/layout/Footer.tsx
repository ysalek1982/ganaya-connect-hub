import { Link } from 'react-router-dom';
import { MessageCircle, Mail, Shield, FileText, AlertTriangle, Clock, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-[hsl(var(--surface-1))] border-t border-border/30">
      {/* Compliance Banner */}
      <div className="bg-destructive/5 border-b border-destructive/10 py-4">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8 text-sm text-muted-foreground">
            <span className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-destructive/10 border border-destructive/20 text-destructive font-medium">
              <AlertTriangle className="w-4 h-4" />
              +18 Únicamente
            </span>
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
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2.5 mb-6 group">
              <motion.div 
                className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-[hsl(140,75%,40%)] flex items-center justify-center shadow-lg shadow-primary/20"
                whileHover={{ scale: 1.05 }}
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
            <div className="flex items-center gap-3">
              <a
                href="https://wa.me/59176356972?text=Hola%2C%20necesito%20ayuda%20con%20Ganaya.bet"
                target="_blank"
                rel="noopener noreferrer"
                className="w-11 h-11 rounded-xl bg-[#25D366]/15 flex items-center justify-center text-[#25D366] hover:bg-[#25D366]/25 transition-all"
              >
                <MessageCircle className="w-5 h-5" />
              </a>
              <a
                href="mailto:soporte@ganaya.bet"
                className="w-11 h-11 rounded-xl bg-primary/15 flex items-center justify-center text-primary hover:bg-primary/25 transition-all"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Links */}
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
              ].map((link) => (
                <li key={link.href}>
                  <a 
                    href={link.href} 
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1.5 group"
                  >
                    {link.label}
                    <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-display font-semibold text-foreground mb-5 text-sm uppercase tracking-wide">
              Legal
            </h4>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2">
                  <Shield className="w-3.5 h-3.5" />
                  Privacidad de datos
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5" />
                  Términos y condiciones
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Juego responsable
                </a>
              </li>
            </ul>
            
            {/* Support info */}
            <div className="mt-6 pt-5 border-t border-border/30">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <Clock className="w-4 h-4 text-primary" />
                Soporte disponible
              </div>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-14 pt-6 border-t border-border/30 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground/70">
            © {currentYear} Ganaya.bet · Todos los derechos reservados
          </p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground/60">
            {['Paraguay', 'Argentina', 'Colombia', 'Ecuador'].map((country, i) => (
              <span key={country} className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-md bg-white/5">
                  {country}
                </span>
                {i < 3 && <span className="text-white/10">·</span>}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};
