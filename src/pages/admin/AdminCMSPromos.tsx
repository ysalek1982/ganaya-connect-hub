import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Plus, Save, Trash2, Upload, ExternalLink, GripVertical, Image as ImageIcon } from 'lucide-react';

interface CMSItem {
  id: string;
  [key: string]: any;
}

const AdminCMSPromos = () => {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingFor, setUploadingFor] = useState<{ table: string; id: string; field: string } | null>(null);

  // Fetch all CMS data
  const { data: sections } = useQuery({
    queryKey: ['admin_cms_sections'],
    queryFn: async () => {
      const { data, error } = await supabase.from('cms_sections').select('*').order('order');
      if (error) throw error;
      return data;
    },
  });

  const { data: lobbies } = useQuery({
    queryKey: ['admin_cms_lobbies'],
    queryFn: async () => {
      const { data, error } = await supabase.from('cms_lobbies').select('*').order('order');
      if (error) throw error;
      return data;
    },
  });

  const { data: promos } = useQuery({
    queryKey: ['admin_cms_promos_carousel'],
    queryFn: async () => {
      const { data, error } = await supabase.from('cms_promos_carousel').select('*').order('order');
      if (error) throw error;
      return data;
    },
  });

  const { data: games } = useQuery({
    queryKey: ['admin_cms_spotlight_games'],
    queryFn: async () => {
      const { data, error } = await supabase.from('cms_spotlight_games').select('*').order('order');
      if (error) throw error;
      return data;
    },
  });

  const { data: faqs } = useQuery({
    queryKey: ['admin_cms_faq'],
    queryFn: async () => {
      const { data, error } = await supabase.from('cms_faq').select('*').order('order');
      if (error) throw error;
      return data;
    },
  });

  const { data: mobileCtas } = useQuery({
    queryKey: ['admin_cms_mobile_ctas'],
    queryFn: async () => {
      const { data, error } = await supabase.from('cms_mobile_ctas').select('*').order('order');
      if (error) throw error;
      return data;
    },
  });

  const { data: seoData } = useQuery({
    queryKey: ['admin_cms_seo'],
    queryFn: async () => {
      const { data, error } = await supabase.from('cms_seo').select('*');
      if (error) throw error;
      return data;
    },
  });

  // Generic update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ table, id, data }: { table: string; id: string; data: any }) => {
      const { error } = await supabase.from(table as any).update(data).eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [`admin_${variables.table}`] });
      queryClient.invalidateQueries({ queryKey: [variables.table.replace('cms_', '')] });
      toast.success('Guardado correctamente');
    },
    onError: () => toast.error('Error al guardar'),
  });

  // Generic insert mutation
  const insertMutation = useMutation({
    mutationFn: async ({ table, data }: { table: string; data: any }) => {
      const { error } = await supabase.from(table as any).insert(data);
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [`admin_${variables.table}`] });
      toast.success('Creado correctamente');
    },
    onError: () => toast.error('Error al crear'),
  });

  // Generic delete mutation
  const deleteMutation = useMutation({
    mutationFn: async ({ table, id }: { table: string; id: string }) => {
      const { error } = await supabase.from(table as any).delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [`admin_${variables.table}`] });
      toast.success('Eliminado correctamente');
    },
    onError: () => toast.error('Error al eliminar'),
  });

  // Image upload handler
  const handleImageUpload = async (file: File) => {
    if (!uploadingFor) return;

    const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const { data, error } = await supabase.storage.from('cms-images').upload(fileName, file);

    if (error) {
      toast.error('Error al subir imagen');
      return;
    }

    const { data: urlData } = supabase.storage.from('cms-images').getPublicUrl(data.path);

    updateMutation.mutate({
      table: uploadingFor.table,
      id: uploadingFor.id,
      data: { [uploadingFor.field]: urlData.publicUrl },
    });

    setUploadingFor(null);
  };

  const ItemCard = ({ item, table, fields }: { item: CMSItem; table: string; fields: { key: string; label: string; type: 'text' | 'textarea' | 'switch' | 'select' | 'number' | 'image'; options?: string[] }[] }) => {
    const [localItem, setLocalItem] = useState(item);

    const handleSave = () => {
      const updateData: any = {};
      fields.forEach(f => {
        if (f.type !== 'image') {
          updateData[f.key] = localItem[f.key];
        }
      });
      updateMutation.mutate({ table, id: item.id, data: updateData });
    };

    return (
      <Card className="mb-4">
        <CardContent className="pt-4">
          <div className="flex items-start gap-2 mb-4">
            <GripVertical className="w-5 h-5 text-muted-foreground mt-2 cursor-grab" />
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {fields.map(field => (
                <div key={field.key}>
                  <Label className="text-xs text-muted-foreground">{field.label}</Label>
                  {field.type === 'text' && (
                    <Input
                      value={localItem[field.key] || ''}
                      onChange={e => setLocalItem({ ...localItem, [field.key]: e.target.value })}
                      className="mt-1"
                    />
                  )}
                  {field.type === 'textarea' && (
                    <Textarea
                      value={localItem[field.key] || ''}
                      onChange={e => setLocalItem({ ...localItem, [field.key]: e.target.value })}
                      className="mt-1"
                      rows={2}
                    />
                  )}
                  {field.type === 'number' && (
                    <Input
                      type="number"
                      value={localItem[field.key] || 0}
                      onChange={e => setLocalItem({ ...localItem, [field.key]: parseInt(e.target.value) })}
                      className="mt-1"
                    />
                  )}
                  {field.type === 'switch' && (
                    <div className="mt-2">
                      <Switch
                        checked={localItem[field.key] || false}
                        onCheckedChange={checked => setLocalItem({ ...localItem, [field.key]: checked })}
                      />
                    </div>
                  )}
                  {field.type === 'select' && field.options && (
                    <Select
                      value={localItem[field.key] || ''}
                      onValueChange={value => setLocalItem({ ...localItem, [field.key]: value })}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {field.options.map(opt => (
                          <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  {field.type === 'image' && (
                    <div className="mt-1 flex items-center gap-2">
                      {localItem[field.key] ? (
                        <img src={localItem[field.key]} alt="" className="w-16 h-16 object-cover rounded" />
                      ) : (
                        <div className="w-16 h-16 bg-muted rounded flex items-center justify-center">
                          <ImageIcon className="w-6 h-6 text-muted-foreground" />
                        </div>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setUploadingFor({ table, id: item.id, field: field.key });
                          fileInputRef.current?.click();
                        }}
                      >
                        <Upload className="w-4 h-4 mr-1" /> Subir
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSave} disabled={updateMutation.isPending}>
                <Save className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => deleteMutation.mutate({ table, id: item.id })}
                disabled={deleteMutation.isPending}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">CMS Promos & Juegos</h1>
          <p className="text-muted-foreground">Gestiona el contenido de la landing page</p>
        </div>
        <Button variant="outline" onClick={() => window.open('/', '_blank')}>
          <ExternalLink className="w-4 h-4 mr-2" /> Vista Previa
        </Button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={e => {
          const file = e.target.files?.[0];
          if (file) handleImageUpload(file);
          e.target.value = '';
        }}
      />

      <Tabs defaultValue="sections" className="space-y-4">
        <TabsList className="grid grid-cols-3 md:grid-cols-7 w-full">
          <TabsTrigger value="sections">Secciones</TabsTrigger>
          <TabsTrigger value="lobbies">Lobbies</TabsTrigger>
          <TabsTrigger value="promos">Promos</TabsTrigger>
          <TabsTrigger value="games">Juegos</TabsTrigger>
          <TabsTrigger value="faq">FAQ</TabsTrigger>
          <TabsTrigger value="ctas">CTAs Móvil</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
        </TabsList>

        {/* Sections */}
        <TabsContent value="sections">
          <Card>
            <CardHeader>
              <CardTitle>Secciones de la Home</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">Activa/desactiva secciones y modifica títulos</p>
              {sections?.map(section => (
                <ItemCard
                  key={section.id}
                  item={section}
                  table="cms_sections"
                  fields={[
                    { key: 'key', label: 'Key', type: 'text' },
                    { key: 'title', label: 'Título', type: 'text' },
                    { key: 'subtitle', label: 'Subtítulo', type: 'text' },
                    { key: 'order', label: 'Orden', type: 'number' },
                    { key: 'enabled', label: 'Activo', type: 'switch' },
                  ]}
                />
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Lobbies */}
        <TabsContent value="lobbies">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Lobbies de Juego</CardTitle>
              <Button
                size="sm"
                onClick={() => insertMutation.mutate({
                  table: 'cms_lobbies',
                  data: { category: 'nuevo', title: 'Nuevo Lobby', cta_text: 'Jugar', order: (lobbies?.length || 0) + 1 }
                })}
              >
                <Plus className="w-4 h-4 mr-1" /> Agregar
              </Button>
            </CardHeader>
            <CardContent>
              {lobbies?.map(lobby => (
                <ItemCard
                  key={lobby.id}
                  item={lobby}
                  table="cms_lobbies"
                  fields={[
                    { key: 'category', label: 'Categoría', type: 'select', options: ['deportes', 'casino', 'live-casino', 'tv-games', 'rapidos'] },
                    { key: 'title', label: 'Título', type: 'text' },
                    { key: 'description', label: 'Descripción', type: 'textarea' },
                    { key: 'image_url', label: 'Imagen', type: 'image' },
                    { key: 'cta_text', label: 'Texto CTA', type: 'text' },
                    { key: 'cta_link', label: 'Link CTA', type: 'text' },
                    { key: 'badge', label: 'Badge', type: 'text' },
                    { key: 'order', label: 'Orden', type: 'number' },
                    { key: 'active', label: 'Activo', type: 'switch' },
                  ]}
                />
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Promos Carousel */}
        <TabsContent value="promos">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Carrusel de Promos</CardTitle>
              <Button
                size="sm"
                onClick={() => insertMutation.mutate({
                  table: 'cms_promos_carousel',
                  data: { title: 'Nueva Promo', cta_text: 'Ver más', order: (promos?.length || 0) + 1 }
                })}
              >
                <Plus className="w-4 h-4 mr-1" /> Agregar
              </Button>
            </CardHeader>
            <CardContent>
              {promos?.map(promo => (
                <ItemCard
                  key={promo.id}
                  item={promo}
                  table="cms_promos_carousel"
                  fields={[
                    { key: 'title', label: 'Título', type: 'text' },
                    { key: 'subtitle', label: 'Subtítulo', type: 'text' },
                    { key: 'image_url', label: 'Imagen', type: 'image' },
                    { key: 'cta_text', label: 'Texto CTA', type: 'text' },
                    { key: 'cta_link', label: 'Link CTA', type: 'text' },
                    { key: 'order', label: 'Orden', type: 'number' },
                    { key: 'active', label: 'Activo', type: 'switch' },
                  ]}
                />
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Spotlight Games */}
        <TabsContent value="games">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Juegos Destacados</CardTitle>
              <Button
                size="sm"
                onClick={() => insertMutation.mutate({
                  table: 'cms_spotlight_games',
                  data: { name: 'Nuevo Juego', category: 'Slots', speed_tag: 'Normal', cta_text: 'Jugar', order: (games?.length || 0) + 1 }
                })}
              >
                <Plus className="w-4 h-4 mr-1" /> Agregar
              </Button>
            </CardHeader>
            <CardContent>
              {games?.map(game => (
                <ItemCard
                  key={game.id}
                  item={game}
                  table="cms_spotlight_games"
                  fields={[
                    { key: 'name', label: 'Nombre', type: 'text' },
                    { key: 'category', label: 'Categoría', type: 'select', options: ['Slots', 'Live Casino', 'TV Games', 'Crash', 'Keno', 'HiLo'] },
                    { key: 'speed_tag', label: 'Velocidad', type: 'select', options: ['Rápido', 'Normal', 'En Vivo'] },
                    { key: 'image_url', label: 'Imagen', type: 'image' },
                    { key: 'cta_text', label: 'Texto CTA', type: 'text' },
                    { key: 'cta_link', label: 'Link CTA', type: 'text' },
                    { key: 'order', label: 'Orden', type: 'number' },
                    { key: 'active', label: 'Activo', type: 'switch' },
                  ]}
                />
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* FAQ */}
        <TabsContent value="faq">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Preguntas Frecuentes</CardTitle>
              <Button
                size="sm"
                onClick={() => insertMutation.mutate({
                  table: 'cms_faq',
                  data: { question: 'Nueva pregunta', answer: 'Respuesta aquí', order: (faqs?.length || 0) + 1 }
                })}
              >
                <Plus className="w-4 h-4 mr-1" /> Agregar
              </Button>
            </CardHeader>
            <CardContent>
              {faqs?.map(faq => (
                <ItemCard
                  key={faq.id}
                  item={faq}
                  table="cms_faq"
                  fields={[
                    { key: 'question', label: 'Pregunta', type: 'text' },
                    { key: 'answer', label: 'Respuesta', type: 'textarea' },
                    { key: 'order', label: 'Orden', type: 'number' },
                    { key: 'active', label: 'Activo', type: 'switch' },
                  ]}
                />
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Mobile CTAs */}
        <TabsContent value="ctas">
          <Card>
            <CardHeader>
              <CardTitle>Botones Móvil Sticky</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">Configura los botones fijos en móvil</p>
              {mobileCtas?.map(cta => (
                <ItemCard
                  key={cta.id}
                  item={cta}
                  table="cms_mobile_ctas"
                  fields={[
                    { key: 'button_key', label: 'Key', type: 'text' },
                    { key: 'text', label: 'Texto', type: 'text' },
                    { key: 'link', label: 'Link', type: 'text' },
                    { key: 'order', label: 'Orden', type: 'number' },
                    { key: 'visible', label: 'Visible', type: 'switch' },
                  ]}
                />
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* SEO */}
        <TabsContent value="seo">
          <Card>
            <CardHeader>
              <CardTitle>SEO & OpenGraph</CardTitle>
            </CardHeader>
            <CardContent>
              {seoData?.map(seo => (
                <ItemCard
                  key={seo.id}
                  item={seo}
                  table="cms_seo"
                  fields={[
                    { key: 'page_key', label: 'Página', type: 'text' },
                    { key: 'meta_title', label: 'Meta Title', type: 'text' },
                    { key: 'meta_description', label: 'Meta Description', type: 'textarea' },
                    { key: 'og_image_url', label: 'OG Image', type: 'image' },
                  ]}
                />
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminCMSPromos;
