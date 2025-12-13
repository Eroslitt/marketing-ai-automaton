import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { 
  Upload, 
  MessageSquare, 
  TrendingUp, 
  Users, 
  DollarSign,
  Bot,
  Phone,
  Mail,
  Zap,
  Target,
  Activity,
  BarChart3
} from "lucide-react";
import KnowledgeUploader from "@/components/sales/KnowledgeUploader";
import LiveSalesFeed from "@/components/sales/LiveSalesFeed";
import SalesMetricsChart from "@/components/sales/SalesMetricsChart";
import AgentStatusPanel from "@/components/sales/AgentStatusPanel";
import ProductsManager from "@/components/sales/ProductsManager";
import OptimizationLab from "@/components/sales/OptimizationLab";
import SafetyCenter from "@/components/sales/SafetyCenter";
import VoiceAgent from "@/components/sales/VoiceAgent";
import PsychologyPanel from "@/components/sales/PsychologyPanel";

const SalesDashboard = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState({
    leadsContacted: 0,
    responseRate: 0,
    salesCompleted: 0,
    revenue: 0,
    activeConversations: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadMetrics();
    }
  }, [user]);

  const loadMetrics = async () => {
    try {
      // Get today's metrics
      const today = new Date().toISOString().split('T')[0];
      
      const { data: metricsData } = await supabase
        .from('sales_metrics')
        .select('*')
        .eq('user_id', user?.id)
        .eq('date', today)
        .single();

      // Get active conversations count
      const { count: activeConvos } = await supabase
        .from('conversations')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      if (metricsData) {
        setMetrics({
          leadsContacted: metricsData.leads_contacted || 0,
          responseRate: metricsData.leads_contacted > 0 
            ? Math.round((metricsData.responses_received / metricsData.leads_contacted) * 100) 
            : 0,
          salesCompleted: metricsData.sales_completed || 0,
          revenue: metricsData.revenue || 0,
          activeConversations: activeConvos || 0
        });
      }
    } catch (error) {
      console.error('Error loading metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const kpis = [
    {
      title: "Leads Contactados",
      value: metrics.leadsContacted,
      icon: Users,
      color: "text-primary",
      bgColor: "bg-primary/10"
    },
    {
      title: "Taxa de Resposta",
      value: `${metrics.responseRate}%`,
      icon: MessageSquare,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10"
    },
    {
      title: "Vendas Realizadas",
      value: metrics.salesCompleted,
      icon: Target,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10"
    },
    {
      title: "Receita Gerada",
      value: `R$ ${metrics.revenue.toLocaleString('pt-BR')}`,
      icon: DollarSign,
      color: "text-green-500",
      bgColor: "bg-green-500/10"
    }
  ];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">SalesCore AI</h1>
            <p className="text-muted-foreground mt-1">
              Plataforma de Vendas Autônomas com Multi-Agentes IA
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="gap-2 py-2 px-4">
              <Activity className="h-4 w-4 text-green-500 animate-pulse" />
              {metrics.activeConversations} conversas ativas
            </Badge>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((kpi, index) => (
            <Card key={index} className="border-border/50 bg-card/50 backdrop-blur">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{kpi.title}</p>
                    <p className="text-2xl font-bold text-foreground mt-1">{kpi.value}</p>
                  </div>
                  <div className={`p-3 rounded-xl ${kpi.bgColor}`}>
                    <kpi.icon className={`h-6 w-6 ${kpi.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-muted/50 p-1">
            <TabsTrigger value="overview" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="products" className="gap-2">
              <Upload className="h-4 w-4" />
              Produtos & Conhecimento
            </TabsTrigger>
            <TabsTrigger value="agents" className="gap-2">
              <Bot className="h-4 w-4" />
              Agentes IA
            </TabsTrigger>
            <TabsTrigger value="live" className="gap-2">
              <Zap className="h-4 w-4" />
              Live Sales
            </TabsTrigger>
            <TabsTrigger value="optimization" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              Otimização
            </TabsTrigger>
            <TabsTrigger value="safety" className="gap-2">
              <Target className="h-4 w-4" />
              Segurança
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <SalesMetricsChart />
              </div>
              <div className="space-y-6">
                <AgentStatusPanel />
                <VoiceAgent />
              </div>
            </div>
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ProductsManager />
              <KnowledgeUploader />
            </div>
          </TabsContent>

          {/* Agents Tab */}
          <TabsContent value="agents" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <AgentStatusPanel fullView />
              </div>
              <PsychologyPanel />
            </div>
          </TabsContent>

          {/* Live Sales Tab */}
          <TabsContent value="live" className="space-y-6">
            <LiveSalesFeed />
          </TabsContent>

          {/* Optimization Tab */}
          <TabsContent value="optimization" className="space-y-6">
            <OptimizationLab />
          </TabsContent>

          {/* Safety Tab */}
          <TabsContent value="safety" className="space-y-6">
            <SafetyCenter />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SalesDashboard;
