import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, Check, AlertTriangle, Link, Eye, EyeOff, Globe } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface AgentCreatedModalProps {
  isOpen: boolean;
  onClose: () => void;
  agentData: {
    email: string;
    tempPassword: string;
    refCode: string;
  } | null;
}

const COUNTRIES = [
  { code: 'CL', name: 'Chile' },
  { code: 'AR', name: 'Argentina' },
  { code: 'PY', name: 'Paraguay' },
  { code: 'CO', name: 'Colombia' },
  { code: 'EC', name: 'Ecuador' },
  { code: 'MX', name: 'México' },
  { code: 'US', name: 'USA' },
];

const AgentCreatedModal = ({ isOpen, onClose, agentData }: AgentCreatedModalProps) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  if (!agentData) return null;

  const { email, tempPassword, refCode } = agentData;
  
  // Build referral URL using PUBLIC_SITE_URL or fallback to origin
  const baseUrl = import.meta.env.VITE_PUBLIC_SITE_URL || window.location.origin;
  const referralUrl = `${baseUrl}/?ref=${refCode}`;

  const copyToClipboard = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success('Copiado al portapapeles');
    setTimeout(() => setCopiedField(null), 2000);
  };

  const getCountryLink = (countryCode: string) => {
    return `${baseUrl}/?ref=${refCode}&country=${countryCode}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-primary">
            <Check className="w-5 h-5" />
            Agente Creado Exitosamente
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Warning */}
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 flex gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-amber-500">¡Atención!</p>
              <p className="text-muted-foreground">
                La contraseña temporal solo se muestra <strong>una vez</strong>. 
                Guárdala o compártela ahora con el agente.
              </p>
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <div className="flex gap-2">
              <Input value={email} readOnly className="font-mono text-sm" />
              <Button
                variant="outline"
                size="icon"
                onClick={() => copyToClipboard(email, 'email')}
              >
                {copiedField === 'email' ? (
                  <Check className="w-4 h-4 text-primary" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Temp Password */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-amber-500">Contraseña Temporal</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input 
                  type={showPassword ? 'text' : 'password'}
                  value={tempPassword} 
                  readOnly 
                  className="font-mono text-sm pr-10" 
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => copyToClipboard(tempPassword, 'password')}
              >
                {copiedField === 'password' ? (
                  <Check className="w-4 h-4 text-primary" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Ref Code */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Código de Referido</label>
            <div className="flex gap-2">
              <Input 
                value={refCode} 
                readOnly 
                className="font-mono text-sm bg-primary/10 text-primary font-bold" 
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => copyToClipboard(refCode, 'refCode')}
              >
                {copiedField === 'refCode' ? (
                  <Check className="w-4 h-4 text-primary" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Main Link */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Link className="w-4 h-4" />
              Link Principal
            </label>
            <div className="flex gap-2">
              <Input value={referralUrl} readOnly className="font-mono text-xs" />
              <Button
                variant="outline"
                size="icon"
                onClick={() => copyToClipboard(referralUrl, 'link')}
              >
                {copiedField === 'link' ? (
                  <Check className="w-4 h-4 text-primary" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          {/* QR Code */}
          <div className="flex justify-center bg-card p-4 rounded-lg border border-border">
            <QRCodeSVG
              value={referralUrl}
              size={150}
              level="H"
              includeMargin
            />
          </div>

          {/* Country Links */}
          <div className="space-y-3">
            <label className="text-sm font-medium flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Links por País
            </label>
            <div className="grid grid-cols-2 gap-2">
              {COUNTRIES.map(({ code, name }) => (
                <Button
                  key={code}
                  variant="outline"
                  size="sm"
                  className="justify-between text-xs"
                  onClick={() => copyToClipboard(getCountryLink(code), `country-${code}`)}
                >
                  <span>{name}</span>
                  {copiedField === `country-${code}` ? (
                    <Check className="w-3 h-3 text-primary" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </Button>
              ))}
            </div>
          </div>

          {/* Share via WhatsApp */}
          <Button
            variant="hero"
            className="w-full"
            onClick={() => {
              const message = `🎉 ¡Bienvenido a Ganaya!\n\n📧 Email: ${email}\n🔑 Contraseña: ${tempPassword}\n\n⚠️ Deberás cambiar tu contraseña al iniciar sesión.\n\n🔗 Tu link de referido: ${referralUrl}`;
              window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
            }}
          >
            Compartir por WhatsApp
          </Button>

          <Button variant="outline" className="w-full" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AgentCreatedModal;
