import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { 
  Zap, 
  Plus, 
  Save, 
  Loader2, 
  Trash2,
  MessageSquare 
} from "lucide-react";

interface AutoResponseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface AutoResponse {
  id: string;
  trigger: string;
  response: string;
  isActive: boolean;
}

const AutoResponseDialog = ({ open, onOpenChange }: AutoResponseDialogProps) => {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [responses, setResponses] = useState<AutoResponse[]>([
    { id: '1', trigger: 'preço', response: 'Nosso produto custa a partir de R$ 997. Quer conhecer os detalhes?', isActive: true },
    { id: '2', trigger: 'desconto', response: 'Temos condições especiais para pagamento à vista! Posso te enviar uma proposta?', isActive: true },
    { id: '3', trigger: 'prazo', response: 'O prazo de entrega é de 3 a 5 dias úteis após a confirmação do pagamento.', isActive: true }
  ]);
  const [newTrigger, setNewTrigger] = useState("");
  const [newResponse, setNewResponse] = useState("");

  const addResponse = () => {
    if (!newTrigger.trim() || !newResponse.trim()) {
      toast.error("Preencha o gatilho e a resposta");
      return;
    }

    setResponses([
      ...responses,
      {
        id: Date.now().toString(),
        trigger: newTrigger.toLowerCase(),
        response: newResponse,
        isActive: true
      }
    ]);
    setNewTrigger("");
    setNewResponse("");
    toast.success("Auto-resposta adicionada!");
  };

  const toggleResponse = (id: string) => {
    setResponses(responses.map(r => 
      r.id === id ? { ...r, isActive: !r.isActive } : r
    ));
  };

  const deleteResponse = (id: string) => {
    setResponses(responses.filter(r => r.id !== id));
    toast.success("Auto-resposta removida");
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Check if integration exists
      const { data: existing } = await supabase
        .from('integrations')
        .select('id')
        .eq('user_id', user?.id)
        .eq('provider', 'auto_responses')
        .single();

      const configData = { responses: responses.map(r => ({ id: r.id, trigger: r.trigger, response: r.response, isActive: r.isActive })) };

      if (existing) {
        await supabase
          .from('integrations')
          .update({ config: configData as any })
          .eq('id', existing.id);
      } else {
        await supabase
          .from('integrations')
          .insert([{
            user_id: user?.id!,
            provider: 'auto_responses',
            config: configData as any,
            is_connected: true
          }]);
      }

      toast.success("Auto-respostas salvas com sucesso!");
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving auto responses:', error);
      toast.error("Erro ao salvar auto-respostas");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-amber-500" />
            Auto-Respostas
          </DialogTitle>
          <DialogDescription>
            Configure respostas automáticas baseadas em palavras-chave
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Add New Response */}
          <div className="p-4 rounded-lg border border-dashed border-border bg-muted/30">
            <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Nova Auto-Resposta
            </h4>
            <div className="grid grid-cols-1 gap-3">
              <div className="space-y-2">
                <Label>Gatilho (palavra-chave)</Label>
                <Input
                  placeholder="Ex: preço, desconto, prazo..."
                  value={newTrigger}
                  onChange={(e) => setNewTrigger(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Resposta Automática</Label>
                <Textarea
                  placeholder="Mensagem que será enviada quando o gatilho for detectado..."
                  value={newResponse}
                  onChange={(e) => setNewResponse(e.target.value)}
                  className="min-h-[80px]"
                />
              </div>
              <Button onClick={addResponse} className="gap-2">
                <Plus className="h-4 w-4" />
                Adicionar
              </Button>
            </div>
          </div>

          {/* Existing Responses */}
          <ScrollArea className="h-[300px]">
            <div className="space-y-3">
              {responses.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">Nenhuma auto-resposta configurada</p>
                </div>
              ) : (
                responses.map((response) => (
                  <div
                    key={response.id}
                    className={`p-4 rounded-xl border ${
                      response.isActive 
                        ? 'border-primary/30 bg-primary/5' 
                        : 'border-border/50 bg-muted/30 opacity-60'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant={response.isActive ? "default" : "outline"}>
                          {response.trigger}
                        </Badge>
                        {response.isActive && (
                          <span className="text-xs text-green-500">Ativo</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={response.isActive}
                          onCheckedChange={() => toggleResponse(response.id)}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => deleteResponse(response.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {response.response}
                    </p>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>

        <div className="flex justify-between items-center mt-6 pt-4 border-t border-border/50">
          <p className="text-sm text-muted-foreground">
            {responses.filter(r => r.isActive).length} de {responses.length} ativas
          </p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving} className="gap-2">
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Salvar Tudo
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AutoResponseDialog;
