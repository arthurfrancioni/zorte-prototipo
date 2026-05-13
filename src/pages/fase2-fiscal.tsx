import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, CheckCircle2, Clock, AlertCircle, RefreshCw, Eye, Info } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { ctes, cargas } from "@/lib/mock-data";
import { formatCurrency, formatDateTime } from "@/lib/utils";

export function CapturaSefaz() {
  const xmls = [
    { chave: "43260412345678000190550010000452310001234567", emitente: "Indústria Matriz S.A.", destinatario: "Primo Tedesco", valor: 12400, oc: "12.7934", status: "casado", cargaId: "crg1" },
    { chave: "43260412345678000190550010000452320001234568", emitente: "Indústria Matriz S.A.", destinatario: "Fernando CSA", valor: 8200, oc: "12.8012", status: "casado", cargaId: "crg1" },
    { chave: "43260412345678000190550010000452400001234569", emitente: "Indústria Matriz S.A.", destinatario: "Zanzalog", valor: 5400, oc: "12.8055", status: "casado", cargaId: "crg1" },
    { chave: "43260412345678000190550010000452480001234570", emitente: "Indústria Matriz S.A.", destinatario: "Quimex BA", valor: 18600, oc: "12.8091", status: "pendente" },
    { chave: "43260412345678000190550010000452490001234571", emitente: "Indústria Matriz S.A.", destinatario: "Quimex BA (emb.)", valor: 1200, oc: "12.8091", status: "pendente" },
    { chave: "43260412345678000190550010000452530001234572", emitente: "Indústria Matriz S.A.", destinatario: "Distrib. Norte RJ", valor: 32100, oc: "12.8102", status: "nao_casado" },
  ];

  return (
    <div>
      <PageHeader
        title="Captura SEFAZ"
        description="XMLs capturados via certificado A1 e casados com os pedidos pela Ordem de Compra"
        badge={{ label: "Fase 2", variant: "phase2" }}
        actions={<Button size="sm" variant="outline"><RefreshCw className="w-3.5 h-3.5 mr-1.5" />Sincronizar SEFAZ</Button>}
      />

      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard label="XMLs capturados hoje" value="24" icon={FileText} iconColor="blue" />
        <StatCard label="Casados automaticamente" value="22" subtitle="91.7% de acerto" icon={CheckCircle2} iconColor="emerald" />
        <StatCard label="Aguardando casamento" value="1" icon={Clock} iconColor="amber" />
        <StatCard label="Divergências" value="1" subtitle="Sem OC correspondente" icon={AlertCircle} iconColor="rose" />
      </div>

      <Card>
        <div className="p-5 border-b">
          <h3 className="text-sm font-semibold">XMLs capturados</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Captura em tempo real · última sincronização há 2 minutos</p>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Chave NFe</TableHead>
              <TableHead>Destinatário</TableHead>
              <TableHead>OC</TableHead>
              <TableHead className="text-right">Valor</TableHead>
              <TableHead>Casamento</TableHead>
              <TableHead>Carga</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {xmls.map((x, i) => (
              <TableRow key={i}>
                <TableCell className="font-mono text-[10px] text-muted-foreground">{x.chave.slice(-12)}...{x.chave.slice(-4)}</TableCell>
                <TableCell className="font-medium">{x.destinatario}</TableCell>
                <TableCell className="font-mono text-blue-600">{x.oc}</TableCell>
                <TableCell className="text-right font-medium">{formatCurrency(x.valor)}</TableCell>
                <TableCell>
                  {x.status === "casado" && <Badge variant="success">✓ Casado</Badge>}
                  {x.status === "pendente" && <Badge variant="warning">Aguardando carga</Badge>}
                  {x.status === "nao_casado" && <Badge variant="destructive">Sem OC</Badge>}
                </TableCell>
                <TableCell className="font-mono text-xs">{x.cargaId ? cargas.find(c => c.id === x.cargaId)?.numero : "—"}</TableCell>
                <TableCell className="flex gap-1">
                  <Button size="sm" variant="ghost"><Eye className="w-3.5 h-3.5" /></Button>
                  <Button size="sm" variant="ghost"><Download className="w-3.5 h-3.5" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

export function CTes() {
  return (
    <div>
      <PageHeader
        title="CT-e"
        description="Conhecimento de Transporte Eletrônico"
        badge={{ label: "Fase 2", variant: "phase2" }}
        actions={
          <>
            <Button size="sm" variant="outline">Emitir em lote</Button>
            <Button size="sm">Novo CT-e</Button>
          </>
        }
      />

      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard label="CT-e autorizados" value={ctes.filter(c => c.status === "autorizado").length} icon={CheckCircle2} iconColor="emerald" />
        <StatCard label="Pendentes" value={0} icon={Clock} iconColor="amber" />
        <StatCard label="Rejeitados" value={0} icon={AlertCircle} iconColor="rose" />
        <StatCard label="Valor total" value={formatCurrency(ctes.reduce((s, c) => s + c.valorFrete, 0))} icon={FileText} iconColor="blue" />
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Número</TableHead>
              <TableHead>Carga</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Rota</TableHead>
              <TableHead className="text-right">Peso</TableHead>
              <TableHead className="text-right">Valor frete</TableHead>
              <TableHead>Emissão</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Averbação</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ctes.map(c => (
              <TableRow key={c.id}>
                <TableCell className="font-mono text-blue-600 font-medium">{c.numero}</TableCell>
                <TableCell className="font-mono text-xs">{cargas.find(cc => cc.id === c.cargaId)?.numero}</TableCell>
                <TableCell className="font-medium">{c.cliente}</TableCell>
                <TableCell className="text-xs">{c.cidadeOrigem}/{c.ufOrigem} → {c.cidadeDestino}/{c.ufDestino}</TableCell>
                <TableCell className="text-right">{c.pesoKg} kg</TableCell>
                <TableCell className="text-right font-medium">{formatCurrency(c.valorFrete)}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{formatDateTime(c.dataEmissao)}</TableCell>
                <TableCell><StatusBadge status={c.status} /></TableCell>
                <TableCell className="font-mono text-xs">{c.averbacao}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

// Deriva múltiplos MDF-es por carga: a ANTT exige um manifesto por UF de descarga
type MdfeDerivado = {
  numero: string;
  cargaNumero: string;
  cargaId: string;
  ufOrigem: string;
  ufDestino: string;
  cteIds: string[];
  pesoTotal: number;
  valorTotal: number;
  status: "autorizado" | "encerrado";
  dataEmissao: string;
};

function derivarMdfesPorEstado(): MdfeDerivado[] {
  const lista: MdfeDerivado[] = [];
  for (const carga of cargas) {
    if (!carga.ctes || carga.ctes.length === 0) continue;
    const ctesDaCarga = ctes.filter(c => carga.ctes!.includes(c.id));
    const porUf = new Map<string, typeof ctesDaCarga>();
    for (const cte of ctesDaCarga) {
      const arr = porUf.get(cte.ufDestino) ?? [];
      arr.push(cte);
      porUf.set(cte.ufDestino, arr);
    }
    let i = 0;
    for (const [uf, agrupados] of porUf) {
      const seq = (++i).toString().padStart(2, "0");
      lista.push({
        numero: `MDFE-${carga.numero.replace("CRG-", "")}-${uf}${seq}`,
        cargaNumero: carga.numero,
        cargaId: carga.id,
        ufOrigem: carga.ufOrigem,
        ufDestino: uf,
        cteIds: agrupados.map(c => c.id),
        pesoTotal: agrupados.reduce((s, c) => s + c.pesoKg, 0),
        valorTotal: agrupados.reduce((s, c) => s + c.valorFrete, 0),
        status: carga.status === "finalizada" ? "encerrado" : "autorizado",
        dataEmissao: carga.dataSaida,
      });
    }
  }
  return lista.sort((a, b) => {
    if (a.cargaNumero !== b.cargaNumero) return b.cargaNumero.localeCompare(a.cargaNumero);
    return a.ufDestino.localeCompare(b.ufDestino);
  });
}

export function MDFE() {
  const mdfes = derivarMdfesPorEstado();

  // Agrupa visualmente por carga
  const porCarga = new Map<string, MdfeDerivado[]>();
  for (const m of mdfes) {
    const arr = porCarga.get(m.cargaNumero) ?? [];
    arr.push(m);
    porCarga.set(m.cargaNumero, arr);
  }

  return (
    <div>
      <PageHeader
        title="MDF-e"
        description="Manifesto Eletrônico de Documentos Fiscais · um manifesto por UF de destino (separação automática)"
        badge={{ label: "Fase 2", variant: "phase2" }}
      />

      <Card className="p-4 mb-4 bg-emerald-50 border-emerald-200 flex items-start gap-3">
        <Info className="w-4 h-4 text-emerald-700 mt-0.5 shrink-0" />
        <div className="text-xs text-emerald-900">
          <p className="font-semibold">Separação automática por estado</p>
          <p className="mt-0.5">Toda carga com destinos em múltiplas UFs gera <strong>um MDF-e por UF de descarga</strong> — exigência da ANTT. A placa fica travada após o vínculo do primeiro manifesto.</p>
        </div>
      </Card>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard label="MDF-es ativos" value={mdfes.filter(m => m.status === "autorizado").length} icon={FileText} iconColor="blue" />
        <StatCard label="UFs diferentes hoje" value={new Set(mdfes.map(m => m.ufDestino)).size} icon={FileText} iconColor="violet" />
        <StatCard label="CT-es manifestados" value={mdfes.reduce((s, m) => s + m.cteIds.length, 0)} icon={CheckCircle2} iconColor="emerald" />
        <StatCard label="Encerrados" value={mdfes.filter(m => m.status === "encerrado").length} icon={CheckCircle2} iconColor="emerald" />
      </div>

      {[...porCarga.entries()].map(([cargaNumero, items]) => {
        const carga = cargas.find(c => c.id === items[0].cargaId);
        return (
          <Card key={cargaNumero} className="mb-4">
            <div className="p-4 border-b flex items-center justify-between bg-slate-50">
              <div>
                <p className="text-sm font-semibold">Carga {cargaNumero}</p>
                <p className="text-xs text-muted-foreground">
                  Saída {carga ? new Date(carga.dataSaida).toLocaleDateString("pt-BR") : "—"} ·
                  Origem {items[0].ufOrigem} · {items.length} manifesto(s) gerado(s) para {items.length} UF(s)
                </p>
              </div>
              <Badge variant="info">{items.length} MDF-e</Badge>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Número MDF-e</TableHead>
                  <TableHead>UF origem → destino</TableHead>
                  <TableHead className="text-right">CT-e no manifesto</TableHead>
                  <TableHead className="text-right">Peso total</TableHead>
                  <TableHead className="text-right">Valor frete</TableHead>
                  <TableHead>Data emissão</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map(m => (
                  <TableRow key={m.numero}>
                    <TableCell className="font-mono text-blue-600 font-medium">{m.numero}</TableCell>
                    <TableCell><span className="font-semibold">{m.ufOrigem}</span> → <span className="font-semibold">{m.ufDestino}</span></TableCell>
                    <TableCell className="text-right font-medium">{m.cteIds.length}</TableCell>
                    <TableCell className="text-right">{m.pesoTotal.toLocaleString("pt-BR")} kg</TableCell>
                    <TableCell className="text-right">{formatCurrency(m.valorTotal)}</TableCell>
                    <TableCell className="text-sm">{new Date(m.dataEmissao).toLocaleDateString("pt-BR")}</TableCell>
                    <TableCell>
                      {m.status === "encerrado" ? <Badge variant="success">Encerrado</Badge> : <Badge variant="info">Autorizado</Badge>}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        );
      })}
    </div>
  );
}
