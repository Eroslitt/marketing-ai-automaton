import { useEffect, useState } from "react";
import { KPICard } from "@/components/dashboard/KPICard";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { Card } from "@/components/ui/card";
import { 
  DollarSign, 
  Target, 
  Users, 
  TrendingUp,
  Activity,
  MessageSquare
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const Dashboard = () => {
  const { toast } = useToast();
  const [stats, setStats] = useState({
    totalSpent: 47280,
    totalLeads: 1234,
    activeCampaigns: 3,
    avgROI: 4.8
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const { data: campaigns } = await supabase
        .from('campaigns')
        .select('budget_spent')
        .eq('status', 'active');

      const { data: leads } = await supabase
        .from('leads')
        .select('id');

      if (campaigns) {
        const totalSpent = campaigns.reduce((acc, c) => acc + (c.budget_spent || 0), 0);
        setStats(prev => ({
          ...prev,
          totalSpent: totalSpent || prev.totalSpent,
          totalLeads: leads?.length || prev.totalLeads,
          activeCampaigns: campaigns.length || prev.activeCampaigns
        }));
      }
    } catch (error: any) {
      console.error("Erro ao carregar dados:", error);
    }
  };
  const kpis = [
    {
      title: "Receita Gerada",
      value: `R$ ${stats.totalSpent.toLocaleString('pt-BR')}`,
      change: 12.5,
      icon: DollarSign
    },
    {
      title: "Leads Qualificados",
      value: stats.totalLeads.toString(),
      change: 8.2,
      icon: Users
    },
    {
      title: "Taxa de Conversão",
      value: "3.2%",
      change: -2.1,
      icon: Target
    },
    {
      title: "ROI Médio",
      value: `${stats.avgROI.toFixed(1)}x`,
      change: 15.3,
      icon: TrendingUp
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Visão geral da sua agência automatizada por IA</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi) => (
          <KPICard key={kpi.title} {...kpi} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-1">
          <QuickActions />
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">Atividade Recente</h3>
            </div>
            
            <div className="space-y-4">
              {[
                {
                  action: "Nova campanha criada",
                  details: "Campanha 'Lançamento Produto X' foi publicada no Meta Ads",
                  time: "há 2 minutos",
                  type: "campaign"
                },
                {
                  action: "Lead qualificado",
                  details: "João Silva respondeu no WhatsApp e foi encaminhado para closer",
                  time: "há 15 minutos",
                  type: "lead"
                },
                {
                  action: "Criativo aprovado",
                  details: "5 variações de imagem foram geradas e aprovadas automaticamente",
                  time: "há 1 hora",
                  type: "creative"
                },
                {
                  action: "Otimização aplicada",
                  details: "Orçamento redistribuído entre anúncios com melhor performance",
                  time: "há 2 horas",
                  type: "optimization"
                }
              ].map((item, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{item.action}</p>
                    <p className="text-xs text-muted-foreground mt-1">{item.details}</p>
                    <p className="text-xs text-muted-foreground mt-1">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Current Campaigns */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Campanhas Ativas</h3>
          </div>
          <a href="/campaigns" className="text-sm text-primary hover:underline">
            Ver todas
          </a>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              name: "Lançamento Produto X",
              status: "Ativa",
              spent: "R$ 2.450",
              leads: 89,
              cpl: "R$ 27,53"
            },
            {
              name: "Black Friday 2024",
              status: "Otimizando",
              spent: "R$ 5.680",
              leads: 156,
              cpl: "R$ 36,41"
            },
            {
              name: "Captação B2B Tech",
              status: "Pausada",
              spent: "R$ 1.230",
              leads: 34,
              cpl: "R$ 36,18"
            }
          ].map((campaign, index) => (
            <div key={index} className="p-4 border border-border rounded-lg bg-card hover:shadow-sm transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-foreground text-sm">{campaign.name}</h4>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  campaign.status === 'Ativa' ? 'bg-growth/10 text-growth' :
                  campaign.status === 'Otimizando' ? 'bg-warning/10 text-warning' :
                  'bg-muted text-muted-foreground'
                }`}>
                  {campaign.status}
                </span>
              </div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Gasto:</span>
                  <span className="font-medium text-foreground">{campaign.spent}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Leads:</span>
                  <span className="font-medium text-foreground">{campaign.leads}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">CPL:</span>
                  <span className="font-medium text-foreground">{campaign.cpl}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};