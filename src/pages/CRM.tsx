import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  Calendar,
  Plus,
  Filter,
  Search,
  Phone,
  Mail,
  MessageSquare,
  MoreHorizontal,
  Eye,
  Edit,
  Archive
} from "lucide-react";

export const CRM = () => {
  const [leads] = useState([
    {
      id: 1,
      name: "João Silva",
      company: "Tech Solutions LTDA",
      email: "joao@techsolutions.com",
      phone: "(11) 99999-9999",
      value: 25000,
      stage: "negotiation",
      probability: 75,
      source: "WhatsApp",
      assignedTo: "Carlos Vendas",
      lastContact: "2024-01-22",
      nextAction: "Enviar proposta final",
      tags: ["B2B", "Tecnologia"]
    },
    {
      id: 2,
      name: "Maria Santos",
      company: "Growth Marketing Co.",
      email: "maria@growthmarketing.com",
      phone: "(21) 88888-8888",
      value: 15000,
      stage: "proposal",
      probability: 60,
      source: "LinkedIn",
      assignedTo: "Ana Closer",
      lastContact: "2024-01-21",
      nextAction: "Follow-up proposta",
      tags: ["Marketing", "B2B"]
    },
    {
      id: 3,
      name: "Pedro Costa",
      company: "E-commerce Plus",
      email: "pedro@ecommerceplus.com",
      phone: "(31) 77777-7777",
      value: 8500,
      stage: "qualified",
      probability: 40,
      source: "Meta Ads",
      assignedTo: "Bruno SDR",
      lastContact: "2024-01-20",
      nextAction: "Agendar demo",
      tags: ["E-commerce", "PME"]
    },
    {
      id: 4,
      name: "Ana Costa",
      company: "Startup Inovadora",
      email: "ana@startup.com",
      phone: "(11) 66666-6666",
      value: 35000,
      stage: "discovery",
      probability: 25,
      source: "Prospecção",
      assignedTo: "Carlos Vendas",
      lastContact: "2024-01-19",
      nextAction: "Qualificar necessidades",
      tags: ["Startup", "SaaS"]
    }
  ]);

  const stages = [
    { id: "lead", name: "Lead", color: "bg-muted", count: 12 },
    { id: "qualified", name: "Qualificado", color: "bg-primary/20", count: 8 },
    { id: "discovery", name: "Descoberta", color: "bg-warning/20", count: 5 },
    { id: "proposal", name: "Proposta", color: "bg-engagement/20", count: 3 },
    { id: "negotiation", name: "Negociação", color: "bg-accent/20", count: 2 },
    { id: "closed-won", name: "Fechado-Ganho", color: "bg-growth/20", count: 1 },
    { id: "closed-lost", name: "Fechado-Perdido", color: "bg-destructive/20", count: 1 }
  ];

  const getStageInfo = (stageId: string) => {
    return stages.find(s => s.id === stageId) || stages[0];
  };

  const getProbabilityColor = (probability: number) => {
    if (probability >= 70) return "text-growth";
    if (probability >= 40) return "text-warning";
    return "text-muted-foreground";
  };

  const totalValue = leads.reduce((sum, lead) => sum + lead.value, 0);
  const weightedValue = leads.reduce((sum, lead) => sum + (lead.value * lead.probability / 100), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">CRM Pipeline</h1>
          <p className="text-muted-foreground">Gerencie leads e oportunidades de vendas</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2">
            <Filter className="w-4 h-4" />
            Filtrar
          </Button>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Novo Lead
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Total Leads</p>
              <p className="text-2xl font-bold text-foreground">{leads.length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-growth" />
            <div>
              <p className="text-sm text-muted-foreground">Valor Total</p>
              <p className="text-2xl font-bold text-growth">
                R$ {totalValue.toLocaleString('pt-BR')}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-warning" />
            <div>
              <p className="text-sm text-muted-foreground">Valor Ponderado</p>
              <p className="text-2xl font-bold text-warning">
                R$ {Math.round(weightedValue).toLocaleString('pt-BR')}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-engagement" />
            <div>
              <p className="text-sm text-muted-foreground">Taxa Conversão</p>
              <p className="text-2xl font-bold text-engagement">23%</p>
            </div>
          </div>
        </Card>
      </div>

      <Tabs defaultValue="pipeline" className="space-y-6">
        <TabsList>
          <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
          <TabsTrigger value="list">Lista de Leads</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="pipeline" className="space-y-6">
          {/* Pipeline Kanban */}
          <div className="overflow-x-auto">
            <div className="flex gap-4 min-w-max pb-4">
              {stages.map((stage) => (
                <Card key={stage.id} className="w-80 p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${stage.color.replace('/20', '')}`}></div>
                      <h3 className="font-semibold text-foreground">{stage.name}</h3>
                    </div>
                    <Badge variant="outline">{stage.count}</Badge>
                  </div>

                  <div className="space-y-3">
                    {leads
                      .filter(lead => lead.stage === stage.id)
                      .map((lead) => (
                        <Card key={lead.id} className="p-3 hover:shadow-sm transition-shadow cursor-pointer">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <h4 className="font-medium text-foreground text-sm">{lead.name}</h4>
                              <p className="text-xs text-muted-foreground">{lead.company}</p>
                            </div>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-3 h-3" />
                            </Button>
                          </div>

                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium text-foreground">
                                R$ {lead.value.toLocaleString('pt-BR')}
                              </span>
                              <span className={`text-xs font-medium ${getProbabilityColor(lead.probability)}`}>
                                {lead.probability}%
                              </span>
                            </div>

                            <Progress value={lead.probability} className="h-1" />

                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">{lead.assignedTo}</span>
                              <span className="text-muted-foreground">{lead.lastContact}</span>
                            </div>

                            <div className="flex gap-1">
                              {lead.tags.map((tag, index) => (
                                <Badge key={index} variant="outline" className="text-xs px-1 py-0">
                                  {tag}
                                </Badge>
                              ))}
                            </div>

                            <p className="text-xs text-muted-foreground">{lead.nextAction}</p>
                          </div>

                          <div className="flex gap-1 mt-3">
                            <Button variant="ghost" size="sm" className="h-7 px-2">
                              <Phone className="w-3 h-3" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-7 px-2">
                              <Mail className="w-3 h-3" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-7 px-2">
                              <MessageSquare className="w-3 h-3" />
                            </Button>
                          </div>
                        </Card>
                      ))}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="list" className="space-y-6">
          <Card className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Lead</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Empresa</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Valor</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Estágio</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Probabilidade</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Responsável</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Último Contato</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead) => {
                    const stageInfo = getStageInfo(lead.stage);
                    return (
                      <tr key={lead.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                        <td className="py-4 px-2">
                          <div className="flex items-center gap-3">
                            <Avatar className="w-8 h-8">
                              <AvatarFallback className="text-xs">
                                {lead.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-foreground text-sm">{lead.name}</p>
                              <p className="text-xs text-muted-foreground">{lead.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-2 text-sm text-foreground">{lead.company}</td>
                        <td className="py-4 px-2 text-sm font-medium text-foreground">
                          R$ {lead.value.toLocaleString('pt-BR')}
                        </td>
                        <td className="py-4 px-2">
                          <Badge className={stageInfo.color}>
                            {stageInfo.name}
                          </Badge>
                        </td>
                        <td className="py-4 px-2">
                          <span className={`text-sm font-medium ${getProbabilityColor(lead.probability)}`}>
                            {lead.probability}%
                          </span>
                        </td>
                        <td className="py-4 px-2 text-sm text-foreground">{lead.assignedTo}</td>
                        <td className="py-4 px-2 text-sm text-muted-foreground">{lead.lastContact}</td>
                        <td className="py-4 px-2">
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Conversão por Estágio</h3>
              <div className="space-y-4">
                {stages.slice(0, -2).map((stage, index) => {
                  const nextStage = stages[index + 1];
                  const conversionRate = nextStage ? Math.floor(Math.random() * 30) + 15 : 0;
                  
                  return (
                    <div key={stage.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${stage.color.replace('/20', '')}`}></div>
                        <span className="text-sm text-foreground">{stage.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress value={conversionRate} className="w-20 h-2" />
                        <span className="text-sm font-medium text-foreground w-10">{conversionRate}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Origem dos Leads</h3>
              <div className="space-y-3">
                {[
                  { source: "WhatsApp", count: 34, percentage: 42 },
                  { source: "LinkedIn", count: 28, percentage: 35 },
                  { source: "Meta Ads", count: 12, percentage: 15 },
                  { source: "Prospecção", count: 6, percentage: 8 }
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-foreground">{item.source}</span>
                    <div className="flex items-center gap-2">
                      <Progress value={item.percentage} className="w-20 h-2" />
                      <span className="text-sm font-medium text-foreground w-8">{item.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};