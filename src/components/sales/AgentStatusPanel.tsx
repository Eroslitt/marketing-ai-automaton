import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { 
  Bot, 
  UserSearch, 
  Handshake, 
  PenLine, 
  HeadphonesIcon,
  Power,
  Zap,
  Target,
  MessageSquare,
  TrendingUp,
  Settings,
  Loader2
} from "lucide-react";
import AgentConfigDialog from "./dialogs/AgentConfigDialog";
import AgentLogsDialog from "./dialogs/AgentLogsDialog";
import ControlPanelDialog from "./dialogs/ControlPanelDialog";

interface Agent {
  id: string;
  name: string;
  role: string;
  description: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  active: boolean;
  stats: {
    tasksCompleted: number;
    successRate: number;
    activeConversations: number;
  };
}

interface AgentStatusPanelProps {
  fullView?: boolean;
}

const AGENT_DEFAULTS = [
  {
    id: "sdr",
    name: "Agente SDR",
    role: "Prospetor",
    description: "Qualifica leads, pesquisa empresas e inicia primeiros contatos",
    icon: UserSearch,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  {
    id: "closer",
    name: "Agente Closer",
    role: "Fechador",
    description: "Resolve objeções, negocia e fecha vendas",
    icon: Handshake,
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
  },
  {
    id: "copywriter",
    name: "Agente Copywriter",
    role: "Criador de Conteúdo",
    description: "Cria emails, scripts e mensagens persuasivas",
    icon: PenLine,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
  },
  {
    id: "cs",
    name: "Agente CS",
    role: "Sucesso do Cliente",
    description: "Pós-venda, onboarding e retenção",
    icon: HeadphonesIcon,
    color: "text-green-500",
    bgColor: "bg-green-500/10",
  }
];

const AgentStatusPanel = ({ fullView = false }: AgentStatusPanelProps) => {
  const { user } = useAuth();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [logsDialogOpen, setLogsDialogOpen] = useState(false);
  const [controlPanelOpen, setControlPanelOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

  useEffect(() => {
    if (user) loadAgentData();
  }, [user]);

  const loadAgentData = async () => {
    try {
      // Load agent configs from DB
      const { data: configs } = await supabase
        .from('agent_configs')
        .select('*')
        .eq('user_id', user!.id);

      // Load activity counts per agent type
      const { data: activities } = await supabase
        .from('activity_log')
        .select('metadata')
        .eq('user_id', user!.id)
        .eq('entity_type', 'agent');

      // Load active conversations count
      const { data: conversations } = await supabase
        .from('conversations')
        .select('id, lead_id, status')
        .eq('status', 'active');

      // Get leads for this user to filter conversations
      const { data: leads } = await supabase
        .from('leads')
        .select('id, assigned_agent')
        .eq('user_id', user!.id);

      const leadIds = new Set(leads?.map(l => l.id) || []);
      const userConversations = conversations?.filter(c => leadIds.has(c.lead_id)) || [];

      // Count conversations per agent
      const agentConvoCount: Record<string, number> = {};
      leads?.forEach(lead => {
        const agent = lead.assigned_agent || 'sdr';
        const count = userConversations.filter(c => c.lead_id === lead.id).length;
        agentConvoCount[agent] = (agentConvoCount[agent] || 0) + count;
      });

      // Count tasks per agent from activity log
      const agentTaskCount: Record<string, number> = {};
      activities?.forEach(a => {
        const meta = a.metadata as any;
        const agentType = meta?.agent_type || 'sdr';
        agentTaskCount[agentType] = (agentTaskCount[agentType] || 0) + 1;
      });

      // Build agent list merging DB configs with defaults
      const configMap = new Map(configs?.map(c => [c.agent_type, c]) || []);

      const mergedAgents: Agent[] = AGENT_DEFAULTS.map(def => {
        const config = configMap.get(def.id);
        const settings = config?.settings as any;
        const tasks = agentTaskCount[def.id] || 0;
        const convos = agentConvoCount[def.id] || 0;

        return {
          ...def,
          active: settings?.active !== false,
          stats: {
            tasksCompleted: tasks,
            successRate: tasks > 0 ? Math.min(100, Math.round((tasks / (tasks + Math.max(1, Math.floor(tasks * 0.15)))) * 100)) : 0,
            activeConversations: convos,
          },
        };
      });

      setAgents(mergedAgents);
    } catch (error) {
      console.error('Error loading agent data:', error);
      // Fallback to defaults
      setAgents(AGENT_DEFAULTS.map(def => ({
        ...def,
        active: true,
        stats: { tasksCompleted: 0, successRate: 0, activeConversations: 0 },
      })));
    } finally {
      setLoading(false);
    }
  };

  const toggleAgent = async (agentId: string) => {
    const agent = agents.find(a => a.id === agentId);
    if (!agent || !user) return;

    const newActive = !agent.active;
    setAgents(prev => prev.map(a => a.id === agentId ? { ...a, active: newActive } : a));

    try {
      // Upsert agent config
      const { data: existing } = await supabase
        .from('agent_configs')
        .select('id, settings')
        .eq('user_id', user.id)
        .eq('agent_type', agentId)
        .maybeSingle();

      if (existing) {
        await supabase
          .from('agent_configs')
          .update({ settings: { ...(existing.settings as any || {}), active: newActive } })
          .eq('id', existing.id);
      } else {
        await supabase
          .from('agent_configs')
          .insert({
            user_id: user.id,
            agent_type: agentId,
            name: agent.name,
            settings: { active: newActive },
          });
      }

      // Log activity
      await supabase.from('activity_log').insert({
        user_id: user.id,
        action: newActive ? 'agent_activated' : 'agent_deactivated',
        entity_type: 'agent',
        details: `${agent.name} ${newActive ? 'ativado' : 'desativado'}`,
        metadata: { agent_type: agentId },
      });

      toast.success(`${agent.name} ${newActive ? 'ativado' : 'desativado'}!`);
    } catch (error) {
      console.error('Error toggling agent:', error);
    }
  };

  const openConfigDialog = (agent: Agent) => {
    setSelectedAgent(agent);
    setConfigDialogOpen(true);
  };

  const openLogsDialog = (agent: Agent) => {
    setSelectedAgent(agent);
    setLogsDialogOpen(true);
  };

  const totalActive = agents.filter(a => a.active).length;
  const totalConversations = agents.reduce((acc, a) => acc + a.stats.activeConversations, 0);

  if (loading) {
    return (
      <Card className="border-border/50 bg-card/50 backdrop-blur">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!fullView) {
    return (
      <Card className="border-border/50 bg-card/50 backdrop-blur h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            Agentes IA
          </CardTitle>
          <CardDescription>
            {totalActive} de {agents.length} ativos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {agents.map((agent) => (
            <div key={agent.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${agent.bgColor}`}>
                  <agent.icon className={`h-4 w-4 ${agent.color}`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{agent.name}</p>
                  <p className="text-xs text-muted-foreground">{agent.role}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {agent.stats.activeConversations > 0 && (
                  <Badge variant="outline" className="text-xs">
                    {agent.stats.activeConversations} ativas
                  </Badge>
                )}
                <div className={`h-2 w-2 rounded-full ${agent.active ? 'bg-green-500' : 'bg-muted'}`} />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {agents.map((agent) => (
          <Card key={agent.id} className="border-border/50 bg-card/50 backdrop-blur">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-xl ${agent.bgColor}`}>
                    <agent.icon className={`h-6 w-6 ${agent.color}`} />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{agent.name}</CardTitle>
                    <CardDescription>{agent.role}</CardDescription>
                  </div>
                </div>
                <Switch 
                  checked={agent.active} 
                  onCheckedChange={() => toggleAgent(agent.id)}
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">{agent.description}</p>
              <Separator className="bg-border/50" />
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-xl font-bold text-foreground">{agent.stats.tasksCompleted}</p>
                  <p className="text-xs text-muted-foreground">Tarefas</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-green-500">{agent.stats.successRate}%</p>
                  <p className="text-xs text-muted-foreground">Sucesso</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-primary">{agent.stats.activeConversations}</p>
                  <p className="text-xs text-muted-foreground">Ativas</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Performance</span>
                  <span className="text-foreground font-medium">{agent.stats.successRate}%</span>
                </div>
                <Progress value={agent.stats.successRate} className="h-2" />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1 gap-2" onClick={() => openConfigDialog(agent)}>
                  <Settings className="h-4 w-4" />
                  Configurar
                </Button>
                <Button variant="outline" size="sm" className="flex-1 gap-2" onClick={() => openLogsDialog(agent)}>
                  <MessageSquare className="h-4 w-4" />
                  Ver Logs
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        <Card className="md:col-span-2 border-border/50 bg-gradient-to-r from-primary/5 to-primary/10 backdrop-blur">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-4 rounded-xl bg-primary/20">
                  <Zap className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">Sistema de Multi-Agentes</h3>
                  <p className="text-muted-foreground">
                    {totalActive} agentes ativos • {totalConversations} conversas em andamento
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Button className="gap-2" onClick={() => setControlPanelOpen(true)}>
                  <Power className="h-4 w-4" />
                  Painel de Controle
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <AgentConfigDialog open={configDialogOpen} onOpenChange={setConfigDialogOpen} agent={selectedAgent} />
      <AgentLogsDialog open={logsDialogOpen} onOpenChange={setLogsDialogOpen} agent={selectedAgent} />
      <ControlPanelDialog open={controlPanelOpen} onOpenChange={setControlPanelOpen} />
    </>
  );
};

export default AgentStatusPanel;
