import { Menu, Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface HeaderProps {
  onMenuClick: () => void;
}

export const Header = ({ onMenuClick }: HeaderProps) => {
  return (
    <header className="h-16 bg-card border-b border-border flex items-center px-6 gap-4">
      <Button
        variant="ghost"
        size="sm"
        onClick={onMenuClick}
        className="lg:hidden"
      >
        <Menu className="w-5 h-5" />
      </Button>

      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar campanhas, criativos..."
            className="pl-10"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm">
          <Bell className="w-5 h-5" />
        </Button>
      </div>
    </header>
  );
};