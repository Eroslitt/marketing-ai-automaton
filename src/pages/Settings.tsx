import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { 
  User, Bell, Key, CreditCard, Shield, Save, RefreshCw, CheckCircle
} from "lucide-react";

export const Settings = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState({ name: "", email: "", company: "", phone: "" });
  const [notifications, setNotifications] = useState({ email: true, alerts: true, weekly: false, push: true });
  const [integrations, setIntegrations] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setProfile({
        name: user.user_metadata?.full_name || user.user_metadata?.name || "",
        email: user.email || "",
        company: user.user_metadata?.company || "",
        phone: user.user_metadata?.phone || "",
      });
      loadIntegrations();
    }
  }, [user]);

  const loadIntegrations = async () => {
    const { data } = await supabase.from("integrations").select("*").eq("user_id", user!.id);
    setIntegrations(data || []);
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    const { error } = await supabase.auth.updateUser({
      data: { full_name: profile.name, company: profile.company, phone: profile.phone },
    });
    setSaving(false);
    if (error) { toast.error("Erro ao salvar perfil"); return; }
    toast.success("Perfil atualizado com sucesso!");
  };

  const connectedProviders = integrations.filter(i => i.is_connected);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Configurações</h1>
        <p className="text-muted-foreground">Gerencie suas preferências e integrações</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card className="p-4">
            <h3 className="font-semibold text-foreground mb-4">Seções</h3>
            <nav className="space-y-2">
              {[
                { icon: User, label: "Perfil" },
                { icon: Bell, label: "Notificações" },
                { icon: Key, label: "Integrações" },
              ].map((s) => (
                <button key={s.label} className="w-full flex items-center gap-3 px-3 py-2 text-left rounded-lg hover:bg-muted/60 transition-colors">
                  <s.icon className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-foreground">{s.label}</span>
                </button>
              ))}
            </nav>
          </Card>

          <Card className="p-4 mt-4">
            <div className="flex items-center gap-2 mb-3">
              <CreditCard className="w-4 h-4 text-primary" />
              <h4 className="font-medium text-foreground">Conta</h4>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">{user?.email}</p>
              <p className="text-xs text-muted-foreground">
                Membro desde {user?.created_at ? new Date(user.created_at).toLocaleDateString("pt-BR") : "—"}
              </p>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          {/* Profile */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">Perfil</h3>
            </div>
            <div className="space-y-4">
              {[
                { label: "Nome completo", key: "name" as const, placeholder: "Seu nome" },
                { label: "E-mail", key: "email" as const, placeholder: "email@empresa.com", disabled: true },
                { label: "Empresa", key: "company" as const, placeholder: "Nome da empresa" },
                { label: "Telefone", key: "phone" as const, placeholder: "(11) 99999-9999" },
              ].map((field) => (
                <div key={field.key} className="flex items-center justify-between">
                  <Label className="text-sm font-medium text-foreground">{field.label}</Label>
                  <Input
                    value={profile[field.key]}
                    onChange={(e) => setProfile({ ...profile, [field.key]: e.target.value })}
                    className="max-w-xs"
                    placeholder={field.placeholder}
                    disabled={field.disabled}
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-end pt-4 border-t border-border">
              <Button onClick={handleSaveProfile} disabled={saving} className="gap-2">
                <Save className="w-4 h-4" />
                {saving ? "Salvando..." : "Salvar Perfil"}
              </Button>
            </div>
          </Card>

          {/* Notifications */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Bell className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">Notificações</h3>
            </div>
            <div className="space-y-4">
              {[
                { label: "Notificações por e-mail", key: "email" as const },
                { label: "Alertas de performance", key: "alerts" as const },
                { label: "Relatórios semanais", key: "weekly" as const },
                { label: "Notificações push", key: "push" as const },
              ].map((n) => (
                <div key={n.key} className="flex items-center justify-between">
                  <Label className="text-sm font-medium text-foreground">{n.label}</Label>
                  <Switch
                    checked={notifications[n.key]}
                    onCheckedChange={(v) => setNotifications({ ...notifications, [n.key]: v })}
                  />
                </div>
              ))}
            </div>
          </Card>

          {/* Integrations Status */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Key className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">Integrações</h3>
            </div>
            <div className="space-y-4">
              {connectedProviders.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhuma integração conectada</p>
              ) : (
                connectedProviders.map((i) => (
                  <div key={i.id} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground capitalize">
                      {i.provider.replace(/_/g, " ")}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-1 rounded bg-green-500/10 text-green-500">
                        <CheckCircle className="w-3 h-3 inline mr-1" />Conectado
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Danger Zone */}
          <Card className="p-6 border-destructive/20">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-destructive" />
              <h3 className="text-lg font-semibold text-destructive">Zona de Perigo</h3>
            </div>
            <div className="flex items-center justify-between p-3 bg-destructive/5 rounded-lg">
              <div>
                <p className="text-sm font-medium text-foreground">Sair da Conta</p>
                <p className="text-xs text-muted-foreground">Encerrar sessão atual</p>
              </div>
              <Button variant="destructive" size="sm" onClick={async () => { await supabase.auth.signOut(); }}>
                Sair
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
