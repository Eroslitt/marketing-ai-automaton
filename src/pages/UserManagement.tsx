import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { 
  Users, 
  Shield, 
  Crown,
  UserPlus,
  Settings,
  Building,
  Lock,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  Clock,
  CheckCircle,
  AlertCircle,
  Key
} from "lucide-react";

export const UserManagement = () => {
  const [users] = useState([
    {
      id: 1,
      name: "João Silva",
      email: "joao@empresa.com",
      role: "owner",
      tenant: "Empresa A",
      tenantId: "tenant_1",
      status: "active",
      lastLogin: "2024-01-22 14:30",
      permissions: ["all"],
      avatar: null,
      createdAt: "2024-01-01",
      credits: 1000,
      usage: 250
    },
    {
      id: 2,
      name: "Maria Santos",
      email: "maria@empresa.com", 
      role: "admin",
      tenant: "Empresa A",
      tenantId: "tenant_1",
      status: "active",
      lastLogin: "2024-01-22 09:15",
      permissions: ["campaigns", "analytics", "users"],
      avatar: null,
      createdAt: "2024-01-05",
      credits: 500,
      usage: 120
    },
    {
      id: 3,
      name: "Pedro Costa",
      email: "pedro@agencia.com",
      role: "marketer",
      tenant: "Agência Digital",
      tenantId: "tenant_2", 
      status: "active",
      lastLogin: "2024-01-21 16:45",
      permissions: ["campaigns", "creatives"],
      avatar: null,
      createdAt: "2024-01-10",
      credits: 300,
      usage: 180
    },
    {
      id: 4,
      name: "Ana Lima",
      email: "ana@startup.com",
      role: "viewer",
      tenant: "Startup Tech",
      tenantId: "tenant_3",
      status: "pending",
      lastLogin: null,
      permissions: ["view"],
      avatar: null,
      createdAt: "2024-01-20",
      credits: 100,
      usage: 0
    }
  ]);

  const [tenants] = useState([
    {
      id: "tenant_1",
      name: "Empresa A",
      domain: "empresa-a.com",
      plan: "enterprise",
      status: "active",
      users: 12,
      credits: 5000,
      usage: 2340,
      createdAt: "2024-01-01"
    },
    {
      id: "tenant_2", 
      name: "Agência Digital",
      domain: "agencia.com",
      plan: "pro",
      status: "active",
      users: 8,
      credits: 2000,
      usage: 890,
      createdAt: "2024-01-03"
    },
    {
      id: "tenant_3",
      name: "Startup Tech", 
      domain: "startup.com",
      plan: "starter",
      status: "trial",
      users: 3,
      credits: 500,
      usage: 120,
      createdAt: "2024-01-15"
    }
  ]);

  const roles = {
    owner: { name: "Owner", color: "bg-purple-500/10 text-purple-500", icon: Crown },
    admin: { name: "Admin", color: "bg-primary/10 text-primary", icon: Shield },
    marketer: { name: "Marketer", color: "bg-accent/10 text-accent", icon: Users },
    viewer: { name: "Viewer", color: "bg-muted text-muted-foreground", icon: Eye }
  };

  const plans = {
    starter: { name: "Starter", color: "bg-muted text-muted-foreground" },
    pro: { name: "Pro", color: "bg-primary/10 text-primary" },
    enterprise: { name: "Enterprise", color: "bg-growth/10 text-growth" }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-growth/10 text-growth';
      case 'pending':
        return 'bg-warning/10 text-warning';
      case 'suspended':
        return 'bg-destructive/10 text-destructive';
      case 'trial':
        return 'bg-engagement/10 text-engagement';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return CheckCircle;
      case 'pending':
        return Clock;
      case 'suspended':
        return AlertCircle;
      default:
        return Clock;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gerenciamento de Usuários</h1>
          <p className="text-muted-foreground">Controle multi-tenant, roles e permissões</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2">
            <Building className="w-4 h-4" />
            Gerir Tenants
          </Button>
          <Button className="gap-2">
            <UserPlus className="w-4 h-4" />
            Convidar Usuário
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Total Usuários</p>
              <p className="text-2xl font-bold text-foreground">{users.length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Building className="w-5 h-5 text-growth" />
            <div>
              <p className="text-sm text-muted-foreground">Tenants Ativos</p>
              <p className="text-2xl font-bold text-growth">
                {tenants.filter(t => t.status === 'active').length}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-warning" />
            <div>
              <p className="text-sm text-muted-foreground">Admins</p>
              <p className="text-2xl font-bold text-warning">
                {users.filter(u => u.role === 'admin' || u.role === 'owner').length}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-engagement" />
            <div>
              <p className="text-sm text-muted-foreground">Pendentes</p>
              <p className="text-2xl font-bold text-engagement">
                {users.filter(u => u.status === 'pending').length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList>
          <TabsTrigger value="users">Usuários</TabsTrigger>
          <TabsTrigger value="tenants">Tenants</TabsTrigger>
          <TabsTrigger value="roles">Roles & Permissões</TabsTrigger>
          <TabsTrigger value="audit">Audit Log</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-6">
          {/* Filters */}
          <Card className="p-4">
            <div className="flex items-center gap-4">
              <Select>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Tenant" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {tenants.map(tenant => (
                    <SelectItem key={tenant.id} value={tenant.id}>
                      {tenant.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {Object.entries(roles).map(([key, role]) => (
                    <SelectItem key={key} value={key}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="suspended">Suspenso</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </Card>

          {/* Users Table */}
          <Card className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Usuário</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Tenant</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Role</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Status</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Créditos</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Último Login</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => {
                    const role = roles[user.role as keyof typeof roles];
                    const RoleIcon = role.icon;
                    const StatusIcon = getStatusIcon(user.status);
                    
                    return (
                      <tr key={user.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                        <td className="py-4 px-2">
                          <div className="flex items-center gap-3">
                            <Avatar className="w-10 h-10">
                              <AvatarImage src={user.avatar || undefined} />
                              <AvatarFallback>
                                {user.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-foreground">{user.name}</p>
                              <p className="text-sm text-muted-foreground">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-2 text-sm text-foreground">{user.tenant}</td>
                        <td className="py-4 px-2">
                          <Badge className={role.color}>
                            <RoleIcon className="w-3 h-3 mr-1" />
                            {role.name}
                          </Badge>
                        </td>
                        <td className="py-4 px-2">
                          <Badge className={getStatusColor(user.status)}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {user.status === 'active' ? 'Ativo' :
                             user.status === 'pending' ? 'Pendente' :
                             user.status === 'suspended' ? 'Suspenso' : user.status}
                          </Badge>
                        </td>
                        <td className="py-4 px-2">
                          <div className="text-sm">
                            <p className="font-medium text-foreground">{user.credits - user.usage}</p>
                            <p className="text-muted-foreground">de {user.credits}</p>
                          </div>
                        </td>
                        <td className="py-4 px-2 text-sm text-muted-foreground">
                          {user.lastLogin || 'Nunca'}
                        </td>
                        <td className="py-4 px-2">
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="tenants" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tenants.map((tenant) => {
              const plan = plans[tenant.plan as keyof typeof plans];
              const StatusIcon = getStatusIcon(tenant.status);
              
              return (
                <Card key={tenant.id} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Building className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{tenant.name}</h3>
                        <p className="text-sm text-muted-foreground">{tenant.domain}</p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(tenant.status)}>
                      <StatusIcon className="w-3 h-3 mr-1" />
                      {tenant.status === 'active' ? 'Ativo' :
                       tenant.status === 'trial' ? 'Trial' : tenant.status}
                    </Badge>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Plano:</span>
                      <Badge className={plan.color}>{plan.name}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Usuários:</span>
                      <span className="font-medium text-foreground">{tenant.users}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Créditos:</span>
                      <span className="font-medium text-foreground">
                        {tenant.credits - tenant.usage} / {tenant.credits}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Criado em:</span>
                      <span className="text-sm text-foreground">{tenant.createdAt}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Settings className="w-3 h-3 mr-1" />
                      Configurar
                    </Button>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="w-3 h-3" />
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="roles" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(roles).map(([key, role]) => {
              const RoleIcon = role.icon;
              
              return (
                <Card key={key} className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`p-3 rounded-lg ${role.color}`}>
                      <RoleIcon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{role.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {users.filter(u => u.role === key).length} usuários
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-foreground">Criar Campanhas</span>
                      <Switch checked={key !== 'viewer'} />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-foreground">Ver Analytics</span>
                      <Switch checked={true} />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-foreground">Gerenciar Usuários</span>
                      <Switch checked={key === 'owner' || key === 'admin'} />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-foreground">Configurações</span>
                      <Switch checked={key === 'owner'} />
                    </div>
                  </div>

                  <Button variant="outline" className="w-full mt-4 gap-2">
                    <Key className="w-4 h-4" />
                    Editar Permissões
                  </Button>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="audit" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Log de Auditoria</h3>
            <div className="space-y-4">
              {[
                {
                  user: "João Silva",
                  action: "Criou campanha",
                  resource: "Campanha B2B Tech",
                  timestamp: "2024-01-22 14:30",
                  ip: "192.168.1.100"
                },
                {
                  user: "Maria Santos", 
                  action: "Convidou usuário",
                  resource: "pedro@agencia.com",
                  timestamp: "2024-01-22 09:15",
                  ip: "192.168.1.101"
                },
                {
                  user: "System",
                  action: "Workflow executado",
                  resource: "Prospecção + WhatsApp",
                  timestamp: "2024-01-22 08:00",
                  ip: "system"
                }
              ].map((log, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        <span className="text-primary">{log.user}</span> {log.action.toLowerCase()}
                      </p>
                      <p className="text-xs text-muted-foreground">{log.resource}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">{log.timestamp}</p>
                    <p className="text-xs text-muted-foreground">{log.ip}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};