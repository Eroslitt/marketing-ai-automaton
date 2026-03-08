import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Target, Users, DollarSign, Sparkles, CheckCircle } from "lucide-react";

export const CreateCampaign = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    objective: "",
    audience: "",
    budget: "",
    platforms: [] as string[],
    briefing: "",
    brandTone: "",
  });

  const steps = [
    { id: 1, title: "Briefing", icon: Target },
    { id: 2, title: "Público & Orçamento", icon: Users },
    { id: 3, title: "Plataformas", icon: DollarSign },
    { id: 4, title: "Finalizar", icon: Sparkles },
  ];

  const platforms = [
    { id: "meta", name: "Meta Ads (Facebook/Instagram)" },
    { id: "google", name: "Google Ads" },
    { id: "tiktok", name: "TikTok Ads" },
    { id: "linkedin", name: "LinkedIn Ads" },
  ];

  const handleNext = () => { if (currentStep < steps.length) setCurrentStep(currentStep + 1); };
  const handlePrevious = () => { if (currentStep > 1) setCurrentStep(currentStep - 1); };

  const handleFinish = async () => {
    if (!user) { toast.error("Você precisa estar autenticado"); return; }
    if (!formData.name) { toast.error("Nome da campanha é obrigatório"); return; }

    setSaving(true);
    const budgetNum = formData.budget === "custom" ? 0 : parseInt(formData.budget || "0") * 30;

    const { error } = await supabase.from("campaigns").insert({
      user_id: user.id,
      name: formData.name,
      objective: formData.objective || null,
      budget_total: budgetNum || null,
      status: "draft",
      start_date: new Date().toISOString(),
    });

    setSaving(false);
    if (error) { toast.error("Erro ao criar campanha: " + error.message); return; }
    toast.success("Campanha criada com sucesso!");
    navigate("/campaigns");
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="name">Nome da Campanha</Label>
              <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Ex: Lançamento Produto X" className="mt-2" />
            </div>
            <div>
              <Label>Objetivo Principal</Label>
              <Select value={formData.objective} onValueChange={(v) => setFormData({ ...formData, objective: v })}>
                <SelectTrigger className="mt-2"><SelectValue placeholder="Selecione o objetivo" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="sales">Vendas/Conversões</SelectItem>
                  <SelectItem value="leads">Geração de Leads</SelectItem>
                  <SelectItem value="traffic">Tráfego para Site</SelectItem>
                  <SelectItem value="awareness">Reconhecimento de Marca</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Briefing Detalhado</Label>
              <Textarea value={formData.briefing} onChange={(e) => setFormData({ ...formData, briefing: e.target.value })} placeholder="Descreva seu produto/serviço, diferenciais, público-alvo..." className="mt-2 min-h-[120px]" />
            </div>
            <div>
              <Label>Tom de Voz</Label>
              <Select value={formData.brandTone} onValueChange={(v) => setFormData({ ...formData, brandTone: v })}>
                <SelectTrigger className="mt-2"><SelectValue placeholder="Como sua marca se comunica?" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Profissional e Formal</SelectItem>
                  <SelectItem value="friendly">Amigável e Próximo</SelectItem>
                  <SelectItem value="bold">Ousado e Provocativo</SelectItem>
                  <SelectItem value="educational">Educativo e Informativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <div>
              <Label>Público-Alvo</Label>
              <Textarea value={formData.audience} onChange={(e) => setFormData({ ...formData, audience: e.target.value })} placeholder="Descreva seu público ideal..." className="mt-2 min-h-[100px]" />
            </div>
            <div>
              <Label>Orçamento Diário</Label>
              <Select value={formData.budget} onValueChange={(v) => setFormData({ ...formData, budget: v })}>
                <SelectTrigger className="mt-2"><SelectValue placeholder="Quanto investir por dia?" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="100">R$ 100/dia</SelectItem>
                  <SelectItem value="250">R$ 250/dia</SelectItem>
                  <SelectItem value="500">R$ 500/dia</SelectItem>
                  <SelectItem value="1000">R$ 1.000/dia</SelectItem>
                  <SelectItem value="custom">Valor Personalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <Label>Selecione as Plataformas</Label>
            <div className="mt-4 space-y-3">
              {platforms.map((p) => (
                <div key={p.id} className="flex items-center space-x-3">
                  <Checkbox id={p.id} checked={formData.platforms.includes(p.id)} onCheckedChange={(checked) => {
                    setFormData({ ...formData, platforms: checked ? [...formData.platforms, p.id] : formData.platforms.filter((x) => x !== p.id) });
                  }} />
                  <Label htmlFor={p.id} className="text-sm font-normal cursor-pointer">{p.name}</Label>
                </div>
              ))}
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Sparkles className="w-16 h-16 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">Resumo da Campanha</h3>
            </div>
            <div className="space-y-3 p-4 bg-muted/30 rounded-lg">
              {[
                { l: "Nome", v: formData.name || "—" },
                { l: "Objetivo", v: formData.objective || "—" },
                { l: "Orçamento diário", v: formData.budget ? `R$ ${formData.budget}/dia` : "—" },
                { l: "Plataformas", v: formData.platforms.join(", ") || "—" },
              ].map((r) => (
                <div key={r.l} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{r.l}</span>
                  <span className="font-medium text-foreground">{r.v}</span>
                </div>
              ))}
            </div>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate("/campaigns")}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Criar Nova Campanha</h1>
          <p className="text-muted-foreground">Assistente inteligente para campanhas automatizadas</p>
        </div>
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-8">
          {steps.map((step, i) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;
            return (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${isActive ? "border-primary bg-primary text-primary-foreground" : isCompleted ? "border-green-500 bg-green-500 text-white" : "border-muted-foreground bg-background text-muted-foreground"}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="ml-3">
                  <p className={`text-sm font-medium ${isActive ? "text-primary" : isCompleted ? "text-green-500" : "text-muted-foreground"}`}>{step.title}</p>
                </div>
                {i < steps.length - 1 && <div className={`w-16 h-0.5 mx-4 ${isCompleted ? "bg-green-500" : "bg-muted"}`} />}
              </div>
            );
          })}
        </div>

        <div className="min-h-[400px]">{renderStepContent()}</div>

        <div className="flex items-center justify-between pt-6 border-t border-border">
          <Button variant="outline" onClick={handlePrevious} disabled={currentStep === 1} className="gap-2">
            <ArrowLeft className="w-4 h-4" /> Anterior
          </Button>
          {currentStep === steps.length ? (
            <Button onClick={handleFinish} disabled={saving} className="gap-2">
              <CheckCircle className="w-4 h-4" /> {saving ? "Salvando..." : "Criar Campanha"}
            </Button>
          ) : (
            <Button onClick={handleNext} className="gap-2">
              Próximo <ArrowRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};
