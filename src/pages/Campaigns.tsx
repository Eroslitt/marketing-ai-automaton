import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Target, 
  Play, 
  Pause, 
  Settings,
  TrendingUp,
  Eye,
  MoreHorizontal
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const Campaigns = () => {
  const { toast } = useToast();
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCampaigns(data || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar campanhas",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const [campaignsOld] = useState([
    {
      id: 1,
      name: "Lançamento Produto X",
      status: "active",
      objective: "Conversões",
      platform: "Meta Ads",
      budget: "R$ 500/dia",
      spent: "R$ 2.450",
      leads: 89,
      cpl: "R$ 27,53",
      ctr: "2.8%",
      createdAt: "2024-01-15"
    },
    {
      id: 2,
      name: "Black Friday 2024",
      status: "optimizing",
      objective: "Tráfego",
      platform: "Google Ads",
      budget: "R$ 800/dia",
      spent: "R$ 5.680",
      leads: 156,
      cpl: "R$ 36,41",
      ctr: "3.2%",
      createdAt: "2024-01-10"
    },
    {
      id: 3,
      name: "Captação B2B Tech",
      status: "paused",
      objective: "Leads",
      platform: "LinkedIn Ads",
      budget: "R$ 300/dia",
      spent: "R$ 1.230",
      leads: 34,
      cpl: "R$ 36,18",
      ctr: "1.9%",
      createdAt: "2024-01-08"
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-growth/10 text-growth';
      case 'optimizing':
        return 'bg-warning/10 text-warning';
      case 'paused':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Ativa';
      case 'optimizing':
        return 'Otimizando';
      case 'paused':
        return 'Pausada';
      default:
        return 'Desconhecido';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Campanhas</h1>
          <p className="text-muted-foreground">Gerencie suas campanhas automatizadas por IA</p>
        </div>
          <Button className="gap-2" asChild>
            <a href="/campaigns/new">
              <Plus className="w-4 h-4" />
              Nova Campanha
            </a>
          </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-2xl font-bold text-foreground">3</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Play className="w-5 h-5 text-growth" />
            <div>
              <p className="text-sm text-muted-foreground">Ativas</p>
              <p className="text-2xl font-bold text-growth">1</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-warning" />
            <div>
              <p className="text-sm text-muted-foreground">Otimizando</p>
              <p className="text-2xl font-bold text-warning">1</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Pause className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Pausadas</p>
              <p className="text-2xl font-bold text-muted-foreground">1</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Campaigns List */}
      <Card className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Campanha</th>
                <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Plataforma</th>
                <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Orçamento</th>
                <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Gasto</th>
                <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Leads</th>
                <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">CPL</th>
                <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">CTR</th>
                <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Ações</th>
              </tr>
            </thead>
            <tbody>
              {(campaigns.length > 0 ? campaigns : campaignsOld).map((campaign) => (
                <tr key={campaign.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                  <td className="py-4 px-2">
                    <div>
                      <p className="font-medium text-foreground">{campaign.name}</p>
                      <p className="text-xs text-muted-foreground">{campaign.objective}</p>
                    </div>
                  </td>
                  <td className="py-4 px-2">
                    <Badge className={getStatusColor(campaign.status)}>
                      {getStatusText(campaign.status)}
                    </Badge>
                  </td>
                  <td className="py-4 px-2 text-sm text-foreground">{campaign.platform}</td>
                  <td className="py-4 px-2 text-sm text-foreground">{campaign.budget}</td>
                  <td className="py-4 px-2 text-sm font-medium text-foreground">{campaign.spent}</td>
                  <td className="py-4 px-2 text-sm font-medium text-foreground">{campaign.leads}</td>
                  <td className="py-4 px-2 text-sm font-medium text-foreground">{campaign.cpl}</td>
                  <td className="py-4 px-2 text-sm text-foreground">{campaign.ctr}</td>
                  <td className="py-4 px-2">
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Settings className="w-4 h-4" />
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
    </div>
  );
};