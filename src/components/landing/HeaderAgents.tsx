import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence, useScroll, useTransform, useMotionValueEvent } from 'framer-motion';

const navLinks = [
  { href: '#como-funciona', label: 'Cómo Funciona', id: 'como-funciona' },
  { href: '#beneficios', label: 'Beneficios', id: 'beneficios' },
  { href: '#comisiones', label: 'Comisiones', id: 'comisiones' },
  { href: '#faq', label: 'FAQ', id: 'faq' },
];

interface HeaderAgentsProps {
  onOpenChat: () => void;
}

export const HeaderAgents = ({ onOpenChat }: HeaderAgentsProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const { scrollY } = useScroll();
  
  // Track scroll for shrink effect
  useMotionValueEvent(scrollY, 'change', (latest) => {
    setIsScrolled(latest > 50);
  });

  // Track active section via IntersectionObserver
  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    
    navLinks.forEach(link => {
      const el = document.getElementById(link.id);
      if (!el) return;
      
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActiveSection(link.id);
          }
        },
        { rootMargin: '-30% 0px -60% 0px' }
      );
      observer.observe(el);
      observers.push(observer);
    });

    return () => observers.forEach(o => o.disconnect());
  }, []);

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setIsOpen(false);
    const id = href.replace('#', '');
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handlePostular = () => {
    setIsOpen(false);
    onOpenChat();
  };

  const headerHeight = useTransform(scrollY, [0, 100], [72, 56]);
  const logoScale = useTransform(scrollY, [0, 100], [1, 0.9]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <motion.div 
        className="backdrop-blur-xl border-b transition-colors duration-300"
        style={{
          backgroundColor: isScrolled ? 'hsl(var(--background) / 0.95)' : 'hsl(var(--background) / 0.7)',
          borderColor: isScrolled ? 'hsl(var(--border) / 0.5)' : 'hsl(var(--border) / 0.2)',
        }}
      >
        <div className="container mx-auto px-4">
          <motion.div 
            className="flex items-center justify-between"
            style={{ height: headerHeight }}
          >
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <motion.div 
                className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-[hsl(140,75%,40%)] flex items-center justify-center shadow-lg shadow-primary/25"
                style={{ scale: logoScale }}
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="font-display font-bold text-primary-foreground text-lg">G</span>
              </motion.div>
              <div className="flex flex-col">
                <span className="font-display font-bold text-lg text-foreground leading-tight">
                  Ganaya<span className="text-primary">.bet</span>
                </span>
                <AnimatePresence>
                  {!isScrolled && (
                    <motion.span 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="text-[9px] text-muted-foreground uppercase tracking-wider hidden sm:block"
                    >
                      Programa Agentes
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            </Link>

            {/* Desktop Nav with animated underlines */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => scrollToSection(e, link.href)}
                  className="relative px-4 py-2 text-sm font-medium transition-colors group"
                  style={{ color: activeSection === link.id ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))' }}
                >
                  {link.label}
                  {/* Animated underline */}
                  <motion.span
                    className="absolute bottom-0 left-1/2 h-0.5 bg-primary rounded-full"
                    initial={false}
                    animate={{
                      width: activeSection === link.id ? '60%' : '0%',
                      x: '-50%',
                    }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  />
                  {/* Hover underline */}
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-0 group-hover:w-[40%] bg-muted-foreground/40 rounded-full transition-all duration-300" />
                </a>
              ))}
            </nav>

            {/* Desktop CTA with pulse */}
            <div className="hidden md:flex items-center gap-3">
              <motion.div
                animate={{ 
                  boxShadow: [
                    '0 0 0 0 hsl(var(--primary) / 0)',
                    '0 0 0 8px hsl(var(--primary) / 0.15)',
                    '0 0 0 0 hsl(var(--primary) / 0)',
                  ] 
                }}
                transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 3 }}
                className="rounded-xl"
              >
                <Button 
                  variant="hero" 
                  size="default" 
                  onClick={handlePostular}
                  className="relative overflow-hidden"
                >
                  <MessageCircle className="w-4 h-4" />
                  Postularme
                  {/* Shimmer */}
                  <motion.span
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent"
                    animate={{ x: ['-100%', '200%'] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 4 }}
                  />
                </Button>
              </motion.div>
            </div>

            {/* Mobile Menu Button */}
            <motion.button
              className="md:hidden p-2 text-foreground hover:bg-white/5 rounded-lg transition-colors"
              onClick={() => setIsOpen(!isOpen)}
              whileTap={{ scale: 0.9 }}
            >
              <AnimatePresence mode="wait">
                {isOpen ? (
                  <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                    <X className="w-6 h-6" />
                  </motion.div>
                ) : (
                  <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                    <Menu className="w-6 h-6" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </motion.div>
        </div>
      </motion.div>

      {/* Mobile Menu with staggered items */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-background/98 backdrop-blur-xl border-b border-border/50"
          >
            <nav className="container mx-auto px-4 py-4 flex flex-col gap-1">
              {navLinks.map((link, i) => (
                <motion.a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => scrollToSection(e, link.href)}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="py-3 px-4 text-foreground hover:text-primary hover:bg-white/5 rounded-lg transition-all flex items-center gap-3"
                  style={{ color: activeSection === link.id ? 'hsl(var(--primary))' : undefined }}
                >
                  {activeSection === link.id && (
                    <motion.span layoutId="mobile-active" className="w-1.5 h-1.5 rounded-full bg-primary" />
                  )}
                  {link.label}
                </motion.a>
              ))}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <Button variant="hero" className="mt-3 w-full" onClick={handlePostular}>
                  <MessageCircle className="w-5 h-5" />
                  Postularme ahora
                </Button>
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
