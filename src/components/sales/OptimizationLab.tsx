import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { 
  FlaskConical, 
  Trophy, 
  TrendingUp, 
  Sparkles,
  Plus,
  Loader2,
  GitBranch,
  BarChart3
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ScriptVariant {
  id: string;
  name: string;
  agent_type: string;
  content: string;
  tone: string;
  is_champion: boolean;
  impressions: number;
  conversions: number;
  conversion_rate: number;
  created_at: string;
}

interface EvolutionLog {
  id: string;
  event_type: string;
  metrics: any;
  created_at: string;
}

const OptimizationLab = () => {
  const { user } = useAuth();
  const [variants, setVariants] = useState<ScriptVariant[]>([]);
  const [evolutionLogs, setEvolutionLogs] = useState<EvolutionLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState('sdr');

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user, selectedAgent]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load variants
      const { data: variantsData } = await supabase
        .from('sales_script_variants')
        .select('*')
        .eq('user_id', user?.id)
        .eq('agent_type', selectedAgent)
        .order('is_champion', { ascending: false })
        .order('conversion_rate', { ascending: false });

      setVariants(variantsData || []);

      // Load evolution logs
      if (variantsData && variantsData.length > 0) {
        const variantIds = variantsData.map(v => v.id);
        const { data: logsData } = await supabase
          .from('script_evolution_log')
          .select('*')
          .in('variant_id', variantIds)
          .order('created_at', { ascending: false })
          .limit(20);

        setEvolutionLogs(logsData || []);
      }
    } catch (error) {
      console.error('Error loading optimization data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateVariant = async () => {
    if (!user) return;
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('optimization-lab', {
        body: {
          action: 'generate_variant',
          user_id: user.id,
          agent_type: selectedAgent
        }
      });

      if (error) throw error;

      if (data.success) {
        toast.success(`Nova variante criada: ${data.variant.name}`);
        loadData();
      } else {
        toast.error(data.error || 'Erro ao gerar variante');
      }
    } catch (error) {
      console.error('Error generating variant:', error);
      toast.error('Erro ao gerar nova variante');
    } finally {
      setGenerating(false);
    }
  };

  const champion = variants.find(v => v.is_champion);
  const challengers = variants.filter(v => !v.is_champion);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <FlaskConical className="h-6 w-6 text-purple-500" />
            Laboratório de Otimização
          </h2>
          <p className="text-muted-foreground">
            A/B Testing genético de scripts de vendas
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Tabs value={selectedAgent} onValueChange={setSelectedAgent}>
            <TabsList>
              <TabsTrigger value="sdr">SDR</TabsTrigger>
              <TabsTrigger value="closer">Closer</TabsTrigger>
              <TabsTrigger value="cs">CS</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button onClick={generateVariant} disabled={generating || !champion} className="gap-2">
            {generating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            Gerar Variante
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Champion Card */}
          <Card className="lg:col-span-2 border-border/50 bg-gradient-to-br from-amber-500/5 to-amber-500/10 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-amber-500" />
                Script Campeão
              </CardTitle>
              <CardDescription>
                {champion ? 'Melhor performer atual' : 'Nenhum script definido como campeão'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {champion ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-foreground">{champion.name}</h3>
                      <Badge variant="outline" className="mt-1">{champion.tone}</Badge>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-500">
                        {(champion.conversion_rate * 100).toFixed(2)}%
                      </p>
                      <p className="text-xs text-muted-foreground">Taxa de conversão</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 rounded-lg bg-background/50">
                      <p className="text-lg font-bold text-foreground">{champion.impressions}</p>
                      <p className="text-xs text-muted-foreground">Impressões</p>
                    </div>
                    <div className="p-3 rounded-lg bg-background/50">
                      <p className="text-lg font-bold text-green-500">{champion.conversions}</p>
                      <p className="text-xs text-muted-foreground">Conversões</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-background/50 border border-border/50">
                    <p className="text-sm text-foreground whitespace-pre-wrap line-clamp-6">
                      {champion.content}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Trophy className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">
                    Crie um script para começar os testes
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Stats & Evolution */}
          <Card className="border-border/50 bg-card/50 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GitBranch className="h-5 w-5 text-primary" />
                Evolução
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
                <div className="space-y-3">
                  {evolutionLogs.length > 0 ? (
                    evolutionLogs.map((log) => (
                      <div key={log.id} className="p-3 rounded-lg bg-background/50 border border-border/50">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant={log.event_type === 'promotion' ? 'default' : 'outline'}>
                            {log.event_type === 'promotion' ? 'Nova Campeã' : 'Criada'}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(log.created_at), { addSuffix: true, locale: ptBR })}
                          </span>
                        </div>
                        {log.metrics?.improvement && (
                          <p className="text-sm text-green-500">
                            +{log.metrics.improvement} melhoria
                          </p>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      Nenhum evento ainda
                    </p>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Challengers */}
          <Card className="lg:col-span-3 border-border/50 bg-card/50 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Variantes em Teste ({challengers.length})
              </CardTitle>
              <CardDescription>
                Scripts competindo contra o campeão (10% do tráfego cada)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {challengers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {challengers.map((variant) => (
                    <div 
                      key={variant.id} 
                      className="p-4 rounded-xl border border-border/50 bg-background/50"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-foreground truncate">{variant.name}</h4>
                        <Badge variant="outline">{variant.tone}</Badge>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Conversão</span>
                          <span className={`font-medium ${
                            variant.conversion_rate > (champion?.conversion_rate || 0)
                              ? 'text-green-500'
                              : 'text-foreground'
                          }`}>
                            {(variant.conversion_rate * 100).toFixed(2)}%
                          </span>
                        </div>
                        <Progress 
                          value={variant.conversion_rate * 100} 
                          className="h-2"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{variant.impressions} impressões</span>
                          <span>{variant.conversions} conversões</span>
                        </div>
                      </div>

                      {variant.impressions >= 50 && variant.conversion_rate > (champion?.conversion_rate || 0) * 1.1 && (
                        <div className="mt-3 p-2 rounded-lg bg-green-500/10 border border-green-500/30">
                          <p className="text-xs text-green-500 text-center">
                            🏆 Candidata a nova campeã!
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FlaskConical className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">
                    Nenhuma variante em teste. Clique em "Gerar Variante" para criar.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default OptimizationLab;
