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
  BarChart3,
  Sparkles
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
import SalesVoiceAgent from "@/components/sales/SalesVoiceAgent";

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
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto space-y-4 md:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">SalesCore AI</h1>
            <p className="text-sm md:text-base text-muted-foreground mt-1">
              Plataforma de Vendas Autônomas com Multi-Agentes IA
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="gap-2 py-2 px-3 md:px-4 text-xs md:text-sm">
              <Activity className="h-3 w-3 md:h-4 md:w-4 text-green-500 animate-pulse" />
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
          <div className="overflow-x-auto -mx-3 px-3 md:mx-0 md:px-0">
            <TabsList className="bg-muted/50 p-1 w-max md:w-auto">
              <TabsTrigger value="overview" className="gap-1.5 text-xs md:text-sm">
                <BarChart3 className="h-3.5 w-3.5 md:h-4 md:w-4" />
                <span className="hidden sm:inline">Visão Geral</span>
                <span className="sm:hidden">Geral</span>
              </TabsTrigger>
              <TabsTrigger value="products" className="gap-1.5 text-xs md:text-sm">
                <Upload className="h-3.5 w-3.5 md:h-4 md:w-4" />
                <span className="hidden sm:inline">Produtos</span>
                <span className="sm:hidden">Prod.</span>
              </TabsTrigger>
              <TabsTrigger value="agents" className="gap-1.5 text-xs md:text-sm">
                <Bot className="h-3.5 w-3.5 md:h-4 md:w-4" />
                <span className="hidden sm:inline">Agentes IA</span>
                <span className="sm:hidden">IA</span>
              </TabsTrigger>
              <TabsTrigger value="live" className="gap-1.5 text-xs md:text-sm">
                <Zap className="h-3.5 w-3.5 md:h-4 md:w-4" />
                Live
              </TabsTrigger>
              <TabsTrigger value="voice" className="gap-1.5 text-xs md:text-sm">
                <Phone className="h-3.5 w-3.5 md:h-4 md:w-4" />
                Voz
              </TabsTrigger>
              <TabsTrigger value="optimization" className="gap-1.5 text-xs md:text-sm">
                <TrendingUp className="h-3.5 w-3.5 md:h-4 md:w-4" />
                <span className="hidden sm:inline">Otimização</span>
                <span className="sm:hidden">Otim.</span>
              </TabsTrigger>
              <TabsTrigger value="safety" className="gap-1.5 text-xs md:text-sm">
                <Target className="h-3.5 w-3.5 md:h-4 md:w-4" />
                <span className="hidden sm:inline">Segurança</span>
                <span className="sm:hidden">Seg.</span>
              </TabsTrigger>
            </TabsList>
          </div>

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

          {/* Voice Tab */}
          <TabsContent value="voice" className="space-y-6">
            <Tabs defaultValue="sales-script" className="space-y-4">
              <TabsList className="bg-muted/50">
                <TabsTrigger value="sales-script" className="gap-2">
                  <Sparkles className="h-4 w-4" />
                  Script de Vendas
                </TabsTrigger>
                <TabsTrigger value="voice-agent" className="gap-2">
                  <Phone className="h-4 w-4" />
                  Agente de Voz
                </TabsTrigger>
              </TabsList>
              <TabsContent value="sales-script">
                <SalesVoiceAgent />
              </TabsContent>
              <TabsContent value="voice-agent">
                <VoiceAgent fullView />
              </TabsContent>
            </Tabs>
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
