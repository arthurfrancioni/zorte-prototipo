import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, Filter, Download, Eye } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { pedidos, Pedido } from "@/lib/mock-data";
import { formatCurrency, formatDate } from "@/lib/utils";

export function Pedidos() {
  const [busca, setBusca] = useState("");
  const [status, setStatus] = useState<string>("todos");
  const [uf, setUf] = useState<string>("todos");
  const [detail, setDetail] = useState<Pedido | null>(null);

  const filtered = pedidos.filter(p => {
    const matchBusca = busca === "" ||
      p.oc.includes(busca) || p.cliente.toLowerCase().includes(busca.toLowerCase()) ||
      p.cidade.toLowerCase().includes(busca.toLowerCase());
    const matchStatus = status === "todos" || p.status === status;
    const matchUf = uf === "todos" || p.uf === uf;
    return matchBusca && matchStatus && matchUf;
  });

  return (
    <div>
      <PageHeader
        title="Pedidos"
        description={`${pedidos.length} pedidos cadastrados · sincronizado com Teams`}
        badge={{ label: "Fase 1", variant: "phase1" }}
        actions={<Button variant="outline" size="sm"><Download className="w-3.5 h-3.5 mr-1.5" />Exportar</Button>}
      />

      <Card className="p-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input value={busca} onChange={e => setBusca(e.target.value)} placeholder="Buscar por OC, cliente ou cidade..." className="pl-9" />
          </div>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os status</SelectItem>
              <SelectItem value="recebido">Recebido</SelectItem>
              <SelectItem value="programado">Programado</SelectItem>
              <SelectItem value="liberado">Liberado</SelectItem>
              <SelectItem value="em_carga">Em Carga</SelectItem>
              <SelectItem value="entregue">Entregue</SelectItem>
            </SelectContent>
          </Select>
          <Select value={uf} onValueChange={setUf}>
            <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todas UFs</SelectItem>
              <SelectItem value="SP">SP</SelectItem>
              <SelectItem value="RJ">RJ</SelectItem>
              <SelectItem value="SC">SC</SelectItem>
              <SelectItem value="RS">RS</SelectItem>
              <SelectItem value="BA">BA</SelectItem>
              <SelectItem value="PE">PE</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm"><Filter className="w-3.5 h-3.5 mr-1.5" />Mais filtros</Button>
        </div>
      </Card>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>OC</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Destino</TableHead>
              <TableHead>Produto</TableHead>
              <TableHead className="text-right">Peso</TableHead>
              <TableHead className="text-right">Valor</TableHead>
              <TableHead>Prazo</TableHead>
              <TableHead>Status</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(p => (
              <TableRow key={p.id}>
                <TableCell className="font-mono text-blue-600 font-medium">{p.oc}</TableCell>
                <TableCell className="font-medium">{p.cliente}</TableCell>
                <TableCell>{p.cidade}/{p.uf}</TableCell>
                <TableCell className="text-sm">{p.produto}</TableCell>
                <TableCell className="text-right">{p.pesoBruto} kg</TableCell>
                <TableCell className="text-right font-medium">{formatCurrency(p.valor)}</TableCell>
                <TableCell className="text-sm">{formatDate(p.prazo)}</TableCell>
                <TableCell><StatusBadge status={p.status} /></TableCell>
                <TableCell>
                  <Button size="sm" variant="ghost" onClick={() => setDetail(p)}><Eye className="w-3.5 h-3.5" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={!!detail} onOpenChange={() => setDetail(null)}>
        <DialogContent className="max-w-2xl">
          {detail && (
            <>
              <DialogHeader>
                <DialogTitle>Pedido {detail.oc}</DialogTitle>
                <p className="text-xs text-muted-foreground">{detail.cliente} · CNPJ {detail.cnpjCliente}</p>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><p className="text-xs text-muted-foreground">Destino</p><p className="font-medium">{detail.cidade}/{detail.uf}</p></div>
                <div><p className="text-xs text-muted-foreground">Origem de liberação</p><p className="font-medium">{detail.origemLiberacao}</p></div>
                <div><p className="text-xs text-muted-foreground">Produto</p><p className="font-medium">{detail.produto}</p></div>
                <div><p className="text-xs text-muted-foreground">Embalagem</p><p className="font-medium">{detail.embalagem}</p></div>
                <div><p className="text-xs text-muted-foreground">Quantidade</p><p className="font-medium">{detail.quantidade}</p></div>
                <div><p className="text-xs text-muted-foreground">Peso bruto / líquido</p><p className="font-medium">{detail.pesoBruto} / {detail.pesoLiquido} kg</p></div>
                <div><p className="text-xs text-muted-foreground">Valor</p><p className="font-medium">{formatCurrency(detail.valor)}</p></div>
                <div><p className="text-xs text-muted-foreground">Prazo</p><p className="font-medium">{formatDate(detail.prazo)}</p></div>
                <div><p className="text-xs text-muted-foreground">Data de entrada</p><p className="font-medium">{formatDate(detail.dataEntrada)}</p></div>
                <div><p className="text-xs text-muted-foreground">Tipo de operação</p><p className="font-medium capitalize">{detail.tipoOperacao.replace("_", " ")}</p></div>
                {detail.observacao && <div className="col-span-2"><p className="text-xs text-muted-foreground">Observação</p><p className="font-medium">{detail.observacao}</p></div>}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
