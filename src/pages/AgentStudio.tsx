import { useState } from "react";
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
import { 
  Bot,
  Settings,
  Mic,
  Volume2,
  Brain,
  Zap,
  TestTube,
  Play,
  Save,
  Copy,
  RefreshCw,
  BarChart3,
  MessageCircle,
  Headphones,
  Square,
  Activity
} from "lucide-react";

export const AgentStudio = () => {
  const [selectedAgent, setSelectedAgent] = useState("whatsapp");
  const [isRecording, setIsRecording] = useState(false);
  const [apiKey, setApiKey] = useState("");

  const agents = {
    whatsapp: {
      name: "WhatsApp Agent",
      icon: "💬",
      description: "Atendimento conversacional inteligente",
      type: "conversational",
      features: ["Voice AI", "NLP", "Context Memory", "Human Handover"]
    },
    closer: {
      name: "Closer Agent", 
      icon: "💼",
      description: "Especialista em fechamento de vendas",
      type: "conversational",
      features: ["Sales Scripts", "Objection Handling", "Proposal Generation"]
    },
    strategy: {
      name: "Strategy Agent",
      icon: "🎯", 
      description: "Planejamento estratégico de campanhas",
      type: "analytical",
      features: ["Market Analysis", "Competitor Research", "KPI Planning"]
    },
    copy: {
      name: "Copy Agent",
      icon: "✍️",
      description: "Geração de conteúdo persuasivo",
      type: "creative",
      features: ["A/B Testing", "Tone Adaptation", "Platform Optimization"]
    }
  };

  const voiceModels = [
    { id: "eleven_multilingual_v2", name: "Multilingual v2", description: "Mais natural, 29 idiomas" },
    { id: "eleven_turbo_v2_5", name: "Turbo v2.5", description: "Baixa latência, 32 idiomas" },
    { id: "eleven_turbo_v2", name: "Turbo v2", description: "Inglês, velocidade máxima" }
  ];

  const voices = [
    { id: "9BWtsMINqrJLrRacOk9x", name: "Aria", description: "Feminina, profissional" },
    { id: "EXAVITQu4vr4xnSDxMaL", name: "Sarah", description: "Feminina, amigável" },
    { id: "IKne3meq5aSn9XLyUdCD", name: "Charlie", description: "Masculina, confiante" },
    { id: "TX3LPaxmHKxFdv7VOQHJ", name: "Liam", description: "Masculina, casual" }
  ];

  const currentAgent = agents[selectedAgent as keyof typeof agents];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Agent Studio</h1>
          <p className="text-muted-foreground">Configure e treine seus agentes IA avançados</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2">
            <TestTube className="w-4 h-4" />
            Testar Agent
          </Button>
          <Button className="gap-2">
            <Save className="w-4 h-4" />
            Salvar Configurações
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Agent Selector */}
        <Card className="p-4">
          <h3 className="font-semibold text-foreground mb-4">Selecionar Agente</h3>
          <div className="space-y-2">
            {Object.entries(agents).map(([key, agent]) => (
              <button
                key={key}
                onClick={() => setSelectedAgent(key)}
                className={`w-full p-3 text-left rounded-lg transition-colors ${
                  selectedAgent === key 
                    ? 'bg-primary/10 border border-primary/20' 
                    : 'hover:bg-muted/60'
                }`}
              >
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

        {/* Configuration Panel */}
        <div className="lg:col-span-3">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-3xl">{currentAgent.icon}</span>
              <div>
                <h2 className="text-xl font-semibold text-foreground">{currentAgent.name}</h2>
                <p className="text-muted-foreground">{currentAgent.description}</p>
              </div>
              <Badge variant="outline" className="ml-auto">
                {currentAgent.type}
              </Badge>
            </div>

            <Tabs defaultValue="general" className="space-y-6">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="general">Geral</TabsTrigger>
                <TabsTrigger value="voice">Voice AI</TabsTrigger>
                <TabsTrigger value="prompts">Prompts</TabsTrigger>
                <TabsTrigger value="training">Treinamento</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>

              <TabsContent value="general" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="agent-name">Nome do Agente</Label>
                      <Input 
                        id="agent-name"
                        defaultValue={currentAgent.name}
                        className="mt-2"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="agent-description">Descrição</Label>
                      <Textarea
                        id="agent-description"
                        defaultValue={currentAgent.description}
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label htmlFor="response-style">Estilo de Resposta</Label>
                      <Select>
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="Selecione o estilo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="professional">Profissional</SelectItem>
                          <SelectItem value="friendly">Amigável</SelectItem>
                          <SelectItem value="consultative">Consultivo</SelectItem>
                          <SelectItem value="enthusiastic">Entusiástico</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label>Configurações Avançadas</Label>
                      <div className="mt-3 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-foreground">Modo Aprendizado</span>
                          <Switch />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-foreground">Auto-otimização</span>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-foreground">Contexto Persistente</span>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-foreground">Handover Humano</span>
                          <Switch defaultChecked />
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label>Nível de Criatividade</Label>
                      <div className="mt-3">
                        <Slider defaultValue={[70]} max={100} step={1} className="w-full" />
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                          <span>Conservador</span>
                          <span>70%</span>
                          <span>Criativo</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="voice" className="space-y-6">
                {/* ElevenLabs API Key */}
                <Card className="p-4 bg-primary/5 border-primary/20">
                  <div className="flex items-start gap-3">
                    <Headphones className="w-5 h-5 text-primary mt-1" />
                    <div className="flex-1">
                      <h4 className="font-medium text-primary mb-2">Configuração ElevenLabs</h4>
                      <p className="text-sm text-foreground mb-3">
                        Configure sua API key do ElevenLabs para ativar conversas por voz
                      </p>
                      <div className="space-y-3">
                        <div>
                          <Label htmlFor="elevenlabs-key">ElevenLabs API Key</Label>
                          <Input
                            id="elevenlabs-key"
                            type="password"
                            placeholder="Insira sua API key..."
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            className="mt-2"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label>Modelo de Voz</Label>
                      <Select>
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="Selecione o modelo" />
                        </SelectTrigger>
                        <SelectContent>
                          {voiceModels.map(model => (
                            <SelectItem key={model.id} value={model.id}>
                              <div>
                                <p className="font-medium">{model.name}</p>
                                <p className="text-xs text-muted-foreground">{model.description}</p>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Voz</Label>
                      <Select>
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="Selecione a voz" />
                        </SelectTrigger>
                        <SelectContent>
                          {voices.map(voice => (
                            <SelectItem key={voice.id} value={voice.id}>
                              <div>
                                <p className="font-medium">{voice.name}</p>
                                <p className="text-xs text-muted-foreground">{voice.description}</p>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Velocidade da Fala</Label>
                      <div className="mt-3">
                        <Slider defaultValue={[1]} min={0.5} max={2} step={0.1} className="w-full" />
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                          <span>0.5x</span>
                          <span>1.0x</span>
                          <span>2.0x</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label>Teste de Voz</Label>
                      <div className="mt-3 p-4 bg-muted/30 rounded-lg">
                        <div className="flex items-center gap-3 mb-3">
                          <Button
                            variant={isRecording ? "destructive" : "default"}
                            size="sm"
                            onClick={() => setIsRecording(!isRecording)}
                            className="gap-2"
                          >
                            {isRecording ? (
                              <>
                                <Square className="w-4 h-4" />
                                Parar
                              </>
                            ) : (
                              <>
                                <Mic className="w-4 h-4" />
                                Testar
                              </>
                            )}
                          </Button>
                          <Button variant="outline" size="sm" className="gap-2">
                            <Volume2 className="w-4 h-4" />
                            Preview
                          </Button>
                        </div>
                        
                        <Textarea
                          placeholder="Digite um texto para testar a voz..."
                          className="mb-3"
                          defaultValue="Olá! Sou seu assistente de IA. Como posso ajudá-lo hoje?"
                        />
                        
                        {isRecording && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Activity className="w-4 h-4 animate-pulse" />
                            Gravando...
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label>Configurações de Conversação</Label>
                      <div className="mt-3 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-foreground">Detecção de Silêncio</span>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-foreground">Cancelamento de Ruído</span>
                          <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-foreground">Interruption Handling</span>
                          <Switch />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="prompts" className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="system-prompt">System Prompt</Label>
                    <Textarea
                      id="system-prompt"
                      className="mt-2 min-h-[200px] font-mono text-sm"
                      defaultValue={`Você é um ${currentAgent.name.toLowerCase()} especializado e experiente. 
Você tem as seguintes características:
- Profissional e objetivo
- Focado em resultados
- Capaz de entender contexto e nuances
- Sempre busca a melhor solução para o cliente

Instruções específicas:
1. Mantenha conversas focadas no objetivo
2. Faça perguntas qualificadoras quando necessário
3. Forneça informações precisas e acionáveis
4. Escale para humano quando apropriado`}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="temperature">Temperature</Label>
                      <div className="mt-3">
                        <Slider defaultValue={[0.7]} min={0} max={1} step={0.1} className="w-full" />
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                          <span>Determinístico</span>
                          <span>0.7</span>
                          <span>Criativo</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="max-tokens">Max Tokens</Label>
                      <Select>
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="Limite de tokens" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="512">512 tokens</SelectItem>
                          <SelectItem value="1024">1,024 tokens</SelectItem>
                          <SelectItem value="2048">2,048 tokens</SelectItem>
                          <SelectItem value="4096">4,096 tokens</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" className="gap-2">
                      <TestTube className="w-4 h-4" />
                      Testar Prompt
                    </Button>
                    <Button variant="outline" className="gap-2">
                      <Copy className="w-4 h-4" />
                      Copiar
                    </Button>
                    <Button variant="outline" className="gap-2">
                      <RefreshCw className="w-4 h-4" />
                      Reset
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="training" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="p-6">
                    <h4 className="font-semibold text-foreground mb-4">Dados de Treinamento</h4>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-foreground">Conversas Analisadas</span>
                        <Badge variant="outline">1,247</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-foreground">Taxa de Sucesso</span>
                        <Badge className="bg-growth/10 text-growth">89%</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-foreground">Última Atualização</span>
                        <span className="text-sm text-muted-foreground">2h atrás</span>
                      </div>
                    </div>
                    
                    <Button className="w-full mt-4 gap-2">
                      <Brain className="w-4 h-4" />
                      Retreinar Modelo
                    </Button>
                  </Card>

                  <Card className="p-6">
                    <h4 className="font-semibold text-foreground mb-4">Performance Metrics</h4>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm text-foreground">Precisão</span>
                          <span className="text-sm font-medium">94%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div className="bg-growth h-2 rounded-full w-[94%]"></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm text-foreground">Tempo de Resposta</span>
                          <span className="text-sm font-medium">1.2s</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div className="bg-primary h-2 rounded-full w-[85%]"></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm text-foreground">Satisfação</span>
                          <span className="text-sm font-medium">4.7/5</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div className="bg-warning h-2 rounded-full w-[94%]"></div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="analytics" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="p-4">
                    <div className="flex items-center gap-2">
                      <MessageCircle className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Conversas Hoje</p>
                        <p className="text-2xl font-bold text-primary">47</p>
                      </div>
                    </div>
                  </Card>
                  
                  <Card className="p-4">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-growth" />
                      <div>
                        <p className="text-sm text-muted-foreground">Taxa Conversão</p>
                        <p className="text-2xl font-bold text-growth">23%</p>
                      </div>
                    </div>
                  </Card>
                  
                  <Card className="p-4">
                    <div className="flex items-center gap-2">
                      <Zap className="w-5 h-5 text-warning" />
                      <div>
                        <p className="text-sm text-muted-foreground">Créditos Usados</p>
                        <p className="text-2xl font-bold text-warning">156</p>
                      </div>
                    </div>
                  </Card>
                </div>

                <Card className="p-6">
                  <h4 className="font-semibold text-foreground mb-4">Atividade Recente</h4>
                  <div className="space-y-3">
                    {[
                      { time: "14:32", action: "Conversação iniciada", user: "João Silva", status: "success" },
                      { time: "14:28", action: "Lead qualificado", user: "Maria Santos", status: "success" },
                      { time: "14:15", action: "Handover para humano", user: "Pedro Costa", status: "warning" },
                      { time: "14:02", action: "Proposta enviada", user: "Ana Lima", status: "success" }
                    ].map((activity, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${
                            activity.status === 'success' ? 'bg-growth' :
                            activity.status === 'warning' ? 'bg-warning' : 'bg-muted-foreground'
                          }`}></div>
                          <div>
                            <p className="text-sm font-medium text-foreground">{activity.action}</p>
                            <p className="text-xs text-muted-foreground">{activity.user}</p>
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground">{activity.time}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </div>
    </div>
  );
};