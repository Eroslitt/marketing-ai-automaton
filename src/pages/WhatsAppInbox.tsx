import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { 
  MessageSquare, Phone, Video, Paperclip, Smile, Send, Bot, User,
  Clock, CheckCheck, MoreHorizontal, Settings, Zap, Users, TrendingUp, MessageCircle
} from "lucide-react";
import { toast } from "sonner";

export const WhatsAppInbox = () => {
  const [selectedContact, setSelectedContact] = useState(1);
  const [newMessage, setNewMessage] = useState('');
  const [showBotConfig, setShowBotConfig] = useState(false);
  const [showAutoResponse, setShowAutoResponse] = useState(false);

  const conversations = [
    { id: 1, name: "João Silva", company: "Tech Solutions", phone: "+55 11 99999-9999", lastMessage: "Gostaria de saber mais sobre os preços...", timestamp: "14:32", unread: 2, status: "hot", avatar: "JS", isBot: false },
    { id: 2, name: "Maria Santos", company: "Growth Marketing", phone: "+55 21 88888-8888", lastMessage: "Quando podemos agendar uma demo?", timestamp: "13:45", unread: 0, status: "qualified", avatar: "MS", isBot: false },
    { id: 3, name: "Pedro Costa", company: "E-commerce Plus", phone: "+55 31 77777-7777", lastMessage: "Bot: Entendi! Vou conectar você com nossa equipe...", timestamp: "12:20", unread: 1, status: "new", avatar: "PC", isBot: true }
  ];

  const [messages, setMessages] = useState([
    { id: 1, sender: "contact", content: "Olá! Vi vocês no Instagram e fiquei interessado nos serviços de marketing digital.", timestamp: "14:30", isBot: false },
    { id: 2, sender: "bot", content: "Olá João! 👋 Que bom te ver por aqui! Sou o assistente da AgênciaIA. Para te ajudar melhor, você poderia me contar qual é o principal desafio do seu negócio hoje?", timestamp: "14:30", isBot: true },
    { id: 3, sender: "contact", content: "Estou com dificuldades em gerar leads qualificados.", timestamp: "14:31", isBot: false },
    { id: 4, sender: "bot", content: "Entendo perfeitamente! Qual é o seu ticket médio atual e quantos leads qualificados você gostaria de receber por mês?", timestamp: "14:31", isBot: true },
    { id: 5, sender: "contact", content: "Nosso ticket médio é R$ 2.500 e precisamos de pelo menos 50 leads qualificados por mês.", timestamp: "14:32", isBot: false },
    { id: 6, sender: "contact", content: "Gostaria de saber mais sobre os preços...", timestamp: "14:32", isBot: false }
  ]);

  const quickReplies = ["Agendar reunião", "Enviar proposta", "Informações sobre preços", "Conectar com vendedor", "Material educativo"];

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    const now = new Date();
    const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    setMessages(prev => [...prev, { id: prev.length + 1, sender: "agent", content: newMessage, timestamp: time, isBot: false }]);
    setNewMessage('');
    toast.success("Mensagem enviada!");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'hot': return 'bg-destructive/10 text-destructive';
      case 'qualified': return 'bg-primary/10 text-primary';
      case 'new': return 'bg-primary/10 text-primary';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'hot': return 'Quente';
      case 'qualified': return 'Qualificado';
      case 'new': return 'Novo';
      default: return 'Lead';
    }
  };

  const currentContact = conversations.find(c => c.id === selectedContact);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">WhatsApp Inbox</h1>
          <p className="text-muted-foreground">Central de atendimento omnichannel</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2" onClick={() => setShowBotConfig(true)}>
            <Settings className="w-4 h-4" />
            Configurar Bot
          </Button>
          <Button className="gap-2" onClick={() => setShowAutoResponse(true)}>
            <Zap className="w-4 h-4" />
            Auto Resposta
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-primary" />
            <div><p className="text-sm text-muted-foreground">Conversas Ativas</p><p className="text-2xl font-bold text-foreground">47</p></div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-primary" />
            <div><p className="text-sm text-muted-foreground">Bot Atendimentos</p><p className="text-2xl font-bold text-primary">89%</p></div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-500" />
            <div><p className="text-sm text-muted-foreground">Tempo Resposta</p><p className="text-2xl font-bold text-amber-500">1.2min</p></div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            <div><p className="text-sm text-muted-foreground">Conversão</p><p className="text-2xl font-bold text-primary">23%</p></div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
        <Card className="p-0 overflow-hidden">
          <div className="p-4 border-b border-border">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-foreground">Conversas</h3>
            </div>
          </div>
          <div className="overflow-y-auto h-[520px]">
            {conversations.map((conversation) => (
              <div key={conversation.id} onClick={() => setSelectedContact(conversation.id)}
                className={`p-4 border-b border-border cursor-pointer hover:bg-muted/30 transition-colors ${selectedContact === conversation.id ? 'bg-primary/5 border-l-4 border-l-primary' : ''}`}>
                <div className="flex items-start gap-3">
                  <div className="relative">
                    <Avatar className="w-12 h-12"><AvatarFallback>{conversation.avatar}</AvatarFallback></Avatar>
                    {conversation.isBot && (
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                        <Bot className="w-3 h-3 text-primary-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-foreground truncate">{conversation.name}</p>
                      <div className="flex items-center gap-2">
                        {conversation.unread > 0 && <Badge variant="destructive" className="text-xs px-2 py-1">{conversation.unread}</Badge>}
                        <span className="text-xs text-muted-foreground">{conversation.timestamp}</span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{conversation.company}</p>
                    <p className="text-sm text-muted-foreground truncate mb-2">{conversation.lastMessage}</p>
                    <Badge className={getStatusColor(conversation.status)}>{getStatusText(conversation.status)}</Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="lg:col-span-2 p-0 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar><AvatarFallback>{currentContact?.avatar}</AvatarFallback></Avatar>
              <div>
                <p className="font-medium text-foreground">{currentContact?.name}</p>
                <p className="text-sm text-muted-foreground">{currentContact?.company}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => toast.info("Chamada de voz em breve")}><Phone className="w-4 h-4" /></Button>
              <Button variant="ghost" size="sm" onClick={() => toast.info("Videochamada em breve")}><Video className="w-4 h-4" /></Button>
            </div>
          </div>

          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.sender === 'contact' ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.sender === 'contact' ? 'bg-muted text-foreground' : message.isBot ? 'bg-primary/80 text-primary-foreground' : 'bg-primary text-primary-foreground'
                }`}>
                  {message.isBot && <div className="flex items-center gap-1 mb-1"><Bot className="w-3 h-3" /><span className="text-xs opacity-75">Bot</span></div>}
                  <p className="text-sm">{message.content}</p>
                  <div className="flex items-center justify-end gap-1 mt-1">
                    <span className="text-xs opacity-75">{message.timestamp}</span>
                    {message.sender !== 'contact' && <CheckCheck className="w-3 h-3 opacity-75" />}
                  </div>
                </div>
              </div>
            ))}
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
              <Button variant="ghost" size="sm" onClick={() => toast.info("Upload de arquivos em breve")}><Paperclip className="w-4 h-4" /></Button>
              <div className="flex-1">
                <Input value={newMessage} onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Digite sua mensagem..." onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} />
              </div>
              <Button onClick={handleSendMessage} disabled={!newMessage.trim()}><Send className="w-4 h-4" /></Button>
            </div>
          </div>
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
            <Button className="w-full" onClick={() => { toast.success("Configurações salvas!"); setShowBotConfig(false); }}>Salvar Configurações</Button>
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
