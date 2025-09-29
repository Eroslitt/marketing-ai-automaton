import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Image as ImageIcon,
  Video,
  FileText,
  Search,
  Filter,
  Download,
  Eye,
  MoreHorizontal,
  Sparkles,
  TrendingUp
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Creatives = () => {
  const { toast } = useToast();
  const [creatives, setCreatives] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [newCreative, setNewCreative] = useState({
    name: "",
    type: "image",
    prompt: "",
    campaignId: ""
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    loadCreatives();
  }, [filter]);

  const loadCreatives = async () => {
    try {
      setLoading(true);
      let query = (supabase as any)
        .from('creative_assets')
        .select('*, campaigns(name)')
        .order('created_at', { ascending: false });

      if (filter !== "all") {
        query = query.eq('type', filter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setCreatives(data || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar criativos",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateCreative = async () => {
    if (!newCreative.name || !newCreative.prompt) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha nome e prompt para gerar o criativo",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await (supabase as any)
        .from('creative_assets')
        .insert([{
          name: newCreative.name,
          type: newCreative.type,
          url: `https://placeholder.com/${newCreative.type}`,
          specs: { prompt: newCreative.prompt },
          variant_meta: {}
        }]);

      if (error) throw error;

      toast({
        title: "Criativo gerado!",
        description: "O criativo foi criado com sucesso"
      });

      setIsDialogOpen(false);
      setNewCreative({ name: "", type: "image", prompt: "", campaignId: "" });
      loadCreatives();
    } catch (error: any) {
      toast({
        title: "Erro ao gerar criativo",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "image":
        return ImageIcon;
      case "video":
        return Video;
      case "text":
        return FileText;
      default:
        return ImageIcon;
    }
  };

  const filteredCreatives = creatives.filter(creative =>
    creative.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: creatives.length,
    images: creatives.filter(c => c.type === "image").length,
    videos: creatives.filter(c => c.type === "video").length,
    texts: creatives.filter(c => c.type === "text").length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Biblioteca de Criativos</h1>
          <p className="text-muted-foreground">Gerencie seus criativos gerados por IA</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Gerar Criativo
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Gerar Novo Criativo</DialogTitle>
              <DialogDescription>
                Use IA para criar imagens, vídeos ou textos para suas campanhas
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome do Criativo</Label>
                <Input
                  id="name"
                  placeholder="Ex: Banner Black Friday"
                  value={newCreative.name}
                  onChange={(e) => setNewCreative({ ...newCreative, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Tipo</Label>
                <Select
                  value={newCreative.type}
                  onValueChange={(value) => setNewCreative({ ...newCreative, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="image">Imagem</SelectItem>
                    <SelectItem value="video">Vídeo</SelectItem>
                    <SelectItem value="text">Texto/Copy</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="prompt">Prompt de Geração</Label>
                <Textarea
                  id="prompt"
                  placeholder="Descreva o que deseja gerar..."
                  value={newCreative.prompt}
                  onChange={(e) => setNewCreative({ ...newCreative, prompt: e.target.value })}
                  rows={4}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleGenerateCreative} className="gap-2">
                <Sparkles className="w-4 h-4" />
                Gerar com IA
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-2xl font-bold text-foreground">{stats.total}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-blue-500" />
            <div>
              <p className="text-sm text-muted-foreground">Imagens</p>
              <p className="text-2xl font-bold text-foreground">{stats.images}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Video className="w-5 h-5 text-purple-500" />
            <div>
              <p className="text-sm text-muted-foreground">Vídeos</p>
              <p className="text-2xl font-bold text-foreground">{stats.videos}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-green-500" />
            <div>
              <p className="text-sm text-muted-foreground">Textos</p>
              <p className="text-2xl font-bold text-foreground">{stats.texts}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar criativos..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="image">Imagens</SelectItem>
            <SelectItem value="video">Vídeos</SelectItem>
            <SelectItem value="text">Textos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Creatives Grid */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Carregando criativos...</p>
        </div>
      ) : filteredCreatives.length === 0 ? (
        <Card className="p-12 text-center">
          <Sparkles className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Nenhum criativo encontrado
          </h3>
          <p className="text-muted-foreground mb-4">
            Comece gerando seu primeiro criativo com IA
          </p>
          <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Gerar Criativo
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCreatives.map((creative) => {
            const TypeIcon = getTypeIcon(creative.type);
            return (
              <Card key={creative.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-video bg-muted flex items-center justify-center">
                  <TypeIcon className="w-12 h-12 text-muted-foreground" />
                </div>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-base mb-1">{creative.name}</CardTitle>
                      <p className="text-xs text-muted-foreground">
                        {creative.campaigns?.name || "Sem campanha"}
                      </p>
                    </div>
                    <Badge variant="outline" className="capitalize">
                      {creative.type}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      <span>CTR: 2.4%</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      <span>1.2k views</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye className="w-3 h-3 mr-1" />
                      Ver
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Download className="w-3 h-3 mr-1" />
                      Baixar
                    </Button>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};