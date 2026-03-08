import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import {
  Bot, Settings, Mic, Volume2, Brain, Zap, TestTube, Play, Save, RefreshCw,
  BarChart3, MessageCircle, Headphones, Square, Activity
} from "lucide-react";

const AGENT_TYPES = [
  { key: "whatsapp", name: "WhatsApp Agent", icon: "💬", description: "Atendimento conversacional inteligente", type: "conversational" },
  { key: "closer", name: "Closer Agent", icon: "💼", description: "Especialista em fechamento de vendas", type: "conversational" },
  { key: "strategy", name: "Strategy Agent", icon: "🎯", description: "Planejamento estratégico", type: "analytical" },
  { key: "copy", name: "Copy Agent", icon: "✍️", description: "Geração de conteúdo persuasivo", type: "creative" },
];

const VOICE_MODELS = [
  { id: "eleven_multilingual_v2", name: "Multilingual v2", description: "Mais natural, 29 idiomas" },
  { id: "eleven_turbo_v2_5", name: "Turbo v2.5", description: "Baixa latência, 32 idiomas" },
];

const VOICES = [
  { id: "9BWtsMINqrJLrRacOk9x", name: "Aria", description: "Feminina, profissional" },
  { id: "EXAVITQu4vr4xnSDxMaL", name: "Sarah", description: "Feminina, amigável" },
  { id: "IKne3meq5aSn9XLyUdCD", name: "Charlie", description: "Masculina, confiante" },
  { id: "TX3LPaxmHKxFdv7VOQHJ", name: "Liam", description: "Masculina, casual" },
];

