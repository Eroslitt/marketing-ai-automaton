import { useState, useCallback, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import {
  FileText, Play, Square, Loader2, RefreshCw, Volume2, Package,
  Sparkles, Target, Users, MessageSquare, Copy, Download, Mic,
  BookOpen, Zap, CheckCircle
} from "lucide-react";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number | null;
  knowledge_count: number;
}

const VOICE_OPTIONS = [
  { id: "JBFqnCBsd6RMkjVDRZzb", name: "George (Masculino, Profissional)", lang: "en" },
  { id: "EXAVITQu4vr4xnSDxMaL", name: "Sarah (Feminino, Suave)", lang: "en" },
  { id: "onwK4e9ZLuTAKqWW03F9", name: "Daniel (Masculino, Confiante)", lang: "en" },
  { id: "pFZP5JQG7iQjIQuC4Bku", name: "Lily (Feminino, Amigável)", lang: "en" },
  { id: "TX3LPaxmHKxFdv7VOQHJ", name: "Liam (Masculino, Jovem)", lang: "en" },
  { id: "cgSgspJ2msm6clMCkdW9", name: "Jessica (Feminino, Profissional)", lang: "en" },
];

const TONE_OPTIONS = [
  { id: "professional", name: "Profissional", icon: Target, description: "Confiante e corporativo" },
  { id: "friendly", name: "Amigável", icon: Users, description: "Caloroso e acessível" },
  { id: "urgent", name: "Urgente", icon: Zap, description: "Escassez e FOMO" },
  { id: "consultative", name: "Consultivo", icon: BookOpen, description: "Educativo e empático" },
  { id: "aggressive", name: "Agressivo", icon: Target, description: "Direto e focado em fechar" },
];

