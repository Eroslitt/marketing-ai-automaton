import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { 
  Play, Pause, RotateCcw, Zap, MessageSquare, Clock,
  CheckCircle, AlertCircle, Activity, GitBranch, Database, Loader2
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

const agentConfig: Record<string, { name: string; icon: string; color: string; dependencies: string[]; outputs: string[] }> = {
  strategy: { name: "Strategy Agent", icon: "🎯", color: "bg-primary/10 text-primary", dependencies: [], outputs: ["strategy_plan", "target_audience", "budget_allocation"] },
  copy: { name: "Copy Agent", icon: "✍️", color: "bg-purple-500/10 text-purple-500", dependencies: ["strategy"], outputs: ["headlines", "descriptions", "cta_variations"] },
  creative: { name: "Creative Agent", icon: "🎨", color: "bg-pink-500/10 text-pink-500", dependencies: ["strategy", "copy"], outputs: ["visual_assets", "video_scripts"] },
  media: { name: "Media Agent", icon: "📊", color: "bg-orange-500/10 text-orange-500", dependencies: ["strategy", "copy", "creative"], outputs: ["campaign_config", "targeting_params"] },
  insights: { name: "Insights Agent", icon: "📈", color: "bg-blue-500/10 text-blue-500", dependencies: ["media"], outputs: ["performance_analysis", "optimization_suggestions"] },
};

export const WorkflowOrchestrator = ({ workflowId, agents, onStateChange }: WorkflowOrchestratorProps) => {
  const { user } = useAuth();
  const [isRunning, setIsRunning] = useState(false);
  const [events, setEvents] = useState<WorkflowEvent[]>([]);
  const [agentStates, setAgentStates] = useState<Record<string, AgentState>>({});
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [executionId, setExecutionId] = useState<string | null>(null);

  // Load existing execution state from DB
  useEffect(() => {
    if (user && workflowId) loadExecutionState();
  }, [user, workflowId]);

  // Initialize agent states
  useEffect(() => {
    if (!loading) {
      const initialStates = agents.reduce((acc, agent) => {
        if (!acc[agent]) {
          acc[agent] = {
            id: agent,
            status: 'idle',
            progress: 0,
            performance: { successRate: 0, avgDuration: 0, lastReward: 0 },
          };
        }
        return acc;
      }, { ...agentStates } as Record<string, AgentState>);
      setAgentStates(initialStates);
    }
  }, [agents, loading]);

  const loadExecutionState = async () => {
    try {
      const { data: executions } = await supabase
        .from('workflow_executions')
        .select('*')
        .eq('workflow_id', workflowId)
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (executions && executions.length > 0) {
        const exec = executions[0];
        setExecutionId(exec.id);
        
        const steps = (exec.steps as any[]) || [];
        const restoredEvents: WorkflowEvent[] = steps.map((s: any, i: number) => ({
          id: `restored_${i}`,
          timestamp: s.timestamp || exec.created_at,
          agent: s.agent || 'orchestrator',
          event: s.event || 'step_completed',
          payload: s.payload || {},
          status: s.status || 'success',
        }));
        setEvents(restoredEvents);

        if (exec.status === 'running') {
          setIsRunning(true);
          setCurrentStep(exec.progress || 0);
        }

        // Restore agent states from steps
        const restoredStates: Record<string, AgentState> = {};
        agents.forEach(agent => {
          const agentSteps = steps.filter((s: any) => s.agent === agent);
          const completed = agentSteps.some((s: any) => s.event === 'agent_completed');
          restoredStates[agent] = {
            id: agent,
            status: completed ? 'completed' : 'idle',
            progress: completed ? 100 : 0,
            performance: { successRate: 0, avgDuration: 0, lastReward: 0 },
          };
        });
        setAgentStates(restoredStates);
      }
    } catch (error) {
      console.error('Error loading execution:', error);
    } finally {
      setLoading(false);
    }
  };

  const executeWorkflow = async () => {
    if (!user) return;
    setIsRunning(true);
    setCurrentStep(0);
    setEvents([]);

    // Create execution record in DB
    const { data: newExec } = await supabase
      .from('workflow_executions')
      .insert({
        workflow_id: workflowId,
        user_id: user.id,
        status: 'running',
        progress: 0,
        steps: [],
      })
      .select()
      .single();

    const execId = newExec?.id;
    if (execId) setExecutionId(execId);

    const allSteps: any[] = [];

    for (let i = 0; i < agents.length; i++) {
      const agent = agents[i];
      const config = agentConfig[agent as keyof typeof agentConfig] || { name: agent, outputs: [], dependencies: [] };
      setCurrentStep(i);

      // Update progress in DB
      if (execId) {
        await supabase.from('workflow_executions').update({
          current_agent: agent,
          progress: Math.round((i / agents.length) * 100),
        }).eq('id', execId);
      }

      updateAgentState(agent, { status: 'running', progress: 0 });
      const startEvent = { agent, event: 'agent_started', timestamp: new Date().toISOString(), payload: {}, status: 'success' };
      allSteps.push(startEvent);
      addEvent({ id: `${agent}_start_${Date.now()}`, ...startEvent } as WorkflowEvent);

      // Simulate progress
      for (let progress = 0; progress <= 100; progress += 20) {
        updateAgentState(agent, { progress });
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      const outputs = (config.outputs || []).reduce((acc: Record<string, string>, output: string) => {
        acc[output] = `Generated ${output}`;
        return acc;
      }, {});

      updateAgentState(agent, { status: 'completed', progress: 100, lastOutput: outputs });

      const completeEvent = { agent, event: 'agent_completed', timestamp: new Date().toISOString(), payload: { outputs }, status: 'success' };
      allSteps.push(completeEvent);
      addEvent({ id: `${agent}_done_${Date.now()}`, ...completeEvent } as WorkflowEvent);
    }

    // Complete workflow
    if (execId) {
      await supabase.from('workflow_executions').update({
        status: 'completed',
        progress: 100,
        completed_at: new Date().toISOString(),
        steps: allSteps,
      }).eq('id', execId);

      // Update workflow stats
      await supabase.from('workflows').update({
        last_run_at: new Date().toISOString(),
        total_runs: 1, // Will be incremented properly with a DB function
      }).eq('id', workflowId);
    }

    // Log activity
    await supabase.from('activity_log').insert({
      user_id: user.id,
      action: 'workflow_completed',
      entity_type: 'workflow',
      entity_id: workflowId,
      details: `Workflow executado com ${agents.length} agentes`,
    });

    setIsRunning(false);
    toast.success('Workflow executado com sucesso!');
  };

  const updateAgentState = (agentId: string, updates: Partial<AgentState>) => {
    setAgentStates(prev => {
      const newStates = { ...prev, [agentId]: { ...prev[agentId], ...updates } };
      onStateChange?.(newStates);
      return newStates;
    });
  };

  const addEvent = (event: WorkflowEvent) => {
    setEvents(prev => [event, ...prev].slice(0, 50));
  };

  const pauseWorkflow = () => {
    setIsRunning(false);
    if (executionId) {
      supabase.from('workflow_executions').update({ status: 'paused' }).eq('id', executionId);
    }
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">Orquestrador de Workflow</h3>
          </div>
          <div className="flex items-center gap-2">
            {!isRunning ? (
              <Button onClick={executeWorkflow} className="gap-2">
                <Play className="w-4 h-4" /> Executar
              </Button>
            ) : (
              <Button onClick={pauseWorkflow} variant="outline" className="gap-2">
                <Pause className="w-4 h-4" /> Pausar
              </Button>
            )}
            <Button onClick={resetWorkflow} variant="outline" className="gap-2">
              <RotateCcw className="w-4 h-4" /> Reset
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <GitBranch className="w-4 h-4" /> Estados dos Agentes
          </h4>
          <div className="space-y-4">
            {agents.map((agentKey, index) => {
              const agent = agentConfig[agentKey as keyof typeof agentConfig] || { name: agentKey, icon: "🤖", color: "bg-muted text-muted-foreground" };
              const state = agentStates[agentKey];
              const isActive = currentStep === index && isRunning;
              if (!state) return null;

              const StatusIcon = state.status === 'completed' ? CheckCircle : state.status === 'error' ? AlertCircle : state.status === 'running' ? Activity : Clock;

              return (
                <div key={agentKey} className={`p-4 rounded-lg border ${isActive ? 'border-primary bg-primary/5' : 'border-border bg-card'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${agent.color}`}>
                        <span className="text-lg">{agent.icon}</span>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{agent.name}</p>
                      </div>
                    </div>
                    <StatusIcon className={`w-5 h-5 ${state.status === 'completed' ? 'text-green-500' : state.status === 'error' ? 'text-destructive' : state.status === 'running' ? 'text-primary animate-pulse' : 'text-muted-foreground'}`} />
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
                    {state.status === 'idle' ? 'Aguardando' : state.status === 'running' ? 'Executando' : state.status === 'completed' ? 'Concluído' : 'Erro'}
                  </Badge>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="p-6">
          <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Database className="w-4 h-4" /> Log de Eventos ({events.length})
          </h4>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {events.map(event => {
              const agent = agentConfig[event.agent as keyof typeof agentConfig];
              return (
                <div key={event.id} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg text-sm">
                  <div className="flex items-center gap-2 min-w-0">
                    {agent && <span className="text-xs">{agent.icon}</span>}
                    <Badge variant="outline" className="text-xs">{event.agent}</Badge>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-foreground truncate">{event.event.replace(/_/g, ' ')}</p>
                      <span className="text-xs text-muted-foreground ml-2">{new Date(event.timestamp).toLocaleTimeString()}</span>
                    </div>
                  </div>
                  <div className={`w-2 h-2 rounded-full mt-1 ${event.status === 'success' ? 'bg-green-500' : event.status === 'error' ? 'bg-destructive' : 'bg-amber-500'}`} />
                </div>
              );
            })}
            {events.length === 0 && (
              <div className="text-center py-8">
                <MessageSquare className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Nenhum evento registrado. Execute o workflow.</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
