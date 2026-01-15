import { useState, useCallback, useEffect } from "react";
import { useConversation } from "@elevenlabs/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  Phone, 
  PhoneCall, 
  PhoneOff, 
  Mic, 
  MicOff,
  Volume2,
  Loader2,
  Zap,
  Settings,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react";

interface VoiceAgentProps {
  onSpeakingChange?: (speaking: boolean) => void;
}

const VoiceAgent = ({ onSpeakingChange }: VoiceAgentProps) => {
  const [agentId, setAgentId] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [volume, setVolume] = useState([0.8]);
  const [configStatus, setConfigStatus] = useState<'checking' | 'configured' | 'not_configured'>('checking');

  // ElevenLabs Conversational AI hook
  const conversation = useConversation({
    onConnect: () => {
      console.log('ElevenLabs: Connected');
      toast.success('Conectado ao agente de voz!');
    },
    onDisconnect: () => {
      console.log('ElevenLabs: Disconnected');
      toast.info('Conversa encerrada');
      onSpeakingChange?.(false);
    },
    onMessage: (message) => {
      console.log('ElevenLabs Message:', message);
    },
    onError: (error) => {
      console.error('ElevenLabs Error:', error);
      const errorMessage = typeof error === 'string' ? error : 'Erro desconhecido';
      toast.error('Erro na conexão: ' + errorMessage);
    },
  });

  // Check if API key is configured
  useEffect(() => {
    const checkConfig = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('voice-realtime', {
          body: { action: 'check_config' }
        });
        
        if (data?.configured) {
          setConfigStatus('configured');
        } else {
          setConfigStatus('not_configured');
        }
      } catch {
        setConfigStatus('not_configured');
      }
    };
    checkConfig();
  }, []);

  // Update speaking state when agent is speaking
  useEffect(() => {
    onSpeakingChange?.(conversation.isSpeaking);
  }, [conversation.isSpeaking, onSpeakingChange]);

  // Update volume
  useEffect(() => {
    if (conversation.status === 'connected') {
      conversation.setVolume({ volume: volume[0] });
    }
  }, [volume, conversation]);

  const startConversation = useCallback(async () => {
    if (!agentId.trim()) {
      toast.error('Insira o ID do agente ElevenLabs');
      return;
    }

    setIsConnecting(true);

    try {
      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });

      // Get token from edge function
      const { data, error } = await supabase.functions.invoke('voice-realtime', {
        body: { action: 'get_token', agent_id: agentId }
      });

      if (error) throw error;

      if (data.setup_required) {
        toast.error(data.message);
        setConfigStatus('not_configured');
        return;
      }

      if (!data.token) {
        throw new Error('Token não recebido');
      }

      // Start conversation with ElevenLabs using the token
      await conversation.startSession({
        conversationToken: data.token,
        connectionType: 'webrtc',
      });

    } catch (error) {
      console.error('Error starting conversation:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao iniciar conversa');
    } finally {
      setIsConnecting(false);
    }
  }, [agentId, conversation]);

  const endConversation = useCallback(async () => {
    await conversation.endSession();
  }, [conversation]);

  const toggleMute = useCallback(() => {
    // The SDK handles muting through the audio context
    toast.info('Controle de mute via navegador');
  }, []);

  const isConnected = conversation.status === 'connected';
  const isSpeaking = conversation.isSpeaking;

  const getStatusBadge = () => {
    switch (conversation.status) {
      case 'connected':
        return (
          <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/30">
            <CheckCircle className="h-3 w-3 mr-1" />
            Conectado
          </Badge>
        );
      case 'disconnected':
        return (
          <Badge variant="outline" className="bg-muted text-muted-foreground">
            Desconectado
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5 text-green-500" />
              Agente de Voz IA
            </CardTitle>
            <CardDescription>
              Chamadas telefônicas com IA em tempo real (ElevenLabs)
            </CardDescription>
          </div>
          {configStatus === 'configured' && (
            <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/30">
              <CheckCircle className="h-3 w-3 mr-1" />
              API Configurada
            </Badge>
          )}
          {configStatus === 'not_configured' && (
            <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/30">
              <AlertCircle className="h-3 w-3 mr-1" />
              API Não Configurada
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Visual Status */}
        <div className="flex items-center justify-center">
          <div className={`relative w-32 h-32 rounded-full flex items-center justify-center transition-all ${
            isConnected && isSpeaking 
              ? 'bg-green-500/20 border-2 border-green-500 animate-pulse' 
              : isConnected
              ? 'bg-blue-500/20 border-2 border-blue-500'
              : isConnecting
              ? 'bg-primary/20 border-2 border-primary'
              : 'bg-muted/50 border-2 border-border'
          }`}>
            {isConnecting ? (
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            ) : isSpeaking ? (
              <Volume2 className="h-12 w-12 text-green-500 animate-pulse" />
            ) : isConnected ? (
              <Mic className="h-12 w-12 text-blue-500" />
            ) : (
              <Phone className="h-12 w-12 text-muted-foreground" />
            )}
            
            {isConnected && (
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
                {getStatusBadge()}
              </div>
            )}
          </div>
        </div>

        {/* Status Info */}
        {isConnected && (
          <div className="text-center space-y-1">
            <p className="text-sm font-medium">
              {isSpeaking ? 'Agente falando...' : 'Ouvindo...'}
            </p>
            <p className="text-xs text-muted-foreground">
              Fale naturalmente - o agente pode ser interrompido
            </p>
          </div>
        )}

        {/* Agent ID Input */}
        {!isConnected && (
          <div className="space-y-2">
            <Label htmlFor="agentId">ID do Agente ElevenLabs</Label>
            <Input
              id="agentId"
              placeholder="agent_xxxxxxxxxxxxx"
              value={agentId}
              onChange={(e) => setAgentId(e.target.value)}
              disabled={isConnecting}
            />
            <p className="text-xs text-muted-foreground">
              Crie um agente em{' '}
              <a 
                href="https://elevenlabs.io/app/conversational-ai" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                ElevenLabs Conversational AI
              </a>
            </p>
          </div>
        )}

        {/* Volume Control */}
        {isConnected && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Volume</Label>
              <span className="text-xs text-muted-foreground">{Math.round(volume[0] * 100)}%</span>
            </div>
            <Slider
              value={volume}
              onValueChange={setVolume}
              max={1}
              min={0}
              step={0.1}
              className="w-full"
            />
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          {!isConnected ? (
            <Button 
              onClick={startConversation} 
              disabled={isConnecting || !agentId.trim() || configStatus === 'not_configured'}
              className="gap-2"
              size="lg"
            >
              {isConnecting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Conectando...
                </>
              ) : (
                <>
                  <PhoneCall className="h-5 w-5" />
                  Iniciar Chamada
                </>
              )}
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                size="icon"
                className="h-12 w-12 rounded-full"
                onClick={toggleMute}
              >
                <Mic className="h-5 w-5" />
              </Button>
              
              <Button
                variant="destructive"
                size="lg"
                className="gap-2"
                onClick={endConversation}
              >
                <PhoneOff className="h-5 w-5" />
                Encerrar
              </Button>
            </>
          )}
        </div>

        {/* Features */}
        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-border/50">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Zap className="h-4 w-4 text-amber-500" />
            Latência &lt; 500ms
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Volume2 className="h-4 w-4 text-blue-500" />
            Voz humanizada
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Mic className="h-4 w-4 text-green-500" />
            Interrupção natural
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Settings className="h-4 w-4 text-purple-500" />
            Agentes personalizados
          </div>
        </div>

        {/* Config Status Info */}
        {configStatus === 'not_configured' && (
          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <p className="text-xs text-amber-600 dark:text-amber-400">
              <strong>Configuração necessária:</strong> O secret <code className="bg-muted px-1 rounded">ELEVENLABS_API_KEY</code> precisa ser configurado para usar o agente de voz.
            </p>
          </div>
        )}

        {configStatus === 'configured' && (
          <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
            <p className="text-xs text-green-600 dark:text-green-400">
              <strong>Pronto!</strong> Insira o ID do seu agente ElevenLabs e clique em "Iniciar Chamada" para começar uma conversa.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VoiceAgent;
