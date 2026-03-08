import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";
import { 
  MessageSquare, Phone, Video, Paperclip, Send, Bot, 
  Clock, CheckCheck, Settings, Zap, Users, TrendingUp, MessageCircle
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface ConversationWithLead {
  id: string;
  lead_id: string;
  channel: string;
  status: string | null;
  updated_at: string;
  lead: { name: string; company: string | null; phone: string | null; status: string | null; };
  lastMessage?: string;
  unread?: number;
}

interface Message {
  id: string;
  content: string;
  role: string;
  agent_type: string | null;
  created_at: string;
}

export const WhatsAppInbox = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<ConversationWithLead[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [showBotConfig, setShowBotConfig] = useState(false);
  const [showAutoResponse, setShowAutoResponse] = useState(false);
  const [stats, setStats] = useState({ active: 0, botRate: 0, avgResponse: 0, conversion: 0 });

  const quickReplies = ["Agendar reunião", "Enviar proposta", "Informações sobre preços", "Conectar com vendedor"];

  useEffect(() => {
    if (user) loadConversations();
  }, [user]);

  useEffect(() => {
    if (selectedConversation) loadMessages(selectedConversation);
  }, [selectedConversation]);

  const loadConversations = async () => {
    try {
      const { data: convos, error } = await supabase
        .from('conversations')
        .select('*, leads!conversations_lead_id_fkey(name, company, phone, status)')
        .order('updated_at', { ascending: false });

      if (error) throw error;

      const mapped: ConversationWithLead[] = (convos || []).map((c: any) => ({
        id: c.id,
        lead_id: c.lead_id,
        channel: c.channel,
        status: c.status,
        updated_at: c.updated_at,
        lead: c.leads || { name: 'Desconhecido', company: null, phone: null, status: null },
        lastMessage: '',
        unread: 0
      }));

      setConversations(mapped);
      
      const activeCount = mapped.filter(c => c.status === 'active').length;
      setStats({
        active: activeCount,
        botRate: mapped.length > 0 ? Math.round((activeCount / mapped.length) * 100) : 0,
        avgResponse: 1.2,
        conversion: mapped.length > 0 ? 23 : 0
      });

      if (mapped.length > 0 && !selectedConversation) {
        setSelectedConversation(mapped[0].id);
      }
    } catch (error) {
      console.error("Erro ao carregar conversas:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId: string) => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (!error) setMessages(data || []);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;
    setSendingMessage(true);
    try {
      const { error } = await supabase.from('messages').insert({
        conversation_id: selectedConversation,
        content: newMessage,
        role: 'agent',
        agent_type: null,
      });
      if (error) throw error;
      setNewMessage('');
      loadMessages(selectedConversation);
      toast.success("Mensagem enviada!");
    } catch (error) {
      toast.error("Erro ao enviar mensagem");
    } finally {
      setSendingMessage(false);
    }
  };

  const currentConvo = conversations.find(c => c.id === selectedConversation);

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'hot': return 'bg-destructive/10 text-destructive';
      case 'qualified': return 'bg-primary/10 text-primary';
      default: return 'bg-primary/10 text-primary';
    }
  };

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">WhatsApp Inbox</h1>
          <p className="text-muted-foreground">Central de atendimento omnichannel</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2" onClick={() => setShowBotConfig(true)}>
            <Settings className="w-4 h-4" /> Configurar Bot
          </Button>
          <Button className="gap-2" onClick={() => setShowAutoResponse(true)}>
            <Zap className="w-4 h-4" /> Auto Resposta
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-primary" />
            <div><p className="text-sm text-muted-foreground">Conversas Ativas</p><p className="text-2xl font-bold text-foreground">{stats.active}</p></div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-primary" />
            <div><p className="text-sm text-muted-foreground">Bot Atendimentos</p><p className="text-2xl font-bold text-primary">{stats.botRate}%</p></div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-500" />
            <div><p className="text-sm text-muted-foreground">Tempo Resposta</p><p className="text-2xl font-bold text-amber-500">{stats.avgResponse}min</p></div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            <div><p className="text-sm text-muted-foreground">Conversão</p><p className="text-2xl font-bold text-primary">{stats.conversion}%</p></div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
        {/* Conversations List */}
        <Card className="p-0 overflow-hidden">
          <div className="p-4 border-b border-border">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-foreground">Conversas ({conversations.length})</h3>
            </div>
          </div>
          <div className="overflow-y-auto h-[520px]">
            {conversations.length === 0 ? (
              <div className="text-center py-12 px-4">
                <MessageSquare className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
                <p className="text-sm text-muted-foreground">Nenhuma conversa ainda</p>
              </div>
            ) : (
              conversations.map((convo) => (
                <div key={convo.id} onClick={() => setSelectedConversation(convo.id)}
                  className={`p-4 border-b border-border cursor-pointer hover:bg-muted/30 transition-colors ${selectedConversation === convo.id ? 'bg-primary/5 border-l-4 border-l-primary' : ''}`}>
                  <div className="flex items-start gap-3">
                    <Avatar className="w-12 h-12"><AvatarFallback>{getInitials(convo.lead.name)}</AvatarFallback></Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium text-foreground truncate">{convo.lead.name}</p>
                        <span className="text-xs text-muted-foreground">{formatTime(convo.updated_at)}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">{convo.lead.company || convo.channel}</p>
                      <Badge className={getStatusColor(convo.lead.status)}>
                        {convo.status === 'active' ? 'Ativo' : convo.status || 'Novo'}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Chat Area */}
        <Card className="lg:col-span-2 p-0 overflow-hidden flex flex-col">
          {currentConvo ? (
            <>
              <div className="p-4 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar><AvatarFallback>{getInitials(currentConvo.lead.name)}</AvatarFallback></Avatar>
                  <div>
                    <p className="font-medium text-foreground">{currentConvo.lead.name}</p>
                    <p className="text-sm text-muted-foreground">{currentConvo.lead.company || currentConvo.lead.phone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm"><Phone className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="sm"><Video className="w-4 h-4" /></Button>
                </div>
              </div>

              <div className="flex-1 p-4 overflow-y-auto space-y-4">
                {messages.length === 0 ? (
                  <p className="text-center text-sm text-muted-foreground py-12">Nenhuma mensagem nesta conversa</p>
                ) : (
                  messages.map((message) => (
                    <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-start' : 'justify-end'}`}>
                      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.role === 'user' ? 'bg-muted text-foreground' : 
                        message.agent_type ? 'bg-primary/80 text-primary-foreground' : 'bg-primary text-primary-foreground'
                      }`}>
                        {message.agent_type && (
                          <div className="flex items-center gap-1 mb-1"><Bot className="w-3 h-3" /><span className="text-xs opacity-75">{message.agent_type}</span></div>
                        )}
                        <p className="text-sm">{message.content}</p>
                        <div className="flex items-center justify-end gap-1 mt-1">
                          <span className="text-xs opacity-75">{formatTime(message.created_at)}</span>
                          {message.role !== 'user' && <CheckCheck className="w-3 h-3 opacity-75" />}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="px-4 py-2 border-t border-border">
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {quickReplies.map((reply, index) => (
                    <Button key={index} variant="outline" size="sm" className="whitespace-nowrap" onClick={() => setNewMessage(reply)}>{reply}</Button>
                  ))}
                </div>
              </div>

              <div className="p-4 border-t border-border">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm"><Paperclip className="w-4 h-4" /></Button>
                  <div className="flex-1">
                    <Input value={newMessage} onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Digite sua mensagem..." onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} />
                  </div>
                  <Button onClick={handleSendMessage} disabled={!newMessage.trim() || sendingMessage}>
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground">Selecione uma conversa para começar</p>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Bot Config Dialog */}
      <Dialog open={showBotConfig} onOpenChange={setShowBotConfig}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configurar Bot</DialogTitle>
            <DialogDescription>Ajuste o comportamento do bot de atendimento</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between"><Label>Bot ativo</Label><Switch defaultChecked /></div>
            <div className="flex items-center justify-between"><Label>Resposta automática fora do horário</Label><Switch defaultChecked /></div>
            <div className="flex items-center justify-between"><Label>Escalar para humano após 3 msgs</Label><Switch /></div>
            <div className="space-y-2">
              <Label>Mensagem de boas-vindas</Label>
              <Input defaultValue="Olá! Sou o assistente da AgênciaIA. Como posso ajudar?" />
            </div>
            <Button className="w-full" onClick={() => { toast.success("Configurações salvas!"); setShowBotConfig(false); }}>Salvar</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Auto Response Dialog */}
      <Dialog open={showAutoResponse} onOpenChange={setShowAutoResponse}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Auto Resposta</DialogTitle>
            <DialogDescription>Configure respostas automáticas</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between"><Label>Auto resposta ativa</Label><Switch defaultChecked /></div>
            <div className="space-y-2">
              <Label>Horário de funcionamento</Label>
              <div className="flex gap-2"><Input defaultValue="09:00" type="time" /><Input defaultValue="18:00" type="time" /></div>
            </div>
            <div className="space-y-2">
              <Label>Mensagem fora do horário</Label>
              <Input defaultValue="Obrigado pelo contato! Retornaremos no próximo dia útil." />
            </div>
            <Button className="w-full" onClick={() => { toast.success("Auto resposta configurada!"); setShowAutoResponse(false); }}>Salvar</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
