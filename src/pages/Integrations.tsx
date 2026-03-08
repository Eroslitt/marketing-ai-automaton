import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { 
  Link, CheckCircle, AlertCircle, Settings, Plus, ExternalLink,
  Key, Zap, MessageSquare, Mail, BarChart3, CreditCard, Users, RefreshCw
} from "lucide-react";

const PROVIDER_META: Record<string, { name: string; description: string; icon: string; category: string; features: string[] }> = {
  meta_ads: { name: "Meta Ads", description: "Facebook e Instagram Ads", icon: "📘", category: "ads", features: ["Criação de campanhas", "Otimização automática", "Relatórios em tempo real"] },
  google_ads: { name: "Google Ads", description: "Anúncios no Google e YouTube", icon: "🟡", category: "ads", features: ["Search Ads", "Display Ads", "YouTube Ads"] },
  tiktok_ads: { name: "TikTok Ads", description: "Anúncios no TikTok", icon: "⚫", category: "ads", features: ["In-Feed Ads", "Spark Ads", "Brand Takeover"] },
  linkedin_ads: { name: "LinkedIn Ads", description: "Anúncios B2B no LinkedIn", icon: "💼", category: "ads", features: ["Sponsored Content", "Message Ads", "Lead Gen Forms"] },
  whatsapp: { name: "WhatsApp Business", description: "API oficial do WhatsApp", icon: "💬", category: "messaging", features: ["Mensagens automáticas", "Templates aprovados", "Métricas"] },
  mailchimp: { name: "Mailchimp", description: "E-mail marketing e automação", icon: "📧", category: "email", features: ["Campanhas de e-mail", "Automações", "Segmentação"] },
  hubspot: { name: "HubSpot CRM", description: "CRM e automação de marketing", icon: "🟠", category: "crm", features: ["Sync de contatos", "Pipeline", "Relatórios"] },
  stripe: { name: "Stripe", description: "Processamento de pagamentos", icon: "💳", category: "payment", features: ["Checkout", "Subscriptions", "Webhooks"] },
};

const ALL_PROVIDERS = Object.keys(PROVIDER_META);

const categories = [
  { id: "ads", name: "Plataformas de Anúncios", icon: BarChart3 },
  { id: "messaging", name: "Mensagens", icon: MessageSquare },
  { id: "email", name: "E-mail Marketing", icon: Mail },
  { id: "crm", name: "CRM", icon: Users },
  { id: "payment", name: "Pagamentos", icon: CreditCard },
];

