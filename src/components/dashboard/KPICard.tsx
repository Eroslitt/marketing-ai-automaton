import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface KPICardProps {
  title: string;
  value: string;
  change: number;
  format?: "currency" | "percentage" | "number";
  icon?: React.ElementType;
}

export const KPICard = ({ title, value, change, format = "number", icon: Icon }: KPICardProps) => {
  const isPositive = change > 0;
  const TrendIcon = isPositive ? TrendingUp : TrendingDown;

  return (
    <Card className="p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
          <p className="text-2xl font-bold text-foreground mt-1">{value}</p>
          
          <div className="flex items-center gap-1 mt-2">
            <TrendIcon className={cn(
              "w-4 h-4",
              isPositive ? "text-growth" : "text-destructive"
            )} />
            <span className={cn(
              "text-sm font-medium",
              isPositive ? "text-growth" : "text-destructive"
            )}>
              {Math.abs(change)}%
            </span>
            <span className="text-sm text-muted-foreground">vs. mês anterior</span>
          </div>
        </div>
        
        {Icon && (
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
            <Icon className="w-6 h-6 text-primary" />
          </div>
        )}
      </div>
    </Card>
  );
};