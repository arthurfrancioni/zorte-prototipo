import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Route, TrendingUp, DollarSign, Clock, AlertCircle, Eye, FileDown } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { clientes, ctes } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";

export function TabelasFrete() {
  const tabelas = [
    { id: 1, nome: "Tabela Padrão 2026", cliente: "Todos", rotas: 48, ativa: true, ultimaRev: "01/02/2026" },
    { id: 2, nome: "Primo Tedesco - Contrato", cliente: "Primo Tedesco", rotas: 12, ativa: true, ultimaRev: "15/01/2026" },
    { id: 3, nome: "Fernando CSA - Anual", cliente: "Fernando CSA Indústria", rotas: 8, ativa: true, ultimaRev: "10/03/2026" },
    { id: 4, nome: "Quimex BA - Rotas NE", cliente: "Quimex Bahia", rotas: 6, ativa: true, ultimaRev: "20/03/2026" },
    { id: 5, nome: "Tabela Piso Mínimo ANTT", cliente: "Aplicada em fracionadas", rotas: 24, ativa: true, ultimaRev: "Auto · ANTT 6.077" },
    { id: 6, nome: "Tabela 2025 - Arquivada", cliente: "—", rotas: 36, ativa: false, ultimaRev: "31/12/2025" },
  ];

  const rotas = [
    { origem: "Nova Santa Rita/RS", destino: "Ribeirão Preto/SP", km: 1180, faixaKg: "até 1.000 kg", frete: 850 },
    { origem: "Nova Santa Rita/RS", destino: "Campinas/SP", km: 1090, faixaKg: "até 500 kg", frete: 420 },
    { origem: "Nova Santa Rita/RS", destino: "Santos/SP", km: 1240, faixaKg: "até 500 kg", frete: 310 },
    { origem: "Nova Santa Rita/RS", destino: "Rio de Janeiro/RJ", km: 1540, faixaKg: "até 2.000 kg", frete: 1480 },
    { origem: "Guarulhos/SP", destino: "Salvador/BA", km: 1980, faixaKg: "até 1.000 kg", frete: 2100 },
    { origem: "Joinville/SC", destino: "Blumenau/SC", km: 95, faixaKg: "até 1.500 kg", frete: 680 },
  ];

  return (
    <div>
      <PageHeader
        title="Tabelas de Frete"
        description="Cálculo automático do frete por cliente, rota e faixa de peso"
        badge={{ label: "Fase 2", variant: "phase2" }}
        actions={<Button size="sm"><Plus className="w-3.5 h-3.5 mr-1.5" />Nova tabela</Button>}
      />

      <div className="grid grid-cols-3 gap-4 mb-6">
        <StatCard label="Tabelas ativas" value={tabelas.filter(t => t.ativa).length} icon={Route} iconColor="blue" />
        <StatCard label="Rotas cadastradas" value={tabelas.reduce((s, t) => s + t.rotas, 0)} icon={Route} iconColor="emerald" />
        <StatCard label="Cálculos do mês" value={482} subtitle="Automáticos na emissão de CT-e" icon={TrendingUp} iconColor="amber" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <div className="p-5 border-b">
            <h3 className="text-sm font-semibold">Tabelas cadastradas</h3>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tabela</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead className="text-right">Rotas</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tabelas.map(t => (
                <TableRow key={t.id}>
                  <TableCell>
                    <p className="font-medium text-sm">{t.nome}</p>
                    <p className="text-[11px] text-muted-foreground">Rev: {t.ultimaRev}</p>
                  </TableCell>
                  <TableCell className="text-sm">{t.cliente}</TableCell>
                  <TableCell className="text-right font-medium">{t.rotas}</TableCell>
                  <TableCell>{t.ativa ? <Badge variant="success">Ativa</Badge> : <Badge variant="muted">Arquivada</Badge>}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        <Card>
          <div className="p-5 border-b">
            <h3 className="text-sm font-semibold">Preview · Tabela Padrão 2026</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Rotas mais utilizadas</p>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rota</TableHead>
                <TableHead>Faixa</TableHead>
                <TableHead className="text-right">Frete</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rotas.map((r, i) => (
                <TableRow key={i}>
                  <TableCell className="text-xs">
                    <p className="font-medium">{r.origem}</p>
                    <p className="text-muted-foreground">→ {r.destino}</p>
                  </TableCell>
                  <TableCell className="text-xs">{r.faixaKg}</TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(r.frete)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
}

export function Financeiro() {
  const faturas = [
    { numero: "FAT-2026-0056", cliente: "Primo Tedesco", ctes: 3, emissao: "12/04/2026", vencimento: "27/04/2026", valor: 2140, status: "pago" },
    { numero: "FAT-2026-0057", cliente: "Fernando CSA Indústria", ctes: 2, emissao: "13/04/2026", vencimento: "28/04/2026", valor: 980, status: "aberto" },
    { numero: "FAT-2026-0058", cliente: "Quimex Bahia", ctes: 4, emissao: "14/04/2026", vencimento: "29/04/2026", valor: 8400, status: "aberto" },
    { numero: "FAT-2026-0059", cliente: "Zanzalog Transportes", ctes: 2, emissao: "15/04/2026", vencimento: "30/04/2026", valor: 1320, status: "aberto" },
    { numero: "FAT-2026-0055", cliente: "Distribuidora Norte RJ", ctes: 1, emissao: "10/04/2026", vencimento: "25/04/2026", valor: 1480, status: "vencido" },
  ];

  return (
    <div>
      <PageHeader
        title="Financeiro"
        description="Faturamento aos tomadores, contas a receber e a pagar"
        badge={{ label: "Fase 2", variant: "phase2" }}
        actions={<Button size="sm"><Plus className="w-3.5 h-3.5 mr-1.5" />Gerar fatura</Button>}
      />

      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard label="Receita do mês" value={formatCurrency(82400)} icon={DollarSign} iconColor="emerald" trend={{ value: 12, direction: "up" }} />
        <StatCard label="A receber" value={formatCurrency(10700)} subtitle="4 faturas abertas" icon={Clock} iconColor="blue" />
        <StatCard label="Vencidas" value={formatCurrency(1480)} subtitle="1 fatura" icon={AlertCircle} iconColor="rose" />
        <StatCard label="Recebido" value={formatCurrency(2140)} subtitle="1 fatura paga" icon={TrendingUp} iconColor="amber" />
      </div>

      <Card>
        <div className="p-5 border-b flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold">Faturas emitidas</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Geradas a partir dos CT-e de cada tomador</p>
          </div>
          <Button size="sm" variant="outline"><FileDown className="w-3.5 h-3.5 mr-1.5" />Exportar</Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fatura</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead className="text-right">CT-e</TableHead>
              <TableHead>Emissão</TableHead>
              <TableHead>Vencimento</TableHead>
              <TableHead className="text-right">Valor</TableHead>
              <TableHead>Status</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {faturas.map(f => (
              <TableRow key={f.numero}>
                <TableCell className="font-mono text-blue-600 font-medium">{f.numero}</TableCell>
                <TableCell className="font-medium">{f.cliente}</TableCell>
                <TableCell className="text-right">{f.ctes}</TableCell>
                <TableCell className="text-sm">{f.emissao}</TableCell>
                <TableCell className="text-sm">{f.vencimento}</TableCell>
                <TableCell className="text-right font-medium">{formatCurrency(f.valor)}</TableCell>
                <TableCell>
                  {f.status === "pago" && <Badge variant="success">Pago</Badge>}
                  {f.status === "aberto" && <Badge variant="info">Em aberto</Badge>}
                  {f.status === "vencido" && <Badge variant="destructive">Vencido</Badge>}
                </TableCell>
                <TableCell><Button size="sm" variant="ghost"><Eye className="w-3.5 h-3.5" /></Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
