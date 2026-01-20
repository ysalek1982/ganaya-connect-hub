import { Link } from 'react-router-dom';
import { MessageCircle, Mail, Shield, FileText, AlertTriangle } from 'lucide-react';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-card border-t border-border">
      {/* Compliance Banner */}
      <div className="bg-accent/10 border-b border-accent/20 py-3">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <AlertTriangle className="w-4 h-4 text-accent" />
              18+ Únicamente
            </span>
            <span className="hidden sm:inline">•</span>
            <span>Juego Responsable</span>
            <span className="hidden sm:inline">•</span>
            <span>No garantizamos ganancias</span>
            <span className="hidden sm:inline">•</span>
            <span>Contenido informativo</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                <span className="font-display font-bold text-primary-foreground text-xl">G</span>
              </div>
              <span className="font-display font-bold text-xl text-foreground">
                Ganaya<span className="text-primary">.bet</span>
              </span>
            </Link>
            <p className="text-muted-foreground text-sm max-w-sm mb-4">
              Apuestas deportivas y casino en vivo con soporte personalizado. 
              Tu agente local te guía en cada paso.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://wa.me/595981123456"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-[#25D366]/20 flex items-center justify-center text-[#25D366] hover:bg-[#25D366]/30 transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
              </a>
              <a
                href="mailto:soporte@ganaya.bet"
                className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary hover:bg-primary/30 transition-colors"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-display font-semibold text-foreground mb-4">Enlaces</h4>
            <ul className="space-y-2">
              <li>
                <a href="/#como-funciona" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Cómo funciona
                </a>
              </li>
              <li>
                <a href="/#beneficios" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Beneficios
                </a>
              </li>
              <li>
                <a href="/#faq" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Preguntas frecuentes
                </a>
              </li>
              <li>
                <Link to="/agente" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Ser agente
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-display font-semibold text-foreground mb-4">Legal</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Privacidad de datos
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Términos y condiciones
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Juego responsable
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-6 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © {currentYear} Ganaya.bet. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>Paraguay</span>
            <span>•</span>
            <span>Argentina</span>
            <span>•</span>
            <span>Colombia</span>
            <span>•</span>
            <span>Ecuador</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
