import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, Link, QrCode, Download, Globe, Check, Share2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth';
import { toast } from 'sonner';

const countries = [
  { code: 'all', name: 'Todos los países', flag: '🌎' },
  { code: 'CL', name: 'Chile', flag: '🇨🇱' },
  { code: 'AR', name: 'Argentina', flag: '🇦🇷' },
  { code: 'PY', name: 'Paraguay', flag: '🇵🇾' },
  { code: 'CO', name: 'Colombia', flag: '🇨🇴' },
  { code: 'EC', name: 'Ecuador', flag: '🇪🇨' },
  { code: 'US', name: 'USA', flag: '🇺🇸' },
];

const AppReferrals = () => {
  const { userData } = useFirebaseAuth();
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [utmSource, setUtmSource] = useState('');
  const [utmCampaign, setUtmCampaign] = useState('');
  const [copied, setCopied] = useState(false);

  const baseUrl = window.location.origin;
  
  const buildLink = () => {
    if (!userData?.refCode) return '';
    
    let link = `${baseUrl}/?ref=${userData.refCode}`;
    
    if (selectedCountry !== 'all') {
      link += `&country=${selectedCountry}`;
    }
    
    if (utmSource) {
      link += `&utm_source=${encodeURIComponent(utmSource)}`;
    }
    
    if (utmCampaign) {
      link += `&utm_campaign=${encodeURIComponent(utmCampaign)}`;
    }
    
    return link;
  };

  const currentLink = buildLink();

  const copyLink = async () => {
    await navigator.clipboard.writeText(currentLink);
    setCopied(true);
    toast.success('Link copiado');
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadQR = () => {
    const svg = document.querySelector('#referral-qr svg');
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `qr-${userData?.refCode}.svg`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('QR descargado');
    }
  };

  const shareWhatsApp = () => {
    const text = `¡Únete a Ganaya.bet! Casino online con atención personalizada. Regístrate aquí: ${currentLink}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const prewrittenTexts = [
    {
      platform: 'Instagram/TikTok',
      text: `🎰 ¿Buscas un casino online SEGURO?\n\n✅ Recargas y retiros en minutos\n✅ Atención personalizada por WhatsApp\n✅ USDT/Binance\n\n👉 Regístrate aquí: ${currentLink}`,
    },
    {
      platform: 'WhatsApp Status',
      text: `🔥 Casino online con soporte REAL 🔥\n\nRetira en minutos, no en días.\nAtención por cajeros 24/7.\n\n${currentLink}`,
    },
    {
      platform: 'Facebook',
      text: `¿Cansado de casinos que tardan días en pagarte?\n\nEn Ganaya.bet los retiros son en MINUTOS con USDT.\nTienes un cajero personal que te ayuda por WhatsApp.\n\n👉 ${currentLink}`,
    },
  ];

  if (!userData?.refCode) {
    return (
      <div className="flex items-center justify-center py-20">
        <Card className="glass-card max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">
              No tienes un código de referido asignado. Contacta a un administrador.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-bold">Mis Links</h1>
        <p className="text-muted-foreground">Genera y comparte tus links de referido</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Link Generator */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link className="w-5 h-5 text-primary" />
              Generador de Links
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Ref Code Display */}
            <div className="p-4 rounded-lg bg-primary/10 border border-primary/30 text-center">
              <p className="text-sm text-muted-foreground mb-1">Tu código</p>
              <code className="text-2xl font-bold text-primary">{userData.refCode}</code>
            </div>

            {/* Country Selector */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                País específico
              </Label>
              <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                <SelectTrigger>
                  <SelectValue />
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

            {/* UTM Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>UTM Source</Label>
                <Input 
                  placeholder="instagram" 
                  value={utmSource}
                  onChange={(e) => setUtmSource(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>UTM Campaign</Label>
                <Input 
                  placeholder="promo_julio" 
                  value={utmCampaign}
                  onChange={(e) => setUtmCampaign(e.target.value)}
                />
              </div>
            </div>

            {/* Generated Link */}
            <div className="space-y-2">
              <Label>Link generado</Label>
              <div className="flex gap-2">
                <Input 
                  value={currentLink} 
                  readOnly 
                  className="font-mono text-xs"
                />
                <Button onClick={copyLink} variant="outline" size="icon">
                  {copied ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button onClick={shareWhatsApp} variant="outline" className="flex-1 gap-2">
                <Share2 className="w-4 h-4" />
                WhatsApp
              </Button>
              <Button onClick={copyLink} variant="default" className="flex-1 gap-2">
                <Copy className="w-4 h-4" />
                Copiar Link
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* QR Code */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="w-5 h-5 text-primary" />
              Código QR
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div 
              id="referral-qr"
              className="flex justify-center bg-card p-6 rounded-xl border border-border"
            >
              <QRCodeSVG
                value={currentLink}
                size={200}
                level="H"
                includeMargin
              />
            </div>
            <Button onClick={downloadQR} variant="outline" className="w-full gap-2">
              <Download className="w-4 h-4" />
              Descargar QR
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Pre-written Texts */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Textos para Redes</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="0">
            <TabsList className="mb-4">
              {prewrittenTexts.map((t, i) => (
                <TabsTrigger key={i} value={String(i)}>{t.platform}</TabsTrigger>
              ))}
            </TabsList>
            {prewrittenTexts.map((t, i) => (
              <TabsContent key={i} value={String(i)}>
                <div className="relative">
                  <pre className="p-4 rounded-lg bg-muted/50 text-sm whitespace-pre-wrap font-sans">
                    {t.text}
                  </pre>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="absolute top-2 right-2"
                    onClick={() => {
                      navigator.clipboard.writeText(t.text);
                      toast.success('Texto copiado');
                    }}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AppReferrals;
