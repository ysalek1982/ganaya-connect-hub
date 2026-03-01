import { useQuery } from '@tanstack/react-query';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Users, UserCheck, TrendingUp, Globe, BarChart3, Zap, ArrowUp, Clock, Megaphone, Trophy } from 'lucide-react';
import { startOfDay, subDays, format, eachDayOfInterval } from 'date-fns';
import { es } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from 'recharts';

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  NUEVO: { bg: 'bg-primary/15', text: 'text-primary' },
  CONTACTADO: { bg: 'bg-gold/15', text: 'text-gold' },
  APROBADO: { bg: 'bg-blue-500/15', text: 'text-blue-400' },
  ONBOARDED: { bg: 'bg-primary/15', text: 'text-primary' },
  RECHAZADO: { bg: 'bg-red-500/15', text: 'text-red-400' },
  DESCARTADO: { bg: 'bg-muted', text: 'text-muted-foreground' },
};

const UTM_COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--gold))',
  'hsl(210 100% 60%)',
  'hsl(280 70% 60%)',
  'hsl(160 70% 50%)',
  'hsl(30 90% 55%)',
  'hsl(340 70% 55%)',
];

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
    staleTime: 60000, // Cache 60s to avoid redundant Firestore reads
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
          utmSource: (data.rawJson?.utm_source as string) || (data.utm_source as string) || null,
          utmMedium: (data.rawJson?.utm_medium as string) || (data.utm_medium as string) || null,
          refCode: data.refCode as string | null,
          assignedAgentId: data.assignedAgentId as string | null,
        };
      });

      allLeads.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      const leadsToday = allLeads.filter(l => l.createdAt >= today).length;
      const leadsWeek = allLeads.filter(l => l.createdAt >= weekAgo).length;
      const leadsPrevWeek = allLeads.filter(l => l.createdAt >= twoWeeksAgo && l.createdAt < weekAgo).length;
      const weekDelta = leadsWeek - leadsPrevWeek;

      const statusCounts: Record<string, number> = {};
      allLeads.forEach(l => {
        statusCounts[l.status] = (statusCounts[l.status] || 0) + 1;
      });

      const onboarded = statusCounts['ONBOARDED'] || 0;
      const conversionRate = allLeads.length > 0 ? Math.round((onboarded / allLeads.length) * 100) : 0;

      const usersSnapshot = await getDocs(query(usersRef, where('isActive', '==', true)));
      const activeUsers = usersSnapshot.docs.filter(doc => {
        const role = doc.data().role as string;
        return role === 'AGENT' || role === 'LINE_LEADER';
      });
      const totalAgentes = activeUsers.length;

      // Build agent map for leaderboard (only agents/line leaders)
      const agentMap: Record<string, string> = {};
      activeUsers.forEach(doc => {
        const data = doc.data();
        agentMap[doc.id] = (data.name as string) || (data.displayName as string) || doc.id;
      });

      const countryStats: Record<string, number> = {};
      allLeads.forEach(l => {
        countryStats[l.country] = (countryStats[l.country] || 0) + 1;
      });

      // Weekly chart data
      const days = eachDayOfInterval({ start: weekAgo, end: today });
      const weeklyChart = days.map(day => {
        const dayStart = startOfDay(day);
        const dayEnd = new Date(dayStart.getTime() + 86400000);
        const count = allLeads.filter(l => l.createdAt >= dayStart && l.createdAt < dayEnd).length;
        return { day: format(day, 'EEE', { locale: es }), leads: count };
      });

      // UTM source breakdown
      const utmSourceCounts: Record<string, number> = {};
      allLeads.forEach(l => {
        const src = l.utmSource || 'directo';
        utmSourceCounts[src] = (utmSourceCounts[src] || 0) + 1;
      });
      const utmSourceChart = Object.entries(utmSourceCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 7)
        .map(([name, value]) => ({ name, value }));

      // UTM medium breakdown
      const utmMediumCounts: Record<string, number> = {};
      allLeads.forEach(l => {
        const med = l.utmMedium || 'none';
        utmMediumCounts[med] = (utmMediumCounts[med] || 0) + 1;
      });
      const utmMediumChart = Object.entries(utmMediumCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, value]) => ({ name, value }));

      // Top recruiters leaderboard
      const recruiterCounts: Record<string, { total: number; onboarded: number }> = {};
      allLeads.forEach(l => {
        if (l.refCode) {
          if (!recruiterCounts[l.refCode]) recruiterCounts[l.refCode] = { total: 0, onboarded: 0 };
          recruiterCounts[l.refCode].total++;
          if (l.status === 'ONBOARDED') recruiterCounts[l.refCode].onboarded++;
        }
      });

      // Map refCodes to agent names
      const refCodeToAgent: Record<string, string> = {};
      usersSnapshot.docs.forEach(doc => {
        const data = doc.data();
        const rc = data.refCode as string;
        if (rc) refCodeToAgent[rc] = (data.name as string) || (data.displayName as string) || rc;
      });

      const topRecruiters = Object.entries(recruiterCounts)
        .sort((a, b) => b[1].total - a[1].total)
        .slice(0, 6)
        .map(([refCode, counts], i) => ({
          rank: i + 1,
          name: refCodeToAgent[refCode] || refCode,
          refCode,
          total: counts.total,
          onboarded: counts.onboarded,
        }));

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
        utmSourceChart,
        utmMediumChart,
        topRecruiters,
      };
    },
  });

  const countryFlags: Record<string, string> = {
    Paraguay: '🇵🇾', Argentina: '🇦🇷', Colombia: '🇨🇴', Ecuador: '🇪🇨',
    Chile: '🇨🇱', México: '🇲🇽', USA: '🇺🇸', España: '🇪🇸',
    Bolivia: '🇧🇴', Perú: '🇵🇪',
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

  const medalEmojis = ['🥇', '🥈', '🥉'];

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
                      className="h-full rounded-full transition-all duration-700"
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

      {/* UTM Metrics + Top Recruiters */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* UTM Source Pie */}
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-primary" />
              Fuentes de tráfico
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.utmSourceChart && stats.utmSourceChart.length > 0 ? (
              <div className="flex flex-col items-center">
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie
                      data={stats.utmSourceChart}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={75}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {stats.utmSourceChart.map((_, i) => (
                        <Cell key={i} fill={UTM_COLORS[i % UTM_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap gap-x-3 gap-y-1 justify-center mt-1">
                  {stats.utmSourceChart.map((entry, i) => (
                    <div key={entry.name} className="flex items-center gap-1.5 text-xs">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: UTM_COLORS[i % UTM_COLORS.length] }} />
                      <span className="text-muted-foreground">{entry.name}</span>
                      <span className="font-semibold">{entry.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-12">Sin datos UTM</p>
            )}
          </CardContent>
        </Card>

        {/* Top Recruiters Leaderboard */}
        <Card className="glass-card lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Trophy className="w-4 h-4 text-gold" />
              Top reclutadores
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.topRecruiters && stats.topRecruiters.length > 0 ? (
              <div className="space-y-2">
                {stats.topRecruiters.map((r) => {
                  const maxTotal = stats.topRecruiters[0]?.total || 1;
                  return (
                    <div key={r.refCode} className="flex items-center gap-3">
                      <span className="text-lg w-7 text-center shrink-0">
                        {r.rank <= 3 ? medalEmojis[r.rank - 1] : <span className="text-xs text-muted-foreground font-mono">#{r.rank}</span>}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium truncate">{r.name}</span>
                          <div className="flex items-center gap-2 shrink-0">
                            <Badge variant="outline" className="text-xs h-5">{r.total} leads</Badge>
                            {r.onboarded > 0 && (
                              <Badge variant="outline" className="text-xs h-5 bg-primary/10 text-primary border-primary/20">
                                {r.onboarded} onboard
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gold/60 rounded-full transition-all duration-700"
                            style={{ width: `${(r.total / maxTotal) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-12">Sin referidos aún</p>
            )}
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
