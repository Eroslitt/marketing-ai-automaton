import { NavLink, useLocation } from "react-router-dom";
import { 
  BarChart3, Briefcase, MessageSquare, PenTool, Target, Users, Settings,
  Zap, Link, TrendingUp, Bot, Store, Video, Brain, Network, Cog, Code,
  Rocket, ChevronLeft, ChevronRight, LogOut, X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  isMobile?: boolean;
}

const navigation = [
  { name: "Dashboard", href: "/", icon: BarChart3 },
  { name: "SalesCore AI", href: "/sales", icon: Rocket },
  { name: "Campanhas", href: "/campaigns", icon: Target },
  { name: "Criativos", href: "/creatives", icon: PenTool },
  { name: "Prospecção", href: "/prospects", icon: Users },
  { name: "WhatsApp", href: "/whatsapp", icon: MessageSquare },
  { name: "CRM Pipeline", href: "/projects", icon: Briefcase },
  { name: "Analytics", href: "/analytics", icon: TrendingUp },
  { name: "Integrações", href: "/integrations", icon: Link },
  { name: "Workflows", href: "/workflows", icon: Zap },
  { name: "Agent Studio", href: "/agent-studio", icon: Bot },
  { name: "Marketplace", href: "/marketplace", icon: Store },
  { name: "Vídeo Studio", href: "/video-studio", icon: Video },
  { name: "MLOps Center", href: "/mlops", icon: Brain },
  { name: "Integration Hub", href: "/integration-hub", icon: Network },
  { name: "Automações", href: "/automation", icon: Cog },
  { name: "Usuários", href: "/users", icon: Users },
  { name: "Prompts IA", href: "/agent-prompts", icon: Code },
  { name: "Configurações", href: "/settings", icon: Settings },
];

export const Sidebar = ({ isOpen, onToggle, isMobile = false }: SidebarProps) => {
  const { user, signOut } = useAuth();
  const location = useLocation();

  const userInitials = user?.user_metadata?.full_name
    ? user.user_metadata.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.substring(0, 2).toUpperCase() || "U";

  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || "Usuário";
  const userEmail = user?.email || "";

  // On mobile: show full sidebar or nothing. On desktop: toggle between wide and icon.
  const showText = isMobile ? true : isOpen;

  const renderNavItem = (item: typeof navigation[0]) => {
    const isActive = item.href === "/"
      ? location.pathname === "/"
      : location.pathname.startsWith(item.href);

    const link = (
      <NavLink
        to={item.href}
        className={cn(
          "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
          "hover:bg-muted/60",
          isActive ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground"
        )}
      >
        <item.icon className="w-5 h-5 flex-shrink-0" />
        {showText && <span className="text-sm truncate">{item.name}</span>}
      </NavLink>
    );

    if (!showText) {
      return (
        <Tooltip key={item.name}>
          <TooltipTrigger asChild>{link}</TooltipTrigger>
          <TooltipContent side="right">{item.name}</TooltipContent>
        </Tooltip>
      );
    }

    return <div key={item.name}>{link}</div>;
  };

  // Mobile: fixed overlay sidebar
  if (isMobile) {
    return (
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 bg-card border-r border-border flex flex-col transition-transform duration-300",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Logo + Close */}
        <div className="flex items-center justify-between h-16 px-3 border-b border-border">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/70 rounded-lg flex items-center justify-center flex-shrink-0">
              <Zap className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="font-bold text-lg text-foreground truncate">AgênciaIA</h1>
          </div>
          <Button variant="ghost" size="icon" onClick={onToggle} className="h-8 w-8 flex-shrink-0">
            <X className="w-4 h-4" />
          </Button>
        </div>

        <ScrollArea className="flex-1 py-2">
          <nav className="px-2 space-y-1">
            {navigation.map(renderNavItem)}
          </nav>
        </ScrollArea>

        <div className="p-3 border-t border-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-medium text-primary-foreground">{userInitials}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{userName}</p>
              <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0" onClick={signOut}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Desktop: collapsible sidebar
  return (
    <div className={cn(
      "bg-card border-r border-border transition-all duration-300 flex flex-col flex-shrink-0",
      isOpen ? "w-64" : "w-16"
    )}>
      <div className="flex items-center justify-between h-16 px-3 border-b border-border">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/70 rounded-lg flex items-center justify-center flex-shrink-0">
            <Zap className="w-5 h-5 text-primary-foreground" />
          </div>
          {isOpen && (
            <div className="min-w-0">
              <h1 className="font-bold text-lg text-foreground truncate">AgênciaIA</h1>
            </div>
          )}
        </div>
        <Button variant="ghost" size="icon" onClick={onToggle} className="h-8 w-8 flex-shrink-0">
          {isOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </Button>
      </div>

      <ScrollArea className="flex-1 py-2">
        <nav className="px-2 space-y-1">
          {navigation.map(renderNavItem)}
        </nav>
      </ScrollArea>

      <div className="p-3 border-t border-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-medium text-primary-foreground">{userInitials}</span>
          </div>
          {isOpen && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{userName}</p>
              <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
            </div>
          )}
          {isOpen && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0" onClick={signOut}>
                  <LogOut className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Sair</TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>
    </div>
  );
};
