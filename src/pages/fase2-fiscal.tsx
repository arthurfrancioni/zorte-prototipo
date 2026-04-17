import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, CheckCircle2, Clock, AlertCircle, RefreshCw, Eye } from "lucide-react";
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

export function MDFE() {
  const mdfes = cargas.filter(c => c.mdfe).map(c => ({
    numero: c.mdfe!,
    carga: c.numero,
    cargaId: c.id,
    ufOrigem: c.ufOrigem,
    ctes: c.ctes?.length ?? 0,
    status: c.status === "finalizada" ? "encerrado" : "autorizado",
    dataEmissao: c.dataSaida,
  }));

  return (
    <div>
      <PageHeader
        title="MDF-e"
        description="Manifesto Eletrônico de Documentos Fiscais · placa travada após vínculo"
        badge={{ label: "Fase 2", variant: "phase2" }}
      />

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Número MDF-e</TableHead>
              <TableHead>Carga vinculada</TableHead>
              <TableHead>UF origem</TableHead>
              <TableHead className="text-right">CT-e no manifesto</TableHead>
              <TableHead>Data emissão</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mdfes.map(m => (
              <TableRow key={m.numero}>
                <TableCell className="font-mono text-blue-600 font-medium">{m.numero}</TableCell>
                <TableCell className="font-mono text-xs">{m.carga}</TableCell>
                <TableCell>{m.ufOrigem}</TableCell>
                <TableCell className="text-right font-medium">{m.ctes}</TableCell>
                <TableCell className="text-sm">{new Date(m.dataEmissao).toLocaleDateString("pt-BR")}</TableCell>
                <TableCell>
                  {m.status === "encerrado" ? <Badge variant="success">Encerrado</Badge> : <Badge variant="info">Autorizado</Badge>}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
