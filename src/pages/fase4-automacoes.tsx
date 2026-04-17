import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Sparkles, Wand2, TrendingUp, Truck, CheckCircle2, Clock, Zap, Target } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { pedidos, motoristas, veiculos, ctes } from "@/lib/mock-data";
import { formatCurrency, formatDate } from "@/lib/utils";

export function SugestaoCarga() {
  const pendentes = pedidos.filter(p => p.status === "liberado" || p.status === "programado");

  // 3 sugestões de carga otimizadas por IA
  const sugestoes = [
    {
      id: 1,
      titulo: "Carga SP — Triangular",
      pedidos: ["p1", "p2", "p3", "p9"],
      pesoTotal: 1160,
      valorTotal: 8770,
      veiculoSugerido: "v1",
      motoristaSugerido: "m1",
      score: 94,
      razoes: ["Mesma UF destino (SP)", "Rota otimizada: RP → Campinas → Santos", "Motorista familiarizado com a rota"],
      ocupacao: 38.7,
      cumpreTodosPrazos: true,
    },
    {
      id: 2,
      titulo: "Carga RJ — Redespacho NE",
      pedidos: ["p4", "p5", "p8"],
      pesoTotal: 3010,
      valorTotal: 18100,
      veiculoSugerido: "v2",
      motoristaSugerido: "m2",
      score: 87,
      razoes: ["Aproveitamento RJ → redespacho BA/PE", "Peso próximo da capacidade ideal (91%)", "Janela de prazo compatível"],
      ocupacao: 91.2,
      cumpreTodosPrazos: true,
    },
    {
      id: 3,
      titulo: "Carga Sul — Transferência",
      pedidos: ["p6", "p7"],
      pesoTotal: 1970,
      valorTotal: 9600,
      veiculoSugerido: "v3",
      motoristaSugerido: "m3",
      score: 78,
      razoes: ["Transferência RS → SC", "Aproveitamento de viagem de retorno", "Prazo folgado (5 dias)"],
      ocupacao: 4.9,
      cumpreTodosPrazos: true,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Sugestão Automática de Carga"
        description="Algoritmo analisa prazo, peso, volume, rota e capacidade para sugerir a melhor composição"
        badge={{ label: "Fase 4", variant: "phase4" }}
        actions={<Button size="sm"><Sparkles className="w-3.5 h-3.5 mr-1.5" />Reprocessar sugestões</Button>}
      />

      <Card className="p-5 mb-6 border-violet-200 bg-gradient-to-br from-violet-50 to-blue-50/40">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-violet-700" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-violet-900">Análise automatizada concluída</p>
            <p className="text-xs text-violet-800 mt-1">
              {pendentes.length} pedidos pendentes analisados · 3 cargas sugeridas · aproveitamento médio 44.9%
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Tempo de cálculo</p>
            <p className="text-sm font-mono font-semibold text-violet-900">1.2s</p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <StatCard label="Sugestões geradas" value={sugestoes.length} icon={Sparkles} iconColor="violet" />
        <StatCard label="Pedidos alocados" value={sugestoes.reduce((s, sg) => s + sg.pedidos.length, 0)} subtitle={`de ${pendentes.length} pendentes`} icon={Target} iconColor="blue" />
        <StatCard label="Valor otimizado" value={formatCurrency(sugestoes.reduce((s, sg) => s + sg.valorTotal, 0))} icon={TrendingUp} iconColor="emerald" />
      </div>

      <div className="grid grid-cols-3 gap-4">
        {sugestoes.map(s => {
          const motorista = motoristas.find(m => m.id === s.motoristaSugerido)!;
          const veiculo = veiculos.find(v => v.id === s.veiculoSugerido)!;
          return (
            <Card key={s.id} className="p-5 flex flex-col">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-sm font-semibold">{s.titulo}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{s.pedidos.length} pedidos · {s.pesoTotal.toLocaleString("pt-BR")} kg</p>
                </div>
                <div className="text-right">
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-violet-100 text-violet-800 text-xs font-semibold">
                    <Sparkles className="w-3 h-3" />
                    Score {s.score}
                  </div>
                </div>
              </div>

              <div className="space-y-2 mb-3">
                <div className="flex items-center gap-2 text-xs">
                  <Truck className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="font-mono font-medium">{veiculo.placa}</span>
                  <span className="text-muted-foreground">· {motorista.nome}</span>
                </div>
                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-muted-foreground">Ocupação</span>
                    <span className="font-semibold">{s.ocupacao.toFixed(1)}%</span>
                  </div>
                  <Progress value={s.ocupacao} className="h-1.5" />
                </div>
              </div>

              <div className="space-y-1 mb-4">
                {s.razoes.map((r, i) => (
                  <div key={i} className="flex items-start gap-1.5 text-[11px] text-slate-700">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600 mt-0.5 shrink-0" />
                    <span>{r}</span>
                  </div>
                ))}
              </div>

              <div className="mt-auto pt-3 border-t">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs text-muted-foreground">Valor total</p>
                  <p className="text-sm font-semibold">{formatCurrency(s.valorTotal)}</p>
                </div>
                <Button size="sm" className="w-full" variant="default">Aceitar sugestão</Button>
                <Button size="sm" variant="ghost" className="w-full mt-1">Ajustar manualmente</Button>
              </div>
            </Card>
          );
        })}
      </div>

      <Card className="p-5 mt-6">
        <p className="text-xs text-muted-foreground font-medium mb-3">PEDIDOS NÃO ALOCADOS</p>
        <div className="space-y-1.5">
          {pendentes.filter(p => !sugestoes.some(s => s.pedidos.includes(p.id))).map(p => (
            <div key={p.id} className="flex items-center gap-3 p-2 rounded border text-xs">
              <span className="font-mono text-blue-600">{p.oc}</span>
              <span className="font-medium">{p.cliente}</span>
              <span className="text-muted-foreground">{p.cidade}/{p.uf}</span>
              <span className="ml-auto text-muted-foreground">Prazo: {formatDate(p.prazo)}</span>
              <Badge variant="outline">Aguardando próxima janela</Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

export function EmissaoAutomatica() {
  const fila = [
    { cte: "CTE-00240", cliente: "Agroterra SC", rota: "Joinville → Blumenau", valor: 680, status: "emitido", tempo: "0.8s" },
    { cte: "CTE-00241", cliente: "Petroquímica Sul", rota: "Triunfo → Joinville", valor: 1450, status: "emitido", tempo: "1.1s" },
    { cte: "CTE-00242", cliente: "Primo Tedesco", rota: "Nova Santa Rita → Ribeirão Preto", valor: 850, status: "emitindo", tempo: "—" },
    { cte: "CTE-00243", cliente: "Quimex BA", rota: "Guarulhos → Salvador", valor: 2100, status: "fila", tempo: "—" },
    { cte: "CTE-00244", cliente: "Quimex BA (embalagem)", rota: "Guarulhos → Salvador", valor: 240, status: "conferencia", tempo: "—" },
  ];

  return (
    <div>
      <PageHeader
        title="Emissão Automática de CT-e"
        description="CT-e emitido assim que os XMLs são capturados, com conferência por exceção"
        badge={{ label: "Fase 4", variant: "phase4" }}
        actions={<Button size="sm" variant="outline">Pausar emissão</Button>}
      />

      <Card className="p-5 mb-6 border-violet-200 bg-gradient-to-br from-violet-50 to-blue-50/40">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center shrink-0">
            <Wand2 className="w-5 h-5 text-violet-700" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-violet-900">Automação ativa</p>
            <p className="text-xs text-violet-800 mt-1">
              Disparo automático ao capturar XML na SEFAZ · tabela de frete aplicada · conferência manual para carga fracionada ANTT
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-medium text-emerald-700">Online</span>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard label="CT-e emitidos hoje" value={32} icon={CheckCircle2} iconColor="emerald" trend={{ value: 18, direction: "up" }} />
        <StatCard label="Tempo médio" value="1.0s" subtitle="do XML ao CT-e autorizado" icon={Zap} iconColor="violet" />
        <StatCard label="Exceções" value={2} subtitle="Piso mínimo ANTT · conferência" icon={Clock} iconColor="amber" />
        <StatCard label="Taxa automação" value="94%" icon={TrendingUp} iconColor="blue" />
      </div>

      <Card>
        <div className="p-5 border-b">
          <h3 className="text-sm font-semibold">Fila de emissão</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Pipeline em tempo real</p>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>CT-e</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Rota</TableHead>
              <TableHead className="text-right">Frete calculado</TableHead>
              <TableHead>Tempo</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {fila.map(f => (
              <TableRow key={f.cte}>
                <TableCell className="font-mono text-blue-600 font-medium">{f.cte}</TableCell>
                <TableCell className="font-medium">{f.cliente}</TableCell>
                <TableCell className="text-xs">{f.rota}</TableCell>
                <TableCell className="text-right font-medium">{formatCurrency(f.valor)}</TableCell>
                <TableCell className="font-mono text-xs">{f.tempo}</TableCell>
                <TableCell>
                  {f.status === "emitido" && <Badge variant="success">✓ Emitido</Badge>}
                  {f.status === "emitindo" && <Badge variant="info">Emitindo...</Badge>}
                  {f.status === "fila" && <Badge variant="muted">Na fila</Badge>}
                  {f.status === "conferencia" && <Badge variant="warning">Conferência ANTT</Badge>}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Card className="p-5 mt-6 bg-amber-50/30 border-amber-200">
        <div className="flex items-start gap-3">
          <Clock className="w-4 h-4 text-amber-700 mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-900">Regra de exceção · Piso mínimo ANTT</p>
            <p className="text-xs text-amber-800 mt-1">
              Cargas fracionadas com destino em rota sob piso mínimo (Resolução ANTT 6.077/6.078) são retidas para
              conferência manual, preservando a lógica de emissão de 2 CT-e por CNPJ destinatário.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
