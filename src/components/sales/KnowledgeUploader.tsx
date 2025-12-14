import { useState, useCallback, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Upload, FileText, Brain, CheckCircle, Loader2 } from "lucide-react";

interface Product {
  id: string;
  name: string;
}

const KnowledgeUploader = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [textContent, setTextContent] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [chunksCreated, setChunksCreated] = useState(0);

  // Load products on mount
  useEffect(() => {
    const loadProducts = async () => {
      if (!user) return;
      const { data } = await supabase
        .from('products')
        .select('id, name')
        .eq('user_id', user.id);
      if (data) setProducts(data);
    };
    loadProducts();
  }, [user]);

  const processKnowledge = async () => {
    if (!selectedProduct || !textContent.trim()) {
      toast.error("Selecione um produto e insira o conteúdo");
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    setChunksCreated(0);

    try {
      // Split text into chunks (simple implementation)
      const chunks = splitIntoChunks(textContent, 500);
      const totalChunks = chunks.length;

      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        
        // Call edge function to process and store chunk
        const { error } = await supabase.functions.invoke('ingest-knowledge', {
          body: {
            product_id: selectedProduct,
            content: chunk,
            chunk_index: i
          }
        });

        if (error) throw error;

        setProgress(((i + 1) / totalChunks) * 100);
        setChunksCreated(i + 1);
      }

      toast.success(`${totalChunks} chunks de conhecimento processados!`);
      setTextContent("");
    } catch (error) {
      console.error('Error processing knowledge:', error);
      toast.error("Erro ao processar conhecimento");
    } finally {
      setIsProcessing(false);
    }
  };

  const splitIntoChunks = (text: string, maxLength: number): string[] => {
    const sentences = text.split(/[.!?]+/);
    const chunks: string[] = [];
    let currentChunk = "";

    for (const sentence of sentences) {
      const trimmedSentence = sentence.trim();
      if (!trimmedSentence) continue;

      if ((currentChunk + " " + trimmedSentence).length > maxLength) {
        if (currentChunk) chunks.push(currentChunk.trim());
        currentChunk = trimmedSentence;
      } else {
        currentChunk += (currentChunk ? ". " : "") + trimmedSentence;
      }
    }

    if (currentChunk) chunks.push(currentChunk.trim());
    return chunks;
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    const textFile = files.find(f => f.type === 'text/plain' || f.name.endsWith('.txt'));
    
    if (textFile) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setTextContent(e.target?.result as string || "");
      };
      reader.readAsText(textFile);
    } else {
      toast.info("Por enquanto, apenas arquivos .txt são suportados. PDFs em breve!");
    }
  }, []);

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          Upload de Conhecimento
        </CardTitle>
        <CardDescription>
          Treine a IA com informações sobre seus produtos
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Product Selector */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Produto</label>
          <Select value={selectedProduct} onValueChange={setSelectedProduct}>
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

        {/* Drop Zone */}
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
        >
          <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
          <p className="text-sm text-muted-foreground">
            Arraste arquivos aqui ou cole o texto abaixo
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Suporta: TXT (PDF em breve)
          </p>
        </div>

        {/* Text Input */}
        <Textarea
          placeholder="Cole aqui as informações do produto, FAQs, scripts de vendas, objeções comuns..."
          value={textContent}
          onChange={(e) => setTextContent(e.target.value)}
          className="min-h-[150px] bg-background/50"
        />

        {/* Progress */}
        {isProcessing && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Processando conhecimento...</span>
              <span className="text-foreground font-medium">{chunksCreated} chunks</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {/* Process Button */}
        <Button 
          onClick={processKnowledge}
          disabled={isProcessing || !selectedProduct || !textContent.trim()}
          className="w-full gap-2"
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Processando...
            </>
          ) : (
            <>
              <Brain className="h-4 w-4" />
              Processar e Treinar IA
            </>
          )}
        </Button>

        {/* Info */}
        <div className="flex items-start gap-2 p-3 bg-primary/5 rounded-lg">
          <FileText className="h-4 w-4 text-primary mt-0.5" />
          <p className="text-xs text-muted-foreground">
            O conteúdo será dividido em chunks semânticos e vetorizado para 
            que a IA possa responder perguntas sobre o produto com precisão.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default KnowledgeUploader;
