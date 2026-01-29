import { useState } from 'react';
import { Plus, Edit2, Trash2, Eye, EyeOff, Video, FileText, Loader2, GripVertical } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth';
import { useAgentTutorials, useCreateTutorial, useUpdateTutorial, useDeleteTutorial } from '@/hooks/useTutorials';
import { toast } from 'sonner';
import type { Tutorial } from '@/lib/firebase-types';

const AppTutorials = () => {
  const { userData } = useFirebaseAuth();
  const { data: tutorials, isLoading } = useAgentTutorials(userData?.uid || null);
  const createTutorial = useCreateTutorial();
  const updateTutorial = useUpdateTutorial();
  const deleteTutorial = useDeleteTutorial();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTutorial, setEditingTutorial] = useState<Tutorial | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    contentMarkdown: '',
    videoUrl: '',
    isPublished: false,
    order: 0,
  });

  const resetForm = () => {
    setFormData({
      title: '',
      summary: '',
      contentMarkdown: '',
      videoUrl: '',
      isPublished: false,
      order: 0,
    });
  };

  const handleCreate = async () => {
    if (!userData?.uid || !formData.title.trim()) {
      toast.error('El título es requerido');
      return;
    }

    try {
      await createTutorial.mutateAsync({
        ownerType: 'AGENT',
        ownerUid: userData.uid,
        title: formData.title.trim(),
        summary: formData.summary.trim(),
        contentMarkdown: formData.contentMarkdown,
        videoUrl: formData.videoUrl || null,
        isPublished: formData.isPublished,
        order: formData.order,
      });
      toast.success('Tutorial creado');
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error('Error al crear');
    }
  };

  const handleUpdate = async () => {
    if (!editingTutorial) return;

    try {
      await updateTutorial.mutateAsync({
        id: editingTutorial.id,
        data: {
          title: formData.title.trim(),
          summary: formData.summary.trim(),
          contentMarkdown: formData.contentMarkdown,
          videoUrl: formData.videoUrl || null,
          isPublished: formData.isPublished,
          order: formData.order,
        },
      });
      toast.success('Tutorial actualizado');
      setEditingTutorial(null);
      resetForm();
    } catch (error) {
      toast.error('Error al actualizar');
    }
  };

  const handleDelete = async (tutorial: Tutorial) => {
    if (!confirm(`¿Eliminar "${tutorial.title}"?`)) return;

    try {
      await deleteTutorial.mutateAsync(tutorial.id);
      toast.success('Tutorial eliminado');
    } catch (error) {
      toast.error('Error al eliminar');
    }
  };

  const togglePublish = async (tutorial: Tutorial) => {
    try {
      await updateTutorial.mutateAsync({
        id: tutorial.id,
        data: { isPublished: !tutorial.isPublished },
      });
      toast.success(tutorial.isPublished ? 'Tutorial ocultado' : 'Tutorial publicado');
    } catch (error) {
      toast.error('Error al cambiar estado');
    }
  };

  const startEdit = (tutorial: Tutorial) => {
    setFormData({
      title: tutorial.title,
      summary: tutorial.summary,
      contentMarkdown: tutorial.contentMarkdown,
      videoUrl: tutorial.videoUrl || '',
      isPublished: tutorial.isPublished,
      order: tutorial.order,
    });
    setEditingTutorial(tutorial);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold">Mis Tutoriales</h1>
          <p className="text-muted-foreground">Crea guías para tus referidos</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Crear Tutorial
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : tutorials?.length === 0 ? (
        <Card className="glass-card">
          <CardContent className="py-12 text-center">
            <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">
              No tienes tutoriales aún. Crea guías de recarga, retiro o uso de la plataforma.
            </p>
            <Button onClick={() => setIsDialogOpen(true)} variant="outline" className="gap-2">
              <Plus className="w-4 h-4" />
              Crear primer tutorial
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {tutorials?.map((tutorial) => (
            <Card key={tutorial.id} className={`glass-card ${!tutorial.isPublished ? 'opacity-70' : ''}`}>
              <CardContent className="py-4">
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                    {tutorial.videoUrl ? (
                      <Video className="w-5 h-5 text-primary" />
                    ) : (
                      <FileText className="w-5 h-5 text-primary" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold truncate">{tutorial.title}</h3>
                      <Badge variant={tutorial.isPublished ? 'default' : 'secondary'}>
                        {tutorial.isPublished ? 'Publicado' : 'Borrador'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {tutorial.summary || 'Sin descripción'}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => togglePublish(tutorial)}
                      title={tutorial.isPublished ? 'Ocultar' : 'Publicar'}
                    >
                      {tutorial.isPublished ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => startEdit(tutorial)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(tutorial)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog 
        open={isDialogOpen || !!editingTutorial} 
        onOpenChange={(open) => {
          if (!open) {
            setIsDialogOpen(false);
            setEditingTutorial(null);
            resetForm();
          }
        }}
      >
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingTutorial ? 'Editar Tutorial' : 'Crear Tutorial'}</DialogTitle>
            <DialogDescription>
              Los tutoriales publicados se muestran a quienes usen tu link de referido
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Título *</Label>
              <Input 
                placeholder="Ej: Cómo recargar con USDT"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Resumen</Label>
              <Textarea 
                placeholder="Breve descripción del tutorial..."
                value={formData.summary}
                onChange={(e) => setFormData(prev => ({ ...prev, summary: e.target.value }))}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label>Contenido (Markdown)</Label>
              <Textarea 
                placeholder="# Paso 1&#10;Abre Binance y ve a P2P..."
                value={formData.contentMarkdown}
                onChange={(e) => setFormData(prev => ({ ...prev, contentMarkdown: e.target.value }))}
                rows={8}
                className="font-mono text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Video className="w-4 h-4" />
                URL de video (opcional)
              </Label>
              <Input 
                placeholder="https://youtube.com/watch?v=..."
                value={formData.videoUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, videoUrl: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Orden</Label>
              <Input 
                type="number"
                min={0}
                value={formData.order}
                onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
              />
              <p className="text-xs text-muted-foreground">
                Menor número = aparece primero
              </p>
            </div>

            <div className="flex items-center justify-between">
              <Label>Publicar ahora</Label>
              <Switch 
                checked={formData.isPublished}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isPublished: checked }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsDialogOpen(false);
              setEditingTutorial(null);
              resetForm();
            }}>
              Cancelar
            </Button>
            <Button 
              onClick={editingTutorial ? handleUpdate : handleCreate}
              disabled={createTutorial.isPending || updateTutorial.isPending}
            >
              {editingTutorial ? 'Guardar' : 'Crear'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AppTutorials;
