import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Loader2 } from "lucide-react";
import { 
  Bot, Star, Download, Search, Filter, Zap, Target, MessageSquare, Palette, TrendingUp, Shield, Trash2
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const CATALOG_AGENTS = [
  { id: "super-copy", name: "Super Copy IA", description: "Copywriting persuasivo com 95% de taxa de conversão", author: "Marketing Pro", rating: 4.9, downloads: 15420, price: "Gratuito", category: "copy", tags: ["copywriting", "conversão"], icon: MessageSquare, features: ["Copy para anúncios", "E-mail marketing", "Landing pages"], verified: true },
  { id: "creative-master", name: "Creative Master", description: "Gerador de criativos visuais com IA avançada", author: "Design Studio", rating: 4.8, downloads: 12300, price: "R$ 49/mês", category: "creative", tags: ["design", "visual"], icon: Palette, features: ["Imagens 4K", "Vídeos curtos", "Templates"], verified: true },
  { id: "prospect-hunter", name: "Prospect Hunter Pro", description: "Prospecção avançada multi-canal", author: "Sales Team", rating: 4.7, downloads: 8900, price: "R$ 99/mês", category: "prospect", tags: ["prospecção", "leads"], icon: Target, features: ["Multi-canal", "Lead scoring", "Sequências automáticas"], verified: false },
  { id: "analytics-genius", name: "Analytics Genius", description: "Análise preditiva com machine learning", author: "Data Science Co", rating: 4.9, downloads: 6700, price: "R$ 199/mês", category: "analytics", tags: ["analytics", "ML"], icon: TrendingUp, features: ["Predição ROI", "Anomaly detection", "Auto-otimização"], verified: true },
];

const categories = [
  { id: "all", name: "Todos", icon: Bot },
  { id: "copy", name: "Copywriting", icon: MessageSquare },
  { id: "creative", name: "Criativos", icon: Palette },
  { id: "prospect", name: "Prospecção", icon: Target },
  { id: "analytics", name: "Analytics", icon: TrendingUp }
];

const Marketplace = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [installedAgents, setInstalledAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (user) loadInstalled(); }, [user]);

  const loadInstalled = async () => {
    const { data } = await supabase.from('marketplace_agents').select('*').eq('user_id', user!.id);
    setInstalledAgents(data || []);
    setLoading(false);
  };

  const isInstalled = (agentId: string) => installedAgents.some(a => a.agent_name === agentId);

  const handleInstall = async (agent: typeof CATALOG_AGENTS[0]) => {
    if (!user) return;
    try {
      const { error } = await supabase.from('marketplace_agents').insert({
        user_id: user.id,
        agent_name: agent.id,
        agent_type: agent.category,
        description: agent.description,
        author: agent.author,
        category: agent.category,
      });
      if (error) throw error;
      toast.success(`${agent.name} instalado com sucesso!`);
      loadInstalled();
    } catch { toast.error("Erro ao instalar agente"); }
  };

  const handleUninstall = async (id: string) => {
    await supabase.from('marketplace_agents').delete().eq('id', id);
    toast.success("Agente removido");
    loadInstalled();
  };

  const filteredAgents = CATALOG_AGENTS.filter(a => {
    const matchesSearch = a.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === "all" || a.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Marketplace de Agentes IA</h1>
        <p className="text-muted-foreground">Descubra, instale e configure agentes IA</p>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input placeholder="Buscar agentes..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-[180px]"><Filter className="h-4 w-4 mr-2" /><SelectValue /></SelectTrigger>
          <SelectContent>{categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="agents" className="space-y-6">
        <TabsList>
          <TabsTrigger value="agents">Agentes IA</TabsTrigger>
          <TabsTrigger value="my-agents">Meus Agentes ({installedAgents.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="agents" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredAgents.map((agent) => {
              const Icon = agent.icon;
              const installed = isInstalled(agent.id);
              return (
                <Card key={agent.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg"><Icon className="h-5 w-5 text-primary" /></div>
                        <div>
                          <div className="flex items-center gap-2">
                            <CardTitle className="text-sm">{agent.name}</CardTitle>
                            {agent.verified && <Shield className="h-4 w-4 text-green-500" />}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />{agent.rating}
                            <span>•</span><Download className="h-3 w-3" />{agent.downloads.toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <Badge variant={agent.price === "Gratuito" ? "secondary" : "default"}>{agent.price}</Badge>
                    </div>
                    <CardDescription className="text-xs">{agent.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6"><AvatarFallback className="text-xs">{agent.author.charAt(0)}</AvatarFallback></Avatar>
                      <span className="text-xs text-muted-foreground">por {agent.author}</span>
                    </div>
                    <div className="space-y-1">
                      {agent.features.map((f, i) => (<div key={i} className="flex items-center gap-2 text-xs text-muted-foreground"><div className="h-1 w-1 bg-primary rounded-full" />{f}</div>))}
                    </div>
                    <div className="flex flex-wrap gap-1">{agent.tags.map(t => <Badge key={t} variant="outline" className="text-xs">{t}</Badge>)}</div>
                  </CardContent>
                  <CardFooter>
                    {installed ? (
                      <Button size="sm" variant="outline" className="flex-1" disabled>Instalado ✓</Button>
                    ) : (
                      <Button size="sm" className="flex-1" onClick={() => handleInstall(agent)}>Instalar</Button>
                    )}
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="my-agents" className="space-y-6">
          {installedAgents.length === 0 ? (
            <div className="text-center py-12">
              <Bot className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum agente instalado</h3>
              <p className="text-muted-foreground mb-6">Instale agentes do marketplace</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {installedAgents.map(agent => (
                <Card key={agent.id} className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-foreground">{agent.agent_name}</h4>
                      <p className="text-xs text-muted-foreground">{agent.author} • {agent.category}</p>
                    </div>
                    <Badge className={agent.is_active ? 'bg-green-500/10 text-green-500' : 'bg-muted text-muted-foreground'}>
                      {agent.is_active ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">{agent.description}</p>
                  <div className="flex gap-2">
                    <Button variant="destructive" size="sm" className="flex-1 gap-2" onClick={() => handleUninstall(agent.id)}>
                      <Trash2 className="w-3 h-3" /> Remover
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Marketplace;
