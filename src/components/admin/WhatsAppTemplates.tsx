import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from 'sonner';
import { Save, MessageCircle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export interface WhatsAppTemplatesConfig {
  firstContact: string;
  followUp: string;
  approved: string;
}

const DEFAULT_TEMPLATES: WhatsAppTemplatesConfig = {
  firstContact: 'Hola {name}, soy {agentName} de Ganaya.bet 🎰\n\nRecibimos tu postulación para ser agente. ¿Tienes 2 minutos para coordinar tu onboarding?',
  followUp: 'Hola {name} 👋\n\n¿Sigues interesado/a en iniciar como agente de Ganaya.bet? Puedo ayudarte con el paso a paso.',
  approved: '¡Genial {name}! 🎉\n\nEstás aprobado/a como agente. Te enviaré tus accesos y tu enlace de referidos en breve.',
};

interface Props {
  onTemplateSelect?: (template: string) => void;
  mode?: 'edit' | 'select';
}

export const WhatsAppTemplates = ({ onTemplateSelect, mode = 'edit' }: Props) => {
  const [templates, setTemplates] = useState<WhatsAppTemplatesConfig>(DEFAULT_TEMPLATES);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const docRef = doc(db, 'settings', 'whatsapp_templates');
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        setTemplates({ ...DEFAULT_TEMPLATES, ...docSnap.data() as WhatsAppTemplatesConfig });
      }
    } catch (error) {
      console.error('Error loading templates:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveTemplates = async () => {
    setIsSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'whatsapp_templates'), templates);
      toast.success('Plantillas guardadas');
    } catch (error) {
      console.error('Error saving templates:', error);
      toast.error('Error al guardar');
    } finally {
      setIsSaving(false);
    }
  };

  const resetToDefaults = () => {
    setTemplates(DEFAULT_TEMPLATES);
    toast.info('Plantillas restauradas a valores por defecto');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="spinner" />
      </div>
    );
  }

  if (mode === 'select') {
    return (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground mb-4">
          Selecciona una plantilla para contactar:
        </p>
        {[
          { key: 'firstContact', label: 'Primer contacto', icon: '👋' },
          { key: 'followUp', label: 'Seguimiento', icon: '🔄' },
          { key: 'approved', label: 'Aprobación', icon: '✅' },
        ].map(({ key, label, icon }) => (
          <Button
            key={key}
            variant="outline"
            className="w-full justify-start text-left h-auto py-3"
            onClick={() => onTemplateSelect?.(templates[key as keyof WhatsAppTemplatesConfig])}
          >
            <span className="mr-2">{icon}</span>
            <div className="flex-1 min-w-0">
              <div className="font-medium">{label}</div>
              <div className="text-xs text-muted-foreground truncate">
                {templates[key as keyof WhatsAppTemplatesConfig].substring(0, 50)}...
              </div>
            </div>
          </Button>
        ))}
      </div>
    );
  }

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-[#25D366]" />
          Plantillas WhatsApp
        </CardTitle>
        <CardDescription>
          Personaliza los mensajes de contacto. Usa {'{name}'} para el nombre del postulante y {'{agentName}'} para tu nombre.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>Primer contacto</Label>
          <Textarea
            value={templates.firstContact}
            onChange={(e) => setTemplates({ ...templates, firstContact: e.target.value })}
            rows={4}
            placeholder="Mensaje para el primer contacto..."
          />
        </div>

        <div className="space-y-2">
          <Label>Seguimiento</Label>
          <Textarea
            value={templates.followUp}
            onChange={(e) => setTemplates({ ...templates, followUp: e.target.value })}
            rows={4}
            placeholder="Mensaje de seguimiento..."
          />
        </div>

        <div className="space-y-2">
          <Label>Aprobación</Label>
          <Textarea
            value={templates.approved}
            onChange={(e) => setTemplates({ ...templates, approved: e.target.value })}
            rows={4}
            placeholder="Mensaje cuando se aprueba al agente..."
          />
        </div>

        <div className="flex gap-2 pt-4">
          <Button onClick={saveTemplates} disabled={isSaving} className="flex-1">
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Guardando...' : 'Guardar plantillas'}
          </Button>
          <Button variant="outline" onClick={resetToDefaults}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Restaurar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// Helper to build WhatsApp URL with template
export const buildWhatsAppUrl = (
  phone: string,
  template: string,
  leadName: string,
  agentName: string = 'Ganaya.bet'
): string => {
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const message = template
    .replace(/{name}/g, leadName)
    .replace(/{agentName}/g, agentName);
  
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
};
