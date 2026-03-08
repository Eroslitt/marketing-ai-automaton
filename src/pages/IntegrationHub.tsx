import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { 
  Search, MessageSquare, Mail, CreditCard, Settings, CheckCircle, AlertCircle, Clock, ExternalLink, Zap, Webhook, Database, Globe, Phone, Video, BarChart3, Link
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const INTEGRATIONS_CATALOG = [
  { id: "meta-ads", name: "Meta Ads", description: "Facebook e Instagram Ads", category: "ads", icon: "📘", features: ["Criação de campanhas", "Otimização automática", "Relatórios em tempo real"] },
  { id: "google-ads", name: "Google Ads", description: "Anúncios no Google e YouTube", category: "ads", icon: "🟡", features: ["Search Ads", "Display Network", "YouTube Ads"] },
  { id: "tiktok-ads", name: "TikTok Ads", description: "Anúncios no TikTok", category: "ads", icon: "⚫", features: ["In-Feed Ads", "Spark Ads", "Brand Takeover"] },
  { id: "whatsapp-business", name: "WhatsApp Business API", description: "Automação via WhatsApp", category: "messaging", icon: "💬", features: ["Chatbot IA", "Templates", "Broadcast"] },
  { id: "mailchimp", name: "Mailchimp", description: "E-mail marketing automatizado", category: "email", icon: "📧", features: ["Campanhas automáticas", "Segmentação IA", "A/B Testing"] },
  { id: "stripe", name: "Stripe", description: "Processamento de pagamentos", category: "payment", icon: "💳", features: ["Checkout", "Subscriptions", "Webhooks"] },
  { id: "hubspot", name: "HubSpot CRM", description: "CRM e automação", category: "crm", icon: "🟠", features: ["Sync de contatos", "Pipeline", "Relatórios"] },
  { id: "zapier", name: "Zapier", description: "Conecte 5000+ aplicações", category: "automation", icon: "⚡", features: ["5000+ integrações", "Workflows automáticos", "Triggers"] },
];

const categories = [
  { id: "all", name: "Todas" },
  { id: "ads", name: "Anúncios" },
  { id: "messaging", name: "Mensagens" },
  { id: "email", name: "E-mail" },
  { id: "crm", name: "CRM" },
  { id: "payment", name: "Pagamentos" },
  { id: "automation", name: "Automação" },
];

const IntegrationHub = () => {
  const { user } = useAuth();
  const [integrations, setIntegrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [connectDialog, setConnectDialog] = useState<string | null>(null);
  const [apiKeyInput, setApiKeyInput] = useState("");

  useEffect(() => { if (user) loadIntegrations(); }, [user]);

  const loadIntegrations = async () => {
    const { data } = await supabase.from('integrations').select('*').eq('user_id', user!.id);
    setIntegrations(data || []);
    setLoading(false);
  };

  const getIntegration = (provider: string) => integrations.find(i => i.provider === provider);

  const handleConnect = async (provider: string) => {
    if (!user) return;
    const existing = getIntegration(provider);
    if (existing) {
      await supabase.from('integrations').update({ is_connected: !existing.is_connected, last_sync_at: new Date().toISOString() }).eq('id', existing.id);
      toast.success(existing.is_connected ? "Desconectado" : "Reconectado");
    } else {
      const config: any = {};
      if (apiKeyInput) config.api_key_set = true;
      await supabase.from('integrations').insert({ user_id: user.id, provider, is_connected: true, config, last_sync_at: new Date().toISOString() });
      toast.success("Integração conectada!");
    }
    setConnectDialog(null);
    setApiKeyInput("");
    loadIntegrations();
  };

  const filteredCatalog = INTEGRATIONS_CATALOG.filter(i => {
    const matchesSearch = i.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === "all" || i.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const connectedCount = integrations.filter(i => i.is_connected).length;

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Hub de Integrações</h1>
        <p className="text-muted-foreground">Conecte suas ferramentas e automatize fluxos</p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input placeholder="Buscar integrações..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4"><div className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-green-500" /><div><p className="text-sm text-muted-foreground">Conectadas</p><p className="text-2xl font-bold text-green-500">{connectedCount}</p></div></div></Card>
        <Card className="p-4"><div className="flex items-center gap-2"><Globe className="w-5 h-5 text-primary" /><div><p className="text-sm text-muted-foreground">Disponíveis</p><p className="text-2xl font-bold text-foreground">{INTEGRATIONS_CATALOG.length}</p></div></div></Card>
        <Card className="p-4"><div className="flex items-center gap-2"><BarChart3 className="w-5 h-5 text-primary" /><div><p className="text-sm text-muted-foreground">Categorias</p><p className="text-2xl font-bold text-primary">{categories.length - 1}</p></div></div></Card>
        <Card className="p-4"><div className="flex items-center gap-2"><Zap className="w-5 h-5 text-amber-500" /><div><p className="text-sm text-muted-foreground">Sincronizações</p><p className="text-2xl font-bold text-amber-500">{integrations.filter(i => i.last_sync_at).length}</p></div></div></Card>
      </div>

      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList>
          {categories.map(c => <TabsTrigger key={c.id} value={c.id}>{c.name}</TabsTrigger>)}
        </TabsList>
      </Tabs>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCatalog.map(item => {
          const integration = getIntegration(item.id);
          const isConnected = integration?.is_connected;
          return (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{item.icon}</div>
                    <div>
                      <CardTitle className="text-base">{item.name}</CardTitle>
                      <div className={`flex items-center gap-1 text-sm ${isConnected ? 'text-green-500' : 'text-muted-foreground'}`}>
                        {isConnected ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                        {isConnected ? 'Conectado' : 'Disponível'}
                      </div>
                    </div>
                  </div>
                </div>
                <CardDescription>{item.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {item.features.map((f, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <div className="h-1 w-1 bg-primary rounded-full" />{f}
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                {isConnected ? (
                  <div className="flex gap-2 w-full">
                    <Button size="sm" variant="outline" className="flex-1" onClick={() => handleConnect(item.id)}>
                      <Settings className="h-4 w-4 mr-2" /> Desconectar
                    </Button>
                  </div>
                ) : (
                  <Button size="sm" className="w-full" onClick={() => setConnectDialog(item.id)}>
                    <Link className="h-4 w-4 mr-2" /> Conectar
                  </Button>
                )}
              </CardFooter>
            </Card>
          );
        })}
      </div>

      <Dialog open={!!connectDialog} onOpenChange={() => { setConnectDialog(null); setApiKeyInput(""); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Conectar {connectDialog ? INTEGRATIONS_CATALOG.find(i => i.id === connectDialog)?.name : ''}</DialogTitle>
            <DialogDescription>Configure a integração</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div><Label>API Key (opcional)</Label><Input type="password" placeholder="Insira a API key..." value={apiKeyInput} onChange={e => setApiKeyInput(e.target.value)} className="mt-2" /></div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setConnectDialog(null)}>Cancelar</Button>
            <Button onClick={() => connectDialog && handleConnect(connectDialog)}>Conectar</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default IntegrationHub;
