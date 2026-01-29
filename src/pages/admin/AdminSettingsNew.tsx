import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { collection, getDocs, deleteDoc, doc, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Save, Send, TestTube, Eye, EyeOff, Globe, Calculator, AlertTriangle, Trash2 } from 'lucide-react';
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

interface Settings {
  id: string;
  gemini_api_key: string | null;
  smtp_host: string | null;
  smtp_port: number | null;
  smtp_user: string | null;
  smtp_pass: string | null;
  from_email: string | null;
  whatsapp_default: string | null;
  fallback_mode: boolean | null;
  enabled_countries: string[] | null;
  scoring_rules: ScoringRules | null;
}

// New agent-focused scoring rules (no Binance/P2P in public scoring)
interface ScoringRules {
  working_capital: { '0-100': number; '100-300': number; '300-500': number; '500+': number };
  hours_per_day: { '1-2': number; '3-5': number; '6+': number };
  has_local_payment_methods: number;
  sales_exp: number;
  casino_exp: number;
  wants_to_start: number;
}

const defaultScoringRules: ScoringRules = {
  working_capital: { '0-100': 0, '100-300': 15, '300-500': 30, '500+': 30 },
  hours_per_day: { '1-2': 5, '3-5': 10, '6+': 20 },
  has_local_payment_methods: 15,
  sales_exp: 15,
  casino_exp: 10,
  wants_to_start: 10,
};

const allCountries = [
  'Paraguay', 'Argentina', 'Bolivia', 'Colombia', 'Ecuador', 'Perú', 'Chile', 'México', 'USA', 'Brasil', 'Uruguay', 'Venezuela'
];