const SalesVoiceAgent = () => {
  const { user, session } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string>("all");
  const [tone, setTone] = useState("professional");
  const [targetAudience, setTargetAudience] = useState("");
  const [objective, setObjective] = useState("");
  const [customInstructions, setCustomInstructions] = useState("");
  const [generatedScript, setGeneratedScript] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState(VOICE_OPTIONS[0].id);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (user) loadProducts();
  }, [user]);

  const loadProducts = async () => {
    setLoadingProducts(true);
    try {
      const { data, error } = await supabase.functions.invoke("sales-voice-agent", {
        body: { action: "list_products" },
      });
      if (error) throw error;
      if (data?.products) setProducts(data.products);
    } catch (e) {
      console.error("Error loading products:", e);
    } finally {
      setLoadingProducts(false);
    }
  };

  const generateScript = useCallback(async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("sales-voice-agent", {
        body: {
          action: "generate_script",
          product_id: selectedProduct === "all" ? null : selectedProduct,
          tone,
          language: "Português brasileiro",
          target_audience: targetAudience || undefined,
          objective: objective || undefined,
          custom_instructions: customInstructions || undefined,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setGeneratedScript(data.script);
      toast.success("Script de vendas gerado com sucesso!");
    } catch (e: any) {
      toast.error(e.message || "Erro ao gerar script");
    } finally {
      setIsGenerating(false);
    }
  }, [selectedProduct, tone, targetAudience, objective, customInstructions]);

  const playScript = useCallback(async (textToPlay?: string) => {
    const text = textToPlay || generatedScript;
    if (!text.trim()) {
      toast.error("Nenhum script para reproduzir");
      return;
    }

    // Limit to 5000 chars for TTS
    const trimmedText = text.length > 5000 ? text.slice(0, 5000) : text;

    setIsPlaying(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sales-voice-agent`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            Authorization: `Bearer ${session?.access_token || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            action: "tts_script",
            text: trimmedText,
            voice_id: selectedVoice,
          }),
        }
      );

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || "Erro ao gerar áudio");
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      if (audioRef.current) audioRef.current.pause();

      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      audio.onended = () => setIsPlaying(false);
      audio.onerror = () => {
        setIsPlaying(false);
        toast.error("Erro ao reproduzir áudio");
      };
      await audio.play();
      toast.success("Reproduzindo script de vendas...");
    } catch (e: any) {
      toast.error(e.message || "Erro no TTS");
      setIsPlaying(false);
    }
  }, [generatedScript, selectedVoice, session]);

  const stopPlaying = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  const copyScript = useCallback(() => {
    navigator.clipboard.writeText(generatedScript);
    toast.success("Script copiado para a área de transferência");
  }, [generatedScript]);

  const downloadScript = useCallback(() => {
    const blob = new Blob([generatedScript], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sales-script-${new Date().toISOString().split("T")[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Script baixado");
  }, [generatedScript]);

  const selectedProductData = products.find((p) => p.id === selectedProduct);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            Gerador de Script de Vendas por Voz
          </h2>
          <p className="text-muted-foreground">
            Gere scripts personalizados usando seus produtos como base de conhecimento
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left - Configuration */}
        <div className="space-y-4">
          {/* Product Selection */}
          <Card className="border-border/50 bg-card/50 backdrop-blur">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Package className="h-4 w-4 text-primary" />
                Produto Base
              </CardTitle>
              <CardDescription className="text-xs">
                Selecione o produto para o script de vendas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um produto" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os produtos</SelectItem>
                  {products.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name} {p.knowledge_count > 0 ? `(${p.knowledge_count} docs)` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedProduct !== "all" && selectedProductData && (
                <div className="p-2 rounded-lg bg-muted/30 text-xs space-y-1">
                  <p className="font-medium">{selectedProductData.name}</p>
                  {selectedProductData.description && (
                    <p className="text-muted-foreground line-clamp-2">{selectedProductData.description}</p>
                  )}
                  {selectedProductData.price && (
                    <p className="text-primary font-medium">R$ {selectedProductData.price.toLocaleString("pt-BR")}</p>
                  )}
                  <div className="flex items-center gap-1">
                    <BookOpen className="h-3 w-3" />
                    <span>{selectedProductData.knowledge_count} documentos de conhecimento</span>
                  </div>
                </div>
              )}

              <Button variant="outline" size="sm" onClick={loadProducts} disabled={loadingProducts} className="w-full">
                {loadingProducts ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <RefreshCw className="h-4 w-4 mr-1" />}
                Atualizar Produtos
              </Button>

              {products.length === 0 && !loadingProducts && (
                <p className="text-xs text-amber-500">
                  Nenhum produto cadastrado. Adicione produtos na aba "Produtos & Conhecimento".
                </p>
              )}
            </CardContent>
          </Card>

          {/* Tone Selection */}
          <Card className="border-border/50 bg-card/50 backdrop-blur">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Tom & Configuração
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <Label className="text-xs">Tom do Script</Label>
                <div className="grid grid-cols-1 gap-1.5">
                  {TONE_OPTIONS.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setTone(t.id)}
                      className={`flex items-center gap-2 p-2 rounded-lg text-left text-sm transition-colors ${
                        tone === t.id
                          ? "bg-primary/10 border border-primary/30 text-foreground"
                          : "bg-muted/30 hover:bg-muted/50 text-muted-foreground"
                      }`}
                    >
                      <t.icon className="h-3.5 w-3.5 shrink-0" />
                      <div>
                        <p className="font-medium text-xs">{t.name}</p>
                        <p className="text-[10px] opacity-60">{t.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Público-alvo (opcional)</Label>
                <Input
                  placeholder="Ex: PMEs do setor de saúde"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  className="text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Objetivo da chamada (opcional)</Label>
                <Input
                  placeholder="Ex: Agendar demo do produto"
                  value={objective}
                  onChange={(e) => setObjective(e.target.value)}
                  className="text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Instruções adicionais (opcional)</Label>
                <Textarea
                  placeholder="Ex: Mencionar promoção de lançamento, focar em ROI..."
                  value={customInstructions}
                  onChange={(e) => setCustomInstructions(e.target.value)}
                  rows={2}
                  className="text-sm"
                />
              </div>
            </CardContent>
          </Card>

          {/* Voice Selection */}
          <Card className="border-border/50 bg-card/50 backdrop-blur">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Volume2 className="h-4 w-4" />
                Voz ElevenLabs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {VOICE_OPTIONS.map((v) => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Generate Button */}
          <Button
            onClick={generateScript}
            disabled={isGenerating}
            className="w-full gap-2"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Gerando Script com IA...
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5" />
                Gerar Script de Vendas
              </>
            )}
          </Button>
        </div>

        {/* Center + Right - Generated Script */}
        <div className="lg:col-span-2">
          <Card className="border-border/50 bg-card/50 backdrop-blur h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Script Gerado
                  </CardTitle>
                  <CardDescription>
                    {generatedScript
                      ? `${generatedScript.length} caracteres • ~${Math.ceil(generatedScript.split(/\s+/).length / 150)} min de leitura`
                      : "Configure e gere seu script personalizado"}
                  </CardDescription>
                </div>
                {generatedScript && (
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={copyScript} className="gap-1">
                      <Copy className="h-3 w-3" /> Copiar
                    </Button>
                    <Button variant="outline" size="sm" onClick={downloadScript} className="gap-1">
                      <Download className="h-3 w-3" /> Baixar
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {!generatedScript ? (
                <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                  <FileText className="h-16 w-16 mb-4 opacity-20" />
                  <p className="text-lg font-medium">Nenhum script gerado</p>
                  <p className="text-sm mt-1">
                    Selecione um produto, configure o tom e clique em "Gerar Script"
                  </p>
                  <div className="flex items-center gap-4 mt-6 text-xs">
                    <div className="flex items-center gap-1">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      Base de conhecimento RAG
                    </div>
                    <div className="flex items-center gap-1">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      BANT Qualificação
                    </div>
                    <div className="flex items-center gap-1">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      Objeções & Fechamento
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <ScrollArea className="h-[450px] rounded-lg border border-border/30 bg-muted/10 p-4">
                    <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                      {generatedScript}
                    </div>
                  </ScrollArea>

                  {/* Playback Controls */}
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/30">
                    <div className="flex items-center gap-2 flex-1">
                      <Mic className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">Reproduzir com voz IA</span>
                      <Badge variant="outline" className="text-xs">
                        {VOICE_OPTIONS.find((v) => v.id === selectedVoice)?.name.split(" (")[0] || "George"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      {!isPlaying ? (
                        <Button onClick={() => playScript()} className="gap-2" size="sm">
                          <Play className="h-4 w-4" />
                          Ouvir Script
                        </Button>
                      ) : (
                        <Button variant="outline" onClick={stopPlaying} className="gap-2" size="sm">
                          <Square className="h-4 w-4" />
                          Parar
                        </Button>
                      )}
                    </div>
                  </div>

                  {generatedScript.length > 5000 && (
                    <p className="text-xs text-amber-500">
                      ⚠️ O script tem {generatedScript.length} caracteres. O TTS reproduzirá os primeiros 5.000 caracteres.
                    </p>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SalesVoiceAgent;
