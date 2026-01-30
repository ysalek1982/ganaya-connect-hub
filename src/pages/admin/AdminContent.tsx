import { useState, useEffect } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { auth } from '@/lib/firebase';
import { supabase } from '@/integrations/supabase/client';
import { Save, Plus, Trash2, Eye, Video, FileText, Loader2, Palette, Layout, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';
import { 
  LandingContent, 
  defaultLandingContent, 
  extractYouTubeId,
  defaultBrand,
  defaultHero,
  defaultVsl,
  defaultSectionTitles,
  defaultSocialProof,
} from '@/hooks/useLandingContent';

const invokeBootstrapAdmin = async <T,>(payload: Record<string, unknown>): Promise<T> => {
  const { data, error } = await supabase.functions.invoke('bootstrap-admin', { body: payload });
  if (error) throw new Error(error.message);
  if ((data as any)?.error) throw new Error((data as any).error);
  return data as T;
};

const AdminContent = () => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<LandingContent>(defaultLandingContent);

  const getIdToken = async (): Promise<string> => {
    const user = auth.currentUser;
    if (!user) throw new Error('Debes iniciar sesión');
    return await user.getIdToken(true);
  };

  // Load content
  const { data: content, isLoading } = useQuery({
    queryKey: ['admin-landing-content'],
    queryFn: async (): Promise<LandingContent> => {
      const idToken = await getIdToken();
      const res = await invokeBootstrapAdmin<{ success: boolean; content: Partial<LandingContent> | null }>({
        action: 'landing_content_get',
        idToken,
      });
      
      // Deep merge with defaults
      const loaded: Partial<LandingContent> = res.content || {};
      return {
        ...defaultLandingContent,
        ...loaded,
        brand: { ...defaultBrand, ...(loaded.brand || {}) },
        hero: { ...defaultHero, ...(loaded.hero || {}) },
        vsl: { ...defaultVsl, ...(loaded.vsl || {}) },
        sectionTitles: { ...defaultSectionTitles, ...(loaded.sectionTitles || {}) },
        socialProof: { ...defaultSocialProof, ...(loaded.socialProof || {}) },
        sectionsEnabled: { ...defaultLandingContent.sectionsEnabled, ...(loaded.sectionsEnabled || {}) },
      };
    },
  });

  useEffect(() => {
    if (content) {
      setFormData(content);
    }
  }, [content]);

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      const idToken = await getIdToken();
      await invokeBootstrapAdmin({
        action: 'landing_content_upsert',
        idToken,
        content: formData,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-landing-content'] });
      queryClient.invalidateQueries({ queryKey: ['landing-content'] });
      toast.success('Contenido guardado');
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Error al guardar');
    },
  });

  // Array helpers
  const updateBullet = (index: number, value: string) => {
    const bullets = [...formData.heroBullets];
    bullets[index] = value;
    setFormData({ ...formData, heroBullets: bullets });
  };

  const addBullet = () => {
    setFormData({ ...formData, heroBullets: [...formData.heroBullets, ''] });
  };

  const removeBullet = (index: number) => {
    setFormData({ ...formData, heroBullets: formData.heroBullets.filter((_, i) => i !== index) });
  };

  const updateTrustBadge = (index: number, value: string) => {
    const badges = [...(formData.brand?.trustBadges || [])];
    badges[index] = value;
    setFormData({ 
      ...formData, 
      brand: { ...formData.brand, trustBadges: badges }
    });
  };

  const addTrustBadge = () => {
    setFormData({ 
      ...formData, 
      brand: { 
        ...formData.brand, 
        trustBadges: [...(formData.brand?.trustBadges || []), ''] 
      }
    });
  };

  const removeTrustBadge = (index: number) => {
    setFormData({ 
      ...formData, 
      brand: { 
        ...formData.brand, 
        trustBadges: (formData.brand?.trustBadges || []).filter((_, i) => i !== index) 
      }
    });
  };

  const toggleSection = (key: string) => {
    setFormData({
      ...formData,
      sectionsEnabled: {
        ...formData.sectionsEnabled,
        [key]: !formData.sectionsEnabled[key],
      },
    });
  };

  const youtubeId = extractYouTubeId(formData.vslYoutubeUrl || formData.vsl?.vslYoutubeUrl || '');

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold">Contenido Landing</h1>
          <p className="text-muted-foreground">Edita los textos y estilos de la página de reclutamiento</p>
        </div>
        <Button 
          variant="hero" 
          onClick={() => saveMutation.mutate()}
          disabled={saveMutation.isPending}
        >
          {saveMutation.isPending ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          Guardar Cambios
        </Button>
      </div>

      <Tabs defaultValue="hero" className="w-full">
        <TabsList className="grid w-full grid-cols-5 mb-6">
          <TabsTrigger value="hero">
            <FileText className="w-4 h-4 mr-2" />
            Hero
          </TabsTrigger>
          <TabsTrigger value="brand">
            <Palette className="w-4 h-4 mr-2" />
            Marca
          </TabsTrigger>
          <TabsTrigger value="video">
            <Video className="w-4 h-4 mr-2" />
            Video
          </TabsTrigger>
          <TabsTrigger value="titles">
            <Layout className="w-4 h-4 mr-2" />
            Títulos
          </TabsTrigger>
          <TabsTrigger value="sections">
            <Eye className="w-4 h-4 mr-2" />
            Secciones
          </TabsTrigger>
        </TabsList>

        {/* Hero Content */}
        <TabsContent value="hero" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sección Hero</CardTitle>
              <CardDescription>El contenido principal que ven los visitantes al entrar</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Eyebrow (texto pequeño arriba del título)</Label>
                <Input
                  value={formData.hero?.heroEyebrow || ''}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    hero: { ...formData.hero, heroEyebrow: e.target.value }
                  })}
                  placeholder="PROGRAMA DE AGENTES"
                />
              </div>

              <div className="space-y-2">
                <Label>Título Principal</Label>
                <Input
                  value={formData.heroTitle}
                  onChange={(e) => setFormData({ ...formData, heroTitle: e.target.value })}
                  placeholder="Crea ingresos como Agente..."
                />
              </div>

              <div className="space-y-2">
                <Label>Subtítulo</Label>
                <Textarea
                  value={formData.heroSubtitle}
                  onChange={(e) => setFormData({ ...formData, heroSubtitle: e.target.value })}
                  placeholder="Comisiones escalables..."
                  rows={2}
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Bullets (puntos clave)</Label>
                  <Button variant="outline" size="sm" onClick={addBullet}>
                    <Plus className="w-4 h-4 mr-1" />
                    Agregar
                  </Button>
                </div>
                {formData.heroBullets.map((bullet, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={bullet}
                      onChange={(e) => updateBullet(index, e.target.value)}
                      placeholder={`Bullet ${index + 1}`}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeBullet(index)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Texto CTA Principal</Label>
                  <Input
                    value={formData.ctaPrimaryText}
                    onChange={(e) => setFormData({ ...formData, ctaPrimaryText: e.target.value })}
                    placeholder="Postularme ahora"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Texto CTA Secundario</Label>
                  <Input
                    value={formData.hero?.heroCTASecondaryText || formData.ctaSecondaryText}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      ctaSecondaryText: e.target.value,
                      hero: { ...formData.hero, heroCTASecondaryText: e.target.value }
                    })}
                    placeholder="Ver cómo funciona"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Fuerza del overlay ({Math.round((formData.hero?.heroImageOverlayStrength || 0.55) * 100)}%)</Label>
                <Slider
                  value={[(formData.hero?.heroImageOverlayStrength || 0.55) * 100]}
                  onValueChange={([val]) => setFormData({
                    ...formData,
                    hero: { ...formData.hero, heroImageOverlayStrength: val / 100 }
                  })}
                  min={0}
                  max={100}
                  step={5}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Controla la oscuridad del fondo detrás del texto
                </p>
              </div>

              <div className="space-y-2">
                <Label>Disclaimer final</Label>
                <Input
                  value={formData.disclaimerText}
                  onChange={(e) => setFormData({ ...formData, disclaimerText: e.target.value })}
                  placeholder="+18 · Programa de agentes..."
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Brand Configuration */}
        <TabsContent value="brand" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de Marca</CardTitle>
              <CardDescription>Estilos visuales y elementos de confianza</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nombre de la marca</Label>
                  <Input
                    value={formData.brand?.brandName || 'Ganaya.bet'}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      brand: { ...formData.brand, brandName: e.target.value }
                    })}
                    placeholder="Ganaya.bet"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Estilo de colores</Label>
                  <Select
                    value={formData.brand?.accentStyle || 'emerald_gold'}
                    onValueChange={(val) => setFormData({
                      ...formData,
                      brand: { ...formData.brand, accentStyle: val as any }
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="emerald_gold">Esmeralda + Oro (Premium)</SelectItem>
                      <SelectItem value="neon">Neón (Moderno)</SelectItem>
                      <SelectItem value="minimal">Minimal (Limpio)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Estilo visual del Hero</Label>
                <Select
                  value={formData.brand?.heroVisualStyle || 'roulette'}
                  onValueChange={(val) => setFormData({
                    ...formData,
                    brand: { ...formData.brand, heroVisualStyle: val as any }
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="roulette">Ruleta (animada)</SelectItem>
                    <SelectItem value="chips">Fichas de casino</SelectItem>
                    <SelectItem value="cards">Cartas</SelectItem>
                    <SelectItem value="lights">Luces de estadio</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Elemento decorativo que aparece en el fondo del hero
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Badges de confianza</Label>
                  <Button variant="outline" size="sm" onClick={addTrustBadge}>
                    <Plus className="w-4 h-4 mr-1" />
                    Agregar
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Chips que aparecen debajo del CTA principal
                </p>
                {(formData.brand?.trustBadges || []).map((badge, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={badge}
                      onChange={(e) => updateTrustBadge(index, e.target.value)}
                      placeholder={`Badge ${index + 1}`}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeTrustBadge(index)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <Label>Disclaimer corto (comisiones)</Label>
                <Input
                  value={formData.socialProof?.disclaimerShort || ''}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    socialProof: { ...formData.socialProof, disclaimerShort: e.target.value }
                  })}
                  placeholder="*Resultados dependen de tu gestión..."
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Video VSL */}
        <TabsContent value="video" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Video Principal (VSL)</CardTitle>
              <CardDescription>Video explicativo de 90 segundos para convencer postulantes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>URL de YouTube</Label>
                <Input
                  value={formData.vslYoutubeUrl || formData.vsl?.vslYoutubeUrl || ''}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    vslYoutubeUrl: e.target.value,
                    vsl: { ...formData.vsl, vslYoutubeUrl: e.target.value }
                  })}
                  placeholder="https://www.youtube.com/watch?v=..."
                />
                <p className="text-xs text-muted-foreground">
                  Pega el link completo de YouTube. Si está vacío, la sección de video no se mostrará.
                </p>
              </div>

              {youtubeId && (
                <div className="space-y-2">
                  <Label>Vista previa</Label>
                  <div className="aspect-video rounded-lg overflow-hidden border border-border max-w-md">
                    <iframe
                      src={`https://www.youtube.com/embed/${youtubeId}?rel=0&modestbranding=1`}
                      title="Vista previa"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label>Título de la sección</Label>
                <Input
                  value={formData.vslTitle || formData.vsl?.vslTitle || ''}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    vslTitle: e.target.value,
                    vsl: { ...formData.vsl, vslTitle: e.target.value }
                  })}
                  placeholder="Mira esto antes de postular"
                />
              </div>

              <div className="space-y-2">
                <Label>Subtítulo</Label>
                <Input
                  value={formData.vslSubtitle || formData.vsl?.vslSubtitle || ''}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    vslSubtitle: e.target.value,
                    vsl: { ...formData.vsl, vslSubtitle: e.target.value }
                  })}
                  placeholder="En menos de 2 minutos..."
                />
              </div>

              <div className="space-y-2">
                <Label>Layout del video</Label>
                <Select
                  value={formData.vsl?.vslLayout || 'split'}
                  onValueChange={(val) => setFormData({
                    ...formData,
                    vsl: { ...formData.vsl, vslLayout: val as 'split' | 'center' }
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="split">Split (video izq, texto der)</SelectItem>
                    <SelectItem value="center">Centrado (video grande)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Section Titles */}
        <TabsContent value="titles" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Títulos de Secciones</CardTitle>
              <CardDescription>Personaliza los títulos de cada sección</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Cómo funciona</Label>
                  <Input
                    value={formData.sectionTitles?.howItWorksTitle || ''}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      sectionTitles: { ...formData.sectionTitles, howItWorksTitle: e.target.value }
                    })}
                    placeholder="Cómo funciona"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Beneficios</Label>
                  <Input
                    value={formData.sectionTitles?.benefitsTitle || ''}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      sectionTitles: { ...formData.sectionTitles, benefitsTitle: e.target.value }
                    })}
                    placeholder="Beneficios del programa"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Comisiones</Label>
                  <Input
                    value={formData.sectionTitles?.commissionsTitle || ''}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      sectionTitles: { ...formData.sectionTitles, commissionsTitle: e.target.value }
                    })}
                    placeholder="Comisiones y bonos"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Crecimiento</Label>
                  <Input
                    value={formData.sectionTitles?.growthTitle || ''}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      sectionTitles: { ...formData.sectionTitles, growthTitle: e.target.value }
                    })}
                    placeholder="Crece con tu red"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Preguntas frecuentes</Label>
                  <Input
                    value={formData.sectionTitles?.faqTitle || ''}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      sectionTitles: { ...formData.sectionTitles, faqTitle: e.target.value }
                    })}
                    placeholder="Preguntas frecuentes"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sections Toggle */}
        <TabsContent value="sections" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Secciones Visibles</CardTitle>
              <CardDescription>Activa o desactiva secciones de la landing page</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {[
                  { key: 'video', label: 'Video VSL', desc: 'Video explicativo de 90 segundos' },
                  { key: 'howItWorks', label: 'Cómo Funciona', desc: '3 pasos para empezar' },
                  { key: 'benefits', label: 'Beneficios', desc: 'Comisiones y ventajas' },
                  { key: 'forWho', label: 'Para Quién Es', desc: 'Filtro de candidatos' },
                  { key: 'requirements', label: 'Requisitos', desc: 'Qué necesitas para empezar' },
                  { key: 'flow', label: 'Flujo de Trabajo', desc: 'Cómo opera un agente' },
                  { key: 'commissions', label: 'Comisiones', desc: 'Estructura de pagos' },
                  { key: 'growth', label: 'Crecimiento', desc: 'Red y sub-agentes' },
                  { key: 'faq', label: 'Preguntas Frecuentes', desc: 'Dudas comunes' },
                ].map(({ key, label, desc }) => (
                  <div
                    key={key}
                    className={`flex items-center justify-between p-4 rounded-lg transition-colors ${
                      formData.sectionsEnabled[key]
                        ? 'bg-primary/10 border border-primary/20'
                        : 'bg-muted/50 border border-transparent'
                    }`}
                  >
                    <div>
                      <p className="font-medium">{label}</p>
                      <p className="text-sm text-muted-foreground">{desc}</p>
                    </div>
                    <Switch
                      checked={formData.sectionsEnabled[key] ?? true}
                      onCheckedChange={() => toggleSection(key)}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminContent;
