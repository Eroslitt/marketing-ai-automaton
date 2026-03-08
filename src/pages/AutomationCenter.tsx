import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import {
  Zap, Play, Pause, Settings, Plus, GitBranch, Clock, CheckCircle,
  AlertTriangle, ArrowRight, Target, Users, MessageSquare, BarChart3,
  Bell, Timer, Trash2
} from "lucide-react";

const TRIGGER_OPTIONS = [
  { id: "lead_score_high", name: "Lead Score Alto", icon: Target },
  { id: "campaign_performance", name: "Performance Campanha", icon: BarChart3 },
  { id: "new_qualified_lead", name: "Novo Lead Qualificado", icon: Users },
  { id: "business_hours", name: "Horário Comercial", icon: Clock },
  { id: "form_submission", name: "Formulário Preenchido", icon: MessageSquare },
];

const ACTION_OPTIONS = [
  { id: "send_whatsapp", name: "WhatsApp Message" },
  { id: "send_email", name: "Enviar E-mail" },
  { id: "assign_closer", name: "Atribuir Closer" },
  { id: "pause_creative", name: "Pausar Criativo" },
  { id: "notify_team", name: "Notificar Equipe" },
  { id: "create_task", name: "Criar Tarefa" },
];

const CATEGORIES: Record<string, { name: string; color: string }> = {
  lead_management: { name: "Gestão de Leads", color: "bg-primary/10 text-primary" },
  campaign_optimization: { name: "Otimização", color: "bg-amber-500/10 text-amber-500" },
  lead_nurturing: { name: "Nutrição", color: "bg-blue-500/10 text-blue-500" },
  customer_service: { name: "Atendimento", color: "bg-green-500/10 text-green-500" },
  general: { name: "Geral", color: "bg-muted text-muted-foreground" },
};

