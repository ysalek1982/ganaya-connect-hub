import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, Eye, EyeOff, Video, Loader2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { 
  useAllTutorials, 
  useCreateTutorial, 
  useUpdateTutorial, 
  useDeleteTutorial 
} from '@/hooks/useTutorials';
import type { Tutorial } from '@/lib/firebase-types';

interface TutorialFormData {
  youtubeUrl: string;
  title: string;
  summary: string;
  order: number;
  isPublished: boolean;
  youtubeId?: string;
  thumbnailUrl?: string;
}

const AdminTutorials = () => {
  const { data: tutorials = [], isLoading } = useAllTutorials();
  const createTutorial = useCreateTutorial();
  const updateTutorial = useUpdateTutorial();
  const deleteTutorial = useDeleteTutorial();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingTutorial, setEditingTutorial] = useState<Tutorial | null>(null);
  const [tutorialToDelete, setTutorialToDelete] = useState<Tutorial | null>(null);
  const [fetchingMetadata, setFetchingMetadata] = useState(false);
  const [formData, setFormData] = useState<TutorialFormData>({
    youtubeUrl: '',
    title: '',
    summary: '',
    order: 0,
    isPublished: true,
  });

  const resetForm = () => {
    setFormData({
      youtubeUrl: '',
      title: '',
      summary: '',
      order: 0,
      isPublished: true,
    });
    setEditingTutorial(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEditDialog = (tutorial: Tutorial) => {
    setEditingTutorial(tutorial);
    setFormData({
      youtubeUrl: tutorial.videoUrl || '',
      title: tutorial.title,
      summary: tutorial.summary,
      order: tutorial.order,
      isPublished: tutorial.isPublished,
    });
    setDialogOpen(true);
  };

  const fetchYouTubeMetadata = async () => {
    if (!formData.youtubeUrl) {
      toast.error('Ingresa un link de YouTube');
      return;
    }

    setFetchingMetadata(true);
    try {
      const { data, error } = await supabase.functions.invoke('youtube-metadata', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        body: undefined,
      });

      // Use fetch directly for GET with query params
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/youtube-metadata?url=${encodeURIComponent(formData.youtubeUrl)}`,
        {
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch metadata');
      }

      const metadata = await response.json();

      if (metadata.success) {
        setFormData(prev => ({
          ...prev,
          title: metadata.title || prev.title,
          youtubeId: metadata.youtubeId,
          thumbnailUrl: metadata.thumbnailUrl,
        }));
        
        if (metadata.title) {
          toast.success('Título obtenido automáticamente');
        } else {
          toast.info('No se pudo obtener el título. Ingrésalo manualmente.');
        }
      } else {
        toast.error(metadata.error || 'Error al obtener metadatos');
      }
    } catch (error) {
      console.error('Error fetching YouTube metadata:', error);
      toast.error('Error al obtener metadatos del video');
    } finally {
      setFetchingMetadata(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      toast.error('El título es obligatorio');
      return;
    }

    if (!formData.youtubeUrl.trim()) {
      toast.error('El link de YouTube es obligatorio');
      return;
    }

    try {
      if (editingTutorial) {
        await updateTutorial.mutateAsync({
          id: editingTutorial.id,
          data: {
            title: formData.title,
            summary: formData.summary,
            videoUrl: formData.youtubeUrl,
            order: formData.order,
            isPublished: formData.isPublished,
          },
        });
        toast.success('Tutorial actualizado');
      } else {
        await createTutorial.mutateAsync({
          ownerType: 'GLOBAL',
          title: formData.title,
          summary: formData.summary,
          videoUrl: formData.youtubeUrl,
          order: formData.order,
          isPublished: formData.isPublished,
        });
        toast.success('Tutorial creado');
      }
      setDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error saving tutorial:', error);
      toast.error('Error al guardar tutorial');
    }
  };

  const handleDelete = async () => {
    if (!tutorialToDelete) return;

    try {
      await deleteTutorial.mutateAsync(tutorialToDelete.id);
      toast.success('Tutorial eliminado');
      setDeleteDialogOpen(false);
      setTutorialToDelete(null);
    } catch (error) {
      console.error('Error deleting tutorial:', error);
      toast.error('Error al eliminar tutorial');
    }
  };

  const togglePublished = async (tutorial: Tutorial) => {
    try {
      await updateTutorial.mutateAsync({
        id: tutorial.id,
        data: { isPublished: !tutorial.isPublished },
      });
      toast.success(tutorial.isPublished ? 'Tutorial despublicado' : 'Tutorial publicado');
    } catch (error) {
      console.error('Error toggling published:', error);
      toast.error('Error al cambiar estado');
    }
  };

  // Sort tutorials by order, then by title
  const sortedTutorials = [...tutorials].sort((a, b) => {
    if (a.order !== b.order) return a.order - b.order;
    return a.title.localeCompare(b.title);
  });

  // Extract YouTube ID for thumbnail display
  const getYouTubeId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
      /^([a-zA-Z0-9_-]{11})$/
    ];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Tutoriales</h1>
          <p className="text-muted-foreground">
            Gestiona los videos tutoriales que se muestran en la landing
          </p>
        </div>
        <Button onClick={openCreateDialog} className="gap-2">
          <Plus className="w-4 h-4" />
          Nuevo Tutorial
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Lista de Tutoriales</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : sortedTutorials.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Video className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No hay tutoriales creados</p>
              <p className="text-sm">Haz clic en "Nuevo Tutorial" para empezar</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Orden</TableHead>
                  <TableHead>Thumbnail</TableHead>
                  <TableHead>Título</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedTutorials.map((tutorial) => {
                  const ytId = tutorial.videoUrl ? getYouTubeId(tutorial.videoUrl) : null;
                  const thumbnail = ytId ? `https://i.ytimg.com/vi/${ytId}/mqdefault.jpg` : null;
                  
                  return (
                    <TableRow key={tutorial.id}>
                      <TableCell className="font-mono text-sm">
                        {tutorial.order}
                      </TableCell>
                      <TableCell>
                        {thumbnail ? (
                          <img 
                            src={thumbnail} 
                            alt={tutorial.title}
                            className="w-20 h-12 object-cover rounded"
                          />
                        ) : (
                          <div className="w-20 h-12 bg-muted rounded flex items-center justify-center">
                            <Video className="w-5 h-5 text-muted-foreground" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium line-clamp-1">{tutorial.title}</p>
                          {tutorial.summary && (
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {tutorial.summary}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          tutorial.ownerType === 'GLOBAL' 
                            ? 'bg-primary/10 text-primary' 
                            : 'bg-secondary text-secondary-foreground'
                        }`}>
                          {tutorial.ownerType === 'GLOBAL' ? 'Global' : 'Agente'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => togglePublished(tutorial)}
                          className="gap-1"
                        >
                          {tutorial.isPublished ? (
                            <>
                              <Eye className="w-4 h-4 text-green-500" />
                              <span className="text-green-500">Publicado</span>
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-4 h-4 text-muted-foreground" />
                              <span className="text-muted-foreground">Oculto</span>
                            </>
                          )}
                        </Button>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {tutorial.videoUrl && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => window.open(tutorial.videoUrl!, '_blank')}
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(tutorial)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setTutorialToDelete(tutorial);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingTutorial ? 'Editar Tutorial' : 'Nuevo Tutorial'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="youtubeUrl">Link de YouTube *</Label>
              <div className="flex gap-2">
                <Input
                  id="youtubeUrl"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={formData.youtubeUrl}
                  onChange={(e) => setFormData({ ...formData, youtubeUrl: e.target.value })}
                />
                <Button 
                  type="button" 
                  variant="secondary"
                  onClick={fetchYouTubeMetadata}
                  disabled={fetchingMetadata}
                >
                  {fetchingMetadata ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Obtener'
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Pega el link del video y haz clic en "Obtener" para auto-completar el título
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                placeholder="Cómo recargar en tu país"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="summary">Descripción (opcional)</Label>
              <Textarea
                id="summary"
                placeholder="Breve descripción del tutorial..."
                value={formData.summary}
                onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="order">Orden</Label>
                <Input
                  id="order"
                  type="number"
                  min="0"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Publicado</Label>
                <div className="flex items-center gap-2 pt-2">
                  <Switch
                    checked={formData.isPublished}
                    onCheckedChange={(checked) => setFormData({ ...formData, isPublished: checked })}
                  />
                  <span className="text-sm text-muted-foreground">
                    {formData.isPublished ? 'Visible' : 'Oculto'}
                  </span>
                </div>
              </div>
            </div>

            {formData.youtubeId && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground mb-2">Vista previa:</p>
                <img 
                  src={formData.thumbnailUrl} 
                  alt="Thumbnail" 
                  className="w-full max-w-xs rounded"
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={createTutorial.isPending || updateTutorial.isPending}
            >
              {(createTutorial.isPending || updateTutorial.isPending) && (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              )}
              {editingTutorial ? 'Guardar Cambios' : 'Crear Tutorial'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar tutorial?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El tutorial "{tutorialToDelete?.title}" será eliminado permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminTutorials;
