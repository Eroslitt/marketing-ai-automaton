import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Link,
  CheckCircle,
  AlertCircle,
  Settings,
  Plus,
  ExternalLink,
  Key,
  Zap,
  MessageSquare,
  Mail,
  BarChart3,
  CreditCard,
  Users
} from "lucide-react";

export const Integrations = () => {
  const [integrations] = useState([
    {
      id: "meta",
      name: "Meta Ads",
      description: "Facebook e Instagram Ads",
      category: "ads",
      icon: "📘",
      status: "connected",
      lastSync: "2024-01-22 14:30",
      features: ["Criação de campanhas", "Otimização automática", "Relatórios em tempo real"],
      accounts: ["Conta Principal", "Agência"],
      spending: "R$ 15.240"
    },
    {
      id: "google",
      name: "Google Ads",
      description: "Anúncios no Google e YouTube",
      category: "ads",
      icon: "🟡",
      status: "disconnected",
      lastSync: null,
      features: ["Search Ads", "Display Ads", "YouTube Ads", "Shopping Ads"],
      accounts: [],
      spending: null
    },
    {
      id: "tiktok",
      name: "TikTok Ads",
      description: "Anúncios no TikTok",
      category: "ads",
      icon: "⚫",
      status: "disconnected",
      lastSync: null,
      features: ["In-Feed Ads", "Spark Ads", "Brand Takeover"],
      accounts: [],
      spending: null
    },
    {
      id: "linkedin",
      name: "LinkedIn Ads",
      description: "Anúncios B2B no LinkedIn",
      category: "ads",
      icon: "💼",
      status: "connected",
      lastSync: "2024-01-21 09:15",
      features: ["Sponsored Content", "Message Ads", "Lead Gen Forms"],
      accounts: ["Empresa Principal"],
      spending: "R$ 3.450"
    },
    {
      id: "whatsapp",
      name: "WhatsApp Business",
      description: "API oficial do WhatsApp",
      category: "messaging",
      icon: "💬",
      status: "connected",
      lastSync: "2024-01-22 15:45",
      features: ["Mensagens automáticas", "Templates aprovados", "Métricas"],
      accounts: ["+55 11 99999-9999"],
      spending: null
    },
    {
      id: "mailchimp",
      name: "Mailchimp",
      description: "E-mail marketing e automação",
      category: "email",
      icon: "📧",
      status: "disconnected",
      lastSync: null,
      features: ["Campanhas de e-mail", "Automações", "Segmentação"],
      accounts: [],
      spending: null
    },
    {
      id: "hubspot",
      name: "HubSpot CRM",
      description: "CRM e automação de marketing",
      category: "crm",
      icon: "🟠",
      status: "connected",
      lastSync: "2024-01-22 12:20",
      features: ["Sync de contatos", "Pipeline", "Relatórios"],
      accounts: ["Conta Premium"],
      spending: null
    },
    {
      id: "stripe",
      name: "Stripe",
      description: "Processamento de pagamentos",
      category: "payment",
      icon: "💳",
      status: "disconnected",
      lastSync: null,
      features: ["Checkout", "Subscriptions", "Webhooks"],
      accounts: [],
      spending: null
    }
  ]);

  const categories = [
    { id: "ads", name: "Plataformas de Anúncios", icon: BarChart3 },
    { id: "messaging", name: "Mensagens", icon: MessageSquare },
    { id: "email", name: "E-mail Marketing", icon: Mail },
    { id: "crm", name: "CRM", icon: Users },
    { id: "payment", name: "Pagamentos", icon: CreditCard }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'bg-growth/10 text-growth';
      case 'error':
        return 'bg-destructive/10 text-destructive';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'connected':
        return 'Conectado';
      case 'error':
        return 'Erro';
      default:
        return 'Desconectado';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return CheckCircle;
      case 'error':
        return AlertCircle;
      default:
        return Link;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Integrações</h1>
          <p className="text-muted-foreground">Conecte sua agência IA com plataformas externas</p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Adicionar Integração
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-growth" />
            <div>
              <p className="text-sm text-muted-foreground">Conectadas</p>
              <p className="text-2xl font-bold text-growth">
                {integrations.filter(i => i.status === 'connected').length}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Link className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Disponíveis</p>
              <p className="text-2xl font-bold text-foreground">
                {integrations.length}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Gasto Total</p>
              <p className="text-2xl font-bold text-primary">R$ 18.690</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-warning" />
            <div>
              <p className="text-sm text-muted-foreground">Automações</p>
              <p className="text-2xl font-bold text-warning">47</p>
            </div>
          </div>
        </Card>
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">Todas</TabsTrigger>
          {categories.map((category) => (
            <TabsTrigger key={category.id} value={category.id}>
              {category.name}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {integrations.map((integration) => {
              const StatusIcon = getStatusIcon(integration.status);
              
              return (
                <Card key={integration.id} className="p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{integration.icon}</div>
                      <div>
                        <h3 className="font-semibold text-foreground">{integration.name}</h3>
                        <p className="text-sm text-muted-foreground">{integration.description}</p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(integration.status)}>
                      <StatusIcon className="w-3 h-3 mr-1" />
                      {getStatusText(integration.status)}
                    </Badge>
                  </div>

                  {integration.status === 'connected' && (
                    <div className="space-y-3 mb-4">
                      {integration.lastSync && (
                        <p className="text-xs text-muted-foreground">
                          Última sincronização: {integration.lastSync}
                        </p>
                      )}
                      
                      {integration.accounts.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-foreground mb-1">Contas:</p>
                          <div className="flex flex-wrap gap-1">
                            {integration.accounts.map((account, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {account}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {integration.spending && (
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-muted-foreground">Gasto mensal:</span>
                          <span className="text-sm font-medium text-foreground">
                            {integration.spending}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="space-y-2 mb-4">
                    <p className="text-xs font-medium text-foreground">Recursos:</p>
                    <div className="space-y-1">
                      {integration.features.slice(0, 3).map((feature, index) => (
                        <p key={index} className="text-xs text-muted-foreground flex items-center gap-1">
                          <CheckCircle className="w-3 h-3 text-growth" />
                          {feature}
                        </p>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {integration.status === 'connected' ? (
                      <>
                        <Button variant="outline" size="sm" className="flex-1">
                          <Settings className="w-3 h-3 mr-1" />
                          Configurar
                        </Button>
                        <Button variant="ghost" size="sm">
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                      </>
                    ) : (
                      <Button size="sm" className="flex-1 gap-2">
                        <Link className="w-3 h-3" />
                        Conectar
                      </Button>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {categories.map((category) => (
          <TabsContent key={category.id} value={category.id} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {integrations
                .filter(integration => integration.category === category.id)
                .map((integration) => {
                  const StatusIcon = getStatusIcon(integration.status);
                  
                  return (
                    <Card key={integration.id} className="p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="text-2xl">{integration.icon}</div>
                          <div>
                            <h3 className="font-semibold text-foreground">{integration.name}</h3>
                            <p className="text-sm text-muted-foreground">{integration.description}</p>
                          </div>
                        </div>
                        <Badge className={getStatusColor(integration.status)}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {getStatusText(integration.status)}
                        </Badge>
                      </div>

                      {integration.status === 'connected' && integration.accounts.length > 0 && (
                        <div className="mb-4">
                          <p className="text-xs font-medium text-foreground mb-1">Contas conectadas:</p>
                          <div className="flex flex-wrap gap-1">
                            {integration.accounts.map((account, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {account}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2">
                        {integration.status === 'connected' ? (
                          <>
                            <Button variant="outline" size="sm" className="flex-1">
                              <Settings className="w-3 h-3 mr-1" />
                              Configurar
                            </Button>
                            <Switch checked={true} />
                          </>
                        ) : (
                          <Button size="sm" className="flex-1 gap-2">
                            <Link className="w-3 h-3" />
                            Conectar
                          </Button>
                        )}
                      </div>
                    </Card>
                  );
                })}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* API Keys Section */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Key className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Chaves de API</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="openai-key">OpenAI API Key</Label>
              <Input
                id="openai-key"
                type="password"
                placeholder="sk-..."
                className="mt-2"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Para geração de copy e conteúdo com IA
              </p>
            </div>
            
            <div>
              <Label htmlFor="stability-key">Stability AI Key</Label>
              <Input
                id="stability-key"
                type="password"
                placeholder="sk-..."
                className="mt-2"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Para geração de imagens e criativos
              </p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="elevenlabs-key">ElevenLabs API Key</Label>
              <Input
                id="elevenlabs-key"
                type="password"
                placeholder="..."
                className="mt-2"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Para conversas de voz com IA
              </p>
            </div>
            
            <div>
              <Label htmlFor="webhook-url">Webhook URL</Label>
              <Input
                id="webhook-url"
                placeholder="https://sua-api.com/webhook"
                className="mt-2"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Para receber eventos das integrações
              </p>
            </div>
          </div>
        </div>
        
        <Button className="mt-6">
          Salvar Configurações
        </Button>
      </Card>
    </div>
  );
};