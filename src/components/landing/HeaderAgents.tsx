import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

const navLinks = [
  { href: '#oportunidad', label: 'Oportunidad' },
  { href: '#como-funciona', label: 'Cómo Funciona' },
  { href: '#comisiones', label: 'Comisiones' },
  { href: '#requisitos', label: 'Requisitos' },
  { href: '#crecimiento', label: 'Crecimiento' },
  { href: '#ventajas', label: 'Ventajas' },
  { href: '#captacion', label: 'Captación' },
];

interface HeaderAgentsProps {
  onOpenChat: () => void;
}

export const HeaderAgents = ({ onOpenChat }: HeaderAgentsProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setIsOpen(false);
    
    const id = href.replace('#', '');
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handlePostular = () => {
    setIsOpen(false);
    onOpenChat();
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      {/* Gradient top border */}
      <div className="h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
      
      <div className="backdrop-blur-xl bg-background/70 border-b border-white/5">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 md:h-18">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <motion.div 
                className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary via-primary to-emerald-400 flex items-center justify-center shadow-lg shadow-primary/30 group-hover:shadow-primary/50 transition-shadow"
                whileHover={{ scale: 1.05, rotate: 5 }}
              >
                <span className="font-display font-bold text-primary-foreground text-xl">G</span>
              </motion.div>
              <div className="flex flex-col">
                <span className="font-display font-bold text-lg text-foreground leading-tight">
                  Ganaya<span className="text-primary">.bet</span>
                </span>
                <span className="text-[9px] text-muted-foreground uppercase tracking-widest">
                  Programa Agentes
                </span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-0.5">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => scrollToSection(e, link.href)}
                  className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-white/5 rounded-lg transition-all duration-200"
                >
                  {link.label}
                </a>
              ))}
            </nav>

            {/* Desktop CTA */}
            <div className="hidden md:flex items-center gap-3">
              <Button 
                variant="hero" 
                size="default" 
                onClick={handlePostular}
                className="shadow-lg shadow-primary/20"
              >
                <MessageCircle className="w-4 h-4" />
                Postularme
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 text-foreground hover:bg-white/5 rounded-lg transition-colors"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-background/95 backdrop-blur-xl border-b border-white/10"
          >
            <nav className="container mx-auto px-4 py-4 flex flex-col gap-1">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => scrollToSection(e, link.href)}
                  className="py-3 px-4 text-foreground hover:text-primary hover:bg-white/5 rounded-lg transition-all"
                >
                  {link.label}
                </a>
              ))}
              <Button variant="hero" className="mt-3" onClick={handlePostular}>
                <MessageCircle className="w-5 h-5" />
                Postularme ahora
              </Button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
