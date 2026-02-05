import { subDays, startOfDay } from 'date-fns';
import { TrendingUp, Users, UserCheck, BarChart3, MessageCircle, Copy } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth';
import { useFirebaseLeads } from '@/hooks/useFirebaseLeads';
import { toast } from 'sonner';
import { getReferralUrl } from '@/lib/siteUrl';

const AppDashboard = () => {
  const { userData, isAdmin, isLineLeader, agentId } = useFirebaseAuth();

  const { data: leads, isLoading } = useFirebaseLeads({
    agentId,
    lineLeaderId: isLineLeader ? agentId : null,
    isAdmin,
  });

  // Calculate stats from Firestore leads
  const stats = (() => {
    if (!leads) return null;

    const today = startOfDay(new Date());
    const sevenDaysAgo = subDays(today, 7);

    const todayLeads = leads.filter(l => 
      new Date(l.createdAt) >= today
    ).length;

    const weekLeads = leads.filter(l => 
      new Date(l.createdAt) >= sevenDaysAgo
    ).length;

    // Map Firebase status to display counts
    const statusCounts = {
      nuevo: leads.filter(l => l.status === 'NUEVO').length,
      contactado: leads.filter(l => l.status === 'CONTACTADO').length,
      aprobado: leads.filter(l => l.status === 'APROBADO').length,
      onboarded: leads.filter(l => l.status === 'ONBOARDED').length,
    };

    const countryCounts: Record<string, number> = {};
    leads.forEach(l => {
      countryCounts[l.country] = (countryCounts[l.country] || 0) + 1;
    });

    const topCountries = Object.entries(countryCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    return {
      todayLeads,
      weekLeads,
      totalLeads: leads.length,
      statusCounts,
      topCountries,
    };
  })();

  const copyLink = () => {
    if (userData?.refCode) {
      const link = getReferralUrl(userData.refCode);
      navigator.clipboard.writeText(link);
      toast.success('Link copiado');
    }
  };

  const conversionRate = stats?.totalLeads 
    ? Math.round((stats.statusCounts.onboarded / stats.totalLeads) * 100) 
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            {userData?.name ? `Bienvenido, ${userData.name}` : 'Resumen de tu actividad'}
          </p>
        </div>
        {userData?.refCode && (
          <Button onClick={copyLink} variant="outline" className="gap-2">
            <Copy className="w-4 h-4" />
            Copiar mi link
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Leads Hoy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-display font-bold text-primary">
              {isLoading ? '...' : stats?.todayLeads || 0}
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Últimos 7 días
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-display font-bold text-gold">
              {isLoading ? '...' : stats?.weekLeads || 0}
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="w-4 h-4" />
              Total Leads
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-display font-bold">
              {isLoading ? '...' : stats?.totalLeads || 0}
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <UserCheck className="w-4 h-4" />
              Conversión
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-display font-bold text-accent">
              {conversionRate}%
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Conversion Funnel */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg">Embudo de Conversión</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: 'Nuevos', value: stats?.statusCounts.nuevo || 0, color: 'bg-primary' },
              { label: 'Contactados', value: stats?.statusCounts.contactado || 0, color: 'bg-gold' },
              { label: 'Aprobados', value: stats?.statusCounts.aprobado || 0, color: 'bg-accent' },
              { label: 'Onboarded', value: stats?.statusCounts.onboarded || 0, color: 'bg-primary' },
            ].map((item, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>{item.label}</span>
                  <span className="font-semibold">{item.value}</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${item.color} transition-all`}
                    style={{ 
                      width: `${stats?.totalLeads ? (item.value / stats.totalLeads) * 100 : 0}%` 
                    }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Top Countries */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg">Top Países</CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.topCountries && stats.topCountries.length > 0 ? (
              <div className="space-y-3">
                {stats.topCountries.map(([country, count], i) => (
                  <div key={country} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-muted-foreground w-5">#{i + 1}</span>
                      <span className="font-medium">{country}</span>
                    </div>
                    <Badge variant="outline">{count} leads</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                Sin datos aún
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-primary" />
            Plantillas de Mensajes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-3">
            {[
              { label: 'Bienvenida jugador', text: '¡Hola! Soy tu cajero personal en Ganaya.bet. ¿En qué puedo ayudarte hoy? 🎰' },
              { label: 'Instrucciones USDT', text: 'Para recargar: 1) Abre Binance 2) Envía USDT a esta dirección: [TU_WALLET] 3) Confirma y tu saldo estará listo en minutos.' },
              { label: 'Seguimiento', text: '¡Hola! ¿Pudiste completar tu recarga? Estoy aquí para ayudarte con cualquier duda.' },
              { label: 'Cierre', text: '¡Listo! Tu retiro ha sido procesado. Gracias por confiar en Ganaya.bet. ¡Que tengas suerte! 🍀' },
            ].map((template, i) => (
              <div 
                key={i}
                className="p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer group"
                onClick={() => {
                  navigator.clipboard.writeText(template.text);
                  toast.success('Mensaje copiado');
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm">{template.label}</span>
                  <Copy className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">{template.text}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AppDashboard;
