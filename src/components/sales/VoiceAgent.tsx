import { useState, useCallback, useEffect, useRef } from "react";
import { useConversation } from "@elevenlabs/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  Phone, PhoneCall, PhoneOff, Mic, MicOff, Volume2, Loader2, Zap, Settings,
  CheckCircle, AlertCircle, List, MessageSquare, Play, Square, Clock, 
  User, Bot, RefreshCw, Waves
} from "lucide-react";

interface VoiceAgentProps {
  onSpeakingChange?: (speaking: boolean) => void;
  fullView?: boolean;
}

interface TranscriptEntry {
  role: "user" | "agent";
  text: string;
  timestamp: Date;
}

interface ElevenLabsAgent {
  agent_id: string;
  name: string;
}

interface ElevenLabsVoice {
  voice_id: string;
  name: string;
  category?: string;
}

interface CallLogEntry {
  id: string;
  phone_number: string;
  status: string;
  duration_seconds: number;
  started_at: string;
  transcript: string | null;
  sentiment: string | null;
}

const VoiceAgent = ({ onSpeakingChange, fullView = false }: VoiceAgentProps) => {
  const [agentId, setAgentId] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [volume, setVolume] = useState([0.8]);
  const [configStatus, setConfigStatus] = useState<'checking' | 'configured' | 'not_configured'>('checking');
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [agents, setAgents] = useState<ElevenLabsAgent[]>([]);
  const [voices, setVoices] = useState<ElevenLabsVoice[]>([]);
  const [callLogs, setCallLogs] = useState<CallLogEntry[]>([]);
  const [loadingAgents, setLoadingAgents] = useState(false);
  const [loadingVoices, setLoadingVoices] = useState(false);
  const [ttsText, setTtsText] = useState('');
  const [ttsVoiceId, setTtsVoiceId] = useState('JBFqnCBsd6RMkjVDRZzb');
  const [playingTts, setPlayingTts] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const transcriptRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const conversation = useConversation({
    onConnect: () => {
      toast.success('Conectado ao agente de voz!');
      setCallDuration(0);
      timerRef.current = setInterval(() => setCallDuration(d => d + 1), 1000);
    },
    onDisconnect: () => {
      toast.info('Conversa encerrada');
      onSpeakingChange?.(false);
      if (timerRef.current) clearInterval(timerRef.current);
    },
    onMessage: (message: any) => {
      if (message.type === 'user_transcript' && message.user_transcription_event) {
        setTranscript(prev => [...prev, {
          role: 'user',
          text: message.user_transcription_event.user_transcript,
          timestamp: new Date()
        }]);
      }
      if (message.type === 'agent_response' && message.agent_response_event) {
        setTranscript(prev => [...prev, {
          role: 'agent',
          text: message.agent_response_event.agent_response,
          timestamp: new Date()
        }]);
      }
    },
    onError: (error) => {
      const errorMessage = typeof error === 'string' ? error : 'Erro desconhecido';
      toast.error('Erro na conexão: ' + errorMessage);
    },
  });

  // Auto-scroll transcript
  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
    }
  }, [transcript]);

  useEffect(() => {
    onSpeakingChange?.(conversation.isSpeaking);
  }, [conversation.isSpeaking, onSpeakingChange]);

  useEffect(() => {
    if (conversation.status === 'connected') {
      conversation.setVolume({ volume: volume[0] });
    }
  }, [volume, conversation]);

  // Check config + load call logs on mount
  useEffect(() => {
    checkConfig();
    loadCallLogs();
  }, []);

  const checkConfig = async () => {
    try {
      const { data } = await supabase.functions.invoke('voice-realtime', {
        body: { action: 'check_config' }
      });
      setConfigStatus(data?.configured ? 'configured' : 'not_configured');
      if (data?.configured) {
        loadAgents();
        loadVoices();
      }
    } catch {
      setConfigStatus('not_configured');
    }
  };

  const loadAgents = async () => {
    setLoadingAgents(true);
    try {
      const { data, error } = await supabase.functions.invoke('voice-realtime', {
        body: { action: 'list_agents' }
      });
      if (!error && data?.agents) {
        setAgents(data.agents);
      }
    } catch (e) {
      console.error('Error loading agents:', e);
    } finally {
      setLoadingAgents(false);
    }
  };

  const loadVoices = async () => {
    setLoadingVoices(true);
    try {
      const { data, error } = await supabase.functions.invoke('voice-realtime', {
        body: { action: 'list_voices' }
      });
      if (!error && data?.voices) {
        setVoices(data.voices);
      }
    } catch (e) {
      console.error('Error loading voices:', e);
    } finally {
      setLoadingVoices(false);
    }
  };

  const loadCallLogs = async () => {
    try {
      const { data } = await supabase
        .from('voice_calls')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
      if (data) setCallLogs(data as CallLogEntry[]);
    } catch (e) {
      console.error('Error loading call logs:', e);
    }
  };

  const startConversation = useCallback(async () => {
    if (!agentId.trim()) {
      toast.error('Selecione ou insira o ID do agente');
      return;
    }
    setIsConnecting(true);
    setTranscript([]);
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      const { data, error } = await supabase.functions.invoke('voice-realtime', {
        body: { action: 'get_token', agent_id: agentId }
      });
      if (error) throw error;
      if (data.setup_required) {
        toast.error(data.message);
        setConfigStatus('not_configured');
        return;
      }
      if (!data.token) throw new Error('Token não recebido');
      await conversation.startSession({
        conversationToken: data.token,
        connectionType: 'webrtc',
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao iniciar conversa');
    } finally {
      setIsConnecting(false);
    }
  }, [agentId, conversation]);

  const endConversation = useCallback(async () => {
    await conversation.endSession();
  }, [conversation]);

  const toggleMute = useCallback(() => {
    setIsMuted(m => !m);
    toast.info(isMuted ? 'Microfone ativado' : 'Microfone silenciado');
  }, [isMuted]);

  const playTts = useCallback(async () => {
    if (!ttsText.trim()) {
      toast.error('Insira o texto para gerar áudio');
      return;
    }
    setPlayingTts(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/voice-realtime`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ action: 'tts', text: ttsText, voice_id: ttsVoiceId }),
        }
      );
      if (!response.ok) throw new Error('Erro ao gerar áudio');
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      if (audioRef.current) {
        audioRef.current.pause();
      }
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      audio.onended = () => setPlayingTts(false);
      await audio.play();
      toast.success('Áudio gerado com sucesso!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro no TTS');
      setPlayingTts(false);
    }
  }, [ttsText, ttsVoiceId]);

  const stopTts = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setPlayingTts(false);
  }, []);

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const isConnected = conversation.status === 'connected';
  const isSpeaking = conversation.isSpeaking;

  // Compact view for sidebar
  if (!fullView) {
    return (
      <Card className="border-border/50 bg-card/50 backdrop-blur">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Phone className="h-4 w-4 text-green-500" />
            Agente de Voz
          </CardTitle>
          <CardDescription className="text-xs">
            ElevenLabs Conversational AI
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-center">
            <div className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all ${
              isConnected && isSpeaking 
                ? 'bg-green-500/20 border-2 border-green-500 animate-pulse' 
                : isConnected ? 'bg-blue-500/20 border-2 border-blue-500'
                : 'bg-muted/50 border-2 border-border'
            }`}>
              {isConnecting ? <Loader2 className="h-8 w-8 animate-spin text-primary" />
               : isSpeaking ? <Volume2 className="h-8 w-8 text-green-500 animate-pulse" />
               : isConnected ? <Mic className="h-8 w-8 text-blue-500" />
               : <Phone className="h-8 w-8 text-muted-foreground" />}
            </div>
          </div>
          {isConnected && (
            <p className="text-center text-xs font-medium text-muted-foreground">
              {isSpeaking ? '🔊 Agente falando...' : '🎙️ Ouvindo...'} • {formatDuration(callDuration)}
            </p>
          )}
          {configStatus === 'configured' ? (
            <Badge variant="outline" className="w-full justify-center bg-green-500/10 text-green-500 border-green-500/30 text-xs">
              <CheckCircle className="h-3 w-3 mr-1" /> ElevenLabs Conectado
            </Badge>
          ) : configStatus === 'not_configured' ? (
            <Badge variant="outline" className="w-full justify-center bg-amber-500/10 text-amber-500 border-amber-500/30 text-xs">
              <AlertCircle className="h-3 w-3 mr-1" /> API Não Configurada
            </Badge>
          ) : null}
        </CardContent>
      </Card>
    );
  }

  // Full view
  return (
    <div className="space-y-6">
      {/* Status Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Phone className="h-6 w-6 text-green-500" />
            Agente de Voz IA
          </h2>
          <p className="text-muted-foreground">Chamadas com IA conversacional via ElevenLabs</p>
        </div>
        <div className="flex items-center gap-2">
          {configStatus === 'configured' && (
            <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/30">
              <CheckCircle className="h-3 w-3 mr-1" /> ElevenLabs Conectado
            </Badge>
          )}
          {configStatus === 'not_configured' && (
            <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/30">
              <AlertCircle className="h-3 w-3 mr-1" /> API Não Configurada
            </Badge>
          )}
          <Button variant="outline" size="sm" onClick={() => { loadAgents(); loadVoices(); loadCallLogs(); }}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Call Interface */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="call" className="space-y-4">
            <TabsList className="bg-muted/50">
              <TabsTrigger value="call" className="gap-2"><PhoneCall className="h-4 w-4" />Chamada</TabsTrigger>
              <TabsTrigger value="tts" className="gap-2"><Volume2 className="h-4 w-4" />Text-to-Speech</TabsTrigger>
              <TabsTrigger value="history" className="gap-2"><List className="h-4 w-4" />Histórico</TabsTrigger>
            </TabsList>

            {/* Call Tab */}
            <TabsContent value="call" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Call Visualizer */}
                <Card className="border-border/50 bg-card/50 backdrop-blur">
                  <CardContent className="p-6 flex flex-col items-center justify-center min-h-[320px] space-y-4">
                    <div className={`relative w-36 h-36 rounded-full flex items-center justify-center transition-all ${
                      isConnected && isSpeaking 
                        ? 'bg-green-500/20 border-2 border-green-500' 
                        : isConnected ? 'bg-blue-500/20 border-2 border-blue-500'
                        : isConnecting ? 'bg-primary/20 border-2 border-primary'
                        : 'bg-muted/50 border-2 border-border'
                    }`}>
                      {/* Pulse rings */}
                      {isConnected && isSpeaking && (
                        <>
                          <div className="absolute inset-0 rounded-full border-2 border-green-500/40 animate-ping" />
                          <div className="absolute inset-[-8px] rounded-full border border-green-500/20 animate-pulse" />
                        </>
                      )}
                      {isConnecting ? <Loader2 className="h-14 w-14 animate-spin text-primary" />
                       : isSpeaking ? <Waves className="h-14 w-14 text-green-500 animate-pulse" />
                       : isConnected ? <Mic className="h-14 w-14 text-blue-500" />
                       : <Phone className="h-14 w-14 text-muted-foreground" />}
                    </div>

                    {isConnected && (
                      <div className="text-center space-y-1">
                        <p className="text-lg font-semibold text-foreground">
                          {isSpeaking ? 'Agente Falando' : 'Ouvindo'}
                        </p>
                        <p className="text-2xl font-mono text-primary">{formatDuration(callDuration)}</p>
                        <p className="text-xs text-muted-foreground">Fale naturalmente • Interrupção suportada</p>
                      </div>
                    )}

                    {!isConnected && !isConnecting && (
                      <p className="text-sm text-muted-foreground text-center">
                        Selecione um agente e inicie a chamada
                      </p>
                    )}

                    {/* Controls */}
                    <div className="flex items-center gap-3">
                      {!isConnected ? (
                        <Button 
                          onClick={startConversation} 
                          disabled={isConnecting || !agentId.trim() || configStatus !== 'configured'}
                          size="lg" className="gap-2"
                        >
                          {isConnecting ? <><Loader2 className="h-5 w-5 animate-spin" /> Conectando...</>
                           : <><PhoneCall className="h-5 w-5" /> Iniciar Chamada</>}
                        </Button>
                      ) : (
                        <>
                          <Button variant="outline" size="icon" className="h-12 w-12 rounded-full" onClick={toggleMute}>
                            {isMuted ? <MicOff className="h-5 w-5 text-destructive" /> : <Mic className="h-5 w-5" />}
                          </Button>
                          <Button variant="destructive" size="lg" className="gap-2" onClick={endConversation}>
                            <PhoneOff className="h-5 w-5" /> Encerrar
                          </Button>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Transcript */}
                <Card className="border-border/50 bg-card/50 backdrop-blur">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" /> Transcrição em Tempo Real
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[260px] pr-3" ref={transcriptRef}>
                      {transcript.length === 0 ? (
                        <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                          A transcrição aparecerá aqui durante a chamada
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {transcript.map((entry, i) => (
                            <div key={i} className={`flex gap-2 ${entry.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                              <div className={`max-w-[85%] rounded-lg p-3 text-sm ${
                                entry.role === 'user' 
                                  ? 'bg-primary text-primary-foreground' 
                                  : 'bg-muted text-foreground'
                              }`}>
                                <div className="flex items-center gap-1 mb-1 opacity-70 text-xs">
                                  {entry.role === 'user' ? <User className="h-3 w-3" /> : <Bot className="h-3 w-3" />}
                                  {entry.role === 'user' ? 'Você' : 'Agente'}
                                  <span className="ml-auto">{entry.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                                {entry.text}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>

              {/* Agent Selection + Volume */}
              <Card className="border-border/50 bg-card/50 backdrop-blur">
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <div className="space-y-2">
                      <Label>Agente ElevenLabs</Label>
                      {agents.length > 0 ? (
                        <Select value={agentId} onValueChange={setAgentId}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um agente" />
                          </SelectTrigger>
                          <SelectContent>
                            {agents.map(a => (
                              <SelectItem key={a.agent_id} value={a.agent_id}>
                                {a.name || a.agent_id}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input
                          placeholder="agent_xxxxxxxxxxxxx"
                          value={agentId}
                          onChange={(e) => setAgentId(e.target.value)}
                          disabled={isConnected}
                        />
                      )}
                      <p className="text-xs text-muted-foreground">
                        Crie agentes em{' '}
                        <a href="https://elevenlabs.io/app/conversational-ai" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                          ElevenLabs
                        </a>
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Volume</Label>
                        <span className="text-xs text-muted-foreground">{Math.round(volume[0] * 100)}%</span>
                      </div>
                      <Slider value={volume} onValueChange={setVolume} max={1} min={0} step={0.05} />
                    </div>

                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={loadAgents} disabled={loadingAgents || configStatus !== 'configured'}>
                        {loadingAgents ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                        <span className="ml-1">Atualizar Agentes</span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* TTS Tab */}
            <TabsContent value="tts" className="space-y-4">
              <Card className="border-border/50 bg-card/50 backdrop-blur">
                <CardHeader>
                  <CardTitle className="text-base">Gerador de Áudio (Text-to-Speech)</CardTitle>
                  <CardDescription>Converta texto em áudio realista usando vozes da ElevenLabs</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Voz</Label>
                      {voices.length > 0 ? (
                        <Select value={ttsVoiceId} onValueChange={setTtsVoiceId}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione uma voz" />
                          </SelectTrigger>
                          <SelectContent>
                            {voices.map(v => (
                              <SelectItem key={v.voice_id} value={v.voice_id}>
                                {v.name} {v.category ? `(${v.category})` : ''}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input value={ttsVoiceId} onChange={e => setTtsVoiceId(e.target.value)} placeholder="Voice ID" />
                      )}
                    </div>
                    <div className="flex items-end gap-2">
                      <Button variant="outline" size="sm" onClick={loadVoices} disabled={loadingVoices || configStatus !== 'configured'}>
                        {loadingVoices ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                        <span className="ml-1">Carregar Vozes</span>
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Texto</Label>
                    <Textarea
                      placeholder="Digite o texto que deseja converter em áudio..."
                      value={ttsText}
                      onChange={e => setTtsText(e.target.value)}
                      rows={4}
                      maxLength={5000}
                    />
                    <p className="text-xs text-muted-foreground text-right">{ttsText.length}/5000</p>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={playTts} disabled={playingTts || !ttsText.trim() || configStatus !== 'configured'} className="gap-2">
                      {playingTts ? <><Loader2 className="h-4 w-4 animate-spin" /> Gerando...</>
                       : <><Play className="h-4 w-4" /> Gerar & Reproduzir</>}
                    </Button>
                    {playingTts && (
                      <Button variant="outline" onClick={stopTts} className="gap-2">
                        <Square className="h-4 w-4" /> Parar
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* History Tab */}
            <TabsContent value="history" className="space-y-4">
              <Card className="border-border/50 bg-card/50 backdrop-blur">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base">Histórico de Chamadas</CardTitle>
                      <CardDescription>Últimas chamadas realizadas pelo agente de voz</CardDescription>
                    </div>
                    <Button variant="outline" size="sm" onClick={loadCallLogs}>
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {callLogs.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Phone className="h-10 w-10 mx-auto mb-2 opacity-30" />
                      <p className="text-sm">Nenhuma chamada registrada ainda</p>
                    </div>
                  ) : (
                    <ScrollArea className="h-[400px]">
                      <div className="space-y-3">
                        {callLogs.map(call => (
                          <div key={call.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/30">
                            <div className={`p-2 rounded-full ${
                              call.status === 'completed' ? 'bg-green-500/10' : 'bg-muted'
                            }`}>
                              <Phone className={`h-4 w-4 ${
                                call.status === 'completed' ? 'text-green-500' : 'text-muted-foreground'
                              }`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{call.phone_number}</p>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                {formatDuration(call.duration_seconds || 0)}
                                {call.sentiment && (
                                  <Badge variant="outline" className="text-xs py-0">
                                    {call.sentiment}
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <Badge variant={call.status === 'completed' ? 'default' : 'secondary'} className="text-xs">
                                {call.status}
                              </Badge>
                              {call.started_at && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  {new Date(call.started_at).toLocaleDateString('pt-BR')}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Column - Info */}
        <div className="space-y-4">
          {/* Agents List */}
          <Card className="border-border/50 bg-card/50 backdrop-blur">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Bot className="h-4 w-4" /> Agentes Disponíveis
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingAgents ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : agents.length === 0 ? (
                <p className="text-xs text-muted-foreground py-2">
                  Nenhum agente encontrado. Crie um em{' '}
                  <a href="https://elevenlabs.io/app/conversational-ai" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    elevenlabs.io
                  </a>
                </p>
              ) : (
                <div className="space-y-2">
                  {agents.map(a => (
                    <button
                      key={a.agent_id}
                      onClick={() => setAgentId(a.agent_id)}
                      className={`w-full text-left p-2 rounded-lg text-sm transition-colors ${
                        agentId === a.agent_id 
                          ? 'bg-primary/10 border border-primary/30 text-foreground' 
                          : 'bg-muted/30 hover:bg-muted/50 text-muted-foreground'
                      }`}
                    >
                      <p className="font-medium truncate">{a.name || 'Agente sem nome'}</p>
                      <p className="text-xs opacity-60 truncate">{a.agent_id}</p>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Features */}
          <Card className="border-border/50 bg-card/50 backdrop-blur">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Zap className="h-4 w-4 text-amber-500" /> Recursos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                { icon: Zap, color: 'text-amber-500', label: 'Latência < 500ms' },
                { icon: Volume2, color: 'text-blue-500', label: 'Voz humanizada' },
                { icon: Mic, color: 'text-green-500', label: 'Interrupção natural (barge-in)' },
                { icon: MessageSquare, color: 'text-purple-500', label: 'Transcrição em tempo real' },
                { icon: Settings, color: 'text-muted-foreground', label: 'Agentes personalizáveis' },
              ].map((f, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <f.icon className={`h-4 w-4 ${f.color}`} />
                  {f.label}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Config Status */}
          {configStatus === 'not_configured' && (
            <Card className="border-amber-500/30 bg-amber-500/5">
              <CardContent className="p-4">
                <p className="text-sm text-amber-600 dark:text-amber-400">
                  <strong>Configuração necessária:</strong> O secret <code className="bg-muted px-1 rounded text-xs">ELEVENLABS_API_KEY</code> precisa ser configurado.
                </p>
              </CardContent>
            </Card>
          )}

          {configStatus === 'configured' && (
            <Card className="border-green-500/30 bg-green-500/5">
              <CardContent className="p-4">
                <p className="text-sm text-green-600 dark:text-green-400">
                  <strong>✓ Pronto!</strong> Selecione um agente e inicie uma conversa de voz.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default VoiceAgent;
