import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Shield, Coins, MapPin, CheckCircle2, Download, Eye } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { cargas, ctes } from "@/lib/mock-data";
import { formatCurrency, formatDate } from "@/lib/utils";

export function Ciot() {
  const ciots = cargas.filter(c => c.ciot).map(c => ({
    codigo: c.ciot!,
    carga: c.numero,
    emissao: c.dataSaida,
    valor: c.valorTotal,
    status: "ativo",
  }));

  return (
    <div>
      <PageHeader
        title="CIOT"
        description="Código Identificador da Operação de Transporte — emissão nativa, sem sistema externo"
        badge={{ label: "Fase 2", variant: "phase2" }}
        actions={<Button size="sm">Emitir novo CIOT</Button>}
      />

      <div className="grid grid-cols-3 gap-4 mb-6">
        <StatCard label="CIOTs ativos" value={ciots.length} icon={Coins} iconColor="amber" />
        <StatCard label="Emitidos no mês" value={28} icon={CheckCircle2} iconColor="emerald" />
        <StatCard label="Valor total do mês" value={formatCurrency(452800)} icon={Coins} iconColor="blue" />
      </div>

      <Card>
        <div className="p-5 border-b">
          <h3 className="text-sm font-semibold">CIOTs emitidos</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Gerados automaticamente na emissão do MDF-e</p>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código CIOT</TableHead>
              <TableHead>Carga vinculada</TableHead>
              <TableHead>Data emissão</TableHead>
              <TableHead className="text-right">Valor</TableHead>
              <TableHead>Status</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ciots.map(c => (
              <TableRow key={c.codigo}>
                <TableCell className="font-mono text-blue-600 font-medium">{c.codigo}</TableCell>
                <TableCell className="font-mono text-xs">{c.carga}</TableCell>
                <TableCell className="text-sm">{formatDate(c.emissao)}</TableCell>
                <TableCell className="text-right font-medium">{formatCurrency(c.valor)}</TableCell>
                <TableCell><Badge variant="success">Ativo</Badge></TableCell>
                <TableCell><Button size="sm" variant="ghost"><Download className="w-3.5 h-3.5" /></Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

export function ValePedagio() {
  const vps = cargas.filter(c => c.valePedagio).map(c => ({
    codigo: c.valePedagio!,
    carga: c.numero,
    rota: "RS → SP → RJ",
    valor: 480,
    emissao: c.dataSaida,
  }));

  return (
    <div>
      <PageHeader
        title="Vale-Pedágio"
        description="Roteirização automática e provisão nativa no momento da emissão do MDF-e"
        badge={{ label: "Fase 2", variant: "phase2" }}
        actions={<Button size="sm">Novo vale-pedágio</Button>}
      />

      <div className="grid grid-cols-3 gap-4 mb-6">
        <StatCard label="Vales ativos" value={vps.length} icon={MapPin} iconColor="blue" />
        <StatCard label="Valor provisionado" value={formatCurrency(vps.reduce((s, v) => s + v.valor, 0))} icon={Coins} iconColor="amber" />
        <StatCard label="Cobertura média por rota" value="98%" subtitle="Via GraphHopper + ANTT" icon={CheckCircle2} iconColor="emerald" />
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código VP</TableHead>
              <TableHead>Carga</TableHead>
              <TableHead>Rota calculada</TableHead>
              <TableHead className="text-right">Valor</TableHead>
              <TableHead>Emissão</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vps.map(v => (
              <TableRow key={v.codigo}>
                <TableCell className="font-mono text-blue-600 font-medium">{v.codigo}</TableCell>
                <TableCell className="font-mono text-xs">{v.carga}</TableCell>
                <TableCell className="text-sm">{v.rota}</TableCell>
                <TableCell className="text-right font-medium">{formatCurrency(v.valor)}</TableCell>
                <TableCell className="text-sm">{formatDate(v.emissao)}</TableCell>
                <TableCell><Badge variant="success">Ativo</Badge></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

export function Averbacao() {
  return (
    <div>
      <PageHeader
        title="Averbação de Seguro"
        description="Integrado com ATM, ELC2, Smart Locking, MDB Carga e Porto Seguro"
        badge={{ label: "Fase 2", variant: "phase2" }}
      />

      <div className="grid grid-cols-4 gap-4 mb-6">
        <Card className="p-4 border-emerald-200 bg-emerald-50/30">
          <div className="flex items-center justify-between"><p className="text-xs font-medium">ATM</p><div className="w-2 h-2 rounded-full bg-emerald-500"></div></div>
          <p className="text-lg font-semibold mt-2">Em uso</p>
          <p className="text-[11px] text-muted-foreground">6 CT-e averbados hoje</p>
        </Card>
        <Card className="p-4"><div className="flex items-center justify-between"><p className="text-xs font-medium">ELC2</p><div className="w-2 h-2 rounded-full bg-slate-300"></div></div><p className="text-lg font-semibold mt-2 text-muted-foreground">Disponível</p><p className="text-[11px] text-muted-foreground">Não configurada</p></Card>
        <Card className="p-4"><div className="flex items-center justify-between"><p className="text-xs font-medium">Smart Locking</p><div className="w-2 h-2 rounded-full bg-slate-300"></div></div><p className="text-lg font-semibold mt-2 text-muted-foreground">Disponível</p><p className="text-[11px] text-muted-foreground">Não configurada</p></Card>
        <Card className="p-4"><div className="flex items-center justify-between"><p className="text-xs font-medium">Porto Seguro</p><div className="w-2 h-2 rounded-full bg-slate-300"></div></div><p className="text-lg font-semibold mt-2 text-muted-foreground">Disponível</p><p className="text-[11px] text-muted-foreground">Não configurada</p></Card>
      </div>

      <Card>
        <div className="p-5 border-b">
          <h3 className="text-sm font-semibold">Averbações realizadas (ATM)</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Protocolo gerado automaticamente na autorização do CT-e</p>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Protocolo</TableHead>
              <TableHead>CT-e</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead className="text-right">Valor averbado</TableHead>
              <TableHead>Emissão</TableHead>
              <TableHead>Status</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ctes.map(c => (
              <TableRow key={c.id}>
                <TableCell className="font-mono text-blue-600 font-medium">{c.averbacao}</TableCell>
                <TableCell className="font-mono text-xs">{c.numero}</TableCell>
                <TableCell>{c.cliente}</TableCell>
                <TableCell className="text-right font-medium">{formatCurrency(c.valorFrete)}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{new Date(c.dataEmissao).toLocaleString("pt-BR")}</TableCell>
                <TableCell><Badge variant="success"><Shield className="w-3 h-3 mr-1" />Averbado</Badge></TableCell>
                <TableCell><Button size="sm" variant="ghost"><Eye className="w-3.5 h-3.5" /></Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
