import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { KPICard } from "@/components/dashboard/KPICard";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { 
  DollarSign, 
  Target, 
  Users, 
  TrendingUp,
  Activity
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalSpent: 0,
    totalLeads: 0,
    activeCampaigns: 0,
    avgROI: 0
  });
  const [activities, setActivities] = useState<any[]>([]);
  const [recentCampaigns, setRecentCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    try {
      const [campaignsRes, leadsRes, activitiesRes, metricsRes] = await Promise.all([
        supabase.from('campaigns').select('*').eq('user_id', user!.id).order('created_at', { ascending: false }),
        supabase.from('leads').select('id, status').eq('user_id', user!.id),
        supabase.from('activity_log').select('*').eq('user_id', user!.id).order('created_at', { ascending: false }).limit(10),
        supabase.from('sales_metrics').select('*').eq('user_id', user!.id).order('date', { ascending: false }).limit(30),
      ]);

      const campaigns = campaignsRes.data || [];
      const leads = leadsRes.data || [];
      const metrics = metricsRes.data || [];
      
      const totalSpent = campaigns.reduce((acc, c) => acc + (Number(c.budget_spent) || 0), 0);
      const totalRevenue = metrics.reduce((acc, m) => acc + (Number(m.revenue) || 0), 0);
      const activeCampaigns = campaigns.filter(c => c.status === 'active').length;

      setStats({
        totalSpent,
        totalLeads: leads.length,
        activeCampaigns,
        avgROI: totalSpent > 0 ? Number((totalRevenue / totalSpent).toFixed(1)) : 0
      });

      setActivities(activitiesRes.data || []);
      setRecentCampaigns(campaigns.slice(0, 3));
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  const getTimeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "agora";
    if (mins < 60) return `há ${mins} min`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `há ${hours}h`;
    return `há ${Math.floor(hours / 24)}d`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-primary/10 text-primary';
      case 'paused': return 'bg-muted text-muted-foreground';
      default: return 'bg-amber-500/10 text-amber-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Ativa';
      case 'paused': return 'Pausada';
      case 'draft': return 'Rascunho';
      default: return status;
    }
  };

  const kpis = [
    { title: "Receita Gerada", value: `R$ ${stats.totalSpent.toLocaleString('pt-BR')}`, change: 12.5, icon: DollarSign },
    { title: "Leads Qualificados", value: stats.totalLeads.toString(), change: 8.2, icon: Users },
    { title: "Campanhas Ativas", value: stats.activeCampaigns.toString(), change: 0, icon: Target },
    { title: "ROI Médio", value: `${stats.avgROI.toFixed(1)}x`, change: 15.3, icon: TrendingUp }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Visão geral da sua agência automatizada por IA</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi) => (
          <KPICard key={kpi.title} {...kpi} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <QuickActions />
        </div>

        <div className="lg:col-span-2">
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">Atividade Recente</h3>
            </div>
            
            <div className="space-y-4">
              {activities.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Nenhuma atividade registrada ainda. Comece criando uma campanha ou adicionando leads.
                </p>
              ) : (
                activities.map((item) => (
                  <div key={item.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{item.action}</p>
                      <p className="text-xs text-muted-foreground mt-1">{item.details}</p>
                      <p className="text-xs text-muted-foreground mt-1">{getTimeAgo(item.created_at)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Campanhas Recentes</h3>
          </div>
          <Link to="/campaigns" className="text-sm text-primary hover:underline">Ver todas</Link>
        </div>
        
        {recentCampaigns.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            Nenhuma campanha criada. <Link to="/campaigns/new" className="text-primary hover:underline">Criar primeira campanha</Link>
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentCampaigns.map((campaign) => (
              <Link to="/campaigns" key={campaign.id} className="block">
                <div className="p-4 border border-border rounded-lg bg-card hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-foreground text-sm truncate">{campaign.name}</h4>
                    <Badge className={getStatusColor(campaign.status)}>{getStatusText(campaign.status)}</Badge>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Orçamento:</span>
                      <span className="font-medium text-foreground">R$ {Number(campaign.budget_total || 0).toLocaleString('pt-BR')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Gasto:</span>
                      <span className="font-medium text-foreground">R$ {Number(campaign.budget_spent || 0).toLocaleString('pt-BR')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Objetivo:</span>
                      <span className="font-medium text-foreground">{campaign.objective || '-'}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
