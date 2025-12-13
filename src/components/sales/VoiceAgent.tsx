import { useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Settings
} from "lucide-react";

interface VoiceAgentProps {
  onSpeakingChange?: (speaking: boolean) => void;
}

const VoiceAgent = ({ onSpeakingChange }: VoiceAgentProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [agentId, setAgentId] = useState('');
  const [status, setStatus] = useState<'idle' | 'connecting' | 'connected' | 'speaking' | 'listening'>('idle');

  const startConversation = useCallback(async () => {
    if (!agentId.trim()) {
      toast.error('Insira o ID do agente ElevenLabs');
      return;
    }

    setIsConnecting(true);
    setStatus('connecting');

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
        return;
      }

      if (!data.token) {
        throw new Error('Token não recebido');
      }

      // Here we would initialize the ElevenLabs conversation
      // This requires the @elevenlabs/react package
      toast.success('Conexão estabelecida! (Integração ElevenLabs requer configuração adicional)');
      setIsConnected(true);
      setStatus('connected');

    } catch (error) {
      console.error('Error starting conversation:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao iniciar conversa');
      setStatus('idle');
    } finally {
      setIsConnecting(false);
    }
  }, [agentId]);

  const endConversation = useCallback(() => {
    setIsConnected(false);
    setStatus('idle');
    onSpeakingChange?.(false);
    toast.info('Conversa encerrada');
  }, [onSpeakingChange]);

  const toggleMute = () => {
    setIsMuted(!isMuted);
    toast.info(isMuted ? 'Microfone ativado' : 'Microfone desativado');
  };

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Phone className="h-5 w-5 text-green-500" />
          Agente de Voz IA
        </CardTitle>
        <CardDescription>
          Chamadas telefônicas com IA em tempo real (ElevenLabs)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status */}
        <div className="flex items-center justify-center">
          <div className={`relative w-32 h-32 rounded-full flex items-center justify-center transition-all ${
            status === 'connected' || status === 'speaking' 
              ? 'bg-green-500/20 border-2 border-green-500' 
              : status === 'listening'
              ? 'bg-blue-500/20 border-2 border-blue-500 animate-pulse'
              : 'bg-muted/50 border-2 border-border'
          }`}>
            {status === 'connecting' ? (
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            ) : status === 'speaking' ? (
              <Volume2 className="h-12 w-12 text-green-500 animate-pulse" />
            ) : status === 'listening' ? (
              <Mic className="h-12 w-12 text-blue-500" />
            ) : isConnected ? (
              <PhoneCall className="h-12 w-12 text-green-500" />
            ) : (
              <Phone className="h-12 w-12 text-muted-foreground" />
            )}
            
            {isConnected && (
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
                <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/30">
                  Conectado
                </Badge>
              </div>
            )}
          </div>
        </div>

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

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          {!isConnected ? (
            <Button 
              onClick={startConversation} 
              disabled={isConnecting || !agentId.trim()}
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
                className={`h-12 w-12 rounded-full ${isMuted ? 'bg-red-500/10 text-red-500' : ''}`}
                onClick={toggleMute}
              >
                {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
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

        {/* Info */}
        <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
          <p className="text-xs text-muted-foreground">
            <strong>Requisitos:</strong> Configure o secret <code className="bg-muted px-1 rounded">ELEVENLABS_API_KEY</code> e crie um agente no painel ElevenLabs.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default VoiceAgent;
