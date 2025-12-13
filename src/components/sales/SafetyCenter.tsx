import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { 
  Shield, 
  AlertTriangle, 
  Plus,
  Ban,
  RefreshCw,
  Hand,
  Eye,
  Loader2,
  Trash2
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface SafetyRule {
  id: string;
  name: string;
  rule_type: string;
  condition: any;
  action: string;
  is_active: boolean;
  violations_count: number;
  created_at: string;
}

interface Violation {
  id: string;
  rule_id: string;
  original_message: string;
  violation_reason: string;
  action_taken: string;
  created_at: string;
}

const RULE_TYPES = [
  { value: 'price_limit', label: 'Limite de Preço/Desconto' },
  { value: 'content_filter', label: 'Filtro de Conteúdo' },
  { value: 'approval_required', label: 'Aprovação Necessária' },
  { value: 'forbidden_topic', label: 'Tópico Proibido' }
];

const ACTIONS = [
  { value: 'block', label: 'Bloquear', icon: Ban, color: 'text-red-500' },
  { value: 'regenerate', label: 'Regenerar', icon: RefreshCw, color: 'text-amber-500' },
  { value: 'escalate', label: 'Escalar', icon: Hand, color: 'text-blue-500' },
  { value: 'warn', label: 'Alertar', icon: Eye, color: 'text-muted-foreground' }
];

const SafetyCenter = () => {
  const { user } = useAuth();
  const [rules, setRules] = useState<SafetyRule[]>([]);
  const [violations, setViolations] = useState<Violation[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newRule, setNewRule] = useState({
    name: '',
    rule_type: 'forbidden_topic',
    condition: { keywords: [] as string[] },
    action: 'regenerate'
  });
  const [keywordsInput, setKeywordsInput] = useState('');

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load rules
      const { data: rulesData } = await supabase
        .from('safety_rules')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      setRules(rulesData || []);

      // Load violations
      if (rulesData && rulesData.length > 0) {
        const ruleIds = rulesData.map(r => r.id);
        const { data: violationsData } = await supabase
          .from('safety_violations')
          .select('*')
          .in('rule_id', ruleIds)
          .order('created_at', { ascending: false })
          .limit(20);

        setViolations(violationsData || []);
      }
    } catch (error) {
      console.error('Error loading safety data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleRule = async (ruleId: string, isActive: boolean) => {
    try {
      await supabase
        .from('safety_rules')
        .update({ is_active: isActive })
        .eq('id', ruleId);

      setRules(prev => prev.map(r => 
        r.id === ruleId ? { ...r, is_active: isActive } : r
      ));

      toast.success(isActive ? 'Regra ativada' : 'Regra desativada');
    } catch (error) {
      console.error('Error toggling rule:', error);
      toast.error('Erro ao atualizar regra');
    }
  };

  const createRule = async () => {
    if (!newRule.name.trim()) {
      toast.error('Nome da regra é obrigatório');
      return;
    }

    try {
      const condition = newRule.rule_type === 'forbidden_topic'
        ? { keywords: keywordsInput.split(',').map(k => k.trim()).filter(Boolean) }
        : newRule.condition;

      const { error } = await supabase
        .from('safety_rules')
        .insert({
          user_id: user?.id,
          name: newRule.name,
          rule_type: newRule.rule_type,
          condition,
          action: newRule.action
        });

      if (error) throw error;

      toast.success('Regra criada com sucesso');
      setIsDialogOpen(false);
      setNewRule({ name: '', rule_type: 'forbidden_topic', condition: { keywords: [] }, action: 'regenerate' });
      setKeywordsInput('');
      loadData();
    } catch (error) {
      console.error('Error creating rule:', error);
      toast.error('Erro ao criar regra');
    }
  };

  const deleteRule = async (ruleId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta regra?')) return;

    try {
      await supabase
        .from('safety_rules')
        .delete()
        .eq('id', ruleId);

      setRules(prev => prev.filter(r => r.id !== ruleId));
      toast.success('Regra excluída');
    } catch (error) {
      console.error('Error deleting rule:', error);
      toast.error('Erro ao excluir regra');
    }
  };

  const totalViolations = rules.reduce((acc, r) => acc + r.violations_count, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Shield className="h-6 w-6 text-green-500" />
            Central de Segurança
          </h2>
          <p className="text-muted-foreground">
            Guardrails e proteções contra alucinações
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Nova Regra
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Regra de Segurança</DialogTitle>
              <DialogDescription>
                Defina restrições para proteger suas conversas
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Nome da Regra</Label>
                <Input
                  placeholder="Ex: Proibir menção a concorrentes"
                  value={newRule.name}
                  onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select 
                  value={newRule.rule_type} 
                  onValueChange={(v) => setNewRule({ ...newRule, rule_type: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {RULE_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {newRule.rule_type === 'forbidden_topic' && (
                <div className="space-y-2">
                  <Label>Palavras-chave (separadas por vírgula)</Label>
                  <Input
                    placeholder="concorrente, competidor, rival"
                    value={keywordsInput}
                    onChange={(e) => setKeywordsInput(e.target.value)}
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label>Ação</Label>
                <Select 
                  value={newRule.action} 
                  onValueChange={(v) => setNewRule({ ...newRule, action: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ACTIONS.map((action) => (
                      <SelectItem key={action.value} value={action.value}>
                        <div className="flex items-center gap-2">
                          <action.icon className={`h-4 w-4 ${action.color}`} />
                          {action.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={createRule} className="w-full">
                Criar Regra
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-border/50 bg-card/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Regras Ativas</p>
                <p className="text-2xl font-bold text-foreground">
                  {rules.filter(r => r.is_active).length}
                </p>
              </div>
              <Shield className="h-8 w-8 text-green-500/50" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Violações Detectadas</p>
                <p className="text-2xl font-bold text-amber-500">{totalViolations}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-amber-500/50" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Bloqueios</p>
                <p className="text-2xl font-bold text-red-500">
                  {rules.filter(r => r.action === 'block').reduce((acc, r) => acc + r.violations_count, 0)}
                </p>
              </div>
              <Ban className="h-8 w-8 text-red-500/50" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Escalações</p>
                <p className="text-2xl font-bold text-blue-500">
                  {rules.filter(r => r.action === 'escalate').reduce((acc, r) => acc + r.violations_count, 0)}
                </p>
              </div>
              <Hand className="h-8 w-8 text-blue-500/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rules List */}
        <Card className="border-border/50 bg-card/50 backdrop-blur">
          <CardHeader>
            <CardTitle>Regras Configuradas</CardTitle>
            <CardDescription>Proteções ativas contra erros da IA</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : rules.length > 0 ? (
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {rules.map((rule) => {
                    const actionInfo = ACTIONS.find(a => a.value === rule.action);
                    const ActionIcon = actionInfo?.icon || Eye;
                    
                    return (
                      <div 
                        key={rule.id}
                        className="p-4 rounded-xl border border-border/50 bg-background/50"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-medium text-foreground">{rule.name}</h4>
                              <Badge variant="outline">
                                {RULE_TYPES.find(t => t.value === rule.rule_type)?.label}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm">
                              <div className={`flex items-center gap-1 ${actionInfo?.color}`}>
                                <ActionIcon className="h-3 w-3" />
                                {actionInfo?.label}
                              </div>
                              <span className="text-muted-foreground">
                                {rule.violations_count} violações
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={rule.is_active}
                              onCheckedChange={(checked) => toggleRule(rule.id, checked)}
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive"
                              onClick={() => deleteRule(rule.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            ) : (
              <div className="text-center py-8">
                <Shield className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">Nenhuma regra configurada</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Violations */}
        <Card className="border-border/50 bg-card/50 backdrop-blur">
          <CardHeader>
            <CardTitle>Violações Recentes</CardTitle>
            <CardDescription>Tentativas bloqueadas ou regeneradas</CardDescription>
          </CardHeader>
          <CardContent>
            {violations.length > 0 ? (
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {violations.map((violation) => (
                    <div 
                      key={violation.id}
                      className="p-4 rounded-xl border border-red-500/20 bg-red-500/5"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline" className="text-red-500 border-red-500/30">
                          {violation.action_taken}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(violation.created_at), { addSuffix: true, locale: ptBR })}
                        </span>
                      </div>
                      <p className="text-sm text-foreground mb-2">
                        {violation.violation_reason}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        "{violation.original_message}"
                      </p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="text-center py-8">
                <AlertTriangle className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">Nenhuma violação registrada</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SafetyCenter;
