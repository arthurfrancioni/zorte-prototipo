import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, Download, Eye, Plus, FileText, Truck, Mail, Hash, AlertTriangle, FlaskConical, Droplets, Package, ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { pedidos as pedidosBase, cargas, motoristas, veiculos, gruposEmail, ordensCarregamento, categoriaPorNCM, CategoriaCarga, Pedido } from "@/lib/mock-data";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils";
import { NovoPedidoDialog } from "@/components/pedidos/novo-pedido-dialog";

function CategoriaBadge({ categoria }: { categoria?: CategoriaCarga }) {
  if (!categoria || categoria === "geral") return <Badge variant="muted" className="text-[9px]">Geral</Badge>;
  if (categoria === "perigosa_liquida") return <Badge variant="destructive" className="text-[9px] gap-0.5"><Droplets className="w-2.5 h-2.5" />Perigosa líquida</Badge>;
  if (categoria === "perigosa_containerizada") return <Badge variant="destructive" className="text-[9px] gap-0.5"><AlertTriangle className="w-2.5 h-2.5" />Perigosa</Badge>;
  if (categoria === "granel") return <Badge variant="warning" className="text-[9px] gap-0.5"><FlaskConical className="w-2.5 h-2.5" />Granel</Badge>;
  return null;
}

