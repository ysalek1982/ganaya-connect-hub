import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { auth } from '@/lib/firebase';
import { Save, TestTube, Eye, EyeOff, Globe, AlertTriangle, Trash2, MessageCircle, RotateCcw, Loader2 } from 'lucide-react';
import { WhatsAppTemplates } from '@/components/admin/WhatsAppTemplates';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
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

interface AISettings {
  gemini_api_key: string | null;
}

interface GeneralSettings {
  whatsapp_default: string | null;
  fallback_mode: boolean | null;
  enabled_countries: string[] | null;
}

const allCountries = [
  'Paraguay', 'Argentina', 'Colombia', 'Ecuador', 'Chile', 'México', 'USA', 'Uruguay', 'Venezuela'
];

// Helper to call bootstrap-admin with admin actions
const invokeBootstrapAdmin = async <T,>(payload: Record<string, unknown>): Promise<T> => {
  const { data, error } = await supabase.functions.invoke('bootstrap-admin', { body: payload });
  if (error) throw new Error(error.message);
  if ((data as any)?.error) throw new Error((data as any).error);
  return data as T;
};

// Danger Zone component
const DangerZone = ({ 
  getIdToken, 
  saveAiMutation, 
  setAiForm 
}: { 
  getIdToken: () => Promise<string>;
  saveAiMutation: { mutate: () => void; isPending: boolean };
  setAiForm: (v: AISettings) => void;
}) => {
  const [resetConfirm, setResetConfirm] = useState('');
  const [resetOpen, setResetOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [resetResult, setResetResult] = useState<Record<string, number> | null>(null);

  const handleFullReset = async () => {
    if (resetConfirm !== 'BORRAR') return;
    
    setIsResetting(true);
    setResetResult(null);
    
    try {
      const idToken = await getIdToken();
      const res = await invokeBootstrapAdmin<{ success: boolean; deleted: Record<string, number> }>({
        action: 'full_reset',
        idToken,
      });
      
      setResetResult(res.deleted);
      toast.success('Reset completo ejecutado');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error en el reset');
    } finally {
      setIsResetting(false);
      setResetConfirm('');
    }
  };

  return (
    <div className="glass-card rounded-xl p-6 border-destructive/50">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
          <AlertTriangle className="w-5 h-5 text-destructive" />
        </div>
        <div>
          <h2 className="font-semibold text-lg text-destructive">Zona de Peligro</h2>
          <p className="text-sm text-muted-foreground">Acciones irreversibles</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Clear API Key */}
        <div className="p-4 rounded-lg bg-destructive/5 border border-destructive/20">
          <h3 className="font-medium mb-2">Limpiar API Key</h3>
          <p className="text-sm text-muted-foreground mb-3">
            Elimina la API Key de Gemini guardada. El sistema usará Lovable AI Gateway automáticamente.
          </p>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash2 className="w-4 h-4 mr-2" />
                Eliminar API Key
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>¿Eliminar API Key?</DialogTitle>
                <DialogDescription>
                  El sistema usará Lovable AI Gateway como fallback automático.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancelar</Button>
                </DialogClose>
                <Button
                  variant="destructive"
                  onClick={() => {
                    setAiForm({ gemini_api_key: '' });
                    saveAiMutation.mutate();
                  }}
                >
                  Eliminar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Full Reset */}
        <div className="p-4 rounded-lg bg-destructive/10 border-2 border-destructive/40">
          <h3 className="font-medium mb-2 text-destructive flex items-center gap-2">
            <RotateCcw className="w-4 h-4" />
            Reset Total — Empezar de Cero
          </h3>
          <p className="text-sm text-muted-foreground mb-2">
            Esta acción <strong>elimina permanentemente</strong>:
          </p>
          <ul className="text-sm text-muted-foreground list-disc list-inside mb-4 space-y-1">
            <li>Todos los <strong>leads</strong> y postulaciones</li>
            <li>Todos los <strong>chat logs</strong> de conversaciones IA</li>
            <li>Todos los <strong>códigos de referido</strong> (refCodes)</li>
            <li>Todos los <strong>links de campaña</strong> (referralLinks)</li>
            <li>Todos los <strong>agentes y subagentes</strong> (usuarios no-admin)</li>
          </ul>
          <p className="text-sm font-medium text-destructive mb-4">
            ⚠️ Tu cuenta de administrador se mantiene intacta. Solo se eliminan los datos operativos.
          </p>
          
          <Dialog open={resetOpen} onOpenChange={(open) => { setResetOpen(open); if (!open) { setResetConfirm(''); setResetResult(null); } }}>
            <DialogTrigger asChild>
              <Button variant="destructive" size="sm" className="gap-2">
                <RotateCcw className="w-4 h-4" />
                Resetear Todo
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="text-destructive">⚠️ Confirmar Reset Total</DialogTitle>
                <DialogDescription>
                  Esta acción es <strong>irreversible</strong>. Se eliminarán todos los leads, agentes, chat logs, códigos de referido y links de campaña.
                </DialogDescription>
              </DialogHeader>

              {resetResult ? (
                <div className="py-4 space-y-3">
                  <p className="font-medium text-primary">✅ Reset completado:</p>
                  <div className="space-y-1.5">
                    {Object.entries(resetResult).map(([key, count]) => (
                      <div key={key} className="flex justify-between text-sm">
                        <span className="text-muted-foreground capitalize">{key}</span>
                        <span className="font-mono font-bold">{count} eliminados</span>
                      </div>
                    ))}
                  </div>
                  <DialogClose asChild>
                    <Button className="w-full mt-4">Cerrar</Button>
                  </DialogClose>
                </div>
              ) : (
                <>
                  <div className="py-4 space-y-3">
                    <Label>Escribe <code className="text-destructive font-bold">BORRAR</code> para confirmar:</Label>
                    <Input
                      value={resetConfirm}
                      onChange={(e) => setResetConfirm(e.target.value)}
                      placeholder="Escribe BORRAR"
                      className={resetConfirm === 'BORRAR' ? 'border-destructive' : ''}
                      disabled={isResetting}
                    />
                  </div>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline" disabled={isResetting}>Cancelar</Button>
                    </DialogClose>
                    <Button
                      variant="destructive"
                      onClick={handleFullReset}
                      disabled={resetConfirm !== 'BORRAR' || isResetting}
                      className="gap-2"
                    >
                      {isResetting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Eliminando...
                        </>
                      ) : (
                        <>
                          <RotateCcw className="w-4 h-4" />
                          Confirmar Reset Total
                        </>
                      )}
                    </Button>
                  </DialogFooter>
                </>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
};

const AdminSettingsNew = () => {
  const queryClient = useQueryClient();
  const [showApiKey, setShowApiKey] = useState(false);

  const [aiForm, setAiForm] = useState<AISettings>({
    gemini_api_key: '',
  });

  const [generalForm, setGeneralForm] = useState<GeneralSettings>({
    whatsapp_default: '',
    fallback_mode: true,
    enabled_countries: allCountries.slice(0, 9),
  });

  const getIdToken = async (): Promise<string> => {
    const user = auth.currentUser;
    if (!user) throw new Error('Debes iniciar sesión');
    return await user.getIdToken(true);
  };

  // Load AI settings from Firestore via bootstrap-admin
  const { data: aiSettings, isLoading: aiLoading } = useQuery({
    queryKey: ['ai-settings'],
    queryFn: async () => {
      const idToken = await getIdToken();
      const res = await invokeBootstrapAdmin<{ success: boolean; settings: AISettings }>({
        action: 'settings_get',
        idToken,
      });
      return res.settings;
    },
  });

  // Load general settings from Supabase (non-sensitive)
  const { data: generalSettings, isLoading: generalLoading } = useQuery({
    queryKey: ['general-settings'],
    queryFn: async () => {
      const { data, error } = await supabase.from('settings').select('*').limit(1).single();
      if (error && error.code !== 'PGRST116') throw error;
      return data as unknown as GeneralSettings | null;
    },
  });

  useEffect(() => {
    if (aiSettings) {
      setAiForm({
        gemini_api_key: aiSettings.gemini_api_key || '',
      });
    }
  }, [aiSettings]);

  useEffect(() => {
    if (generalSettings) {
      setGeneralForm({
        whatsapp_default: generalSettings.whatsapp_default || '',
        fallback_mode: generalSettings.fallback_mode ?? true,
        enabled_countries: generalSettings.enabled_countries || allCountries.slice(0, 9),
      });
    }
  }, [generalSettings]);

  // Save AI settings to Firestore
  const saveAiMutation = useMutation({
    mutationFn: async () => {
      const idToken = await getIdToken();
      await invokeBootstrapAdmin({
        action: 'settings_upsert',
        idToken,
        settings: {
          gemini_api_key: aiForm.gemini_api_key || null,
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-settings'] });
      toast.success('Configuración de IA guardada');
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Error al guardar');
    },
  });

  // Save general settings to Supabase
  const saveGeneralMutation = useMutation({
    mutationFn: async () => {
      const payload = { ...generalForm } as Record<string, unknown>;
      const { data: existing } = await supabase.from('settings').select('id').limit(1).single();
      
      if (existing?.id) {
        const { error } = await supabase.from('settings').update(payload).eq('id', existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('settings').insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['general-settings'] });
      toast.success('Configuración general guardada');
    },
    onError: () => {
      toast.error('Error al guardar');
    },
  });

  const testGemini = async () => {
    if (!aiForm.gemini_api_key) {
      toast.info('Sin API key, se usará Lovable AI Gateway automáticamente');
      return;
    }
    
    toast.info('Probando conexión con Gemini...');
    
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${aiForm.gemini_api_key}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: 'Responde solo "OK"' }] }],
          }),
        }
      );
      
      if (response.ok) {
        toast.success('✅ Conexión exitosa con Gemini');
      } else {
        const error = await response.json();
        toast.error(`Error: ${error.error?.message || 'API Key inválida'}`);
      }
    } catch (err) {
      toast.error('Error de conexión');
    }
  };

  const toggleCountry = (country: string) => {
    const current = generalForm.enabled_countries || [];
    const updated = current.includes(country)
      ? current.filter(c => c !== country)
      : [...current, country];
    setGeneralForm({ ...generalForm, enabled_countries: updated });
  };

  const isLoading = aiLoading || generalLoading;

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-bold">Configuración</h1>
        <p className="text-muted-foreground">Ajustes del sistema</p>
      </div>

      <Tabs defaultValue="whatsapp" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="whatsapp">
            <MessageCircle className="w-4 h-4 mr-2" />
            WhatsApp
          </TabsTrigger>
          <TabsTrigger value="ai">
            <TestTube className="w-4 h-4 mr-2" />
            IA & Chat
          </TabsTrigger>
          <TabsTrigger value="countries">
            <Globe className="w-4 h-4 mr-2" />
            Países
          </TabsTrigger>
          <TabsTrigger value="danger">
            <AlertTriangle className="w-4 h-4 mr-2" />
            Peligro
          </TabsTrigger>
        </TabsList>

        {/* WhatsApp Templates */}
        <TabsContent value="whatsapp" className="space-y-6">
          <WhatsAppTemplates mode="edit" />
        </TabsContent>

        {/* AI Settings */}
        <TabsContent value="ai" className="space-y-6">
          <div className="glass-card rounded-xl p-6 space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <TestTube className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold text-lg">Gemini AI</h2>
                <p className="text-sm text-muted-foreground">Asistente IA para resúmenes y sugerencias</p>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 mb-4">
              <p className="text-sm text-primary">
                ✓ <strong>Lovable AI Gateway</strong> está activo como fallback automático cuando no hay API Key configurada.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-muted/50 border border-border mb-4">
              <p className="text-sm text-muted-foreground">
                🔒 La API Key se guarda de forma segura en el backend (Firestore) y nunca se expone al navegador del usuario final.
              </p>
            </div>

            <div className="space-y-2">
              <Label>API Key de Gemini (opcional)</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    type={showApiKey ? 'text' : 'password'}
                    value={aiForm.gemini_api_key || ''}
                    onChange={(e) => setAiForm({ ...aiForm, gemini_api_key: e.target.value })}
                    placeholder="AIza..."
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <Button variant="outline" onClick={testGemini}>
                  Probar
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-border">
              <div>
                <Label>Modo Fallback</Label>
                <p className="text-xs text-muted-foreground">Usar Lovable AI Gateway cuando falle Gemini</p>
              </div>
              <Switch
                checked={generalForm.fallback_mode ?? true}
                onCheckedChange={(checked) => setGeneralForm({ ...generalForm, fallback_mode: checked })}
              />
            </div>

            <Button 
              variant="hero" 
              onClick={() => saveAiMutation.mutate()}
              disabled={saveAiMutation.isPending}
              className="w-full"
            >
              <Save className="w-4 h-4 mr-2" />
              {saveAiMutation.isPending ? 'Guardando...' : 'Guardar Configuración de IA'}
            </Button>
          </div>

          {/* WhatsApp Default */}
          <div className="glass-card rounded-xl p-6 space-y-4">
            <h2 className="font-semibold text-lg">WhatsApp por defecto</h2>
            <div className="space-y-2">
              <Label>Número para leads sin agente asignado</Label>
              <Input
                value={generalForm.whatsapp_default || ''}
                onChange={(e) => setGeneralForm({ ...generalForm, whatsapp_default: e.target.value })}
                placeholder="+595981123456"
              />
            </div>
            <Button 
              variant="outline" 
              onClick={() => saveGeneralMutation.mutate()}
              disabled={saveGeneralMutation.isPending}
            >
              <Save className="w-4 h-4 mr-2" />
              Guardar
            </Button>
          </div>
        </TabsContent>

        {/* Countries */}
        <TabsContent value="countries" className="space-y-6">
          <div className="glass-card rounded-xl p-6">
            <h2 className="font-semibold text-lg mb-4">Países Habilitados</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Selecciona los países donde operas. Solo se mostrarán en el formulario de registro.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {allCountries.map(country => (
                <div
                  key={country}
                  className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                    generalForm.enabled_countries?.includes(country)
                      ? 'bg-primary/20 border border-primary/30'
                      : 'bg-muted/50 border border-transparent hover:bg-muted'
                  }`}
                  onClick={() => toggleCountry(country)}
                >
                  <span>{country}</span>
                  <Switch
                    checked={generalForm.enabled_countries?.includes(country) || false}
                    onCheckedChange={() => toggleCountry(country)}
                  />
                </div>
              ))}
            </div>

            <Button 
              variant="hero" 
              onClick={() => saveGeneralMutation.mutate()}
              disabled={saveGeneralMutation.isPending}
              className="w-full mt-6"
            >
              <Save className="w-4 h-4 mr-2" />
              {saveGeneralMutation.isPending ? 'Guardando...' : 'Guardar Países'}
            </Button>
          </div>
        </TabsContent>

        {/* Danger Zone */}
        <TabsContent value="danger" className="space-y-6">
          <DangerZone 
            getIdToken={getIdToken}
            saveAiMutation={saveAiMutation}
            setAiForm={setAiForm}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSettingsNew;
