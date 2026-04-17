import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from "recharts";
import { Package, Truck, Users, DollarSign, CheckCircle2, Clock, AlertTriangle, Calendar } from "lucide-react";
import { Card } from "@/components/ui/card";
import { StatCard } from "@/components/shared/stat-card";
import { PageHeader } from "@/components/layout/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { kpis, cargasPorMes, pedidosPorRegiao, tipoMercado, cargas, motoristas, veiculos, clientes } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";

const STATUS_COLORS = ["#3b82f6", "#f59e0b", "#10b981", "#8b5cf6"];

export function DashboardGeral() {
  const statusData = [
    { name: "Em trânsito", value: 12, color: "#f59e0b" },
    { name: "Pronta", value: 5, color: "#3b82f6" },
    { name: "Finalizada", value: 31, color: "#10b981" },
  ];

  return (
    <div>
      <PageHeader
        title="Dashboard Geral"
        description="Visão consolidada da operação em tempo real"
      />

      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard label="Pedidos Pendentes" value={kpis.pedidosPendentes} subtitle={`${kpis.pedidosTotal} pedidos no total`} icon={Package} iconColor="blue" />
        <StatCard label="Cargas Ativas" value={kpis.cargasAtivas} subtitle={`${kpis.cargasTotal} cargas no total`} icon={Truck} iconColor="emerald" trend={{ value: 12, direction: "up" }} />
        <StatCard label="Motoristas Ativos" value={kpis.motoristasAtivos} subtitle={`${motoristas.length} cadastrados`} icon={Users} iconColor="violet" />
        <StatCard label="Valor Total" value={formatCurrency(kpis.valorTotal)} subtitle={`${kpis.pesoTotal.toLocaleString("pt-BR")} kg transportados`} icon={DollarSign} iconColor="amber" trend={{ value: 8, direction: "up" }} />
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <StatCard label="Entregas no Prazo" value={kpis.entregasNoPrazo} subtitle={`${((kpis.entregasNoPrazo / kpis.entregasTotal) * 100).toFixed(1)}% de aderência`} icon={CheckCircle2} iconColor="emerald" />
        <StatCard label="Fora do Prazo" value={kpis.entregasForaPrazo} subtitle="Ocorrências registradas" icon={AlertTriangle} iconColor="rose" />
        <StatCard label="Total Entregas" value={kpis.entregasTotal} subtitle="Pedidos finalizados" icon={Clock} iconColor="blue" />
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card className="p-5">
          <h3 className="text-sm font-semibold mb-4">Status das Cargas</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2}>
                {statusData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {statusData.map(s => (
              <div key={s.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-sm" style={{ background: s.color }}></div>{s.name}</div>
                <span className="font-medium">{s.value}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5 col-span-2">
          <h3 className="text-sm font-semibold mb-4">Cargas por Mês</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={cargasPorMes}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="mes" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 6 }} />
              <Bar dataKey="cargas" fill="#1e40af" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card className="p-5">
          <h3 className="text-sm font-semibold mb-4">Pedidos por Região</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={pedidosPorRegiao} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="regiao" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={80} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 6 }} />
              <Bar dataKey="pedidos" fill="#3b82f6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5">
          <h3 className="text-sm font-semibold mb-4">Tipo de Mercado</h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={tipoMercado} dataKey="valor" nameKey="tipo" cx="50%" cy="50%" outerRadius={90} label={{ fontSize: 11 }}>
                {tipoMercado.map((_, i) => <Cell key={i} fill={STATUS_COLORS[i % STATUS_COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card className="p-5 col-span-2">
          <h3 className="text-sm font-semibold mb-4">Cargas recentes</h3>
          <div className="space-y-2">
            {cargas.slice(0, 5).map(c => {
              const motorista = motoristas.find(m => m.id === c.motoristaId);
              const veiculo = veiculos.find(v => v.id === c.veiculoId);
              return (
                <div key={c.id} className="flex items-center gap-3 p-2 rounded hover:bg-slate-50">
                  <div className="w-8 h-8 rounded bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-semibold">
                    <Truck className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium font-mono">{c.numero}</p>
                    <p className="text-xs text-muted-foreground">{motorista?.nome} · {veiculo?.placa} · {c.pedidos.length} pedidos</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{formatCurrency(c.valorTotal)}</p>
                    <StatusBadge status={c.status} />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="text-sm font-semibold mb-4">Top clientes (mês)</h3>
          <div className="space-y-3">
            {clientes.slice(0, 5).map((c, i) => (
              <div key={c.id} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded bg-slate-100 text-slate-700 flex items-center justify-center text-xs font-semibold">{i + 1}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{c.nome}</p>
                  <p className="text-[11px] text-muted-foreground">{c.pedidos} pedidos</p>
                </div>
                <p className="text-sm font-medium">{formatCurrency(c.valorTotal)}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
