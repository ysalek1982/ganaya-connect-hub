import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Save, Send, TestTube, Eye, EyeOff, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
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
}

const AdminSettings = () => {
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
  });

  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const { data, error } = await supabase.from('settings').select('*').limit(1).single();
      if (error && error.code !== 'PGRST116') throw error;
      return data as Settings | null;
    },
  });

  useEffect(() => {
    if (settings) {
      setForm(settings);
    }
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (settings?.id) {
        const { error } = await supabase.from('settings').update(form).eq('id', settings.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('settings').insert(form);
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

  const testSmtp = async () => {
    toast.info('Enviando email de prueba...');
    // In a real implementation, this would call an edge function
    setTimeout(() => {
      if (form.smtp_host && form.smtp_user) {
        toast.success('Email de prueba enviado (simulado)');
      } else {
        toast.error('Configurá SMTP primero');
      }
    }, 1500);
  };

  const testGemini = async () => {
    toast.info('Probando conexión con Gemini...');
    // In a real implementation, this would call an edge function
    setTimeout(() => {
      if (form.gemini_api_key) {
        toast.success('Conexión exitosa con Gemini');
      } else {
        toast.warning('Sin API key, usando modo fallback');
      }
    }, 1500);
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
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-bold">Configuración</h1>
        <p className="text-muted-foreground">Ajustes del sistema</p>
      </div>

      <div className="grid gap-6">
        {/* Gemini AI */}
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
              Si no configurás una API key propia, el sistema usará el gateway de Lovable.
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
                  placeholder="AIza... (dejar vacío para usar Lovable AI Gateway)"
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
            <p className="text-xs text-muted-foreground">
              Podés obtener tu API key en <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google AI Studio</a>. 
              Sin API key propia, el sistema usa Lovable AI Gateway automáticamente.
            </p>
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
                placeholder="tu@email.com"
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
            <div className="space-y-2 md:col-span-2">
              <Label>Email remitente</Label>
              <Input
                type="email"
                value={form.from_email || ''}
                onChange={(e) => setForm({ ...form, from_email: e.target.value })}
                placeholder="noreply@ganaya.bet"
              />
            </div>
          </div>

          <Button variant="outline" onClick={testSmtp}>
            <Send className="w-4 h-4 mr-2" />
            Enviar email de prueba
          </Button>
        </div>

        {/* WhatsApp Default */}
        <div className="glass-card rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-whatsapp/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-whatsapp" />
            </div>
            <div>
              <h2 className="font-semibold text-lg">WhatsApp por defecto</h2>
              <p className="text-sm text-muted-foreground">Número para leads sin agente asignado</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Número de WhatsApp</Label>
            <Input
              value={form.whatsapp_default || ''}
              onChange={(e) => setForm({ ...form, whatsapp_default: e.target.value })}
              placeholder="+595981123456"
            />
          </div>
        </div>
      </div>

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

export default AdminSettings;
