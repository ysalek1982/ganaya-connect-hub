import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, Link, QrCode, Download, Check } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface AgentLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  agentName: string;
  refCode: string;
}

const AgentLinkModal = ({ isOpen, onClose, agentName, refCode }: AgentLinkModalProps) => {
  const [copied, setCopied] = useState(false);
  
  const baseUrl = window.location.origin;
  const fullLink = `${baseUrl}/?ref=${refCode}`;

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(fullLink);
    setCopied(true);
    toast.success('Link copiado al portapapeles');
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadQR = () => {
    const canvas = document.querySelector('#agent-qr-code canvas') as HTMLCanvasElement;
    if (canvas) {
      const url = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url;
      a.download = `qr-${refCode}.png`;
      a.click();
      toast.success('QR descargado');
    } else {
      // Fallback: create SVG download
      const svg = document.querySelector('#agent-qr-code svg');
      if (svg) {
        const svgData = new XMLSerializer().serializeToString(svg);
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `qr-${refCode}.svg`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success('QR descargado');
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link className="w-5 h-5 text-primary" />
            Link de Referido
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="text-center">
            <p className="text-lg font-medium">{agentName}</p>
            <code className="text-primary bg-primary/10 px-3 py-1 rounded-md text-sm mt-1 inline-block">
              {refCode}
            </code>
          </div>

          {/* URL */}
          <div className="space-y-2">
            <label className="text-sm font-medium">URL de Referido</label>
            <div className="flex gap-2">
              <Input
                value={fullLink}
                readOnly
                className="font-mono text-sm"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={copyToClipboard}
              >
                {copied ? (
                  <Check className="w-4 h-4 text-primary" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium flex items-center gap-2">
              <QrCode className="w-4 h-4" />
              Código QR
            </label>
            <div 
              id="agent-qr-code"
              className="flex justify-center bg-card p-4 rounded-lg border border-border"
            >
              <QRCodeSVG
                value={fullLink}
                size={180}
                level="H"
                includeMargin
              />
            </div>
            <Button
              variant="outline"
              className="w-full"
              onClick={downloadQR}
            >
              <Download className="w-4 h-4 mr-2" />
              Descargar QR
            </Button>
          </div>

          {/* Share options */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                window.open(`https://wa.me/?text=${encodeURIComponent(`¡Regístrate en Ganaya con mi link! ${fullLink}`)}`, '_blank');
              }}
            >
              Compartir WhatsApp
            </Button>
            <Button
              variant="default"
              className="flex-1"
              onClick={copyToClipboard}
            >
              <Copy className="w-4 h-4 mr-2" />
              Copiar Link
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AgentLinkModal;
