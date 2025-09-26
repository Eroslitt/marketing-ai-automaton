import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  MessageSquare, 
  Phone, 
  Video,
  Paperclip,
  Smile,
  Send,
  Bot,
  User,
  Clock,
  CheckCheck,
  MoreHorizontal,
  Settings,
  Zap,
  Users,
  TrendingUp,
  MessageCircle
} from "lucide-react";

export const WhatsAppInbox = () => {
  const [selectedContact, setSelectedContact] = useState(1);
  const [newMessage, setNewMessage] = useState('');

  const conversations = [
    {
      id: 1,
      name: "João Silva",
      company: "Tech Solutions",
      phone: "+55 11 99999-9999",
      lastMessage: "Gostaria de saber mais sobre os preços...",
      timestamp: "14:32",
      unread: 2,
      status: "hot",
      avatar: "JS",
      isBot: false
    },
    {
      id: 2,
      name: "Maria Santos",
      company: "Growth Marketing",
      phone: "+55 21 88888-8888",
      lastMessage: "Quando podemos agendar uma demo?",
      timestamp: "13:45",
      unread: 0,
      status: "qualified",
      avatar: "MS",
      isBot: false
    },
    {
      id: 3,
      name: "Pedro Costa",
      company: "E-commerce Plus",
      phone: "+55 31 77777-7777",
      lastMessage: "Bot: Entendi! Vou conectar você com nossa equipe...",
      timestamp: "12:20",
      unread: 1,
      status: "new",
      avatar: "PC",
      isBot: true
    }
  ];

  const messages = [
    {
      id: 1,
      sender: "contact",
      content: "Olá! Vi vocês no Instagram e fiquei interessado nos serviços de marketing digital.",
      timestamp: "14:30",
      isBot: false
    },
    {
      id: 2,
      sender: "bot",
      content: "Olá João! 👋 Que bom te ver por aqui! Sou o assistente da AgênciaIA. Para te ajudar melhor, você poderia me contar qual é o principal desafio do seu negócio hoje?",
      timestamp: "14:30",
      isBot: true
    },
    {
      id: 3,
      sender: "contact",
      content: "Estou com dificuldades em gerar leads qualificados. Nossos anúncios estão trazendo cliques mas poucas conversões.",
      timestamp: "14:31",
      isBot: false
    },
    {
      id: 4,
      sender: "bot",
      content: "Entendo perfeitamente! Esse é um desafio comum. Qual é o seu ticket médio atual e quantos leads qualificados você gostaria de receber por mês?",
      timestamp: "14:31",
      isBot: true
    },
    {
      id: 5,
      sender: "contact",
      content: "Nosso ticket médio é R$ 2.500 e precisamos de pelo menos 50 leads qualificados por mês.",
      timestamp: "14:32",
      isBot: false
    },
    {
      id: 6,
      sender: "contact",
      content: "Gostaria de saber mais sobre os preços...",
      timestamp: "14:32",
      isBot: false
    }
  ];

  const quickReplies = [
    "Agendar reunião",
    "Enviar proposta",
    "Informações sobre preços",
    "Conectar com vendedor",
    "Material educativo"
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'hot':
        return 'bg-destructive/10 text-destructive';
      case 'qualified':
        return 'bg-growth/10 text-growth';
      case 'new':
        return 'bg-primary/10 text-primary';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'hot':
        return 'Quente';
      case 'qualified':
        return 'Qualificado';
      case 'new':
        return 'Novo';
      default:
        return 'Lead';
    }
  };

  const currentContact = conversations.find(c => c.id === selectedContact);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">WhatsApp Inbox</h1>
          <p className="text-muted-foreground">Central de atendimento omnichannel</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2">
            <Settings className="w-4 h-4" />
            Configurar Bot
          </Button>
          <Button className="gap-2">
            <Zap className="w-4 h-4" />
            Auto Resposta
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Conversas Ativas</p>
              <p className="text-2xl font-bold text-foreground">47</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-accent" />
            <div>
              <p className="text-sm text-muted-foreground">Bot Atendimentos</p>
              <p className="text-2xl font-bold text-accent">89%</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-warning" />
            <div>
              <p className="text-sm text-muted-foreground">Tempo Resposta</p>
              <p className="text-2xl font-bold text-warning">1.2min</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-growth" />
            <div>
              <p className="text-sm text-muted-foreground">Conversão</p>
              <p className="text-2xl font-bold text-growth">23%</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Chat Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
        {/* Conversations List */}
        <Card className="p-0 overflow-hidden">
          <div className="p-4 border-b border-border">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-foreground">Conversas</h3>
            </div>
          </div>
          
          <div className="overflow-y-auto h-[520px]">
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => setSelectedContact(conversation.id)}
                className={`p-4 border-b border-border cursor-pointer hover:bg-muted/30 transition-colors ${
                  selectedContact === conversation.id ? 'bg-primary/5 border-l-4 border-l-primary' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="relative">
                    <Avatar className="w-12 h-12">
                      <AvatarFallback>{conversation.avatar}</AvatarFallback>
                    </Avatar>
                    {conversation.isBot && (
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-accent rounded-full flex items-center justify-center">
                        <Bot className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-foreground truncate">{conversation.name}</p>
                      <div className="flex items-center gap-2">
                        {conversation.unread > 0 && (
                          <Badge variant="destructive" className="text-xs px-2 py-1">
                            {conversation.unread}
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground">{conversation.timestamp}</span>
                      </div>
                    </div>
                    
                    <p className="text-xs text-muted-foreground mb-2">{conversation.company}</p>
                    
                    <p className="text-sm text-muted-foreground truncate mb-2">
                      {conversation.lastMessage}
                    </p>
                    
                    <Badge className={getStatusColor(conversation.status)}>
                      {getStatusText(conversation.status)}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Chat Messages */}
        <Card className="lg:col-span-2 p-0 overflow-hidden flex flex-col">
          {/* Chat Header */}
          <div className="p-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarFallback>{currentContact?.avatar}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-foreground">{currentContact?.name}</p>
                <p className="text-sm text-muted-foreground">{currentContact?.company}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm">
                <Phone className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Video className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'contact' ? 'justify-start' : 'justify-end'}`}
              >
                <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.sender === 'contact' 
                    ? 'bg-muted text-foreground' 
                    : message.isBot
                    ? 'bg-accent text-white'
                    : 'bg-primary text-primary-foreground'
                }`}>
                  {message.isBot && (
                    <div className="flex items-center gap-1 mb-1">
                      <Bot className="w-3 h-3" />
                      <span className="text-xs opacity-75">Bot</span>
                    </div>
                  )}
                  <p className="text-sm">{message.content}</p>
                  <div className="flex items-center justify-end gap-1 mt-1">
                    <span className="text-xs opacity-75">{message.timestamp}</span>
                    {message.sender !== 'contact' && <CheckCheck className="w-3 h-3 opacity-75" />}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Replies */}
          <div className="px-4 py-2 border-t border-border">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {quickReplies.map((reply, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="whitespace-nowrap"
                  onClick={() => setNewMessage(reply)}
                >
                  {reply}
                </Button>
              ))}
            </div>
          </div>

          {/* Message Input */}
          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm">
                <Paperclip className="w-4 h-4" />
              </Button>
              <div className="flex-1 relative">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Digite sua mensagem..."
                  className="pr-10"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2"
                >
                  <Smile className="w-4 h-4" />
                </Button>
              </div>
              <Button>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};