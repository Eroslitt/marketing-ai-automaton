import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Settings, Save, Loader2 } from "lucide-react";

interface AgentConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agent: {
    id: string;
    name: string;
    role: string;
  } | null;
}

const AgentConfigDialog = ({ open, onOpenChange, agent }: AgentConfigDialogProps) => {
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState({
    temperature: 0.7,
    maxTokens: 500,
    personality: "balanced",
    responseDelay: 0,
    autoEscalate: true,
    escalateThreshold: 3,
    customPrompt: "",
    greetingMessage: "",
    farewellMessage: ""
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      // Simulate saving - in production, this would call an edge function
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success(`Configurações do ${agent?.name} salvas com sucesso!`);
      onOpenChange(false);
    } catch (error) {
      toast.error("Erro ao salvar configurações");
    } finally {
      setSaving(false);
    }
  };

  if (!agent) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configurar {agent.name}
          </DialogTitle>
          <DialogDescription>
            Ajuste o comportamento e personalidade do agente {agent.role}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="behavior" className="mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="behavior">Comportamento</TabsTrigger>
            <TabsTrigger value="messages">Mensagens</TabsTrigger>
            <TabsTrigger value="advanced">Avançado</TabsTrigger>
          </TabsList>

          <TabsContent value="behavior" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Personalidade</Label>
              <Select 
                value={config.personality} 
                onValueChange={(v) => setConfig({ ...config, personality: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="aggressive">Agressivo - Foco em fechar rápido</SelectItem>
                  <SelectItem value="balanced">Equilibrado - Tom profissional</SelectItem>
                  <SelectItem value="consultative">Consultivo - Foco em ajudar</SelectItem>
                  <SelectItem value="friendly">Amigável - Tom descontraído</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Temperatura (Criatividade): {config.temperature}</Label>
              <Slider
                value={[config.temperature]}
                onValueChange={([v]) => setConfig({ ...config, temperature: v })}
                min={0}
                max={1}
                step={0.1}
              />
              <p className="text-xs text-muted-foreground">
                Valores baixos = respostas mais previsíveis. Valores altos = mais criativo.
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Escalar para Humano Automaticamente</Label>
                <p className="text-xs text-muted-foreground">
                  Transferir conversa após {config.escalateThreshold} tentativas sem sucesso
                </p>
              </div>
              <Switch
                checked={config.autoEscalate}
                onCheckedChange={(v) => setConfig({ ...config, autoEscalate: v })}
              />
            </div>

            {config.autoEscalate && (
              <div className="space-y-2">
                <Label>Limite de Tentativas: {config.escalateThreshold}</Label>
                <Slider
                  value={[config.escalateThreshold]}
                  onValueChange={([v]) => setConfig({ ...config, escalateThreshold: v })}
                  min={1}
                  max={10}
                  step={1}
                />
              </div>
            )}
          </TabsContent>

          <TabsContent value="messages" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Mensagem de Saudação</Label>
              <Textarea
                placeholder="Olá! Como posso ajudar você hoje?"
                value={config.greetingMessage}
                onChange={(e) => setConfig({ ...config, greetingMessage: e.target.value })}
                className="min-h-[80px]"
              />
            </div>

            <div className="space-y-2">
              <Label>Mensagem de Despedida</Label>
              <Textarea
                placeholder="Foi um prazer ajudar! Qualquer dúvida, estou por aqui."
                value={config.farewellMessage}
                onChange={(e) => setConfig({ ...config, farewellMessage: e.target.value })}
                className="min-h-[80px]"
              />
            </div>

            <div className="space-y-2">
              <Label>Prompt Personalizado (adicional ao padrão)</Label>
              <Textarea
                placeholder="Instruções específicas para este agente..."
                value={config.customPrompt}
                onChange={(e) => setConfig({ ...config, customPrompt: e.target.value })}
                className="min-h-[100px]"
              />
            </div>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Máximo de Tokens por Resposta: {config.maxTokens}</Label>
              <Slider
                value={[config.maxTokens]}
                onValueChange={([v]) => setConfig({ ...config, maxTokens: v })}
                min={100}
                max={2000}
                step={50}
              />
            </div>

            <div className="space-y-2">
              <Label>Delay de Resposta (ms): {config.responseDelay}</Label>
              <Slider
                value={[config.responseDelay]}
                onValueChange={([v]) => setConfig({ ...config, responseDelay: v })}
                min={0}
                max={5000}
                step={500}
              />
              <p className="text-xs text-muted-foreground">
                Adiciona um delay para parecer mais humano. 0 = resposta instantânea.
              </p>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Salvar Configurações
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AgentConfigDialog;
