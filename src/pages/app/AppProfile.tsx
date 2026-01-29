import { useState, useEffect } from 'react';
import { User, Phone, MessageCircle, MapPin, Save, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth';
import { useUpdateFirebaseUser } from '@/hooks/useFirebaseUsers';
import { toast } from 'sonner';

const countries = [
  { code: 'CL', name: 'Chile', flag: '🇨🇱' },
  { code: 'AR', name: 'Argentina', flag: '🇦🇷' },
  { code: 'PY', name: 'Paraguay', flag: '🇵🇾' },
  { code: 'BO', name: 'Bolivia', flag: '🇧🇴' },
  { code: 'CO', name: 'Colombia', flag: '🇨🇴' },
  { code: 'EC', name: 'Ecuador', flag: '🇪🇨' },
  { code: 'PE', name: 'Perú', flag: '🇵🇪' },
  { code: 'MX', name: 'México', flag: '🇲🇽' },
  { code: 'US', name: 'USA', flag: '🇺🇸' },
];

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

  const handleSave = async () => {
    if (!userData?.uid) return;

    // Normalize WhatsApp - remove non-digits except leading +
    const normalizedWhatsapp = formData.whatsapp.replace(/[^\d]/g, '');

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
      toast.success('Perfil actualizado');
    } catch (error) {
      toast.error('Error al guardar');
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
            <Label htmlFor="displayName">Nombre público</Label>
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
              placeholder="Ej: Tu cajero asignado"
              value={formData.contactLabel}
              onChange={(e) => setFormData(prev => ({ ...prev, contactLabel: e.target.value }))}
            />
            <p className="text-xs text-muted-foreground">
              Personaliza cómo te presentas (por defecto: "Te atiende: [tu nombre]")
            </p>
          </div>

          {/* WhatsApp */}
          <div className="space-y-2">
            <Label htmlFor="whatsapp" className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              WhatsApp
            </Label>
            <Input 
              id="whatsapp"
              placeholder="Ej: 59176356972 (código país + número)"
              value={formData.whatsapp}
              onChange={(e) => setFormData(prev => ({ ...prev, whatsapp: e.target.value }))}
            />
            <p className="text-xs text-muted-foreground">
              Incluye el código de país sin espacios ni guiones
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
                      {c.flag} {c.name}
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
            disabled={updateUser.isPending}
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
