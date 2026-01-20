import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Save, Eye, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import type { Json } from '@/integrations/supabase/types';

const defaultContent: Record<string, Record<string, unknown>> = {
  home_hero: {
    title: 'Apostá con soporte real. Recargá y retirás con un agente local.',
    subtitle: 'Apuestas deportivas y casino en vivo. Atención por WhatsApp y retiros guiados a tu banco.',
    cta_primary: 'Quiero apostar',
    cta_secondary: 'Quiero ser agente',
  },
  home_benefits: {
    items: [
      { icon: 'MessageCircle', title: 'Soporte WhatsApp 24/7', desc: 'Atención personalizada' },
      { icon: 'Zap', title: 'Recargas rápidas', desc: 'USDT/Binance o local' },
      { icon: 'Shield', title: 'Retiros guiados', desc: 'Cobrás en tu banco' },
      { icon: 'Globe', title: 'Pagos locales', desc: 'Según tu país' },
    ],
  },
  home_stats: {
    growth: '+25%',
    growth_label: 'Crecimiento anual iGaming LATAM',
    mobile: '85%',
    mobile_label: 'Usuarios móviles',
    projection: '$8.5B',
    projection_label: 'Proyección 2026',
  },
  agente_hero: {
    title: 'Generá ingresos como agente de Ganaya.bet',
    subtitle: 'Hasta 40% por positivo mensual + 7%/5% por tu red. 100% móvil.',
    cta: 'Postularme ahora',
  },
  faq: {
    items: [
      { q: '¿Cómo recargo?', a: 'Contactá a tu agente por WhatsApp. Te guiará para recargar con USDT/Binance o método local.' },
      { q: '¿Cómo retiro?', a: 'Pedí retiro a tu agente. Verificamos y pagamos a tu cuenta bancaria.' },
      { q: '¿Es seguro?', a: 'Sí. Operamos con agentes verificados y cumplimos estándares de seguridad.' },
      { q: '¿Qué métodos hay?', a: 'Depende del país: USDT/Binance P2P, transferencias locales, efectivo.' },
    ],
  },
};

