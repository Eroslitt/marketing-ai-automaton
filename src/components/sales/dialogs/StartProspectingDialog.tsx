import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { 
  Target, 
  Loader2, 
  Play,
  Users,
  Mail,
  MessageSquare,
  CheckCircle
} from "lucide-react";

interface StartProspectingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const StartProspectingDialog = ({ open, onOpenChange }: StartProspectingDialogProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [prospecting, setProspecting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [leadsToContact, setLeadsToContact] = useState(0);
  
  const [config, setConfig] = useState({
    channel: "whatsapp",
    leadStatus: "new",
    maxLeads: 10,
    delayBetween: 30,
    product: ""
  });

  const [products, setProducts] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    if (open && user) {
      loadProducts();
      countLeads();
    }
  }, [open, user, config.leadStatus]);

  const loadProducts = async () => {
    const { data } = await supabase
      .from('products')
      .select('id, name')
      .eq('user_id', user?.id);
    if (data) setProducts(data);
  };

  const countLeads = async () => {
    const { count } = await supabase
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user?.id)
      .eq('status', config.leadStatus);
    setLeadsToContact(count || 0);
  };

  const startProspecting = async () => {
    if (leadsToContact === 0) {
      toast.error("Não há leads para prospectar");
      return;
    }

    if (!config.product) {
      toast.error("Selecione um produto");
      return;
    }

    setProspecting(true);
    setProgress(0);

    try {
      // Get leads to contact
      const { data: leads } = await supabase
        .from('leads')
        .select('*')
        .eq('user_id', user?.id)
        .eq('status', config.leadStatus)
        .limit(config.maxLeads);

      if (!leads || leads.length === 0) {
        toast.error("Nenhum lead encontrado");
        return;
      }

      let contacted = 0;

      for (const lead of leads) {
        // Simulate delay between contacts
        await new Promise(resolve => setTimeout(resolve, config.delayBetween * 100));

        // Create conversation
        const { data: conversation, error: convError } = await supabase
          .from('conversations')
          .insert({
            lead_id: lead.id,
            product_id: config.product,
            channel: config.channel,
            status: 'active'
          })
          .select()
          .single();

        if (convError) {
          console.error('Error creating conversation:', convError);
          continue;
        }

        // Update lead status
        await supabase
          .from('leads')
          .update({ 
            status: 'contacted',
            last_contact_at: new Date().toISOString(),
            assigned_agent: 'sdr'
          })
          .eq('id', lead.id);

        // Create initial message
        await supabase
          .from('messages')
          .insert({
            conversation_id: conversation.id,
            role: 'assistant',
            agent_type: 'sdr',
            content: `Olá ${lead.name}! Tudo bem? Vi que você pode ter interesse no nosso produto. Posso te ajudar com alguma dúvida?`
          });

        contacted++;
        setProgress((contacted / leads.length) * 100);
      }

      // Update metrics
      const today = new Date().toISOString().split('T')[0];
      const { data: existingMetrics } = await supabase
        .from('sales_metrics')
        .select('*')
        .eq('user_id', user?.id)
        .eq('date', today)
        .single();

      if (existingMetrics) {
        await supabase
          .from('sales_metrics')
          .update({
            leads_contacted: (existingMetrics.leads_contacted || 0) + contacted
          })
          .eq('id', existingMetrics.id);
      } else {
        await supabase
          .from('sales_metrics')
          .insert({
            user_id: user?.id,
            date: today,
            leads_contacted: contacted
          });
      }

      toast.success(`${contacted} leads contactados com sucesso!`);
      onOpenChange(false);
    } catch (error) {
      console.error('Error prospecting:', error);
      toast.error("Erro ao iniciar prospecção");
    } finally {
      setProspecting(false);
      setProgress(0);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Iniciar Prospecção
          </DialogTitle>
          <DialogDescription>
            Configure e inicie uma campanha de prospecção automática
          </DialogDescription>
        </DialogHeader>

        {prospecting ? (
          <div className="py-8 space-y-6">
            <div className="text-center">
              <div className="relative w-24 h-24 mx-auto mb-4">
                <div className="absolute inset-0 rounded-full border-4 border-muted" />
                <div 
                  className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Users className="h-8 w-8 text-primary" />
                </div>
              </div>
              <h3 className="text-lg font-medium text-foreground">Prospectando...</h3>
              <p className="text-sm text-muted-foreground">
                Entrando em contato com os leads
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progresso</span>
                <span className="text-foreground font-medium">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-3" />
            </div>
          </div>
        ) : (
          <div className="space-y-4 mt-4">
            {/* Stats */}
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  <span className="font-medium text-foreground">Leads Disponíveis</span>
                </div>
                <Badge variant="outline" className="text-primary border-primary/30">
                  {leadsToContact}
                </Badge>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Canal de Contato</Label>
              <Select 
                value={config.channel} 
                onValueChange={(v) => setConfig({ ...config, channel: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="whatsapp">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-green-500" />
                      WhatsApp
                    </div>
                  </SelectItem>
                  <SelectItem value="email">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-blue-500" />
                      Email
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Status dos Leads</Label>
              <Select 
                value={config.leadStatus} 
                onValueChange={(v) => setConfig({ ...config, leadStatus: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">Novos</SelectItem>
                  <SelectItem value="cold">Frios (sem contato recente)</SelectItem>
                  <SelectItem value="warm">Mornos (interesse demonstrado)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Produto para Oferecer</Label>
              <Select 
                value={config.product} 
                onValueChange={(v) => setConfig({ ...config, product: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um produto" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Máximo de Leads: {config.maxLeads}</Label>
              <Slider
                value={[config.maxLeads]}
                onValueChange={([v]) => setConfig({ ...config, maxLeads: v })}
                min={1}
                max={Math.min(50, leadsToContact || 50)}
                step={1}
              />
            </div>

            <div className="space-y-2">
              <Label>Delay entre mensagens: {config.delayBetween}s</Label>
              <Slider
                value={[config.delayBetween]}
                onValueChange={([v]) => setConfig({ ...config, delayBetween: v })}
                min={10}
                max={120}
                step={10}
              />
              <p className="text-xs text-muted-foreground">
                Tempo de espera entre cada contato para evitar bloqueios
              </p>
            </div>
          </div>
        )}

        {!prospecting && (
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={startProspecting} 
              disabled={leadsToContact === 0 || !config.product}
              className="gap-2"
            >
              <Play className="h-4 w-4" />
              Iniciar Prospecção
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default StartProspectingDialog;
