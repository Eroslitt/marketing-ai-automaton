import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { 
  Settings as SettingsIcon,
  User,
  Bell,
  Palette,
  Key,
  CreditCard,
  Shield
} from "lucide-react";

export const Settings = () => {
  const settingsSections = [
    {
      id: "profile",
      title: "Perfil",
      icon: User,
      items: [
        { label: "Nome completo", type: "input", value: "João Silva" },
        { label: "E-mail", type: "input", value: "joao@empresa.com" },
        { label: "Empresa", type: "input", value: "Minha Empresa LTDA" },
        { label: "Telefone", type: "input", value: "(11) 99999-9999" }
      ]
    },
    {
      id: "notifications",
      title: "Notificações",
      icon: Bell,
      items: [
        { label: "Notificações por e-mail", type: "switch", value: true },
        { label: "Alertas de performance", type: "switch", value: true },
        { label: "Relatórios semanais", type: "switch", value: false },
        { label: "Notificações push", type: "switch", value: true }
      ]
    },
    {
      id: "integrations",
      title: "Integrações",
      icon: Key,
      items: [
        { label: "Meta Ads", type: "status", value: "Conectado", status: "connected" },
        { label: "Google Ads", type: "status", value: "Não conectado", status: "disconnected" },
        { label: "WhatsApp Business", type: "status", value: "Conectado", status: "connected" },
        { label: "HubSpot CRM", type: "status", value: "Não conectado", status: "disconnected" }
      ]
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Configurações</h1>
        <p className="text-muted-foreground">Gerencie suas preferências e integrações</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings Navigation */}
        <div className="lg:col-span-1">
          <Card className="p-4">
            <h3 className="font-semibold text-foreground mb-4">Seções</h3>
            <nav className="space-y-2">
              {settingsSections.map((section) => (
                <button
                  key={section.id}
                  className="w-full flex items-center gap-3 px-3 py-2 text-left rounded-lg hover:bg-muted/60 transition-colors"
                >
                  <section.icon className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-foreground">{section.title}</span>
                </button>
              ))}
            </nav>
          </Card>
          
          {/* Plan Info */}
          <Card className="p-4 mt-4">
            <div className="flex items-center gap-2 mb-3">
              <CreditCard className="w-4 h-4 text-primary" />
              <h4 className="font-medium text-foreground">Plano Atual</h4>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-primary">Pro</p>
              <p className="text-xs text-muted-foreground">R$ 497/mês</p>
              <p className="text-xs text-muted-foreground">Próxima cobrança: 15/02/2024</p>
            </div>
            <Button variant="outline" size="sm" className="w-full mt-3">
              Gerenciar Plano
            </Button>
          </Card>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-2 space-y-6">
          {settingsSections.map((section) => (
            <Card key={section.id} className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <section.icon className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold text-foreground">{section.title}</h3>
              </div>
              
              <div className="space-y-4">
                {section.items.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <Label className="text-sm font-medium text-foreground">
                      {item.label}
                    </Label>
                    
                    {item.type === 'input' && (
                      <Input
                        defaultValue={item.value as string}
                        className="max-w-xs"
                      />
                    )}
                    
                    {item.type === 'switch' && (
                      <Switch defaultChecked={item.value as boolean} />
                    )}
                    
                    {item.type === 'status' && (
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-1 rounded ${
                          (item as any).status === 'connected' 
                            ? 'bg-growth/10 text-growth' 
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          {item.value as string}
                        </span>
                        <Button variant="outline" size="sm">
                          {(item as any).status === 'connected' ? 'Configurar' : 'Conectar'}
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="flex justify-end pt-4 border-t border-border">
                <Button>Salvar Alterações</Button>
              </div>
            </Card>
          ))}
          
          {/* Danger Zone */}
          <Card className="p-6 border-destructive/20">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-destructive" />
              <h3 className="text-lg font-semibold text-destructive">Zona de Perigo</h3>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-destructive/5 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-foreground">Excluir Conta</p>
                  <p className="text-xs text-muted-foreground">
                    Esta ação não pode ser desfeita. Todos os dados serão perdidos.
                  </p>
                </div>
                <Button variant="destructive" size="sm">
                  Excluir
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};