const AdminCMS = () => {
  const queryClient = useQueryClient();
  const [editedContent, setEditedContent] = useState<Record<string, Record<string, unknown>>>({});

  const { data: cmsData, isLoading } = useQuery({
    queryKey: ['cms-content'],
    queryFn: async () => {
      const { data, error } = await supabase.from('cms_content').select('*');
      if (error) throw error;
      const content: Record<string, Record<string, unknown>> = {};
      data?.forEach((item) => {
        content[item.key] = item.value as Record<string, unknown>;
      });
      return content;
    },
  });

  useEffect(() => {
    if (cmsData) {
      setEditedContent({ ...defaultContent, ...cmsData });
    } else {
      setEditedContent(defaultContent);
    }
  }, [cmsData]);

  const saveMutation = useMutation({
    mutationFn: async (section: string) => {
      const { error } = await supabase
        .from('cms_content')
        .upsert({ key: section, value: editedContent[section] as Json });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cms-content'] });
      toast.success('Contenido guardado');
    },
    onError: () => {
      toast.error('Error al guardar');
    },
  });

  const updateField = (section: string, field: string, value: unknown) => {
    setEditedContent(prev => ({
      ...prev,
      [section]: { ...prev[section], [field]: value },
    }));
  };

  const updateArrayItem = (section: string, field: string, index: number, itemField: string, value: string) => {
    setEditedContent(prev => {
      const items = [...(prev[section][field] as Array<Record<string, string>>)];
      items[index] = { ...items[index], [itemField]: value };
      return { ...prev, [section]: { ...prev[section], [field]: items } };
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold">CMS</h1>
          <p className="text-muted-foreground">Edita el contenido del sitio</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => window.open('/', '_blank')}>
          <Eye className="w-4 h-4 mr-2" />
          Vista previa
        </Button>
      </div>

      <Tabs defaultValue="home_hero" className="space-y-6">
        <TabsList className="flex-wrap h-auto gap-2">
          <TabsTrigger value="home_hero">Hero Home</TabsTrigger>
          <TabsTrigger value="home_stats">Stats</TabsTrigger>
          <TabsTrigger value="agente_hero">Hero Agente</TabsTrigger>
          <TabsTrigger value="faq">FAQ</TabsTrigger>
        </TabsList>

        {/* Home Hero */}
        <TabsContent value="home_hero" className="space-y-4">
          <div className="glass-card rounded-xl p-6 space-y-4">
            <div className="space-y-2">
              <Label>Título principal</Label>
              <Input
                value={(editedContent.home_hero?.title as string) || ''}
                onChange={(e) => updateField('home_hero', 'title', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Subtítulo</Label>
              <Textarea
                value={(editedContent.home_hero?.subtitle as string) || ''}
                onChange={(e) => updateField('home_hero', 'subtitle', e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>CTA Primario</Label>
                <Input
                  value={(editedContent.home_hero?.cta_primary as string) || ''}
                  onChange={(e) => updateField('home_hero', 'cta_primary', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>CTA Secundario</Label>
                <Input
                  value={(editedContent.home_hero?.cta_secondary as string) || ''}
                  onChange={(e) => updateField('home_hero', 'cta_secondary', e.target.value)}
                />
              </div>
            </div>
            <Button onClick={() => saveMutation.mutate('home_hero')} variant="hero">
              <Save className="w-4 h-4 mr-2" />
              Guardar
            </Button>
          </div>
        </TabsContent>

        {/* Stats */}
        <TabsContent value="home_stats" className="space-y-4">
          <div className="glass-card rounded-xl p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Crecimiento</Label>
                <Input
                  value={(editedContent.home_stats?.growth as string) || ''}
                  onChange={(e) => updateField('home_stats', 'growth', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Label Crecimiento</Label>
                <Input
                  value={(editedContent.home_stats?.growth_label as string) || ''}
                  onChange={(e) => updateField('home_stats', 'growth_label', e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Móvil</Label>
                <Input
                  value={(editedContent.home_stats?.mobile as string) || ''}
                  onChange={(e) => updateField('home_stats', 'mobile', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Label Móvil</Label>
                <Input
                  value={(editedContent.home_stats?.mobile_label as string) || ''}
                  onChange={(e) => updateField('home_stats', 'mobile_label', e.target.value)}
                />
              </div>
            </div>
            <Button onClick={() => saveMutation.mutate('home_stats')} variant="hero">
              <Save className="w-4 h-4 mr-2" />
              Guardar
            </Button>
          </div>
        </TabsContent>

        {/* Agente Hero */}
        <TabsContent value="agente_hero" className="space-y-4">
          <div className="glass-card rounded-xl p-6 space-y-4">
            <div className="space-y-2">
              <Label>Título</Label>
              <Input
                value={(editedContent.agente_hero?.title as string) || ''}
                onChange={(e) => updateField('agente_hero', 'title', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Subtítulo</Label>
              <Textarea
                value={(editedContent.agente_hero?.subtitle as string) || ''}
                onChange={(e) => updateField('agente_hero', 'subtitle', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>CTA</Label>
              <Input
                value={(editedContent.agente_hero?.cta as string) || ''}
                onChange={(e) => updateField('agente_hero', 'cta', e.target.value)}
              />
            </div>
            <Button onClick={() => saveMutation.mutate('agente_hero')} variant="hero">
              <Save className="w-4 h-4 mr-2" />
              Guardar
            </Button>
          </div>
        </TabsContent>

        {/* FAQ */}
        <TabsContent value="faq" className="space-y-4">
          <div className="glass-card rounded-xl p-6 space-y-4">
            {((editedContent.faq?.items as Array<{ q: string; a: string }>) || []).map((item, i) => (
              <div key={i} className="border-b border-border pb-4 space-y-2">
                <div className="space-y-2">
                  <Label>Pregunta {i + 1}</Label>
                  <Input
                    value={item.q}
                    onChange={(e) => updateArrayItem('faq', 'items', i, 'q', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Respuesta</Label>
                  <Textarea
                    value={item.a}
                    onChange={(e) => updateArrayItem('faq', 'items', i, 'a', e.target.value)}
                  />
                </div>
              </div>
            ))}
            <Button onClick={() => saveMutation.mutate('faq')} variant="hero">
              <Save className="w-4 h-4 mr-2" />
              Guardar
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminCMS;
