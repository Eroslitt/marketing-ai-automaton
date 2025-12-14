import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { 
  Filter, 
  RotateCcw,
  Check
} from "lucide-react";

interface FilterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApplyFilters?: (filters: any) => void;
}

const FilterDialog = ({ open, onOpenChange, onApplyFilters }: FilterDialogProps) => {
  const [filters, setFilters] = useState({
    dateRange: "all",
    status: [] as string[],
    channel: [] as string[],
    agentType: [] as string[],
    scoreMin: 0,
    scoreMax: 100,
    searchTerm: ""
  });

  const statusOptions = [
    { value: 'new', label: 'Novos' },
    { value: 'contacted', label: 'Contactados' },
    { value: 'qualified', label: 'Qualificados' },
    { value: 'negotiating', label: 'Em Negociação' },
    { value: 'won', label: 'Convertidos' },
    { value: 'lost', label: 'Perdidos' }
  ];

  const channelOptions = [
    { value: 'whatsapp', label: 'WhatsApp' },
    { value: 'email', label: 'Email' },
    { value: 'phone', label: 'Telefone' },
    { value: 'website', label: 'Website' }
  ];

  const agentOptions = [
    { value: 'sdr', label: 'SDR' },
    { value: 'closer', label: 'Closer' },
    { value: 'copywriter', label: 'Copywriter' },
    { value: 'cs', label: 'CS' }
  ];

  const toggleArrayValue = (array: string[], value: string) => {
    return array.includes(value)
      ? array.filter(v => v !== value)
      : [...array, value];
  };

  const resetFilters = () => {
    setFilters({
      dateRange: "all",
      status: [],
      channel: [],
      agentType: [],
      scoreMin: 0,
      scoreMax: 100,
      searchTerm: ""
    });
    toast.info("Filtros resetados");
  };

  const applyFilters = () => {
    onApplyFilters?.(filters);
    toast.success("Filtros aplicados");
    onOpenChange(false);
  };

  const activeFiltersCount = [
    filters.dateRange !== "all" ? 1 : 0,
    filters.status.length,
    filters.channel.length,
    filters.agentType.length,
    filters.scoreMin > 0 || filters.scoreMax < 100 ? 1 : 0,
    filters.searchTerm ? 1 : 0
  ].reduce((a, b) => a + b, 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
            {activeFiltersCount > 0 && (
              <Badge variant="secondary">{activeFiltersCount} ativos</Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            Filtre conversas e leads por diversos critérios
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Search */}
          <div className="space-y-2">
            <Label>Buscar</Label>
            <Input
              placeholder="Nome, email, telefone..."
              value={filters.searchTerm}
              onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
            />
          </div>

          {/* Date Range */}
          <div className="space-y-2">
            <Label>Período</Label>
            <Select 
              value={filters.dateRange} 
              onValueChange={(v) => setFilters({ ...filters, dateRange: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todo o período</SelectItem>
                <SelectItem value="today">Hoje</SelectItem>
                <SelectItem value="yesterday">Ontem</SelectItem>
                <SelectItem value="week">Últimos 7 dias</SelectItem>
                <SelectItem value="month">Últimos 30 dias</SelectItem>
                <SelectItem value="quarter">Últimos 90 dias</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Status */}
          <div className="space-y-3">
            <Label>Status do Lead</Label>
            <div className="flex flex-wrap gap-2">
              {statusOptions.map((option) => (
                <Badge
                  key={option.value}
                  variant={filters.status.includes(option.value) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setFilters({ 
                    ...filters, 
                    status: toggleArrayValue(filters.status, option.value) 
                  })}
                >
                  {filters.status.includes(option.value) && (
                    <Check className="h-3 w-3 mr-1" />
                  )}
                  {option.label}
                </Badge>
              ))}
            </div>
          </div>

          {/* Channel */}
          <div className="space-y-3">
            <Label>Canal</Label>
            <div className="flex flex-wrap gap-2">
              {channelOptions.map((option) => (
                <Badge
                  key={option.value}
                  variant={filters.channel.includes(option.value) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setFilters({ 
                    ...filters, 
                    channel: toggleArrayValue(filters.channel, option.value) 
                  })}
                >
                  {filters.channel.includes(option.value) && (
                    <Check className="h-3 w-3 mr-1" />
                  )}
                  {option.label}
                </Badge>
              ))}
            </div>
          </div>

          {/* Agent Type */}
          <div className="space-y-3">
            <Label>Agente Responsável</Label>
            <div className="flex flex-wrap gap-2">
              {agentOptions.map((option) => (
                <Badge
                  key={option.value}
                  variant={filters.agentType.includes(option.value) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setFilters({ 
                    ...filters, 
                    agentType: toggleArrayValue(filters.agentType, option.value) 
                  })}
                >
                  {filters.agentType.includes(option.value) && (
                    <Check className="h-3 w-3 mr-1" />
                  )}
                  {option.label}
                </Badge>
              ))}
            </div>
          </div>

          {/* Score Range */}
          <div className="space-y-3">
            <Label>Score do Lead: {filters.scoreMin} - {filters.scoreMax}</Label>
            <div className="pt-2">
              <Slider
                value={[filters.scoreMin, filters.scoreMax]}
                onValueChange={([min, max]) => setFilters({ 
                  ...filters, 
                  scoreMin: min, 
                  scoreMax: max 
                })}
                min={0}
                max={100}
                step={5}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-between mt-6">
          <Button variant="ghost" onClick={resetFilters} className="gap-2">
            <RotateCcw className="h-4 w-4" />
            Resetar
          </Button>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button onClick={applyFilters} className="gap-2">
              <Filter className="h-4 w-4" />
              Aplicar Filtros
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FilterDialog;
