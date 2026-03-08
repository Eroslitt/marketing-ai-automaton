import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { 
  Users, Shield, Crown, Settings, Eye, Clock, CheckCircle
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const UserManagement = () => {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (user) loadProfiles(); }, [user]);

  const loadProfiles = async () => {
    try {
      const { data } = await supabase.from('profiles').select('*').eq('user_id', user!.id);
      setProfiles(data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  const currentProfile = profiles[0];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gerenciamento de Usuários</h1>
          <p className="text-muted-foreground">Perfil e configurações da conta</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            <div><p className="text-sm text-muted-foreground">Perfis</p><p className="text-2xl font-bold text-foreground">{profiles.length}</p></div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <div><p className="text-sm text-muted-foreground">Onboarding</p><p className="text-2xl font-bold text-green-500">{currentProfile?.onboarding_completed ? 'Completo' : 'Pendente'}</p></div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            <div><p className="text-sm text-muted-foreground">Setor</p><p className="text-2xl font-bold text-foreground">{currentProfile?.sector || '-'}</p></div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-500" />
            <div><p className="text-sm text-muted-foreground">Criado em</p><p className="text-lg font-bold text-foreground">{currentProfile ? new Date(currentProfile.created_at).toLocaleDateString('pt-BR') : '-'}</p></div>
          </div>
        </Card>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">Meu Perfil</TabsTrigger>
          <TabsTrigger value="brand">Brand Kit</TabsTrigger>
          <TabsTrigger value="agents">Agentes Selecionados</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card className="p-6">
            {currentProfile ? (
              <div className="space-y-6">
                <div className="flex items-center gap-4 mb-6">
                  <Avatar className="w-16 h-16">
                    <AvatarFallback className="text-xl">{(currentProfile.full_name || user?.email || '?').charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-bold text-foreground">{currentProfile.full_name || 'Sem nome'}</h3>
                    <p className="text-muted-foreground">{user?.email}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { label: "Empresa", value: currentProfile.company },
                    { label: "Setor", value: currentProfile.sector },
                    { label: "Telefone", value: currentProfile.phone },
                    { label: "Website", value: currentProfile.website },
                    { label: "Documento", value: currentProfile.document },
                    { label: "Orçamento Mensal", value: currentProfile.monthly_budget },
                    { label: "Objetivo", value: currentProfile.objective },
                    { label: "Público-Alvo", value: currentProfile.audience },
                  ].map(item => (
                    <div key={item.label}>
                      <p className="text-sm text-muted-foreground">{item.label}</p>
                      <p className="font-medium text-foreground">{item.value || '-'}</p>
                    </div>
                  ))}
                </div>
                {currentProfile.main_challenges && Array.isArray(currentProfile.main_challenges) && currentProfile.main_challenges.length > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Desafios Principais</p>
                    <div className="flex gap-2 flex-wrap">
                      {currentProfile.main_challenges.map((c: string, i: number) => <Badge key={i} variant="outline">{c}</Badge>)}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <Users className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground mb-2">Perfil não configurado</p>
                <p className="text-sm text-muted-foreground">Complete o onboarding para configurar seu perfil</p>
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="brand" className="space-y-6">
          <Card className="p-6">
            {currentProfile?.brand_name ? (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-foreground">Brand Kit</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div><p className="text-sm text-muted-foreground">Nome da Marca</p><p className="font-medium text-foreground">{currentProfile.brand_name}</p></div>
                  <div><p className="text-sm text-muted-foreground">Tom de Voz</p><p className="font-medium text-foreground">{currentProfile.brand_tone || '-'}</p></div>
                </div>
                <div><p className="text-sm text-muted-foreground">Descrição</p><p className="text-foreground">{currentProfile.brand_description || '-'}</p></div>
                {currentProfile.brand_colors && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Cores</p>
                    <div className="flex gap-4">
                      {currentProfile.brand_colors.primary && (
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded border" style={{ backgroundColor: currentProfile.brand_colors.primary }} />
                          <span className="text-sm">{currentProfile.brand_colors.primary}</span>
                        </div>
                      )}
                      {currentProfile.brand_colors.secondary && (
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded border" style={{ backgroundColor: currentProfile.brand_colors.secondary }} />
                          <span className="text-sm">{currentProfile.brand_colors.secondary}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Brand Kit não configurado. Complete o onboarding.</p>
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="agents" className="space-y-6">
          <Card className="p-6">
            {currentProfile?.selected_agents && Array.isArray(currentProfile.selected_agents) && currentProfile.selected_agents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentProfile.selected_agents.map((agentId: string) => (
                  <div key={agentId} className="p-4 border border-border rounded-lg">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-primary/10 text-primary">{agentId}</Badge>
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Nenhum agente selecionado. Complete o onboarding.</p>
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
