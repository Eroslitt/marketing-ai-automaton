import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { 
  ArrowRight,
  ArrowLeft,
  Upload,
  User,
  Building,
  Target,
  Palette,
  Bot,
  CheckCircle,
  Sparkles
} from "lucide-react";

export const Onboarding = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Dados pessoais
    name: "",
    company: "",
    document: "",
    sector: "",
    website: "",
    phone: "",
    
    // Objetivos
    objective: "",
    monthlyBudget: "",
    audience: "",
    mainChallenges: [] as string[],
    
    // Brand Kit
    brandName: "",
    brandColors: { primary: "", secondary: "" },
    brandTone: "",
    brandDescription: "",
    
    // Primeiro Projeto
    projectName: "",
    projectGoal: "",
    targetChannels: [] as string[],
    persona: "",
    
    // Agentes selecionados
    selectedAgents: [] as string[]
  });

  const steps = [
    { id: 1, title: "Dados Pessoais", icon: User, description: "Informações básicas" },
    { id: 2, title: "Objetivos", icon: Target, description: "Metas e orçamento" },
    { id: 3, title: "Brand Kit", icon: Palette, description: "Identidade visual" },
    { id: 4, title: "Primeiro Projeto", icon: Building, description: "Configuração inicial" },
    { id: 5, title: "Selecionar Agentes", icon: Bot, description: "Equipe IA personalizada" }
  ];

  const sectors = [
    "Tecnologia/SaaS", "E-commerce", "Educação", "Saúde", "Imóveis", 
    "Consultoria", "Serviços Financeiros", "Varejo", "Alimentação", "Outros"
  ];

  const objectives = [
    "Gerar mais leads qualificados",
    "Aumentar vendas online", 
    "Melhorar reconhecimento de marca",
    "Reduzir custo de aquisição",
    "Automatizar marketing",
    "Expandir para novos mercados"
  ];

  const challenges = [
    "Alto custo por lead",
    "Baixa conversão de anúncios", 
    "Falta de tempo para criar conteúdo",
    "Dificuldade em segmentar público",
    "Concorrência acirrada",
    "Falta de dados/analytics"
  ];

  const agents = [
    {
      id: "strategy",
      name: "Strategy Agent",
      description: "Cria estratégias de marketing baseadas em dados",
      icon: "🎯",
      benefits: ["Análise de mercado", "Definição de persona", "Estratégia de funil"]
    },
    {
      id: "copy",
      name: "Copy Agent", 
      description: "Gera textos persuasivos para campanhas",
      icon: "✍️",
      benefits: ["Headlines impactantes", "Descrições de anúncios", "E-mails de conversão"]
    },
    {
      id: "creative",
      name: "Creative Agent",
      description: "Produz criativos visuais automaticamente",
      icon: "🎨", 
      benefits: ["Imagens de anúncios", "Vídeos curtos", "Templates personalizados"]
    },
    {
      id: "media",
      name: "Media Agent",
      description: "Otimiza campanhas de tráfego pago",
      icon: "📊",
      benefits: ["Segmentação automática", "Otimização de lances", "Rebalanceamento de orçamento"]
    },
    {
      id: "prospect",
      name: "Prospect Agent", 
      description: "Encontra e qualifica leads automaticamente",
      icon: "🔍",
      benefits: ["Busca de leads", "Sequências de follow-up", "Scoring automático"]
    },
    {
      id: "whatsapp",
      name: "WhatsApp Agent",
      description: "Atendimento automatizado via WhatsApp",
      icon: "💬",
      benefits: ["Bot conversacional", "Qualificação de leads", "Agendamento automático"]
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleChallengeToggle = (challenge: string) => {
    setFormData(prev => ({
      ...prev,
      mainChallenges: prev.mainChallenges.includes(challenge)
        ? prev.mainChallenges.filter(c => c !== challenge)
        : [...prev.mainChallenges, challenge]
    }));
  };

  const handleChannelToggle = (channel: string) => {
    setFormData(prev => ({
      ...prev,
      targetChannels: prev.targetChannels.includes(channel)
        ? prev.targetChannels.filter(c => c !== channel)
        : [...prev.targetChannels, channel]
    }));
  };

  const handleAgentToggle = (agentId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedAgents: prev.selectedAgents.includes(agentId)
        ? prev.selectedAgents.filter(a => a !== agentId)
        : [...prev.selectedAgents, agentId]
    }));
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
              <div>
                <Label htmlFor="name">Nome Completo *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Seu nome completo"
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="company">Empresa *</Label>
                <Input
                  id="company"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  placeholder="Nome da sua empresa"
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="document">CNPJ/CPF</Label>
                <Input
                  id="document"
                  value={formData.document}
                  onChange={(e) => setFormData({ ...formData, document: e.target.value })}
                  placeholder="00.000.000/0001-00"
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="(11) 99999-9999"
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="sector">Setor *</Label>
                <Select onValueChange={(value) => setFormData({ ...formData, sector: value })}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Selecione seu setor" />
                  </SelectTrigger>
                  <SelectContent>
                    {sectors.map((sector) => (
                      <SelectItem key={sector} value={sector}>{sector}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="https://seusite.com"
                  className="mt-2"
                />
              </div>
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

            <div>
              <Label className="text-sm font-medium">Objetivo Principal *</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                {objectives.map((objective) => (
                  <div key={objective} className="flex items-center space-x-3">
                    <Checkbox
                      id={objective}
                      checked={formData.objective === objective}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setFormData({ ...formData, objective });
                        }
                      }}
                    />
                    <Label htmlFor={objective} className="text-sm cursor-pointer">
                      {objective}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="budget">Orçamento Mensal *</Label>
              <Select onValueChange={(value) => setFormData({ ...formData, monthlyBudget: value })}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Qual seu investimento mensal?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1000-5000">R$ 1.000 - R$ 5.000</SelectItem>
                  <SelectItem value="5000-15000">R$ 5.000 - R$ 15.000</SelectItem>
                  <SelectItem value="15000-50000">R$ 15.000 - R$ 50.000</SelectItem>
                  <SelectItem value="50000+">R$ 50.000+</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="audience">Público-Alvo *</Label>
              <Textarea
                id="audience"
                value={formData.audience}
                onChange={(e) => setFormData({ ...formData, audience: e.target.value })}
                placeholder="Descreva seu público ideal: idade, interesses, comportamentos, localização..."
                className="mt-2 min-h-[100px]"
              />
            </div>

            <div>
              <Label className="text-sm font-medium">Principais Desafios (selecione até 3)</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                {challenges.map((challenge) => (
                  <div key={challenge} className="flex items-center space-x-3">
                    <Checkbox
                      id={challenge}
                      checked={formData.mainChallenges.includes(challenge)}
                      onCheckedChange={() => handleChallengeToggle(challenge)}
                      disabled={formData.mainChallenges.length >= 3 && !formData.mainChallenges.includes(challenge)}
                    />
                    <Label htmlFor={challenge} className="text-sm cursor-pointer">
                      {challenge}
                    </Label>
                  </div>
                ))}
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
              <div>
                <Label htmlFor="brandName">Nome da Marca *</Label>
                <Input
                  id="brandName"
                  value={formData.brandName}
                  onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
                  placeholder="Nome da sua marca"
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="brandTone">Tom de Voz *</Label>
                <Select onValueChange={(value) => setFormData({ ...formData, brandTone: value })}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Como sua marca se comunica?" />
                  </SelectTrigger>
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

            <div>
              <Label htmlFor="brandDescription">Descrição da Marca *</Label>
              <Textarea
                id="brandDescription"
                value={formData.brandDescription}
                onChange={(e) => setFormData({ ...formData, brandDescription: e.target.value })}
                placeholder="Descreva sua marca, valores, diferenciais, história..."
                className="mt-2 min-h-[120px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="primaryColor">Cor Primária</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    id="primaryColor"
                    value={formData.brandColors.primary}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      brandColors: { ...formData.brandColors, primary: e.target.value }
                    })}
                    placeholder="#000000"
                    className="flex-1"
                  />
                  <div 
                    className="w-12 h-10 rounded border"
                    style={{ backgroundColor: formData.brandColors.primary || '#f3f4f6' }}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="secondaryColor">Cor Secundária</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    id="secondaryColor"
                    value={formData.brandColors.secondary}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      brandColors: { ...formData.brandColors, secondary: e.target.value }
                    })}
                    placeholder="#ffffff"
                    className="flex-1"
                  />
                  <div 
                    className="w-12 h-10 rounded border"
                    style={{ backgroundColor: formData.brandColors.secondary || '#f3f4f6' }}
                  />
                </div>
              </div>
            </div>

            <Card className="p-4 border-dashed border-2 border-muted-foreground/30">
              <div className="text-center">
                <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground mb-2">Upload Assets da Marca</p>
                <p className="text-xs text-muted-foreground mb-3">
                  Logo, imagens, exemplos de materiais (opcional)
                </p>
                <Button variant="outline" size="sm">
                  Selecionar Arquivos
                </Button>
              </div>
            </Card>
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
              <div>
                <Label htmlFor="projectName">Nome do Projeto *</Label>
                <Input
                  id="projectName"
                  value={formData.projectName}
                  onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                  placeholder="Ex: Lançamento Produto X"
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="projectGoal">Objetivo do Projeto *</Label>
                <Select onValueChange={(value) => setFormData({ ...formData, projectGoal: value })}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Qual o foco deste projeto?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sales">Vendas Diretas</SelectItem>
                    <SelectItem value="leads">Geração de Leads</SelectItem>
                    <SelectItem value="awareness">Reconhecimento de Marca</SelectItem>
                    <SelectItem value="traffic">Tráfego para Site</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium">Canais de Marketing *</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                {["Meta Ads", "Google Ads", "TikTok Ads", "LinkedIn Ads", "WhatsApp", "E-mail", "SMS", "YouTube"].map((channel) => (
                  <div key={channel} className="flex items-center space-x-2">
                    <Checkbox
                      id={channel}
                      checked={formData.targetChannels.includes(channel)}
                      onCheckedChange={() => handleChannelToggle(channel)}
                    />
                    <Label htmlFor={channel} className="text-sm cursor-pointer">
                      {channel}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="persona">Persona Detalhada *</Label>
              <Textarea
                id="persona"
                value={formData.persona}
                onChange={(e) => setFormData({ ...formData, persona: e.target.value })}
                placeholder="Descreva sua persona ideal: nome, idade, profissão, dores, desejos, onde consome conteúdo..."
                className="mt-2 min-h-[120px]"
              />
            </div>
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
              {agents.map((agent) => (
                <Card 
                  key={agent.id} 
                  className={`p-4 cursor-pointer transition-all border-2 ${
                    formData.selectedAgents.includes(agent.id) 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => handleAgentToggle(agent.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">{agent.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-foreground">{agent.name}</h3>
                        {formData.selectedAgents.includes(agent.id) && (
                          <CheckCircle className="w-5 h-5 text-primary" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{agent.description}</p>
                      <div className="space-y-1">
                        {agent.benefits.map((benefit, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <div className="w-1 h-1 bg-primary rounded-full" />
                            <span className="text-xs text-muted-foreground">{benefit}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <Card className="p-4 bg-primary/5 border-primary/20">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-primary" />
                <h4 className="font-medium text-primary">Recomendação da IA</h4>
              </div>
              <p className="text-sm text-foreground">
                Com base no seu perfil e objetivos, recomendamos começar com <strong>Strategy Agent</strong>, 
                <strong> Copy Agent</strong> e <strong>Media Agent</strong> para uma campanha completa.
              </p>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  const progressPercentage = ((currentStep - 1) / (steps.length - 1)) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-sm font-medium text-muted-foreground">
              Configuração Inicial
            </h1>
            <span className="text-sm text-muted-foreground">
              {currentStep} de {steps.length}
            </span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        {/* Steps Navigation */}
        <div className="flex items-center justify-center mb-8 overflow-x-auto">
          <div className="flex items-center gap-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              
              return (
                <div key={step.id} className="flex items-center">
                  <div className="flex flex-col items-center min-w-0">
                    <div className={`
                      flex items-center justify-center w-12 h-12 rounded-full border-2 transition-colors mb-2
                      ${isActive ? 'border-primary bg-primary text-primary-foreground' : 
                        isCompleted ? 'border-growth bg-growth text-white' : 
                        'border-muted-foreground bg-background text-muted-foreground'}
                    `}>
                      {isCompleted ? (
                        <CheckCircle className="w-6 h-6" />
                      ) : (
                        <Icon className="w-6 h-6" />
                      )}
                    </div>
                    <div className="text-center">
                      <p className={`text-xs font-medium ${
                        isActive ? 'text-primary' : isCompleted ? 'text-growth' : 'text-muted-foreground'
                      }`}>
                        {step.title}
                      </p>
                      <p className="text-xs text-muted-foreground hidden sm:block">
                        {step.description}
                      </p>
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-8 h-0.5 mx-4 ${isCompleted ? 'bg-growth' : 'bg-muted'}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Step Content */}
        <Card className="p-8 mb-8">
          {renderStepContent()}
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Anterior
          </Button>
          
          <Button
            onClick={handleNext}
            disabled={currentStep === steps.length}
            className="gap-2"
          >
            {currentStep === steps.length ? 'Finalizar Configuração' : 'Próximo'}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};