export function Pedidos() {
  const navigate = useNavigate();
  const [busca, setBusca] = useState("");
  const [status, setStatus] = useState<string>("todos");
  const [uf, setUf] = useState<string>("todos");
  const [nfFiltro, setNfFiltro] = useState<string>("todos");
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>("todos");
  const [detail, setDetail] = useState<Pedido | null>(null);
  const [extras, setExtras] = useState<Pedido[]>([]);
  const [novoOpen, setNovoOpen] = useState(false);

  const pedidos = useMemo(() => [...extras, ...pedidosBase], [extras]);

  const filtered = pedidos.filter(p => {
    const matchBusca = busca === "" ||
      p.oc.toLowerCase().includes(busca.toLowerCase()) ||
      p.cliente.toLowerCase().includes(busca.toLowerCase()) ||
      p.cidade.toLowerCase().includes(busca.toLowerCase()) ||
      (p.notaFiscal?.toLowerCase().includes(busca.toLowerCase()) ?? false) ||
      p.produto.toLowerCase().includes(busca.toLowerCase());
    const matchStatus = status === "todos" || p.status === status;
    const matchUf = uf === "todos" || p.uf === uf;
    const matchNf =
      nfFiltro === "todos" ||
      (nfFiltro === "com_nf" && !!p.notaFiscal) ||
      (nfFiltro === "sem_nf" && !p.notaFiscal);
    const cat = p.categoria ?? categoriaPorNCM(p.ncm);
    const matchCat = categoriaFiltro === "todos" || cat === categoriaFiltro;
    return matchBusca && matchStatus && matchUf && matchNf && matchCat;
  });

  // Encontra a carga (e ordem) associada a um pedido
  function encontrarCargaDePedido(pedidoId: string) {
    const carga = cargas.find(c => c.pedidos.includes(pedidoId));
    if (!carga) return null;
    const motorista = motoristas.find(m => m.id === carga.motoristaId);
    const veiculo = veiculos.find(v => v.id === carga.veiculoId);
    const grupos = carga.gruposNotificacao.map(gId => gruposEmail.find(g => g.id === gId)?.nome).filter(Boolean);
    const ordem = ordensCarregamento.find(o => o.cargaId === carga.id);
    return { carga, motorista, veiculo, grupos, ordem };
  }

  const cargaInfo = detail ? encontrarCargaDePedido(detail.id) : null;
  const totalSemNF = pedidos.filter(p => !p.notaFiscal).length;
  const totalCasados = pedidos.filter(p => p.notaFiscal).length;

  return (
    <div>
      <PageHeader
        title="Pedidos"
        description={`${pedidos.length} pedidos · ${totalCasados} casados com NF · ${totalSemNF} sem NF${extras.length ? ` · ${extras.length} manual` : ""}`}
        badge={{ label: "Fase 1", variant: "phase1" }}
        actions={
          <>
            <Button variant="outline" size="sm"><Download className="w-3.5 h-3.5 mr-1.5" />Exportar</Button>
            <Button size="sm" onClick={() => setNovoOpen(true)}><Plus className="w-3.5 h-3.5 mr-1.5" />Novo pedido</Button>
          </>
        }
      />

      <Card className="p-4 mb-4">
        <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input value={busca} onChange={e => setBusca(e.target.value)} placeholder="Buscar por OC, NF, cliente, cidade ou produto..." className="pl-9" />
          </div>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os status</SelectItem>
              <SelectItem value="recebido">Recebido</SelectItem>
              <SelectItem value="programado">Programado</SelectItem>
              <SelectItem value="liberado">Liberado</SelectItem>
              <SelectItem value="em_carga">Em Carga</SelectItem>
              <SelectItem value="aguardando_nfe">Aguardando NFe</SelectItem>
              <SelectItem value="entregue">Entregue</SelectItem>
              <SelectItem value="redespacho">Redespacho</SelectItem>
            </SelectContent>
          </Select>
          <Select value={nfFiltro} onValueChange={setNfFiltro}>
            <SelectTrigger className="w-36"><SelectValue placeholder="NF" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">NF: todos</SelectItem>
              <SelectItem value="com_nf">✓ Com NF</SelectItem>
              <SelectItem value="sem_nf">○ Sem NF</SelectItem>
            </SelectContent>
          </Select>
          <Select value={categoriaFiltro} onValueChange={setCategoriaFiltro}>
            <SelectTrigger className="w-44"><SelectValue placeholder="Categoria" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todas categorias</SelectItem>
              <SelectItem value="perigosa_liquida">Perigosa líquida</SelectItem>
              <SelectItem value="perigosa_containerizada">Perigosa containerizada</SelectItem>
              <SelectItem value="granel">Granel</SelectItem>
              <SelectItem value="geral">Geral</SelectItem>
            </SelectContent>
          </Select>
          <Select value={uf} onValueChange={setUf}>
            <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">UF</SelectItem>
              {["SP", "RJ", "SC", "RS", "BA", "PE", "MG", "PR"].map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        {filtered.length !== pedidos.length && (
          <p className="text-[11px] text-muted-foreground mt-2">
            Mostrando {filtered.length} de {pedidos.length} pedidos · <button className="text-violet-600 underline" onClick={() => { setBusca(""); setStatus("todos"); setUf("todos"); setNfFiltro("todos"); setCategoriaFiltro("todos"); }}>limpar filtros</button>
          </p>
        )}
      </Card>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>OC</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Destino</TableHead>
              <TableHead>Produto · NCM</TableHead>
              <TableHead className="text-right">Peso</TableHead>
              <TableHead>NF</TableHead>
              <TableHead>Status</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(p => {
              const cat = p.categoria ?? categoriaPorNCM(p.ncm);
              return (
                <TableRow key={p.id} className="cursor-pointer hover:bg-slate-50" onClick={() => setDetail(p)}>
                  <TableCell className="font-mono text-blue-600 font-medium">{p.oc}</TableCell>
                  <TableCell className="font-medium">{p.cliente}</TableCell>
                  <TableCell className="text-sm">{p.cidade}/{p.uf}</TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm">{p.produto}</span>
                      <div className="flex items-center gap-1.5">
                        {p.ncm && <span className="text-[10px] text-muted-foreground font-mono">NCM {p.ncm}</span>}
                        <CategoriaBadge categoria={cat} />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">{p.pesoBruto.toLocaleString("pt-BR")} kg</TableCell>
                  <TableCell>
                    {p.notaFiscal ? (
                      <Badge variant="success" className="text-[10px] gap-0.5">
                        <FileText className="w-2.5 h-2.5" />{p.notaFiscal}
                      </Badge>
                    ) : (
                      <Badge variant="warning" className="text-[10px]">Aguardando</Badge>
                    )}
                  </TableCell>
                  <TableCell><StatusBadge status={p.status} /></TableCell>
                  <TableCell>
                    <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); setDetail(p); }}><Eye className="w-3.5 h-3.5" /></Button>
                  </TableCell>
                </TableRow>
              );
            })}
            {filtered.length === 0 && (
              <TableRow><TableCell colSpan={8} className="text-center text-sm text-muted-foreground py-8">Nenhum pedido encontrado com os filtros aplicados.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      <NovoPedidoDialog open={novoOpen} onOpenChange={setNovoOpen} onCreate={p => setExtras(prev => [p, ...prev])} />

      <Dialog open={!!detail} onOpenChange={() => setDetail(null)}>
        <DialogContent className="max-w-3xl">
          {detail && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3 mb-1">
                  <DialogTitle>Pedido {detail.oc}</DialogTitle>
                  <StatusBadge status={detail.status} />
                  <CategoriaBadge categoria={detail.categoria ?? categoriaPorNCM(detail.ncm)} />
                </div>
                <p className="text-xs text-muted-foreground">{detail.cliente} · CNPJ {detail.cnpjCliente}</p>
              </DialogHeader>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><p className="text-xs text-muted-foreground">Destino</p><p className="font-medium">{detail.cidade}/{detail.uf}</p></div>
                <div><p className="text-xs text-muted-foreground">Origem de liberação</p><p className="font-medium">{detail.origemLiberacao}</p></div>
                <div><p className="text-xs text-muted-foreground">Produto</p><p className="font-medium">{detail.produto}</p></div>
                <div><p className="text-xs text-muted-foreground">Embalagem</p><p className="font-medium">{detail.embalagem}</p></div>
                <div><p className="text-xs text-muted-foreground">Quantidade</p><p className="font-medium">{detail.quantidade}</p></div>
                <div><p className="text-xs text-muted-foreground">Peso bruto / líquido</p><p className="font-medium">{detail.pesoBruto} / {detail.pesoLiquido} kg</p></div>
                <div><p className="text-xs text-muted-foreground">Valor NF</p><p className="font-medium">{formatCurrency(detail.valor)}</p></div>
                <div><p className="text-xs text-muted-foreground">Prazo · Entrada</p><p className="font-medium">{formatDate(detail.prazo)} · {formatDate(detail.dataEntrada)}</p></div>
                <div><p className="text-xs text-muted-foreground">Tipo de operação</p><p className="font-medium capitalize">{detail.tipoOperacao.replace("_", " ")}</p></div>
                <div><p className="text-xs text-muted-foreground">NCM · Categoria</p><p className="font-medium">{detail.ncm ?? "—"} · {(detail.categoria ?? categoriaPorNCM(detail.ncm)).replace("_", " ")}</p></div>
              </div>

              {/* Nota Fiscal casada */}
              {detail.notaFiscal && (
                <Card className="p-3 bg-emerald-50 border-emerald-200 flex items-start gap-2 mt-2">
                  <FileText className="w-4 h-4 text-emerald-700 mt-0.5 shrink-0" />
                  <div className="text-xs flex-1">
                    <p className="font-semibold text-emerald-900">NF {detail.notaFiscal} casada por OC</p>
                    <p className="text-emerald-800 mt-0.5">Captura SEFAZ identificou a OC <span className="font-mono">{detail.oc}</span> na info complementar e fez o vínculo automático.</p>
                    {detail.chaveNFe && <p className="text-[10px] font-mono text-emerald-700 mt-1 truncate">Chave: {detail.chaveNFe}</p>}
                  </div>
                </Card>
              )}

              {/* Carga associada — só quando em_carga ou entregue */}
              {cargaInfo && (
                <Card className="p-3 mt-2 border-blue-200 bg-blue-50">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold text-blue-900 flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5" />
                      Carga associada
                    </p>
                    {cargaInfo.ordem && (
                      <Button size="sm" variant="outline" className="h-6 text-[10px]" onClick={() => navigate(`/ordens-carregamento/${cargaInfo.ordem!.id}`)}>
                        Ver ordem completa <ArrowRight className="w-2.5 h-2.5 ml-1" />
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div><p className="text-blue-700">Ordem · Carga</p><p className="font-mono font-semibold text-blue-900">{cargaInfo.ordem?.numero ?? cargaInfo.carga.numero}</p></div>
                    <div><p className="text-blue-700">Motorista</p><p className="font-medium text-blue-900">{cargaInfo.motorista?.nome ?? "—"}</p></div>
                    <div><p className="text-blue-700">Placa · Veículo</p><p className="font-mono font-medium text-blue-900">{cargaInfo.veiculo?.placa ?? "—"} · {cargaInfo.veiculo?.tipo ?? "—"}</p></div>
                    <div><p className="text-blue-700">Saída</p><p className="font-medium text-blue-900">{formatDateTime(`${cargaInfo.carga.dataSaida}T${cargaInfo.carga.horaSaida}:00`)}</p></div>
                    {cargaInfo.grupos.length > 0 && (
                      <div className="col-span-2 flex items-center gap-1.5">
                        <Mail className="w-3 h-3 text-blue-700" />
                        <p className="text-blue-700 text-[10px]">E-mail disparado para:</p>
                        <div className="flex flex-wrap gap-1">
                          {cargaInfo.grupos.map((g, i) => <Badge key={i} variant="info" className="text-[9px]">{g}</Badge>)}
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              )}

              {detail.observacao && (
                <Card className="p-3 bg-amber-50 border-amber-200 mt-2 text-xs text-amber-900">
                  <p className="font-semibold mb-0.5 flex items-center gap-1"><Package className="w-3 h-3" />Observação</p>
                  {detail.observacao}
                </Card>
              )}

              <div className="text-[10px] text-muted-foreground pt-1 flex items-center gap-1">
                <Hash className="w-2.5 h-2.5" />
                ID interno: {detail.id} · Origem: {detail.origemLiberacao}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
