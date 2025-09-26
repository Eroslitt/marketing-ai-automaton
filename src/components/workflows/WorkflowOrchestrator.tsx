import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Play, 
  Pause, 
  RotateCcw,
  Zap,
  MessageSquare,
  Clock,
  CheckCircle,
  AlertCircle,
  Activity,
  GitBranch,
  Database
} from "lucide-react";

interface WorkflowEvent {
  id: string;
  timestamp: string;
  agent: string;
  event: string;
  payload: Record<string, any>;
  status: 'success' | 'error' | 'pending';
}

interface AgentState {
  id: string;
  status: 'idle' | 'running' | 'completed' | 'error';
  progress: number;
  lastOutput?: any;
  performance: {
    successRate: number;
    avgDuration: number;
    lastReward: number;
  };
}

interface WorkflowOrchestratorProps {
  workflowId: string;
  agents: string[];
  onStateChange?: (state: Record<string, AgentState>) => void;
}

export const WorkflowOrchestrator = ({ workflowId, agents, onStateChange }: WorkflowOrchestratorProps) => {
  const [isRunning, setIsRunning] = useState(false);
  const [events, setEvents] = useState<WorkflowEvent[]>([]);
  const [agentStates, setAgentStates] = useState<Record<string, AgentState>>({});
  const [currentStep, setCurrentStep] = useState(0);

  // Simular comunicação entre agentes
  const agentConfig = {
    strategy: { 
      name: "Strategy Agent", 
      icon: "🎯", 
      color: "bg-primary/10 text-primary",
      dependencies: [],
      outputs: ["strategy_plan", "target_audience", "budget_allocation"]
    },
    copy: { 
      name: "Copy Agent", 
      icon: "✍️", 
      color: "bg-accent/10 text-accent",
      dependencies: ["strategy"],
      outputs: ["headlines", "descriptions", "cta_variations"]
    },
    creative: { 
      name: "Creative Agent", 
      icon: "🎨", 
      color: "bg-engagement/10 text-engagement",
      dependencies: ["strategy", "copy"],
      outputs: ["visual_assets", "video_scripts", "design_templates"]
    },
    media: { 
      name: "Media Agent", 
      icon: "📊", 
      color: "bg-warning/10 text-warning",
      dependencies: ["strategy", "copy", "creative"],
      outputs: ["campaign_config", "targeting_params", "bid_strategy"]
    },
    insights: { 
      name: "Insights Agent", 
      icon: "📈", 
      color: "bg-blue-500/10 text-blue-500",
      dependencies: ["media"],
      outputs: ["performance_analysis", "optimization_suggestions", "roi_metrics"]
    }
  };

  // Inicializar estados dos agentes
  useEffect(() => {
    const initialStates = agents.reduce((acc, agent) => {
      acc[agent] = {
        id: agent,
        status: 'idle',
        progress: 0,
        performance: {
          successRate: Math.random() * 30 + 70, // 70-100%
          avgDuration: Math.random() * 300 + 60, // 1-6 minutos
          lastReward: Math.random() * 0.3 + 0.7 // 0.7-1.0
        }
      };
      return acc;
    }, {} as Record<string, AgentState>);
    
    setAgentStates(initialStates);
  }, [agents]);

  // Simular execução de workflow
  const executeWorkflow = async () => {
    setIsRunning(true);
    setCurrentStep(0);
    
    for (let i = 0; i < agents.length; i++) {
      const agent = agents[i];
      const config = agentConfig[agent as keyof typeof agentConfig];
      
      setCurrentStep(i);
      
      // Verificar dependências
      const dependenciesReady = config.dependencies.every(dep => 
        agentStates[dep]?.status === 'completed'
      );
      
      if (!dependenciesReady && config.dependencies.length > 0) {
        addEvent({
          id: `${agent}_${Date.now()}`,
          timestamp: new Date().toISOString(),
          agent,
          event: 'dependency_wait',
          payload: { dependencies: config.dependencies },
          status: 'pending'
        });
        
        // Aguardar dependências (simulado)
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      // Iniciar execução do agente
      updateAgentState(agent, { status: 'running', progress: 0 });
      
      addEvent({
        id: `${agent}_start_${Date.now()}`,
        timestamp: new Date().toISOString(),
        agent,
        event: 'agent_started',
        payload: { workflow_id: workflowId },
        status: 'success'
      });
      
      // Simular progresso
      for (let progress = 0; progress <= 100; progress += 20) {
        updateAgentState(agent, { progress });
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
      // Completar execução
      const outputs = config.outputs.reduce((acc, output) => {
        acc[output] = `Generated ${output} for ${agent}`;
        return acc;
      }, {} as Record<string, string>);
      
      updateAgentState(agent, { 
        status: 'completed', 
        progress: 100, 
        lastOutput: outputs 
      });
      
      addEvent({
        id: `${agent}_complete_${Date.now()}`,
        timestamp: new Date().toISOString(),
        agent,
        event: 'agent_completed',
        payload: { outputs, duration: Math.random() * 300 + 60 },
        status: 'success'
      });
      
      // Simular comunicação entre agentes (message passing)
      if (i < agents.length - 1) {
        const nextAgent = agents[i + 1];
        addEvent({
          id: `${agent}_to_${nextAgent}_${Date.now()}`,
          timestamp: new Date().toISOString(),
          agent,
          event: 'message_sent',
          payload: { 
            recipient: nextAgent, 
            data: outputs,
            message_type: 'workflow_data'
          },
          status: 'success'
        });
      }
    }
    
    setIsRunning(false);
    
    // Evento final de workflow
    addEvent({
      id: `workflow_complete_${Date.now()}`,
      timestamp: new Date().toISOString(),
      agent: 'orchestrator',
      event: 'workflow_completed',
      payload: { 
        workflow_id: workflowId,
        total_duration: agents.length * 2 + Math.random() * 60,
        success: true
      },
      status: 'success'
    });
  };

  const updateAgentState = (agentId: string, updates: Partial<AgentState>) => {
    setAgentStates(prev => {
      const newStates = {
        ...prev,
        [agentId]: { ...prev[agentId], ...updates }
      };
      onStateChange?.(newStates);
      return newStates;
    });
  };

  const addEvent = (event: WorkflowEvent) => {
    setEvents(prev => [event, ...prev].slice(0, 50)); // Manter últimos 50 eventos
  };

  const pauseWorkflow = () => {
    setIsRunning(false);
    addEvent({
      id: `workflow_paused_${Date.now()}`,
      timestamp: new Date().toISOString(),
      agent: 'orchestrator',
      event: 'workflow_paused',
      payload: { workflow_id: workflowId },
      status: 'success'
    });
  };

  const resetWorkflow = () => {
    setIsRunning(false);
    setCurrentStep(0);
    setEvents([]);
    
    const resetStates = Object.keys(agentStates).reduce((acc, agent) => {
      acc[agent] = { ...agentStates[agent], status: 'idle', progress: 0 };
      return acc;
    }, {} as Record<string, AgentState>);
    
    setAgentStates(resetStates);
  };

  return (
    <div className="space-y-6">
      {/* Controles */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">Orquestrador de Workflow</h3>
          </div>
          
          <div className="flex items-center gap-2">
            {!isRunning ? (
              <Button onClick={executeWorkflow} className="gap-2">
                <Play className="w-4 h-4" />
                Executar
              </Button>
            ) : (
              <Button onClick={pauseWorkflow} variant="outline" className="gap-2">
                <Pause className="w-4 h-4" />
                Pausar
              </Button>
            )}
            
            <Button onClick={resetWorkflow} variant="outline" className="gap-2">
              <RotateCcw className="w-4 h-4" />
              Reset
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Estados dos Agentes */}
        <Card className="p-6">
          <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <GitBranch className="w-4 h-4" />
            Estados dos Agentes
          </h4>
          
          <div className="space-y-4">
            {agents.map((agentKey, index) => {
              const agent = agentConfig[agentKey as keyof typeof agentConfig];
              const state = agentStates[agentKey];
              const isActive = currentStep === index && isRunning;
              
              if (!state) return null;
              
              const StatusIcon = 
                state.status === 'completed' ? CheckCircle :
                state.status === 'error' ? AlertCircle :
                state.status === 'running' ? Activity : Clock;
              
              return (
                <div key={agentKey} className={`p-4 rounded-lg border ${
                  isActive ? 'border-primary bg-primary/5' : 'border-border bg-card'
                }`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${agent.color}`}>
                        <span className="text-lg">{agent.icon}</span>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{agent.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Sucesso: {state.performance.successRate.toFixed(1)}% | 
                          Reward: {state.performance.lastReward.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    
                    <StatusIcon className={`w-5 h-5 ${
                      state.status === 'completed' ? 'text-growth' :
                      state.status === 'error' ? 'text-destructive' :
                      state.status === 'running' ? 'text-primary animate-pulse' :
                      'text-muted-foreground'
                    }`} />
                  </div>
                  
                  {state.status === 'running' && (
                    <div className="mb-2">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Progresso</span>
                        <span className="font-medium">{state.progress}%</span>
                      </div>
                      <Progress value={state.progress} className="h-2" />
                    </div>
                  )}
                  
                  <Badge variant="outline" className="text-xs">
                    {state.status === 'idle' ? 'Aguardando' :
                     state.status === 'running' ? 'Executando' :
                     state.status === 'completed' ? 'Concluído' : 'Erro'}
                  </Badge>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Log de Eventos */}
        <Card className="p-6">
          <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Database className="w-4 h-4" />
            Log de Eventos ({events.length})
          </h4>
          
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {events.map((event) => {
              const agent = agentConfig[event.agent as keyof typeof agentConfig];
              
              return (
                <div key={event.id} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg text-sm">
                  <div className="flex items-center gap-2 min-w-0">
                    {agent && <span className="text-xs">{agent.icon}</span>}
                    <Badge variant="outline" className="text-xs">
                      {event.agent}
                    </Badge>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-foreground truncate">
                        {event.event.replace(/_/g, ' ')}
                      </p>
                      <span className="text-xs text-muted-foreground ml-2">
                        {new Date(event.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    
                    {Object.keys(event.payload).length > 0 && (
                      <p className="text-xs text-muted-foreground mt-1 truncate">
                        {Object.entries(event.payload).map(([key, value]) => 
                          `${key}: ${JSON.stringify(value)}`
                        ).join(', ')}
                      </p>
                    )}
                  </div>
                  
                  <div className={`w-2 h-2 rounded-full mt-1 ${
                    event.status === 'success' ? 'bg-growth' :
                    event.status === 'error' ? 'bg-destructive' :
                    'bg-warning'
                  }`} />
                </div>
              );
            })}
            
            {events.length === 0 && (
              <div className="text-center py-8">
                <MessageSquare className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  Nenhum evento registrado. Execute um workflow para ver os logs.
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};