export const AgentStudio = () => {
  const { user } = useAuth();
  const [selectedAgent, setSelectedAgent] = useState("whatsapp");
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [temperature, setTemperature] = useState([0.7]);
  const [maxTokens, setMaxTokens] = useState("2048");
  const [voiceModel, setVoiceModel] = useState("");
  const [voiceId, setVoiceId] = useState("");
  const [voiceSpeed, setVoiceSpeed] = useState([1.0]);
  const [agentSettings, setAgentSettings] = useState({ learning: false, autoOptimize: true, contextPersist: true, humanHandover: true });

  useEffect(() => { if (user) loadConfig(selectedAgent); }, [user, selectedAgent]);

  const loadConfig = async (agentType: string) => {
    setLoading(true);
    const { data } = await supabase
      .from("agent_configs")
      .select("*")
      .eq("user_id", user!.id)
      .eq("agent_type", agentType)
      .maybeSingle();

    const agentMeta = AGENT_TYPES.find(a => a.key === agentType)!;
    if (data) {
      setConfig(data);
      setName(data.name);
      setDescription(data.description || "");
      setSystemPrompt(data.system_prompt || "");
      setTemperature([Number(data.temperature) || 0.7]);
      setMaxTokens(String(data.max_tokens || 2048));
      setVoiceModel(data.voice_model || "");
      setVoiceId(data.voice_id || "");
      setVoiceSpeed([Number(data.voice_speed) || 1.0]);
      setAgentSettings(data.settings || { learning: false, autoOptimize: true, contextPersist: true, humanHandover: true });
    } else {
      setConfig(null);
      setName(agentMeta.name);
      setDescription(agentMeta.description);
      setSystemPrompt(`Você é um ${agentMeta.name.toLowerCase()} especializado.\nSeja profissional, focado em resultados e objetivo.`);
      setTemperature([0.7]);
      setMaxTokens("2048");
      setVoiceModel("");
      setVoiceId("");
      setVoiceSpeed([1.0]);
      setAgentSettings({ learning: false, autoOptimize: true, contextPersist: true, humanHandover: true });
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const payload = {
      user_id: user.id,
      agent_type: selectedAgent,
      name,
      description,
      system_prompt: systemPrompt,
      temperature: temperature[0],
      max_tokens: parseInt(maxTokens),
      voice_model: voiceModel || null,
      voice_id: voiceId || null,
      voice_speed: voiceSpeed[0],
      settings: agentSettings,
    };

    let error;
    if (config?.id) {
      ({ error } = await supabase.from("agent_configs").update(payload).eq("id", config.id));
    } else {
      ({ error } = await supabase.from("agent_configs").insert(payload));
    }
    setSaving(false);
    if (error) { toast.error("Erro ao salvar: " + error.message); return; }
    toast.success("Configurações salvas!");
    loadConfig(selectedAgent);
  };

  const agentMeta = AGENT_TYPES.find(a => a.key === selectedAgent)!;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Agent Studio</h1>
          <p className="text-muted-foreground">Configure e treine seus agentes IA</p>
        </div>
        <Button className="gap-2" onClick={handleSave} disabled={saving}>
          <Save className="w-4 h-4" /> {saving ? "Salvando..." : "Salvar"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="p-4">
          <h3 className="font-semibold text-foreground mb-4">Selecionar Agente</h3>
          <div className="space-y-2">
            {AGENT_TYPES.map((agent) => (
              <button key={agent.key} onClick={() => setSelectedAgent(agent.key)}
                className={`w-full p-3 text-left rounded-lg transition-colors ${selectedAgent === agent.key ? "bg-primary/10 border border-primary/20" : "hover:bg-muted/60"}`}>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{agent.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground text-sm">{agent.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{agent.description}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </Card>

        <div className="lg:col-span-3">
          {loading ? (
            <Card className="p-6"><p className="text-muted-foreground">Carregando...</p></Card>
          ) : (
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-3xl">{agentMeta.icon}</span>
                <div>
                  <h2 className="text-xl font-semibold text-foreground">{name}</h2>
                  <p className="text-muted-foreground">{description}</p>
                </div>
                <Badge variant="outline" className="ml-auto">{agentMeta.type}</Badge>
                {config && <Badge className="bg-green-500/10 text-green-500">Configurado</Badge>}
              </div>

              <Tabs defaultValue="general" className="space-y-6">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="general">Geral</TabsTrigger>
                  <TabsTrigger value="voice">Voice AI</TabsTrigger>
                  <TabsTrigger value="prompts">Prompts</TabsTrigger>
                </TabsList>

                <TabsContent value="general" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div><Label>Nome do Agente</Label><Input value={name} onChange={(e) => setName(e.target.value)} className="mt-2" /></div>
                      <div><Label>Descrição</Label><Textarea value={description} onChange={(e) => setDescription(e.target.value)} className="mt-2" /></div>
                    </div>
                    <div className="space-y-4">
                      <Label>Configurações</Label>
                      <div className="mt-3 space-y-3">
                        {([["Modo Aprendizado", "learning"], ["Auto-otimização", "autoOptimize"], ["Contexto Persistente", "contextPersist"], ["Handover Humano", "humanHandover"]] as const).map(([label, key]) => (
                          <div key={key} className="flex items-center justify-between">
                            <span className="text-sm text-foreground">{label}</span>
                            <Switch checked={agentSettings[key]} onCheckedChange={(v) => setAgentSettings({ ...agentSettings, [key]: v })} />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="voice" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label>Modelo de Voz</Label>
                        <Select value={voiceModel} onValueChange={setVoiceModel}>
                          <SelectTrigger className="mt-2"><SelectValue placeholder="Selecione" /></SelectTrigger>
                          <SelectContent>{VOICE_MODELS.map(m => <SelectItem key={m.id} value={m.id}>{m.name} — {m.description}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Voz</Label>
                        <Select value={voiceId} onValueChange={setVoiceId}>
                          <SelectTrigger className="mt-2"><SelectValue placeholder="Selecione" /></SelectTrigger>
                          <SelectContent>{VOICES.map(v => <SelectItem key={v.id} value={v.id}>{v.name} — {v.description}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Velocidade: {voiceSpeed[0].toFixed(1)}x</Label>
                        <Slider value={voiceSpeed} onValueChange={setVoiceSpeed} min={0.5} max={2} step={0.1} className="mt-3" />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <Card className="p-4 bg-primary/5 border-primary/20">
                        <div className="flex items-start gap-3">
                          <Headphones className="w-5 h-5 text-primary mt-1" />
                          <div>
                            <h4 className="font-medium text-primary mb-1">ElevenLabs Voice AI</h4>
                            <p className="text-sm text-foreground">Voz IA já configurada via Lovable Cloud</p>
                          </div>
                        </div>
                      </Card>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="prompts" className="space-y-6">
                  <div><Label>System Prompt</Label><Textarea value={systemPrompt} onChange={(e) => setSystemPrompt(e.target.value)} className="mt-2 min-h-[200px] font-mono text-sm" /></div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Temperature: {temperature[0].toFixed(1)}</Label>
                      <Slider value={temperature} onValueChange={setTemperature} min={0} max={1} step={0.1} className="mt-3" />
                      <div className="flex justify-between text-xs text-muted-foreground mt-1"><span>Determinístico</span><span>Criativo</span></div>
                    </div>
                    <div>
                      <Label>Max Tokens</Label>
                      <Select value={maxTokens} onValueChange={setMaxTokens}>
                        <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="512">512</SelectItem>
                          <SelectItem value="1024">1024</SelectItem>
                          <SelectItem value="2048">2048</SelectItem>
                          <SelectItem value="4096">4096</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
