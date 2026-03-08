import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { 
  Users, DollarSign, TrendingUp, Calendar, Plus, Phone, Mail,
  MessageSquare, MoreHorizontal, Eye, Edit, Trash2, Loader2, GripVertical
} from "lucide-react";

interface Lead {
  id: string;
  name: string;
  company: string | null;
  email: string | null;
  phone: string | null;
  score: number | null;
  status: string | null;
  source: string | null;
  position: string | null;
  last_contact_at: string | null;
  created_at: string;
}

const stages = [
  { id: "new", name: "Novo Lead", color: "bg-muted" },
  { id: "qualified", name: "Qualificado", color: "bg-primary/20" },
  { id: "contacted", name: "Contactado", color: "bg-amber-500/20" },
  { id: "hot", name: "Quente", color: "bg-destructive/20" },
  { id: "cold", name: "Frio", color: "bg-muted" },
];

export const CRM = () => {
  const { user } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewLead, setShowNewLead] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [draggedLead, setDraggedLead] = useState<Lead | null>(null);
  const [dragOverStage, setDragOverStage] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "", company: "", email: "", phone: "", position: "", source: "whatsapp", status: "new"
  });

  useEffect(() => {
    if (user) loadLeads();
  }, [user]);

  const loadLeads = async () => {
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setLeads(data || []);
    } catch (error) {
      toast.error("Erro ao carregar leads");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!form.name.trim()) { toast.error("Nome é obrigatório"); return; }
    setIsSaving(true);
    try {
      const { error } = await supabase.from('leads').insert({
        user_id: user!.id,
        name: form.name,
        company: form.company || null,
        email: form.email || null,
        phone: form.phone || null,
        position: form.position || null,
        source: form.source,
        status: form.status,
        score: 0
      });
      if (error) throw error;
      toast.success("Lead criado!");
      setShowNewLead(false);
      setForm({ name: "", company: "", email: "", phone: "", position: "", source: "whatsapp", status: "new" });
      loadLeads();
    } catch { toast.error("Erro ao criar lead"); }
    finally { setIsSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir este lead?")) return;
    try {
      const { error } = await supabase.from('leads').delete().eq('id', id);
      if (error) throw error;
      toast.success("Lead excluído");
      setShowDetail(false);
      loadLeads();
    } catch { toast.error("Erro ao excluir"); }
  };

  const handleStatusChange = async (leadId: string, newStatus: string) => {
    try {
      const { error } = await supabase.from('leads').update({ status: newStatus }).eq('id', leadId);
      if (error) throw error;
      setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: newStatus } : l));
      toast.success(`Movido para ${stages.find(s => s.id === newStatus)?.name}`);
    } catch { toast.error("Erro ao mover lead"); }
  };

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, lead: Lead) => {
    setDraggedLead(lead);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', lead.id);
    // Make the drag image slightly transparent
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '0.5';
    }
  };

  const handleDragEnd = (e: React.DragEvent) => {
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '1';
    }
    setDraggedLead(null);
    setDragOverStage(null);
  };

  const handleDragOver = (e: React.DragEvent, stageId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverStage(stageId);
  };

  const handleDragLeave = () => {
    setDragOverStage(null);
  };

  const handleDrop = (e: React.DragEvent, stageId: string) => {
    e.preventDefault();
    setDragOverStage(null);
    if (draggedLead && draggedLead.status !== stageId) {
      handleStatusChange(draggedLead.id, stageId);
    }
    setDraggedLead(null);
  };

  const getLeadsByStage = (stageId: string) => leads.filter(l => (l.status || 'new') === stageId);

  const totalLeads = leads.length;
  const hotLeads = leads.filter(l => l.status === 'hot').length;
  const qualifiedLeads = leads.filter(l => l.status === 'qualified').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">CRM Pipeline</h1>
          <p className="text-muted-foreground">Arraste e solte leads entre as colunas</p>
        </div>
        <Button className="gap-2" onClick={() => setShowNewLead(true)}>
          <Plus className="w-4 h-4" />
          Novo Lead
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Total Leads</p>
              <p className="text-2xl font-bold text-foreground">{totalLeads}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Qualificados</p>
              <p className="text-2xl font-bold text-primary">{qualifiedLeads}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-destructive" />
            <div>
              <p className="text-sm text-muted-foreground">Quentes</p>
              <p className="text-2xl font-bold text-destructive">{hotLeads}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-amber-500" />
            <div>
              <p className="text-sm text-muted-foreground">Conversão</p>
              <p className="text-2xl font-bold text-foreground">
                {totalLeads > 0 ? Math.round((hotLeads / totalLeads) * 100) : 0}%
              </p>
            </div>
          </div>
        </Card>
      </div>

      <Tabs defaultValue="pipeline" className="space-y-6">
        <TabsList>
          <TabsTrigger value="pipeline">Pipeline Kanban</TabsTrigger>
          <TabsTrigger value="list">Lista</TabsTrigger>
        </TabsList>

        {/* Kanban Pipeline */}
        <TabsContent value="pipeline" className="space-y-6">
          {leads.length === 0 ? (
            <div className="text-center py-16">
              <Users className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
              <p className="text-lg text-muted-foreground mb-4">Nenhum lead no pipeline</p>
              <Button onClick={() => setShowNewLead(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Criar primeiro lead
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto pb-4">
              <div className="flex gap-4 min-w-max">
                {stages.map((stage) => {
                  const stageLeads = getLeadsByStage(stage.id);
                  const isOver = dragOverStage === stage.id;

                  return (
                    <div
                      key={stage.id}
                      className={`w-72 flex-shrink-0 rounded-xl border-2 transition-colors ${
                        isOver
                          ? 'border-primary bg-primary/5'
                          : 'border-border bg-card/50'
                      }`}
                      onDragOver={(e) => handleDragOver(e, stage.id)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, stage.id)}
                    >
                      {/* Column Header */}
                      <div className="p-4 border-b border-border">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${stage.color.replace('/20', '')}`} />
                            <h3 className="font-semibold text-foreground text-sm">{stage.name}</h3>
                          </div>
                          <Badge variant="outline" className="text-xs">{stageLeads.length}</Badge>
                        </div>
                      </div>

                      {/* Cards */}
                      <div className="p-2 space-y-2 min-h-[200px]">
                        {stageLeads.map((lead) => (
                          <div
                            key={lead.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, lead)}
                            onDragEnd={handleDragEnd}
                            className={`p-3 rounded-lg border border-border bg-background hover:shadow-md transition-all cursor-grab active:cursor-grabbing ${
                              draggedLead?.id === lead.id ? 'opacity-50 scale-95' : ''
                            }`}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2 min-w-0">
                                <GripVertical className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                                <div className="min-w-0">
                                  <h4 className="font-medium text-foreground text-sm truncate">{lead.name}</h4>
                                  <p className="text-xs text-muted-foreground truncate">{lead.company || lead.position || '-'}</p>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 flex-shrink-0"
                                onClick={() => { setSelectedLead(lead); setShowDetail(true); }}
                              >
                                <Eye className="w-3 h-3" />
                              </Button>
                            </div>

                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">{lead.source || '-'}</span>
                              {lead.score != null && (
                                <Badge variant="outline" className="text-xs px-1.5 py-0">
                                  {lead.score} pts
                                </Badge>
                              )}
                            </div>

                            {lead.last_contact_at && (
                              <p className="text-xs text-muted-foreground mt-2">
                                Contato: {new Date(lead.last_contact_at).toLocaleDateString('pt-BR')}
                              </p>
                            )}

                            <div className="flex gap-1 mt-2">
                              {lead.phone && (
                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => toast.info(`Ligar: ${lead.phone}`)}>
                                  <Phone className="w-3 h-3" />
                                </Button>
                              )}
                              {lead.email && (
                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => toast.info(`Email: ${lead.email}`)}>
                                  <Mail className="w-3 h-3" />
                                </Button>
                              )}
                              <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => toast.info("Abrir WhatsApp")}>
                                <MessageSquare className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        ))}

                        {stageLeads.length === 0 && !isOver && (
                          <div className="text-center py-8 text-xs text-muted-foreground">
                            Arraste leads aqui
                          </div>
                        )}

                        {isOver && (
                          <div className="border-2 border-dashed border-primary rounded-lg p-4 text-center text-xs text-primary">
                            Soltar aqui
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </TabsContent>

        {/* List View */}
        <TabsContent value="list" className="space-y-6">
          <Card className="p-6">
            {leads.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">Nenhum lead cadastrado</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Lead</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Empresa</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Score</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Status</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Fonte</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leads.map((lead) => (
                      <tr key={lead.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                        <td className="py-4 px-2">
                          <div className="flex items-center gap-3">
                            <Avatar className="w-8 h-8">
                              <AvatarFallback className="text-xs">
                                {lead.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-foreground text-sm">{lead.name}</p>
                              <p className="text-xs text-muted-foreground">{lead.email || '-'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-2 text-sm text-foreground">{lead.company || '-'}</td>
                        <td className="py-4 px-2 text-sm font-bold text-foreground">{lead.score || 0}</td>
                        <td className="py-4 px-2">
                          <Select value={lead.status || 'new'} onValueChange={(v) => handleStatusChange(lead.id, v)}>
                            <SelectTrigger className="h-7 w-28 text-xs border-0 p-0">
                              <Badge className={stages.find(s => s.id === lead.status)?.color || 'bg-muted'}>
                                {stages.find(s => s.id === lead.status)?.name || 'Novo'}
                              </Badge>
                            </SelectTrigger>
                            <SelectContent>
                              {stages.map(s => (
                                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="py-4 px-2 text-sm text-muted-foreground">{lead.source || '-'}</td>
                        <td className="py-4 px-2">
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="sm" onClick={() => { setSelectedLead(lead); setShowDetail(true); }}>
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => handleDelete(lead.id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>

      {/* New Lead Dialog */}
      <Dialog open={showNewLead} onOpenChange={setShowNewLead}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Lead</DialogTitle>
            <DialogDescription>Adicione um lead ao pipeline</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>Nome *</Label>
              <Input placeholder="Nome completo" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Empresa</Label>
                <Input placeholder="Nome da empresa" value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Cargo</Label>
                <Input placeholder="CEO, CMO..." value={form.position} onChange={e => setForm(f => ({ ...f, position: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>E-mail</Label>
                <Input type="email" placeholder="email@empresa.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Telefone</Label>
                <Input placeholder="(11) 99999-9999" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Origem</Label>
                <Select value={form.source} onValueChange={v => setForm(f => ({ ...f, source: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                    <SelectItem value="linkedin">LinkedIn</SelectItem>
                    <SelectItem value="meta_ads">Meta Ads</SelectItem>
                    <SelectItem value="google">Google Ads</SelectItem>
                    <SelectItem value="indicacao">Indicação</SelectItem>
                    <SelectItem value="manual">Manual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Estágio inicial</Label>
                <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {stages.map(s => (
                      <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button className="w-full gap-2" onClick={handleCreate} disabled={isSaving}>
              {isSaving ? <><Loader2 className="w-4 h-4 animate-spin" />Salvando...</> : <><Plus className="w-4 h-4" />Adicionar Lead</>}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Lead Detail Dialog */}
      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedLead?.name}</DialogTitle>
            <DialogDescription>{selectedLead?.company || selectedLead?.position || 'Lead'}</DialogDescription>
          </DialogHeader>
          {selectedLead && (
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">E-mail</p>
                  <p className="text-foreground">{selectedLead.email || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Telefone</p>
                  <p className="text-foreground">{selectedLead.phone || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Score</p>
                  <p className="text-foreground font-bold">{selectedLead.score || 0} pts</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Fonte</p>
                  <p className="text-foreground">{selectedLead.source || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge className={stages.find(s => s.id === selectedLead.status)?.color || 'bg-muted'}>
                    {stages.find(s => s.id === selectedLead.status)?.name || 'Novo'}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Último contato</p>
                  <p className="text-foreground">
                    {selectedLead.last_contact_at ? new Date(selectedLead.last_contact_at).toLocaleDateString('pt-BR') : 'Nunca'}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Mover para</Label>
                <Select value={selectedLead.status || 'new'} onValueChange={(v) => { handleStatusChange(selectedLead.id, v); setSelectedLead({ ...selectedLead, status: v }); }}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {stages.map(s => (
                      <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                {selectedLead.phone && (
                  <Button variant="outline" className="flex-1 gap-2" onClick={() => toast.info(`Ligar: ${selectedLead.phone}`)}>
                    <Phone className="w-4 h-4" />Ligar
                  </Button>
                )}
                {selectedLead.email && (
                  <Button variant="outline" className="flex-1 gap-2" onClick={() => toast.info(`Email: ${selectedLead.email}`)}>
                    <Mail className="w-4 h-4" />Email
                  </Button>
                )}
                <Button variant="outline" className="flex-1 gap-2" onClick={() => toast.info("Abrir WhatsApp")}>
                  <MessageSquare className="w-4 h-4" />WhatsApp
                </Button>
              </div>

              <Button variant="destructive" className="w-full gap-2" onClick={() => handleDelete(selectedLead.id)}>
                <Trash2 className="w-4 h-4" />Excluir Lead
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
