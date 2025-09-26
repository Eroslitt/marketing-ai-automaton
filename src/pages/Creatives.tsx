import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Image, 
  Video, 
  FileText,
  Sparkles,
  Download,
  Copy,
  MoreHorizontal,
  Filter
} from "lucide-react";

export const Creatives = () => {
  const [creatives] = useState([
    {
      id: 1,
      name: "Banner Lançamento - Variação A",
      type: "image",
      format: "1080x1080",
      campaign: "Lançamento Produto X",
      status: "active",
      performance: {
        ctr: "3.2%",
        impressions: "45.2K",
        clicks: 1456
      },
      thumbnail: "/api/placeholder/300/300",
      createdAt: "2024-01-15"
    },
    {
      id: 2,
      name: "Vídeo Produto - 15s",
      type: "video",
      format: "1080x1920",
      campaign: "Lançamento Produto X",
      status: "testing",
      performance: {
        ctr: "4.1%",
        impressions: "23.8K",
        clicks: 976
      },
      thumbnail: "/api/placeholder/300/400",
      createdAt: "2024-01-14"
    },
    {
      id: 3,
      name: "Copy Principal - Headlines",
      type: "text",
      format: "Texto",
      campaign: "Black Friday 2024",
      status: "approved",
      performance: {
        ctr: "2.8%",
        impressions: "67.1K",
        clicks: 1879
      },
      thumbnail: null,
      createdAt: "2024-01-12"
    }
  ]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'image':
        return Image;
      case 'video':
        return Video;
      case 'text':
        return FileText;
      default:
        return FileText;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-growth/10 text-growth';
      case 'testing':
        return 'bg-warning/10 text-warning';
      case 'approved':
        return 'bg-primary/10 text-primary';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Ativo';
      case 'testing':
        return 'Testando';
      case 'approved':
        return 'Aprovado';
      default:
        return 'Rascunho';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Criativos</h1>
          <p className="text-muted-foreground">Biblioteca de conteúdo gerado por IA</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2">
            <Filter className="w-4 h-4" />
            Filtros
          </Button>
          <Button className="gap-2" asChild>
            <a href="/creatives/generate">
              <Sparkles className="w-4 h-4" />
              Gerar com IA
            </a>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Image className="w-5 h-5 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Imagens</p>
              <p className="text-2xl font-bold text-foreground">24</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Video className="w-5 h-5 text-accent" />
            <div>
              <p className="text-sm text-muted-foreground">Vídeos</p>
              <p className="text-2xl font-bold text-foreground">8</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-engagement" />
            <div>
              <p className="text-sm text-muted-foreground">Textos</p>
              <p className="text-2xl font-bold text-foreground">16</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-warning" />
            <div>
              <p className="text-sm text-muted-foreground">IA Gerados</p>
              <p className="text-2xl font-bold text-foreground">42</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Creatives Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {creatives.map((creative) => {
          const TypeIcon = getTypeIcon(creative.type);
          
          return (
            <Card key={creative.id} className="overflow-hidden hover:shadow-md transition-shadow">
              {/* Preview */}
              <div className="aspect-video bg-muted/30 flex items-center justify-center border-b border-border">
                {creative.thumbnail ? (
                  <img 
                    src={creative.thumbnail} 
                    alt={creative.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <TypeIcon className="w-12 h-12 text-muted-foreground" />
                )}
              </div>
              
              {/* Content */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-foreground text-sm mb-1 truncate">
                      {creative.name}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {creative.campaign}
                    </p>
                  </div>
                  <Badge className={getStatusColor(creative.status)}>
                    {getStatusText(creative.status)}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                  <span>{creative.format}</span>
                  <span>•</span>
                  <span>{creative.type === 'image' ? 'Imagem' : creative.type === 'video' ? 'Vídeo' : 'Texto'}</span>
                </div>
                
                {/* Performance */}
                <div className="space-y-1 mb-3">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">CTR:</span>
                    <span className="font-medium text-foreground">{creative.performance.ctr}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Impressões:</span>
                    <span className="font-medium text-foreground">{creative.performance.impressions}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Cliques:</span>
                    <span className="font-medium text-foreground">{creative.performance.clicks}</span>
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" className="flex-1">
                    <Copy className="w-3 h-3 mr-1" />
                    Duplicar
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Download className="w-3 h-3" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Generate New */}
      <Card className="p-8 text-center border-dashed border-2 border-border hover:border-primary/50 transition-colors">
        <Sparkles className="w-12 h-12 text-primary mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Gerar Novos Criativos com IA
        </h3>
        <p className="text-muted-foreground mb-4 max-w-md mx-auto">
          Crie imagens, vídeos e textos automaticamente baseados na sua marca e objetivos
        </p>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Começar Geração
        </Button>
      </Card>
    </div>
  );
};