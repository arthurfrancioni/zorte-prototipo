import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { ciots, cargas, motoristas, CIOT } from "@/lib/mock-data";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { FileSignature, CheckCircle2, Clock, AlertCircle, Plus, Eye, Info } from "lucide-react";

export function CIOTPage() {
  const [detail, setDetail] = useState<CIOT | null>(null);
  const [novoOpen, setNovoOpen] = useState(false);

  const total = ciots.reduce((s, c) => s + c.valorFrete, 0);
  const gerados = ciots.filter(c => c.status === "gerado").length;
  const pagos = ciots.filter(c => c.status === "pago").length;

  return (
    <div>
      <PageHeader
        title="CIOT — Código Identificador da Operação de Transporte"
        description="Gerado por contratação de transportador agregado/ETC · cálculo via piso mínimo ANTT"
        badge={{ label: "Fase 2", variant: "phase2" }}
        actions={<Button size="sm" onClick={() => setNovoOpen(true)}><Plus className="w-3.5 h-3.5 mr-1.5" />Gerar CIOT</Button>}
      />

      <Card className="p-4 mb-4 bg-amber-50 border-amber-200 flex items-start gap-3">
        <Info className="w-4 h-4 text-amber-700 mt-0.5 shrink-0" />
        <div className="text-xs text-amber-900">
          <p className="font-semibold">Obrigatoriedade a partir de 24/05/2026</p>
          <p className="mt-0.5">A Resolução ANTT inclui o CIOT como obrigatório para todas as operações de transporte de carga, inclusive ETC e agregados. O sistema já está preparado para gerar e validar automaticamente conforme o layout SEFAZ for liberado pela ANTT (previsto para a semana de 19/05).</p>
        </div>
      </Card>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard label="CIOTs gerados" value={ciots.length} icon={FileSignature} iconColor="blue" />
        <StatCard label="Aguardando pagamento" value={gerados} icon={Clock} iconColor="amber" />
        <StatCard label="Pagos" value={pagos} icon={CheckCircle2} iconColor="emerald" />
        <StatCard label="Valor total contratado" value={formatCurrency(total)} icon={FileSignature} iconColor="violet" />
      </div>

      <Card>
        <div className="p-5 border-b">
          <h3 className="text-sm font-semibold">Operações de transporte registradas</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Frota própria gera CIOT zerado · agregados/ETC com valor + banco para pagamento</p>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>CIOT</TableHead>
              <TableHead>Carga</TableHead>
              <TableHead>Transportador</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead className="text-right">Piso ANTT</TableHead>
              <TableHead className="text-right">Frete contratado</TableHead>
              <TableHead>Pagamento</TableHead>
              <TableHead>Status</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ciots.map(c => {
              const carga = cargas.find(cc => cc.id === c.cargaId);
              const margem = c.pisoMinimoAntt > 0 ? ((c.valorFrete - c.pisoMinimoAntt) / c.pisoMinimoAntt) * 100 : 0;
              return (
                <TableRow key={c.id}>
                  <TableCell className="font-mono text-blue-600 font-medium">{c.numero}</TableCell>
                  <TableCell className="font-mono text-xs">{carga?.numero ?? "—"}</TableCell>
                  <TableCell className="font-medium">{c.transportadorNome}</TableCell>
                  <TableCell>
                    {c.transportadorTipo === "etc" && <Badge variant="info">ETC</Badge>}
                    {c.transportadorTipo === "agregado" && <Badge variant="warning">Agregado</Badge>}
                    {c.transportadorTipo === "frota_propria" && <Badge variant="muted">Frota própria</Badge>}
                  </TableCell>
                  <TableCell className="text-right text-xs text-muted-foreground">{c.pisoMinimoAntt > 0 ? formatCurrency(c.pisoMinimoAntt) : "—"}</TableCell>
                  <TableCell className="text-right font-medium">
                    {c.valorFrete > 0 ? formatCurrency(c.valorFrete) : "—"}
                    {margem > 0 && <span className="ml-1 text-[10px] text-emerald-600">+{margem.toFixed(1)}%</span>}
                  </TableCell>
                  <TableCell className="text-xs">
                    {c.banco === "—" ? <span className="text-muted-foreground">—</span> : <><span className="font-medium">{c.banco}</span> · Ag {c.agencia} · C/C {c.conta}</>}
                  </TableCell>
                  <TableCell>
                    {c.status === "pago" && <Badge variant="success">Pago</Badge>}
                    {c.status === "gerado" && <Badge variant="warning">Aguardando pagto</Badge>}
                    {c.status === "cancelado" && <Badge variant="destructive">Cancelado</Badge>}
                  </TableCell>
                  <TableCell>
                    <Button size="sm" variant="ghost" onClick={() => setDetail(c)}><Eye className="w-3.5 h-3.5" /></Button>
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
                <DialogTitle>CIOT {detail.numero}</DialogTitle>
                <p className="text-xs text-muted-foreground">{detail.transportadorNome} · {detail.transportadorCnpjCpf}</p>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><p className="text-xs text-muted-foreground">Carga</p><p className="font-medium">{cargas.find(c => c.id === detail.cargaId)?.numero}</p></div>
                <div><p className="text-xs text-muted-foreground">Tipo</p><p className="font-medium capitalize">{detail.transportadorTipo.replace("_", " ")}</p></div>
                <div><p className="text-xs text-muted-foreground">Piso mínimo ANTT</p><p className="font-medium">{detail.pisoMinimoAntt > 0 ? formatCurrency(detail.pisoMinimoAntt) : "Não aplicável"}</p></div>
                <div><p className="text-xs text-muted-foreground">Valor do frete</p><p className="font-medium">{detail.valorFrete > 0 ? formatCurrency(detail.valorFrete) : "—"}</p></div>
                <div className="col-span-2 bg-slate-50 rounded p-3">
                  <p className="text-xs text-muted-foreground mb-1">Dados de pagamento</p>
                  <p className="font-medium">{detail.banco}</p>
                  <p className="text-xs">Agência {detail.agencia} · Conta {detail.conta}</p>
                </div>
                <div><p className="text-xs text-muted-foreground">Data de emissão</p><p className="font-medium">{formatDateTime(detail.dataEmissao)}</p></div>
                <div><p className="text-xs text-muted-foreground">Motorista</p><p className="font-medium">{motoristas.find(m => m.id === cargas.find(c => c.id === detail.cargaId)?.motoristaId)?.nome ?? "—"}</p></div>
                {detail.observacao && <div className="col-span-2"><p className="text-xs text-muted-foreground">Observação</p><p className="font-medium">{detail.observacao}</p></div>}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={novoOpen} onOpenChange={setNovoOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Gerar CIOT</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 text-sm">
            <p className="text-muted-foreground">A geração do CIOT é disparada automaticamente na formação da carga quando há contratação de ETC ou motorista agregado. Para registro manual:</p>
            <Card className="p-3 bg-slate-50 text-xs">
              <p className="font-semibold mb-1">Layout SEFAZ ainda aguarda liberação</p>
              <p className="text-muted-foreground">A ANTT tem prazo até 24/05/2026. O sistema vai integrar automaticamente assim que o WebService oficial for publicado (estimativa: semana de 19/05).</p>
            </Card>
            <Button className="w-full" onClick={() => setNovoOpen(false)}>Entendi</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
