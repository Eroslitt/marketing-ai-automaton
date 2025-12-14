import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { 
  Gauge, 
  Power,
  Pause,
  Play,
  RefreshCw,
  Activity,
  Zap,
  Users,
  MessageSquare,
  TrendingUp,
  AlertTriangle
} from "lucide-react";

interface ControlPanelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ControlPanelDialog = ({ open, onOpenChange }: ControlPanelDialogProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [systemStatus, setSystemStatus] = useState({
    isRunning: true,
    activeAgents: 4,
    activeConversations: 0,
    messagesPerHour: 0,
    cpuUsage: 45,
    memoryUsage: 62,
    apiCalls: 127,
    errors: 0
  });

  const [agentStates, setAgentStates] = useState({
    sdr: true,
    closer: true,
    copywriter: true,
    cs: true
  });

  useEffect(() => {
    if (open) {
      loadSystemStatus();
    }
  }, [open]);

  const loadSystemStatus = async () => {
    setLoading(true);
    try {
      // Get active conversations
      const { count: activeConvos } = await supabase
        .from('conversations')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      // Get recent messages count
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      const { count: recentMessages } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', oneHourAgo);

      setSystemStatus(prev => ({
        ...prev,
        activeConversations: activeConvos || 0,
        messagesPerHour: recentMessages || 0
      }));
    } catch (error) {
      console.error('Error loading system status:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSystem = () => {
    setSystemStatus(prev => ({ ...prev, isRunning: !prev.isRunning }));
    toast.success(systemStatus.isRunning ? "Sistema pausado" : "Sistema retomado");
  };

  const toggleAgent = (agent: keyof typeof agentStates) => {
    setAgentStates(prev => ({ ...prev, [agent]: !prev[agent] }));
    const newState = !agentStates[agent];
    toast.success(`Agente ${agent.toUpperCase()} ${newState ? 'ativado' : 'desativado'}`);
  };

  const restartSystem = () => {
    toast.info("Reiniciando sistema...");
    setTimeout(() => {
      loadSystemStatus();
      toast.success("Sistema reiniciado com sucesso!");
    }, 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gauge className="h-5 w-5" />
            Painel de Controle
          </DialogTitle>
          <DialogDescription>
            Monitore e controle o sistema de multi-agentes em tempo real
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* System Status */}
          <div className={`p-4 rounded-xl border ${
            systemStatus.isRunning 
              ? 'border-green-500/30 bg-green-500/5' 
              : 'border-amber-500/30 bg-amber-500/5'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-full ${
                  systemStatus.isRunning ? 'bg-green-500/20' : 'bg-amber-500/20'
                }`}>
                  {systemStatus.isRunning ? (
                    <Activity className="h-6 w-6 text-green-500 animate-pulse" />
                  ) : (
                    <Pause className="h-6 w-6 text-amber-500" />
                  )}
                </div>
                <div>
                  <h3 className="font-medium text-foreground">
                    Sistema {systemStatus.isRunning ? 'Ativo' : 'Pausado'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {systemStatus.activeAgents} agentes • {systemStatus.activeConversations} conversas
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={restartSystem}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
                <Button 
                  variant={systemStatus.isRunning ? "destructive" : "default"}
                  onClick={toggleSystem}
                  className="gap-2"
                >
                  {systemStatus.isRunning ? (
                    <>
                      <Pause className="h-4 w-4" />
                      Pausar
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4" />
                      Retomar
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl border border-border/50 bg-card/50">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-blue-500" />
                <span className="text-sm text-muted-foreground">Conversas</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{systemStatus.activeConversations}</p>
            </div>
            <div className="p-4 rounded-xl border border-border/50 bg-card/50">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="h-4 w-4 text-green-500" />
                <span className="text-sm text-muted-foreground">Msgs/hora</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{systemStatus.messagesPerHour}</p>
            </div>
            <div className="p-4 rounded-xl border border-border/50 bg-card/50">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-4 w-4 text-amber-500" />
                <span className="text-sm text-muted-foreground">API Calls</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{systemStatus.apiCalls}</p>
            </div>
            <div className="p-4 rounded-xl border border-border/50 bg-card/50">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <span className="text-sm text-muted-foreground">Erros</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{systemStatus.errors}</p>
            </div>
          </div>

          {/* Resource Usage */}
          <div className="space-y-4">
            <h4 className="font-medium text-foreground">Uso de Recursos</h4>
            <div className="space-y-3">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">CPU</span>
                  <span className="text-foreground">{systemStatus.cpuUsage}%</span>
                </div>
                <Progress value={systemStatus.cpuUsage} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Memória</span>
                  <span className="text-foreground">{systemStatus.memoryUsage}%</span>
                </div>
                <Progress value={systemStatus.memoryUsage} className="h-2" />
              </div>
            </div>
          </div>

          <Separator />

          {/* Agent Controls */}
          <div className="space-y-4">
            <h4 className="font-medium text-foreground">Controle de Agentes</h4>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(agentStates).map(([agent, isActive]) => (
                <div 
                  key={agent}
                  className={`p-4 rounded-xl border ${
                    isActive ? 'border-green-500/30 bg-green-500/5' : 'border-border/50 bg-muted/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground capitalize">{agent}</p>
                      <Badge variant={isActive ? "default" : "outline"} className="mt-1">
                        {isActive ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                    <Switch
                      checked={isActive}
                      onCheckedChange={() => toggleAgent(agent as keyof typeof agentStates)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ControlPanelDialog;
