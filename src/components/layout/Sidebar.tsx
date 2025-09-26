import { NavLink } from "react-router-dom";
import { 
  BarChart3, 
  Briefcase, 
  MessageSquare, 
  PenTool, 
  Target, 
  Users, 
  Settings,
  Zap,
  Link,
  TrendingUp
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const navigation = [
  { name: "Dashboard", href: "/", icon: BarChart3 },
  { name: "Campanhas", href: "/campaigns", icon: Target },
  { name: "Criativos", href: "/creatives", icon: PenTool },
  { name: "Prospecção", href: "/prospects", icon: Users },
  { name: "WhatsApp", href: "/whatsapp", icon: MessageSquare },
  { name: "CRM Pipeline", href: "/projects", icon: Briefcase },
  { name: "Analytics", href: "/analytics", icon: TrendingUp },
  { name: "Integrações", href: "/integrations", icon: Link },
  { name: "Workflows", href: "/workflows", icon: Zap },
  { name: "Agent Studio", href: "/agent-studio", icon: Zap },
  { name: "Automações", href: "/automation", icon: Zap },
  { name: "Usuários", href: "/users", icon: Users },
  { name: "Prompts IA", href: "/agent-prompts", icon: Zap },
  { name: "Configurações", href: "/settings", icon: Settings },
];

export const Sidebar = ({ isOpen, onToggle }: SidebarProps) => {
  return (
    <div className={cn(
      "bg-card border-r border-border transition-all duration-300",
      isOpen ? "w-64" : "w-16"
    )}>
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center h-16 px-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary-glow rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary-foreground" />
            </div>
            {isOpen && (
              <div>
                <h1 className="font-bold text-lg text-foreground">AgênciaIA</h1>
                <p className="text-xs text-muted-foreground">Marketing Automático</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
                  "hover:bg-muted/60",
                  isActive ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground"
                )
              }
            >
              <item.icon className="w-5 h-5" />
              {isOpen && <span className="text-sm">{item.name}</span>}
            </NavLink>
          ))}
        </nav>

        {/* User info */}
        {isOpen && (
          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-primary-foreground">U</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">Usuário</p>
                <p className="text-xs text-muted-foreground truncate">user@agencia.com</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};