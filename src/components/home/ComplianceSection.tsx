import { Shield, AlertTriangle } from 'lucide-react';
import { ScrollReveal } from './ScrollReveal';
import { useCMSSections } from '@/hooks/useCMSPromos';
import { useCMS } from '@/hooks/useCMS';

export const ComplianceSection = () => {
  const { data: sections } = useCMSSections();
  const { data: cmsContent } = useCMS('compliance');

  const section = sections?.find(s => s.key === 'compliance');
  if (section && !section.enabled) return null;

  const content = (cmsContent as { text?: string }) || {};
  const text = content.text || 'Jugar debe ser entretenimiento. Si sientes que pierdes el control, busca ayuda. Mayores de 18 años únicamente.';

  return (
    <section className="py-8 bg-card/50 border-t border-border">
      <div className="container mx-auto px-4">
        <ScrollReveal>
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-center md:text-left">
            <div className="flex items-center gap-3 text-muted-foreground">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20">
                <AlertTriangle className="w-4 h-4 text-accent" />
                <span className="text-sm font-medium">18+</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
                <Shield className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Juego Responsable</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground max-w-lg">
              {text}
            </p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};
