import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Database,
  Zap,
  Settings,
  BarChart,
  Cpu,
  HardDrive,
  Network,
  Timer,
  Target,
  Layers,
  GitBranch,
  RefreshCw,
  Play,
  Pause,
  RotateCcw
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const MLOpsCenter = () => {
  const [autoRetraining, setAutoRetraining] = useState(true);
  const [selectedModel, setSelectedModel] = useState("copy-agent-v2");

  const models = [
    {
      id: "copy-agent-v2",
      name: "Copy Agent v2.1",
      type: "Copywriting",
      status: "active",
      accuracy: 94.2,
      lastTrained: "2024-01-15",
      version: "v2.1.3",
      performance: {
        ctr: 3.2,
        conversion: 12.8,
        engagement: 85.3
      }
    },
    {
      id: "creative-agent-v1",
      name: "Creative Agent v1.8",
      type: "Design Generation",
      status: "training",
      accuracy: 91.7,
      lastTrained: "2024-01-14",
      version: "v1.8.2",
      performance: {
        approval: 88.9,
        similarity: 92.1,
        creativity: 89.4
      }
    },
    {
      id: "prospect-agent-v3",
      name: "Prospect Agent v3.0",
      type: "Lead Generation",
      status: "pending",
      accuracy: 89.5,
      lastTrained: "2024-01-13",
      version: "v3.0.1",
      performance: {
        leadScore: 94.3,
        conversion: 18.7,
        qualification: 91.2
      }
    }
  ];

  const trainingJobs = [
    {
      id: 1,
      model: "Copy Agent v2.2",
      status: "running",
      progress: 67,
      eta: "2h 15m",
      dataset: "campaign-data-q4-2024",
      startTime: "14:32",
      metrics: { loss: 0.0234, accuracy: 0.942 }
    },
    {
      id: 2,
      model: "Creative Agent v1.9",
      status: "queued",
      progress: 0,
      eta: "4h 30m",
      dataset: "visual-assets-2024",
      startTime: "Pending",
      metrics: { loss: 0, accuracy: 0 }
    },
    {
      id: 3,
      model: "Analytics Agent v1.0",
      status: "completed",
      progress: 100,
      eta: "Completed",
      dataset: "performance-metrics-2024",
      startTime: "09:15",
      metrics: { loss: 0.0187, accuracy: 0.965 }
    }
  ];

  const systemMetrics = {
    cpu: 45,
    memory: 72,
    storage: 58,
    gpu: 89,
    network: 23
  };

  const performanceData = [
    { name: "CTR", baseline: 2.1, current: 3.2, target: 3.5 },
    { name: "CVR", baseline: 8.4, current: 12.8, target: 15.0 },
    { name: "CPA", baseline: 45.2, current: 32.1, target: 28.0 },
    { name: "ROI", baseline: 3.2, current: 4.8, target: 5.5 }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "text-green-500";
      case "training": return "text-yellow-500";
      case "pending": return "text-gray-500";
      case "running": return "text-blue-500";
      case "queued": return "text-orange-500";
      case "completed": return "text-green-500";
      default: return "text-gray-500";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active": return CheckCircle;
      case "training": return RefreshCw;
      case "pending": return Clock;
      case "running": return Play;
      case "queued": return Timer;
      case "completed": return CheckCircle;
      default: return Clock;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4">
        <div>
          <h1 className="text-3xl font-bold">Centro MLOps</h1>
          <p className="text-muted-foreground">
            Monitoramento, treinamento e otimização de modelos de IA
          </p>
        </div>

        <div className="flex gap-4">
          <Button className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Retreinar Modelos
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Configurações
          </Button>
        </div>
      </div>

      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <Cpu className="h-8 w-8 text-blue-500" />
            <div>
              <p className="text-sm text-muted-foreground">CPU</p>
              <p className="text-2xl font-bold">{systemMetrics.cpu}%</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <HardDrive className="h-8 w-8 text-green-500" />
            <div>
              <p className="text-sm text-muted-foreground">Memória</p>
              <p className="text-2xl font-bold">{systemMetrics.memory}%</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <Database className="h-8 w-8 text-purple-500" />
            <div>
              <p className="text-sm text-muted-foreground">Storage</p>
              <p className="text-2xl font-bold">{systemMetrics.storage}%</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <Zap className="h-8 w-8 text-yellow-500" />
            <div>
              <p className="text-sm text-muted-foreground">GPU</p>
              <p className="text-2xl font-bold">{systemMetrics.gpu}%</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <Network className="h-8 w-8 text-orange-500" />
            <div>
              <p className="text-sm text-muted-foreground">Network</p>
              <p className="text-2xl font-bold">{systemMetrics.network}%</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="models" className="space-y-6">
        <TabsList>
          <TabsTrigger value="models">Modelos</TabsTrigger>
          <TabsTrigger value="training">Treinamento</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoramento</TabsTrigger>
        </TabsList>

        <TabsContent value="models" className="space-y-6">
          <div className="grid gap-4">
            {models.map((model) => {
              const StatusIcon = getStatusIcon(model.status);
              return (
                <Card key={model.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Brain className="h-8 w-8 text-primary" />
                        <div>
                          <CardTitle>{model.name}</CardTitle>
                          <CardDescription>{model.type}</CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge variant="outline">{model.version}</Badge>
                        <div className={`flex items-center gap-2 ${getStatusColor(model.status)}`}>
                          <StatusIcon className="h-4 w-4" />
                          <span className="capitalize">{model.status}</span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Acurácia</p>
                        <div className="flex items-center gap-2">
                          <Progress value={model.accuracy} className="flex-1" />
                          <span className="text-sm font-medium">{model.accuracy}%</span>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm text-muted-foreground">Último Treino</p>
                        <p className="font-medium">{model.lastTrained}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-muted-foreground">Performance</p>
                        <div className="flex gap-2">
                          {Object.entries(model.performance).map(([key, value]) => (
                            <Badge key={key} variant="secondary" className="text-xs">
                              {key}: {value}%
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Settings className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                        <Button size="sm">
                          <Play className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="training" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Jobs de Treinamento</CardTitle>
              <CardDescription>
                Acompanhe o progresso dos treinamentos em execução
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {trainingJobs.map((job) => {
                  const StatusIcon = getStatusIcon(job.status);
                  return (
                    <div key={job.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded ${getStatusColor(job.status)} bg-current/10`}>
                            <StatusIcon className="h-4 w-4 text-current" />
                          </div>
                          <div>
                            <h4 className="font-medium">{job.model}</h4>
                            <p className="text-sm text-muted-foreground">
                              Dataset: {job.dataset}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">ETA: {job.eta}</p>
                          <p className="text-xs text-muted-foreground">
                            Início: {job.startTime}
                          </p>
                        </div>
                      </div>
                      
                      {job.status === "running" && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Progresso</span>
                            <span>{job.progress}%</span>
                          </div>
                          <Progress value={job.progress} />
                        </div>
                      )}
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Loss: </span>
                          <span className="font-medium">{job.metrics.loss}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Accuracy: </span>
                          <span className="font-medium">{job.metrics.accuracy}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid gap-4">
            {performanceData.map((metric) => (
              <Card key={metric.name}>
                <CardHeader>
                  <CardTitle className="text-lg">{metric.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Baseline</p>
                      <p className="text-2xl font-bold">{metric.baseline}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Atual</p>
                      <p className="text-2xl font-bold text-green-500">{metric.current}</p>
                      <p className="text-xs text-green-500">
                        +{((metric.current - metric.baseline) / metric.baseline * 100).toFixed(1)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Meta</p>
                      <p className="text-2xl font-bold text-blue-500">{metric.target}</p>
                      <p className="text-xs text-blue-500">
                        {((metric.target - metric.current) / metric.current * 100).toFixed(1)}% restante
                      </p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Progress 
                      value={(metric.current / metric.target) * 100} 
                      className="h-2"
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Alertas do Sistema</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  <div>
                    <p className="text-sm font-medium">GPU utilização alta</p>
                    <p className="text-xs text-muted-foreground">89% de uso por mais de 2h</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-sm font-medium">Modelo Copy Agent atualizado</p>
                    <p className="text-xs text-muted-foreground">Performance melhorou 12%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Configurações Auto-ML</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Auto Retraining</p>
                    <p className="text-sm text-muted-foreground">
                      Retreinar quando performance cair abaixo do limite
                    </p>
                  </div>
                  <Button
                    variant={autoRetraining ? "default" : "outline"}
                    onClick={() => setAutoRetraining(!autoRetraining)}
                  >
                    {autoRetraining ? "Ativo" : "Inativo"}
                  </Button>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Limite de Performance</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o limite" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="85">85% Accuracy</SelectItem>
                      <SelectItem value="90">90% Accuracy</SelectItem>
                      <SelectItem value="95">95% Accuracy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MLOpsCenter;