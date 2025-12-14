import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Bot, Save, Loader2, MessageSquare, Clock, Shield } from "lucide-react";

interface BotConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const BotConfigDialog = ({ open, onOpenChange }: BotConfigDialogProps) => {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState({
    enabled: true,
    workingHoursOnly: false,
    startHour: "09:00",
    endHour: "18:00",
    timezone: "America/Sao_Paulo",
    defaultProduct: "",
    autoAssignAgent: true,
    maxConcurrentChats: 10,
    responseTimeout: 30,
    welcomeMessage: "Olá! 👋 Sou o assistente virtual da empresa. Como posso ajudar você hoje?",
    awayMessage: "Estamos fora do horário de atendimento. Deixe sua mensagem e retornaremos em breve!",
    transferMessage: "Vou transferir você para um especialista humano. Um momento, por favor."
  });

  const [products, setProducts] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    if (open && user) {
      loadProducts();
    }
  }, [open, user]);

  const loadProducts = async () => {
    const { data } = await supabase
      .from('products')
      .select('id, name')
      .eq('user_id', user?.id);
    if (data) setProducts(data);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Check if integration exists
      const { data: existing } = await supabase
        .from('integrations')
        .select('id')
        .eq('user_id', user?.id)
        .eq('provider', 'bot_config')
        .single();

      if (existing) {
        await supabase
          .from('integrations')
          .update({ config })
          .eq('id', existing.id);
      } else {
        await supabase
          .from('integrations')
          .insert({
            user_id: user?.id,
            provider: 'bot_config',
            config,
            is_connected: true
          });
      }

      toast.success("Configurações do bot salvas com sucesso!");
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving bot config:', error);
      toast.error("Erro ao salvar configurações");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Configurar Bot de Vendas
          </DialogTitle>
          <DialogDescription>
            Configure o comportamento global dos agentes de vendas
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="general" className="mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general">Geral</TabsTrigger>
            <TabsTrigger value="schedule">Horários</TabsTrigger>
            <TabsTrigger value="messages">Mensagens</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4 mt-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
              <div>
                <Label className="text-base">Bot Ativo</Label>
                <p className="text-sm text-muted-foreground">
                  Habilitar respostas automáticas dos agentes
                </p>
              </div>
              <Switch
                checked={config.enabled}
                onCheckedChange={(v) => setConfig({ ...config, enabled: v })}
              />
            </div>

            <div className="space-y-2">
              <Label>Produto Padrão</Label>
              <Select 
                value={config.defaultProduct} 
                onValueChange={(v) => setConfig({ ...config, defaultProduct: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um produto" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum</SelectItem>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Produto usado quando não especificado na conversa
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Chats Simultâneos Máx.</Label>
                <Input
                  type="number"
                  value={config.maxConcurrentChats}
                  onChange={(e) => setConfig({ ...config, maxConcurrentChats: parseInt(e.target.value) || 10 })}
                />
              </div>
              <div className="space-y-2">
                <Label>Timeout de Resposta (seg)</Label>
                <Input
                  type="number"
                  value={config.responseTimeout}
                  onChange={(e) => setConfig({ ...config, responseTimeout: parseInt(e.target.value) || 30 })}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Atribuir Agente Automaticamente</Label>
                <p className="text-xs text-muted-foreground">
                  Escolher melhor agente baseado no contexto
                </p>
              </div>
              <Switch
                checked={config.autoAssignAgent}
                onCheckedChange={(v) => setConfig({ ...config, autoAssignAgent: v })}
              />
            </div>
          </TabsContent>

          <TabsContent value="schedule" className="space-y-4 mt-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <div>
                  <Label className="text-base">Apenas Horário Comercial</Label>
                  <p className="text-sm text-muted-foreground">
                    Responder apenas dentro do horário definido
                  </p>
                </div>
              </div>
              <Switch
                checked={config.workingHoursOnly}
                onCheckedChange={(v) => setConfig({ ...config, workingHoursOnly: v })}
              />
            </div>

            {config.workingHoursOnly && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Início</Label>
                    <Input
                      type="time"
                      value={config.startHour}
                      onChange={(e) => setConfig({ ...config, startHour: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Fim</Label>
                    <Input
                      type="time"
                      value={config.endHour}
                      onChange={(e) => setConfig({ ...config, endHour: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Fuso Horário</Label>
                  <Select 
                    value={config.timezone} 
                    onValueChange={(v) => setConfig({ ...config, timezone: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/Sao_Paulo">São Paulo (GMT-3)</SelectItem>
                      <SelectItem value="America/Manaus">Manaus (GMT-4)</SelectItem>
                      <SelectItem value="America/Recife">Recife (GMT-3)</SelectItem>
                      <SelectItem value="America/Fortaleza">Fortaleza (GMT-3)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="messages" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Mensagem de Boas-vindas
              </Label>
              <Textarea
                value={config.welcomeMessage}
                onChange={(e) => setConfig({ ...config, welcomeMessage: e.target.value })}
                className="min-h-[80px]"
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Mensagem Fora do Horário
              </Label>
              <Textarea
                value={config.awayMessage}
                onChange={(e) => setConfig({ ...config, awayMessage: e.target.value })}
                className="min-h-[80px]"
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Mensagem de Transferência
              </Label>
              <Textarea
                value={config.transferMessage}
                onChange={(e) => setConfig({ ...config, transferMessage: e.target.value })}
                className="min-h-[80px]"
              />
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Salvar Configurações
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BotConfigDialog;
