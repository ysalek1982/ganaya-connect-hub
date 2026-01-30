import { useQuery } from '@tanstack/react-query';
import { collection, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Users, UserCheck, TrendingUp, Globe } from 'lucide-react';
import { startOfDay, subDays } from 'date-fns';

const AdminDashboard = () => {
  const today = startOfDay(new Date());
  const weekAgo = subDays(today, 7);

  const { data: stats } = useQuery({
    queryKey: ['admin-dashboard-stats'],
    queryFn: async () => {
      const leadsRef = collection(db, 'leads');
      const agentsRef = collection(db, 'agents');

      // Fetch all leads
      const leadsSnapshot = await getDocs(leadsRef);
      const allLeads = leadsSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          tier: data.tier as string | null,
          country: data.country as string | undefined,
          createdAt: data.createdAt?.toDate?.() || new Date(),
        };
      });

      // Leads today
      const leadsToday = allLeads.filter(lead => 
        lead.createdAt >= today
      ).length;

      // Leads this week
      const leadsWeek = allLeads.filter(lead => 
        lead.createdAt >= weekAgo
      ).length;

      // High potential agent leads (PROMETEDOR tier)
      const agentesAltos = allLeads.filter(lead => 
        lead.tier === 'PROMETEDOR'
      ).length;

      // Active agents count
      const activeAgentsQuery = query(agentsRef, where('status', '==', 'active'));
      const activeAgentsSnapshot = await getDocs(activeAgentsQuery);
      const totalAgentes = activeAgentsSnapshot.size;

      // Country breakdown
      const countryStats = allLeads.reduce((acc, lead) => {
        const country = lead.country || 'Desconocido';
        acc[country] = (acc[country] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return {
        leadsToday,
        leadsWeek,
        agentesAltos,
        totalAgentes,
        countryStats,
      };
    },
  });

  const statCards = [
    { label: 'Postulaciones hoy', value: stats?.leadsToday || 0, icon: Users, color: 'text-primary' },
    { label: 'Postulaciones 7 días', value: stats?.leadsWeek || 0, icon: TrendingUp, color: 'text-gold' },
    { label: 'Prospectos prometedores', value: stats?.agentesAltos || 0, icon: UserCheck, color: 'text-accent' },
    { label: 'Agentes activos', value: stats?.totalAgentes || 0, icon: Users, color: 'text-primary' },
  ];

  const countryFlags: Record<string, string> = {
    'Paraguay': '🇵🇾',
    'Argentina': '🇦🇷',
    'Colombia': '🇨🇴',
    'Ecuador': '🇪🇨',
    'Chile': '🇨🇱',
    'México': '🇲🇽',
    'USA': '🇺🇸',
    'España': '🇪🇸',
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Resumen del reclutamiento Ganaya.bet</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <div key={i} className="glass-card rounded-xl p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                <p className={`font-display text-3xl font-bold ${stat.color}`}>
                  {stat.value}
                </p>
              </div>
              <stat.icon className={`w-8 h-8 ${stat.color} opacity-50`} />
            </div>
          </div>
        ))}
      </div>

      {/* Country breakdown */}
      <div className="glass-card rounded-xl p-6">
        <div className="flex items-center gap-2 mb-6">
          <Globe className="w-5 h-5 text-primary" />
          <h2 className="font-display text-lg font-semibold">Postulaciones por país</h2>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Object.entries(stats?.countryStats || {}).map(([country, count]) => (
            <div key={country} className="bg-card rounded-lg p-4 text-center">
              <span className="text-2xl mb-2 block">{countryFlags[country] || '🌎'}</span>
              <p className="font-semibold">{country}</p>
              <p className="text-2xl font-display text-primary">{count as number}</p>
            </div>
          ))}
          {Object.keys(stats?.countryStats || {}).length === 0 && (
            <p className="text-muted-foreground col-span-full text-center py-8">
              No hay postulaciones registradas aún
            </p>
          )}
        </div>
      </div>

      {/* Quick actions info */}
      <div className="glass-card rounded-xl p-6">
        <h2 className="font-display text-lg font-semibold mb-4">Acciones rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
          <p>• Ve a <strong>Postulaciones</strong> para gestionar candidatos a agente</p>
          <p>• Ve a <strong>Agentes</strong> para administrar tu red activa</p>
          <p>• Ve a <strong>Asignación</strong> para distribuir postulaciones por round-robin</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
