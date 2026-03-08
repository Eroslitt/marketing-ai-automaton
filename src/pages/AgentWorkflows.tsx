import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";
import { 
  Play, Pause, Clock, CheckCircle, AlertCircle, ArrowRight, Settings, Plus, Zap, Bot, GitBranch, Timer, RefreshCw, Trash2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const agentConfig: Record<string, { name: string; icon: string; color: string }> = {
  strategy: { name: "Strategy Agent", icon: "🎯", color: "bg-primary/10 text-primary" },
  copy: { name: "Copy Agent", icon: "✍️", color: "bg-accent/10 text-accent-foreground" },
  creative: { name: "Creative Agent", icon: "🎨", color: "bg-amber-500/10 text-amber-500" },
  media: { name: "Media Agent", icon: "📊", color: "bg-orange-500/10 text-orange-500" },
  prospect: { name: "Prospect Agent", icon: "🔍", color: "bg-green-500/10 text-green-500" },
  whatsapp: { name: "WhatsApp Agent", icon: "💬", color: "bg-emerald-500/10 text-emerald-500" },
  closer: { name: "Closer Agent", icon: "💼", color: "bg-purple-500/10 text-purple-500" },
  insights: { name: "Insights Agent", icon: "📈", color: "bg-blue-500/10 text-blue-500" }
};

const allAgentKeys = Object.keys(agentConfig);

export const AgentWorkflows = () => {
  const { user } = useAuth();
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [executions, setExecutions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newForm, setNewForm] = useState({ name: "", description: "", agents: [] as string[], triggers: "" });

  useEffect(() => { if (user) loadData(); }, [user]);

  const loadData = async () => {
    try {
      const [wfRes, exRes] = await Promise.all([
        supabase.from('workflows').select('*').eq('user_id', user!.id).order('created_at', { ascending: false }),
        supabase.from('workflow_executions').select('*').eq('user_id', user!.id).order('created_at', { ascending: false }).limit(20),
      ]);
      setWorkflows(wfRes.data || []);
      setExecutions(exRes.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newForm.name.trim()) { toast.error("Nome é obrigatório"); return; }
    setSaving(true);
    try {
      const { error } = await supabase.from('workflows').insert({
        user_id: user!.id,
        name: newForm.name,
        description: newForm.description,
        agents: newForm.agents,
        triggers: newForm.triggers ? newForm.triggers.split(',').map(t => t.trim()) : [],
        status: 'inactive',
      });
      if (error) throw error;
      toast.success("Workflow criado!");
      setShowCreate(false);
      setNewForm({ name: "", description: "", agents: [], triggers: "" });
      loadData();
    } catch { toast.error("Erro ao criar workflow"); }
    finally { setSaving(false); }
  };

  const toggleStatus = async (wf: any) => {
    const newStatus = wf.status === 'running' ? 'inactive' : 'running';
    await supabase.from('workflows').update({ status: newStatus }).eq('id', wf.id);
    toast.success(newStatus === 'running' ? 'Workflow ativado' : 'Workflow pausado');
    loadData();
  };

  const deleteWorkflow = async (id: string) => {
    if (!confirm("Excluir este workflow?")) return;
    await supabase.from('workflows').delete().eq('id', id);
    toast.success("Workflow excluído");
    loadData();
  };

  const getStatusColor = (s: string) => {
    switch (s) { case 'running': return 'bg-primary/10 text-primary'; case 'completed': return 'bg-green-500/10 text-green-500'; case 'inactive': return 'bg-muted text-muted-foreground'; default: return 'bg-muted text-muted-foreground'; }
  };

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  const runningCount = workflows.filter(w => w.status === 'running').length;
  const avgSuccess = workflows.length > 0 ? Math.round(workflows.reduce((s, w) => s + (Number(w.success_rate) || 0), 0) / workflows.length) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Workflows de Agentes</h1>
          <p className="text-muted-foreground">Orquestre agentes IA em fluxos automatizados</p>
        </div>
        <Button className="gap-2" onClick={() => setShowCreate(true)}><Plus className="w-4 h-4" /> Novo Workflow</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4"><div className="flex items-center gap-2"><GitBranch className="w-5 h-5 text-primary" /><div><p className="text-sm text-muted-foreground">Total</p><p className="text-2xl font-bold text-foreground">{workflows.length}</p></div></div></Card>
        <Card className="p-4"><div className="flex items-center gap-2"><Play className="w-5 h-5 text-green-500" /><div><p className="text-sm text-muted-foreground">Ativos</p><p className="text-2xl font-bold text-green-500">{runningCount}</p></div></div></Card>
        <Card className="p-4"><div className="flex items-center gap-2"><Timer className="w-5 h-5 text-amber-500" /><div><p className="text-sm text-muted-foreground">Taxa Sucesso</p><p className="text-2xl font-bold text-amber-500">{avgSuccess}%</p></div></div></Card>
        <Card className="p-4"><div className="flex items-center gap-2"><RefreshCw className="w-5 h-5 text-primary" /><div><p className="text-sm text-muted-foreground">Execuções</p><p className="text-2xl font-bold text-primary">{executions.length}</p></div></div></Card>
      </div>

      <Tabs defaultValue="workflows" className="space-y-6">
        <TabsList>
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
          <TabsTrigger value="executions">Execuções</TabsTrigger>
        </TabsList>

        <TabsContent value="workflows" className="space-y-6">
          {workflows.length === 0 ? (
            <Card className="p-8 text-center border-dashed border-2">
              <Zap className="w-16 h-16 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">Nenhum workflow</h3>
              <p className="text-muted-foreground mb-6">Crie workflows personalizados conectando agentes IA</p>
              <Button className="gap-2" onClick={() => setShowCreate(true)}><Plus className="w-4 h-4" /> Criar Workflow</Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {workflows.map(wf => {
                const wfAgents = Array.isArray(wf.agents) ? wf.agents : [];
                const wfTriggers = Array.isArray(wf.triggers) ? wf.triggers : [];
                return (
                  <Card key={wf.id} className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground mb-1">{wf.name}</h3>
                        <p className="text-sm text-muted-foreground mb-3">{wf.description || 'Sem descrição'}</p>
                        <div className="flex items-center gap-2 mb-4 flex-wrap">
                          {wfAgents.map((agentKey: string, i: number) => {
                            const agent = agentConfig[agentKey];
                            if (!agent) return null;
                            return (
                              <div key={agentKey} className="flex items-center gap-1">
                                <div className={`px-2 py-1 rounded text-xs font-medium ${agent.color}`}>
                                  <span className="mr-1">{agent.icon}</span>{agent.name.split(' ')[0]}
                                </div>
                                {i < wfAgents.length - 1 && <ArrowRight className="w-3 h-3 text-muted-foreground" />}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      <Badge className={getStatusColor(wf.status)}>{wf.status === 'running' ? 'Ativo' : 'Inativo'}</Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                      <div><p className="text-muted-foreground">Taxa Sucesso</p><p className="font-medium text-foreground">{wf.success_rate || 0}%</p></div>
                      <div><p className="text-muted-foreground">Execuções</p><p className="font-medium text-foreground">{wf.total_runs || 0}</p></div>
                    </div>

                    {wfTriggers.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs font-medium text-muted-foreground mb-2">Triggers:</p>
                        <div className="flex gap-1 flex-wrap">{wfTriggers.map((t: string, i: number) => <Badge key={i} variant="outline" className="text-xs">{t}</Badge>)}</div>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button size="sm" variant={wf.status === 'running' ? 'outline' : 'default'} className="gap-2" onClick={() => toggleStatus(wf)}>
                        {wf.status === 'running' ? <><Pause className="w-3 h-3" /> Pausar</> : <><Play className="w-3 h-3" /> Ativar</>}
                      </Button>
                      <Button variant="ghost" size="sm" className="text-destructive" onClick={() => deleteWorkflow(wf.id)}><Trash2 className="w-3 h-3" /></Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="executions" className="space-y-6">
          {executions.length === 0 ? (
            <Card className="p-8 text-center"><p className="text-muted-foreground">Nenhuma execução registrada</p></Card>
          ) : (
            executions.map(ex => (
              <Card key={ex.id} className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="font-semibold text-foreground">Execução #{ex.id.slice(0, 8)}</p>
                    <p className="text-sm text-muted-foreground">{new Date(ex.created_at).toLocaleString('pt-BR')}</p>
                  </div>
                  <Badge className={getStatusColor(ex.status)}>{ex.status}</Badge>
                </div>
                {ex.progress !== undefined && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm"><span>Progresso</span><span>{ex.progress}%</span></div>
                    <Progress value={ex.progress} className="h-2" />
                  </div>
                )}
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Create Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Novo Workflow</DialogTitle>
            <DialogDescription>Crie um fluxo automatizado de agentes IA</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div><Label>Nome *</Label><Input value={newForm.name} onChange={e => setNewForm({ ...newForm, name: e.target.value })} placeholder="Ex: Campanha Completa B2B" className="mt-2" /></div>
            <div><Label>Descrição</Label><Textarea value={newForm.description} onChange={e => setNewForm({ ...newForm, description: e.target.value })} placeholder="Descreva o workflow..." className="mt-2" /></div>
            <div>
              <Label>Agentes (selecione a ordem)</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {allAgentKeys.map(key => {
                  const agent = agentConfig[key];
                  const isSelected = newForm.agents.includes(key);
                  return (
                    <div key={key} className={`flex items-center gap-2 p-2 rounded border cursor-pointer transition-colors ${isSelected ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}
                      onClick={() => setNewForm(f => ({ ...f, agents: isSelected ? f.agents.filter(a => a !== key) : [...f.agents, key] }))}>
                      <span>{agent.icon}</span>
                      <span className="text-sm">{agent.name.split(' ')[0]}</span>
                      {isSelected && <CheckCircle className="w-4 h-4 text-primary ml-auto" />}
                    </div>
                  );
                })}
              </div>
            </div>
            <div><Label>Triggers (separados por vírgula)</Label><Input value={newForm.triggers} onChange={e => setNewForm({ ...newForm, triggers: e.target.value })} placeholder="manual, new_campaign, lead_qualified" className="mt-2" /></div>
            <Button className="w-full" onClick={handleCreate} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />} Criar Workflow
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
