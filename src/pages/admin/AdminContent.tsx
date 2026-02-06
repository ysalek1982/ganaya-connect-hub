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
  defaultProblemSection,
  defaultOpportunitySection,
  defaultCompetitiveSection,
  defaultAcquisitionSection,
  defaultNextStepsSection,
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
        problemSection: { ...defaultProblemSection, ...(loaded.problemSection || {}) },
        opportunitySection: { ...defaultOpportunitySection, ...(loaded.opportunitySection || {}) },
        competitiveSection: { ...defaultCompetitiveSection, ...(loaded.competitiveSection || {}) },
        acquisitionSection: { ...defaultAcquisitionSection, ...(loaded.acquisitionSection || {}) },
        nextStepsSection: { ...defaultNextStepsSection, ...(loaded.nextStepsSection || {}) },
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
        <TabsList className="grid w-full grid-cols-6 mb-6">
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
          <TabsTrigger value="content">
            <MessageSquare className="w-4 h-4 mr-2" />
            Contenido
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

        {/* Contenido de Secciones Nuevas */}
        <TabsContent value="content" className="space-y-6">
          {/* Problem Section */}
          <Card>
            <CardHeader>
              <CardTitle>El Problema</CardTitle>
              <CardDescription>Pain points que motivan a los postulantes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Título</Label>
                  <Input
                    value={formData.problemSection?.title || ''}
                    onChange={(e) => setFormData({ ...formData, problemSection: { ...formData.problemSection, title: e.target.value } })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Subtítulo</Label>
                  <Input
                    value={formData.problemSection?.subtitle || ''}
                    onChange={(e) => setFormData({ ...formData, problemSection: { ...formData.problemSection, subtitle: e.target.value } })}
                  />
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Problemas (items)</Label>
                  <Button variant="outline" size="sm" onClick={() => setFormData({
                    ...formData,
                    problemSection: { ...formData.problemSection, items: [...(formData.problemSection?.items || []), { title: '', description: '' }] }
                  })}>
                    <Plus className="w-4 h-4 mr-1" /> Agregar
                  </Button>
                </div>
                {(formData.problemSection?.items || []).map((item, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={item.title}
                      onChange={(e) => {
                        const items = [...(formData.problemSection?.items || [])];
                        items[index] = { ...items[index], title: e.target.value };
                        setFormData({ ...formData, problemSection: { ...formData.problemSection, items } });
                      }}
                      placeholder="Título"
                      className="w-1/3"
                    />
                    <Input
                      value={item.description}
                      onChange={(e) => {
                        const items = [...(formData.problemSection?.items || [])];
                        items[index] = { ...items[index], description: e.target.value };
                        setFormData({ ...formData, problemSection: { ...formData.problemSection, items } });
                      }}
                      placeholder="Descripción"
                    />
                    <Button variant="ghost" size="icon" onClick={() => {
                      const items = (formData.problemSection?.items || []).filter((_, i) => i !== index);
                      setFormData({ ...formData, problemSection: { ...formData.problemSection, items } });
                    }}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Opportunity Section */}
          <Card>
            <CardHeader>
              <CardTitle>Oportunidad LATAM</CardTitle>
              <CardDescription>Estadísticas del mercado</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Título</Label>
                  <Input
                    value={formData.opportunitySection?.title || ''}
                    onChange={(e) => setFormData({ ...formData, opportunitySection: { ...formData.opportunitySection, title: e.target.value } })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Subtítulo</Label>
                  <Input
                    value={formData.opportunitySection?.subtitle || ''}
                    onChange={(e) => setFormData({ ...formData, opportunitySection: { ...formData.opportunitySection, subtitle: e.target.value } })}
                  />
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Estadísticas</Label>
                  <Button variant="outline" size="sm" onClick={() => setFormData({
                    ...formData,
                    opportunitySection: { ...formData.opportunitySection, stats: [...(formData.opportunitySection?.stats || []), { value: '', label: '', sublabel: '' }] }
                  })}>
                    <Plus className="w-4 h-4 mr-1" /> Agregar
                  </Button>
                </div>
                {(formData.opportunitySection?.stats || []).map((stat, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={stat.value}
                      onChange={(e) => {
                        const stats = [...(formData.opportunitySection?.stats || [])];
                        stats[index] = { ...stats[index], value: e.target.value };
                        setFormData({ ...formData, opportunitySection: { ...formData.opportunitySection, stats } });
                      }}
                      placeholder="Valor (ej: +25%)"
                      className="w-1/4"
                    />
                    <Input
                      value={stat.label}
                      onChange={(e) => {
                        const stats = [...(formData.opportunitySection?.stats || [])];
                        stats[index] = { ...stats[index], label: e.target.value };
                        setFormData({ ...formData, opportunitySection: { ...formData.opportunitySection, stats } });
                      }}
                      placeholder="Label"
                      className="w-1/3"
                    />
                    <Input
                      value={stat.sublabel}
                      onChange={(e) => {
                        const stats = [...(formData.opportunitySection?.stats || [])];
                        stats[index] = { ...stats[index], sublabel: e.target.value };
                        setFormData({ ...formData, opportunitySection: { ...formData.opportunitySection, stats } });
                      }}
                      placeholder="Sublabel"
                    />
                    <Button variant="ghost" size="icon" onClick={() => {
                      const stats = (formData.opportunitySection?.stats || []).filter((_, i) => i !== index);
                      setFormData({ ...formData, opportunitySection: { ...formData.opportunitySection, stats } });
                    }}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Competitive Section */}
          <Card>
            <CardHeader>
              <CardTitle>Ventajas Competitivas</CardTitle>
              <CardDescription>Tablas comparativas</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Título</Label>
                  <Input
                    value={formData.competitiveSection?.title || ''}
                    onChange={(e) => setFormData({ ...formData, competitiveSection: { ...formData.competitiveSection, title: e.target.value } })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Subtítulo</Label>
                  <Input
                    value={formData.competitiveSection?.subtitle || ''}
                    onChange={(e) => setFormData({ ...formData, competitiveSection: { ...formData.competitiveSection, subtitle: e.target.value } })}
                  />
                </div>
              </div>
              <div className="space-y-3">
                <Label>VS Empleos tradicionales</Label>
                {(formData.competitiveSection?.vsEmployment || []).map((row, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={row.traditional}
                      onChange={(e) => {
                        const rows = [...(formData.competitiveSection?.vsEmployment || [])];
                        rows[index] = { ...rows[index], traditional: e.target.value };
                        setFormData({ ...formData, competitiveSection: { ...formData.competitiveSection, vsEmployment: rows } });
                      }}
                      placeholder="Tradicional"
                    />
                    <Input
                      value={row.ganaya}
                      onChange={(e) => {
                        const rows = [...(formData.competitiveSection?.vsEmployment || [])];
                        rows[index] = { ...rows[index], ganaya: e.target.value };
                        setFormData({ ...formData, competitiveSection: { ...formData.competitiveSection, vsEmployment: rows } });
                      }}
                      placeholder="Ganaya"
                    />
                    <Button variant="ghost" size="icon" onClick={() => {
                      const rows = (formData.competitiveSection?.vsEmployment || []).filter((_, i) => i !== index);
                      setFormData({ ...formData, competitiveSection: { ...formData.competitiveSection, vsEmployment: rows } });
                    }}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={() => setFormData({
                  ...formData,
                  competitiveSection: { ...formData.competitiveSection, vsEmployment: [...(formData.competitiveSection?.vsEmployment || []), { traditional: '', ganaya: '' }] }
                })}>
                  <Plus className="w-4 h-4 mr-1" /> Agregar fila
                </Button>
              </div>
              <div className="space-y-3">
                <Label>VS Otras plataformas</Label>
                {(formData.competitiveSection?.vsPlatforms || []).map((row, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={row.traditional}
                      onChange={(e) => {
                        const rows = [...(formData.competitiveSection?.vsPlatforms || [])];
                        rows[index] = { ...rows[index], traditional: e.target.value };
                        setFormData({ ...formData, competitiveSection: { ...formData.competitiveSection, vsPlatforms: rows } });
                      }}
                      placeholder="Otra plataforma"
                    />
                    <Input
                      value={row.ganaya}
                      onChange={(e) => {
                        const rows = [...(formData.competitiveSection?.vsPlatforms || [])];
                        rows[index] = { ...rows[index], ganaya: e.target.value };
                        setFormData({ ...formData, competitiveSection: { ...formData.competitiveSection, vsPlatforms: rows } });
                      }}
                      placeholder="Ganaya"
                    />
                    <Button variant="ghost" size="icon" onClick={() => {
                      const rows = (formData.competitiveSection?.vsPlatforms || []).filter((_, i) => i !== index);
                      setFormData({ ...formData, competitiveSection: { ...formData.competitiveSection, vsPlatforms: rows } });
                    }}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={() => setFormData({
                  ...formData,
                  competitiveSection: { ...formData.competitiveSection, vsPlatforms: [...(formData.competitiveSection?.vsPlatforms || []), { traditional: '', ganaya: '' }] }
                })}>
                  <Plus className="w-4 h-4 mr-1" /> Agregar fila
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Acquisition Section */}
          <Card>
            <CardHeader>
              <CardTitle>Métodos de Captación</CardTitle>
              <CardDescription>Estrategias de adquisición de clientes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Título</Label>
                  <Input
                    value={formData.acquisitionSection?.title || ''}
                    onChange={(e) => setFormData({ ...formData, acquisitionSection: { ...formData.acquisitionSection, title: e.target.value } })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Subtítulo</Label>
                  <Input
                    value={formData.acquisitionSection?.subtitle || ''}
                    onChange={(e) => setFormData({ ...formData, acquisitionSection: { ...formData.acquisitionSection, subtitle: e.target.value } })}
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Métodos</Label>
                  <Button variant="outline" size="sm" onClick={() => setFormData({
                    ...formData,
                    acquisitionSection: { ...formData.acquisitionSection, methods: [...(formData.acquisitionSection?.methods || []), { title: '', description: '', tips: [''] }] }
                  })}>
                    <Plus className="w-4 h-4 mr-1" /> Agregar método
                  </Button>
                </div>
                {(formData.acquisitionSection?.methods || []).map((method, mIndex) => (
                  <div key={mIndex} className="p-4 rounded-lg border border-border/50 space-y-3">
                    <div className="flex gap-2">
                      <Input
                        value={method.title}
                        onChange={(e) => {
                          const methods = [...(formData.acquisitionSection?.methods || [])];
                          methods[mIndex] = { ...methods[mIndex], title: e.target.value };
                          setFormData({ ...formData, acquisitionSection: { ...formData.acquisitionSection, methods } });
                        }}
                        placeholder="Título del método"
                        className="w-1/3"
                      />
                      <Input
                        value={method.description}
                        onChange={(e) => {
                          const methods = [...(formData.acquisitionSection?.methods || [])];
                          methods[mIndex] = { ...methods[mIndex], description: e.target.value };
                          setFormData({ ...formData, acquisitionSection: { ...formData.acquisitionSection, methods } });
                        }}
                        placeholder="Descripción"
                      />
                      <Button variant="ghost" size="icon" onClick={() => {
                        const methods = (formData.acquisitionSection?.methods || []).filter((_, i) => i !== mIndex);
                        setFormData({ ...formData, acquisitionSection: { ...formData.acquisitionSection, methods } });
                      }}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                    <div className="pl-4 space-y-2">
                      <Label className="text-xs">Tips</Label>
                      {(method.tips || []).map((tip, tIndex) => (
                        <div key={tIndex} className="flex gap-2">
                          <Input
                            value={tip}
                            onChange={(e) => {
                              const methods = [...(formData.acquisitionSection?.methods || [])];
                              const tips = [...(methods[mIndex].tips || [])];
                              tips[tIndex] = e.target.value;
                              methods[mIndex] = { ...methods[mIndex], tips };
                              setFormData({ ...formData, acquisitionSection: { ...formData.acquisitionSection, methods } });
                            }}
                            placeholder={`Tip ${tIndex + 1}`}
                          />
                          <Button variant="ghost" size="icon" onClick={() => {
                            const methods = [...(formData.acquisitionSection?.methods || [])];
                            methods[mIndex] = { ...methods[mIndex], tips: methods[mIndex].tips.filter((_, i) => i !== tIndex) };
                            setFormData({ ...formData, acquisitionSection: { ...formData.acquisitionSection, methods } });
                          }}>
                            <Trash2 className="w-3 h-3 text-destructive" />
                          </Button>
                        </div>
                      ))}
                      <Button variant="outline" size="sm" onClick={() => {
                        const methods = [...(formData.acquisitionSection?.methods || [])];
                        methods[mIndex] = { ...methods[mIndex], tips: [...(methods[mIndex].tips || []), ''] };
                        setFormData({ ...formData, acquisitionSection: { ...formData.acquisitionSection, methods } });
                      }}>
                        <Plus className="w-3 h-3 mr-1" /> Tip
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Next Steps Section */}
          <Card>
            <CardHeader>
              <CardTitle>Próximos Pasos</CardTitle>
              <CardDescription>Pasos para comenzar a operar</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Título</Label>
                  <Input
                    value={formData.nextStepsSection?.title || ''}
                    onChange={(e) => setFormData({ ...formData, nextStepsSection: { ...formData.nextStepsSection, title: e.target.value } })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Subtítulo</Label>
                  <Input
                    value={formData.nextStepsSection?.subtitle || ''}
                    onChange={(e) => setFormData({ ...formData, nextStepsSection: { ...formData.nextStepsSection, subtitle: e.target.value } })}
                  />
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Pasos</Label>
                  <Button variant="outline" size="sm" onClick={() => setFormData({
                    ...formData,
                    nextStepsSection: { ...formData.nextStepsSection, steps: [...(formData.nextStepsSection?.steps || []), { title: '', description: '' }] }
                  })}>
                    <Plus className="w-4 h-4 mr-1" /> Agregar
                  </Button>
                </div>
                {(formData.nextStepsSection?.steps || []).map((step, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={step.title}
                      onChange={(e) => {
                        const steps = [...(formData.nextStepsSection?.steps || [])];
                        steps[index] = { ...steps[index], title: e.target.value };
                        setFormData({ ...formData, nextStepsSection: { ...formData.nextStepsSection, steps } });
                      }}
                      placeholder="Título"
                      className="w-1/3"
                    />
                    <Input
                      value={step.description}
                      onChange={(e) => {
                        const steps = [...(formData.nextStepsSection?.steps || [])];
                        steps[index] = { ...steps[index], description: e.target.value };
                        setFormData({ ...formData, nextStepsSection: { ...formData.nextStepsSection, steps } });
                      }}
                      placeholder="Descripción"
                    />
                    <Button variant="ghost" size="icon" onClick={() => {
                      const steps = (formData.nextStepsSection?.steps || []).filter((_, i) => i !== index);
                      setFormData({ ...formData, nextStepsSection: { ...formData.nextStepsSection, steps } });
                    }}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

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
                  { key: 'problem', label: 'El Problema', desc: 'Pain points del mercado laboral' },
                  { key: 'opportunity', label: 'Oportunidad LATAM', desc: 'Estadísticas del mercado' },
                  { key: 'video', label: 'Video VSL', desc: 'Video explicativo de 90 segundos' },
                  { key: 'howItWorks', label: 'Cómo Funciona', desc: '3 pasos para empezar' },
                  { key: 'benefits', label: 'Beneficios', desc: 'Comisiones y ventajas' },
                  { key: 'forWho', label: 'Para Quién Es', desc: 'Filtro de candidatos' },
                  { key: 'requirements', label: 'Requisitos', desc: 'Qué necesitas para empezar' },
                  { key: 'flow', label: 'Flujo de Trabajo', desc: 'Cómo opera un agente' },
                  { key: 'commissions', label: 'Comisiones', desc: 'Estructura de pagos' },
                  { key: 'competitive', label: 'Ventajas Competitivas', desc: 'Comparativa vs empleos y plataformas' },
                  { key: 'growth', label: 'Crecimiento', desc: 'Red y sub-agentes' },
                  { key: 'acquisition', label: 'Métodos de Captación', desc: 'Estrategias para conseguir clientes' },
                  { key: 'nextSteps', label: 'Próximos Pasos', desc: '4 pasos para comenzar' },
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
