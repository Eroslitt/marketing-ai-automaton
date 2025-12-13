import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Area, AreaChart } from "recharts";
import { BarChart3, TrendingUp } from "lucide-react";

const SalesMetricsChart = () => {
  const { user } = useAuth();
  const [data, setData] = useState<any[]>([]);
  const [period, setPeriod] = useState("7d");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadChartData();
    }
  }, [user, period]);

  const loadChartData = async () => {
    setLoading(true);
    try {
      const days = period === "7d" ? 7 : period === "30d" ? 30 : 90;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data: metricsData } = await supabase
        .from('sales_metrics')
        .select('*')
        .eq('user_id', user?.id)
        .gte('date', startDate.toISOString().split('T')[0])
        .order('date', { ascending: true });

      if (metricsData && metricsData.length > 0) {
        setData(metricsData.map(m => ({
          date: new Date(m.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
          leads: m.leads_contacted,
          respostas: m.responses_received,
          vendas: m.sales_completed,
          receita: m.revenue
        })));
      } else {
        // Generate sample data for demo
        const sampleData = [];
        for (let i = days - 1; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          sampleData.push({
            date: date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
            leads: Math.floor(Math.random() * 50) + 10,
            respostas: Math.floor(Math.random() * 30) + 5,
            vendas: Math.floor(Math.random() * 10) + 1,
            receita: Math.floor(Math.random() * 5000) + 1000
          });
        }
        setData(sampleData);
      }
    } catch (error) {
      console.error('Error loading chart data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Performance de Vendas
          </CardTitle>
          <CardDescription>
            Métricas consolidadas dos agentes IA
          </CardDescription>
        </div>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">7 dias</SelectItem>
            <SelectItem value="30d">30 dias</SelectItem>
            <SelectItem value="90d">90 dias</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          {loading ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Carregando...
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorVendas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis 
                  dataKey="date" 
                  stroke="hsl(var(--muted-foreground))" 
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))" 
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="leads" 
                  stroke="hsl(var(--primary))" 
                  fillOpacity={1}
                  fill="url(#colorLeads)"
                  name="Leads Contactados"
                />
                <Area 
                  type="monotone" 
                  dataKey="vendas" 
                  stroke="#22c55e" 
                  fillOpacity={1}
                  fill="url(#colorVendas)"
                  name="Vendas Realizadas"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Mini stats */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-border/50">
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">
              {data.reduce((acc, d) => acc + d.leads, 0)}
            </p>
            <p className="text-xs text-muted-foreground">Total Leads</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-500">
              {data.reduce((acc, d) => acc + d.vendas, 0)}
            </p>
            <p className="text-xs text-muted-foreground">Total Vendas</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-amber-500">
              R$ {data.reduce((acc, d) => acc + d.receita, 0).toLocaleString('pt-BR')}
            </p>
            <p className="text-xs text-muted-foreground">Receita Total</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SalesMetricsChart;
