import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Loader2 } from "lucide-react";
import { 
  Brain, TrendingUp, AlertTriangle, CheckCircle, Clock, Database, Zap, Settings, Cpu, HardDrive, Network, RefreshCw, Play, RotateCcw
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const MLOpsCenter = () => {
  const { user } = useAuth();
  const [agentConfigs, setAgentConfigs] = useState<any[]>([]);
  const [scriptVariants, setScriptVariants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoRetraining, setAutoRetraining] = useState(true);

  useEffect(() => { if (user) loadData(); }, [user]);

  const loadData = async () => {
    try {
      const [configsRes, variantsRes] = await Promise.all([
        supabase.from('agent_configs').select('*').eq('user_id', user!.id),
        supabase.from('sales_script_variants').select('*').eq('user_id', user!.id).order('created_at', { ascending: false }),
      ]);
      setAgentConfigs(configsRes.data || []);
      setScriptVariants(variantsRes.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Derive performance data from script variants
  const championVariant = scriptVariants.find(v => v.is_champion);
  const totalImpressions = scriptVariants.reduce((s, v) => s + (v.impressions || 0), 0);
  const totalConversions = scriptVariants.reduce((s, v) => s + (v.conversions || 0), 0);
  const overallConversionRate = totalImpressions > 0 ? ((totalConversions / totalImpressions) * 100).toFixed(1) : '0';

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Centro MLOps</h1>
          <p className="text-muted-foreground">Monitoramento e otimização de modelos de IA</p>
        </div>
        <Button className="gap-2" onClick={() => { toast.success("Retreinamento iniciado!"); }}>
          <RefreshCw className="h-4 w-4" /> Retreinar Modelos
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card><CardContent className="flex items-center gap-3 p-4"><Brain className="h-8 w-8 text-primary" /><div><p className="text-sm text-muted-foreground">Agentes Configurados</p><p className="text-2xl font-bold">{agentConfigs.length}</p></div></CardContent></Card>
        <Card><CardContent className="flex items-center gap-3 p-4"><TrendingUp className="h-8 w-8 text-green-500" /><div><p className="text-sm text-muted-foreground">Variantes</p><p className="text-2xl font-bold">{scriptVariants.length}</p></div></CardContent></Card>
        <Card><CardContent className="flex items-center gap-3 p-4"><Zap className="h-8 w-8 text-amber-500" /><div><p className="text-sm text-muted-foreground">Impressões</p><p className="text-2xl font-bold">{totalImpressions.toLocaleString()}</p></div></CardContent></Card>
        <Card><CardContent className="flex items-center gap-3 p-4"><CheckCircle className="h-8 w-8 text-green-500" /><div><p className="text-sm text-muted-foreground">Conversões</p><p className="text-2xl font-bold">{totalConversions}</p></div></CardContent></Card>
        <Card><CardContent className="flex items-center gap-3 p-4"><Database className="h-8 w-8 text-purple-500" /><div><p className="text-sm text-muted-foreground">Conv. Rate</p><p className="text-2xl font-bold">{overallConversionRate}%</p></div></CardContent></Card>
      </div>

      <Tabs defaultValue="models" className="space-y-6">
        <TabsList>
          <TabsTrigger value="models">Modelos Configurados</TabsTrigger>
          <TabsTrigger value="variants">Variantes de Script</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoramento</TabsTrigger>
        </TabsList>

        <TabsContent value="models" className="space-y-6">
          {agentConfigs.length === 0 ? (
            <Card className="p-8 text-center">
              <Brain className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">Nenhum modelo configurado. Configure agentes no Agent Studio.</p>
            </Card>
          ) : (
            <div className="grid gap-4">
              {agentConfigs.map(config => (
                <Card key={config.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Brain className="h-8 w-8 text-primary" />
                        <div>
                          <CardTitle>{config.name}</CardTitle>
                          <CardDescription>{config.agent_type}</CardDescription>
                        </div>
                      </div>
                      <Badge variant="outline">temp: {config.temperature}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      <div><p className="text-sm text-muted-foreground">Max Tokens</p><p className="font-medium">{config.max_tokens}</p></div>
                      <div><p className="text-sm text-muted-foreground">Voice Model</p><p className="font-medium">{config.voice_model || 'N/A'}</p></div>
                      <div><p className="text-sm text-muted-foreground">Voice Speed</p><p className="font-medium">{config.voice_speed}x</p></div>
                      <div><p className="text-sm text-muted-foreground">Atualizado</p><p className="font-medium">{new Date(config.updated_at).toLocaleDateString('pt-BR')}</p></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="variants" className="space-y-6">
          {scriptVariants.length === 0 ? (
            <Card className="p-8 text-center"><p className="text-muted-foreground">Nenhuma variante de script. Crie variantes no Laboratório de Otimização.</p></Card>
          ) : (
            <div className="grid gap-4">
              {scriptVariants.map(variant => (
                <Card key={variant.id} className={variant.is_champion ? 'border-primary' : ''}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-base flex items-center gap-2">
                          {variant.name}
                          {variant.is_champion && <Badge className="bg-amber-500/10 text-amber-500">🏆 Champion</Badge>}
                        </CardTitle>
                        <CardDescription>{variant.agent_type} • Tom: {variant.tone}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      <div><p className="text-sm text-muted-foreground">Impressões</p><p className="text-xl font-bold">{variant.impressions || 0}</p></div>
                      <div><p className="text-sm text-muted-foreground">Conversões</p><p className="text-xl font-bold text-green-500">{variant.conversions || 0}</p></div>
                      <div><p className="text-sm text-muted-foreground">Taxa</p><p className="text-xl font-bold text-primary">{(Number(variant.conversion_rate) || 0).toFixed(1)}%</p></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle>Status do Sistema</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-green-500/5 border border-green-500/20 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-sm font-medium">Sistema operacional</p>
                    <p className="text-xs text-muted-foreground">{agentConfigs.length} agentes configurados, {scriptVariants.length} variantes ativas</p>
                  </div>
                </div>
                {championVariant && (
                  <div className="flex items-center gap-3 p-3 bg-amber-500/5 border border-amber-500/20 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                    <div>
                      <p className="text-sm font-medium">Champion ativo: {championVariant.name}</p>
                      <p className="text-xs text-muted-foreground">Conversion rate: {(Number(championVariant.conversion_rate) || 0).toFixed(1)}%</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Auto-ML</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Auto Retraining</p>
                    <p className="text-sm text-muted-foreground">Retreinar quando performance cair</p>
                  </div>
                  <Button variant={autoRetraining ? "default" : "outline"} onClick={() => setAutoRetraining(!autoRetraining)}>
                    {autoRetraining ? "Ativo" : "Inativo"}
                  </Button>
                </div>
                <div>
                  <label className="text-sm font-medium">Limite de Performance</label>
                  <Select defaultValue="90">
                    <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="85">85% Accuracy</SelectItem>
                      <SelectItem value="90">90% Accuracy</SelectItem>
                      <SelectItem value="95">95% Accuracy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MLOpsCenter;
