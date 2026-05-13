import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { ordensCarregamento, motoristas, OrdemCarregamento } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";
import {
  Boxes, Plus, Search, Eye, Truck, FileSignature, Route as RouteIcon,
  Receipt, FileText, ShieldCheck, MapPin, Calendar, ArrowRight, Filter,
} from "lucide-react";

const STATUS_OPTIONS = [
  { value: "todos", label: "Todos os status" },
  { value: "rascunho", label: "Rascunho" },
  { value: "emitida", label: "Emitida" },
  { value: "em_transito", label: "Em trânsito" },
  { value: "finalizada", label: "Finalizada" },
];

function StatusBadge({ status }: { status: OrdemCarregamento["status"] }) {
  if (status === "emitida") return <Badge variant="info">Emitida</Badge>;
  if (status === "em_transito") return <Badge variant="warning">Em trânsito</Badge>;
  if (status === "finalizada") return <Badge variant="success">Finalizada</Badge>;
  return <Badge variant="muted">Rascunho</Badge>;
}

export function OrdensCarregamento() {
  const navigate = useNavigate();
  const [busca, setBusca] = useState("");
  const [status, setStatus] = useState("todos");
  const [uf, setUf] = useState("todas");
  const [motoristaFiltro, setMotoristaFiltro] = useState("todos");
  const [periodo, setPeriodo] = useState("todos");

  const ufsDisponiveis = useMemo(() => {
    const s = new Set<string>();
    ordensCarregamento.forEach(o => o.destinosUF.forEach(u => s.add(u)));
    return Array.from(s).sort();
  }, []);

  const filtered = ordensCarregamento.filter(o => {
    const matchBusca = busca === "" ||
      o.numero.toLowerCase().includes(busca.toLowerCase()) ||
      o.motorista.toLowerCase().includes(busca.toLowerCase()) ||
      o.placa.toLowerCase().includes(busca.toLowerCase()) ||
      o.destinosUF.some(u => u.toLowerCase().includes(busca.toLowerCase()));
    const matchStatus = status === "todos" || o.status === status;
    const matchUf = uf === "todas" || o.destinosUF.includes(uf);
    const matchMotorista = motoristaFiltro === "todos" || o.motorista === motoristaFiltro;
    const dataOC = new Date(o.dataCriacao);
    const hoje = new Date("2026-04-16T12:00:00"); // data fixa para o protótipo
    const diasAtras = (hoje.getTime() - dataOC.getTime()) / (1000 * 60 * 60 * 24);
    const matchPeriodo =
      periodo === "todos" ||
      (periodo === "7d" && diasAtras <= 7) ||
      (periodo === "30d" && diasAtras <= 30) ||
      (periodo === "hoje" && diasAtras < 1);
    return matchBusca && matchStatus && matchUf && matchMotorista && matchPeriodo;
  });

  const stats = {
    total: ordensCarregamento.length,
    emTransito: ordensCarregamento.filter(o => o.status === "em_transito").length,
    finalizadas: ordensCarregamento.filter(o => o.status === "finalizada").length,
    valorTotal: ordensCarregamento.reduce((s, o) => s + o.valorFrete, 0),
  };

  return (
    <div>
      <PageHeader
        title="Ordens de Carregamento"
        description={`${ordensCarregamento.length} ordens · agrupa pedidos, CT-e, MDF-e, CIOT, vale-pedágio e GNRE da operação`}
        badge={{ label: "Operação", variant: "phase1" }}
        actions={
          <Button onClick={() => navigate("/simulacao")}><Plus className="w-3.5 h-3.5 mr-1.5" />Gerar nova ordem</Button>
        }
      />

      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard label="Ordens ativas" value={stats.total} icon={Boxes} iconColor="blue" />
        <StatCard label="Em trânsito" value={stats.emTransito} icon={Truck} iconColor="amber" />
        <StatCard label="Finalizadas" value={stats.finalizadas} icon={ShieldCheck} iconColor="emerald" />
        <StatCard label="Valor frete total" value={formatCurrency(stats.valorTotal)} icon={FileText} iconColor="violet" />
      </div>

      {/* Filtros */}
      <Card className="p-4 mb-4">
        <div className="flex items-center gap-3 mb-3">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Filtros</p>
        </div>
        <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input value={busca} onChange={e => setBusca(e.target.value)} placeholder="Buscar por número, motorista, placa ou UF..." className="pl-9" />
          </div>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={uf} onValueChange={setUf}>
            <SelectTrigger className="w-36"><SelectValue placeholder="UF destino" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas UFs</SelectItem>
              {ufsDisponiveis.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={motoristaFiltro} onValueChange={setMotoristaFiltro}>
            <SelectTrigger className="w-48"><SelectValue placeholder="Motorista" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos motoristas</SelectItem>
              {motoristas.filter(m => m.ativo).map(m => <SelectItem key={m.id} value={m.nome}>{m.nome}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={periodo} onValueChange={setPeriodo}>
            <SelectTrigger className="w-36"><SelectValue placeholder="Período" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todo período</SelectItem>
              <SelectItem value="hoje">Hoje</SelectItem>
              <SelectItem value="7d">Últimos 7 dias</SelectItem>
              <SelectItem value="30d">Últimos 30 dias</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {filtered.length !== ordensCarregamento.length && (
          <p className="text-[11px] text-muted-foreground mt-2">
            Mostrando {filtered.length} de {ordensCarregamento.length} ordens · <button className="text-violet-600 underline" onClick={() => { setBusca(""); setStatus("todos"); setUf("todas"); setMotoristaFiltro("todos"); setPeriodo("todos"); }}>limpar filtros</button>
          </p>
        )}
      </Card>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ordem</TableHead>
              <TableHead>Motorista · Placa</TableHead>
              <TableHead>Origem → Destinos</TableHead>
              <TableHead className="text-right">Peso</TableHead>
              <TableHead className="text-right">Frete</TableHead>
              <TableHead>Documentos fiscais</TableHead>
              <TableHead>Status</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(o => (
              <TableRow key={o.id} className="cursor-pointer hover:bg-slate-50" onClick={() => navigate(`/ordens-carregamento/${o.id}`)}>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-mono text-blue-600 font-medium">{o.numero}</span>
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-2.5 h-2.5" />
                      {new Date(o.dataCriacao).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium text-sm">{o.motorista}</span>
                    <span className="font-mono text-[10px] text-muted-foreground">{o.placa}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="text-muted-foreground">{o.origem.split(" · ")[0]}</span>
                    <ArrowRight className="w-3 h-3 text-muted-foreground" />
                    <div className="flex flex-wrap gap-1">
                      {o.destinosUF.map(u => <Badge key={u} variant="info" className="text-[9px]">{u}</Badge>)}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-right text-sm">{o.pesoTotal.toLocaleString("pt-BR")} kg</TableCell>
                <TableCell className="text-right font-medium">{formatCurrency(o.valorFrete)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 text-[11px]">
                    <span className="inline-flex items-center gap-0.5 text-blue-700" title="CT-es"><FileText className="w-3 h-3" />{o.qtdCtes}</span>
                    <span className="inline-flex items-center gap-0.5 text-violet-700" title="MDF-es"><FileSignature className="w-3 h-3" />{o.qtdMdfes}</span>
                    {o.qtdGnres > 0 && <span className="inline-flex items-center gap-0.5 text-amber-700" title="GNREs"><Receipt className="w-3 h-3" />{o.qtdGnres}</span>}
                    {o.temCiot && <span className="inline-flex items-center gap-0.5 text-emerald-700" title="CIOT"><ShieldCheck className="w-3 h-3" />CIOT</span>}
                    {o.temValePedagio && <span className="inline-flex items-center gap-0.5 text-amber-700" title="Vale-pedágio"><RouteIcon className="w-3 h-3" />Vale</span>}
                  </div>
                </TableCell>
                <TableCell><StatusBadge status={o.status} /></TableCell>
                <TableCell>
                  <Button size="sm" variant="ghost"><Eye className="w-3.5 h-3.5" /></Button>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-sm text-muted-foreground py-8">
                  <MapPin className="w-6 h-6 mx-auto mb-2 opacity-40" />
                  Nenhuma ordem encontrada com os filtros aplicados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
