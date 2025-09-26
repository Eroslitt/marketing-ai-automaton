import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Play, 
  Pause, 
  Square,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Settings,
  Plus,
  Zap,
  Bot,
  Users,
  BarChart3,
  GitBranch,
  Timer,
  RefreshCw
} from "lucide-react";

export const AgentWorkflows = () => {
  const [workflows] = useState([
    {
      id: 1,
      name: "Campanha Completa B2B",
      description: "Workflow completo: Estratégia → Copy → Creative → Media → Insights",
      status: "running",
      progress: 60,
      agents: ["strategy", "copy", "creative", "media", "insights"],
      currentAgent: "media",
      startedAt: "2024-01-22 14:30",
      estimatedCompletion: "2024-01-22 16:15",
      successRate: 89,
      totalRuns: 156,
      triggers: ["new_campaign", "manual"],
      conditions: ["budget > 1000", "audience_defined"]
    },
    {
      id: 2, 
      name: "Prospecção + WhatsApp",
      description: "ProspectAgent → WhatsAppAgent → CloserAgent",
      status: "scheduled",
      progress: 0,
      agents: ["prospect", "whatsapp", "closer"],
      currentAgent: null,
      startedAt: null,
      estimatedCompletion: "2024-01-23 09:00",
      successRate: 94,
      totalRuns: 89,
      triggers: ["schedule", "lead_qualified"],
      conditions: ["lead_score > 70", "business_hours"]
    },
    {
      id: 3,
      name: "Otimização Contínua",
      description: "InsightsAgent → MediaAgent (loop de otimização)",
      status: "completed",
      progress: 100,
      agents: ["insights", "media"],
      currentAgent: null,
      startedAt: "2024-01-22 08:00",
      estimatedCompletion: "2024-01-22 08:45",
      successRate: 76,
      totalRuns: 234,
      triggers: ["performance_drop", "schedule"],
      conditions: ["cpa > target", "running_campaigns > 0"]
    }
  ]);

  const [executions] = useState([
    {
      id: 1,
      workflowId: 1,
      status: "running",
      startedAt: "2024-01-22 14:30",
      steps: [
        { agent: "strategy", status: "completed", duration: "2m 15s", output: "Estratégia B2B Tech definida" },
        { agent: "copy", status: "completed", duration: "3m 42s", output: "15 variações de copy geradas" },
        { agent: "creative", status: "completed", duration: "5m 18s", output: "8 criativos produzidos" },
        { agent: "media", status: "running", duration: "1m 30s", output: "Configurando Meta Ads..." },
        { agent: "insights", status: "pending", duration: null, output: null }
      ]
    }
  ]);

  const agentConfig = {
    strategy: { name: "Strategy Agent", icon: "🎯", color: "bg-primary/10 text-primary" },
    copy: { name: "Copy Agent", icon: "✍️", color: "bg-accent/10 text-accent" },
    creative: { name: "Creative Agent", icon: "🎨", color: "bg-engagement/10 text-engagement" },
    media: { name: "Media Agent", icon: "📊", color: "bg-warning/10 text-warning" },
    prospect: { name: "Prospect Agent", icon: "🔍", color: "bg-growth/10 text-growth" },
    whatsapp: { name: "WhatsApp Agent", icon: "💬", color: "bg-green-500/10 text-green-500" },
    closer: { name: "Closer Agent", icon: "💼", color: "bg-purple-500/10 text-purple-500" },
    insights: { name: "Insights Agent", icon: "📈", color: "bg-blue-500/10 text-blue-500" }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'bg-primary/10 text-primary';
      case 'completed':
        return 'bg-growth/10 text-growth';
      case 'scheduled':
        return 'bg-warning/10 text-warning';
      case 'failed':
        return 'bg-destructive/10 text-destructive';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return Play;
      case 'completed':
        return CheckCircle;
      case 'scheduled':
        return Clock;
      case 'failed':
        return AlertCircle;
      default:
        return Square;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Workflows de Agentes</h1>
          <p className="text-muted-foreground">Orquestre agentes IA em fluxos automatizados</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2">
            <Settings className="w-4 h-4" />
            Configurar
          </Button>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Novo Workflow
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Workflows Ativos</p>
              <p className="text-2xl font-bold text-primary">
                {workflows.filter(w => w.status === 'running').length}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Timer className="w-5 h-5 text-growth" />
            <div>
              <p className="text-sm text-muted-foreground">Taxa Sucesso</p>
              <p className="text-2xl font-bold text-growth">89%</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-warning" />
            <div>
              <p className="text-sm text-muted-foreground">Execuções Hoje</p>
              <p className="text-2xl font-bold text-warning">47</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-engagement" />
            <div>
              <p className="text-sm text-muted-foreground">Tempo Médio</p>
              <p className="text-2xl font-bold text-engagement">8m 32s</p>
            </div>
          </div>
        </Card>
      </div>

      <Tabs defaultValue="workflows" className="space-y-6">
        <TabsList>
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
          <TabsTrigger value="executions">Execuções</TabsTrigger>
          <TabsTrigger value="builder">Builder</TabsTrigger>
        </TabsList>

        <TabsContent value="workflows" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {workflows.map((workflow) => {
              const StatusIcon = getStatusIcon(workflow.status);
              
              return (
                <Card key={workflow.id} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground mb-1">{workflow.name}</h3>
                      <p className="text-sm text-muted-foreground mb-3">{workflow.description}</p>
                      
                      {/* Agent Chain */}
                      <div className="flex items-center gap-2 mb-4">
                        {workflow.agents.map((agentKey, index) => {
                          const agent = agentConfig[agentKey as keyof typeof agentConfig];
                          const isActive = workflow.currentAgent === agentKey;
                          
                          return (
                            <div key={agentKey} className="flex items-center gap-1">
                              <div className={`px-2 py-1 rounded text-xs font-medium ${agent.color} ${
                                isActive ? 'ring-2 ring-primary' : ''
                              }`}>
                                <span className="mr-1">{agent.icon}</span>
                                {agent.name.split(' ')[0]}
                              </div>
                              {index < workflow.agents.length - 1 && (
                                <ArrowRight className="w-3 h-3 text-muted-foreground" />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    
                    <Badge className={getStatusColor(workflow.status)}>
                      <StatusIcon className="w-3 h-3 mr-1" />
                      {workflow.status === 'running' ? 'Executando' :
                       workflow.status === 'completed' ? 'Completo' :
                       workflow.status === 'scheduled' ? 'Agendado' : 'Parado'}
                    </Badge>
                  </div>

                  {workflow.status === 'running' && (
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Progresso</span>
                        <span className="font-medium text-foreground">{workflow.progress}%</span>
                      </div>
                      <Progress value={workflow.progress} className="h-2" />
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                    <div>
                      <p className="text-muted-foreground">Taxa de Sucesso</p>
                      <p className="font-medium text-foreground">{workflow.successRate}%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Total Execuções</p>
                      <p className="font-medium text-foreground">{workflow.totalRuns}</p>
                    </div>
                    {workflow.startedAt && (
                      <div>
                        <p className="text-muted-foreground">Iniciado</p>
                        <p className="font-medium text-foreground">{workflow.startedAt}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-muted-foreground">Est. Conclusão</p>
                      <p className="font-medium text-foreground">{workflow.estimatedCompletion}</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-xs font-medium text-muted-foreground mb-2">Triggers:</p>
                    <div className="flex gap-1">
                      {workflow.triggers.map((trigger, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {trigger}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {workflow.status === 'running' ? (
                      <Button variant="outline" size="sm" className="gap-2">
                        <Pause className="w-3 h-3" />
                        Pausar
                      </Button>
                    ) : workflow.status === 'scheduled' ? (
                      <Button size="sm" className="gap-2">
                        <Play className="w-3 h-3" />
                        Executar Agora
                      </Button>
                    ) : (
                      <Button size="sm" className="gap-2">
                        <Play className="w-3 h-3" />
                        Executar
                      </Button>
                    )}
                    <Button variant="ghost" size="sm">
                      <Settings className="w-3 h-3" />
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="executions" className="space-y-6">
          {executions.map((execution) => {
            const workflow = workflows.find(w => w.id === execution.workflowId);
            
            return (
              <Card key={execution.id} className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="font-semibold text-foreground">{workflow?.name}</h3>
                    <p className="text-sm text-muted-foreground">Execução #{execution.id} - {execution.startedAt}</p>
                  </div>
                  <Badge className={getStatusColor(execution.status)}>
                    {execution.status === 'running' ? 'Executando' : 'Completo'}
                  </Badge>
                </div>

                <div className="space-y-4">
                  {execution.steps.map((step, index) => {
                    const agent = agentConfig[step.agent as keyof typeof agentConfig];
                    const StepIcon = step.status === 'completed' ? CheckCircle :
                                    step.status === 'running' ? RefreshCw :
                                    Clock;
                    
                    return (
                      <div key={index} className="flex items-start gap-4 p-4 bg-muted/30 rounded-lg">
                        <div className={`p-2 rounded-lg ${agent.color}`}>
                          <span className="text-lg">{agent.icon}</span>
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-foreground">{agent.name}</h4>
                            <StepIcon className={`w-4 h-4 ${
                              step.status === 'completed' ? 'text-growth' :
                              step.status === 'running' ? 'text-primary animate-spin' :
                              'text-muted-foreground'
                            }`} />
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm">
                            {step.duration && (
                              <span className="text-muted-foreground">{step.duration}</span>
                            )}
                            {step.output && (
                              <span className="text-foreground">{step.output}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="builder" className="space-y-6">
          <Card className="p-8 text-center border-dashed border-2">
            <Zap className="w-16 h-16 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Workflow Builder
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Crie workflows personalizados arrastando e conectando agentes IA. 
              Configure triggers, condições e aprovações.
            </p>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Criar Novo Workflow
            </Button>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};