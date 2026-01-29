import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

const WHATSAPP_NUMBER = '59176356972';
const GANAYA_URL = 'https://ganaya.bet/es/sport';

const navLinks = [
  { href: '/#como-funciona', label: 'Cómo funciona' },
  { href: '/tutoriales', label: 'Tutoriales' },
  { href: '/agente', label: 'Ser Cajero' },
];

export const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const handleWhatsApp = () => {
    const message = encodeURIComponent('Hola, quiero información sobre Ganaya.bet');
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, '_blank');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      {/* Gradient top border */}
      <div className="h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
      
      <div className="backdrop-blur-xl bg-background/70 border-b border-white/5">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <motion.div 
                className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary via-primary to-emerald-400 flex items-center justify-center shadow-lg shadow-primary/30 group-hover:shadow-primary/50 transition-shadow"
                whileHover={{ scale: 1.05, rotate: 5 }}
              >
                <span className="font-display font-bold text-primary-foreground text-2xl">G</span>
              </motion.div>
              <div className="flex flex-col">
                <span className="font-display font-bold text-xl text-foreground leading-tight">
                  Ganaya<span className="text-primary">.bet</span>
                </span>
                <span className="text-[10px] text-muted-foreground uppercase tracking-widest">
                  Apuestas Premium
                </span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-white/5 rounded-lg transition-all duration-200"
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
                onClick={() => window.open(GANAYA_URL, '_blank')}
                className="shadow-lg shadow-primary/20"
              >
                Apostar Ahora
              </Button>
              <Button 
                variant="whatsapp" 
                size="default" 
                onClick={handleWhatsApp}
                className="shadow-lg shadow-[#25D366]/20"
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp 24/7
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
            <nav className="container mx-auto px-4 py-4 flex flex-col gap-2">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="py-3 px-4 text-foreground hover:text-primary hover:bg-white/5 rounded-lg transition-all"
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              <Button variant="whatsapp" className="mt-3" onClick={handleWhatsApp}>
                <MessageCircle className="w-5 h-5" />
                WhatsApp 24/7
              </Button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
