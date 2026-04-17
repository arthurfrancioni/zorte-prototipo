import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Truck, CheckCircle2, Weight, DollarSign, Star } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { motoristas, veiculos, cargas, cargasPorMes } from "@/lib/mock-data";
import { formatCurrency, formatDate, cn } from "@/lib/utils";

export function DashboardTransportadora() {
  const [selected, setSelected] = useState(motoristas[0].id);
  const [busca, setBusca] = useState("");
  const motorista = motoristas.find(m => m.id === selected)!;
  const veiculo = veiculos.find(v => v.motoristaId === motorista.id);
  const cargasMotorista = cargas.filter(c => c.motoristaId === motorista.id);

  const ufs = [...new Set(cargasMotorista.flatMap(c => c.pedidos))].slice(0, 5);

  const filtered = motoristas.filter(m => m.nome.toLowerCase().includes(busca.toLowerCase()) || (veiculos.find(v => v.motoristaId === m.id)?.placa.toLowerCase().includes(busca.toLowerCase()) ?? false));

  return (
    <div>
      <PageHeader title="Dashboard de Transportadora" description="Analise desempenho por motorista e veículo" />

      <div className="grid grid-cols-[280px_1fr] gap-4">
        <Card className="p-3">
          <div className="relative mb-3">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input value={busca} onChange={e => setBusca(e.target.value)} placeholder="Buscar motorista ou placa..." className="pl-8 h-8 text-xs" />
          </div>
          <div className="space-y-1">
            {filtered.map(m => {
              const v = veiculos.find(vv => vv.motoristaId === m.id);
              return (
                <button
                  key={m.id}
                  onClick={() => setSelected(m.id)}
                  className={cn(
                    "w-full text-left p-2.5 rounded-md transition-colors",
                    selected === m.id ? "bg-primary text-primary-foreground" : "hover:bg-slate-50"
                  )}
                >
                  <p className={cn("text-sm font-medium font-mono", selected === m.id ? "text-primary-foreground" : "")}>{v?.placa ?? "—"}</p>
                  <p className={cn("text-xs mt-0.5", selected === m.id ? "text-primary-foreground/90" : "text-slate-700")}>{m.nome}</p>
                  <p className={cn("text-[11px] mt-0.5", selected === m.id ? "text-primary-foreground/80" : "text-muted-foreground")}>
                    {m.cargasMes} cargas no mês
                  </p>
                </button>
              );
            })}
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="p-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-white text-xl font-semibold flex items-center justify-center">
                  {motorista.nome.split(" ").map(n => n[0]).slice(0, 2).join("")}
                </div>
                <div>
                  <h2 className="text-lg font-semibold">{motorista.nome}</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">CNH {motorista.cnh} · Cat. {motorista.categoria}</p>
                  <p className="text-xs text-muted-foreground">{motorista.telefone}</p>
                </div>
              </div>
              {veiculo && (
                <div className="text-right">
                  <div className="flex items-center gap-1 justify-end text-amber-500 mb-1">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span className="text-sm font-semibold">{motorista.avaliacao}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Placa vinculada</p>
                  <p className="text-sm font-mono font-medium">{veiculo.placa}</p>
                  <p className="text-[11px] text-muted-foreground">{veiculo.capacidadeKg.toLocaleString("pt-BR")} kg</p>
                </div>
              )}
            </div>
          </Card>

          <div className="grid grid-cols-4 gap-3">
            <StatCard label="Cargas" value={motorista.cargasMes} icon={Truck} iconColor="blue" />
            <StatCard label="Finalizadas" value={cargasMotorista.filter(c => c.status === "finalizada").length} icon={CheckCircle2} iconColor="emerald" />
            <StatCard label="Peso Total" value={`${cargasMotorista.reduce((s, c) => s + c.pesoTotal, 0).toLocaleString("pt-BR")} kg`} icon={Weight} iconColor="amber" />
            <StatCard label="Valor Total" value={formatCurrency(cargasMotorista.reduce((s, c) => s + c.valorTotal, 0))} icon={DollarSign} iconColor="violet" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Card className="p-5">
              <h3 className="text-sm font-semibold mb-4">Cargas por Mês</h3>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={cargasPorMes}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="mes" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 6 }} />
                  <Bar dataKey="cargas" fill="#1e40af" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-5">
              <h3 className="text-sm font-semibold mb-4">Principais UFs de Destino</h3>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={[{ uf: "SP", pedidos: 4 }, { uf: "RJ", pedidos: 2 }, { uf: "BA", pedidos: 1 }]} layout="vertical">
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
            <h3 className="text-sm font-semibold mb-3">Histórico de Cargas</h3>
            <div className="space-y-1">
              {cargasMotorista.map(c => (
                <div key={c.id} className="flex items-center gap-3 py-2 border-b last:border-0">
                  <p className="text-sm font-mono text-blue-600">{c.numero}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(c.dataSaida)}</p>
                  <div className="flex-1"></div>
                  <p className="text-sm text-muted-foreground">{c.pesoTotal} kg</p>
                  <p className="text-sm font-medium">{formatCurrency(c.valorTotal)}</p>
                  <StatusBadge status={c.status} />
                </div>
              ))}
              {cargasMotorista.length === 0 && <p className="text-xs text-muted-foreground py-4 text-center">Sem cargas recentes</p>}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
