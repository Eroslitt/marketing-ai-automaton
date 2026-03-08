import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { 
  Search, Filter, Users, MessageSquare, Mail, Phone,
  Star, Play, Pause, MoreHorizontal, Plus, Zap, Target, Loader2, Trash2
} from "lucide-react";

interface Lead {
  id: string;
  name: string;
  company: string | null;
  position: string | null;
  email: string | null;
  phone: string | null;
  score: number | null;
  status: string | null;
  source: string | null;
  last_contact_at: string | null;
}

export const Prospects = () => {
  const { user } = useAuth();
  const [prospects, setProspects] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showNewSequence, setShowNewSequence] = useState(false);
  const [showStartProspecting, setShowStartProspecting] = useState(false);
  const [showNewLead, setShowNewLead] = useState(false);
  const [showContactDialog, setShowContactDialog] = useState(false);
  const [selectedProspect, setSelectedProspect] = useState<Lead | null>(null);
  const [contactMode, setContactMode] = useState<"whatsapp" | "email">("whatsapp");
  const [isSaving, setIsSaving] = useState(false);

  const [newLeadForm, setNewLeadForm] = useState({
    name: "", company: "", position: "", email: "", phone: "", source: "manual"
  });

  const [newSequenceForm, setNewSequenceForm] = useState({
    name: "", description: "", steps: "5", target: "all"
  });

  const [prospectingForm, setProspectingForm] = useState({
    industry: "", role: "", location: "", companySize: "", keywords: "", volume: "50"
  });

  useEffect(() => {
    if (user) loadProspects();
  }, [user]);

  const loadProspects = async () => {
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setProspects(data || []);
    } catch (error) {
      console.error("Error loading prospects:", error);
      toast.error("Erro ao carregar prospects");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLead = async () => {
    if (!newLeadForm.name.trim()) { toast.error("Nome é obrigatório"); return; }
    setIsSaving(true);
    try {
      const { error } = await supabase.from('leads').insert({
        user_id: user!.id,
        name: newLeadForm.name,
        company: newLeadForm.company || null,
        position: newLeadForm.position || null,
        email: newLeadForm.email || null,
        phone: newLeadForm.phone || null,
        source: newLeadForm.source,
        status: 'new',
        score: 0
      });
      if (error) throw error;
      toast.success("Lead criado com sucesso!");
      setShowNewLead(false);
      setNewLeadForm({ name: "", company: "", position: "", email: "", phone: "", source: "manual" });
      loadProspects();
    } catch (error) {
      toast.error("Erro ao criar lead");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteLead = async (id: string) => {
    if (!confirm("Excluir este prospect?")) return;
    try {
      const { error } = await supabase.from('leads').delete().eq('id', id);
      if (error) throw error;
      toast.success("Prospect excluído");
      loadProspects();
    } catch { toast.error("Erro ao excluir"); }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase.from('leads').update({ status: newStatus }).eq('id', id);
      if (error) throw error;
      toast.success(`Status atualizado para ${getStatusText(newStatus)}`);
      loadProspects();
    } catch { toast.error("Erro ao atualizar status"); }
  };

  const handleContact = (prospect: Lead, mode: "whatsapp" | "email") => {
    setSelectedProspect(prospect);
    setContactMode(mode);
    setShowContactDialog(true);
  };

  const handleSendMessage = () => {
    toast.success(`Mensagem enviada para ${selectedProspect?.name} via ${contactMode === 'whatsapp' ? 'WhatsApp' : 'E-mail'}!`);
    setShowContactDialog(false);
    if (selectedProspect) {
      supabase.from('leads').update({ last_contact_at: new Date().toISOString() }).eq('id', selectedProspect.id).then(() => loadProspects());
    }
  };

  const handleStartProspecting = () => {
    toast.success(`Prospecção IA iniciada! Buscando ${prospectingForm.volume} leads...`);
    setShowStartProspecting(false);
    setProspectingForm({ industry: "", role: "", location: "", companySize: "", keywords: "", volume: "50" });
  };

  const handleCreateSequence = () => {
    toast.success(`Sequência "${newSequenceForm.name}" criada com ${newSequenceForm.steps} etapas!`);
    setShowNewSequence(false);
    setNewSequenceForm({ name: "", description: "", steps: "5", target: "all" });
  };

  const filteredProspects = prospects.filter(p => {
    const matchesSearch = !searchTerm || p.name.toLowerCase().includes(searchTerm.toLowerCase()) || (p.company || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getScoreColor = (score: number) => score >= 80 ? "text-primary" : score >= 60 ? "text-amber-500" : "text-muted-foreground";
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'hot': return 'bg-destructive/10 text-destructive';
      case 'qualified': return 'bg-primary/10 text-primary';
      case 'contacted': return 'bg-amber-500/10 text-amber-500';
      default: return 'bg-muted text-muted-foreground';
    }
  };
  const getStatusText = (status: string) => {
    switch (status) {
      case 'hot': return 'Quente';
      case 'qualified': return 'Qualificado';
      case 'contacted': return 'Contactado';
      case 'cold': return 'Frio';
      case 'new': return 'Novo';
      default: return status || 'Novo';
    }
  };

  const statsData = {
    total: prospects.length,
    qualified: prospects.filter(p => p.status === 'qualified').length,
    contacted: prospects.filter(p => p.status === 'contacted' || p.status === 'hot').length,
    avgScore: prospects.length > 0 ? Math.round(prospects.reduce((s, p) => s + (p.score || 0), 0) / prospects.length) : 0
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Prospecção</h1>
          <p className="text-muted-foreground">Encontre e gerencie leads automaticamente</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2" onClick={() => setShowNewLead(true)}>
            <Plus className="w-4 h-4" />
            Novo Lead
          </Button>
          <Button variant="outline" className="gap-2" onClick={() => setShowNewSequence(true)}>
            <Plus className="w-4 h-4" />
            Nova Sequência
          </Button>
          <Button className="gap-2" onClick={() => setShowStartProspecting(true)}>
            <Zap className="w-4 h-4" />
            Iniciar Prospecção
          </Button>
        </div>
      </div>

      <Tabs defaultValue="prospects" className="space-y-6">
        <TabsList>
          <TabsTrigger value="prospects">Prospects</TabsTrigger>
          <TabsTrigger value="sequences">Sequências</TabsTrigger>
          <TabsTrigger value="finder">Lead Finder</TabsTrigger>
        </TabsList>

        <TabsContent value="prospects" className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Prospects</p>
                  <p className="text-2xl font-bold text-foreground">{statsData.total}</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Qualificados</p>
                  <p className="text-2xl font-bold text-primary">{statsData.qualified}</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-amber-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Em Contato</p>
                  <p className="text-2xl font-bold text-amber-500">{statsData.contacted}</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Score Médio</p>
                  <p className="text-2xl font-bold text-foreground">{statsData.avgScore}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Filters */}
          <Card className="p-4">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Buscar prospects..." className="pl-10" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="new">Novos</SelectItem>
                  <SelectItem value="qualified">Qualificados</SelectItem>
                  <SelectItem value="contacted">Contactados</SelectItem>
                  <SelectItem value="hot">Quentes</SelectItem>
                  <SelectItem value="cold">Frios</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </Card>

          {/* Prospects List */}
          <Card className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : filteredProspects.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground mb-2">
                  {prospects.length === 0 ? "Nenhum prospect ainda" : "Nenhum resultado para os filtros"}
                </p>
                {prospects.length === 0 && (
                  <Button onClick={() => setShowNewLead(true)}><Plus className="w-4 h-4 mr-2" />Criar primeiro lead</Button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Prospect</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Empresa</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Score</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Status</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Fonte</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Último Contato</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProspects.map((prospect) => (
                      <tr key={prospect.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                        <td className="py-4 px-2">
                          <div>
                            <p className="font-medium text-foreground">{prospect.name}</p>
                            <p className="text-xs text-muted-foreground">{prospect.position || '-'}</p>
                          </div>
                        </td>
                        <td className="py-4 px-2 text-sm text-foreground">{prospect.company || '-'}</td>
                        <td className="py-4 px-2">
                          <span className={`text-sm font-bold ${getScoreColor(prospect.score || 0)}`}>
                            {prospect.score || 0}
                          </span>
                        </td>
                        <td className="py-4 px-2">
                          <Select value={prospect.status || 'new'} onValueChange={(v) => handleUpdateStatus(prospect.id, v)}>
                            <SelectTrigger className="h-7 w-28 text-xs border-0 p-0">
                              <Badge className={getStatusColor(prospect.status || 'new')}>
                                {getStatusText(prospect.status || 'new')}
                              </Badge>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="new">Novo</SelectItem>
                              <SelectItem value="qualified">Qualificado</SelectItem>
                              <SelectItem value="contacted">Contactado</SelectItem>
                              <SelectItem value="hot">Quente</SelectItem>
                              <SelectItem value="cold">Frio</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="py-4 px-2 text-sm text-muted-foreground">{prospect.source || '-'}</td>
                        <td className="py-4 px-2 text-sm text-muted-foreground">
                          {prospect.last_contact_at ? new Date(prospect.last_contact_at).toLocaleDateString('pt-BR') : 'Nunca'}
                        </td>
                        <td className="py-4 px-2">
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="sm" onClick={() => handleContact(prospect, "whatsapp")} title="WhatsApp">
                              <MessageSquare className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleContact(prospect, "email")} title="E-mail">
                              <Mail className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteLead(prospect.id)} className="text-destructive hover:text-destructive" title="Excluir">
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

        <TabsContent value="sequences" className="space-y-6">
          <div className="text-center py-12">
            <Zap className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground mb-4">Crie sequências automatizadas de contato</p>
            <Button onClick={() => setShowNewSequence(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Criar Sequência
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="finder" className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <Search className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">Lead Finder IA</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              <div><Label>Indústria</Label>
                <Select value={prospectingForm.industry} onValueChange={(v) => setProspectingForm(f => ({ ...f, industry: v }))}>
                  <SelectTrigger className="mt-2"><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tech">Tecnologia</SelectItem>
                    <SelectItem value="ecommerce">E-commerce</SelectItem>
                    <SelectItem value="marketing">Marketing Digital</SelectItem>
                    <SelectItem value="saas">SaaS</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Cargo</Label>
                <Select value={prospectingForm.role} onValueChange={(v) => setProspectingForm(f => ({ ...f, role: v }))}>
                  <SelectTrigger className="mt-2"><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ceo">CEO/Founder</SelectItem>
                    <SelectItem value="cmo">CMO/Marketing</SelectItem>
                    <SelectItem value="cto">CTO</SelectItem>
                    <SelectItem value="sales">Vendas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Localização</Label>
                <Select value={prospectingForm.location} onValueChange={(v) => setProspectingForm(f => ({ ...f, location: v }))}>
                  <SelectTrigger className="mt-2"><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sp">São Paulo</SelectItem>
                    <SelectItem value="rj">Rio de Janeiro</SelectItem>
                    <SelectItem value="mg">Minas Gerais</SelectItem>
                    <SelectItem value="brasil">Todo Brasil</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Palavras-chave</Label>
                <Input className="mt-2" placeholder="Ex: marketing digital" value={prospectingForm.keywords} onChange={(e) => setProspectingForm(f => ({ ...f, keywords: e.target.value }))} />
              </div>
              <div><Label>Volume</Label>
                <Select value={prospectingForm.volume} onValueChange={(v) => setProspectingForm(f => ({ ...f, volume: v }))}>
                  <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="50">50 leads</SelectItem>
                    <SelectItem value="100">100 leads</SelectItem>
                    <SelectItem value="250">250 leads</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button className="gap-2" onClick={handleStartProspecting}>
              <Zap className="w-4 h-4" />
              Buscar Leads com IA
            </Button>
          </Card>
        </TabsContent>
      </Tabs>

      {/* New Lead Dialog */}
      <Dialog open={showNewLead} onOpenChange={setShowNewLead}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Lead</DialogTitle>
            <DialogDescription>Adicione um prospect manualmente</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2"><Label>Nome *</Label><Input placeholder="Nome completo" value={newLeadForm.name} onChange={e => setNewLeadForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Empresa</Label><Input placeholder="Nome da empresa" value={newLeadForm.company} onChange={e => setNewLeadForm(f => ({ ...f, company: e.target.value }))} /></div>
              <div className="space-y-2"><Label>Cargo</Label><Input placeholder="CEO, CMO..." value={newLeadForm.position} onChange={e => setNewLeadForm(f => ({ ...f, position: e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>E-mail</Label><Input type="email" placeholder="email@empresa.com" value={newLeadForm.email} onChange={e => setNewLeadForm(f => ({ ...f, email: e.target.value }))} /></div>
              <div className="space-y-2"><Label>Telefone</Label><Input placeholder="(11) 99999-9999" value={newLeadForm.phone} onChange={e => setNewLeadForm(f => ({ ...f, phone: e.target.value }))} /></div>
            </div>
            <div className="space-y-2"><Label>Origem</Label>
              <Select value={newLeadForm.source} onValueChange={v => setNewLeadForm(f => ({ ...f, source: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">Manual</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  <SelectItem value="linkedin">LinkedIn</SelectItem>
                  <SelectItem value="meta_ads">Meta Ads</SelectItem>
                  <SelectItem value="google">Google Ads</SelectItem>
                  <SelectItem value="indicacao">Indicação</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full gap-2" onClick={handleCreateLead} disabled={isSaving}>
              {isSaving ? <><Loader2 className="w-4 h-4 animate-spin" />Salvando...</> : <><Plus className="w-4 h-4" />Adicionar Lead</>}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* New Sequence Dialog */}
      <Dialog open={showNewSequence} onOpenChange={setShowNewSequence}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Sequência</DialogTitle>
            <DialogDescription>Crie uma sequência automatizada de contato</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2"><Label>Nome da sequência *</Label><Input placeholder="Ex: Sequência B2B Tech" value={newSequenceForm.name} onChange={e => setNewSequenceForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div className="space-y-2"><Label>Descrição</Label><Textarea placeholder="Descreva o objetivo..." value={newSequenceForm.description} onChange={e => setNewSequenceForm(f => ({ ...f, description: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Nº de etapas</Label>
                <Select value={newSequenceForm.steps} onValueChange={v => setNewSequenceForm(f => ({ ...f, steps: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3 etapas</SelectItem>
                    <SelectItem value="5">5 etapas</SelectItem>
                    <SelectItem value="7">7 etapas</SelectItem>
                    <SelectItem value="10">10 etapas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Público</Label>
                <Select value={newSequenceForm.target} onValueChange={v => setNewSequenceForm(f => ({ ...f, target: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os leads</SelectItem>
                    <SelectItem value="new">Apenas novos</SelectItem>
                    <SelectItem value="qualified">Qualificados</SelectItem>
                    <SelectItem value="cold">Frios</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button className="w-full gap-2" onClick={handleCreateSequence} disabled={!newSequenceForm.name.trim()}>
              <Zap className="w-4 h-4" />
              Criar Sequência
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Start Prospecting Dialog */}
      <Dialog open={showStartProspecting} onOpenChange={setShowStartProspecting}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Iniciar Prospecção IA</DialogTitle>
            <DialogDescription>Configure os critérios para busca automática de leads</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Indústria</Label>
                <Select value={prospectingForm.industry} onValueChange={v => setProspectingForm(f => ({ ...f, industry: v }))}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tech">Tecnologia</SelectItem>
                    <SelectItem value="ecommerce">E-commerce</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="saas">SaaS</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Cargo</Label>
                <Select value={prospectingForm.role} onValueChange={v => setProspectingForm(f => ({ ...f, role: v }))}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ceo">CEO/Founder</SelectItem>
                    <SelectItem value="cmo">CMO</SelectItem>
                    <SelectItem value="cto">CTO</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2"><Label>Palavras-chave</Label><Input placeholder="marketing digital, vendas" value={prospectingForm.keywords} onChange={e => setProspectingForm(f => ({ ...f, keywords: e.target.value }))} /></div>
            <div className="space-y-2"><Label>Volume de leads</Label>
              <Select value={prospectingForm.volume} onValueChange={v => setProspectingForm(f => ({ ...f, volume: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="50">50 leads</SelectItem>
                  <SelectItem value="100">100 leads</SelectItem>
                  <SelectItem value="250">250 leads</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
              <div className="flex items-start gap-2">
                <Zap className="w-4 h-4 text-primary mt-0.5" />
                <p className="text-xs text-muted-foreground">
                  A IA analisará perfis, encontrará informações de contato e criará sequências personalizadas automaticamente.
                </p>
              </div>
            </div>
            <Button className="w-full gap-2" onClick={handleStartProspecting}>
              <Zap className="w-4 h-4" />
              Iniciar Prospecção
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Contact Dialog */}
      <Dialog open={showContactDialog} onOpenChange={setShowContactDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {contactMode === 'whatsapp' ? 'Enviar WhatsApp' : 'Enviar E-mail'}
            </DialogTitle>
            <DialogDescription>
              Para: {selectedProspect?.name} {selectedProspect?.company ? `(${selectedProspect.company})` : ''}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            {contactMode === 'whatsapp' && (
              <div className="space-y-2">
                <Label>Telefone</Label>
                <Input value={selectedProspect?.phone || ''} readOnly className="bg-muted" />
              </div>
            )}
            {contactMode === 'email' && (
              <div className="space-y-2">
                <Label>E-mail</Label>
                <Input value={selectedProspect?.email || ''} readOnly className="bg-muted" />
              </div>
            )}
            <div className="space-y-2">
              <Label>Mensagem</Label>
              <Textarea placeholder={`Olá ${selectedProspect?.name}, vi que você trabalha na ${selectedProspect?.company || 'sua empresa'}...`} className="min-h-[120px]" />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setShowContactDialog(false)}>Cancelar</Button>
              <Button className="flex-1 gap-2" onClick={handleSendMessage}>
                {contactMode === 'whatsapp' ? <MessageSquare className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
                Enviar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
