import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { 
  Plus, Target, Play, Pause, Settings, TrendingUp, Eye, MoreHorizontal, Trash2, Loader2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export const Campaigns = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null);

  useEffect(() => {
    if (user) loadCampaigns();
  }, [user]);

  const loadCampaigns = async () => {
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setCampaigns(data || []);
    } catch (error: any) {
      toast.error("Erro ao carregar campanhas");
    } finally {
      setLoading(false);
    }
  };

  const toggleCampaignStatus = async (campaign: any) => {
    const newStatus = campaign.status === 'active' ? 'paused' : 'active';
    try {
      const { error } = await supabase
        .from('campaigns')
        .update({ status: newStatus })
        .eq('id', campaign.id);
      if (error) throw error;
      toast.success(`Campanha ${newStatus === 'active' ? 'ativada' : 'pausada'}!`);
      loadCampaigns();
    } catch {
      toast.error("Erro ao atualizar campanha");
    }
  };

  const deleteCampaign = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta campanha?")) return;
    try {
      const { error } = await supabase.from('campaigns').delete().eq('id', id);
      if (error) throw error;
      toast.success("Campanha excluída");
      loadCampaigns();
    } catch {
      toast.error("Erro ao excluir campanha");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-primary/10 text-primary';
      case 'paused': return 'bg-muted text-muted-foreground';
      default: return 'bg-amber-500/10 text-amber-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Ativa';
      case 'paused': return 'Pausada';
      case 'draft': return 'Rascunho';
      default: return status;
    }
  };

  const activeCampaigns = campaigns.filter(c => c.status === 'active').length;
  const pausedCampaigns = campaigns.filter(c => c.status === 'paused').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Campanhas</h1>
          <p className="text-muted-foreground">Gerencie suas campanhas automatizadas por IA</p>
        </div>
        <Button className="gap-2" asChild>
          <Link to="/campaigns/new">
            <Plus className="w-4 h-4" />
            Nova Campanha
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-2xl font-bold text-foreground">{campaigns.length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Play className="w-5 h-5 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Ativas</p>
              <p className="text-2xl font-bold text-primary">{activeCampaigns}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Pause className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Pausadas</p>
              <p className="text-2xl font-bold text-muted-foreground">{pausedCampaigns}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-amber-500" />
            <div>
              <p className="text-sm text-muted-foreground">Total Gasto</p>
              <p className="text-2xl font-bold text-foreground">
                R$ {campaigns.reduce((s, c) => s + (Number(c.budget_spent) || 0), 0).toLocaleString('pt-BR')}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : campaigns.length === 0 ? (
          <div className="text-center py-12">
            <Target className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground mb-2">Nenhuma campanha criada</p>
            <Button asChild>
              <Link to="/campaigns/new">
                <Plus className="w-4 h-4 mr-2" />
                Criar primeira campanha
              </Link>
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Campanha</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Objetivo</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Orçamento</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Gasto</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Ações</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((campaign) => (
                  <tr key={campaign.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                    <td className="py-4 px-2">
                      <p className="font-medium text-foreground">{campaign.name}</p>
                    </td>
                    <td className="py-4 px-2">
                      <Badge className={getStatusColor(campaign.status)}>
                        {getStatusText(campaign.status)}
                      </Badge>
                    </td>
                    <td className="py-4 px-2 text-sm text-foreground">{campaign.objective || '-'}</td>
                    <td className="py-4 px-2 text-sm text-foreground">
                      R$ {Number(campaign.budget_total || 0).toLocaleString('pt-BR')}
                    </td>
                    <td className="py-4 px-2 text-sm font-medium text-foreground">
                      R$ {Number(campaign.budget_spent || 0).toLocaleString('pt-BR')}
                    </td>
                    <td className="py-4 px-2">
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" onClick={() => setSelectedCampaign(campaign)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => toggleCampaignStatus(campaign)}>
                          {campaign.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => deleteCampaign(campaign.id)} className="text-destructive hover:text-destructive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Campaign Detail Dialog */}
      <Dialog open={!!selectedCampaign} onOpenChange={() => setSelectedCampaign(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedCampaign?.name}</DialogTitle>
            <DialogDescription>Detalhes da campanha</DialogDescription>
          </DialogHeader>
          {selectedCampaign && (
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge className={getStatusColor(selectedCampaign.status)}>
                    {getStatusText(selectedCampaign.status)}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Objetivo</p>
                  <p className="text-foreground">{selectedCampaign.objective || 'Não definido'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Orçamento Total</p>
                  <p className="text-foreground font-medium">R$ {Number(selectedCampaign.budget_total || 0).toLocaleString('pt-BR')}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Gasto</p>
                  <p className="text-foreground font-medium">R$ {Number(selectedCampaign.budget_spent || 0).toLocaleString('pt-BR')}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button className="flex-1" onClick={() => { toggleCampaignStatus(selectedCampaign); setSelectedCampaign(null); }}>
                  {selectedCampaign.status === 'active' ? 'Pausar' : 'Ativar'}
                </Button>
                <Button variant="destructive" onClick={() => { deleteCampaign(selectedCampaign.id); setSelectedCampaign(null); }}>
                  Excluir
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
