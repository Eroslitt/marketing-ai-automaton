import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { 
  MessageSquare, 
  Bot, 
  User, 
  Phone, 
  Mail, 
  Zap,
  RefreshCw,
  Eye
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Message {
  id: string;
  role: string;
  content: string;
  agent_type: string | null;
  created_at: string;
  conversation_id: string;
}

interface Conversation {
  id: string;
  channel: string;
  status: string;
  created_at: string;
  lead: {
    name: string;
    phone: string | null;
    email: string | null;
  } | null;
  messages: Message[];
}

const LiveSalesFeed = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConversations();
    
    // Subscribe to realtime updates
    const channel = supabase
      .channel('live-sales')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          const newMessage = payload.new as Message;
          setConversations(prev => 
            prev.map(conv => 
              conv.id === newMessage.conversation_id
                ? { ...conv, messages: [...conv.messages, newMessage] }
                : conv
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const loadConversations = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          id,
          channel,
          status,
          created_at,
          leads:lead_id (name, phone, email),
          messages (id, role, content, agent_type, created_at, conversation_id)
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      
      const formattedConversations = data?.map(conv => ({
        ...conv,
        lead: conv.leads,
        messages: conv.messages || []
      })) || [];
      
      setConversations(formattedConversations);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'whatsapp': return <Phone className="h-4 w-4 text-green-500" />;
      case 'email': return <Mail className="h-4 w-4 text-blue-500" />;
      default: return <MessageSquare className="h-4 w-4 text-primary" />;
    }
  };

  const getAgentBadge = (agentType: string | null) => {
    switch (agentType) {
      case 'sdr':
        return <Badge variant="outline" className="text-xs bg-blue-500/10 text-blue-500 border-blue-500/30">SDR</Badge>;
      case 'closer':
        return <Badge variant="outline" className="text-xs bg-amber-500/10 text-amber-500 border-amber-500/30">Closer</Badge>;
      case 'cs':
        return <Badge variant="outline" className="text-xs bg-green-500/10 text-green-500 border-green-500/30">CS</Badge>;
      default:
        return null;
    }
  };

  const selectedConvo = conversations.find(c => c.id === selectedConversation);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Conversations List */}
      <Card className="lg:col-span-1 border-border/50 bg-card/50 backdrop-blur">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-amber-500" />
              Conversas Ativas
            </CardTitle>
            <CardDescription>
              Vendas em tempo real
            </CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={loadConversations}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px]">
            <div className="space-y-3">
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Carregando...
                </div>
              ) : conversations.length === 0 ? (
                <div className="text-center py-8">
                  <Bot className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">
                    Nenhuma conversa ativa no momento
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Os agentes iniciarão as vendas automaticamente
                  </p>
                </div>
              ) : (
                conversations.map((conv) => (
                  <div
                    key={conv.id}
                    onClick={() => setSelectedConversation(conv.id)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      selectedConversation === conv.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border/50 hover:border-primary/50 bg-background/50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {conv.lead?.name?.charAt(0) || 'L'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-foreground">
                            {conv.lead?.name || 'Lead'}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            {getChannelIcon(conv.channel)}
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(conv.created_at), { 
                                addSuffix: true, 
                                locale: ptBR 
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/30">
                        Ativa
                      </Badge>
                    </div>
                    {conv.messages.length > 0 && (
                      <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
                        {conv.messages[conv.messages.length - 1]?.content}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Conversation Detail */}
      <Card className="lg:col-span-2 border-border/50 bg-card/50 backdrop-blur">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-primary" />
            {selectedConvo ? `Conversa com ${selectedConvo.lead?.name || 'Lead'}` : 'Selecione uma conversa'}
          </CardTitle>
          <CardDescription>
            Acompanhe a negociação em tempo real
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px]">
            {selectedConvo ? (
              <div className="space-y-4">
                {selectedConvo.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-3 ${msg.role === 'assistant' ? '' : 'flex-row-reverse'}`}
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className={msg.role === 'assistant' ? 'bg-primary/10 text-primary' : 'bg-muted'}>
                        {msg.role === 'assistant' ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`max-w-[70%] ${msg.role === 'assistant' ? '' : 'text-right'}`}>
                      <div className="flex items-center gap-2 mb-1">
                        {msg.role === 'assistant' && getAgentBadge(msg.agent_type)}
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(msg.created_at), { 
                            addSuffix: true, 
                            locale: ptBR 
                          })}
                        </span>
                      </div>
                      <div className={`p-3 rounded-xl ${
                        msg.role === 'assistant' 
                          ? 'bg-primary/10 text-foreground' 
                          : 'bg-muted text-foreground'
                      }`}>
                        <p className="text-sm">{msg.content}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <div className="text-center">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                  <p>Selecione uma conversa para visualizar</p>
                </div>
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default LiveSalesFeed;
