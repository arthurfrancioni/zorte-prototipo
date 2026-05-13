import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { valesPedagio, cargas, motoristas, veiculos, ValePedagio } from "@/lib/mock-data";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { Route, CheckCircle2, Clock, Eye, Plus, MapPin } from "lucide-react";

export function ValePedagioPage() {
  const [detail, setDetail] = useState<ValePedagio | null>(null);
  const [novoOpen, setNovoOpen] = useState(false);

  const totalValor = valesPedagio.reduce((s, v) => s + v.valor, 0);
  const totalKm = valesPedagio.reduce((s, v) => s + v.kmTotal, 0);

  return (
    <div>
      <PageHeader
        title="Vale-Pedágio"
        description="Emissão automática via GraphHopper + tabela ANTT por eixos · obrigatório por lei"
        badge={{ label: "Fase 2", variant: "phase2" }}
        actions={<Button size="sm" onClick={() => setNovoOpen(true)}><Plus className="w-3.5 h-3.5 mr-1.5" />Emitir vale</Button>}
      />

      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard label="Vales emitidos" value={valesPedagio.length} icon={Route} iconColor="blue" />
        <StatCard label="KM totais" value={totalKm.toLocaleString("pt-BR")} subtitle="Rotas calculadas via GraphHopper" icon={MapPin} iconColor="violet" />
        <StatCard label="Valor total" value={formatCurrency(totalValor)} icon={Route} iconColor="emerald" />
        <StatCard label="Utilizados" value={valesPedagio.filter(v => v.status === "utilizado").length} icon={CheckCircle2} iconColor="amber" />
      </div>

      <Card>
        <div className="p-5 border-b">
          <h3 className="text-sm font-semibold">Vales-pedágio por carga</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Cálculo automático considerando rota completa, número de eixos e tabela ANTT</p>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Número</TableHead>
              <TableHead>Carga</TableHead>
              <TableHead>Motorista · Placa</TableHead>
              <TableHead>Rota</TableHead>
              <TableHead className="text-right">KM</TableHead>
              <TableHead className="text-center">Eixos</TableHead>
              <TableHead className="text-right">Valor</TableHead>
              <TableHead>Emissor</TableHead>
              <TableHead>Status</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {valesPedagio.map(v => {
              const carga = cargas.find(c => c.id === v.cargaId);
              const motorista = motoristas.find(m => m.id === v.motoristaId);
              const veiculo = veiculos.find(vv => vv.id === v.veiculoId);
              return (
                <TableRow key={v.id}>
                  <TableCell className="font-mono text-blue-600 font-medium">{v.numero}</TableCell>
                  <TableCell className="font-mono text-xs">{carga?.numero ?? "—"}</TableCell>
                  <TableCell className="text-sm">
                    <p className="font-medium">{motorista?.nome ?? "—"}</p>
                    <p className="text-xs text-muted-foreground font-mono">{veiculo?.placa ?? "—"}</p>
                  </TableCell>
                  <TableCell className="text-xs max-w-[280px]">
                    <p className="font-medium">{v.origem}</p>
                    <p className="text-muted-foreground">→ {v.destino}</p>
                  </TableCell>
                  <TableCell className="text-right">{v.kmTotal.toLocaleString("pt-BR")}</TableCell>
                  <TableCell className="text-center">{v.eixos}</TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(v.valor)}</TableCell>
                  <TableCell className="text-xs">{v.emissor}</TableCell>
                  <TableCell>
                    {v.status === "emitido" && <Badge variant="info">Emitido</Badge>}
                    {v.status === "utilizado" && <Badge variant="success">Utilizado</Badge>}
                    {v.status === "estornado" && <Badge variant="warning">Estornado</Badge>}
                  </TableCell>
                  <TableCell>
                    <Button size="sm" variant="ghost" onClick={() => setDetail(v)}><Eye className="w-3.5 h-3.5" /></Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={!!detail} onOpenChange={() => setDetail(null)}>
        <DialogContent className="max-w-xl">
          {detail && (
            <>
              <DialogHeader>
                <DialogTitle>Vale-Pedágio {detail.numero}</DialogTitle>
                <p className="text-xs text-muted-foreground">Carga {cargas.find(c => c.id === detail.cargaId)?.numero} · {detail.emissor}</p>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="col-span-2 bg-violet-50 rounded p-3">
                  <p className="text-xs text-violet-900 font-semibold mb-1 flex items-center gap-1"><MapPin className="w-3 h-3" />Rota calculada (GraphHopper)</p>
                  <p className="font-medium">{detail.origem}</p>
                  <p className="text-xs text-muted-foreground">↓ {detail.kmTotal.toLocaleString("pt-BR")} km</p>
                  <p className="font-medium">{detail.destino}</p>
                </div>
                <div><p className="text-xs text-muted-foreground">Motorista</p><p className="font-medium">{motoristas.find(m => m.id === detail.motoristaId)?.nome}</p></div>
                <div><p className="text-xs text-muted-foreground">Placa</p><p className="font-mono font-medium">{veiculos.find(v => v.id === detail.veiculoId)?.placa}</p></div>
                <div><p className="text-xs text-muted-foreground">Eixos</p><p className="font-medium">{detail.eixos}</p></div>
                <div><p className="text-xs text-muted-foreground">Valor ANTT</p><p className="font-medium text-emerald-700">{formatCurrency(detail.valor)}</p></div>
                <div><p className="text-xs text-muted-foreground">Emissor</p><p className="font-medium">{detail.emissor}</p></div>
                <div><p className="text-xs text-muted-foreground">Data de emissão</p><p className="font-medium">{formatDateTime(detail.dataEmissao)}</p></div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={novoOpen} onOpenChange={setNovoOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Emitir Vale-Pedágio</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 text-sm">
            <p className="text-muted-foreground">A emissão é automática no fluxo de formação da carga e MDF-e. Para registro manual, selecione a carga na lista de cargas ativas e use a ação "Emitir vale".</p>
            <Card className="p-3 bg-slate-50 text-xs">
              <p className="font-semibold mb-1">Cálculo automatizado</p>
              <p className="text-muted-foreground">A rota é calculada via GraphHopper (ETA + km) e o valor é aplicado pela tabela ANTT por número de eixos do veículo. Emissores integrados: <strong>ConectCar</strong>, <strong>Sem Parar</strong>, <strong>RepomVPe</strong>, <strong>DBTrans</strong>.</p>
            </Card>
            <Button className="w-full" onClick={() => setNovoOpen(false)}>Entendi</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
