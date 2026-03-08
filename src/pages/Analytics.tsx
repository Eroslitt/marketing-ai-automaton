import { useState, useEffect, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell, LineChart, Line, Legend
} from "recharts";
import {
  BarChart3, TrendingUp, TrendingDown, Users, DollarSign, Target,
  Download, Eye, MousePointer, ShoppingCart, UserCheck, Zap,
  ArrowUpRight, ArrowDownRight, AlertTriangle, Clock, RefreshCw
} from "lucide-react";

interface SalesMetric {
  date: string;
  leads_contacted: number | null;
  responses_received: number | null;
  sales_completed: number | null;
  revenue: number | null;
}

interface Campaign {
  id: string;
  name: string;
  status: string | null;
  budget_total: number | null;
  budget_spent: number | null;
  start_date: string | null;
  created_at: string;
}

interface Lead {
  id: string;
  status: string | null;
  source: string | null;
  score: number | null;
  created_at: string;
}

const COLORS = [
  "hsl(var(--primary))",
  "hsl(142, 71%, 45%)",
  "hsl(38, 92%, 50%)",
  "hsl(262, 83%, 58%)",
  "hsl(199, 89%, 48%)",
  "hsl(346, 77%, 50%)"
];

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

export const Analytics = () => {
  const { user } = useAuth();
  const [period, setPeriod] = useState("30d");
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<SalesMetric[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);

  const days = period === "7d" ? 7 : period === "30d" ? 30 : period === "90d" ? 90 : 365;

  useEffect(() => {
    if (user) loadAll();
  }, [user, period]);

  const loadAll = async () => {
    setLoading(true);
    const start = new Date();
    start.setDate(start.getDate() - days);
    const startStr = start.toISOString();

    const [mRes, cRes, lRes] = await Promise.all([
      supabase.from("sales_metrics").select("*").eq("user_id", user!.id)
        .gte("date", startStr.split("T")[0]).order("date", { ascending: true }),
      supabase.from("campaigns").select("*").eq("user_id", user!.id)
        .gte("created_at", startStr).order("created_at", { ascending: false }),
      supabase.from("leads").select("*").eq("user_id", user!.id)
        .gte("created_at", startStr).order("created_at", { ascending: false }),
    ]);

    setMetrics(mRes.data || []);
    setCampaigns(cRes.data || []);
    setLeads(lRes.data || []);
    setLoading(false);
  };

  // ── Computed KPIs ──
  const kpis = useMemo(() => {
    const totalLeads = leads.length;
    const totalRevenue = metrics.reduce((s, m) => s + (m.revenue || 0), 0);
    const totalSales = metrics.reduce((s, m) => s + (m.sales_completed || 0), 0);
    const totalContacted = metrics.reduce((s, m) => s + (m.leads_contacted || 0), 0);
    const totalResponses = metrics.reduce((s, m) => s + (m.responses_received || 0), 0);
    const responseRate = totalContacted > 0 ? Math.round((totalResponses / totalContacted) * 100) : 0;
    const totalSpent = campaigns.reduce((s, c) => s + (c.budget_spent || 0), 0);
    const roi = totalSpent > 0 ? Math.round(((totalRevenue - totalSpent) / totalSpent) * 100) : 0;

    return { totalLeads, totalRevenue, totalSales, totalContacted, responseRate, totalSpent, roi };
  }, [metrics, campaigns, leads]);

  // ── Chart data ──
  const timeSeriesData = useMemo(() =>
    metrics.map(m => ({
      date: new Date(m.date).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }),
      leads: m.leads_contacted || 0,
      respostas: m.responses_received || 0,
      vendas: m.sales_completed || 0,
      receita: m.revenue || 0,
    })), [metrics]);

  const leadsByStatus = useMemo(() => {
    const map: Record<string, number> = {};
    leads.forEach(l => { map[l.status || "new"] = (map[l.status || "new"] || 0) + 1; });
    return Object.entries(map).map(([name, value]) => ({ name: statusLabel(name), value }));
  }, [leads]);

  const leadsBySource = useMemo(() => {
    const map: Record<string, number> = {};
    leads.forEach(l => { map[l.source || "outro"] = (map[l.source || "outro"] || 0) + 1; });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [leads]);

  const campaignPerformance = useMemo(() =>
    campaigns.map(c => ({
      name: c.name.length > 20 ? c.name.slice(0, 20) + "…" : c.name,
      gasto: c.budget_spent || 0,
      orcamento: c.budget_total || 0,
    })), [campaigns]);

  const funnelData = useMemo(() => {
    const contacted = kpis.totalContacted;
    const responses = metrics.reduce((s, m) => s + (m.responses_received || 0), 0);
    const qualified = leads.filter(l => l.status === "qualified" || l.status === "hot").length;
    const sales = kpis.totalSales;
    return [
      { stage: "Leads Captados", value: kpis.totalLeads },
      { stage: "Contactados", value: contacted },
      { stage: "Respostas", value: responses },
      { stage: "Qualificados", value: qualified },
      { stage: "Vendas", value: sales },
    ];
  }, [kpis, metrics, leads]);

  const handleExport = () => {
    const rows = [
      ["Data", "Leads", "Respostas", "Vendas", "Receita"],
      ...timeSeriesData.map(d => [d.date, d.leads, d.respostas, d.vendas, d.receita])
    ];
    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `analytics-${period}.csv`; a.click();
    toast.success("Relatório exportado!");
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28" />)}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  const hasData = metrics.length > 0 || leads.length > 0 || campaigns.length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Analytics & Insights</h1>
          <p className="text-muted-foreground">Dados reais de vendas, leads e campanhas</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Últimos 7 dias</SelectItem>
              <SelectItem value="30d">Últimos 30 dias</SelectItem>
              <SelectItem value="90d">Últimos 90 dias</SelectItem>
              <SelectItem value="1y">Último ano</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={loadAll}><RefreshCw className="w-4 h-4" /></Button>
          <Button variant="outline" className="gap-2" onClick={handleExport}>
            <Download className="w-4 h-4" /> Exportar
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: "Receita Total", value: formatCurrency(kpis.totalRevenue), icon: DollarSign, color: "text-green-500", bg: "bg-green-500/10" },
          { title: "Total Leads", value: kpis.totalLeads.toString(), icon: Users, color: "text-primary", bg: "bg-primary/10" },
          { title: "Vendas Realizadas", value: kpis.totalSales.toString(), icon: ShoppingCart, color: "text-amber-500", bg: "bg-amber-500/10" },
          { title: "ROI", value: `${kpis.roi}%`, icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-500/10" },
        ].map((kpi) => (
          <Card key={kpi.title} className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{kpi.title}</p>
                <p className="text-2xl font-bold text-foreground mt-1">{kpi.value}</p>
              </div>
              <div className={`p-3 rounded-xl ${kpi.bg}`}>
                <kpi.icon className={`h-6 w-6 ${kpi.color}`} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {!hasData && (
        <Card className="p-12 text-center">
          <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">Sem dados no período</h3>
          <p className="text-muted-foreground">Crie campanhas, leads e registre vendas para ver os analytics.</p>
        </Card>
      )}

      {hasData && (
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-muted/50 p-1 flex-wrap">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="leads">Leads</TabsTrigger>
            <TabsTrigger value="campaigns">Campanhas</TabsTrigger>
            <TabsTrigger value="funnel">Funil</TabsTrigger>
          </TabsList>

          {/* ── Overview ── */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2 p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" /> Performance ao Longo do Tempo
                </h3>
                {timeSeriesData.length > 0 ? (
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={timeSeriesData}>
                        <defs>
                          <linearGradient id="gLeads" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="gVendas" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                        <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                        <Legend />
                        <Area type="monotone" dataKey="leads" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#gLeads)" name="Leads" />
                        <Area type="monotone" dataKey="vendas" stroke="#22c55e" fillOpacity={1} fill="url(#gVendas)" name="Vendas" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                ) : <EmptyChart />}
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Receita Diária</h3>
                {timeSeriesData.length > 0 ? (
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={timeSeriesData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                        <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} />
                        <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} formatter={(v: number) => formatCurrency(v)} />
                        <Bar dataKey="receita" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Receita" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : <EmptyChart />}
              </Card>
            </div>

            {/* Mini stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Contactados", value: kpis.totalContacted, icon: MousePointer },
                { label: "Taxa Resposta", value: `${kpis.responseRate}%`, icon: Eye },
                { label: "Gasto Total", value: formatCurrency(kpis.totalSpent), icon: DollarSign },
                { label: "Campanhas", value: campaigns.length, icon: Target },
              ].map((m, i) => (
                <Card key={i} className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <m.icon className="w-4 h-4 text-primary" />
                    <span className="text-xs text-muted-foreground">{m.label}</span>
                  </div>
                  <p className="text-lg font-bold text-foreground">{m.value}</p>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* ── Leads ── */}
          <TabsContent value="leads" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Leads por Status</h3>
                {leadsByStatus.length > 0 ? (
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={leadsByStatus} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, value }) => `${name}: ${value}`}>
                          {leadsByStatus.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : <EmptyChart />}
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Leads por Fonte</h3>
                {leadsBySource.length > 0 ? (
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={leadsBySource} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                        <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <YAxis type="category" dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} width={80} />
                        <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                        <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} name="Leads" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : <EmptyChart />}
              </Card>
            </div>

            {/* Lead score distribution */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Top Leads por Score</h3>
              <div className="space-y-3">
                {leads.sort((a, b) => (b.score || 0) - (a.score || 0)).slice(0, 10).map(l => (
                  <div key={l.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                        {(l.score || 0)}
                      </div>
                      <span className="text-sm font-medium text-foreground">{(l as any).name || "Lead"}</span>
                    </div>
                    <Badge variant="outline">{statusLabel(l.status || "new")}</Badge>
                  </div>
                ))}
                {leads.length === 0 && <p className="text-muted-foreground text-sm text-center py-4">Nenhum lead no período</p>}
              </div>
            </Card>
          </TabsContent>

          {/* ── Campaigns ── */}
          <TabsContent value="campaigns" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Orçamento vs Gasto por Campanha</h3>
              {campaignPerformance.length > 0 ? (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={campaignPerformance}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                      <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} formatter={(v: number) => formatCurrency(v)} />
                      <Legend />
                      <Bar dataKey="orcamento" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Orçamento" />
                      <Bar dataKey="gasto" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Gasto" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : <EmptyChart />}
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Detalhes das Campanhas</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Campanha</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Status</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Orçamento</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Gasto</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">% Utilizado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {campaigns.map(c => {
                      const pct = c.budget_total ? Math.round(((c.budget_spent || 0) / c.budget_total) * 100) : 0;
                      return (
                        <tr key={c.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                          <td className="py-3 px-2 font-medium text-foreground">{c.name}</td>
                          <td className="py-3 px-2">
                            <Badge variant="outline" className={c.status === "active" ? "text-green-500 border-green-500/30" : ""}>{c.status || "draft"}</Badge>
                          </td>
                          <td className="py-3 px-2 text-foreground">{formatCurrency(c.budget_total || 0)}</td>
                          <td className="py-3 px-2 text-foreground">{formatCurrency(c.budget_spent || 0)}</td>
                          <td className="py-3 px-2">
                            <div className="flex items-center gap-2">
                              <div className="w-20 bg-muted rounded-full h-2">
                                <div className="bg-primary h-2 rounded-full" style={{ width: `${Math.min(pct, 100)}%` }} />
                              </div>
                              <span className="text-sm text-muted-foreground">{pct}%</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {campaigns.length === 0 && (
                      <tr><td colSpan={5} className="py-8 text-center text-muted-foreground">Nenhuma campanha no período</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>

          {/* ── Funnel ── */}
          <TabsContent value="funnel" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-6">Funil de Conversão</h3>
              <div className="space-y-3">
                {funnelData.map((stage, index) => {
                  const maxVal = Math.max(...funnelData.map(f => f.value), 1);
                  const pct = Math.round((stage.value / maxVal) * 100);
                  return (
                    <div key={stage.stage}>
                      <div className="flex items-center justify-between p-4 rounded-lg border bg-gradient-to-r from-primary/10 to-transparent">
                        <div className="flex items-center gap-4">
                          <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{stage.stage}</p>
                            <p className="text-sm text-muted-foreground">{stage.value.toLocaleString("pt-BR")}</p>
                          </div>
                        </div>
                        <div className="w-40">
                          <div className="w-full bg-muted rounded-full h-2.5">
                            <div className="bg-primary h-2.5 rounded-full transition-all" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      </div>
                      {index < funnelData.length - 1 && (
                        <div className="flex justify-center my-1">
                          <div className="w-0.5 h-3 bg-border" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Funil Visual</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={funnelData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                    <XAxis dataKey="stage" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
                    <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Quantidade" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

function EmptyChart() {
  return (
    <div className="h-72 flex items-center justify-center bg-muted/20 rounded-lg">
      <p className="text-muted-foreground text-sm">Sem dados suficientes para gerar gráfico</p>
    </div>
  );
}

function statusLabel(s: string) {
  const map: Record<string, string> = {
    new: "Novo", qualified: "Qualificado", contacted: "Contactado",
    hot: "Quente", cold: "Frio", won: "Ganho", lost: "Perdido"
  };
  return map[s] || s;
}
