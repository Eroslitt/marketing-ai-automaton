import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  FileText, 
  Search, 
  RefreshCw, 
  Loader2,
  MessageSquare,
  CheckCircle,
  XCircle,
  Clock
} from "lucide-react";

interface AgentLogsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agent: {
    id: string;
    name: string;
    role: string;
  } | null;
}

interface LogEntry {
  id: string;
  conversation_id: string;
  content: string;
  role: string;
  agent_type: string | null;
  created_at: string;
}

const AgentLogsDialog = ({ open, onOpenChange, agent }: AgentLogsDialogProps) => {
  const { user } = useAuth();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    if (open && agent) {
      loadLogs();
    }
  }, [open, agent]);

  const loadLogs = async () => {
    if (!agent) return;
    setLoading(true);

    try {
      const { data: messages, error } = await supabase
        .from('messages')
        .select(`
          id,
          conversation_id,
          content,
          role,
          agent_type,
          created_at,
          metadata
        `)
        .eq('agent_type', agent.id)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setLogs(messages || []);
    } catch (error) {
      console.error('Error loading logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  if (!agent) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Logs do {agent.name}
          </DialogTitle>
          <DialogDescription>
            Histórico de mensagens e ações do agente {agent.role}
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-3 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar nos logs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="success">Sucesso</SelectItem>
              <SelectItem value="pending">Pendente</SelectItem>
              <SelectItem value="failed">Falha</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={loadLogs}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        <ScrollArea className="h-[400px] mt-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">
                {searchQuery ? "Nenhum log encontrado para esta busca" : "Nenhum log disponível"}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-4 rounded-xl border border-border/50 bg-background/50"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant="outline" 
                        className={log.role === 'assistant' ? 'bg-primary/10 text-primary' : 'bg-muted'}
                      >
                        {log.role === 'assistant' ? 'Agente' : 'Lead'}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(log.created_at), { 
                          addSuffix: true, 
                          locale: ptBR 
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    </div>
                  </div>
                  <p className="text-sm text-foreground line-clamp-3">
                    {log.content}
                  </p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>Conversa: {log.conversation_id.slice(0, 8)}...</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        <div className="flex justify-between items-center mt-4 pt-4 border-t border-border/50">
          <p className="text-sm text-muted-foreground">
            {filteredLogs.length} logs encontrados
          </p>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AgentLogsDialog;
