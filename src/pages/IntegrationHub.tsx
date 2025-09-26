import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { 
  Search, 
  Facebook, 
  Chrome, 
  MessageSquare, 
  Mail,
  Smartphone,
  BarChart,
  CreditCard,
  Settings,
  CheckCircle,
  AlertCircle,
  Clock,
  ExternalLink,
  Zap,
  Shield,
  Webhook,
  Database,
  Globe,
  Phone,
  Video
} from "lucide-react";

const IntegrationHub = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const integrations = [
    {
      id: "meta-ads",
      name: "Meta Ads (Facebook & Instagram)",
      description: "Conecte suas contas de anúncios do Facebook e Instagram para automação completa",
      category: "ads",
      status: "connected",
      icon: Facebook,
      features: ["Criação automática de campanhas", "Otimização de lances", "Relatórios em tempo real"],
      pricing: "Gratuito",
      setup: "API Key necessária",
      color: "bg-blue-500"
    },
    {
      id: "google-ads",
      name: "Google Ads",
      description: "Integração completa com Google Ads para campanhas de busca e display",
      category: "ads",
      status: "available",
      icon: Chrome,
      features: ["Google Search Ads", "Display Network", "YouTube Ads", "Shopping Ads"],
      pricing: "Gratuito",
      setup: "OAuth 2.0",
      color: "bg-green-500"
    },
    {
      id: "tiktok-ads",
      name: "TikTok Ads",
      description: "Crie e gerencie campanhas no TikTok com automação IA",
      category: "ads",
      status: "available",
      icon: Video,
      features: ["In-Feed Ads", "Spark Ads", "Branded Effects", "TopView Ads"],
      pricing: "Gratuito",
      setup: "TikTok Business Account",
      color: "bg-black"
    },
    {
      id: "whatsapp-business",
      name: "WhatsApp Business API",
      description: "Automação completa de atendimento via WhatsApp Business",
      category: "messaging",
      status: "connected",
      icon: MessageSquare,
      features: ["Chatbot IA", "Templates aprovados", "Broadcast", "Métricas detalhadas"],
      pricing: "R$ 0,05/msg",
      setup: "Número verificado",
      color: "bg-green-600"
    },
    {
      id: "mailchimp",
      name: "Mailchimp",
      description: "Integração com Mailchimp para e-mail marketing automatizado",
      category: "email",
      status: "pending",
      icon: Mail,
      features: ["Campanhas automáticas", "Segmentação IA", "A/B Testing", "Analytics"],
      pricing: "Gratuito até 2k contatos",
      setup: "API Key",
      color: "bg-yellow-500"
    },
    {
      id: "stripe",
      name: "Stripe",
      description: "Processamento de pagamentos e cobrança automática",
      category: "payment",
      status: "available",
      icon: CreditCard,
      features: ["Pagamentos recorrentes", "PIX", "Cartões", "Boleto"],
      pricing: "2.9% + R$ 0,39 por transação",
      setup: "Conta Stripe",
      color: "bg-purple-500"
    },
    {
      id: "hubspot",
      name: "HubSpot CRM",
      description: "Sincronização com HubSpot para gestão completa de leads",
      category: "crm",
      status: "available",
      icon: Database,
      features: ["Sync de contatos", "Pipeline automation", "Lead scoring", "Relatórios"],
      pricing: "Gratuito",
      setup: "OAuth 2.0",
      color: "bg-orange-500"
    },
    {
      id: "zapier",
      name: "Zapier",
      description: "Conecte com mais de 5000 aplicações via Zapier",
      category: "automation",
      status: "available",
      icon: Zap,
      features: ["5000+ integrações", "Workflows automáticos", "Triggers personalizados"],
      pricing: "Grátis até 100 tarefas/mês",
      setup: "Webhook URL",
      color: "bg-orange-400"
    }
  ];

  const categories = [
    { id: "all", name: "Todas", count: integrations.length },
    { id: "ads", name: "Anúncios", count: integrations.filter(i => i.category === "ads").length },
    { id: "messaging", name: "Mensagens", count: integrations.filter(i => i.category === "messaging").length },
    { id: "email", name: "E-mail", count: integrations.filter(i => i.category === "email").length },
    { id: "crm", name: "CRM", count: integrations.filter(i => i.category === "crm").length },
    { id: "payment", name: "Pagamentos", count: integrations.filter(i => i.category === "payment").length },
    { id: "automation", name: "Automação", count: integrations.filter(i => i.category === "automation").length }
  ];

  const webhooks = [
    {
      id: 1,
      name: "Campaign Status Updates",
      url: "https://api.agencia-ia.com/webhooks/campaigns",
      events: ["campaign.created", "campaign.paused", "campaign.completed"],
      status: "active",
      lastTriggered: "2024-01-15 14:32:22"
    },
    {
      id: 2,
      name: "Lead Notifications",
      url: "https://crm.empresa.com/api/leads",
      events: ["lead.created", "lead.qualified", "lead.converted"],
      status: "active",
      lastTriggered: "2024-01-15 14:28:15"
    },
    {
      id: 3,
      name: "Performance Alerts",
      url: "https://slack.com/api/webhooks/T00000000/B00000000/XXXXXXXX",
      events: ["performance.threshold", "budget.exceeded"],
      status: "inactive",
      lastTriggered: "2024-01-10 09:15:33"
    }
  ];

  const filteredIntegrations = integrations.filter(integration => {
    const matchesSearch = integration.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         integration.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || integration.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "connected": return "text-green-500";
      case "pending": return "text-yellow-500";
      case "available": return "text-gray-500";
      default: return "text-gray-500";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "connected": return CheckCircle;
      case "pending": return Clock;
      case "available": return AlertCircle;
      default: return AlertCircle;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "connected": return "Conectado";
      case "pending": return "Pendente";
      case "available": return "Disponível";
      default: return "Desconhecido";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4">
        <div>
          <h1 className="text-3xl font-bold">Hub de Integrações</h1>
          <p className="text-muted-foreground">
            Conecte todas as suas ferramentas favoritas e automatize seus fluxos de trabalho
          </p>
        </div>

        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar integrações..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="space-y-6">
        <TabsList className="grid w-full grid-cols-7">
          {categories.map((category) => (
            <TabsTrigger key={category.id} value={category.id} className="text-xs">
              {category.name} ({category.count})
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedCategory} className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="flex items-center gap-3 p-4">
                <CheckCircle className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Conectadas</p>
                  <p className="text-2xl font-bold">
                    {integrations.filter(i => i.status === "connected").length}
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="flex items-center gap-3 p-4">
                <Globe className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Disponíveis</p>
                  <p className="text-2xl font-bold">{integrations.length}</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="flex items-center gap-3 p-4">
                <Webhook className="h-8 w-8 text-purple-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Webhooks</p>
                  <p className="text-2xl font-bold">{webhooks.length}</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="flex items-center gap-3 p-4">
                <Zap className="h-8 w-8 text-yellow-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Automações</p>
                  <p className="text-2xl font-bold">12</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Integrations Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredIntegrations.map((integration) => {
              const Icon = integration.icon;
              const StatusIcon = getStatusIcon(integration.status);
              
              return (
                <Card key={integration.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-3 ${integration.color} rounded-lg`}>
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-base">{integration.name}</CardTitle>
                          <div className={`flex items-center gap-2 ${getStatusColor(integration.status)}`}>
                            <StatusIcon className="h-4 w-4" />
                            <span className="text-sm">{getStatusText(integration.status)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <CardDescription className="text-sm">
                      {integration.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Recursos principais:</p>
                      <div className="space-y-1">
                        {integration.features.slice(0, 3).map((feature, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                            <div className="h-1 w-1 bg-primary rounded-full" />
                            {feature}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-between text-sm">
                      <div>
                        <span className="text-muted-foreground">Preço: </span>
                        <span className="font-medium">{integration.pricing}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Setup: </span>
                        <span className="font-medium">{integration.setup}</span>
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter>
                    {integration.status === "connected" ? (
                      <div className="flex gap-2 w-full">
                        <Button size="sm" variant="outline" className="flex-1">
                          <Settings className="h-4 w-4 mr-2" />
                          Configurar
                        </Button>
                        <Button size="sm" variant="outline">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <Button size="sm" className="w-full">
                        {integration.status === "pending" ? "Finalizar Setup" : "Conectar"}
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* Webhooks Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Webhooks Configurados</CardTitle>
              <CardDescription>
                Gerencie notificações em tempo real para sistemas externos
              </CardDescription>
            </div>
            <Button>
              <Webhook className="h-4 w-4 mr-2" />
              Novo Webhook
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {webhooks.map((webhook) => (
              <div key={webhook.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded">
                      <Webhook className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium">{webhook.name}</h4>
                      <p className="text-sm text-muted-foreground">{webhook.url}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch checked={webhook.status === "active"} />
                    <Badge variant={webhook.status === "active" ? "default" : "secondary"}>
                      {webhook.status === "active" ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Eventos: </span>
                    <span>{webhook.events.join(", ")}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Último disparo: </span>
                    <span>{webhook.lastTriggered}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IntegrationHub;