import { useState, useEffect } from 'react';
import { User, Phone, MessageCircle, MapPin, Save, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth';
import { useUpdateFirebaseUser } from '@/hooks/useFirebaseUsers';
import { toast } from 'sonner';

const countries = [
  { code: 'CL', name: 'Chile', flag: '🇨🇱', prefix: '56' },
  { code: 'AR', name: 'Argentina', flag: '🇦🇷', prefix: '54' },
  { code: 'PY', name: 'Paraguay', flag: '🇵🇾', prefix: '595' },
  { code: 'BO', name: 'Bolivia', flag: '🇧🇴', prefix: '591' },
  { code: 'CO', name: 'Colombia', flag: '🇨🇴', prefix: '57' },
  { code: 'EC', name: 'Ecuador', flag: '🇪🇨', prefix: '593' },
  { code: 'PE', name: 'Perú', flag: '🇵🇪', prefix: '51' },
  { code: 'MX', name: 'México', flag: '🇲🇽', prefix: '52' },
  { code: 'US', name: 'USA', flag: '🇺🇸', prefix: '1' },
];

// Validate WhatsApp: must be digits only, 10-15 digits, with country prefix
const validateWhatsApp = (phone: string): { valid: boolean; error?: string; normalized: string } => {
  const digits = phone.replace(/\D/g, '');
  
  if (!digits) {
    return { valid: true, normalized: '' }; // Empty is allowed
  }
  
  if (digits.length < 10) {
    return { valid: false, error: 'El número debe tener al menos 10 dígitos', normalized: digits };
  }
  
  if (digits.length > 15) {
    return { valid: false, error: 'El número no puede tener más de 15 dígitos', normalized: digits };
  }
  
  // Check if starts with a known country prefix
  const hasValidPrefix = countries.some(c => digits.startsWith(c.prefix));
  if (!hasValidPrefix && digits.length >= 10) {
    return { valid: false, error: 'Incluye el código de país (ej: 591 para Bolivia)', normalized: digits };
  }
  
  return { valid: true, normalized: digits };
};

const AppProfile = () => {
  const { userData } = useFirebaseAuth();
  const updateUser = useUpdateFirebaseUser();
  
  const [formData, setFormData] = useState({
    displayName: '',
    whatsapp: '',
    telegram: '',
    contactLabel: '',
    country: '',
    city: '',
  });
  
  const [whatsappValidation, setWhatsappValidation] = useState<{ valid: boolean; error?: string }>({ valid: true });

  useEffect(() => {
    if (userData) {
      setFormData({
        displayName: userData.displayName || userData.name || '',
        whatsapp: userData.publicContact?.whatsapp || userData.whatsapp || '',
        telegram: userData.publicContact?.telegram || '',
        contactLabel: userData.publicContact?.contactLabel || '',
        country: userData.country || '',
        city: userData.city || '',
      });
    }
  }, [userData]);

  const handleWhatsAppChange = (value: string) => {
    setFormData(prev => ({ ...prev, whatsapp: value }));
    const validation = validateWhatsApp(value);
    setWhatsappValidation({ valid: validation.valid, error: validation.error });
  };

  const handleSave = async () => {
    if (!userData?.uid) return;

    // Validate WhatsApp
    const validation = validateWhatsApp(formData.whatsapp);
    if (!validation.valid) {
      toast.error(validation.error || 'WhatsApp inválido');
      return;
    }

    const normalizedWhatsapp = validation.normalized;

    try {
      await updateUser.mutateAsync({
        uid: userData.uid,
        data: {
          displayName: formData.displayName || undefined,
          country: formData.country,
          city: formData.city || null,
          whatsapp: normalizedWhatsapp || null,
          publicContact: {
            whatsapp: normalizedWhatsapp || undefined,
            telegram: formData.telegram || undefined,
            contactLabel: formData.contactLabel || undefined,
          },
        } as any,
      });
      toast.success('Perfil actualizado correctamente');
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Error al guardar el perfil');
    }
  };

  if (!userData) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-bold">Mi Perfil</h1>
        <p className="text-muted-foreground">Configura tu información de contacto público</p>
      </div>

      {/* WhatsApp Configuration Alert */}
      <Alert className="border-primary/30 bg-primary/5">
        <MessageCircle className="h-4 w-4 text-primary" />
        <AlertDescription>
          <strong>Importante:</strong> Tu número de WhatsApp es el que verán los jugadores que usen tu link de referido. 
          Asegúrate de que esté correcto incluyendo el código de país.
        </AlertDescription>
      </Alert>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            Información Personal
          </CardTitle>
          <CardDescription>
            Esta información se muestra a los jugadores que usen tu link de referido
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Display Name */}
          <div className="space-y-2">
            <Label htmlFor="displayName">Nombre público *</Label>
            <Input 
              id="displayName"
              placeholder="Ej: María González"
              value={formData.displayName}
              onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
            />
            <p className="text-xs text-muted-foreground">
              El nombre que verán tus referidos (ej: "Te atiende: María")
            </p>
          </div>

          {/* Contact Label */}
          <div className="space-y-2">
            <Label htmlFor="contactLabel">Etiqueta de contacto</Label>
            <Input 
              id="contactLabel"
              placeholder="Ej: Tu cajero de confianza"
              value={formData.contactLabel}
              onChange={(e) => setFormData(prev => ({ ...prev, contactLabel: e.target.value }))}
            />
            <p className="text-xs text-muted-foreground">
              Personaliza cómo te presentas (por defecto: "Tu cajero asignado")
            </p>
          </div>

          {/* WhatsApp with validation */}
          <div className="space-y-2">
            <Label htmlFor="whatsapp" className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              WhatsApp *
            </Label>
            <div className="relative">
              <Input 
                id="whatsapp"
                placeholder="Ej: 59176356972 (código país + número)"
                value={formData.whatsapp}
                onChange={(e) => handleWhatsAppChange(e.target.value)}
                className={!whatsappValidation.valid ? 'border-destructive' : whatsappValidation.valid && formData.whatsapp ? 'border-green-500' : ''}
              />
              {formData.whatsapp && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {whatsappValidation.valid ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-destructive" />
                  )}
                </div>
              )}
            </div>
            {whatsappValidation.error && (
              <p className="text-xs text-destructive">{whatsappValidation.error}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Incluye el código de país sin el + (ej: 591 Bolivia, 54 Argentina, 56 Chile)
            </p>
          </div>

          {/* Telegram */}
          <div className="space-y-2">
            <Label htmlFor="telegram" className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              Telegram (opcional)
            </Label>
            <Input 
              id="telegram"
              placeholder="Ej: @tu_usuario"
              value={formData.telegram}
              onChange={(e) => setFormData(prev => ({ ...prev, telegram: e.target.value }))}
            />
          </div>

          {/* Location */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                País
              </Label>
              <Select 
                value={formData.country} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, country: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map(c => (
                    <SelectItem key={c.code} value={c.code}>
                      {c.flag} {c.name} (+{c.prefix})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">Ciudad</Label>
              <Input 
                id="city"
                placeholder="Ej: Santa Cruz"
                value={formData.city}
                onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
              />
            </div>
          </div>

          <Button 
            onClick={handleSave} 
            disabled={updateUser.isPending || !whatsappValidation.valid}
            className="w-full gap-2"
          >
            {updateUser.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Guardar cambios
          </Button>
        </CardContent>
      </Card>

      {/* Account Info (read-only) */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Información de cuenta</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Email</span>
            <span>{userData.email}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Código de referido</span>
            <code className="text-primary font-bold">{userData.refCode || 'No asignado'}</code>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Rol</span>
            <span className="capitalize">{userData.role?.toLowerCase()}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AppProfile;
