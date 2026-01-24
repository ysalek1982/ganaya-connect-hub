import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, subDays, startOfDay } from 'date-fns';
import { TrendingUp, Users, UserCheck, BarChart3, MessageCircle, Copy } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useUserRole } from '@/hooks/useUserRole';
import { toast } from 'sonner';

const AppDashboard = () => {
  const { agentId, isAdmin, isLineLeader } = useUserRole();

  const { data: stats } = useQuery({
    queryKey: ['agent-dashboard-stats', agentId],
    queryFn: async () => {
      if (!agentId && !isAdmin) return null;

      const today = startOfDay(new Date());
      const sevenDaysAgo = subDays(today, 7);

      let query = supabase.from('leads').select('*');
      
      if (!isAdmin) {
        query = query.eq('asignado_agente_id', agentId);
      }

      const { data: allLeads } = await query;
      
      const todayLeads = allLeads?.filter(l => 
        new Date(l.created_at) >= today
      ).length || 0;

      const weekLeads = allLeads?.filter(l => 
        new Date(l.created_at) >= sevenDaysAgo
      ).length || 0;

      const statusCounts = {
        nuevo: allLeads?.filter(l => l.estado === 'nuevo').length || 0,
        contactado: allLeads?.filter(l => l.estado === 'contactado').length || 0,
        asignado: allLeads?.filter(l => l.estado === 'asignado').length || 0,
        cerrado: allLeads?.filter(l => l.estado === 'cerrado').length || 0,
      };

      const countryCounts: Record<string, number> = {};
      allLeads?.forEach(l => {
        countryCounts[l.pais] = (countryCounts[l.pais] || 0) + 1;
      });

      const topCountries = Object.entries(countryCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

      return {
        todayLeads,
        weekLeads,
        totalLeads: allLeads?.length || 0,
        statusCounts,
        topCountries,
        recentLeads: allLeads?.slice(0, 5) || [],
      };
    },
    enabled: !!agentId || isAdmin,
  });

  const { data: agentInfo } = useQuery({
    queryKey: ['agent-info', agentId],
    queryFn: async () => {
      if (!agentId) return null;
      const { data } = await supabase
        .from('agentes')
        .select('nombre, ref_code, pais')
        .eq('id', agentId)
        .single();
      return data;
    },
    enabled: !!agentId,
  });

  const copyLink = () => {
    if (agentInfo?.ref_code) {
      const link = `${window.location.origin}/?ref=${agentInfo.ref_code}`;
      navigator.clipboard.writeText(link);
      toast.success('Link copiado');
    }
  };

  const conversionRate = stats?.totalLeads 
    ? Math.round((stats.statusCounts.cerrado / stats.totalLeads) * 100) 
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            {agentInfo?.nombre ? `Bienvenido, ${agentInfo.nombre}` : 'Resumen de tu actividad'}
          </p>
        </div>
        {agentInfo?.ref_code && (
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
              {stats?.todayLeads || 0}
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
              {stats?.weekLeads || 0}
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
              {stats?.totalLeads || 0}
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
              { label: 'Asignados', value: stats?.statusCounts.asignado || 0, color: 'bg-accent' },
              { label: 'Cerrados', value: stats?.statusCounts.cerrado || 0, color: 'bg-muted' },
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
