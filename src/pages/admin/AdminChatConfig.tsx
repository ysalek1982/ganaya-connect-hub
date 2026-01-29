import { useState, useEffect } from 'react';
import { auth } from '@/lib/firebase';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Plus, Save, Trash2, GripVertical, ChevronDown, ChevronUp, Copy, Power, Settings2 } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';

type BootstrapAdminAction =
  | 'chat_configs_list'
  | 'chat_configs_upsert'
  | 'chat_configs_delete'
  | 'chat_configs_activate';

const invokeBootstrapAdmin = async <T,>(payload: Record<string, unknown>): Promise<T> => {
  const { data, error } = await supabase.functions.invoke('bootstrap-admin', { body: payload });
  if (error) throw new Error(error.message);
  if ((data as any)?.error) throw new Error((data as any).error);
  return data as T;
};

interface QuestionOption {
  value: string;
  label: string;
  points: number;
}

interface ScoringRule {
  condition: string; // e.g., ">=300", "true", "=="
  value?: string | number | boolean;
  points: number;
}

interface ChatQuestion {
  id: string;
  label: string;
  prompt: string;
  type: 'text' | 'select' | 'boolean' | 'number';
  required: boolean;
  options?: QuestionOption[];
  scoring?: { rules: ScoringRule[] };
  storeKey?: string;
  order: number;
}

interface ChatConfig {
  id: string;
  name: string;
  isActive: boolean;
  version: number;
  thresholds: {
    prometedorMin: number;
    potencialMin: number;
  };
  closing: {
    successTitle: string;
    successMessage: string;
    nextSteps: string;
    ctaWhatsAppLabel: string;
  };
  questions: ChatQuestion[];
  createdAt?: Date;
  updatedAt?: Date;
}

// Default template for new config
const defaultConfig: Omit<ChatConfig, 'id'> = {
  name: 'Recruit Agents v1',
  isActive: false,
  version: 1,
  thresholds: {
    prometedorMin: 70,
    potencialMin: 40,
  },
  closing: {
    successTitle: '¡Gracias por tu interés!',
    successMessage: 'Hemos recibido tu postulación. Un reclutador te contactará pronto.',
    nextSteps: 'Prepara tu capital inicial de $300 USD y documentos de identidad.',
    ctaWhatsAppLabel: 'Contactar por WhatsApp',
  },
  questions: [
    {
      id: 'name',
      label: 'Nombre',
      prompt: '¿Cuál es tu nombre completo?',
      type: 'text',
      required: true,
      storeKey: 'name',
      order: 1,
    },
    {
      id: 'whatsapp',
      label: 'WhatsApp',
      prompt: '¿Cuál es tu número de WhatsApp con código de país?',
      type: 'text',
      required: true,
      storeKey: 'whatsapp',
      order: 2,
    },
    {
      id: 'country',
      label: 'País',
      prompt: '¿En qué país te encuentras?',
      type: 'select',
      required: true,
      storeKey: 'country',
      options: [
        { value: 'Paraguay', label: 'Paraguay', points: 0 },
        { value: 'Argentina', label: 'Argentina', points: 0 },
        { value: 'Colombia', label: 'Colombia', points: 0 },
        { value: 'Ecuador', label: 'Ecuador', points: 0 },
        { value: 'Otro', label: 'Otro país', points: 0 },
      ],
      order: 3,
    },
    {
      id: 'age18',
      label: 'Mayor de edad',
      prompt: '¿Eres mayor de 18 años?',
      type: 'boolean',
      required: true,
      storeKey: 'age18',
      scoring: {
        rules: [{ condition: '==', value: true, points: 0 }],
      },
      order: 4,
    },
    {
      id: 'working_capital',
      label: 'Capital operativo',
      prompt: '¿Con cuánto capital inicial (USD) podrías comenzar a operar?',
      type: 'select',
      required: true,
      storeKey: 'working_capital_usd',
      options: [
        { value: '500+', label: '$500 o más', points: 30 },
        { value: '300-500', label: '$300 - $500', points: 25 },
        { value: '150-300', label: '$150 - $300', points: 15 },
        { value: '0-150', label: 'Menos de $150', points: 0 },
      ],
      order: 5,
    },
    {
      id: 'hours_per_day',
      label: 'Horas disponibles',
      prompt: '¿Cuántas horas al día podrías dedicar?',
      type: 'select',
      required: true,
      storeKey: 'hours_per_day',
      options: [
        { value: '6+', label: '6 o más horas', points: 20 },
        { value: '4-6', label: '4-6 horas', points: 15 },
        { value: '2-4', label: '2-4 horas', points: 10 },
        { value: '0-2', label: 'Menos de 2 horas', points: 5 },
      ],
      order: 6,
    },
    {
      id: 'has_local_payment',
      label: 'Métodos de pago locales',
      prompt: '¿Tienes acceso a métodos de pago/cobro locales (transferencias, billeteras móviles)?',
      type: 'boolean',
      required: true,
      storeKey: 'has_local_payment_methods',
      scoring: {
        rules: [{ condition: '==', value: true, points: 15 }],
      },
      order: 7,
    },
    {
      id: 'sales_experience',
      label: 'Experiencia en ventas',
      prompt: '¿Tienes experiencia en ventas o atención al cliente?',
      type: 'boolean',
      required: false,
      storeKey: 'has_sales_experience',
      scoring: {
        rules: [{ condition: '==', value: true, points: 10 }],
      },
      order: 8,
    },
    {
      id: 'wants_to_start',
      label: 'Inicio inmediato',
      prompt: '¿Estás listo para comenzar esta semana?',
      type: 'boolean',
      required: true,
      storeKey: 'wants_to_start_now',
      scoring: {
        rules: [{ condition: '==', value: true, points: 10 }],
      },
      order: 9,
    },
  ],
};