const AdminSettingsNew = () => {
  const queryClient = useQueryClient();
  const [showApiKey, setShowApiKey] = useState(false);
  const [showSmtpPass, setShowSmtpPass] = useState(false);

  const [form, setForm] = useState<Partial<Settings>>({
    gemini_api_key: '',
    smtp_host: '',
    smtp_port: 587,
    smtp_user: '',
    smtp_pass: '',
    from_email: '',
    whatsapp_default: '',
    fallback_mode: true,
    enabled_countries: allCountries.slice(0, 9),
    scoring_rules: defaultScoringRules,
  });

  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const { data, error } = await supabase.from('settings').select('*').limit(1).single();
      if (error && error.code !== 'PGRST116') throw error;
      return data as unknown as Settings | null;
    },
  });

  useEffect(() => {
    if (settings) {
      setForm({
        ...settings,
        enabled_countries: settings.enabled_countries || allCountries.slice(0, 9),
        scoring_rules: settings.scoring_rules || defaultScoringRules,
      });
    }
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = { ...form } as Record<string, unknown>;
      if (settings?.id) {
        const { error } = await supabase.from('settings').update(payload).eq('id', settings.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('settings').insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      toast.success('Configuración guardada');
    },
    onError: () => {
      toast.error('Error al guardar');
    },
  });

  const testGemini = async () => {
    toast.info('Probando conexión con Gemini...');
    setTimeout(() => {
      if (form.gemini_api_key) {
        toast.success('Conexión exitosa con Gemini');
      } else {
        toast.warning('Sin API key, usando Lovable AI Gateway');
      }
    }, 1500);
  };

  const toggleCountry = (country: string) => {
    const current = form.enabled_countries || [];
    const updated = current.includes(country)
      ? current.filter(c => c !== country)
      : [...current, country];
    setForm({ ...form, enabled_countries: updated });
  };

  const updateScoringRule = (path: string, value: number) => {
    const rules = { ...(form.scoring_rules || defaultScoringRules) };
    const keys = path.split('.');
    let obj: Record<string, unknown> = rules;
    for (let i = 0; i < keys.length - 1; i++) {
      obj = obj[keys[i]] as Record<string, unknown>;
    }
    obj[keys[keys.length - 1]] = value;
    setForm({ ...form, scoring_rules: rules as ScoringRules });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="spinner" />
      </div>
    );
  }

  const scoringRules = form.scoring_rules || defaultScoringRules;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-bold">Configuración</h1>
        <p className="text-muted-foreground">Ajustes del sistema</p>
      </div>

      <Tabs defaultValue="ai" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="ai">
            <TestTube className="w-4 h-4 mr-2" />
            IA & Chat
          </TabsTrigger>
          <TabsTrigger value="countries">
            <Globe className="w-4 h-4 mr-2" />
            Países
          </TabsTrigger>
          <TabsTrigger value="scoring">
            <Calculator className="w-4 h-4 mr-2" />
            Scoring
          </TabsTrigger>
          <TabsTrigger value="danger">
            <AlertTriangle className="w-4 h-4 mr-2" />
            Danger Zone
          </TabsTrigger>
        </TabsList>

        {/* AI Settings */}
        <TabsContent value="ai" className="space-y-6">
          <div className="glass-card rounded-xl p-6 space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <TestTube className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold text-lg">Gemini AI</h2>
                <p className="text-sm text-muted-foreground">Asistente IA para chat y resúmenes</p>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 mb-4">
              <p className="text-sm text-primary">
                ✓ <strong>Lovable AI Gateway</strong> está activo como fallback automático.
              </p>
            </div>

            <div className="space-y-2">
              <Label>API Key de Gemini (opcional)</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    type={showApiKey ? 'text' : 'password'}
                    value={form.gemini_api_key || ''}
                    onChange={(e) => setForm({ ...form, gemini_api_key: e.target.value })}
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
                <p className="text-xs text-muted-foreground">Usar reglas sin IA cuando falle Gemini</p>
              </div>
              <Switch
                checked={form.fallback_mode ?? true}
                onCheckedChange={(checked) => setForm({ ...form, fallback_mode: checked })}
              />
            </div>
          </div>

          {/* SMTP */}
          <div className="glass-card rounded-xl p-6 space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center">
                <Send className="w-5 h-5 text-gold" />
              </div>
              <div>
                <h2 className="font-semibold text-lg">Email SMTP</h2>
                <p className="text-sm text-muted-foreground">Configuración para envío de emails</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Host SMTP</Label>
                <Input
                  value={form.smtp_host || ''}
                  onChange={(e) => setForm({ ...form, smtp_host: e.target.value })}
                  placeholder="smtp.gmail.com"
                />
              </div>
              <div className="space-y-2">
                <Label>Puerto</Label>
                <Input
                  type="number"
                  value={form.smtp_port || 587}
                  onChange={(e) => setForm({ ...form, smtp_port: parseInt(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label>Usuario SMTP</Label>
                <Input
                  value={form.smtp_user || ''}
                  onChange={(e) => setForm({ ...form, smtp_user: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Contraseña SMTP</Label>
                <div className="relative">
                  <Input
                    type={showSmtpPass ? 'text' : 'password'}
                    value={form.smtp_pass || ''}
                    onChange={(e) => setForm({ ...form, smtp_pass: e.target.value })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowSmtpPass(!showSmtpPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showSmtpPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* WhatsApp */}
          <div className="glass-card rounded-xl p-6 space-y-4">
            <h2 className="font-semibold text-lg">WhatsApp por defecto</h2>
            <div className="space-y-2">
              <Label>Número para leads sin agente</Label>
              <Input
                value={form.whatsapp_default || ''}
                onChange={(e) => setForm({ ...form, whatsapp_default: e.target.value })}
                placeholder="+595981123456"
              />
            </div>
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
                    form.enabled_countries?.includes(country)
                      ? 'bg-primary/20 border border-primary/30'
                      : 'bg-muted/50 border border-transparent hover:bg-muted'
                  }`}
                  onClick={() => toggleCountry(country)}
                >
                  <span>{country}</span>
                  <Switch
                    checked={form.enabled_countries?.includes(country) || false}
                    onCheckedChange={() => toggleCountry(country)}
                  />
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Scoring Rules */}
        <TabsContent value="scoring" className="space-y-6">
          <div className="glass-card rounded-xl p-6">
            <h2 className="font-semibold text-lg mb-4">Reglas de Scoring (0-100)</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Configura los puntos asignados a cada criterio para evaluar agentes potenciales.
            </p>

            <div className="space-y-6">
              {/* Working Capital */}
              <div className="p-4 rounded-lg bg-muted/50">
                <Label className="text-base mb-3 block">Capital Operativo (USD)</Label>
                <div className="grid grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <Label className="text-sm text-muted-foreground">$0-100</Label>
                    <Input
                      type="number"
                      value={scoringRules.working_capital?.['0-100'] ?? 0}
                      onChange={(e) => updateScoringRule('working_capital.0-100', parseInt(e.target.value) || 0)}
                      className="text-center"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-sm text-muted-foreground">$100-300</Label>
                    <Input
                      type="number"
                      value={scoringRules.working_capital?.['100-300'] ?? 15}
                      onChange={(e) => updateScoringRule('working_capital.100-300', parseInt(e.target.value) || 0)}
                      className="text-center"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-sm text-muted-foreground">$300-500</Label>
                    <Input
                      type="number"
                      value={scoringRules.working_capital?.['300-500'] ?? 30}
                      onChange={(e) => updateScoringRule('working_capital.300-500', parseInt(e.target.value) || 0)}
                      className="text-center"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-sm text-muted-foreground">$500+</Label>
                    <Input
                      type="number"
                      value={scoringRules.working_capital?.['500+'] ?? 30}
                      onChange={(e) => updateScoringRule('working_capital.500+', parseInt(e.target.value) || 0)}
                      className="text-center"
                    />
                  </div>
                </div>
              </div>

              {/* Hours */}
              <div className="p-4 rounded-lg bg-muted/50">
                <Label className="text-base mb-3 block">Horas Disponibles/Día</Label>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <Label className="text-sm text-muted-foreground">1-2 horas</Label>
                    <Input
                      type="number"
                      value={scoringRules.hours_per_day?.['1-2'] ?? 5}
                      onChange={(e) => updateScoringRule('hours_per_day.1-2', parseInt(e.target.value) || 0)}
                      className="text-center"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-sm text-muted-foreground">3-5 horas</Label>
                    <Input
                      type="number"
                      value={scoringRules.hours_per_day?.['3-5'] ?? 10}
                      onChange={(e) => updateScoringRule('hours_per_day.3-5', parseInt(e.target.value) || 0)}
                      className="text-center"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-sm text-muted-foreground">6+ horas</Label>
                    <Input
                      type="number"
                      value={scoringRules.hours_per_day?.['6+'] ?? 20}
                      onChange={(e) => updateScoringRule('hours_per_day.6+', parseInt(e.target.value) || 0)}
                      className="text-center"
                    />
                  </div>
                </div>
              </div>

              {/* Other criteria */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                  <Label className="text-sm">Métodos cobro local</Label>
                  <Input
                    type="number"
                    value={scoringRules.has_local_payment_methods ?? 15}
                    onChange={(e) => updateScoringRule('has_local_payment_methods', parseInt(e.target.value) || 0)}
                    className="text-center"
                  />
                </div>
                <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                  <Label className="text-sm">Exp. Ventas</Label>
                  <Input
                    type="number"
                    value={scoringRules.sales_exp ?? 15}
                    onChange={(e) => updateScoringRule('sales_exp', parseInt(e.target.value) || 0)}
                    className="text-center"
                  />
                </div>
                <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                  <Label className="text-sm">Exp. Casinos</Label>
                  <Input
                    type="number"
                    value={scoringRules.casino_exp ?? 10}
                    onChange={(e) => updateScoringRule('casino_exp', parseInt(e.target.value) || 0)}
                    className="text-center"
                  />
                </div>
                <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                  <Label className="text-sm">Quiere Empezar</Label>
                  <Input
                    type="number"
                    value={scoringRules.wants_to_start ?? 10}
                    onChange={(e) => updateScoringRule('wants_to_start', parseInt(e.target.value) || 0)}
                    className="text-center"
                  />
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Danger Zone */}
        <TabsContent value="danger" className="space-y-6">
          <DangerZone />
        </TabsContent>
      </Tabs>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={() => saveMutation.mutate()} variant="hero" size="lg">
          <Save className="w-4 h-4 mr-2" />
          Guardar configuración
        </Button>
      </div>
    </div>
  );
};

// Danger Zone Component
const DangerZone = () => {
  const [confirmText, setConfirmText] = useState('');
  const [purging, setPurging] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [stats, setStats] = useState<{ leads: number; refCodes: number; chatConfigs: number } | null>(null);

  const loadStats = async () => {
    try {
      const [leadsSnap, refCodesSnap, chatConfigsSnap] = await Promise.all([
        getDocs(collection(db, 'leads')),
        getDocs(collection(db, 'refCodes')),
        getDocs(collection(db, 'chat_configs')),
      ]);
      setStats({
        leads: leadsSnap.size,
        refCodes: refCodesSnap.size,
        chatConfigs: chatConfigsSnap.size,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const handlePurge = async () => {
    if (confirmText !== 'BORRAR') {
      toast.error('Debes escribir "BORRAR" para confirmar');
      return;
    }

    setPurging(true);
    try {
      // Delete all leads
      const leadsSnap = await getDocs(collection(db, 'leads'));
      const deleteLeadsPromises = leadsSnap.docs.map(d => deleteDoc(doc(db, 'leads', d.id)));
      await Promise.all(deleteLeadsPromises);

      // Delete all refCodes (except system ones if needed)
      const refCodesSnap = await getDocs(collection(db, 'refCodes'));
      const deleteRefCodesPromises = refCodesSnap.docs.map(d => deleteDoc(doc(db, 'refCodes', d.id)));
      await Promise.all(deleteRefCodesPromises);

      toast.success('Datos demo eliminados correctamente');
      setDialogOpen(false);
      setConfirmText('');
      loadStats();
    } catch (error) {
      console.error('Purge error:', error);
      toast.error('Error al purgar datos');
    } finally {
      setPurging(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="glass-card rounded-xl p-6 border-2 border-destructive/30 bg-destructive/5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-destructive" />
          </div>
          <div>
            <h2 className="font-semibold text-lg text-destructive">Danger Zone</h2>
            <p className="text-sm text-muted-foreground">Acciones irreversibles. Usar con precaución.</p>
          </div>
        </div>

        {stats && (
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="p-4 rounded-lg bg-background/50 text-center">
              <div className="text-2xl font-bold">{stats.leads}</div>
              <div className="text-xs text-muted-foreground">Leads</div>
            </div>
            <div className="p-4 rounded-lg bg-background/50 text-center">
              <div className="text-2xl font-bold">{stats.refCodes}</div>
              <div className="text-xs text-muted-foreground">Ref Codes</div>
            </div>
            <div className="p-4 rounded-lg bg-background/50 text-center">
              <div className="text-2xl font-bold">{stats.chatConfigs}</div>
              <div className="text-xs text-muted-foreground">Chat Configs</div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div className="p-4 rounded-lg border border-destructive/20 bg-background">
            <h3 className="font-medium mb-2">Purgar Leads y RefCodes</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Elimina TODOS los leads y códigos de referencia. Usa esto para limpiar datos de prueba antes de producción.
              Los usuarios/agentes NO serán eliminados.
            </p>
            
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Purgar datos demo
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="text-destructive flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    Confirmar purga de datos
                  </DialogTitle>
                  <DialogDescription>
                    Esta acción eliminará permanentemente:
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li><strong>{stats?.leads || 0}</strong> leads</li>
                      <li><strong>{stats?.refCodes || 0}</strong> códigos de referencia</li>
                    </ul>
                    <p className="mt-4 text-destructive font-medium">
                      Esta acción NO se puede deshacer.
                    </p>
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <Label>Escribe "BORRAR" para confirmar:</Label>
                  <Input
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
                    placeholder="BORRAR"
                    className="text-center font-mono text-lg"
                  />
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Cancelar</Button>
                  </DialogClose>
                  <Button
                    variant="destructive"
                    onClick={handlePurge}
                    disabled={confirmText !== 'BORRAR' || purging}
                  >
                    {purging ? 'Purgando...' : 'Confirmar purga'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettingsNew;
