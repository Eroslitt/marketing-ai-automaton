import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Play, 
  Pause,
  Square,
  Upload,
  Download,
  Scissors,
  Palette,
  Music,
  Type,
  Layers,
  Zap,
  Video,
  Image,
  Mic,
  Settings,
  Timer,
  Sparkles,
  Eye,
  Share2
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

const VideoStudio = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration] = useState(30);
  const [selectedTemplate, setSelectedTemplate] = useState("social-ad");
  const [generatingVideo, setGeneratingVideo] = useState(false);
  const [progress, setProgress] = useState(0);

  const templates = [
    {
      id: "social-ad",
      name: "Anúncio Social",
      description: "Template otimizado para Instagram/Facebook",
      duration: "15s",
      ratio: "9:16",
      preview: "/placeholder.svg"
    },
    {
      id: "youtube-short",
      name: "YouTube Short",
      description: "Formato vertical para YouTube Shorts",
      duration: "30s",
      ratio: "9:16",
      preview: "/placeholder.svg"
    },
    {
      id: "tiktok-viral",
      name: "TikTok Viral",
      description: "Template com elementos virais do TikTok",
      duration: "15s",
      ratio: "9:16",
      preview: "/placeholder.svg"
    },
    {
      id: "product-showcase",
      name: "Showcase Produto",
      description: "Apresentação profissional de produtos",
      duration: "20s",
      ratio: "16:9",
      preview: "/placeholder.svg"
    }
  ];

  const aiFeatures = [
    {
      name: "Auto-Edit",
      description: "Edição automática baseada no roteiro",
      icon: Scissors,
      status: "ready"
    },
    {
      name: "Voice Clone",
      description: "Clonagem de voz com IA",
      icon: Mic,
      status: "processing"
    },
    {
      name: "Smart Subtitles",
      description: "Legendas automáticas com sync perfeito",
      icon: Type,
      status: "ready"
    },
    {
      name: "Scene Detection",
      description: "Detecção inteligente de cenas",
      icon: Eye,
      status: "ready"
    }
  ];

  const handleGenerate = async () => {
    setGeneratingVideo(true);
    setProgress(0);
    
    // Simular processo de geração
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setGeneratingVideo(false);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4">
        <div>
          <h1 className="text-3xl font-bold">Estúdio de Vídeos IA</h1>
          <p className="text-muted-foreground">
            Crie vídeos profissionais com inteligência artificial avançada
          </p>
        </div>

        <div className="flex gap-4">
          <Button className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Importar Mídia
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Video className="h-4 w-4" />
            Novo Projeto
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            IA Gerador
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Video Editor */}
        <div className="lg:col-span-2 space-y-6">
          {/* Video Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Preview do Vídeo</span>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">30fps</Badge>
                  <Badge variant="outline">1080p</Badge>
                  <Badge>9:16</Badge>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Video Player */}
              <div className="aspect-[9/16] max-w-xs mx-auto bg-black rounded-lg relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-white text-center">
                    <Video className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p className="text-sm opacity-75">Preview do vídeo será exibido aqui</p>
                  </div>
                </div>
                
                {/* Play Controls Overlay */}
                <div className="absolute bottom-4 left-4 right-4 space-y-2">
                  <Progress value={(currentTime / duration) * 100} className="h-1" />
                  <div className="flex items-center justify-between text-white text-xs">
                    <span>{Math.floor(currentTime)}s</span>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 text-white hover:bg-white/20"
                        onClick={() => setIsPlaying(!isPlaying)}
                      >
                        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </Button>
                    </div>
                    <span>{duration}s</span>
                  </div>
                </div>
              </div>

              {/* Timeline Controls */}
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Button
                    size="sm"
                    variant={isPlaying ? "default" : "outline"}
                    onClick={() => setIsPlaying(!isPlaying)}
                  >
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                  <Button size="sm" variant="outline">
                    <Square className="h-4 w-4" />
                  </Button>
                  <div className="flex-1">
                    <Slider
                      value={[currentTime]}
                      onValueChange={([value]) => setCurrentTime(value)}
                      max={duration}
                      step={0.1}
                      className="w-full"
                    />
                  </div>
                  <span className="text-sm text-muted-foreground min-w-0">
                    {Math.floor(currentTime)}s / {duration}s
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Generation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-yellow-500" />
                Gerador IA Avançado
              </CardTitle>
              <CardDescription>
                Descreva o vídeo que você quer criar e a IA fará o resto
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Ex: Crie um vídeo de 30 segundos para promover um curso de marketing digital. Inclua texto animado, música de fundo energética e transições modernas..."
                className="min-h-[100px]"
              />
              
              <div className="grid grid-cols-2 gap-4">
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Estilo visual" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="modern">Moderno</SelectItem>
                    <SelectItem value="minimal">Minimalista</SelectItem>
                    <SelectItem value="corporate">Corporativo</SelectItem>
                    <SelectItem value="creative">Criativo</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Duração" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 segundos</SelectItem>
                    <SelectItem value="30">30 segundos</SelectItem>
                    <SelectItem value="60">60 segundos</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {generatingVideo && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Gerando vídeo...</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} />
                </div>
              )}

              <Button 
                onClick={handleGenerate} 
                disabled={generatingVideo}
                className="w-full"
              >
                {generatingVideo ? (
                  <>
                    <Timer className="h-4 w-4 mr-2 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Gerar Vídeo com IA
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Templates */}
          <Card>
            <CardHeader>
              <CardTitle>Templates</CardTitle>
              <CardDescription>
                Escolha um template otimizado
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                    selectedTemplate === template.id
                      ? "border-primary bg-primary/5"
                      : "border-muted hover:border-muted-foreground/50"
                  }`}
                  onClick={() => setSelectedTemplate(template.id)}
                >
                  <div className="flex gap-3">
                    <div className="w-12 h-16 bg-muted rounded flex-shrink-0"></div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm">{template.name}</h4>
                      <p className="text-xs text-muted-foreground mb-2">
                        {template.description}
                      </p>
                      <div className="flex gap-2">
                        <Badge variant="outline" className="text-xs">
                          {template.duration}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {template.ratio}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* AI Features */}
          <Card>
            <CardHeader>
              <CardTitle>Recursos IA</CardTitle>
              <CardDescription>
                Funcionalidades inteligentes disponíveis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {aiFeatures.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={feature.name}
                    className="flex items-center gap-3 p-3 border rounded-lg"
                  >
                    <div className="p-2 bg-primary/10 rounded">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-sm">{feature.name}</h4>
                        <Badge 
                          variant={feature.status === "ready" ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {feature.status === "ready" ? "Pronto" : "Processando"}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Export Options */}
          <Card>
            <CardHeader>
              <CardTitle>Exportar</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Qualidade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="4k">4K (Ultra HD)</SelectItem>
                  <SelectItem value="1080p">1080p (Full HD)</SelectItem>
                  <SelectItem value="720p">720p (HD)</SelectItem>
                </SelectContent>
              </Select>

              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Formato" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mp4">MP4</SelectItem>
                  <SelectItem value="mov">MOV</SelectItem>
                  <SelectItem value="webm">WebM</SelectItem>
                </SelectContent>
              </Select>

              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button variant="outline" size="sm">
                  <Share2 className="h-4 w-4 mr-2" />
                  Compartilhar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default VideoStudio;