// Sortable Question Item
const SortableQuestionItem = ({
  question,
  onUpdate,
  onDelete,
}: {
  question: ChatQuestion;
  onUpdate: (q: ChatQuestion) => void;
  onDelete: (id: string) => void;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: question.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const updateOption = (index: number, field: keyof QuestionOption, value: string | number) => {
    if (!question.options) return;
    const newOptions = [...question.options];
    newOptions[index] = { ...newOptions[index], [field]: value };
    onUpdate({ ...question, options: newOptions });
  };

  const addOption = () => {
    const newOptions = [...(question.options || []), { value: '', label: '', points: 0 }];
    onUpdate({ ...question, options: newOptions });
  };

  const removeOption = (index: number) => {
    if (!question.options) return;
    const newOptions = question.options.filter((_, i) => i !== index);
    onUpdate({ ...question, options: newOptions });
  };

  return (
    <Card ref={setNodeRef} style={style} className="mb-3">
      <CardContent className="pt-4">
        <div className="flex items-start gap-3">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded mt-1"
          >
            <GripVertical className="w-5 h-5 text-muted-foreground" />
          </div>
          
          <div className="flex-1 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant={question.required ? 'default' : 'secondary'}>
                  {question.required ? 'Requerido' : 'Opcional'}
                </Badge>
                <Badge variant="outline">{question.type}</Badge>
                <span className="font-medium">{question.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(!isExpanded)}
                >
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(question.id)}
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            </div>

            {isExpanded && (
              <div className="space-y-4 pt-3 border-t">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>ID (único)</Label>
                    <Input
                      value={question.id}
                      onChange={(e) => onUpdate({ ...question, id: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Label</Label>
                    <Input
                      value={question.label}
                      onChange={(e) => onUpdate({ ...question, label: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Prompt (lo que pregunta el chat)</Label>
                  <Textarea
                    value={question.prompt}
                    onChange={(e) => onUpdate({ ...question, prompt: e.target.value })}
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Tipo</Label>
                    <Select
                      value={question.type}
                      onValueChange={(value: ChatQuestion['type']) => onUpdate({ ...question, type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">Texto</SelectItem>
                        <SelectItem value="select">Opciones</SelectItem>
                        <SelectItem value="boolean">Sí/No</SelectItem>
                        <SelectItem value="number">Número</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Store Key</Label>
                    <Input
                      value={question.storeKey || ''}
                      onChange={(e) => onUpdate({ ...question, storeKey: e.target.value })}
                      placeholder="ej: working_capital"
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-6">
                    <Switch
                      checked={question.required}
                      onCheckedChange={(checked) => onUpdate({ ...question, required: checked })}
                    />
                    <Label>Requerido</Label>
                  </div>
                </div>

                {question.type === 'select' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Opciones</Label>
                      <Button variant="outline" size="sm" onClick={addOption}>
                        <Plus className="w-4 h-4 mr-1" /> Agregar opción
                      </Button>
                    </div>
                    {question.options?.map((opt, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <Input
                          value={opt.value}
                          onChange={(e) => updateOption(i, 'value', e.target.value)}
                          placeholder="Valor"
                          className="flex-1"
                        />
                        <Input
                          value={opt.label}
                          onChange={(e) => updateOption(i, 'label', e.target.value)}
                          placeholder="Label"
                          className="flex-1"
                        />
                        <Input
                          type="number"
                          value={opt.points}
                          onChange={(e) => updateOption(i, 'points', parseInt(e.target.value) || 0)}
                          placeholder="Pts"
                          className="w-20"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeOption(i)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {question.type === 'boolean' && (
                  <div className="space-y-2">
                    <Label>Puntos si responde "Sí"</Label>
                    <Input
                      type="number"
                      value={question.scoring?.rules?.[0]?.points || 0}
                      onChange={(e) => onUpdate({
                        ...question,
                        scoring: {
                          rules: [{ condition: '==', value: true, points: parseInt(e.target.value) || 0 }]
                        }
                      })}
                      className="w-32"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const AdminChatConfig = () => {
  const [configs, setConfigs] = useState<ChatConfig[]>([]);
  const [selectedConfig, setSelectedConfig] = useState<ChatConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const getIdToken = async (): Promise<string> => {
    const user = auth.currentUser;
    if (!user) throw new Error('Debes iniciar sesión');
    return await user.getIdToken(true);
  };

  // Load configs via backend (avoids Firestore client permission issues)
  const loadConfigs = async () => {
    try {
      const idToken = await getIdToken();
      const res = await invokeBootstrapAdmin<{ success: boolean; configs: any[] }>({
        action: 'chat_configs_list' satisfies BootstrapAdminAction,
        idToken,
      });

      const loadedConfigs: ChatConfig[] = (res.configs || []).map((data: any) => ({
        id: data.id,
        name: data.name || 'Sin nombre',
        isActive: !!data.isActive,
        version: data.version || 1,
        thresholds: data.thresholds || { prometedorMin: 70, potencialMin: 40 },
        closing: data.closing || defaultConfig.closing,
        questions: (data.questions || []).sort((a: ChatQuestion, b: ChatQuestion) => a.order - b.order),
        createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
        updatedAt: data.updatedAt ? new Date(data.updatedAt) : new Date(),
      }));

      setConfigs(loadedConfigs);
      
      // Auto-select active config or first one
      const active = loadedConfigs.find(c => c.isActive);
      if (active) {
        setSelectedConfig(active);
      } else if (loadedConfigs.length > 0) {
        setSelectedConfig(loadedConfigs[0]);
      }
    } catch (error) {
      console.error('Error loading configs:', error);
      const msg = error instanceof Error ? error.message : 'Error al cargar configuraciones';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConfigs();
  }, []);

  const handleSave = async () => {
    if (!selectedConfig) return;
    
    setSaving(true);
    try {
      const idToken = await getIdToken();
      const configToSave: ChatConfig = {
        ...selectedConfig,
        questions: selectedConfig.questions.map((q, i) => ({ ...q, order: i + 1 })),
        updatedAt: new Date(),
      };

      await invokeBootstrapAdmin<{ success: boolean }>({
        action: 'chat_configs_upsert' satisfies BootstrapAdminAction,
        idToken,
        config: configToSave,
      });
      
      toast.success('Configuración guardada');
      loadConfigs();
    } catch (error) {
      console.error('Error saving config:', error);
      const msg = error instanceof Error ? error.message : 'Error al guardar';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleActivate = async (configId: string) => {
    try {
      const idToken = await getIdToken();
      await invokeBootstrapAdmin<{ success: boolean }>({
        action: 'chat_configs_activate' satisfies BootstrapAdminAction,
        idToken,
        id: configId,
      });
      toast.success('Configuración activada');
      loadConfigs();
    } catch (error) {
      console.error('Error activating config:', error);
      const msg = error instanceof Error ? error.message : 'Error al activar';
      toast.error(msg);
    }
  };

  const handleCreateNew = async () => {
    const newId = `config_${Date.now()}`;
    const newConfig: ChatConfig = {
      ...defaultConfig,
      id: newId,
      name: `Nueva configuración ${configs.length + 1}`,
      isActive: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    try {
      const idToken = await getIdToken();
      await invokeBootstrapAdmin<{ success: boolean }>({
        action: 'chat_configs_upsert' satisfies BootstrapAdminAction,
        idToken,
        config: newConfig,
      });
      toast.success('Configuración creada');
      loadConfigs();
    } catch (error) {
      console.error('Error creating config:', error);
      const msg = error instanceof Error ? error.message : 'Error al crear';
      toast.error(msg);
    }
  };

  const handleDuplicate = async () => {
    if (!selectedConfig) return;
    
    const newId = `config_${Date.now()}`;
    const newConfig: ChatConfig = {
      ...selectedConfig,
      id: newId,
      name: `${selectedConfig.name} (copia)`,
      isActive: false,
    };
    
    try {
      const idToken = await getIdToken();
      await invokeBootstrapAdmin<{ success: boolean }>({
        action: 'chat_configs_upsert' satisfies BootstrapAdminAction,
        idToken,
        config: { ...newConfig, createdAt: new Date(), updatedAt: new Date() },
      });
      toast.success('Configuración duplicada');
      loadConfigs();
    } catch (error) {
      console.error('Error duplicating config:', error);
      const msg = error instanceof Error ? error.message : 'Error al duplicar';
      toast.error(msg);
    }
  };

  const handleDelete = async (configId: string) => {
    if (!confirm('¿Eliminar esta configuración?')) return;
    
    try {
      const idToken = await getIdToken();
      await invokeBootstrapAdmin<{ success: boolean }>({
        action: 'chat_configs_delete' satisfies BootstrapAdminAction,
        idToken,
        id: configId,
      });
      toast.success('Configuración eliminada');
      if (selectedConfig?.id === configId) {
        setSelectedConfig(null);
      }
      loadConfigs();
    } catch (error) {
      console.error('Error deleting config:', error);
      const msg = error instanceof Error ? error.message : 'Error al eliminar';
      toast.error(msg);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!selectedConfig || !over || active.id === over.id) return;

    const oldIndex = selectedConfig.questions.findIndex(q => q.id === active.id);
    const newIndex = selectedConfig.questions.findIndex(q => q.id === over.id);
    
    const newQuestions = arrayMove(selectedConfig.questions, oldIndex, newIndex);
    setSelectedConfig({ ...selectedConfig, questions: newQuestions });
  };

  const updateQuestion = (updated: ChatQuestion) => {
    if (!selectedConfig) return;
    const newQuestions = selectedConfig.questions.map(q => 
      q.id === updated.id ? updated : q
    );
    setSelectedConfig({ ...selectedConfig, questions: newQuestions });
  };

  const deleteQuestion = (id: string) => {
    if (!selectedConfig) return;
    const newQuestions = selectedConfig.questions.filter(q => q.id !== id);
    setSelectedConfig({ ...selectedConfig, questions: newQuestions });
  };

  const addQuestion = () => {
    if (!selectedConfig) return;
    const newQuestion: ChatQuestion = {
      id: `q_${Date.now()}`,
      label: 'Nueva pregunta',
      prompt: '¿...?',
      type: 'text',
      required: false,
      order: selectedConfig.questions.length + 1,
    };
    setSelectedConfig({
      ...selectedConfig,
      questions: [...selectedConfig.questions, newQuestion],
    });
  };

  if (loading) {
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
          <h1 className="font-display text-2xl md:text-3xl font-bold">Configuración del Chat</h1>
          <p className="text-muted-foreground">
            Define las preguntas, puntuación y umbrales del chat de reclutamiento
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleCreateNew}>
            <Plus className="w-4 h-4 mr-2" />
            Nueva Config
          </Button>
          {selectedConfig && (
            <Button variant="hero" onClick={handleSave} disabled={saving}>
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Guardando...' : 'Guardar'}
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Config list sidebar */}
        <div className="space-y-3">
          <Label>Configuraciones</Label>
          {configs.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No hay configuraciones. Crea una nueva.
            </p>
          ) : (
            configs.map(config => (
              <Card
                key={config.id}
                className={`cursor-pointer transition-colors ${
                  selectedConfig?.id === config.id ? 'border-primary' : ''
                }`}
                onClick={() => setSelectedConfig(config)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        {config.name}
                        {config.isActive && (
                          <Badge variant="default" className="text-xs">Activa</Badge>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        v{config.version} • {config.questions.length} preguntas
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(config.id);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Main editor */}
        <div className="lg:col-span-3 space-y-6">
          {selectedConfig ? (
            <>
              {/* Config header */}
              <Card>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Nombre</Label>
                      <Input
                        value={selectedConfig.name}
                        onChange={(e) => setSelectedConfig({ ...selectedConfig, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Versión</Label>
                      <Input
                        type="number"
                        value={selectedConfig.version}
                        onChange={(e) => setSelectedConfig({ ...selectedConfig, version: parseInt(e.target.value) || 1 })}
                      />
                    </div>
                    <div className="flex items-end gap-2">
                      <Button
                        variant={selectedConfig.isActive ? 'default' : 'outline'}
                        onClick={() => handleActivate(selectedConfig.id)}
                        disabled={selectedConfig.isActive}
                      >
                        <Power className="w-4 h-4 mr-2" />
                        {selectedConfig.isActive ? 'Activa' : 'Activar'}
                      </Button>
                      <Button variant="outline" onClick={handleDuplicate}>
                        <Copy className="w-4 h-4 mr-2" />
                        Duplicar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Thresholds */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Settings2 className="w-5 h-5" />
                    Umbrales de Scoring
                  </CardTitle>
                  <CardDescription>
                    Define los puntos mínimos para cada tier
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>PROMETEDOR (mínimo)</Label>
                      <Input
                        type="number"
                        value={selectedConfig.thresholds.prometedorMin}
                        onChange={(e) => setSelectedConfig({
                          ...selectedConfig,
                          thresholds: {
                            ...selectedConfig.thresholds,
                            prometedorMin: parseInt(e.target.value) || 0,
                          },
                        })}
                      />
                      <p className="text-xs text-muted-foreground">
                        Score ≥ {selectedConfig.thresholds.prometedorMin} = PROMETEDOR
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label>POTENCIAL (mínimo)</Label>
                      <Input
                        type="number"
                        value={selectedConfig.thresholds.potencialMin}
                        onChange={(e) => setSelectedConfig({
                          ...selectedConfig,
                          thresholds: {
                            ...selectedConfig.thresholds,
                            potencialMin: parseInt(e.target.value) || 0,
                          },
                        })}
                      />
                      <p className="text-xs text-muted-foreground">
                        Score ≥ {selectedConfig.thresholds.potencialMin} = POTENCIAL, menor = NOVATO
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Closing messages */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Mensajes de Cierre</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Título de éxito</Label>
                      <Input
                        value={selectedConfig.closing.successTitle}
                        onChange={(e) => setSelectedConfig({
                          ...selectedConfig,
                          closing: { ...selectedConfig.closing, successTitle: e.target.value },
                        })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Label botón WhatsApp</Label>
                      <Input
                        value={selectedConfig.closing.ctaWhatsAppLabel}
                        onChange={(e) => setSelectedConfig({
                          ...selectedConfig,
                          closing: { ...selectedConfig.closing, ctaWhatsAppLabel: e.target.value },
                        })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Mensaje de éxito</Label>
                    <Textarea
                      value={selectedConfig.closing.successMessage}
                      onChange={(e) => setSelectedConfig({
                        ...selectedConfig,
                        closing: { ...selectedConfig.closing, successMessage: e.target.value },
                      })}
                      rows={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Próximos pasos</Label>
                    <Textarea
                      value={selectedConfig.closing.nextSteps}
                      onChange={(e) => setSelectedConfig({
                        ...selectedConfig,
                        closing: { ...selectedConfig.closing, nextSteps: e.target.value },
                      })}
                      rows={2}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Questions */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">Preguntas</CardTitle>
                      <CardDescription>
                        Arrastra para reordenar. Expande cada pregunta para editar.
                      </CardDescription>
                    </div>
                    <Button onClick={addQuestion}>
                      <Plus className="w-4 h-4 mr-2" />
                      Agregar pregunta
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={selectedConfig.questions.map(q => q.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      {selectedConfig.questions.map(question => (
                        <SortableQuestionItem
                          key={question.id}
                          question={question}
                          onUpdate={updateQuestion}
                          onDelete={deleteQuestion}
                        />
                      ))}
                    </SortableContext>
                  </DndContext>
                  
                  {selectedConfig.questions.length === 0 && (
                    <p className="text-muted-foreground text-center py-8">
                      No hay preguntas. Agrega una para comenzar.
                    </p>
                  )}
                </CardContent>
              </Card>
            </>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              Selecciona una configuración o crea una nueva
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminChatConfig;
