import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { 
  Play, Pause, Square, Upload, Download, Scissors, Type, Video, Sparkles, Eye, Share2, Plus, Trash2, Timer
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const VideoStudio = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [generatingVideo, setGeneratingVideo] = useState(false);
  const [progress, setProgress] = useState(0);
  const [newProject, setNewProject] = useState({ name: "", description: "", template: "social-ad", ratio: "9:16", duration: 30, quality: "1080p", ai_prompt: "", style: "modern" });

  const templates = [
    { id: "social-ad", name: "Anúncio Social", description: "Instagram/Facebook", duration: "15s", ratio: "9:16" },
    { id: "youtube-short", name: "YouTube Short", description: "Formato vertical", duration: "30s", ratio: "9:16" },
    { id: "tiktok-viral", name: "TikTok Viral", description: "Template viral", duration: "15s", ratio: "9:16" },
    { id: "product-showcase", name: "Showcase Produto", description: "Apresentação profissional", duration: "20s", ratio: "16:9" }
  ];

  useEffect(() => { if (user) loadProjects(); }, [user]);

  const loadProjects = async () => {
    const { data } = await supabase.from('video_projects').select('*').eq('user_id', user!.id).order('created_at', { ascending: false });
    setProjects(data || []);
    setLoading(false);
  };

  const handleCreate = async () => {
    if (!newProject.name.trim()) { toast.error("Nome é obrigatório"); return; }
    setSaving(true);
    try {
      const { error } = await supabase.from('video_projects').insert({
        user_id: user!.id, ...newProject, duration_seconds: newProject.duration, status: 'draft'
      });
      if (error) throw error;
      toast.success("Projeto criado!");
      setShowCreate(false);
      setNewProject({ name: "", description: "", template: "social-ad", ratio: "9:16", duration: 30, quality: "1080p", ai_prompt: "", style: "modern" });
      loadProjects();
    } catch { toast.error("Erro ao criar projeto"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir projeto?")) return;
    await supabase.from('video_projects').delete().eq('id', id);
    toast.success("Projeto excluído");
    if (selectedProject?.id === id) setSelectedProject(null);
    loadProjects();
  };

  const handleGenerate = async () => {
    if (!selectedProject) return;
    setGeneratingVideo(true);
    setProgress(0);
    await supabase.from('video_projects').update({ status: 'processing' }).eq('id', selectedProject.id);
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setGeneratingVideo(false);
          supabase.from('video_projects').update({ status: 'completed' }).eq('id', selectedProject.id).then(() => loadProjects());
          toast.success("Vídeo gerado com sucesso!");
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 500);
  };

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Estúdio de Vídeos IA</h1>
          <p className="text-muted-foreground">Crie vídeos profissionais com inteligência artificial</p>
        </div>
        <Button className="gap-2" onClick={() => setShowCreate(true)}><Plus className="w-4 h-4" /> Novo Projeto</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Projects List */}
        <div className="space-y-4">
          <h3 className="font-semibold text-foreground">Projetos ({projects.length})</h3>
          {projects.length === 0 ? (
            <Card className="p-6 text-center">
              <Video className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
              <p className="text-sm text-muted-foreground mb-3">Nenhum projeto</p>
              <Button size="sm" onClick={() => setShowCreate(true)}><Plus className="w-4 h-4 mr-2" /> Criar</Button>
            </Card>
          ) : (
            projects.map(p => (
              <Card key={p.id} className={`p-4 cursor-pointer transition-colors ${selectedProject?.id === p.id ? 'border-primary' : 'hover:border-primary/50'}`} onClick={() => setSelectedProject(p)}>
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium text-foreground">{p.name}</h4>
                    <p className="text-xs text-muted-foreground">{p.template} • {p.ratio} • {p.duration_seconds}s</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={p.status === 'completed' ? 'default' : 'secondary'}>{p.status}</Badge>
                    <Button variant="ghost" size="sm" className="text-destructive" onClick={(e) => { e.stopPropagation(); handleDelete(p.id); }}><Trash2 className="w-3 h-3" /></Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Editor */}
        <div className="lg:col-span-2 space-y-6">
          {selectedProject ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{selectedProject.name}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{selectedProject.quality}</Badge>
                      <Badge>{selectedProject.ratio}</Badge>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="aspect-[9/16] max-w-xs mx-auto bg-black rounded-lg relative overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-white text-center">
                        <Video className="h-16 w-16 mx-auto mb-4 opacity-50" />
                        <p className="text-sm opacity-75">Preview</p>
                      </div>
                    </div>
                    <div className="absolute bottom-4 left-4 right-4 space-y-2">
                      <Progress value={(currentTime / (selectedProject.duration_seconds || 30)) * 100} className="h-1" />
                      <div className="flex items-center justify-between text-white text-xs">
                        <span>{Math.floor(currentTime)}s</span>
                        <Button size="sm" variant="ghost" className="h-8 w-8 text-white hover:bg-white/20" onClick={() => setIsPlaying(!isPlaying)}>
                          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        </Button>
                        <span>{selectedProject.duration_seconds}s</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Button size="sm" variant={isPlaying ? "default" : "outline"} onClick={() => setIsPlaying(!isPlaying)}>
                      {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>
                    <div className="flex-1">
                      <Slider value={[currentTime]} onValueChange={([v]) => setCurrentTime(v)} max={selectedProject.duration_seconds || 30} step={0.1} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-amber-500" /> Gerador IA</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea value={selectedProject.ai_prompt || ''} placeholder="Descreva o vídeo que deseja gerar..." readOnly />
                  {generatingVideo && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm"><span>Gerando...</span><span>{Math.round(progress)}%</span></div>
                      <Progress value={progress} />
                    </div>
                  )}
                  <Button onClick={handleGenerate} disabled={generatingVideo} className="w-full">
                    {generatingVideo ? <><Timer className="h-4 w-4 mr-2 animate-spin" /> Gerando...</> : <><Sparkles className="h-4 w-4 mr-2" /> Gerar Vídeo com IA</>}
                  </Button>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="p-12 text-center">
              <Video className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">Selecione ou crie um projeto</p>
            </Card>
          )}
        </div>
      </div>

      {/* Create Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Projeto de Vídeo</DialogTitle>
            <DialogDescription>Configure seu projeto de vídeo IA</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div><Label>Nome *</Label><Input value={newProject.name} onChange={e => setNewProject({ ...newProject, name: e.target.value })} placeholder="Nome do projeto" className="mt-2" /></div>
            <div><Label>Template</Label>
              <Select value={newProject.template} onValueChange={v => setNewProject({ ...newProject, template: v })}>
                <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
                <SelectContent>{templates.map(t => <SelectItem key={t.id} value={t.id}>{t.name} ({t.ratio})</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Prompt IA</Label><Textarea value={newProject.ai_prompt} onChange={e => setNewProject({ ...newProject, ai_prompt: e.target.value })} placeholder="Descreva o vídeo..." className="mt-2" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Duração (s)</Label><Input type="number" value={newProject.duration} onChange={e => setNewProject({ ...newProject, duration: Number(e.target.value) })} className="mt-2" /></div>
              <div><Label>Qualidade</Label>
                <Select value={newProject.quality} onValueChange={v => setNewProject({ ...newProject, quality: v })}>
                  <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="4k">4K</SelectItem><SelectItem value="1080p">1080p</SelectItem><SelectItem value="720p">720p</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
            <Button className="w-full" onClick={handleCreate} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />} Criar Projeto
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VideoStudio;
