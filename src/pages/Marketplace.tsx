import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Bot, 
  Star, 
  Download, 
  Search, 
  Filter,
  Zap,
  Target,
  MessageSquare,
  Palette,
  TrendingUp,
  Users,
  Clock,
  Shield
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Marketplace = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const agents = [
    {
      id: 1,
      name: "Super Copy IA",
      description: "Agente especializado em copywriting persuasivo com 95% de taxa de conversão",
      author: "Marketing Pro",
      rating: 4.9,
      downloads: 15420,
      price: "Gratuito",
      category: "copy",
      tags: ["copywriting", "conversão", "vendas"],
      icon: MessageSquare,
      features: ["Copy para anúncios", "E-mail marketing", "Landing pages", "A/B Testing"],
      verified: true
    },
    {
      id: 2,
      name: "Creative Master",
      description: "Gerador de criativos visuais com IA avançada para todas as plataformas",
      author: "Design Studio",
      rating: 4.8,
      downloads: 12300,
      price: "R$ 49/mês",
      category: "creative",
      tags: ["design", "visual", "criativos"],
      icon: Palette,
      features: ["Imagens 4K", "Vídeos curtos", "Templates", "Brand consistency"],
      verified: true
    },
    {
      id: 3,
      name: "Prospect Hunter Pro",
      description: "Sistema avançado de prospecção com LinkedIn, WhatsApp e E-mail",
      author: "Sales Team",
      rating: 4.7,
      downloads: 8900,
      price: "R$ 99/mês",
      category: "prospect",
      tags: ["prospecção", "leads", "vendas"],
      icon: Target,
      features: ["Multi-canal", "Lead scoring", "Sequências automáticas", "CRM integrado"],
      verified: false
    },
    {
      id: 4,
      name: "Analytics Genius",
      description: "Análise preditiva de campanhas com machine learning avançado",
      author: "Data Science Co",
      rating: 4.9,
      downloads: 6700,
      price: "R$ 199/mês",
      category: "analytics",
      tags: ["analytics", "ML", "predição"],
      icon: TrendingUp,
      features: ["Predição ROI", "Anomaly detection", "Auto-otimização", "Relatórios IA"],
      verified: true
    }
  ];

  const templates = [
    {
      id: 1,
      name: "E-commerce Complete",
      description: "Template completo para campanhas de e-commerce com foco em conversão",
      author: "Commerce Expert",
      rating: 4.8,
      downloads: 3400,
      price: "R$ 29",
      category: "campaign",
      tags: ["e-commerce", "vendas", "conversão"],
      preview: "/placeholder.svg"
    },
    {
      id: 2,
      name: "Lead Magnet Pro",
      description: "Funil completo para captura e nutrição de leads B2B",
      author: "B2B Master",
      rating: 4.9,
      downloads: 2800,
      price: "R$ 39",
      category: "funnel",
      tags: ["B2B", "leads", "nutrição"],
      preview: "/placeholder.svg"
    },
    {
      id: 3,
      name: "Social Media Viral",
      description: "Templates otimizados para viralização em redes sociais",
      author: "Viral Agency",
      rating: 4.7,
      downloads: 5600,
      price: "Gratuito",
      category: "social",
      tags: ["viral", "social", "engajamento"],
      preview: "/placeholder.svg"
    }
  ];

  const categories = [
    { id: "all", name: "Todos", icon: Bot },
    { id: "copy", name: "Copywriting", icon: MessageSquare },
    { id: "creative", name: "Criativos", icon: Palette },
    { id: "prospect", name: "Prospecção", icon: Target },
    { id: "analytics", name: "Analytics", icon: TrendingUp }
  ];

  const filteredAgents = agents.filter(agent => {
    const matchesSearch = agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         agent.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || agent.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4">
        <div>
          <h1 className="text-3xl font-bold">Marketplace de Agentes IA</h1>
          <p className="text-muted-foreground">
            Descubra, instale e configure agentes IA e templates prontos para usar
          </p>
        </div>

        {/* Search and Filters */}
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar agentes e templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => {
                const Icon = category.icon;
                return (
                  <SelectItem key={category.id} value={category.id}>
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      {category.name}
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="agents" className="space-y-6">
        <TabsList>
          <TabsTrigger value="agents">Agentes IA</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="my-agents">Meus Agentes</TabsTrigger>
        </TabsList>

        <TabsContent value="agents" className="space-y-6">
          {/* Featured Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              Agentes em Destaque
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredAgents.map((agent) => {
                const Icon = agent.icon;
                return (
                  <Card key={agent.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <Icon className="h-5 w-5 text-primary" />
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <CardTitle className="text-sm">{agent.name}</CardTitle>
                              {agent.verified && (
                                <Shield className="h-4 w-4 text-green-500" />
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              {agent.rating}
                              <span>•</span>
                              <Download className="h-3 w-3" />
                              {agent.downloads.toLocaleString()}
                            </div>
                          </div>
                        </div>
                        <Badge variant={agent.price === "Gratuito" ? "secondary" : "default"}>
                          {agent.price}
                        </Badge>
                      </div>
                      
                      <CardDescription className="text-xs">
                        {agent.description}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src="/placeholder.svg" />
                          <AvatarFallback className="text-xs">
                            {agent.author.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-muted-foreground">
                          por {agent.author}
                        </span>
                      </div>

                      <div className="space-y-2">
                        <p className="text-xs font-medium">Recursos principais:</p>
                        <div className="space-y-1">
                          {agent.features.slice(0, 3).map((feature, index) => (
                            <div key={index} className="flex items-center gap-2 text-xs text-muted-foreground">
                              <div className="h-1 w-1 bg-primary rounded-full" />
                              {feature}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {agent.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>

                    <CardFooter className="flex gap-2">
                      <Button size="sm" className="flex-1">
                        Instalar
                      </Button>
                      <Button size="sm" variant="outline">
                        Preview
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Templates de Campanha</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTemplates.map((template) => (
                <Card key={template.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="aspect-video bg-muted rounded-lg mb-3"></div>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-base">{template.name}</CardTitle>
                      <Badge variant={template.price === "Gratuito" ? "secondary" : "default"}>
                        {template.price}
                      </Badge>
                    </div>
                    <CardDescription className="text-sm">
                      {template.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src="/placeholder.svg" />
                        <AvatarFallback className="text-xs">
                          {template.author.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs text-muted-foreground">
                        por {template.author}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        {template.rating}
                      </div>
                      <div className="flex items-center gap-1">
                        <Download className="h-3 w-3" />
                        {template.downloads}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {template.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>

                  <CardFooter className="flex gap-2">
                    <Button size="sm" className="flex-1">
                      Usar Template
                    </Button>
                    <Button size="sm" variant="outline">
                      Preview
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="my-agents" className="space-y-6">
          <div className="text-center py-12">
            <Bot className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum agente instalado</h3>
            <p className="text-muted-foreground mb-6">
              Instale agentes do marketplace para começar a usar
            </p>
            <Button>Explorar Marketplace</Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Marketplace;