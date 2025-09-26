import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  ArrowLeft,
  ArrowRight,
  Target,
  Users,
  DollarSign,
  Sparkles,
  CheckCircle
} from "lucide-react";

export const CreateCampaign = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    objective: "",
    audience: "",
    budget: "",
    platforms: [] as string[],
    briefing: "",
    brandTone: ""
  });

  const steps = [
    { id: 1, title: "Briefing", icon: Target },
    { id: 2, title: "Público & Orçamento", icon: Users },
    { id: 3, title: "Plataformas", icon: DollarSign },
    { id: 4, title: "IA Generate", icon: Sparkles }
  ];

  const platforms = [
    { id: "meta", name: "Meta Ads (Facebook/Instagram)", checked: false },
    { id: "google", name: "Google Ads", checked: false },
    { id: "tiktok", name: "TikTok Ads", checked: false },
    { id: "linkedin", name: "LinkedIn Ads", checked: false }
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

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="name" className="text-sm font-medium">Nome da Campanha</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Lançamento Produto X - Janeiro 2024"
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="objective" className="text-sm font-medium">Objetivo Principal</Label>
              <Select onValueChange={(value) => setFormData({ ...formData, objective: value })}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Selecione o objetivo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sales">Vendas/Conversões</SelectItem>
                  <SelectItem value="leads">Geração de Leads</SelectItem>
                  <SelectItem value="traffic">Tráfego para Site</SelectItem>
                  <SelectItem value="awareness">Reconhecimento de Marca</SelectItem>
                  <SelectItem value="engagement">Engajamento</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="briefing" className="text-sm font-medium">Briefing Detalhado</Label>
              <Textarea
                id="briefing"
                value={formData.briefing}
                onChange={(e) => setFormData({ ...formData, briefing: e.target.value })}
                placeholder="Descreva seu produto/serviço, diferenciais, público-alvo, problemas que resolve..."
                className="mt-2 min-h-[120px]"
              />
            </div>

            <div>
              <Label htmlFor="brandTone" className="text-sm font-medium">Tom de Voz da Marca</Label>
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
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="audience" className="text-sm font-medium">Público-Alvo</Label>
              <Textarea
                id="audience"
                value={formData.audience}
                onChange={(e) => setFormData({ ...formData, audience: e.target.value })}
                placeholder="Descreva seu público ideal: idade, gênero, interesses, comportamentos, localização..."
                className="mt-2 min-h-[100px]"
              />
            </div>

            <div>
              <Label htmlFor="budget" className="text-sm font-medium">Orçamento Diário</Label>
              <Select onValueChange={(value) => setFormData({ ...formData, budget: value })}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Quanto investir por dia?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="100">R$ 100/dia</SelectItem>
                  <SelectItem value="250">R$ 250/dia</SelectItem>
                  <SelectItem value="500">R$ 500/dia</SelectItem>
                  <SelectItem value="1000">R$ 1.000/dia</SelectItem>
                  <SelectItem value="2000+">R$ 2.000+/dia</SelectItem>
                  <SelectItem value="custom">Valor Personalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="bg-muted/30 p-4 rounded-lg">
              <h4 className="font-medium text-foreground mb-2">Estimativas de Performance</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Alcance Estimado</p>
                  <p className="font-medium text-foreground">15.000 - 45.000 pessoas</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Leads Esperados</p>
                  <p className="font-medium text-foreground">30 - 90 leads/mês</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <Label className="text-sm font-medium">Selecione as Plataformas</Label>
              <div className="mt-4 space-y-3">
                {platforms.map((platform) => (
                  <div key={platform.id} className="flex items-center space-x-3">
                    <Checkbox
                      id={platform.id}
                      checked={formData.platforms.includes(platform.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setFormData({
                            ...formData,
                            platforms: [...formData.platforms, platform.id]
                          });
                        } else {
                          setFormData({
                            ...formData,
                            platforms: formData.platforms.filter(p => p !== platform.id)
                          });
                        }
                      }}
                    />
                    <Label
                      htmlFor={platform.id}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {platform.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
              <h4 className="font-medium text-primary mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Recomendação da IA
              </h4>
              <p className="text-sm text-foreground">
                Com base no seu público e objetivo, recomendamos começar com <strong>Meta Ads</strong> para alcance e <strong>Google Ads</strong> para capturar intenção de compra.
              </p>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Sparkles className="w-16 h-16 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Gerando sua Campanha com IA
              </h3>
              <p className="text-muted-foreground">
                Nossos agentes estão criando criativos, copy e configurando sua campanha...
              </p>
            </div>

            <div className="space-y-4">
              {[
                { task: "Analisando briefing e estratégia", completed: true },
                { task: "Gerando variações de copy e headlines", completed: true },
                { task: "Criando imagens e criativos", completed: true },
                { task: "Configurando segmentação e orçamento", completed: false },
                { task: "Preparando para publicação", completed: false }
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                  {item.completed ? (
                    <CheckCircle className="w-5 h-5 text-growth" />
                  ) : (
                    <div className="w-5 h-5 border-2 border-muted-foreground rounded-full animate-pulse" />
                  )}
                  <span className={`text-sm ${item.completed ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {item.task}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <a href="/campaigns">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </a>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Criar Nova Campanha</h1>
          <p className="text-muted-foreground">Assistente inteligente para campanhas automatizadas</p>
        </div>
      </div>

      {/* Progress Steps */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;
            
            return (
              <div key={step.id} className="flex items-center">
                <div className={`
                  flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors
                  ${isActive ? 'border-primary bg-primary text-primary-foreground' : 
                    isCompleted ? 'border-growth bg-growth text-white' : 
                    'border-muted-foreground bg-background text-muted-foreground'}
                `}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="ml-3">
                  <p className={`text-sm font-medium ${isActive ? 'text-primary' : isCompleted ? 'text-growth' : 'text-muted-foreground'}`}>
                    {step.title}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-0.5 mx-4 ${isCompleted ? 'bg-growth' : 'bg-muted'}`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Step Content */}
        <div className="min-h-[400px]">
          {renderStepContent()}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-6 border-t border-border">
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
            {currentStep === steps.length ? 'Finalizar' : 'Próximo'}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </Card>
    </div>
  );
};