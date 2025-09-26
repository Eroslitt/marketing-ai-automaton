import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Brain,
  TrendingUp,
  Target,
  Zap,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Activity,
  Database,
  GitBranch,
  Clock
} from "lucide-react";

interface PerformanceMetric {
  metric: string;
  current: number;
  target: number;
  trend: 'up' | 'down' | 'stable';
  impact: number;
}

interface LearningExperiment {
  id: string;
  name: string;
  type: 'prompt_optimization' | 'model_tuning' | 'reward_adjustment';
  status: 'running' | 'completed' | 'failed';
  agent: string;
  startDate: string;
  progress: number;
  results?: {
    improvement: number;
    confidence: number;
    samples: number;
  };
}

interface AgentPerformance {
  agent: string;
  successRate: number;
  avgReward: number;
  modelVersion: string;
  lastUpdate: string;
  improvements: {
    period: string;
    metric: string;
    change: number;
  }[];
}

export const ContinuousLearning = () => {
  const [isRetraining, setIsRetraining] = useState(false);
  const [retrainingProgress, setRetrainingProgress] = useState(0);

  const [performanceMetrics] = useState<PerformanceMetric[]>([
    {
      metric: "CTR (Click Through Rate)",
      current: 3.2,
      target: 3.5,
      trend: 'up',
      impact: 15.3
    },
    {
      metric: "CPA (Cost Per Acquisition)", 
      current: 89.50,
      target: 85.00,
      trend: 'down',
      impact: -5.3
    },
    {
      metric: "ROAS (Return on Ad Spend)",
      current: 4.8,
      target: 5.0,
      trend: 'up',
      impact: 12.8
    },
    {
      metric: "Conversion Rate",
      current: 2.1,
      target: 2.5,
      trend: 'stable',
      impact: 0.2
    }
  ]);

  const [experiments] = useState<LearningExperiment[]>([
    {
      id: "exp_001",
      name: "Prompt Optimization - Copy Agent",
      type: "prompt_optimization",
      status: "running",
      agent: "copy",
      startDate: "2024-01-20",
      progress: 75,
      results: undefined
    },
    {
      id: "exp_002", 
      name: "Reward Function Tuning - Media Agent",
      type: "reward_adjustment",
      status: "completed",
      agent: "media",
      startDate: "2024-01-18",
      progress: 100,
      results: {
        improvement: 23.5,
        confidence: 0.94,
        samples: 1250
      }
    },
    {
      id: "exp_003",
      name: "Model Fine-tuning - Creative Agent",
      type: "model_tuning", 
      status: "running",
      agent: "creative",
      startDate: "2024-01-22",
      progress: 45
    }
  ]);

  const [agentPerformances] = useState<AgentPerformance[]>([
    {
      agent: "strategy",
      successRate: 89.2,
      avgReward: 0.89,
      modelVersion: "v2.3.1",
      lastUpdate: "2024-01-21",
      improvements: [
        { period: "Última semana", metric: "Success Rate", change: 5.2 },
        { period: "Última semana", metric: "Avg Reward", change: 8.1 }
      ]
    },
    {
      agent: "copy",
      successRate: 92.5,
      avgReward: 0.92,
      modelVersion: "v2.2.8",
      lastUpdate: "2024-01-20",
      improvements: [
        { period: "Última semana", metric: "Success Rate", change: 3.1 },
        { period: "Última semana", metric: "CTR", change: 15.3 }
      ]
    },
    {
      agent: "creative",
      successRate: 87.8,
      avgReward: 0.85,
      modelVersion: "v2.4.0",
      lastUpdate: "2024-01-19",
      improvements: [
        { period: "Última semana", metric: "Success Rate", change: -1.2 },
        { period: "Última semana", metric: "Engagement", change: 7.8 }
      ]
    },
    {
      agent: "media",
      successRate: 94.1,
      avgReward: 0.91,
      modelVersion: "v2.3.5", 
      lastUpdate: "2024-01-22",
      improvements: [
        { period: "Última semana", metric: "ROAS", change: 23.5 },
        { period: "Última semana", metric: "CPA Reduction", change: -12.3 }
      ]
    }
  ]);

  const agentConfig = {
    strategy: { name: "Strategy Agent", icon: "🎯", color: "bg-primary/10 text-primary" },
    copy: { name: "Copy Agent", icon: "✍️", color: "bg-accent/10 text-accent" },
    creative: { name: "Creative Agent", icon: "🎨", color: "bg-engagement/10 text-engagement" },
    media: { name: "Media Agent", icon: "📊", color: "bg-warning/10 text-warning" },
    prospect: { name: "Prospect Agent", icon: "🔍", color: "bg-growth/10 text-growth" },
    whatsapp: { name: "WhatsApp Agent", icon: "💬", color: "bg-green-500/10 text-green-500" }
  };

  const startRetraining = async () => {
    setIsRetraining(true);
    setRetrainingProgress(0);
    
    // Simular processo de retreinamento
    const interval = setInterval(() => {
      setRetrainingProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsRetraining(false);
          return 100;
        }
        return prev + Math.random() * 10;
      });
    }, 500);
  };

  const getExperimentStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'bg-primary/10 text-primary';
      case 'completed':
        return 'bg-growth/10 text-growth';
      case 'failed':
        return 'bg-destructive/10 text-destructive';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-growth" />;
      case 'down':
        return <TrendingUp className="w-4 h-4 text-destructive rotate-180" />;
      default:
        return <Target className="w-4 h-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header com controles */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Sistema de Aprendizado Contínuo</h2>
          <p className="text-muted-foreground">Otimização automática de prompts e modelos baseada em performance</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            onClick={startRetraining}
            disabled={isRetraining}
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isRetraining ? 'animate-spin' : ''}`} />
            {isRetraining ? 'Retreinando...' : 'Retreinar Modelos'}
          </Button>
        </div>
      </div>

      {/* Progress de Retreinamento */}
      {isRetraining && (
        <Card className="p-4 border-primary/20 bg-primary/5">
          <div className="flex items-center gap-3 mb-3">
            <Brain className="w-5 h-5 text-primary animate-pulse" />
            <div>
              <p className="font-medium text-foreground">Retreinamento em Progresso</p>
              <p className="text-sm text-muted-foreground">
                Processando dados de performance e ajustando modelos...
              </p>
            </div>
          </div>
          <Progress value={retrainingProgress} className="h-2" />
          <p className="text-sm text-muted-foreground mt-2">
            {retrainingProgress.toFixed(1)}% concluído
          </p>
        </Card>
      )}

      <Tabs defaultValue="performance" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="experiments">Experimentos</TabsTrigger>
          <TabsTrigger value="agents">Agentes</TabsTrigger>
          <TabsTrigger value="insights">Insights IA</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-6">
          {/* Métricas de Performance */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {performanceMetrics.map((metric, index) => (
              <Card key={index} className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-foreground">{metric.metric}</p>
                  {getTrendIcon(metric.trend)}
                </div>
                
                <div className="mb-2">
                  <p className="text-2xl font-bold text-foreground">
                    {metric.metric.includes('CPA') || metric.metric.includes('Cost') 
                      ? `R$ ${metric.current}` 
                      : metric.metric.includes('Rate') || metric.metric.includes('CTR')
                      ? `${metric.current}%`
                      : `${metric.current}x`
                    }
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Meta: {metric.metric.includes('CPA') ? `R$ ${metric.target}` : 
                          metric.metric.includes('Rate') ? `${metric.target}%` : 
                          `${metric.target}x`}
                  </p>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Impacto 7d:</span>
                  <span className={`text-xs font-medium ${
                    metric.impact > 0 ? 'text-growth' : 'text-destructive'
                  }`}>
                    {metric.impact > 0 ? '+' : ''}{metric.impact}%
                  </span>
                </div>
              </Card>
            ))}
          </div>

          {/* Gráfico de Performance ao Longo do Tempo */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Performance Histórica</h3>
            <div className="h-64 bg-muted/30 rounded-lg flex items-center justify-center">
              <p className="text-muted-foreground">Gráfico de performance temporal com dados de aprendizado</p>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="experiments" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {experiments.map((experiment) => {
              const agent = agentConfig[experiment.agent as keyof typeof agentConfig];
              
              return (
                <Card key={experiment.id} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${agent.color}`}>
                        <span className="text-lg">{agent.icon}</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground">{experiment.name}</h4>
                        <p className="text-sm text-muted-foreground">{agent.name}</p>
                      </div>
                    </div>
                    
                    <Badge className={getExperimentStatusColor(experiment.status)}>
                      {experiment.status === 'running' ? 'Executando' :
                       experiment.status === 'completed' ? 'Concluído' :
                       'Falhou'}
                    </Badge>
                  </div>

                  {experiment.status === 'running' && (
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Progresso</span>
                        <span className="font-medium">{experiment.progress}%</span>
                      </div>
                      <Progress value={experiment.progress} className="h-2" />
                    </div>
                  )}

                  {experiment.results && (
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="text-center p-3 bg-muted/30 rounded-lg">
                        <p className="text-lg font-bold text-growth">
                          +{experiment.results.improvement}%
                        </p>
                        <p className="text-xs text-muted-foreground">Melhoria</p>
                      </div>
                      <div className="text-center p-3 bg-muted/30 rounded-lg">
                        <p className="text-lg font-bold text-foreground">
                          {(experiment.results.confidence * 100).toFixed(0)}%
                        </p>
                        <p className="text-xs text-muted-foreground">Confiança</p>
                      </div>
                      <div className="text-center p-3 bg-muted/30 rounded-lg">
                        <p className="text-lg font-bold text-foreground">
                          {experiment.results.samples.toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground">Amostras</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      Iniciado: {new Date(experiment.startDate).toLocaleDateString('pt-BR')}
                    </span>
                    {experiment.status === 'completed' && experiment.results && (
                      <Button size="sm" variant="outline">
                        Aplicar Modelo
                      </Button>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="agents" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {agentPerformances.map((performance) => {
              const agent = agentConfig[performance.agent as keyof typeof agentConfig];
              
              return (
                <Card key={performance.agent} className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`p-3 rounded-lg ${agent.color}`}>
                      <span className="text-xl">{agent.icon}</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">{agent.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        Modelo: {performance.modelVersion} | 
                        Atualizado: {new Date(performance.lastUpdate).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Taxa de Sucesso</p>
                      <p className="text-xl font-bold text-foreground">
                        {performance.successRate}%
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Reward Médio</p>
                      <p className="text-xl font-bold text-foreground">
                        {performance.avgReward.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium text-foreground">Melhorias Recentes:</p>
                    {performance.improvements.map((improvement, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                        <span className="text-sm text-muted-foreground">
                          {improvement.metric}
                        </span>
                        <span className={`text-sm font-medium ${
                          improvement.change > 0 ? 'text-growth' : 'text-destructive'
                        }`}>
                          {improvement.change > 0 ? '+' : ''}{improvement.change}%
                        </span>
                      </div>
                    ))}
                  </div>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6 border-2 border-primary/20">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-5 h-5 text-primary" />
                <h4 className="font-semibold text-primary">Recomendação de Otimização</h4>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                O Copy Agent está performando 15.3% acima da média após a última otimização de prompt. 
                Recomendamos aplicar técnicas similares aos outros agentes.
              </p>
              <div className="p-3 bg-primary/5 rounded-lg mb-3">
                <p className="text-sm font-medium text-primary">💡 Ação Sugerida:</p>
                <p className="text-sm text-foreground">
                  Iniciar experimento de prompt optimization para Strategy e Creative Agents
                </p>
              </div>
              <Button className="w-full">Iniciar Experimento</Button>
            </Card>

            <Card className="p-6 border-2 border-warning/20">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-5 h-5 text-warning" />
                <h4 className="font-semibent text-warning">Alerta de Drift Detectado</h4>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Creative Agent apresentou queda de 1.2% na taxa de sucesso. 
                Possível drift no modelo ou mudança no padrão dos dados.
              </p>
              <div className="p-3 bg-warning/5 rounded-lg mb-3">
                <p className="text-sm font-medium text-warning">⚠️ Ação Recomendada:</p>
                <p className="text-sm text-foreground">
                  Retreinar modelo com dados recentes e ajustar parâmetros
                </p>
              </div>
              <Button variant="outline" className="w-full">Agendar Retreinamento</Button>
            </Card>

            <Card className="lg:col-span-2 p-6 border-2 border-growth/20">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="w-5 h-5 text-growth" />
                <h4 className="font-semibold text-growth">Otimização Bem-Sucedida</h4>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Media Agent alcançou 23.5% de melhoria no ROAS após ajuste na função de reward. 
                O modelo está convergindo para estratégias mais eficazes de alocação de orçamento.
              </p>
              
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center p-3 bg-growth/5 rounded-lg">
                  <p className="text-lg font-bold text-growth">+23.5%</p>
                  <p className="text-xs text-muted-foreground">ROAS</p>
                </div>
                <div className="text-center p-3 bg-growth/5 rounded-lg">
                  <p className="text-lg font-bold text-growth">-12.3%</p>
                  <p className="text-xs text-muted-foreground">CPA</p>
                </div>
                <div className="text-center p-3 bg-growth/5 rounded-lg">
                  <p className="text-lg font-bold text-growth">94%</p>
                  <p className="text-xs text-muted-foreground">Confiança</p>
                </div>
              </div>
              
              <Button variant="outline" className="w-full">
                Aplicar a Outros Agentes
              </Button>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};