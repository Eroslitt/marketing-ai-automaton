import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Zap,
  Play,
  Pause,
  Settings,
  Plus,
  GitBranch,
  Clock,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  Filter,
  Calendar,
  Target,
  Users,
  MessageSquare,
  BarChart3,
  Bell,
  Code,
  Webhook,
  Timer
} from "lucide-react";

export const AutomationCenter = () => {
  const [automations] = useState([
    {
      id: 1,
      name: "Lead Score Alto → WhatsApp",
      description: "Quando lead score > 80, enviar mensagem personalizada no WhatsApp",
      trigger: "lead_score_high",
      actions: ["send_whatsapp", "assign_closer"],
      status: "active",
      executions: 156,
      successRate: 94,
      lastRun: "2024-01-22 14:30",
      category: "lead_management"
    },
    {
      id: 2,
      name: "Campanha Low Performance → Otimizar",
      description: "CPA > meta por 2h → pausar creativos ruins e redistribuir orçamento",
      trigger: "campaign_performance",
      actions: ["pause_creative", "reallocate_budget", "notify_team"],
      status: "active", 
      executions: 43,
      successRate: 87,
      lastRun: "2024-01-22 12:15",
      category: "campaign_optimization"
    },
    {
      id: 3,
      name: "Novo Lead → Sequência Nurturing",
      description: "Lead qualificado inicia sequência de e-mail + WhatsApp automática",
      trigger: "new_qualified_lead",
      actions: ["start_email_sequence", "schedule_whatsapp", "create_task"],
      status: "paused",
      executions: 89,
      successRate: 76,
      lastRun: "2024-01-21 18:22",
      category: "lead_nurturing"
    },
    {
      id: 4,
      name: "Horário Comercial → Ativar Atendimento",
      description: "8h-18h: bot ativo, fora: mensagem automática + agendamento",
      trigger: "business_hours",
      actions: ["enable_bot", "set_auto_reply", "schedule_callback"],
      status: "active",
      executions: 234,
      successRate: 100,
      lastRun: "2024-01-22 08:00",
      category: "customer_service"
    }
  ]);

  const [triggers] = useState([
    { id: "lead_score_high", name: "Lead Score Alto", icon: Target, category: "leads" },
    { id: "campaign_performance", name: "Performance Campanha", icon: BarChart3, category: "campaigns" },
    { id: "new_qualified_lead", name: "Novo Lead Qualificado", icon: Users, category: "leads" },
    { id: "business_hours", name: "Horário Comercial", icon: Clock, category: "schedule" },
    { id: "form_submission", name: "Formulário Preenchido", icon: MessageSquare, category: "leads" },
    { id: "budget_threshold", name: "Limite Orçamento", icon: AlertTriangle, category: "campaigns" },
    { id: "webhook_received", name: "Webhook Recebido", icon: Webhook, category: "integrations" }
  ]);

  const [actions] = useState([
    { id: "send_email", name: "Enviar E-mail", icon: MessageSquare, category: "communication" },
    { id: "send_whatsapp", name: "WhatsApp Message", icon: MessageSquare, category: "communication" },
    { id: "assign_closer", name: "Atribuir Closer", icon: Users, category: "assignment" },
    { id: "pause_creative", name: "Pausar Criativo", icon: Pause, category: "campaign_management" },
    { id: "reallocate_budget", name: "Redistribuir Orçamento", icon: BarChart3, category: "campaign_management" },
    { id: "notify_team", name: "Notificar Equipe", icon: Bell, category: "notifications" },
    { id: "create_task", name: "Criar Tarefa", icon: Plus, category: "task_management" },
    { id: "schedule_callback", name: "Agendar Callback", icon: Calendar, category: "scheduling" }
  ]);

  const categories = {
    lead_management: { name: "Gestão de Leads", color: "bg-primary/10 text-primary" },
    campaign_optimization: { name: "Otimização de Campanhas", color: "bg-warning/10 text-warning" },
    lead_nurturing: { name: "Nutrição de Leads", color: "bg-accent/10 text-accent" },
    customer_service: { name: "Atendimento", color: "bg-growth/10 text-growth" }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-growth/10 text-growth';
      case 'paused':
        return 'bg-warning/10 text-warning';
      case 'error':
        return 'bg-destructive/10 text-destructive';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return Play;
      case 'paused':
        return Pause;
      case 'error':
        return AlertTriangle;
      default:
        return Clock;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Centro de Automações</h1>
          <p className="text-muted-foreground">Configure triggers e ações para automatizar seus processos</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2">
            <Filter className="w-4 h-4" />
            Filtrar
          </Button>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Nova Automação
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Automações Ativas</p>
              <p className="text-2xl font-bold text-primary">
                {automations.filter(a => a.status === 'active').length}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-growth" />
            <div>
              <p className="text-sm text-muted-foreground">Taxa de Sucesso</p>
              <p className="text-2xl font-bold text-growth">89%</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Timer className="w-5 h-5 text-warning" />
            <div>
              <p className="text-sm text-muted-foreground">Execuções Hoje</p>
              <p className="text-2xl font-bold text-warning">156</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-engagement" />
            <div>
              <p className="text-sm text-muted-foreground">Economia de Tempo</p>
              <p className="text-2xl font-bold text-engagement">12h/dia</p>
            </div>
          </div>
        </Card>
      </div>

      <Tabs defaultValue="automations" className="space-y-6">
        <TabsList>
          <TabsTrigger value="automations">Automações</TabsTrigger>
          <TabsTrigger value="builder">Builder</TabsTrigger>
          <TabsTrigger value="triggers">Triggers</TabsTrigger>
          <TabsTrigger value="actions">Ações</TabsTrigger>
        </TabsList>

        <TabsContent value="automations" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {automations.map((automation) => {
              const StatusIcon = getStatusIcon(automation.status);
              const category = categories[automation.category as keyof typeof categories];
              
              return (
                <Card key={automation.id} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-foreground">{automation.name}</h3>
                        <Badge className={category.color} variant="outline">
                          {category.name}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {automation.description}
                      </p>
                    </div>
                    
                    <Badge className={getStatusColor(automation.status)}>
                      <StatusIcon className="w-3 h-3 mr-1" />
                      {automation.status === 'active' ? 'Ativa' :
                       automation.status === 'paused' ? 'Pausada' : 'Erro'}
                    </Badge>
                  </div>

                  {/* Flow Visualization */}
                  <div className="flex items-center gap-2 mb-4 p-3 bg-muted/30 rounded-lg">
                    <div className="px-2 py-1 bg-primary/10 text-primary rounded text-xs font-medium">
                      Trigger
                    </div>
                    <ArrowRight className="w-3 h-3 text-muted-foreground" />
                    <div className="flex gap-1">
                      {automation.actions.slice(0, 2).map((action, index) => (
                        <div key={index} className="px-2 py-1 bg-accent/10 text-accent rounded text-xs font-medium">
                          {actions.find(a => a.id === action)?.name.split(' ')[0] || action}
                        </div>
                      ))}
                      {automation.actions.length > 2 && (
                        <div className="px-2 py-1 bg-muted text-muted-foreground rounded text-xs font-medium">
                          +{automation.actions.length - 2}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Execuções</p>
                      <p className="font-medium text-foreground">{automation.executions}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Sucesso</p>
                      <p className="font-medium text-growth">{automation.successRate}%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Última</p>
                      <p className="font-medium text-foreground">{automation.lastRun}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    {automation.status === 'active' ? (
                      <Button variant="outline" size="sm" className="gap-2">
                        <Pause className="w-3 h-3" />
                        Pausar
                      </Button>
                    ) : (
                      <Button size="sm" className="gap-2">
                        <Play className="w-3 h-3" />
                        Ativar
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

        <TabsContent value="builder" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-6">Criar Nova Automação</h3>
            
            <div className="space-y-6">
              {/* Step 1: Trigger */}
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-primary">1</span>
                  </div>
                  <h4 className="font-semibold text-foreground">Selecionar Trigger</h4>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Tipo de Trigger</Label>
                    <Select>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Escolha o evento que inicia a automação" />
                      </SelectTrigger>
                      <SelectContent>
                        {triggers.map(trigger => {
                          const Icon = trigger.icon;
                          return (
                            <SelectItem key={trigger.id} value={trigger.id}>
                              <div className="flex items-center gap-2">
                                <Icon className="w-4 h-4" />
                                {trigger.name}
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label>Condições</Label>
                    <Input
                      className="mt-2"
                      placeholder="Ex: lead_score > 80"
                    />
                  </div>
                </div>
              </Card>

              {/* Step 2: Actions */}
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-accent">2</span>
                  </div>
                  <h4 className="font-semibold text-foreground">Configurar Ações</h4>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Primeira Ação</Label>
                      <Select>
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="O que fazer quando o trigger acontecer" />
                        </SelectTrigger>
                        <SelectContent>
                          {actions.map(action => {
                            const Icon = action.icon;
                            return (
                              <SelectItem key={action.id} value={action.id}>
                                <div className="flex items-center gap-2">
                                  <Icon className="w-4 h-4" />
                                  {action.name}
                                </div>
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label>Delay (opcional)</Label>
                      <Input
                        className="mt-2"
                        placeholder="Ex: 5 minutos"
                      />
                    </div>
                  </div>
                  
                  <Button variant="outline" size="sm" className="gap-2">
                    <Plus className="w-4 h-4" />
                    Adicionar Ação
                  </Button>
                </div>
              </Card>

              {/* Step 3: Settings */}
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-growth/10 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-growth">3</span>
                  </div>
                  <h4 className="font-semibold text-foreground">Configurações</h4>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="automation-name">Nome da Automação</Label>
                    <Input
                      id="automation-name"
                      className="mt-2"
                      placeholder="Digite um nome descritivo"
                    />
                  </div>
                  
                  <div>
                    <Label>Categoria</Label>
                    <Select>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Organizar por categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(categories).map(([key, category]) => (
                          <SelectItem key={key} value={key}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-2">
                    <Switch />
                    <Label>Ativar imediatamente</Label>
                  </div>
                </div>
              </Card>

              <div className="flex gap-2">
                <Button className="gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Criar Automação
                </Button>
                <Button variant="outline" className="gap-2">
                  <Code className="w-4 h-4" />
                  Testar
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="triggers" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {triggers.map(trigger => {
              const Icon = trigger.icon;
              
              return (
                <Card key={trigger.id} className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">{trigger.name}</h4>
                      <p className="text-xs text-muted-foreground capitalize">{trigger.category}</p>
                    </div>
                  </div>
                  
                  <div className="text-xs text-muted-foreground">
                    Usado em {Math.floor(Math.random() * 10) + 1} automações
                  </div>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="actions" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {actions.map(action => {
              const Icon = action.icon;
              
              return (
                <Card key={action.id} className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                      <Icon className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">{action.name}</h4>
                      <p className="text-xs text-muted-foreground capitalize">{action.category.replace('_', ' ')}</p>
                    </div>
                  </div>
                  
                  <div className="text-xs text-muted-foreground">
                    Usado em {Math.floor(Math.random() * 15) + 1} automações
                  </div>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};