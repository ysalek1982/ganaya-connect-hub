import { QRCodeSVG } from 'qrcode.react';
import { Copy, Check, MessageCircle } from 'lucide-react';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { getLoginUrl, getReferralUrl } from '@/lib/siteUrl';

interface SubagentCreatedModalProps {
  open: boolean;
  onClose: () => void;
  data: {
    email: string;
    tempPassword: string;
    refCode: string;
    referralUrl?: string;
    name?: string;
  } | null;
}

const SubagentCreatedModal = ({ open, onClose, data }: SubagentCreatedModalProps) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  
  if (!data) return null;

  const loginUrl = getLoginUrl();
  const referralUrl = getReferralUrl(data.refCode);

  const copyToClipboard = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success('Copiado al portapapeles');
    setTimeout(() => setCopiedField(null), 2000);
  };

  const copyAll = async () => {
    const text = `🎉 ¡Bienvenido a Ganaya!

👤 Nombre: ${data.name || 'Nuevo Agente'}
📧 Email: ${data.email}
🔐 Contraseña temporal: ${data.tempPassword}
🔗 Tu código de referido: ${data.refCode}

🌐 Accede aquí: ${loginUrl}

📎 Tu link de referidos: ${referralUrl}

⚠️ Importante: Cambia tu contraseña en tu primer inicio de sesión.`;
    
    await navigator.clipboard.writeText(text);
    toast.success('Todas las credenciales copiadas');
  };

  const sendWhatsApp = () => {
    const text = encodeURIComponent(`🎉 ¡Bienvenido a Ganaya!

👤 Nombre: ${data.name || 'Nuevo Agente'}
📧 Email: ${data.email}
🔐 Contraseña temporal: ${data.tempPassword}
🔗 Tu código de referido: ${data.refCode}

🌐 Accede aquí: ${loginUrl}

📎 Tu link de referidos: ${referralUrl}

⚠️ Importante: Cambia tu contraseña en tu primer inicio de sesión.`);
    
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-primary">
            <Check className="w-5 h-5" />
            ¡Subagente Creado!
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Warning */}
          <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3">
            <p className="text-sm text-destructive font-medium">
              ⚠️ Comparte estas credenciales ahora. Solo se muestran una vez.
            </p>
          </div>

          {/* QR Code */}
          <div className="flex justify-center py-4">
            <div className="bg-white p-4 rounded-lg">
              <QRCodeSVG value={referralUrl} size={120} />
            </div>
          </div>

          {/* Credentials */}
          <div className="space-y-3">
            <div className="flex items-center justify-between bg-muted/50 rounded-lg p-3">
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="font-mono text-sm truncate">{data.email}</p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => copyToClipboard(data.email, 'email')}
              >
                {copiedField === 'email' ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>

            <div className="flex items-center justify-between bg-muted/50 rounded-lg p-3">
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">Contraseña temporal</p>
                <p className="font-mono text-sm font-bold text-primary">{data.tempPassword}</p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => copyToClipboard(data.tempPassword, 'password')}
              >
                {copiedField === 'password' ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>

            <div className="flex items-center justify-between bg-muted/50 rounded-lg p-3">
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">Código de referido</p>
                <p className="font-mono text-sm font-bold">{data.refCode}</p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => copyToClipboard(data.refCode, 'refCode')}
              >
                {copiedField === 'refCode' ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>

            <div className="flex items-center justify-between bg-muted/50 rounded-lg p-3">
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">Link de referidos</p>
                <p className="font-mono text-xs truncate">{referralUrl}</p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => copyToClipboard(referralUrl, 'url')}
              >
                {copiedField === 'url' ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-2 pt-2">
            <Button onClick={copyAll} variant="outline" className="w-full gap-2">
              <Copy className="w-4 h-4" />
              Copiar todo
            </Button>
            <Button onClick={sendWhatsApp} variant="hero" className="w-full gap-2">
              <MessageCircle className="w-4 h-4" />
              Enviar por WhatsApp
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SubagentCreatedModal;
