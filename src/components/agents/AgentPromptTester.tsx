import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { 
  Bot, Play, Copy, Sparkles, CheckCircle, Loader2
} from "lucide-react";
import { AGENT_PROMPTS, personalizePrompt, REQUIRED_VARIABLES } from "@/data/agentPrompts";
import { useToast } from "@/hooks/use-toast";

export const AgentPromptTester = () => {
  const { toast } = useToast();
  const [selectedAgent, setSelectedAgent] = useState<keyof typeof AGENT_PROMPTS>('strategy');
  const [variables, setVariables] = useState<Record<string, string>>({});
  const [result, setResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const currentAgent = AGENT_PROMPTS[selectedAgent];
  const requiredVars = REQUIRED_VARIABLES[selectedAgent] || [];

  const handleVariableChange = (key: string, value: string) => {
    setVariables(prev => ({ ...prev, [key]: value }));
  };

  const validateInputs = () => {
    return requiredVars.filter(varName => !variables[varName]?.trim());
  };

  const testPrompt = async () => {
    const missing = validateInputs();
    if (missing.length > 0) {
      toast({ title: "Campos obrigatórios", description: `Preencha: ${missing.join(', ')}`, variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const { systemPrompt, userPrompt } = personalizePrompt(selectedAgent, variables);

      const { data, error } = await supabase.functions.invoke('test-agent-prompt', {
        body: { systemPrompt, userPrompt, agentType: selectedAgent }
      });

      if (error) throw error;

      setResult(data.response || 'Sem resposta.');
    } catch (error: any) {
      console.error('Error testing prompt:', error);
      toast({ title: "Erro", description: error.message || "Erro ao testar prompt", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const copyPrompt = () => {
    const { systemPrompt, userPrompt } = personalizePrompt(selectedAgent, variables);
    navigator.clipboard.writeText(`SYSTEM:\n${systemPrompt}\n\nUSER:\n${userPrompt}`);
    toast({ title: "Prompt copiado!", description: "Copiado para área de transferência" });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Testador de Prompts IA</h1>
        <p className="text-muted-foreground">Teste e refine os prompts dos agentes com IA real</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Bot className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">Selecionar Agente</h3>
            </div>
            <Select value={selectedAgent} onValueChange={(value) => {
              setSelectedAgent(value as keyof typeof AGENT_PROMPTS);
              setVariables({});
              setResult('');
            }}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(AGENT_PROMPTS).map(([key, agent]) => (
                  <SelectItem key={key} value={key}>
                    <div>
                      <p className="font-medium">{agent.name}</p>
                      <p className="text-xs text-muted-foreground">{agent.description}</p>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="mt-4 p-3 bg-muted/30 rounded-lg">
              <p className="text-sm text-muted-foreground">{currentAgent.description}</p>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">Variáveis do Prompt</h3>
            </div>
            <div className="space-y-4">
              {requiredVars.map(varName => (
                <div key={varName}>
                  <Label htmlFor={varName} className="flex items-center gap-2">
                    {varName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    <Badge variant="outline" className="text-xs">obrigatório</Badge>
                  </Label>
                  <Input
                    id={varName}
                    value={variables[varName] || ''}
                    onChange={(e) => handleVariableChange(varName, e.target.value)}
                    placeholder={`Digite ${varName.replace(/_/g, ' ')}`}
                    className="mt-1"
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-6">
              <Button onClick={testPrompt} disabled={isLoading} className="flex-1">
                {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Play className="w-4 h-4 mr-2" />}
                Testar Prompt
              </Button>
              <Button variant="outline" onClick={copyPrompt} disabled={validateInputs().length > 0}>
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <h3 className="text-lg font-semibold">Preview do Prompt</h3>
            </div>
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">SYSTEM PROMPT:</Label>
                <div className="mt-1 p-3 bg-muted/30 rounded-lg text-xs font-mono overflow-auto max-h-32">
                  {currentAgent.systemPrompt}
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">USER PROMPT:</Label>
                <div className="mt-1 p-3 bg-muted/30 rounded-lg text-xs font-mono overflow-auto max-h-32">
                  {personalizePrompt(selectedAgent, variables).userPrompt}
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Bot className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">Resposta do Agente</h3>
            </div>
            {result ? (
              <Textarea value={result} readOnly className="min-h-[300px] font-mono text-sm" />
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                {isLoading ? (
                  <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                    <p>Gerando resposta com IA...</p>
                  </div>
                ) : (
                  <p>Configure as variáveis e clique em "Testar Prompt"</p>
                )}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
