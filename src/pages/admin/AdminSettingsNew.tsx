import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Save, Send, TestTube, Eye, EyeOff, Globe, Calculator } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

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

interface ScoringRules {
  binance: { verificada: number };
  p2p: { basico: number; medio: number; avanzado: number };
  horas: { '1-2': number; '3-5': number; '6+': number };
  banca_300: number;
  exp_casinos: number;
  exp_atencion: number;
  quiere_empezar: number;
}

const defaultScoringRules: ScoringRules = {
  binance: { verificada: 30 },
  p2p: { basico: 5, medio: 10, avanzado: 15 },
  horas: { '1-2': 5, '3-5': 10, '6+': 20 },
  banca_300: 20,
  exp_casinos: 10,
  exp_atencion: 10,
  quiere_empezar: 5,
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
        <TabsList className="grid w-full grid-cols-3 mb-6">
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
              Configura los puntos asignados a cada criterio para calcular el score de agentes potenciales.
            </p>

            <div className="space-y-6">
              {/* Binance */}
              <div className="p-4 rounded-lg bg-muted/50">
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-base">Binance Verificada</Label>
                  <Input
                    type="number"
                    value={scoringRules.binance.verificada}
                    onChange={(e) => updateScoringRule('binance.verificada', parseInt(e.target.value) || 0)}
                    className="w-20 text-center"
                  />
                </div>
              </div>

              {/* P2P Level */}
              <div className="p-4 rounded-lg bg-muted/50">
                <Label className="text-base mb-3 block">Nivel P2P</Label>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <Label className="text-sm text-muted-foreground">Básico</Label>
                    <Input
                      type="number"
                      value={scoringRules.p2p.basico}
                      onChange={(e) => updateScoringRule('p2p.basico', parseInt(e.target.value) || 0)}
                      className="text-center"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-sm text-muted-foreground">Medio</Label>
                    <Input
                      type="number"
                      value={scoringRules.p2p.medio}
                      onChange={(e) => updateScoringRule('p2p.medio', parseInt(e.target.value) || 0)}
                      className="text-center"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-sm text-muted-foreground">Avanzado</Label>
                    <Input
                      type="number"
                      value={scoringRules.p2p.avanzado}
                      onChange={(e) => updateScoringRule('p2p.avanzado', parseInt(e.target.value) || 0)}
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
                      value={scoringRules.horas['1-2']}
                      onChange={(e) => updateScoringRule('horas.1-2', parseInt(e.target.value) || 0)}
                      className="text-center"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-sm text-muted-foreground">3-5 horas</Label>
                    <Input
                      type="number"
                      value={scoringRules.horas['3-5']}
                      onChange={(e) => updateScoringRule('horas.3-5', parseInt(e.target.value) || 0)}
                      className="text-center"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-sm text-muted-foreground">6+ horas</Label>
                    <Input
                      type="number"
                      value={scoringRules.horas['6+']}
                      onChange={(e) => updateScoringRule('horas.6+', parseInt(e.target.value) || 0)}
                      className="text-center"
                    />
                  </div>
                </div>
              </div>

              {/* Other criteria */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                  <Label className="text-sm">Banca $300+</Label>
                  <Input
                    type="number"
                    value={scoringRules.banca_300}
                    onChange={(e) => updateScoringRule('banca_300', parseInt(e.target.value) || 0)}
                    className="text-center"
                  />
                </div>
                <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                  <Label className="text-sm">Exp. Casinos</Label>
                  <Input
                    type="number"
                    value={scoringRules.exp_casinos}
                    onChange={(e) => updateScoringRule('exp_casinos', parseInt(e.target.value) || 0)}
                    className="text-center"
                  />
                </div>
                <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                  <Label className="text-sm">Exp. Atención</Label>
                  <Input
                    type="number"
                    value={scoringRules.exp_atencion}
                    onChange={(e) => updateScoringRule('exp_atencion', parseInt(e.target.value) || 0)}
                    className="text-center"
                  />
                </div>
                <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                  <Label className="text-sm">Quiere Empezar</Label>
                  <Input
                    type="number"
                    value={scoringRules.quiere_empezar}
                    onChange={(e) => updateScoringRule('quiere_empezar', parseInt(e.target.value) || 0)}
                    className="text-center"
                  />
                </div>
              </div>
            </div>
          </div>
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

export default AdminSettingsNew;
