import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  Target, 
  PenTool, 
  Users, 
  MessageSquare,
  Zap
} from "lucide-react";

const actions = [
  {
    title: "Nova Campanha",
    description: "Criar campanha completa com IA",
    icon: Target,
    color: "bg-primary/10 text-primary hover:bg-primary/20",
    href: "/campaigns/new"
  },
  {
    title: "Gerar Criativos",
    description: "Criar imagens e vídeos automaticamente",
    icon: PenTool,
    color: "bg-accent/10 text-accent hover:bg-accent/20",
    href: "/creatives"
  },
  {
    title: "Prospectar Leads",
    description: "Encontrar e contatar prospects",
    icon: Users,
    color: "bg-primary/10 text-primary hover:bg-primary/20",
    href: "/prospects"
  },
  {
    title: "WhatsApp Bot",
    description: "Configurar atendimento automático",
    icon: MessageSquare,
    color: "bg-primary/10 text-primary hover:bg-primary/20",
    href: "/whatsapp"
  },
];

export const QuickActions = () => {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Zap className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Ações Rápidas</h3>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {actions.map((action) => (
          <Button
            key={action.title}
            variant="ghost"
            className="h-auto p-4 justify-start gap-3 hover:bg-muted/60"
            asChild
          >
            <Link to={action.href}>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${action.color}`}>
                <action.icon className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="font-medium text-foreground text-sm">{action.title}</p>
                <p className="text-xs text-muted-foreground">{action.description}</p>
              </div>
            </Link>
          </Button>
        ))}
      </div>
    </Card>
  );
};