export const AutomationCenter = () => {
  const { user } = useAuth();
  const [automations, setAutomations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [newAuto, setNewAuto] = useState({ name: "", description: "", trigger_type: "", category: "general", actions: [] as string[] });

  useEffect(() => { if (user) loadAutomations(); }, [user]);

  const loadAutomations = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("automations")
      .select("*")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false });
    setAutomations(data || []);
    setLoading(false);
  };

  const handleCreate = async () => {
    if (!user || !newAuto.name || !newAuto.trigger_type) { toast.error("Preencha nome e trigger"); return; }
    const { error } = await supabase.from("automations").insert({
      user_id: user.id,
      name: newAuto.name,
      description: newAuto.description,
      trigger_type: newAuto.trigger_type,
      actions: newAuto.actions,
      category: newAuto.category,
      status: "paused",
    });
    if (error) { toast.error("Erro: " + error.message); return; }
    toast.success("Automação criada!");
    setCreateOpen(false);
    setNewAuto({ name: "", description: "", trigger_type: "", category: "general", actions: [] });
    loadAutomations();
  };

  const toggleStatus = async (auto: any) => {
    const newStatus = auto.status === "active" ? "paused" : "active";
    await supabase.from("automations").update({ status: newStatus }).eq("id", auto.id);
    toast.success(newStatus === "active" ? "Automação ativada" : "Automação pausada");
    loadAutomations();
  };

  const deleteAuto = async (id: string) => {
    await supabase.from("automations").delete().eq("id", id);
    toast.success("Automação removida");
    loadAutomations();
  };

  const activeCount = automations.filter(a => a.status === "active").length;
  const avgSuccess = automations.length > 0 ? Math.round(automations.reduce((s, a) => s + (a.success_rate || 0), 0) / automations.length) : 0;
  const totalExecs = automations.reduce((s, a) => s + (a.executions || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Centro de Automações</h1>
          <p className="text-muted-foreground">Configure triggers e ações automatizadas</p>
        </div>
        <Button className="gap-2" onClick={() => setCreateOpen(true)}>
          <Plus className="w-4 h-4" /> Nova Automação
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4"><div className="flex items-center gap-2"><Zap className="w-5 h-5 text-primary" /><div><p className="text-sm text-muted-foreground">Ativas</p><p className="text-2xl font-bold text-primary">{activeCount}</p></div></div></Card>
        <Card className="p-4"><div className="flex items-center gap-2"><GitBranch className="w-5 h-5 text-green-500" /><div><p className="text-sm text-muted-foreground">Taxa Sucesso</p><p className="text-2xl font-bold text-green-500">{avgSuccess}%</p></div></div></Card>
        <Card className="p-4"><div className="flex items-center gap-2"><Timer className="w-5 h-5 text-amber-500" /><div><p className="text-sm text-muted-foreground">Execuções Total</p><p className="text-2xl font-bold text-amber-500">{totalExecs}</p></div></div></Card>
        <Card className="p-4"><div className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-blue-500" /><div><p className="text-sm text-muted-foreground">Total</p><p className="text-2xl font-bold text-blue-500">{automations.length}</p></div></div></Card>
      </div>

      {loading ? (
        <p className="text-muted-foreground text-center py-8">Carregando...</p>
      ) : automations.length === 0 ? (
        <Card className="p-12 text-center">
          <Zap className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">Nenhuma automação criada</h3>
          <p className="text-muted-foreground mb-4">Crie sua primeira automação para automatizar processos</p>
          <Button onClick={() => setCreateOpen(true)} className="gap-2"><Plus className="w-4 h-4" /> Nova Automação</Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {automations.map((auto) => {
            const cat = CATEGORIES[auto.category] || CATEGORIES.general;
            const actions = Array.isArray(auto.actions) ? auto.actions : [];
            return (
              <Card key={auto.id} className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-foreground">{auto.name}</h3>
                      <Badge className={cat.color} variant="outline">{cat.name}</Badge>
                    </div>
                    {auto.description && <p className="text-sm text-muted-foreground">{auto.description}</p>}
                  </div>
                  <Badge className={auto.status === "active" ? "bg-green-500/10 text-green-500" : "bg-amber-500/10 text-amber-500"}>
                    {auto.status === "active" ? <><Play className="w-3 h-3 mr-1" />Ativa</> : <><Pause className="w-3 h-3 mr-1" />Pausada</>}
                  </Badge>
                </div>

                <div className="flex items-center gap-2 mb-4 p-3 bg-muted/30 rounded-lg">
                  <div className="px-2 py-1 bg-primary/10 text-primary rounded text-xs font-medium">{auto.trigger_type}</div>
                  {actions.length > 0 && <ArrowRight className="w-3 h-3 text-muted-foreground" />}
                  {actions.slice(0, 2).map((a: string, i: number) => (
                    <div key={i} className="px-2 py-1 bg-blue-500/10 text-blue-500 rounded text-xs font-medium">{a}</div>
                  ))}
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
                  <div><p className="text-muted-foreground">Execuções</p><p className="font-medium text-foreground">{auto.executions || 0}</p></div>
                  <div><p className="text-muted-foreground">Sucesso</p><p className="font-medium text-green-500">{auto.success_rate || 0}%</p></div>
                  <div><p className="text-muted-foreground">Última</p><p className="font-medium text-foreground">{auto.last_run_at ? new Date(auto.last_run_at).toLocaleDateString("pt-BR") : "—"}</p></div>
                </div>

                <div className="flex gap-2">
                  <Button variant={auto.status === "active" ? "outline" : "default"} size="sm" className="gap-2" onClick={() => toggleStatus(auto)}>
                    {auto.status === "active" ? <><Pause className="w-3 h-3" />Pausar</> : <><Play className="w-3 h-3" />Ativar</>}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => deleteAuto(auto.id)}>
                    <Trash2 className="w-3 h-3 text-destructive" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Automação</DialogTitle>
            <DialogDescription>Configure trigger e ações para sua automação</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div><Label>Nome</Label><Input value={newAuto.name} onChange={(e) => setNewAuto({ ...newAuto, name: e.target.value })} placeholder="Ex: Lead Score Alto → WhatsApp" className="mt-2" /></div>
            <div><Label>Descrição</Label><Textarea value={newAuto.description} onChange={(e) => setNewAuto({ ...newAuto, description: e.target.value })} placeholder="Descreva a automação..." className="mt-2" /></div>
            <div>
              <Label>Trigger</Label>
              <Select value={newAuto.trigger_type} onValueChange={(v) => setNewAuto({ ...newAuto, trigger_type: v })}>
                <SelectTrigger className="mt-2"><SelectValue placeholder="Selecione o trigger" /></SelectTrigger>
                <SelectContent>{TRIGGER_OPTIONS.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Categoria</Label>
              <Select value={newAuto.category} onValueChange={(v) => setNewAuto({ ...newAuto, category: v })}>
                <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
                <SelectContent>{Object.entries(CATEGORIES).map(([k, v]) => <SelectItem key={k} value={k}>{v.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancelar</Button>
            <Button onClick={handleCreate} className="gap-2"><Plus className="w-4 h-4" />Criar</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
