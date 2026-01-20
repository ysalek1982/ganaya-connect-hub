import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageCircle, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { countries, validateWhatsApp } from '@/lib/countries';
import { useUTM } from '@/hooks/useUTM';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface LeadFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const LeadFormModal = ({ open, onOpenChange }: LeadFormModalProps) => {
  const utm = useUTM();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [honeypot, setHoneypot] = useState('');
  
  const [formData, setFormData] = useState({
    nombre: '',
    whatsapp: '',
    pais: '',
    ciudad: '',
    email: '',
    aposto_antes: '',
    consent: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Honeypot check
    if (honeypot) return;

    if (!validateWhatsApp(formData.whatsapp)) {
      toast.error('Número de WhatsApp inválido');
      return;
    }

    if (!formData.consent) {
      toast.error('Debes aceptar ser contactado');
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.from('leads').insert({
        tipo: 'cliente',
        nombre: formData.nombre.trim(),
        whatsapp: formData.whatsapp.trim(),
        pais: formData.pais,
        ciudad: formData.ciudad.trim() || null,
        email: formData.email.trim() || null,
        aposto_antes: formData.aposto_antes === 'si',
        origen: 'home_form',
        utm_source: utm.utm_source,
        utm_campaign: utm.utm_campaign,
        utm_medium: utm.utm_medium,
      });

      if (error) throw error;

      setIsSuccess(true);
    } catch (error) {
      console.error('Error saving lead:', error);
      toast.error('Error al enviar. Intentá de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleWhatsApp = () => {
    const country = countries.find(c => c.code === formData.pais);
    const msg = encodeURIComponent(`Hola, quiero apostar en Ganaya.bet. Soy ${formData.nombre} de ${country?.name || 'LATAM'}. ¿Me ayudas con la recarga?`);
    window.open(`https://wa.me/59176356972?text=${msg}`, '_blank');
    onOpenChange(false);
  };

  const handleClose = () => {
    setIsSuccess(false);
    setFormData({
      nombre: '',
      whatsapp: '',
      pais: '',
      ciudad: '',
      email: '',
      aposto_antes: '',
      consent: false,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <AnimatePresence mode="wait">
          {isSuccess ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="text-center py-8"
            >
              <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-primary" />
              </div>
              <h3 className="font-display text-2xl font-bold text-foreground mb-2">
                ¡Gracias, {formData.nombre}!
              </h3>
              <p className="text-muted-foreground mb-6">
                Un agente de {countries.find(c => c.code === formData.pais)?.name} te contactará pronto.
              </p>
              <div className="flex flex-col gap-3">
                <Button variant="whatsapp" size="lg" onClick={handleWhatsApp} className="w-full">
                  <MessageCircle className="w-5 h-5" />
                  Abrir WhatsApp ahora
                </Button>
                <Button variant="ghost" onClick={handleClose}>
                  Cerrar
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <DialogHeader>
                <DialogTitle className="font-display text-xl">
                  Dejá tus datos
                </DialogTitle>
                <p className="text-sm text-muted-foreground">
                  Un agente de tu país te escribe por WhatsApp
                </p>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                {/* Honeypot */}
                <input
                  type="text"
                  name="website"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                  className="hidden"
                  tabIndex={-1}
                  autoComplete="off"
                />

                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre *</Label>
                  <Input
                    id="nombre"
                    placeholder="Tu nombre"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    required
                    className="bg-secondary border-border"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="whatsapp">WhatsApp *</Label>
                  <Input
                    id="whatsapp"
                    placeholder="+595 981 123 456"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    required
                    className="bg-secondary border-border"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pais">País *</Label>
                  <Select
                    value={formData.pais}
                    onValueChange={(value) => setFormData({ ...formData, pais: value })}
                    required
                  >
                    <SelectTrigger className="bg-secondary border-border">
                      <SelectValue placeholder="Seleccionar país" />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map((country) => (
                        <SelectItem key={country.code} value={country.code}>
                          {country.flag} {country.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ciudad">Ciudad (opcional)</Label>
                  <Input
                    id="ciudad"
                    placeholder="Tu ciudad"
                    value={formData.ciudad}
                    onChange={(e) => setFormData({ ...formData, ciudad: e.target.value })}
                    className="bg-secondary border-border"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email (opcional)</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="bg-secondary border-border"
                  />
                </div>

                <div className="space-y-2">
                  <Label>¿Ya apostaste online antes?</Label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="aposto_antes"
                        value="si"
                        checked={formData.aposto_antes === 'si'}
                        onChange={(e) => setFormData({ ...formData, aposto_antes: e.target.value })}
                        className="w-4 h-4 accent-primary"
                      />
                      <span className="text-sm">Sí</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="aposto_antes"
                        value="no"
                        checked={formData.aposto_antes === 'no'}
                        onChange={(e) => setFormData({ ...formData, aposto_antes: e.target.value })}
                        className="w-4 h-4 accent-primary"
                      />
                      <span className="text-sm">No</span>
                    </label>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Checkbox
                    id="consent"
                    checked={formData.consent}
                    onCheckedChange={(checked) => setFormData({ ...formData, consent: checked as boolean })}
                    className="mt-1"
                  />
                  <Label htmlFor="consent" className="text-xs text-muted-foreground cursor-pointer">
                    Acepto ser contactado por WhatsApp por un agente de Ganaya.bet
                  </Label>
                </div>

                <Button 
                  type="submit" 
                  variant="hero" 
                  size="lg" 
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <MessageCircle className="w-5 h-5" />
                      Quiero que me contacten
                    </>
                  )}
                </Button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};
