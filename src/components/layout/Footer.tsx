import { Link } from 'react-router-dom';
import { MessageCircle, Mail, Shield, FileText, AlertTriangle, MapPin, Clock, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-gradient-to-b from-card to-background border-t border-white/5">
      {/* Top glow effect */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      
      {/* Compliance Banner */}
      <div className="bg-accent/5 border-b border-accent/10 py-4">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center justify-center gap-3 md:gap-6 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20">
              <AlertTriangle className="w-3.5 h-3.5 text-accent" />
              18+ Únicamente
            </span>
            <span className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-primary" />
              Juego Responsable
            </span>
            <span className="hidden sm:inline">•</span>
            <span>No garantizamos ganancias</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-5 group">
              <motion.div 
                className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary via-primary to-emerald-400 flex items-center justify-center shadow-lg shadow-primary/20"
                whileHover={{ scale: 1.05 }}
              >
                <span className="font-display font-bold text-primary-foreground text-2xl">G</span>
              </motion.div>
              <div className="flex flex-col">
                <span className="font-display font-bold text-xl text-foreground">
                  Ganaya<span className="text-primary">.bet</span>
                </span>
                <span className="text-[10px] text-muted-foreground uppercase tracking-widest">
                  Apuestas Premium LATAM
                </span>
              </div>
            </Link>
            <p className="text-muted-foreground text-sm max-w-sm mb-6 leading-relaxed">
              Apuestas deportivas y casino en vivo con soporte personalizado 24/7. 
              Tu agente local te guía en recargas y retiros a tu banco.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://wa.me/59176356972?text=Hola%2C%20necesito%20ayuda%20con%20Ganaya.bet"
                target="_blank"
                rel="noopener noreferrer"
                className="w-11 h-11 rounded-full bg-[#25D366]/15 flex items-center justify-center text-[#25D366] hover:bg-[#25D366]/25 hover:scale-110 transition-all"
              >
                <MessageCircle className="w-5 h-5" />
              </a>
              <a
                href="mailto:soporte@ganaya.bet"
                className="w-11 h-11 rounded-full bg-primary/15 flex items-center justify-center text-primary hover:bg-primary/25 hover:scale-110 transition-all"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-display font-semibold text-foreground mb-5 flex items-center gap-2">
              <span className="w-1 h-4 bg-primary rounded-full"></span>
              Enlaces
            </h4>
            <ul className="space-y-3">
              {[
                { href: '/#lobbies', label: 'Juegos' },
                { href: '/#por-que', label: 'Por qué elegirnos' },
                { href: '/#faq', label: 'Preguntas frecuentes' },
                { href: '/agente', label: 'Ser agente', external: false },
              ].map((link) => (
                <li key={link.href}>
                  <a 
                    href={link.href} 
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1 group"
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
            <h4 className="font-display font-semibold text-foreground mb-5 flex items-center gap-2">
              <span className="w-1 h-4 bg-gold rounded-full"></span>
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
            <div className="mt-6 pt-4 border-t border-white/5">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                <Clock className="w-3.5 h-3.5 text-primary" />
                Soporte 24/7
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <MapPin className="w-3.5 h-3.5 text-primary" />
                LATAM
              </div>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-6 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © {currentYear} Ganaya.bet. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {['Paraguay', 'Argentina', 'Colombia', 'Ecuador'].map((country, i) => (
              <span key={country} className="flex items-center gap-2">
                <span className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 transition-colors">
                  {country}
                </span>
                {i < 3 && <span className="text-white/20">•</span>}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};
