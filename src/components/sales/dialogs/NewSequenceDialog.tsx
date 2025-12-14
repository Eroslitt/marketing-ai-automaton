import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { 
  GitBranch, 
  Plus, 
  Loader2, 
  Mail, 
  MessageSquare, 
  Phone,
  Clock,
  Trash2,
  ArrowDown
} from "lucide-react";

interface SequenceStep {
  id: string;
  type: 'email' | 'whatsapp' | 'call';
  delay: number;
  delayUnit: 'hours' | 'days';
  content: string;
}

interface NewSequenceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const NewSequenceDialog = ({ open, onOpenChange }: NewSequenceDialogProps) => {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [sequenceName, setSequenceName] = useState("");
  const [steps, setSteps] = useState<SequenceStep[]>([
    { id: '1', type: 'whatsapp', delay: 0, delayUnit: 'hours', content: 'Olá {nome}! Vi que você se interessou pelo nosso produto. Posso te ajudar?' },
    { id: '2', type: 'whatsapp', delay: 24, delayUnit: 'hours', content: 'Oi {nome}, tudo bem? Passando para saber se conseguiu analisar nossa proposta.' },
    { id: '3', type: 'email', delay: 3, delayUnit: 'days', content: 'Assunto: Última chance - Oferta especial para você\n\nOlá {nome},\n\nNotamos que você ainda não finalizou sua compra...' }
  ]);

  const getStepIcon = (type: string) => {
    switch (type) {
      case 'email': return <Mail className="h-4 w-4" />;
      case 'whatsapp': return <MessageSquare className="h-4 w-4" />;
      case 'call': return <Phone className="h-4 w-4" />;
      default: return null;
    }
  };

  const getStepColor = (type: string) => {
    switch (type) {
      case 'email': return 'bg-blue-500/10 text-blue-500 border-blue-500/30';
      case 'whatsapp': return 'bg-green-500/10 text-green-500 border-green-500/30';
      case 'call': return 'bg-purple-500/10 text-purple-500 border-purple-500/30';
      default: return '';
    }
  };

  const addStep = () => {
    setSteps([
      ...steps,
      {
        id: Date.now().toString(),
        type: 'whatsapp',
        delay: 24,
        delayUnit: 'hours',
        content: ''
      }
    ]);
  };

  const updateStep = (id: string, updates: Partial<SequenceStep>) => {
    setSteps(steps.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const deleteStep = (id: string) => {
    if (steps.length <= 1) {
      toast.error("A sequência precisa de pelo menos 1 etapa");
      return;
    }
    setSteps(steps.filter(s => s.id !== id));
  };

  const handleSave = async () => {
    if (!sequenceName.trim()) {
      toast.error("Nome da sequência é obrigatório");
      return;
    }

    if (steps.some(s => !s.content.trim())) {
      toast.error("Todas as etapas precisam ter conteúdo");
      return;
    }

    setSaving(true);
    try {
      const configData = {
        name: sequenceName,
        steps: steps.map(s => ({ ...s })),
        createdAt: new Date().toISOString()
      } as unknown as Record<string, unknown>;
      
      await supabase
        .from('integrations')
        .insert([{
          user_id: user?.id!,
          provider: 'sequence_' + Date.now(),
          config: configData
          is_connected: true
        }]);

      toast.success(`Sequência "${sequenceName}" criada com sucesso!`);
      onOpenChange(false);
      setSequenceName("");
      setSteps([
        { id: '1', type: 'whatsapp', delay: 0, delayUnit: 'hours', content: '' }
      ]);
    } catch (error) {
      console.error('Error saving sequence:', error);
      toast.error("Erro ao salvar sequência");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5 text-primary" />
            Nova Sequência de Follow-up
          </DialogTitle>
          <DialogDescription>
            Crie uma sequência automática de contatos para leads
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label>Nome da Sequência</Label>
            <Input
              placeholder="Ex: Sequência de Recuperação de Leads"
              value={sequenceName}
              onChange={(e) => setSequenceName(e.target.value)}
            />
          </div>

          <div className="space-y-4">
            <Label>Etapas da Sequência</Label>
            
            {steps.map((step, index) => (
              <div key={step.id} className="relative">
                {index > 0 && (
                  <div className="flex items-center justify-center py-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <ArrowDown className="h-4 w-4" />
                      <Clock className="h-3 w-3" />
                      <span>Aguardar {step.delay} {step.delayUnit === 'hours' ? 'horas' : 'dias'}</span>
                    </div>
                  </div>
                )}
                
                <div className="p-4 rounded-xl border border-border/50 bg-background/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={`gap-1 ${getStepColor(step.type)}`}>
                        {getStepIcon(step.type)}
                        Etapa {index + 1}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => deleteStep(step.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-2">
                      <Label className="text-xs">Canal</Label>
                      <Select 
                        value={step.type} 
                        onValueChange={(v) => updateStep(step.id, { type: v as any })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="whatsapp">WhatsApp</SelectItem>
                          <SelectItem value="email">Email</SelectItem>
                          <SelectItem value="call">Ligação</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {index > 0 && (
                      <>
                        <div className="space-y-2">
                          <Label className="text-xs">Delay</Label>
                          <Input
                            type="number"
                            value={step.delay}
                            onChange={(e) => updateStep(step.id, { delay: parseInt(e.target.value) || 0 })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs">Unidade</Label>
                          <Select 
                            value={step.delayUnit} 
                            onValueChange={(v) => updateStep(step.id, { delayUnit: v as any })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="hours">Horas</SelectItem>
                              <SelectItem value="days">Dias</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">Conteúdo (use {'{nome}'} para personalizar)</Label>
                    <Textarea
                      placeholder="Escreva a mensagem desta etapa..."
                      value={step.content}
                      onChange={(e) => updateStep(step.id, { content: e.target.value })}
                      className="min-h-[80px]"
                    />
                  </div>
                </div>
              </div>
            ))}

            <Button variant="outline" onClick={addStep} className="w-full gap-2">
              <Plus className="h-4 w-4" />
              Adicionar Etapa
            </Button>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <GitBranch className="h-4 w-4" />
            )}
            Criar Sequência
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NewSequenceDialog;