export const Integrations = () => {
  const { user } = useAuth();
  const [integrations, setIntegrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [connectDialog, setConnectDialog] = useState<string | null>(null);
  const [apiKeyInput, setApiKeyInput] = useState("");

  useEffect(() => {
    if (user) loadIntegrations();
  }, [user]);

  const loadIntegrations = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("integrations")
      .select("*")
      .eq("user_id", user!.id);
    setIntegrations(data || []);
    setLoading(false);
  };

  const getIntegrationByProvider = (provider: string) =>
    integrations.find((i) => i.provider === provider);

  const handleConnect = async (provider: string) => {
    if (!user) return;
    const existing = getIntegrationByProvider(provider);
    if (existing) {
      // Toggle connection
      const { error } = await supabase
        .from("integrations")
        .update({ is_connected: !existing.is_connected, last_sync_at: new Date().toISOString() })
        .eq("id", existing.id);
      if (error) { toast.error("Erro ao atualizar integração"); return; }
      toast.success(existing.is_connected ? "Integração desconectada" : "Integração reconectada");
    } else {
      const config: any = {};
      if (apiKeyInput) config.api_key_set = true;
      const { error } = await supabase.from("integrations").insert({
        user_id: user.id,
        provider,
        is_connected: true,
        config,
        last_sync_at: new Date().toISOString(),
      });
      if (error) { toast.error("Erro ao conectar"); return; }
      toast.success("Integração conectada com sucesso!");
    }
    setConnectDialog(null);
    setApiKeyInput("");
    loadIntegrations();
  };

  const handleDelete = async (id: string) => {
    await supabase.from("integrations").delete().eq("id", id);
    toast.success("Integração removida");
    loadIntegrations();
  };

  const connectedCount = integrations.filter((i) => i.is_connected).length;

  const renderProviderCard = (provider: string) => {
    const meta = PROVIDER_META[provider];
    const integration = getIntegrationByProvider(provider);
    const isConnected = integration?.is_connected;

    return (
      <Card key={provider} className="p-6 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="text-2xl">{meta.icon}</div>
            <div>
              <h3 className="font-semibold text-foreground">{meta.name}</h3>
              <p className="text-sm text-muted-foreground">{meta.description}</p>
            </div>
          </div>
          <Badge className={isConnected ? "bg-green-500/10 text-green-500" : "bg-muted text-muted-foreground"}>
            {isConnected ? <><CheckCircle className="w-3 h-3 mr-1" />Conectado</> : <><Link className="w-3 h-3 mr-1" />Desconectado</>}
          </Badge>
        </div>

        {isConnected && integration?.last_sync_at && (
          <p className="text-xs text-muted-foreground mb-3">
            Última sincronização: {new Date(integration.last_sync_at).toLocaleString("pt-BR")}
          </p>
        )}

        <div className="space-y-1 mb-4">
          {meta.features.slice(0, 3).map((f, i) => (
            <p key={i} className="text-xs text-muted-foreground flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-green-500" /> {f}
            </p>
          ))}
        </div>

        <div className="flex gap-2">
          {isConnected ? (
            <>
              <Button variant="outline" size="sm" className="flex-1" onClick={() => handleConnect(provider)}>
                <Settings className="w-3 h-3 mr-1" /> Desconectar
              </Button>
              <Button variant="ghost" size="sm" onClick={() => handleDelete(integration.id)}>
                <AlertCircle className="w-3 h-3" />
              </Button>
            </>
          ) : (
            <Button size="sm" className="flex-1 gap-2" onClick={() => setConnectDialog(provider)}>
              <Link className="w-3 h-3" /> Conectar
            </Button>
          )}
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Integrações</h1>
          <p className="text-muted-foreground">Conecte sua agência IA com plataformas externas</p>
        </div>
        <Button variant="outline" size="icon" onClick={loadIntegrations}>
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <div>
              <p className="text-sm text-muted-foreground">Conectadas</p>
              <p className="text-2xl font-bold text-green-500">{connectedCount}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Link className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Disponíveis</p>
              <p className="text-2xl font-bold text-foreground">{ALL_PROVIDERS.length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Categorias</p>
              <p className="text-2xl font-bold text-primary">{categories.length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500" />
            <div>
              <p className="text-sm text-muted-foreground">Sincronizações</p>
              <p className="text-2xl font-bold text-amber-500">{integrations.filter(i => i.last_sync_at).length}</p>
            </div>
          </div>
        </Card>
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">Todas</TabsTrigger>
          {categories.map((c) => (
            <TabsTrigger key={c.id} value={c.id}>{c.name}</TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="all">
          {loading ? (
            <p className="text-muted-foreground text-center py-8">Carregando...</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ALL_PROVIDERS.map(renderProviderCard)}
            </div>
          )}
        </TabsContent>

        {categories.map((cat) => (
          <TabsContent key={cat.id} value={cat.id}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ALL_PROVIDERS.filter((p) => PROVIDER_META[p].category === cat.id).map(renderProviderCard)}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Connect Dialog */}
      <Dialog open={!!connectDialog} onOpenChange={() => { setConnectDialog(null); setApiKeyInput(""); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Conectar {connectDialog ? PROVIDER_META[connectDialog]?.name : ""}</DialogTitle>
            <DialogDescription>Configure a integração com a plataforma</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>API Key (opcional)</Label>
              <Input
                type="password"
                placeholder="Insira a API key se necessário..."
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                className="mt-2"
              />
              <p className="text-xs text-muted-foreground mt-1">
                As credenciais são armazenadas de forma segura
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setConnectDialog(null)}>Cancelar</Button>
            <Button onClick={() => connectDialog && handleConnect(connectDialog)}>
              <Link className="w-4 h-4 mr-2" /> Conectar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
