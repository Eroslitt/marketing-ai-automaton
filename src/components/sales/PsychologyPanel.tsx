import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  Brain, 
  Zap, 
  Heart, 
  Shield, 
  Target,
  RefreshCw,
  Loader2
} from "lucide-react";

interface PsychologyPanelProps {
  leadId?: string;
}

const DISC_INFO = {
  dominance: { 
    label: 'Dominante', 
    icon: Zap, 
    color: 'text-red-500', 
    bgColor: 'bg-red-500/10',
    description: 'Direto, focado em resultados, assertivo'
  },
  influence: { 
    label: 'Influente', 
    icon: Heart, 
    color: 'text-yellow-500', 
    bgColor: 'bg-yellow-500/10',
    description: 'Entusiasta, social, otimista'
  },
  steadiness: { 
    label: 'Estável', 
    icon: Shield, 
    color: 'text-green-500', 
    bgColor: 'bg-green-500/10',
    description: 'Paciente, confiável, calmo'
  },
  compliance: { 
    label: 'Conforme', 
    icon: Target, 
    color: 'text-blue-500', 
    bgColor: 'bg-blue-500/10',
    description: 'Analítico, preciso, sistemático'
  }
};

const PsychologyPanel = ({ leadId }: PsychologyPanelProps) => {
  const [psychology, setPsychology] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    if (leadId) {
      loadPsychology();
    }
  }, [leadId]);

  const loadPsychology = async () => {
    if (!leadId) return;
    setLoading(true);
    try {
      const { data } = await supabase
        .from('lead_psychology')
        .select('*')
        .eq('lead_id', leadId)
        .order('analyzed_at', { ascending: false })
        .limit(1)
        .single();

      if (data) {
        setPsychology(data);
      }
    } catch (error) {
      console.error('Error loading psychology:', error);
    } finally {
      setLoading(false);
    }
  };

  const analyzeLead = async () => {
    if (!leadId) return;
    setAnalyzing(true);
    try {
      // Get recent messages
      const { data: conversations } = await supabase
        .from('conversations')
        .select('id')
        .eq('lead_id', leadId)
        .limit(1);

      if (!conversations || conversations.length === 0) {
        toast.error('Nenhuma conversa encontrada para este lead');
        return;
      }

      const { data: messages } = await supabase
        .from('messages')
        .select('role, content')
        .eq('conversation_id', conversations[0].id)
        .eq('role', 'user')
        .order('created_at', { ascending: false })
        .limit(5);

      if (!messages || messages.length === 0) {
        toast.error('Nenhuma mensagem do lead encontrada');
        return;
      }

      const { data, error } = await supabase.functions.invoke('psychology-engine', {
        body: { lead_id: leadId, messages }
      });

      if (error) throw error;

      if (data.success) {
        toast.success(`Perfil identificado: ${DISC_INFO[data.disc_profile as keyof typeof DISC_INFO]?.label}`);
        setPsychology({
          disc_profile: data.disc_profile,
          disc_scores: data.analysis.disc_scores,
          big5_scores: data.analysis.big5_scores,
          communication_style: data.analysis.communication_style,
          prompt_injection: data.prompt_injection
        });
      }
    } catch (error) {
      console.error('Error analyzing lead:', error);
      toast.error('Erro ao analisar perfil do lead');
    } finally {
      setAnalyzing(false);
    }
  };

  const discProfile = psychology?.disc_profile as keyof typeof DISC_INFO;
  const discInfo = discProfile ? DISC_INFO[discProfile] : null;
  const DiscIcon = discInfo?.icon || Brain;

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-500" />
            Psicologia do Lead
          </CardTitle>
          <CardDescription>
            Análise comportamental DISC
          </CardDescription>
        </div>
        {leadId && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={analyzeLead}
            disabled={analyzing}
          >
            {analyzing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : psychology ? (
          <div className="space-y-6">
            {/* Main Profile */}
            <div className="flex items-center gap-4 p-4 rounded-xl bg-background/50 border border-border/50">
              <div className={`p-4 rounded-xl ${discInfo?.bgColor}`}>
                <DiscIcon className={`h-8 w-8 ${discInfo?.color}`} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground">{discInfo?.label}</h3>
                <p className="text-sm text-muted-foreground">{discInfo?.description}</p>
              </div>
            </div>

            {/* DISC Scores */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-foreground">Scores DISC</h4>
              {Object.entries(psychology.disc_scores || {}).map(([key, value]) => {
                const info = DISC_INFO[key as keyof typeof DISC_INFO];
                return (
                  <div key={key} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{info?.label}</span>
                      <span className={`font-medium ${info?.color}`}>{value as number}%</span>
                    </div>
                    <Progress value={value as number} className="h-2" />
                  </div>
                );
              })}
            </div>

            {/* Big 5 Scores */}
            {psychology.big5_scores && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-foreground">Big Five</h4>
                <div className="grid grid-cols-5 gap-2 text-center">
                  {Object.entries(psychology.big5_scores).map(([key, value]) => (
                    <div key={key} className="p-2 rounded-lg bg-background/50">
                      <p className="text-lg font-bold text-foreground">{value as number}</p>
                      <p className="text-xs text-muted-foreground capitalize">{key.substring(0, 4)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Communication Style */}
            {psychology.communication_style && (
              <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                <p className="text-sm text-foreground">
                  <strong>Estilo:</strong> {psychology.communication_style}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <Brain className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">
              {leadId ? 'Clique em analisar para identificar o perfil' : 'Selecione um lead para análise'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PsychologyPanel;
