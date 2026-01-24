import { useState } from 'react';
import { Copy, FileText, Image, MessageCircle, Instagram, Send } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

const assets = {
  scripts: [
    {
      title: 'Primera respuesta',
      text: '¡Hola! 👋 Gracias por contactarme. Soy tu cajero personal en Ganaya.bet. ¿Ya tienes cuenta o te ayudo a crear una?',
    },
    {
      title: 'Explicar recargas',
      text: 'Para recargar es muy fácil:\n\n1️⃣ Me dices cuánto quieres cargar\n2️⃣ Te paso la dirección USDT (TRC20)\n3️⃣ Envías desde Binance\n4️⃣ Confirmo y tu saldo está listo en minutos\n\n¿Cuánto te gustaría cargar hoy?',
    },
    {
      title: 'Explicar retiros',
      text: 'Los retiros son igual de rápidos:\n\n1️⃣ Me dices cuánto quieres retirar\n2️⃣ Me pasas tu dirección USDT (TRC20)\n3️⃣ Proceso el retiro\n4️⃣ Recibes en minutos\n\nSin comisiones ocultas. ¿Cuánto necesitas?',
    },
    {
      title: 'Cierre exitoso',
      text: '✅ ¡Listo! Tu transacción ha sido procesada.\n\nGracias por confiar en mí como tu cajero. Cualquier duda, aquí estoy 24/7.\n\n¡Que tengas mucha suerte! 🍀🎰',
    },
    {
      title: 'Seguimiento',
      text: '¡Hola! 👋 ¿Cómo te fue con tu última sesión?\n\nRecuerda que estoy aquí para ayudarte con recargas y retiros cuando necesites. ¡Sin filas, sin esperas!',
    },
    {
      title: 'Manejar objeciones',
      text: 'Entiendo tu preocupación. Te cuento por qué somos diferentes:\n\n✅ Retiros en MINUTOS, no días\n✅ Atención personalizada 24/7\n✅ USDT = sin fluctuaciones\n✅ Miles de usuarios satisfechos\n\n¿Te gustaría probar con un monto pequeño para ver cómo funciona?',
    },
  ],
  captions: [
    {
      platform: 'Instagram/TikTok',
      text: '🎰 Casino online CON SOPORTE REAL 🎰\n\n¿Cansado de esperar días por tus retiros?\n\n✅ Retiros en MINUTOS\n✅ Cajero personal por WhatsApp\n✅ USDT/Binance\n✅ +18 | Juego responsable\n\n👇 Link en bio o escríbeme por DM\n\n#casino #apuestas #ganaya #usdt #binance',
    },
    {
      platform: 'Facebook',
      text: '🔥 ¿Buscas un casino online SEGURO y RÁPIDO?\n\nEn Ganaya.bet tenés:\n• Retiros en minutos, no días\n• Tu propio cajero por WhatsApp\n• Depósitos con USDT/Binance\n• Soporte 24/7\n\nSolo mayores de 18. Jugá responsablemente.\n\n👉 Escríbeme para empezar',
    },
    {
      platform: 'WhatsApp Status',
      text: '🎰 Casino online con cajeros REALES 🎰\n\nRetirá en MINUTOS.\nSoporte 24/7.\n\n📲 Escribime "QUIERO JUGAR"\n\n+18 | Juego responsable',
    },
  ],
  faqs: [
    {
      q: '¿Es seguro?',
      a: 'Sí, usamos USDT que es una stablecoin respaldada 1:1 con el dólar. Las transacciones son a través de Binance, la plataforma más grande del mundo.',
    },
    {
      q: '¿Cuánto tarda un retiro?',
      a: 'Los retiros con USDT se procesan en minutos. Es mucho más rápido que transferencias bancarias tradicionales.',
    },
    {
      q: '¿Hay mínimos?',
      a: 'El mínimo para recargar suele ser 10 USDT. Para retiros depende del casino pero generalmente es similar.',
    },
    {
      q: '¿Cobran comisión?',
      a: 'Solo la comisión de red de Binance (menos de 1 USDT). No cobramos comisiones adicionales.',
    },
    {
      q: '¿Cómo creo cuenta en Binance?',
      a: 'Descargá la app de Binance, registrate con tu email, verificá tu identidad (toma unos minutos) y listo. Te puedo guiar paso a paso.',
    },
  ],
};

const AppAssets = () => {
  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copiado al portapapeles');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-bold">Recursos</h1>
        <p className="text-muted-foreground">Textos, guiones y creatividades para tus redes</p>
      </div>

      <Tabs defaultValue="scripts">
        <TabsList className="mb-6">
          <TabsTrigger value="scripts" className="gap-2">
            <MessageCircle className="w-4 h-4" />
            Guiones
          </TabsTrigger>
          <TabsTrigger value="captions" className="gap-2">
            <Instagram className="w-4 h-4" />
            Captions
          </TabsTrigger>
          <TabsTrigger value="faqs" className="gap-2">
            <FileText className="w-4 h-4" />
            FAQs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="scripts" className="space-y-4">
          <p className="text-sm text-muted-foreground mb-4">
            Guiones listos para copiar y enviar por WhatsApp/Telegram a tus leads.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            {assets.scripts.map((script, i) => (
              <Card key={i} className="glass-card group">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center justify-between">
                    {script.title}
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => copyText(script.text)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="text-sm text-muted-foreground whitespace-pre-wrap font-sans">
                    {script.text}
                  </pre>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="captions" className="space-y-4">
          <p className="text-sm text-muted-foreground mb-4">
            Textos optimizados para publicar en tus redes sociales.
          </p>
          <div className="space-y-4">
            {assets.captions.map((caption, i) => (
              <Card key={i} className="glass-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      {caption.platform === 'Instagram/TikTok' && <Instagram className="w-4 h-4 text-pink-500" />}
                      {caption.platform === 'Facebook' && <FileText className="w-4 h-4 text-blue-500" />}
                      {caption.platform === 'WhatsApp Status' && <MessageCircle className="w-4 h-4 text-[#25D366]" />}
                      {caption.platform}
                    </span>
                    <Button size="sm" variant="ghost" onClick={() => copyText(caption.text)}>
                      <Copy className="w-4 h-4" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="text-sm text-muted-foreground whitespace-pre-wrap font-sans">
                    {caption.text}
                  </pre>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="faqs" className="space-y-4">
          <p className="text-sm text-muted-foreground mb-4">
            Respuestas a las preguntas más comunes de tus leads.
          </p>
          <div className="space-y-3">
            {assets.faqs.map((faq, i) => (
              <Card key={i} className="glass-card">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-medium mb-2">{faq.q}</p>
                      <p className="text-sm text-muted-foreground">{faq.a}</p>
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => copyText(faq.a)}>
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AppAssets;
