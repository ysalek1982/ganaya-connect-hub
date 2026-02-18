import { useQuery } from '@tanstack/react-query';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Users, UserCheck, TrendingUp, Globe, BarChart3, Zap, ArrowUp, Clock } from 'lucide-react';
import { startOfDay, subDays, format, eachDayOfInterval } from 'date-fns';
import { es } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  NUEVO: { bg: 'bg-primary/15', text: 'text-primary' },
  CONTACTADO: { bg: 'bg-gold/15', text: 'text-gold' },
  APROBADO: { bg: 'bg-blue-500/15', text: 'text-blue-400' },
  ONBOARDED: { bg: 'bg-primary/15', text: 'text-primary' },
  RECHAZADO: { bg: 'bg-red-500/15', text: 'text-red-400' },
  DESCARTADO: { bg: 'bg-muted', text: 'text-muted-foreground' },
};

const timeAgo = (date: Date): string => {
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 60) return 'ahora';
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
};

const AdminDashboard = () => {
  const today = startOfDay(new Date());
  const weekAgo = subDays(today, 7);
  const twoWeeksAgo = subDays(today, 14);

  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-dashboard-stats'],
    queryFn: async () => {
      const leadsRef = collection(db, 'leads');
      const usersRef = collection(db, 'users');

      const leadsSnapshot = await getDocs(leadsRef);
      const allLeads = leadsSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name as string || '',
          tier: data.tier as string | null,
          country: data.country as string || 'Desconocido',
          status: data.status as string || 'NUEVO',
          createdAt: data.createdAt?.toDate?.() || new Date(),
        };
      });

      // Sort by date desc
      allLeads.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      const leadsToday = allLeads.filter(l => l.createdAt >= today).length;
      const leadsWeek = allLeads.filter(l => l.createdAt >= weekAgo).length;
      const leadsPrevWeek = allLeads.filter(l => l.createdAt >= twoWeeksAgo && l.createdAt < weekAgo).length;
      const weekDelta = leadsWeek - leadsPrevWeek;

      // Status counts
      const statusCounts: Record<string, number> = {};
      allLeads.forEach(l => {
        statusCounts[l.status] = (statusCounts[l.status] || 0) + 1;
      });

      const onboarded = statusCounts['ONBOARDED'] || 0;
      const conversionRate = allLeads.length > 0 ? Math.round((onboarded / allLeads.length) * 100) : 0;

      // Active agents
      const usersSnapshot = await getDocs(query(usersRef, where('isActive', '==', true)));
      const totalAgentes = usersSnapshot.size;

      // Country breakdown
      const countryStats: Record<string, number> = {};
      allLeads.forEach(l => {
        countryStats[l.country] = (countryStats[l.country] || 0) + 1;
      });

      // Weekly chart data (last 7 days)
      const days = eachDayOfInterval({ start: weekAgo, end: today });
      const weeklyChart = days.map(day => {
        const dayStart = startOfDay(day);
        const dayEnd = new Date(dayStart.getTime() + 86400000);
        const count = allLeads.filter(l => l.createdAt >= dayStart && l.createdAt < dayEnd).length;
        return {
          day: format(day, 'EEE', { locale: es }),
          leads: count,
        };
      });

      // Recent 8 leads
      const recentLeads = allLeads.slice(0, 8);

      return {
        leadsToday,
        leadsWeek,
        weekDelta,
        totalLeads: allLeads.length,
        conversionRate,
        totalAgentes,
        statusCounts,
        countryStats,
        weeklyChart,
        recentLeads,
      };
    },
  });

  const countryFlags: Record<string, string> = {
    Paraguay: '🇵🇾', Argentina: '🇦🇷', Colombia: '🇨🇴', Ecuador: '🇪🇨',
    Chile: '🇨🇱', México: '🇲🇽', USA: '🇺🇸', España: '🇪🇸',
  };

  const statCards = [
    { label: 'Hoy', value: stats?.leadsToday || 0, icon: Zap, color: 'text-primary', bgColor: 'bg-primary/10' },
    {
      label: 'Últimos 7 días', value: stats?.leadsWeek || 0, icon: TrendingUp, color: 'text-gold', bgColor: 'bg-gold/10',
      delta: stats?.weekDelta,
    },
    { label: 'Conversión', value: `${stats?.conversionRate || 0}%`, icon: UserCheck, color: 'text-accent', bgColor: 'bg-accent/10' },
    { label: 'Agentes activos', value: stats?.totalAgentes || 0, icon: Users, color: 'text-primary', bgColor: 'bg-primary/10' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-bold mb-1">Dashboard</h1>
        <p className="text-muted-foreground text-sm">Resumen del reclutamiento Ganaya.bet</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statCards.map((stat, i) => (
          <Card key={i} className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div className={`w-9 h-9 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                  <stat.icon className={`w-4.5 h-4.5 ${stat.color}`} />
                </div>
                {stat.delta !== undefined && stat.delta !== 0 && (
                  <span className={`text-xs font-medium flex items-center gap-0.5 ${stat.delta > 0 ? 'text-primary' : 'text-destructive'}`}>
                    <ArrowUp className={`w-3 h-3 ${stat.delta < 0 ? 'rotate-180' : ''}`} />
                    {Math.abs(stat.delta)}
                  </span>
                )}
              </div>
              <p className={`font-display text-3xl font-bold ${stat.color}`}>
                {isLoading ? '–' : stat.value}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Weekly Chart */}
        <Card className="glass-card lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" />
              Postulaciones últimos 7 días
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.weeklyChart && stats.weeklyChart.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={stats.weeklyChart} barSize={28}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" width={30} />
                  <Tooltip
                    contentStyle={{
                      background: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '13px',
                    }}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Bar dataKey="leads" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-16">Sin datos</p>
            )}
          </CardContent>
        </Card>

        {/* Status Funnel */}
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Pipeline</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {['NUEVO', 'CONTACTADO', 'APROBADO', 'ONBOARDED', 'RECHAZADO', 'DESCARTADO'].map(status => {
              const count = stats?.statusCounts?.[status] || 0;
              const total = stats?.totalLeads || 1;
              const cfg = STATUS_COLORS[status] || { bg: 'bg-muted', text: 'text-muted-foreground' };
              return (
                <div key={status}>
                  <div className="flex justify-between items-center text-sm mb-1">
                    <span className="text-muted-foreground capitalize">{status.toLowerCase()}</span>
                    <span className="font-semibold">{isLoading ? '–' : count}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${cfg.bg.replace('/15', '/60').replace('/20', '/60')}`}
                      style={{
                        width: `${Math.max((count / total) * 100, count > 0 ? 4 : 0)}%`,
                        backgroundColor: status === 'NUEVO' ? 'hsl(var(--primary))' :
                          status === 'CONTACTADO' ? 'hsl(var(--gold))' :
                          status === 'APROBADO' ? 'hsl(210 100% 60%)' :
                          status === 'ONBOARDED' ? 'hsl(var(--primary))' :
                          status === 'RECHAZADO' ? 'hsl(0 70% 55%)' :
                          'hsl(var(--muted-foreground))',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Recent Activity */}
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              Actividad reciente
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.recentLeads && stats.recentLeads.length > 0 ? (
              <div className="space-y-2.5">
                {stats.recentLeads.map((lead) => {
                  const cfg = STATUS_COLORS[lead.status] || { bg: 'bg-muted', text: 'text-muted-foreground' };
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
                      <Badge variant="outline" className={`text-[10px] shrink-0 ${cfg.bg} ${cfg.text} border-transparent`}>
                        {lead.status.toLowerCase()}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">Sin actividad</p>
            )}
          </CardContent>
        </Card>

        {/* Country breakdown */}
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Globe className="w-4 h-4 text-primary" />
              Postulaciones por país
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.countryStats && Object.keys(stats.countryStats).length > 0 ? (
              <div className="space-y-2.5">
                {Object.entries(stats.countryStats)
                  .sort((a, b) => (b[1] as number) - (a[1] as number))
                  .slice(0, 8)
                  .map(([country, count], i) => (
                    <div key={country} className="flex items-center gap-3">
                      <span className="text-lg w-7 text-center">{countryFlags[country] || '🌎'}</span>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium">{country}</span>
                          <Badge variant="outline" className="text-xs h-5">{count as number}</Badge>
                        </div>
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary/50 rounded-full"
                            style={{ width: `${((count as number) / (stats.totalLeads || 1)) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8 text-sm">Sin datos</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
