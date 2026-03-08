import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Loader2 } from "lucide-react";
import { 
  ArrowRight, ArrowLeft, Upload, User, Building, Target, Palette, Bot, CheckCircle, Sparkles
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export const Onboarding = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "", company: "", document: "", sector: "", website: "", phone: "",
    objective: "", monthlyBudget: "", audience: "", mainChallenges: [] as string[],
    brandName: "", brandColors: { primary: "", secondary: "" }, brandTone: "", brandDescription: "",
    projectName: "", projectGoal: "", targetChannels: [] as string[], persona: "",
    selectedAgents: [] as string[]
  });

  const steps = [
    { id: 1, title: "Dados Pessoais", icon: User, description: "Informações básicas" },
    { id: 2, title: "Objetivos", icon: Target, description: "Metas e orçamento" },
    { id: 3, title: "Brand Kit", icon: Palette, description: "Identidade visual" },
    { id: 4, title: "Primeiro Projeto", icon: Building, description: "Configuração inicial" },
    { id: 5, title: "Selecionar Agentes", icon: Bot, description: "Equipe IA personalizada" }
  ];

  const sectors = ["Tecnologia/SaaS", "E-commerce", "Educação", "Saúde", "Imóveis", "Consultoria", "Serviços Financeiros", "Varejo", "Alimentação", "Outros"];
  const objectives = ["Gerar mais leads qualificados", "Aumentar vendas online", "Melhorar reconhecimento de marca", "Reduzir custo de aquisição", "Automatizar marketing", "Expandir para novos mercados"];
  const challenges = ["Alto custo por lead", "Baixa conversão de anúncios", "Falta de tempo para criar conteúdo", "Dificuldade em segmentar público", "Concorrência acirrada", "Falta de dados/analytics"];
  const agents = [
    { id: "strategy", name: "Strategy Agent", description: "Cria estratégias de marketing baseadas em dados", icon: "🎯", benefits: ["Análise de mercado", "Definição de persona", "Estratégia de funil"] },
    { id: "copy", name: "Copy Agent", description: "Gera textos persuasivos para campanhas", icon: "✍️", benefits: ["Headlines impactantes", "Descrições de anúncios", "E-mails de conversão"] },
    { id: "creative", name: "Creative Agent", description: "Produz criativos visuais automaticamente", icon: "🎨", benefits: ["Imagens de anúncios", "Vídeos curtos", "Templates personalizados"] },
    { id: "media", name: "Media Agent", description: "Otimiza campanhas de tráfego pago", icon: "📊", benefits: ["Segmentação automática", "Otimização de lances", "Rebalanceamento de orçamento"] },
    { id: "prospect", name: "Prospect Agent", description: "Encontra e qualifica leads automaticamente", icon: "🔍", benefits: ["Busca de leads", "Sequências de follow-up", "Scoring automático"] },
    { id: "whatsapp", name: "WhatsApp Agent", description: "Atendimento automatizado via WhatsApp", icon: "💬", benefits: ["Bot conversacional", "Qualificação de leads", "Agendamento automático"] }
  ];

  const handleNext = () => { if (currentStep < steps.length) setCurrentStep(currentStep + 1); };
  const handlePrevious = () => { if (currentStep > 1) setCurrentStep(currentStep - 1); };
  const handleChallengeToggle = (challenge: string) => {
    setFormData(prev => ({ ...prev, mainChallenges: prev.mainChallenges.includes(challenge) ? prev.mainChallenges.filter(c => c !== challenge) : [...prev.mainChallenges, challenge] }));
  };
  const handleChannelToggle = (channel: string) => {
    setFormData(prev => ({ ...prev, targetChannels: prev.targetChannels.includes(channel) ? prev.targetChannels.filter(c => c !== channel) : [...prev.targetChannels, channel] }));
  };
  const handleAgentToggle = (agentId: string) => {
    setFormData(prev => ({ ...prev, selectedAgents: prev.selectedAgents.includes(agentId) ? prev.selectedAgents.filter(a => a !== agentId) : [...prev.selectedAgents, agentId] }));
  };

  const handleFinish = async () => {
    if (!user) return;
    setSaving(true);
    try {
      // Save profile
      const { error: profileError } = await supabase.from('profiles').upsert({
        user_id: user.id,
        full_name: formData.name,
        company: formData.company,
        document: formData.document,
        sector: formData.sector,
        website: formData.website,
        phone: formData.phone,
        objective: formData.objective,
        monthly_budget: formData.monthlyBudget,
        audience: formData.audience,
        main_challenges: formData.mainChallenges,
        brand_name: formData.brandName,
        brand_colors: formData.brandColors,
        brand_tone: formData.brandTone,
        brand_description: formData.brandDescription,
        selected_agents: formData.selectedAgents,
        onboarding_completed: true,
      }, { onConflict: 'user_id' });

      if (profileError) throw profileError;

      // Create first campaign if project name provided
      if (formData.projectName) {
        await supabase.from('campaigns').insert({
          user_id: user.id,
          name: formData.projectName,
          objective: formData.projectGoal,
          status: 'draft',
        });
      }

      // Log activity
      await supabase.from('activity_log').insert({
        user_id: user.id,
        action: 'Onboarding concluído',
        details: `Perfil configurado para ${formData.company || formData.name}`,
        entity_type: 'profile',
      });

      toast.success("Configuração concluída! Bem-vindo à AgênciaIA!");
      navigate("/");
    } catch (error) {
      console.error("Erro ao salvar:", error);
      toast.error("Erro ao salvar configuração");
    } finally {
      setSaving(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-2">Bem-vindo à AgênciaIA!</h2>
              <p className="text-muted-foreground">Vamos configurar sua agência automatizada por IA</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div><Label>Nome Completo *</Label><Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Seu nome completo" className="mt-2" /></div>
              <div><Label>Empresa *</Label><Input value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })} placeholder="Nome da empresa" className="mt-2" /></div>
              <div><Label>CNPJ/CPF</Label><Input value={formData.document} onChange={(e) => setFormData({ ...formData, document: e.target.value })} placeholder="00.000.000/0001-00" className="mt-2" /></div>
              <div><Label>Telefone</Label><Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="(11) 99999-9999" className="mt-2" /></div>
              <div><Label>Setor *</Label>
                <Select value={formData.sector} onValueChange={(v) => setFormData({ ...formData, sector: v })}>
                  <SelectTrigger className="mt-2"><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>{sectors.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Website</Label><Input value={formData.website} onChange={(e) => setFormData({ ...formData, website: e.target.value })} placeholder="https://seusite.com" className="mt-2" /></div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-2">Objetivos e Orçamento</h2>
              <p className="text-muted-foreground">Defina suas metas para personalizarmos a estratégia</p>
            </div>
            <div><Label>Objetivo Principal *</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                {objectives.map(o => (<div key={o} className="flex items-center space-x-3"><Checkbox checked={formData.objective === o} onCheckedChange={(c) => c && setFormData({ ...formData, objective: o })} /><Label className="text-sm cursor-pointer">{o}</Label></div>))}
              </div>
            </div>
            <div><Label>Orçamento Mensal *</Label>
              <Select value={formData.monthlyBudget} onValueChange={(v) => setFormData({ ...formData, monthlyBudget: v })}>
                <SelectTrigger className="mt-2"><SelectValue placeholder="Investimento mensal" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1000-5000">R$ 1.000 - R$ 5.000</SelectItem>
                  <SelectItem value="5000-15000">R$ 5.000 - R$ 15.000</SelectItem>
                  <SelectItem value="15000-50000">R$ 15.000 - R$ 50.000</SelectItem>
                  <SelectItem value="50000+">R$ 50.000+</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Público-Alvo *</Label><Textarea value={formData.audience} onChange={(e) => setFormData({ ...formData, audience: e.target.value })} placeholder="Descreva seu público ideal..." className="mt-2 min-h-[100px]" /></div>
            <div><Label>Principais Desafios (até 3)</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                {challenges.map(c => (<div key={c} className="flex items-center space-x-3"><Checkbox checked={formData.mainChallenges.includes(c)} onCheckedChange={() => handleChallengeToggle(c)} disabled={formData.mainChallenges.length >= 3 && !formData.mainChallenges.includes(c)} /><Label className="text-sm cursor-pointer">{c}</Label></div>))}
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-2">Brand Kit</h2>
              <p className="text-muted-foreground">Configure a identidade visual da sua marca</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div><Label>Nome da Marca *</Label><Input value={formData.brandName} onChange={(e) => setFormData({ ...formData, brandName: e.target.value })} placeholder="Nome da marca" className="mt-2" /></div>
              <div><Label>Tom de Voz *</Label>
                <Select value={formData.brandTone} onValueChange={(v) => setFormData({ ...formData, brandTone: v })}>
                  <SelectTrigger className="mt-2"><SelectValue placeholder="Como sua marca se comunica?" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">Profissional e Formal</SelectItem>
                    <SelectItem value="friendly">Amigável e Próximo</SelectItem>
                    <SelectItem value="bold">Ousado e Provocativo</SelectItem>
                    <SelectItem value="educational">Educativo e Informativo</SelectItem>
                    <SelectItem value="fun">Divertido e Descontraído</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div><Label>Descrição da Marca *</Label><Textarea value={formData.brandDescription} onChange={(e) => setFormData({ ...formData, brandDescription: e.target.value })} placeholder="Descreva sua marca, valores, diferenciais..." className="mt-2 min-h-[120px]" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Cor Primária</Label>
                <div className="flex gap-2 mt-2">
                  <Input value={formData.brandColors.primary} onChange={(e) => setFormData({ ...formData, brandColors: { ...formData.brandColors, primary: e.target.value } })} placeholder="#000000" className="flex-1" />
                  <div className="w-12 h-10 rounded border" style={{ backgroundColor: formData.brandColors.primary || '#f3f4f6' }} />
                </div>
              </div>
              <div><Label>Cor Secundária</Label>
                <div className="flex gap-2 mt-2">
                  <Input value={formData.brandColors.secondary} onChange={(e) => setFormData({ ...formData, brandColors: { ...formData.brandColors, secondary: e.target.value } })} placeholder="#ffffff" className="flex-1" />
                  <div className="w-12 h-10 rounded border" style={{ backgroundColor: formData.brandColors.secondary || '#f3f4f6' }} />
                </div>
              </div>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-2">Primeiro Projeto</h2>
              <p className="text-muted-foreground">Configure seu primeiro projeto/campanha</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div><Label>Nome do Projeto *</Label><Input value={formData.projectName} onChange={(e) => setFormData({ ...formData, projectName: e.target.value })} placeholder="Ex: Lançamento Produto X" className="mt-2" /></div>
              <div><Label>Objetivo do Projeto *</Label>
                <Select value={formData.projectGoal} onValueChange={(v) => setFormData({ ...formData, projectGoal: v })}>
                  <SelectTrigger className="mt-2"><SelectValue placeholder="Qual o foco?" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sales">Vendas Diretas</SelectItem>
                    <SelectItem value="leads">Geração de Leads</SelectItem>
                    <SelectItem value="awareness">Reconhecimento de Marca</SelectItem>
                    <SelectItem value="traffic">Tráfego para Site</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div><Label>Canais de Marketing *</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                {["Meta Ads", "Google Ads", "TikTok Ads", "LinkedIn Ads", "WhatsApp", "E-mail", "SMS", "YouTube"].map(ch => (
                  <div key={ch} className="flex items-center space-x-2"><Checkbox checked={formData.targetChannels.includes(ch)} onCheckedChange={() => handleChannelToggle(ch)} /><Label className="text-sm cursor-pointer">{ch}</Label></div>
                ))}
              </div>
            </div>
            <div><Label>Persona Detalhada *</Label><Textarea value={formData.persona} onChange={(e) => setFormData({ ...formData, persona: e.target.value })} placeholder="Descreva sua persona ideal..." className="mt-2 min-h-[120px]" /></div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-2">Selecione seus Agentes IA</h2>
              <p className="text-muted-foreground">Monte sua equipe de agentes especializados</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {agents.map(agent => (
                <Card key={agent.id} className={`p-4 cursor-pointer transition-all border-2 ${formData.selectedAgents.includes(agent.id) ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`} onClick={() => handleAgentToggle(agent.id)}>
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">{agent.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-foreground">{agent.name}</h3>
                        {formData.selectedAgents.includes(agent.id) && <CheckCircle className="w-5 h-5 text-primary" />}
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{agent.description}</p>
                      <div className="space-y-1">
                        {agent.benefits.map((b, i) => (<div key={i} className="flex items-center gap-2"><div className="w-1 h-1 bg-primary rounded-full" /><span className="text-xs text-muted-foreground">{b}</span></div>))}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
            <Card className="p-4 bg-primary/5 border-primary/20">
              <div className="flex items-center gap-2 mb-2"><Sparkles className="w-5 h-5 text-primary" /><h4 className="font-medium text-primary">Recomendação da IA</h4></div>
              <p className="text-sm text-foreground">Com base no seu perfil, recomendamos <strong>Strategy Agent</strong>, <strong>Copy Agent</strong> e <strong>Media Agent</strong>.</p>
            </Card>
          </div>
        );
      default: return null;
    }
  };

  const progressPercentage = ((currentStep - 1) / (steps.length - 1)) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-sm font-medium text-muted-foreground">Configuração Inicial</h1>
            <span className="text-sm text-muted-foreground">{currentStep} de {steps.length}</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        <div className="flex items-center justify-center mb-8 overflow-x-auto">
          <div className="flex items-center gap-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              return (
                <div key={step.id} className="flex items-center">
                  <div className="flex flex-col items-center min-w-0">
                    <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-colors mb-2 ${isActive ? 'border-primary bg-primary text-primary-foreground' : isCompleted ? 'border-green-500 bg-green-500 text-white' : 'border-muted-foreground bg-background text-muted-foreground'}`}>
                      {isCompleted ? <CheckCircle className="w-6 h-6" /> : <Icon className="w-6 h-6" />}
                    </div>
                    <div className="text-center">
                      <p className={`text-xs font-medium ${isActive ? 'text-primary' : isCompleted ? 'text-green-500' : 'text-muted-foreground'}`}>{step.title}</p>
                    </div>
                  </div>
                  {index < steps.length - 1 && <div className={`w-8 h-0.5 mx-4 ${isCompleted ? 'bg-green-500' : 'bg-muted'}`} />}
                </div>
              );
            })}
          </div>
        </div>

        <Card className="p-8 mb-8">{renderStepContent()}</Card>

        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={handlePrevious} disabled={currentStep === 1} className="gap-2">
            <ArrowLeft className="w-4 h-4" /> Anterior
          </Button>
          {currentStep === steps.length ? (
            <Button onClick={handleFinish} disabled={saving} className="gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
              Finalizar Configuração
            </Button>
          ) : (
            <Button onClick={handleNext} className="gap-2">
              Próximo <ArrowRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
