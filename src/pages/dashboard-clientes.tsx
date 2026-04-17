import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Package, DollarSign, Weight, CheckCircle2 } from "lucide-react";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { clientes, pedidos } from "@/lib/mock-data";
import { formatCurrency, cn } from "@/lib/utils";

const STATUS_COLORS = ["#10b981", "#f59e0b", "#3b82f6", "#8b5cf6", "#ec4899"];

export function DashboardClientes() {
  const [selected, setSelected] = useState(clientes[0].id);
  const [busca, setBusca] = useState("");
  const cliente = clientes.find(c => c.id === selected)!;
  const pedidosCliente = pedidos.filter(p => p.cnpjCliente === cliente.cnpj);

  const statusData = [
    { name: "Liberado", value: pedidosCliente.filter(p => p.status === "liberado").length },
    { name: "Programado", value: pedidosCliente.filter(p => p.status === "programado").length },
    { name: "Em Carga", value: pedidosCliente.filter(p => p.status === "em_carga").length },
    { name: "Recebido", value: pedidosCliente.filter(p => p.status === "recebido").length },
  ].filter(s => s.value > 0);

  const destinos = [
    { uf: cliente.uf, pedidos: pedidosCliente.length },
  ];

  const filtered = clientes.filter(c => c.nome.toLowerCase().includes(busca.toLowerCase()));

  return (
    <div>
      <PageHeader title="Dashboard de Clientes" description="Analise pedidos e performance por cliente" />

      <div className="grid grid-cols-[280px_1fr] gap-4">
        <Card className="p-3">
          <div className="relative mb-3">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input value={busca} onChange={e => setBusca(e.target.value)} placeholder="Buscar cliente..." className="pl-8 h-8 text-xs" />
          </div>
          <div className="space-y-1">
            {filtered.map(c => (
              <button
                key={c.id}
                onClick={() => setSelected(c.id)}
                className={cn(
                  "w-full text-left p-2.5 rounded-md transition-colors",
                  selected === c.id ? "bg-primary text-primary-foreground" : "hover:bg-slate-50"
                )}
              >
                <p className={cn("text-sm font-medium", selected === c.id ? "text-primary-foreground" : "")}>{c.nome}</p>
                <p className={cn("text-[11px] mt-0.5", selected === c.id ? "text-primary-foreground/80" : "text-muted-foreground")}>
                  {c.pedidos} pedidos · {formatCurrency(c.valorTotal)}
                </p>
              </button>
            ))}
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold">{cliente.nome}</h2>
                <p className="text-xs text-muted-foreground mt-0.5">CNPJ: {cliente.cnpj}</p>
                <p className="text-xs text-muted-foreground">{cliente.cidade}/{cliente.uf}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Última carga</p>
                <p className="text-sm font-medium">16/04/2026</p>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-4 gap-3">
            <StatCard label="Pedidos" value={cliente.pedidos} icon={Package} iconColor="blue" />
            <StatCard label="Valor Total" value={formatCurrency(cliente.valorTotal)} icon={DollarSign} iconColor="emerald" />
            <StatCard label="Peso Total" value={`${cliente.pesoTotal.toLocaleString("pt-BR")} kg`} icon={Weight} iconColor="amber" />
            <StatCard label="Entregas" value={cliente.pedidos - pedidosCliente.length} icon={CheckCircle2} iconColor="violet" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Card className="p-5">
              <h3 className="text-sm font-semibold mb-4">Status dos Pedidos</h3>
              {statusData.length ? (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={2}>
                      {statusData.map((_, i) => <Cell key={i} fill={STATUS_COLORS[i]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-xs text-muted-foreground py-12 text-center">Sem pedidos pendentes</p>
              )}
            </Card>

            <Card className="p-5">
              <h3 className="text-sm font-semibold mb-4">Destinos por Região</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={destinos} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="uf" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={40} />
                  <Tooltip />
                  <Bar dataKey="pedidos" fill="#10b981" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>

          <Card className="p-5">
            <h3 className="text-sm font-semibold mb-3">Últimos pedidos</h3>
            <div className="space-y-1">
              {pedidosCliente.slice(0, 5).map(p => (
                <div key={p.id} className="flex items-center gap-3 py-2 border-b last:border-0">
                  <p className="text-sm font-mono text-blue-600">{p.oc}</p>
                  <p className="text-sm flex-1">{p.cidade}/{p.uf}</p>
                  <p className="text-sm text-muted-foreground">{p.pesoBruto} kg</p>
                  <p className="text-sm font-medium">{formatCurrency(p.valor)}</p>
                  <StatusBadge status={p.status} />
                </div>
              ))}
              {pedidosCliente.length === 0 && <p className="text-xs text-muted-foreground py-4 text-center">Nenhum pedido ativo deste cliente</p>}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
