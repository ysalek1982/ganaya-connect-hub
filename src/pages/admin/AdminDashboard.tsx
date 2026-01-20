import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Users, UserCheck, TrendingUp, Globe } from 'lucide-react';
import { format, subDays, startOfDay } from 'date-fns';

const AdminDashboard = () => {
  const today = startOfDay(new Date());
  const weekAgo = subDays(today, 7);

  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const [leadsToday, leadsWeek, agentesAltos, totalAgentes, leadsByCountry] = await Promise.all([
        supabase
          .from('leads')
          .select('id', { count: 'exact', head: true })
          .gte('created_at', today.toISOString()),
        supabase
          .from('leads')
          .select('id', { count: 'exact', head: true })
          .gte('created_at', weekAgo.toISOString()),
        supabase
          .from('leads')
          .select('id', { count: 'exact', head: true })
          .eq('etiqueta', 'AGENTE_POTENCIAL_ALTO'),
        supabase
          .from('agentes')
          .select('id', { count: 'exact', head: true })
          .eq('estado', 'activo'),
        supabase
          .from('leads')
          .select('pais')
      ]);

      const countryStats = (leadsByCountry.data || []).reduce((acc, lead) => {
        acc[lead.pais] = (acc[lead.pais] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return {
        leadsToday: leadsToday.count || 0,
        leadsWeek: leadsWeek.count || 0,
        agentesAltos: agentesAltos.count || 0,
        totalAgentes: totalAgentes.count || 0,
        countryStats,
      };
    },
  });

  const statCards = [
    { label: 'Leads hoy', value: stats?.leadsToday || 0, icon: Users, color: 'text-primary' },
    { label: 'Leads 7 días', value: stats?.leadsWeek || 0, icon: TrendingUp, color: 'text-gold' },
    { label: 'Agentes potenciales altos', value: stats?.agentesAltos || 0, icon: UserCheck, color: 'text-accent' },
    { label: 'Agentes activos', value: stats?.totalAgentes || 0, icon: Users, color: 'text-primary' },
  ];

  const countryFlags: Record<string, string> = {
    'Paraguay': '🇵🇾',
    'Argentina': '🇦🇷',
    'Colombia': '🇨🇴',
    'Ecuador': '🇪🇨',
    'USA': '🇺🇸',
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Resumen del sistema Ganaya.bet</p>
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
          <h2 className="font-display text-lg font-semibold">Leads por país</h2>
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
              No hay leads registrados aún
            </p>
          )}
        </div>
      </div>

      {/* Quick actions info */}
      <div className="glass-card rounded-xl p-6">
        <h2 className="font-display text-lg font-semibold mb-4">Acciones rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
          <p>• Ve a <strong>Leads Clientes</strong> para gestionar apostadores</p>
          <p>• Ve a <strong>Leads Agentes</strong> para evaluar postulantes</p>
          <p>• Ve a <strong>Asignación</strong> para auto-asignar por round-robin</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
