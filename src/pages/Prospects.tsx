import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  Filter, 
  Users, 
  MessageSquare, 
  Mail,
  Phone,
  Building,
  MapPin,
  Star,
  Play,
  Pause,
  MoreHorizontal,
  Plus,
  Zap,
  Target
} from "lucide-react";

export const Prospects = () => {
  const [prospects] = useState([
    {
      id: 1,
      name: "João Silva",
      company: "Tech Solutions LTDA",
      role: "CEO",
      location: "São Paulo, SP",
      industry: "Tecnologia",
      employees: "50-100",
      email: "joao@techsolutions.com",
      phone: "(11) 99999-9999",
      linkedin: "linkedin.com/in/joaosilva",
      score: 85,
      status: "qualified",
      lastContact: "2024-01-20",
      source: "LinkedIn"
    },
    {
      id: 2,
      name: "Maria Santos",
      company: "Growth Marketing Co.",
      role: "CMO",
      location: "Rio de Janeiro, RJ",
      industry: "Marketing",
      employees: "20-50",
      email: "maria@growthmarketing.com",
      phone: "(21) 88888-8888",
      linkedin: "linkedin.com/in/mariasantos",
      score: 92,
      status: "hot",
      lastContact: "2024-01-22",
      source: "Google Search"
    },
    {
      id: 3,
      name: "Pedro Costa",
      company: "E-commerce Plus",
      role: "Founder",
      location: "Belo Horizonte, MG",
      industry: "E-commerce",
      employees: "10-20",
      email: "pedro@ecommerceplus.com",
      phone: "(31) 77777-7777",
      linkedin: "linkedin.com/in/pedrocosta",
      score: 67,
      status: "cold",
      lastContact: "2024-01-18",
      source: "Meta Ads"
    }
  ]);

  const [sequences] = useState([
    {
      id: 1,
      name: "Sequência B2B Tech",
      description: "Para CEOs e CTOs de empresas de tecnologia",
      steps: 5,
      activeLeads: 23,
      responseRate: "12%",
      status: "active"
    },
    {
      id: 2,
      name: "E-commerce Growth",
      description: "Donos de lojas online interessados em crescer",
      steps: 7,
      activeLeads: 45,
      responseRate: "8%",
      status: "active"
    },
    {
      id: 3,
      name: "Agências Digitais",
      description: "Parceria com agências menores",
      steps: 4,
      activeLeads: 12,
      responseRate: "15%",
      status: "paused"
    }
  ]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-growth";
    if (score >= 60) return "text-warning";
    return "text-muted-foreground";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'hot':
        return 'bg-destructive/10 text-destructive';
      case 'qualified':
        return 'bg-growth/10 text-growth';
      case 'cold':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'hot':
        return 'Quente';
      case 'qualified':
        return 'Qualificado';
      case 'cold':
        return 'Frio';
      default:
        return 'Novo';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Prospecção</h1>
          <p className="text-muted-foreground">Encontre e gerencie leads automaticamente</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2">
            <Plus className="w-4 h-4" />
            Nova Sequência
          </Button>
          <Button className="gap-2">
            <Zap className="w-4 h-4" />
            Iniciar Prospecção
          </Button>
        </div>
      </div>

      <Tabs defaultValue="prospects" className="space-y-6">
        <TabsList>
          <TabsTrigger value="prospects">Prospects</TabsTrigger>
          <TabsTrigger value="sequences">Sequências</TabsTrigger>
          <TabsTrigger value="finder">Lead Finder</TabsTrigger>
        </TabsList>

        <TabsContent value="prospects" className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Prospects</p>
                  <p className="text-2xl font-bold text-foreground">1.247</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-growth" />
                <div>
                  <p className="text-sm text-muted-foreground">Qualificados</p>
                  <p className="text-2xl font-bold text-growth">89</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-warning" />
                <div>
                  <p className="text-sm text-muted-foreground">Em Contato</p>
                  <p className="text-2xl font-bold text-warning">156</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-engagement" />
                <div>
                  <p className="text-sm text-muted-foreground">Taxa Resposta</p>
                  <p className="text-2xl font-bold text-engagement">11%</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Filters */}
          <Card className="p-4">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Buscar prospects..." className="pl-10" />
                </div>
              </div>
              <Select>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Indústria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tech">Tecnologia</SelectItem>
                  <SelectItem value="ecommerce">E-commerce</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hot">Quente</SelectItem>
                  <SelectItem value="qualified">Qualificado</SelectItem>
                  <SelectItem value="cold">Frio</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4" />
              </Button>
            </div>
          </Card>

          {/* Prospects List */}
          <Card className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Prospect</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Empresa</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Localização</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Score</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Status</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Último Contato</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {prospects.map((prospect) => (
                    <tr key={prospect.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                      <td className="py-4 px-2">
                        <div>
                          <p className="font-medium text-foreground">{prospect.name}</p>
                          <p className="text-xs text-muted-foreground">{prospect.role}</p>
                        </div>
                      </td>
                      <td className="py-4 px-2">
                        <div>
                          <p className="text-sm text-foreground">{prospect.company}</p>
                          <p className="text-xs text-muted-foreground">{prospect.industry} • {prospect.employees}</p>
                        </div>
                      </td>
                      <td className="py-4 px-2 text-sm text-foreground">{prospect.location}</td>
                      <td className="py-4 px-2">
                        <span className={`text-sm font-bold ${getScoreColor(prospect.score)}`}>
                          {prospect.score}
                        </span>
                      </td>
                      <td className="py-4 px-2">
                        <Badge className={getStatusColor(prospect.status)}>
                          {getStatusText(prospect.status)}
                        </Badge>
                      </td>
                      <td className="py-4 px-2 text-sm text-muted-foreground">{prospect.lastContact}</td>
                      <td className="py-4 px-2">
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm">
                            <MessageSquare className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Mail className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="sequences" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sequences.map((sequence) => (
              <Card key={sequence.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{sequence.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{sequence.description}</p>
                  </div>
                  <Badge className={sequence.status === 'active' ? 'bg-growth/10 text-growth' : 'bg-muted text-muted-foreground'}>
                    {sequence.status === 'active' ? 'Ativa' : 'Pausada'}
                  </Badge>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Etapas:</span>
                    <span className="font-medium text-foreground">{sequence.steps}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Leads Ativos:</span>
                    <span className="font-medium text-foreground">{sequence.activeLeads}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Taxa Resposta:</span>
                    <span className="font-medium text-growth">{sequence.responseRate}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    {sequence.status === 'active' ? (
                      <Pause className="w-3 h-3 mr-1" />
                    ) : (
                      <Play className="w-3 h-3 mr-1" />
                    )}
                    {sequence.status === 'active' ? 'Pausar' : 'Ativar'}
                  </Button>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="w-3 h-3" />
                  </Button>
                </div>
              </Card>
            ))}

            {/* Create New Sequence */}
            <Card className="p-6 border-dashed border-2 border-border hover:border-primary/50 transition-colors">
              <div className="text-center">
                <Plus className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="font-semibold text-foreground mb-2">Nova Sequência</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Crie uma sequência automatizada de contato
                </p>
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  Criar Sequência
                </Button>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="finder" className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <Search className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">Lead Finder</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              <div>
                <Label htmlFor="industry">Indústria</Label>
                <Select>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Selecione a indústria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tech">Tecnologia</SelectItem>
                    <SelectItem value="ecommerce">E-commerce</SelectItem>
                    <SelectItem value="marketing">Marketing Digital</SelectItem>
                    <SelectItem value="saas">SaaS</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="role">Cargo/Função</Label>
                <Select>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Selecione o cargo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ceo">CEO/Founder</SelectItem>
                    <SelectItem value="cmo">CMO/Marketing</SelectItem>
                    <SelectItem value="cto">CTO/Tecnologia</SelectItem>
                    <SelectItem value="sales">Vendas</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="location">Localização</Label>
                <Select>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Selecione a região" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sp">São Paulo</SelectItem>
                    <SelectItem value="rj">Rio de Janeiro</SelectItem>
                    <SelectItem value="mg">Minas Gerais</SelectItem>
                    <SelectItem value="brasil">Todo Brasil</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="company-size">Tamanho da Empresa</Label>
                <Select>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Número de funcionários" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-10">1-10 funcionários</SelectItem>
                    <SelectItem value="11-50">11-50 funcionários</SelectItem>
                    <SelectItem value="51-200">51-200 funcionários</SelectItem>
                    <SelectItem value="200+">200+ funcionários</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="keywords">Palavras-chave</Label>
                <Input 
                  className="mt-2"
                  placeholder="Ex: marketing digital, vendas online"
                />
              </div>

              <div>
                <Label htmlFor="volume">Volume Desejado</Label>
                <Select>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Quantos leads?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="50">50 leads</SelectItem>
                    <SelectItem value="100">100 leads</SelectItem>
                    <SelectItem value="250">250 leads</SelectItem>
                    <SelectItem value="500">500 leads</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-4">
              <Button className="gap-2">
                <Search className="w-4 h-4" />
                Buscar Leads
              </Button>
              <Button variant="outline">
                Salvar Filtro
              </Button>
            </div>

            <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
              <div className="flex items-start gap-3">
                <Zap className="w-5 h-5 text-primary mt-1" />
                <div>
                  <h4 className="font-medium text-primary mb-1">Prospecção com IA</h4>
                  <p className="text-sm text-foreground">
                    Nossa IA analisará perfis, encontrará informações de contato e criará sequências 
                    personalizadas automaticamente baseado nos seus critérios.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};