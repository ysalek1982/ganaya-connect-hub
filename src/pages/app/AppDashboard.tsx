import { subDays, startOfDay } from 'date-fns';
import { TrendingUp, Users, UserCheck, BarChart3, MessageCircle, Copy, ArrowUp, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth';
import { useFirebaseLeads } from '@/hooks/useFirebaseLeads';
import { toast } from 'sonner';
import { getReferralUrl } from '@/lib/siteUrl';

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  NUEVO: { bg: 'bg-primary/15', text: 'text-primary' },
  CONTACTADO: { bg: 'bg-gold/15', text: 'text-gold' },
  APROBADO: { bg: 'bg-blue-500/15', text: 'text-blue-400' },
  ONBOARDED: { bg: 'bg-primary/15', text: 'text-primary' },
  RECHAZADO: { bg: 'bg-red-500/15', text: 'text-red-400' },
  DESCARTADO: { bg: 'bg-muted', text: 'text-muted-foreground' },
};

const timeAgo = (date: Date): string => {
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return 'hace un momento';
  if (diff < 3600) return `hace ${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `hace ${Math.floor(diff / 3600)}h`;
  if (diff < 604800) return `hace ${Math.floor(diff / 86400)}d`;
  return `hace ${Math.floor(diff / 604800)}sem`;
};

const AppDashboard = () => {
  const { userData, isAdmin, isLineLeader, agentId } = useFirebaseAuth();

  const { data: leads, isLoading } = useFirebaseLeads({
    agentId,
    lineLeaderId: isLineLeader ? agentId : null,
    isAdmin,
    refCode: userData?.refCode || null,
  });

  const stats = (() => {
    if (!leads) return null;

    const today = startOfDay(new Date());
    const sevenDaysAgo = subDays(today, 7);
    const yesterday = subDays(today, 1);

    const todayLeads = leads.filter(l => new Date(l.createdAt) >= today).length;
    const yesterdayLeads = leads.filter(l => {
      const d = new Date(l.createdAt);
      return d >= yesterday && d < today;
    }).length;
    const weekLeads = leads.filter(l => new Date(l.createdAt) >= sevenDaysAgo).length;

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
      yesterdayLeads,
      weekLeads,
      totalLeads: leads.length,
      statusCounts,
      topCountries,
    };
  })();

  const copyLink = () => {
    if (userData?.refCode) {
      navigator.clipboard.writeText(getReferralUrl(userData.refCode));
      toast.success('Link copiado');
    }
  };

  const recentLeads = leads?.slice(0, 5) || [];

  const conversionRate = stats?.totalLeads
    ? Math.round((stats.statusCounts.onboarded / stats.totalLeads) * 100)
    : 0;

  const todayDelta = stats
    ? stats.todayLeads - stats.yesterdayLeads
    : 0;

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Buenos días';
    if (h < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  const funnelSteps = [
    { label: 'Nuevos', value: stats?.statusCounts.nuevo || 0, color: 'bg-primary' },
    { label: 'Contactados', value: stats?.statusCounts.contactado || 0, color: 'bg-gold' },
    { label: 'Aprobados', value: stats?.statusCounts.aprobado || 0, color: 'bg-blue-500' },
    { label: 'Onboarded', value: stats?.statusCounts.onboarded || 0, color: 'bg-primary' },
  ];

  const maxFunnel = Math.max(...funnelSteps.map(s => s.value), 1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground mb-0.5">{greeting()},</p>
          <h1 className="font-display text-2xl md:text-3xl font-bold">
            {userData?.name?.split(' ')[0] || 'Agente'} 👋
          </h1>
        </div>
        {userData?.refCode && (
          <Button onClick={copyLink} variant="outline" className="gap-2 md:self-start">
            <Copy className="w-4 h-4" />
            <span className="font-mono text-sm text-primary">{userData.refCode}</span>
          </Button>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Today */}
        <Card className="glass-card col-span-1">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Zap className="w-4 h-4 text-primary" />
              </div>
              {todayDelta !== 0 && (
                <span className={`text-xs font-medium flex items-center gap-0.5 ${todayDelta > 0 ? 'text-primary' : 'text-destructive'}`}>
                  <ArrowUp className={`w-3 h-3 ${todayDelta < 0 ? 'rotate-180' : ''}`} />
                  {Math.abs(todayDelta)}
                </span>
              )}
            </div>
            <p className="font-display text-3xl font-bold text-primary">
              {isLoading ? '–' : stats?.todayLeads || 0}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">Leads hoy</p>
          </CardContent>
        </Card>

        {/* 7 days */}
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center mb-2">
              <TrendingUp className="w-4 h-4 text-gold" />
            </div>
            <p className="font-display text-3xl font-bold text-gold">
              {isLoading ? '–' : stats?.weekLeads || 0}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">Últimos 7 días</p>
          </CardContent>
        </Card>

        {/* Total */}
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center mb-2">
              <Users className="w-4 h-4 text-muted-foreground" />
            </div>
            <p className="font-display text-3xl font-bold">
              {isLoading ? '–' : stats?.totalLeads || 0}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">Total leads</p>
          </CardContent>
        </Card>

        {/* Conversion */}
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center mb-2">
              <UserCheck className="w-4 h-4 text-accent" />
            </div>
            <p className="font-display text-3xl font-bold text-accent">
              {isLoading ? '–' : `${conversionRate}%`}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">Conversión</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Funnel */}
        <Card className="glass-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" />
              Embudo de conversión
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {funnelSteps.map((item) => (
              <div key={item.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="font-semibold">{item.value}</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full ${item.color} rounded-full transition-all duration-700`}
                    style={{ width: `${(item.value / maxFunnel) * 100}%` }}
                  />
                </div>
              </div>
            ))}
            {(!stats || stats.totalLeads === 0) && (
              <p className="text-xs text-muted-foreground text-center py-4">
                Aún no hay datos
              </p>
            )}
          </CardContent>
        </Card>

        {/* Top Countries */}
        <Card className="glass-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Top países</CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.topCountries && stats.topCountries.length > 0 ? (
              <div className="space-y-2.5">
                {stats.topCountries.map(([country, count], i) => (
                  <div key={country} className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground w-4">#{i + 1}</span>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium">{country}</span>
                        <Badge variant="outline" className="text-xs h-5">{count}</Badge>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary/60 rounded-full"
                          style={{ width: `${(count / (stats.totalLeads || 1)) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8 text-sm">
                Sin datos aún
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="glass-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            Actividad reciente
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentLeads.length > 0 ? (
            <div className="space-y-3">
              {recentLeads.map((lead) => {
                const statusCfg = STATUS_COLORS[lead.status] || { bg: 'bg-muted', text: 'text-muted-foreground' };
                return (
                  <div key={lead.id} className="flex items-center gap-3 py-1">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-primary">
                        {lead.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{lead.name}</p>
                      <p className="text-xs text-muted-foreground">{lead.country} · {timeAgo(lead.createdAt)}</p>
                    </div>
                    <Badge variant="outline" className={`text-xs shrink-0 ${statusCfg.bg} ${statusCfg.text} border-transparent`}>
                      {lead.status.toLowerCase()}
                    </Badge>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">Sin actividad reciente</p>
          )}
        </CardContent>
      </Card>

      {/* Message Templates */}
      <Card className="glass-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-primary" />
            Plantillas de mensajes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-2">
            {[
              { label: '👋 Bienvenida', text: '¡Hola! Soy tu cajero personal en Ganaya.bet. ¿En qué puedo ayudarte hoy? 🎰' },
              { label: '💸 Instrucciones USDT', text: 'Para recargar: 1) Abre Binance 2) Envía USDT a esta dirección: [TU_WALLET] 3) Confirma y tu saldo estará listo en minutos.' },
              { label: '🔔 Seguimiento', text: '¡Hola! ¿Pudiste completar tu recarga? Estoy aquí para ayudarte con cualquier duda.' },
              { label: '✅ Cierre', text: '¡Listo! Tu retiro ha sido procesado. Gracias por confiar en Ganaya.bet. ¡Que tengas suerte! 🍀' },
            ].map((template, i) => (
              <button
                key={i}
                className="text-left p-3 rounded-lg bg-muted/40 hover:bg-muted/80 border border-border/50 hover:border-primary/30 transition-all group"
                onClick={() => {
                  navigator.clipboard.writeText(template.text);
                  toast.success('Mensaje copiado');
                }}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-medium text-xs">{template.label}</span>
                  <Copy className="w-3 h-3 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{template.text}</p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AppDashboard;
