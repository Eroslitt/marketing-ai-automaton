import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Target,
  Clock,
  AlertTriangle,
  Download,
  Calendar,
  Filter,
  Eye,
  MousePointer,
  Heart,
  MessageSquare,
  ShoppingCart,
  UserCheck,
  Zap,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";

export const Analytics = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("30d");
  const [selectedCampaign, setSelectedCampaign] = useState("all");

  // Mock data - simulando dados reais
  const kpis = [
    {
      title: "ROI Total",
      value: "485%",
      change: 23.5,
      icon: TrendingUp,
      description: "Retorno sobre investimento",
      trend: "up"
    },
    {
      title: "Receita Gerada", 
      value: "R$ 127.450",
      change: 18.2,
      icon: DollarSign,
      description: "Receita atribuída ao marketing",
      trend: "up"
    },
    {
      title: "CAC Médio",
      value: "R$ 89,50",
      change: -12.3,
      icon: Target,
      description: "Custo de aquisição por cliente",
      trend: "down"
    },
    {
      title: "LTV/CAC Ratio",
      value: "4.2x",
      change: 15.8,
      icon: Users,
      description: "Proporção lifetime value vs CAC",
      trend: "up"
    }
  ];

  const campaigns = [
    {
      id: 1,
      name: "Black Friday 2024",
      status: "active",
      spent: 15480,
      revenue: 89250,
      roas: 5.8,
      ctr: 3.2,
      cpm: 12.50,
      conversions: 156,
      cpa: 99.23
    },
    {
      id: 2, 
      name: "Lançamento Produto X",
      status: "completed",
      spent: 8920,
      revenue: 34780,
      roas: 3.9,
      ctr: 2.8,
      cpm: 18.90,
      conversions: 89,
      cpa: 100.22
    },
    {
      id: 3,
      name: "Captação B2B Tech",
      status: "optimizing", 
      spent: 12350,
      revenue: 67890,
      roas: 5.5,
      ctr: 4.1,
      cpm: 22.80,
      conversions: 203,
      cpa: 60.84
    }
  ];

  const insights = [
    {
      type: "opportunity",
      title: "Oportunidade de Otimização",
      description: "Campanha 'Black Friday' tem CTR 40% acima da média do setor. Considere aumentar o orçamento.",
      action: "Aumentar orçamento em 25%",
      impact: "+R$ 12.500 receita estimada",
      priority: "high"
    },
    { 
      type: "warning",
      title: "Performance em Queda",
      description: "CPM da campanha B2B subiu 18% nos últimos 7 dias. Possível fadiga de criativo.",
      action: "Testar novos criativos",
      impact: "Reduzir CPM em ~15%",
      priority: "medium"
    },
    {
      type: "success",
      title: "Meta Atingida",
      description: "ROI mensal ultrapassou a meta de 400%. Excelente performance geral.",
      action: "Escalar estratégias vencedoras",
      impact: "Manter crescimento sustentável",
      priority: "low"
    }
  ];

  const funnelData = [
    { stage: "Impressões", value: 2450000, percentage: 100, change: 12.5 },
    { stage: "Cliques", value: 73500, percentage: 3.0, change: 8.2 },
    { stage: "Visualizações LP", value: 65200, percentage: 2.7, change: 5.8 },
    { stage: "Leads", value: 4580, percentage: 0.19, change: 15.3 },
    { stage: "Oportunidades", value: 1374, percentage: 0.056, change: 18.9 },
    { stage: "Vendas", value: 312, percentage: 0.013, change: 22.1 }
  ];

  const channelPerformance = [
    { 
      channel: "Meta Ads", 
      spent: 18500, 
      revenue: 89200, 
      roas: 4.8, 
      share: 45,
      trend: "up"
    },
    {
      channel: "Google Ads",
      spent: 12300,
      revenue: 52800,
      roas: 4.3,
      share: 32,
      trend: "stable"
    },
    {
      channel: "TikTok Ads", 
      spent: 6200,
      revenue: 18900,
      roas: 3.0,
      share: 15,
      trend: "up"
    },
    {
      channel: "LinkedIn Ads",
      spent: 3800,
      revenue: 12400,
      roas: 3.3,
      share: 8,
      trend: "down"
    }
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-growth/10 text-growth';
      case 'completed':
        return 'bg-blue-500/10 text-blue-500';
      case 'optimizing':
        return 'bg-warning/10 text-warning';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'medium':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'low':
        return 'bg-growth/10 text-growth border-growth/20';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Analytics & Insights</h1>
          <p className="text-muted-foreground">Análise avançada de performance e insights automáticos</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Últimos 7 dias</SelectItem>
              <SelectItem value="30d">Últimos 30 dias</SelectItem>
              <SelectItem value="90d">Últimos 90 dias</SelectItem>
              <SelectItem value="1y">Último ano</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Exportar
          </Button>
        </div>
      </div>

      {/* KPIs Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          const isPositive = kpi.change > 0;
          
          return (
            <Card key={kpi.title} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Icon className="w-8 h-8 text-primary" />
                <div className={`flex items-center gap-1 text-sm font-medium ${
                  isPositive ? 'text-growth' : 'text-destructive'
                }`}>
                  {isPositive ? (
                    <ArrowUpRight className="w-4 h-4" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4" />
                  )}
                  {Math.abs(kpi.change)}%
                </div>
              </div>
              <div>
                <p className="text-3xl font-bold text-foreground mb-1">{kpi.value}</p>
                <p className="text-sm text-muted-foreground">{kpi.description}</p>
              </div>
            </Card>
          );
        })}
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="campaigns">Campanhas</TabsTrigger>
          <TabsTrigger value="funnel">Funil</TabsTrigger>
          <TabsTrigger value="channels">Canais</TabsTrigger>
          <TabsTrigger value="insights">Insights IA</TabsTrigger>
          <TabsTrigger value="cohort">Cohort</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Performance Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Performance ao Longo do Tempo</h3>
              <div className="h-80 bg-muted/30 rounded-lg flex items-center justify-center">
                <p className="text-muted-foreground">Gráfico de performance temporal</p>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Distribuição de Canais</h3>
              <div className="space-y-4">
                {channelPerformance.map((channel, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${
                        index === 0 ? 'bg-primary' :
                        index === 1 ? 'bg-accent' :
                        index === 2 ? 'bg-warning' : 'bg-muted-foreground'
                      }`} />
                      <span className="text-sm text-foreground">{channel.channel}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-foreground">{channel.share}%</p>
                      <p className="text-xs text-muted-foreground">
                        ROAS {channel.roas}x
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Métricas Detalhadas */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {[
              { label: "Impressões", value: "2.45M", icon: Eye },
              { label: "Cliques", value: "73.5K", icon: MousePointer },
              { label: "CTR", value: "3.0%", icon: Target },
              { label: "CPC", value: "R$ 2.85", icon: DollarSign },
              { label: "CPM", value: "R$ 18.50", icon: BarChart3 },
              { label: "Conversões", value: "1.374", icon: ShoppingCart },
              { label: "Taxa Conv.", value: "1.87%", icon: TrendingUp },
              { label: "CPA", value: "R$ 89.50", icon: UserCheck }
            ].map((metric, index) => {
              const Icon = metric.icon;
              return (
                <Card key={index} className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                  <p className="text-lg font-bold text-foreground">{metric.value}</p>
                  <p className="text-xs text-muted-foreground">{metric.label}</p>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-foreground">Performance por Campanha</h3>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="gap-2">
                  <Filter className="w-4 h-4" />
                  Filtrar
                </Button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Campanha</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Status</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Gasto</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Receita</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">ROAS</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">CTR</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">CPA</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Conv.</th>
                  </tr>
                </thead>
                <tbody>
                  {campaigns.map((campaign) => (
                    <tr key={campaign.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                      <td className="py-4 px-2">
                        <p className="font-medium text-foreground">{campaign.name}</p>
                      </td>
                      <td className="py-4 px-2">
                        <Badge className={getStatusColor(campaign.status)}>
                          {campaign.status === 'active' ? 'Ativa' :
                           campaign.status === 'completed' ? 'Finalizada' : 'Otimizando'}
                        </Badge>
                      </td>
                      <td className="py-4 px-2 font-medium text-foreground">
                        {formatCurrency(campaign.spent)}
                      </td>
                      <td className="py-4 px-2 font-medium text-growth">
                        {formatCurrency(campaign.revenue)}
                      </td>
                      <td className="py-4 px-2 font-medium text-foreground">
                        {campaign.roas}x
                      </td>
                      <td className="py-4 px-2 font-medium text-foreground">
                        {campaign.ctr}%
                      </td>
                      <td className="py-4 px-2 font-medium text-foreground">
                        {formatCurrency(campaign.cpa)}
                      </td>
                      <td className="py-4 px-2 font-medium text-foreground">
                        {campaign.conversions}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="funnel" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-6">Análise de Funil de Conversão</h3>
            
            <div className="space-y-4">
              {funnelData.map((stage, index) => (
                <div key={stage.stage} className="relative">
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg border">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-full text-sm font-medium">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{stage.stage}</p>
                        <p className="text-sm text-muted-foreground">
                          {stage.value.toLocaleString('pt-BR')} ({stage.percentage}%)
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className={`flex items-center gap-1 text-sm font-medium ${
                        stage.change > 0 ? 'text-growth' : 'text-destructive'
                      }`}>
                        {stage.change > 0 ? (
                          <TrendingUp className="w-4 h-4" />
                        ) : (
                          <TrendingDown className="w-4 h-4" />
                        )}
                        {Math.abs(stage.change)}%
                      </div>
                      
                      <div className="w-32">
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full transition-all"
                            style={{ width: `${Math.min(stage.percentage * 30, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {index < funnelData.length - 1 && (
                    <div className="flex justify-center my-2">
                      <div className="w-0.5 h-4 bg-border" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="channels" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {channelPerformance.map((channel, index) => (
              <Card key={index} className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-foreground">{channel.channel}</h3>
                  <Badge className={`${
                    channel.trend === 'up' ? 'bg-growth/10 text-growth' :
                    channel.trend === 'down' ? 'bg-destructive/10 text-destructive' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    {channel.trend === 'up' ? '↑' : channel.trend === 'down' ? '↓' : '→'} 
                    {channel.trend === 'up' ? 'Crescendo' : 
                     channel.trend === 'down' ? 'Declinando' : 'Estável'}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Investimento</p>
                    <p className="text-xl font-bold text-foreground">
                      {formatCurrency(channel.spent)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Receita</p>
                    <p className="text-xl font-bold text-growth">
                      {formatCurrency(channel.revenue)}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">ROAS</span>
                  <span className="font-medium text-foreground">{channel.roas}x</span>
                </div>
                
                <div className="flex items-center justify-between text-sm mt-2">
                  <span className="text-muted-foreground">Participação</span>
                  <span className="font-medium text-foreground">{channel.share}%</span>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {insights.map((insight, index) => (
              <Card key={index} className={`p-6 border-2 ${getPriorityColor(insight.priority)}`}>
                <div className="flex items-start gap-3 mb-4">
                  <div className={`p-2 rounded-lg ${
                    insight.type === 'opportunity' ? 'bg-primary/10' :
                    insight.type === 'warning' ? 'bg-warning/10' :
                    'bg-growth/10'
                  }`}>
                    {insight.type === 'opportunity' && <Zap className="w-5 h-5 text-primary" />}
                    {insight.type === 'warning' && <AlertTriangle className="w-5 h-5 text-warning" />}
                    {insight.type === 'success' && <Target className="w-5 h-5 text-growth" />}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-foreground">{insight.title}</h4>
                      <Badge variant="outline" className="text-xs">
                        {insight.priority === 'high' ? 'Alta' :
                         insight.priority === 'medium' ? 'Média' : 'Baixa'}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-3">
                      {insight.description}
                    </p>
                    
                    <div className="p-3 bg-muted/30 rounded-lg mb-3">
                      <p className="text-sm font-medium text-foreground mb-1">
                        💡 Ação Recomendada
                      </p>
                      <p className="text-sm text-muted-foreground">{insight.action}</p>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Impacto esperado:</span>
                      <span className="text-sm font-medium text-growth">{insight.impact}</span>
                    </div>
                  </div>
                </div>
                
                <Button className="w-full" size="sm">
                  Aplicar Recomendação
                </Button>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="cohort" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Análise de Cohort - LTV</h3>
            <div className="h-80 bg-muted/30 rounded-lg flex items-center justify-center">
              <p className="text-muted-foreground">Matriz de cohort por período de aquisição</p>
            </div>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-primary" />
                <p className="text-sm text-muted-foreground">LTV Médio</p>
              </div>
              <p className="text-2xl font-bold text-foreground">R$ 1.247</p>
              <p className="text-sm text-growth">+15.3% vs mês anterior</p>
            </Card>
            
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-warning" />
                <p className="text-sm text-muted-foreground">Payback Time</p>
              </div>
              <p className="text-2xl font-bold text-foreground">3.2 meses</p>
              <p className="text-sm text-growth">-0.8 meses vs anterior</p>
            </Card>
            
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-growth" />
                <p className="text-sm text-muted-foreground">Retenção 6M</p>
              </div>
              <p className="text-2xl font-bold text-foreground">68%</p>
              <p className="text-sm text-growth">+5.2% vs cohort anterior</p>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};