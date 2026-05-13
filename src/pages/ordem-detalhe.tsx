import { useMemo, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/layout/page-header";
import {
  ordensCarregamento, cargas, ctes as ctesData, motoristas, veiculos,
  gnres, ciots, valesPedagio, emailsEnviados, pedidos,
  OrdemCarregamento, CTe,
} from "@/lib/mock-data";
import { simGruposEmail, renderTemplateTokens, simItemCteIds } from "@/lib/simulacao-data";
import { loadSimulacaoExecutada } from "@/lib/simulacao-runtime";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import {
  ArrowLeft, FileText, FileSignature, Receipt, ShieldCheck, Route as RouteIcon,
  Truck, MapPin, Calendar, Mail, Package, CheckCircle2, Eye, Download,
  Building2, Hash, AlertCircle, History, Hourglass, Loader2, Shield,
  ArrowUpRight, ArrowDownLeft, Paperclip, Filter, Inbox, Send, Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { RevisaoTab } from "@/components/ordens/revisao-tab";
import { useEmissaoMonitor, tecnoriskCodigo, mdfeChave } from "@/components/ordens/use-emissao-monitor";
import { MonitorEmissaoBanner } from "@/components/ordens/monitor-emissao-banner";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetBody, SheetFooter, SheetClose,
} from "@/components/ui/sheet";

// Email "recebido" do cliente (resposta com XML da NFe) — gerado dinamicamente conforme polling
interface EmailRecebido {
  id: string;
  cargaId: string;
  remetente: string;
  remetenteEmail: string;
  assunto: string;
  timestamp: string;
  anexoXml: string;
  cteId: string;
  uf: string;
  destino: string;
  isNovo?: boolean; // anima na chegada
}

// Slug pra email do cliente (mock)
function emailFromClient(cliente: string) {
  return cliente
    .toLowerCase()
    .replace(/[áàâã]/g, "a").replace(/[éê]/g, "e").replace(/[í]/g, "i").replace(/[óôõ]/g, "o").replace(/[ú]/g, "u")
    .replace(/[·.]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") + "@cliente.com.br";
}

function StatusBadge({ status }: { status: OrdemCarregamento["status"] }) {
  if (status === "emitida") return <Badge variant="info">Emitida</Badge>;
  if (status === "em_transito") return <Badge variant="warning">Em trânsito</Badge>;
  if (status === "finalizada") return <Badge variant="success">Finalizada</Badge>;
  return <Badge variant="muted">Rascunho</Badge>;
}

export function OrdemDetalhe() {
  const { id } = useParams();
  const navigate = useNavigate();
  const ordem = ordensCarregamento.find(o => o.id === id);

  if (!ordem) {
    return (
      <div>
        <PageHeader title="Ordem não encontrada" />
        <Card className="p-8 text-center">
          <AlertCircle className="w-10 h-10 mx-auto text-rose-500 mb-2" />
          <p className="text-sm text-muted-foreground mb-4">Não encontramos a ordem <span className="font-mono">{id}</span>.</p>
          <Button onClick={() => navigate("/ordens-carregamento")}><ArrowLeft className="w-3.5 h-3.5 mr-1.5" />Voltar para listagem</Button>
        </Card>
      </div>
    );
  }

  const carga = cargas.find(c => c.id === ordem.cargaId);

  // Estado da simulação executada (se a ordem veio do simulador)
  const simExec = useMemo(() => {
    const s = loadSimulacaoExecutada();
    return s && s.ordemId === ordem.id ? s : null;
  }, [ordem.id]);

  // Motorista e veículo: prioridade pra seleção da simulação (pode ter sido trocado em Step1)
  const motorista = motoristas.find(m =>
    m.id === (simExec?.motoristaId ?? carga?.motoristaId)
  );
  const veiculo = veiculos.find(v =>
    v.id === (simExec?.veiculoId ?? carga?.veiculoId)
  );

  // CT-es exibidos: se a ordem veio da simulação, filtra pelos pedidos selecionados em Step1.
  // Caso contrário, mostra todos os CT-es vinculados à carga.
  const ctesDaOrdem = useMemo(() => {
    const todosDaCarga = ctesData.filter(c => carga?.ctes?.includes(c.id));
    if (!simExec) return todosDaCarga;
    // simItemCteIds mapeia índice em simItens → cte.id correspondente
    const cteIdsSelecionados = new Set(
      simExec.pedidosIdxs.map(i => simItemCteIds[i]).filter(Boolean)
    );
    const filtrados = todosDaCarga.filter(c => cteIdsSelecionados.has(c.id));
    // Se a seleção não bateu com nenhum CT-e (improvável), volta a mostrar todos
    return filtrados.length > 0 ? filtrados : todosDaCarga;
  }, [carga, simExec]);
  const gnresDaOrdem = useMemo(
    () => gnres.filter(g => ctesDaOrdem.some(c => c.id === g.cteId)),
    [ctesDaOrdem]
  );
  const ciotDaOrdem = ciots.find(c => c.cargaId === ordem.cargaId);
  const valeDaOrdem = valesPedagio.find(v => v.cargaId === ordem.cargaId);
  const pedidosDaOrdem = pedidos.filter(p => carga?.pedidos.includes(p.id));

  // Valores efetivos no header (sobrescrevem mock se a ordem veio da simulação)
  const motoristaNome = motorista?.nome ?? ordem.motorista;
  const placa = veiculo?.placa ?? ordem.placa;
  // UFs efetivas: derivadas dos CT-es filtrados
  const ufsEfetivas = useMemo(
    () => Array.from(new Set(ctesDaOrdem.map(c => c.ufDestino))),
    [ctesDaOrdem],
  );
  // Peso e valor frete recalculados conforme CT-es filtrados
  const pesoEfetivo = useMemo(
    () => ctesDaOrdem.reduce((s, c) => s + c.pesoKg, 0),
    [ctesDaOrdem],
  );
  const freteEfetivo = useMemo(
    () => ctesDaOrdem.reduce((s, c) => s + c.valorFrete, 0),
    [ctesDaOrdem],
  );

  // E-mails enviados: se esta ordem veio do simulador, constrói os e-mails a partir
  // dos grupos selecionados na Etapa 2. Caso contrário, usa o mock.
  const emailsDaOrdem = useMemo<EmailEnviadoEnriched[]>(() => {
    if (simExec) {
      const grupos = simGruposEmail.filter(g => simExec.gruposSelecionadosIds.includes(g.id));
      return grupos.map((g, i) => ({
        id: `sim-${g.id}`,
        cargaId: ordem.cargaId,
        assunto: renderTemplateTokens(g.template.assunto),
        grupos: [g.id],
        destinatarios: g.emails,
        // Distribui timestamps em sequência (delta de 200ms entre cada disparo)
        timestamp: new Date(new Date(simExec.timestamp).getTime() + i * 200).toISOString(),
        versao: 1,
        tipo: "inicial" as const,
        grupoNome: g.nome,
        grupoDescricao: g.descricao,
        criterio: g.criterio,
        corpo: renderTemplateTokens(g.template.corpo),
      }));
    }
    return emailsEnviados.filter(e => e.cargaId === ordem.cargaId);
  }, [simExec, ordem.cargaId]);

  // Monitor de emissão: ativo apenas se houver CT-es pendentes (aguardando NFe)
  const temCtesPendentes = useMemo(() => ctesDaOrdem.some(c => c.status === "pendente"), [ctesDaOrdem]);

  // Estado de e-mails recebidos — alimentado dinamicamente conforme NFes chegam pelo polling
  const [emailsRecebidos, setEmailsRecebidos] = useState<EmailRecebido[]>([]);

  const handleNfeArrived = useCallback((cte: CTe, idx: number) => {
    const novoNumero = `NF-${(39830 + idx).toString()}`;
    const novoEmail: EmailRecebido = {
      id: `recv-${cte.id}-${Date.now()}`,
      cargaId: ordem?.cargaId ?? "",
      remetente: cte.cliente,
      remetenteEmail: emailFromClient(cte.cliente),
      assunto: `Re: CARGA ${ordem?.numero ?? ""} · XML em anexo (${novoNumero})`,
      timestamp: new Date().toISOString(),
      anexoXml: `${novoNumero}.xml`,
      cteId: cte.id,
      uf: cte.ufDestino,
      destino: cte.cidadeDestino,
      isNovo: true,
    };
    setEmailsRecebidos(prev => [novoEmail, ...prev]);
    // Remove flag "novo" depois de 4s
    window.setTimeout(() => {
      setEmailsRecebidos(prev => prev.map(e => e.id === novoEmail.id ? { ...e, isNovo: false } : e));
    }, 4000);
  }, [ordem?.cargaId, ordem?.numero]);

  const monitor = useEmissaoMonitor(ctesDaOrdem, carga?.numero ?? "", temCtesPendentes, {
    onNfeArrived: handleNfeArrived,
  });

  // Filtro da timeline de comunicação
  const [comFiltro, setComFiltro] = useState<"todos" | "enviados" | "recebidos">("todos");

  // Status efetivo (com fallback para o status persistente do mock)
  const cteEffectiveStatus = (cte: typeof ctesDaOrdem[number], idx: number) => {
    if (cte.status !== "pendente") return cte.status;
    const s = monitor.cteStatus(idx);
    if (s === "autorizado") return "autorizado";
    if (s === "processando") return "processando";
    return "pendente";
  };

  // Agrupa CT-es por UF de destino (cada grupo = um MDF-e)
  const ctesPorUf = new Map<string, typeof ctesDaOrdem>();
  ctesDaOrdem.forEach(c => {
    const arr = ctesPorUf.get(c.ufDestino) ?? [];
    arr.push(c);
    ctesPorUf.set(c.ufDestino, arr);
  });
  const mdfes = Array.from(ctesPorUf.entries()).map(([uf, ctesUf], i) => ({
    numero: `MDFE-${carga!.numero.replace("CRG-", "")}-${uf}${(i + 1).toString().padStart(2, "0")}`,
    uf,
    ctes: ctesUf,
    pesoTotal: ctesUf.reduce((s, c) => s + c.pesoKg, 0),
    valorTotal: ctesUf.reduce((s, c) => s + c.valorFrete, 0),
  }));

  // Status do MDF-e: se houver CT-es pendentes, deriva do monitor; senão usa "autorizado" (legado)
  const mdfeEffectiveStatus = (uf: string): "autorizado" | "processando" | "aguardando_ctes" =>
    temCtesPendentes ? monitor.mdfeStatus(uf) : "autorizado";

  const totalCtesAuth = ctesDaOrdem.filter((c, i) => cteEffectiveStatus(c, i) === "autorizado").length;
  const totalGnreValor = gnresDaOrdem.reduce((s, g) => s + g.valor, 0);

  return (
    <div>
      <Button variant="ghost" size="sm" onClick={() => navigate("/ordens-carregamento")} className="mb-3 -ml-2">
        <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
        Voltar para listagem
      </Button>

      <PageHeader
        title={`Ordem de Carregamento ${ordem.numero}`}
        description={`Criada em ${new Date(ordem.dataCriacao).toLocaleString("pt-BR")} · ${motoristaNome} · ${placa}`}
        badge={{ label: "Operação", variant: "phase1" }}
        actions={
          <div className="flex items-center gap-2">
            <StatusBadge status={ordem.status} />
            <Button size="sm" variant="outline"><Download className="w-3.5 h-3.5 mr-1.5" />Exportar</Button>
          </div>
        }
      />

      {/* Resumo no topo */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        <Card className="p-4">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1"><Truck className="w-3 h-3" />Motorista · Placa</p>
          <p className="font-semibold text-sm mt-1">{motoristaNome}</p>
          <p className="font-mono text-xs text-muted-foreground">{placa} · {veiculo?.capacidadeKg.toLocaleString("pt-BR")} kg</p>
        </Card>
        <Card className="p-4">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1"><Building2 className="w-3 h-3" />Origem · Destinos</p>
          <p className="font-semibold text-sm mt-1 truncate">{ordem.origem}</p>
          <div className="flex flex-wrap gap-1 mt-1">
            {ufsEfetivas.map(u => <Badge key={u} variant="info" className="text-[9px]">{u}</Badge>)}
          </div>
        </Card>
        <Card className="p-4">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1"><Package className="w-3 h-3" />Peso · Valor</p>
          <p className="font-semibold text-sm mt-1">{pesoEfetivo.toLocaleString("pt-BR")} kg</p>
          <p className="text-xs text-muted-foreground">Frete: {formatCurrency(freteEfetivo)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1"><Hash className="w-3 h-3" />Documentos</p>
          <div className="flex items-center gap-2.5 mt-1 text-xs flex-wrap">
            <span className="inline-flex items-center gap-0.5 text-blue-700"><FileText className="w-3 h-3" />{ordem.qtdCtes} CT-e</span>
            <span className="inline-flex items-center gap-0.5 text-violet-700"><FileSignature className="w-3 h-3" />{ordem.qtdMdfes} MDF-e</span>
            {ordem.qtdGnres > 0 && <span className="inline-flex items-center gap-0.5 text-amber-700"><Receipt className="w-3 h-3" />{ordem.qtdGnres} GNRE</span>}
            {ordem.temCiot && <span className="inline-flex items-center gap-0.5 text-emerald-700"><ShieldCheck className="w-3 h-3" />CIOT</span>}
            {ordem.temValePedagio && <span className="inline-flex items-center gap-0.5 text-amber-700"><RouteIcon className="w-3 h-3" />Vale</span>}
          </div>
        </Card>
      </div>

      {/* Banner de monitoramento da emissão (apenas se houver CT-es pendentes) */}
      {temCtesPendentes && <MonitorEmissaoBanner monitor={monitor} />}

      <Tabs defaultValue="docs" className="space-y-4">
        <TabsList>
          <TabsTrigger value="docs">Documentos fiscais</TabsTrigger>
          <TabsTrigger value="pedidos">Pedidos &amp; NFes ({ctesDaOrdem.length})</TabsTrigger>
          <TabsTrigger value="comunicacao">Comunicação ({emailsDaOrdem.length + emailsRecebidos.length})</TabsTrigger>
          <TabsTrigger value="auxiliares">CIOT · Vale · Motorista</TabsTrigger>
          {temCtesPendentes && <TabsTrigger value="tecnorisk"><Shield className="w-3.5 h-3.5 mr-1.5" />Tecnorisk</TabsTrigger>}
          <TabsTrigger value="revisao"><History className="w-3.5 h-3.5 mr-1.5" />Revisão &amp; Histórico</TabsTrigger>
        </TabsList>

        {/* Tab: Documentos fiscais agrupados por MDF-e */}
        <TabsContent value="docs" className="space-y-3">
          <Card className="p-4 bg-violet-50 border-violet-200 flex items-start gap-2 text-xs">
            <FileSignature className="w-4 h-4 text-violet-700 mt-0.5 shrink-0" />
            <p className="text-violet-900">
              Esta ordem gerou <strong>{mdfes.length} MDF-e(s)</strong> — um por UF de descarga, com os CT-es e GNREs vinculados.
              CIOT e Vale-pedágio cobrem toda a operação.
            </p>
          </Card>

          {mdfes.map((m) => {
            const mdfeStatus = mdfeEffectiveStatus(m.uf);
            return (
            <Card key={m.numero} className="overflow-hidden">
              <div className="p-4 bg-gradient-to-r from-violet-50 to-white border-b flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center">
                    <FileSignature className="w-5 h-5 text-violet-700" />
                  </div>
                  <div>
                    <p className="font-mono font-bold text-sm text-violet-900">{mdfeStatus === "autorizado" ? m.numero : "—"}</p>
                    <p className="text-xs text-muted-foreground">
                      <span className="font-semibold">{carga?.ufOrigem}</span> → <span className="font-semibold">{m.uf}</span> ·
                      {" "}{m.ctes.length} CT-e · {m.pesoTotal.toLocaleString("pt-BR")} kg · {formatCurrency(m.valorTotal)}
                    </p>
                  </div>
                </div>
                {mdfeStatus === "autorizado" && <Badge variant="success" className="gap-1"><CheckCircle2 className="w-3 h-3" />Autorizado</Badge>}
                {mdfeStatus === "processando" && <Badge variant="info" className="gap-1 animate-pulse"><Loader2 className="w-3 h-3 animate-spin" />Emitindo MDF-e</Badge>}
                {mdfeStatus === "aguardando_ctes" && <Badge variant="warning" className="gap-1"><Hourglass className="w-3 h-3" />Aguardando CT-es</Badge>}
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>CT-e</TableHead>
                    <TableHead>Cliente · Rota</TableHead>
                    <TableHead className="text-right">Peso</TableHead>
                    <TableHead className="text-right">Frete</TableHead>
                    <TableHead>GNRE (ICMS-ST)</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {m.ctes.map(c => {
                    const idx = ctesDaOrdem.indexOf(c);
                    const status = cteEffectiveStatus(c, idx);
                    const numeroCte = status === "autorizado"
                      ? (c.numero !== "—" ? c.numero : `CTE-2026-${(240 + idx).toString().padStart(5, "0")}`)
                      : "—";
                    const gnre = gnresDaOrdem.find(g => g.cteId === c.id);
                    const gnreVisivel = status === "autorizado" && gnre;
                    return (
                      <TableRow key={c.id} className={status === "processando" ? "bg-violet-50/40" : status === "pendente" ? "opacity-60" : ""}>
                        <TableCell className="font-mono text-blue-600 font-medium">{numeroCte}</TableCell>
                        <TableCell>
                          <p className="text-sm font-medium">{c.cliente}</p>
                          <p className="text-[10px] text-muted-foreground">{c.cidadeOrigem}/{c.ufOrigem} → {c.cidadeDestino}/{c.ufDestino}</p>
                        </TableCell>
                        <TableCell className="text-right text-sm">{c.pesoKg.toLocaleString("pt-BR")} kg</TableCell>
                        <TableCell className="text-right font-medium">{formatCurrency(c.valorFrete)}</TableCell>
                        <TableCell>
                          {gnreVisivel ? (
                            <div className="flex flex-col">
                              <span className="font-mono text-[10px] text-amber-700">{gnre!.numero}</span>
                              <span className="text-xs">{formatCurrency(gnre!.valor)} · UF {gnre!.ufRecolhimento}</span>
                            </div>
                          ) : (
                            <span className="text-[10px] text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {status === "autorizado" && <Badge variant="success" className="text-[9px] gap-0.5"><CheckCircle2 className="w-2.5 h-2.5" />Autorizado</Badge>}
                          {status === "processando" && <Badge variant="info" className="text-[9px] gap-0.5 animate-pulse"><Loader2 className="w-2.5 h-2.5 animate-spin" />Emitindo</Badge>}
                          {status === "pendente" && <Badge variant="warning" className="text-[9px] gap-0.5"><Hourglass className="w-2.5 h-2.5" />Aguardando NFe</Badge>}
                          {status === "rejeitado" && <Badge variant="destructive" className="text-[9px] gap-0.5"><AlertCircle className="w-2.5 h-2.5" />Rejeitado</Badge>}
                        </TableCell>
                        <TableCell>{status === "autorizado" && <Button size="sm" variant="ghost"><Eye className="w-3.5 h-3.5" /></Button>}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Card>
            );
          })}

          <Card className="p-4 bg-emerald-50 border-emerald-200 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-emerald-900">
              <CheckCircle2 className="w-4 h-4" />
              <span><strong>{totalCtesAuth}/{ctesDaOrdem.length} CT-es autorizados</strong> · {gnresDaOrdem.length} GNREs geradas · totalizando <strong>{formatCurrency(totalGnreValor)}</strong> em ICMS-ST</span>
            </div>
            <Button size="sm" variant="outline"><Download className="w-3.5 h-3.5 mr-1.5" />Baixar XMLs em lote</Button>
          </Card>
        </TabsContent>

        {/* Tab: Pedidos — uma linha por CT-e/pedido, com NFe atualizada dinamicamente conforme polling */}
        <TabsContent value="pedidos">
          <Card>
            <div className="p-4 border-b flex items-center justify-between gap-3 flex-wrap">
              <div>
                <p className="text-sm font-semibold flex items-center gap-2"><Package className="w-4 h-4 text-violet-600" />Pedidos & NFes da ordem</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {temCtesPendentes
                    ? <><strong>{emailsRecebidos.length}</strong> de <strong>{ctesDaOrdem.length}</strong> NFes recebidas via resposta de e-mail · {ctesDaOrdem.length - emailsRecebidos.length} aguardando</>
                    : <><strong>{ctesDaOrdem.length}</strong> pedidos · todas NFes casadas</>}
                </p>
              </div>
              {temCtesPendentes && (
                <div className="flex items-center gap-2">
                  <Badge variant="success" className="text-[10px] gap-0.5">
                    <CheckCircle2 className="w-2.5 h-2.5" />{emailsRecebidos.length} casadas
                  </Badge>
                  <Badge variant="warning" className="text-[10px] gap-0.5">
                    <Hourglass className="w-2.5 h-2.5" />{ctesDaOrdem.length - emailsRecebidos.length} aguardando
                  </Badge>
                </div>
              )}
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>OC</TableHead>
                  <TableHead>Cliente · Destino</TableHead>
                  <TableHead>Produto · Tipo</TableHead>
                  <TableHead className="text-right">Peso</TableHead>
                  <TableHead className="text-right">Valor frete</TableHead>
                  <TableHead>NFe associada</TableHead>
                  <TableHead>CT-e</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ctesDaOrdem.map((c, idx) => {
                  // Tenta achar um pedido do mock alinhado por index (carga.pedidos vem na mesma ordem dos CT-es no seed)
                  const pedido = pedidosDaOrdem[idx];
                  const status = cteEffectiveStatus(c, idx);
                  // Email recebido associado (caso o polling tenha trazido essa NFe)
                  const emailNfe = emailsRecebidos.find(e => e.cteId === c.id);
                  // NF a exibir: prioridade pra email recebido, fallback pra mock (cargas antigas já emitidas)
                  const nfNumero = emailNfe?.anexoXml.replace(".xml", "")
                    ?? (status === "autorizado" && c.notasFiscais.length > 0 ? c.notasFiscais[0] : null);
                  const numeroCte = status === "autorizado"
                    ? (c.numero !== "—" ? c.numero : `CTE-2026-${(240 + idx).toString().padStart(5, "0")}`)
                    : null;

                  return (
                    <TableRow key={c.id} className={cn(
                      emailNfe?.isNovo && "bg-emerald-50/60 animate-pulse",
                      status === "processando" && "bg-violet-50/30",
                    )}>
                      <TableCell className="font-mono text-blue-600 text-xs">{pedido?.oc ?? "—"}</TableCell>
                      <TableCell>
                        <p className="text-sm font-medium">{c.cliente}</p>
                        <p className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                          <MapPin className="w-2.5 h-2.5" />{c.cidadeDestino}/{c.ufDestino}
                        </p>
                      </TableCell>
                      <TableCell>
                        <p className="text-xs">{pedido?.produto ?? "—"}</p>
                        {pedido && (
                          <div className="mt-0.5">
                            {pedido.tipoOperacao === "venda" && <Badge variant="info" className="text-[9px]">Venda</Badge>}
                            {pedido.tipoOperacao === "transferencia" && <Badge variant="warning" className="text-[9px]">Transferência</Badge>}
                            {pedido.tipoOperacao === "coleta_fornecedor" && <Badge variant="muted" className="text-[9px]">Coleta</Badge>}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-right text-sm">{c.pesoKg.toLocaleString("pt-BR")} kg</TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(c.valorFrete)}</TableCell>
                      <TableCell>
                        {nfNumero ? (
                          <div className="flex flex-col gap-0.5">
                            <div className="inline-flex items-center gap-1 text-emerald-700">
                              <Paperclip className="w-3 h-3" />
                              <span className="font-mono text-[11px] font-medium">{nfNumero}</span>
                            </div>
                            {emailNfe?.isNovo && (
                              <Badge variant="warning" className="text-[9px] w-fit animate-pulse">NOVO · acabou de chegar</Badge>
                            )}
                            {emailNfe && !emailNfe.isNovo && (
                              <span className="text-[9px] text-muted-foreground">recebida via e-mail</span>
                            )}
                          </div>
                        ) : (
                          <Badge variant="warning" className="text-[9px] gap-0.5">
                            <Hourglass className="w-2.5 h-2.5" />Aguardando NFe
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {status === "autorizado" && numeroCte && (
                          <div className="flex flex-col gap-0.5">
                            <span className="font-mono text-[11px] text-blue-600 font-medium">{numeroCte}</span>
                            <Badge variant="success" className="text-[9px] gap-0.5 w-fit"><CheckCircle2 className="w-2.5 h-2.5" />Autorizado</Badge>
                          </div>
                        )}
                        {status === "processando" && (
                          <Badge variant="info" className="text-[9px] gap-0.5 animate-pulse"><Loader2 className="w-2.5 h-2.5 animate-spin" />Emitindo</Badge>
                        )}
                        {status === "pendente" && (
                          <Badge variant="muted" className="text-[9px] gap-0.5"><Hourglass className="w-2.5 h-2.5" />—</Badge>
                        )}
                        {status === "rejeitado" && (
                          <Badge variant="destructive" className="text-[9px] gap-0.5"><AlertCircle className="w-2.5 h-2.5" />Rejeitado</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* Tab: Comunicação — timeline unificada de e-mails enviados e recebidos */}
        <TabsContent value="comunicacao">
          <ComunicacaoTimeline
            enviados={emailsDaOrdem}
            recebidos={emailsRecebidos}
            filtro={comFiltro}
            setFiltro={setComFiltro}
            esperandoMais={temCtesPendentes && !monitor.allArrived}
            totalEsperado={ctesDaOrdem.length}
            secondsToNext={monitor.secondsToNext}
            paused={monitor.paused}
            ordemNumero={ordem.numero}
            motoristaNome={motoristaNome}
            placa={placa}
          />
        </TabsContent>

        {/* Tab: Auxiliares (CIOT + Vale + Motorista) */}
        <TabsContent value="auxiliares" className="space-y-3">
          {/* CIOT */}
          <Card className="overflow-hidden">
            <div className="p-4 border-b bg-gradient-to-r from-emerald-50 to-white flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center"><ShieldCheck className="w-5 h-5 text-emerald-700" /></div>
              <div className="flex-1">
                <p className="text-sm font-semibold">CIOT — Código Identificador da Operação de Transporte</p>
                <p className="text-xs text-muted-foreground">Obrigatório a partir de 24/05/2026 (ANTT)</p>
              </div>
              {ciotDaOrdem && <Badge variant="success">{ciotDaOrdem.status === "pago" ? "Pago" : "Gerado"}</Badge>}
            </div>
            <div className="p-4 grid grid-cols-3 gap-4 text-sm">
              {ciotDaOrdem ? (
                <>
                  <div><p className="text-[10px] text-muted-foreground uppercase tracking-wider">Número</p><p className="font-mono font-semibold mt-0.5">{ciotDaOrdem.numero}</p></div>
                  <div><p className="text-[10px] text-muted-foreground uppercase tracking-wider">Transportador</p><p className="font-medium mt-0.5">{ciotDaOrdem.transportadorNome}</p><p className="text-[10px] text-muted-foreground font-mono">{ciotDaOrdem.transportadorCnpjCpf}</p></div>
                  <div><p className="text-[10px] text-muted-foreground uppercase tracking-wider">Tipo</p><p className="font-medium mt-0.5 capitalize">{ciotDaOrdem.transportadorTipo.replace("_", " ")}</p></div>
                  <div><p className="text-[10px] text-muted-foreground uppercase tracking-wider">Piso ANTT</p><p className="font-medium mt-0.5">{ciotDaOrdem.pisoMinimoAntt > 0 ? formatCurrency(ciotDaOrdem.pisoMinimoAntt) : "Não aplicável"}</p></div>
                  <div><p className="text-[10px] text-muted-foreground uppercase tracking-wider">Frete contratado</p><p className="font-medium mt-0.5">{ciotDaOrdem.valorFrete > 0 ? formatCurrency(ciotDaOrdem.valorFrete) : "—"}</p></div>
                  <div><p className="text-[10px] text-muted-foreground uppercase tracking-wider">Banco · Conta</p><p className="font-medium mt-0.5 text-xs">{ciotDaOrdem.banco === "—" ? "Frota própria" : `${ciotDaOrdem.banco} · Ag ${ciotDaOrdem.agencia} · ${ciotDaOrdem.conta}`}</p></div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground col-span-3">CIOT não foi gerado para esta operação (provavelmente frota própria sem registro de contratação).</p>
              )}
            </div>
          </Card>

          {/* Vale-pedágio */}
          <Card className="overflow-hidden">
            <div className="p-4 border-b bg-gradient-to-r from-amber-50 to-white flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center"><RouteIcon className="w-5 h-5 text-amber-700" /></div>
              <div className="flex-1">
                <p className="text-sm font-semibold">Vale-Pedágio</p>
                <p className="text-xs text-muted-foreground">Rota via GraphHopper · valor pela tabela ANTT por eixos</p>
              </div>
              {valeDaOrdem && <Badge variant="success">{valeDaOrdem.status === "utilizado" ? "Utilizado" : "Emitido"}</Badge>}
            </div>
            <div className="p-4">
              {valeDaOrdem ? (
                <>
                  <div className="grid grid-cols-4 gap-4 text-sm mb-3">
                    <div><p className="text-[10px] text-muted-foreground uppercase tracking-wider">Número</p><p className="font-mono font-semibold mt-0.5">{valeDaOrdem.numero}</p></div>
                    <div><p className="text-[10px] text-muted-foreground uppercase tracking-wider">Emissor</p><p className="font-medium mt-0.5">{valeDaOrdem.emissor}</p></div>
                    <div><p className="text-[10px] text-muted-foreground uppercase tracking-wider">KM · Eixos</p><p className="font-medium mt-0.5">{valeDaOrdem.kmTotal.toLocaleString("pt-BR")} · {valeDaOrdem.eixos}</p></div>
                    <div><p className="text-[10px] text-muted-foreground uppercase tracking-wider">Valor</p><p className="font-medium mt-0.5 text-emerald-700">{formatCurrency(valeDaOrdem.valor)}</p></div>
                  </div>
                  <Card className="p-3 bg-violet-50 border-violet-200 flex items-start gap-2 text-xs">
                    <MapPin className="w-3.5 h-3.5 text-violet-700 mt-0.5 shrink-0" />
                    <div className="text-violet-900">
                      <p className="font-semibold">Rota multi-stop</p>
                      <p className="mt-0.5">{valeDaOrdem.origem} → {valeDaOrdem.destino}</p>
                    </div>
                  </Card>
                  <Card className="p-3 bg-emerald-50 border-emerald-200 mt-2 flex items-start gap-2 text-xs">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 mt-0.5 shrink-0" />
                    <p className="text-emerald-900"><strong>Conformidade ANTT:</strong> valor calculado respeitando o piso mínimo por eixo.</p>
                  </Card>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">Vale-pedágio não foi gerado para esta operação.</p>
              )}
            </div>
          </Card>

          {/* Motorista */}
          <Card className="overflow-hidden">
            <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-white flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center"><Truck className="w-5 h-5 text-blue-700" /></div>
              <div className="flex-1">
                <p className="text-sm font-semibold">Motorista e veículo</p>
                <p className="text-xs text-muted-foreground">Cadastro vinculado · placa travada após o primeiro MDF-e</p>
              </div>
            </div>
            <div className="p-4 grid grid-cols-3 gap-4 text-sm">
              <div><p className="text-[10px] text-muted-foreground uppercase tracking-wider">Motorista</p><p className="font-medium mt-0.5">{motoristaNome}</p><p className="text-[10px] text-muted-foreground font-mono">CPF {motorista?.cpf ?? "—"}</p></div>
              <div><p className="text-[10px] text-muted-foreground uppercase tracking-wider">Telefone</p><p className="font-medium mt-0.5">{motorista?.telefone ?? "—"}</p></div>
              <div><p className="text-[10px] text-muted-foreground uppercase tracking-wider">CNH · Cat.</p><p className="font-medium mt-0.5">{motorista?.cnh ?? "—"} · {motorista?.categoria ?? "—"}</p></div>
              <div><p className="text-[10px] text-muted-foreground uppercase tracking-wider">Placa</p><p className="font-mono font-semibold mt-0.5">{placa}</p></div>
              <div><p className="text-[10px] text-muted-foreground uppercase tracking-wider">Tipo · Capacidade</p><p className="font-medium mt-0.5 capitalize">{veiculo?.tipo ?? "—"} · {veiculo?.capacidadeKg.toLocaleString("pt-BR") ?? "—"} kg</p></div>
              <div><p className="text-[10px] text-muted-foreground uppercase tracking-wider">Cargas no mês</p><p className="font-medium mt-0.5">{motorista?.cargasMes ?? "—"} · avaliação {motorista?.avaliacao ?? "—"}/5</p></div>
            </div>
          </Card>
        </TabsContent>

        {/* Tab Tecnorisk — só aparece quando há CT-es pendentes (fluxo de monitoramento) */}
        {temCtesPendentes && (
          <TabsContent value="tecnorisk" className="space-y-3">
            <Card className="p-3 bg-amber-50 border-amber-200 flex items-start gap-2 text-xs text-amber-900">
              <Shield className="w-4 h-4 mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold mb-0.5">Solicitação automática de monitoramento</p>
                <p>
                  A cada MDF-e autorizado, o sistema envia a chave do documento para a Tecnorisk junto com placa, motorista e CPF.
                  Quando a Tecnorisk confirma, a carga fica monitorada em tempo real no painel da transportadora.
                </p>
              </div>
            </Card>

            <div className="grid grid-cols-2 gap-3">
              {mdfes.map((m, idx) => {
                const ts = monitor.tecnoriskStatus(m.uf);
                const mdfeStatus = monitor.mdfeStatus(m.uf);
                const cod = tecnoriskCodigo(m.uf, carga?.numero ?? "");
                const chave = mdfeChave(m.uf, idx);
                return (
                  <Card key={m.uf} className={
                    ts === "ativo" ? "p-4 border-emerald-300 bg-emerald-50/40" :
                    ts === "processando" ? "p-4 border-violet-300 bg-violet-50/40" :
                    "p-4"
                  }>
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className={
                        ts === "ativo" ? "w-4 h-4 text-emerald-700" :
                        ts === "processando" ? "w-4 h-4 text-violet-700 animate-pulse" :
                        "w-4 h-4 text-slate-400"
                      } />
                      <span className="font-semibold text-sm">Tecnorisk · UF {m.uf}</span>
                      <div className="ml-auto">
                        {ts === "ativo" && <Badge variant="success" className="text-[9px] gap-0.5"><CheckCircle2 className="w-2.5 h-2.5" />Monitoramento ativo</Badge>}
                        {ts === "processando" && <Badge variant="info" className="text-[9px] gap-0.5 animate-pulse"><Loader2 className="w-2.5 h-2.5 animate-spin" />Solicitando</Badge>}
                        {ts === "pendente" && (
                          <Badge variant="muted" className="text-[9px] gap-0.5">
                            <Hourglass className="w-2.5 h-2.5" />
                            {mdfeStatus === "autorizado" ? "Aguardando envio" : "Aguardando MDF-e"}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs mt-2">
                      <div>
                        <p className="text-[9px] uppercase text-muted-foreground tracking-wider">Código</p>
                        <p className="font-mono font-semibold text-[11px]">{ts !== "pendente" ? cod : "—"}</p>
                      </div>
                      <div>
                        <p className="text-[9px] uppercase text-muted-foreground tracking-wider">Placa</p>
                        <p className="font-mono font-semibold text-[11px]">{placa}</p>
                      </div>
                      <div>
                        <p className="text-[9px] uppercase text-muted-foreground tracking-wider">Motorista</p>
                        <p className="font-medium text-[11px] truncate">{motoristaNome}</p>
                      </div>
                      <div>
                        <p className="text-[9px] uppercase text-muted-foreground tracking-wider">CPF · Telefone</p>
                        <p className="font-mono text-[11px]">{motorista?.cpf ?? "—"}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-[9px] uppercase text-muted-foreground tracking-wider">Chave do MDF-e enviada</p>
                        <p className="font-mono text-[10px] break-all">{mdfeStatus === "autorizado" ? chave : "Aguardando autorização do MDF-e"}</p>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>

            <Card className="p-4 bg-slate-50 border-slate-200 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-slate-700">
                <Shield className="w-4 h-4 text-emerald-600" />
                <span>
                  <strong>{monitor.activeTecnoriskUfs.size} / {mdfes.length}</strong> solicitações ativas ·
                  Soma dos manifestos: <strong>{formatCurrency(freteEfetivo + (ciotDaOrdem?.valorFrete ?? 0))}</strong>
                </span>
              </div>
              <Button size="sm" variant="outline" onClick={() => navigate("/tecnorisk")}>
                Ver integração completa
              </Button>
            </Card>
          </TabsContent>
        )}

        {/* Tab Revisão & Histórico — antes vivia em /cargas/:id, agora consolidada aqui */}
        <TabsContent value="revisao">
          <RevisaoTab cargaId={ordem.cargaId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ===================================================================
// Aba "Comunicação" — timeline unificada de e-mails enviados + recebidos
// E-mails enviados: disparos da formação de carga (mock estático)
// E-mails recebidos: respostas dos clientes com XML da NFe (alimentado pelo polling)
// ===================================================================

type EmailEnviado = typeof emailsEnviados[number];

// Tipo enriquecido — superset do mock, com info do grupo destinatário (quando vem da simulação)
type EmailEnviadoEnriched = EmailEnviado & {
  grupoNome?: string;
  grupoDescricao?: string;
  criterio?: string;
  corpo?: string;
};

type TimelineItem =
  | { kind: "enviado"; data: EmailEnviadoEnriched; ts: number }
  | { kind: "recebido"; data: EmailRecebido; ts: number };

function ComunicacaoTimeline({
  enviados, recebidos, filtro, setFiltro, esperandoMais, totalEsperado, secondsToNext, paused,
  ordemNumero, motoristaNome, placa,
}: {
  enviados: EmailEnviadoEnriched[];
  recebidos: EmailRecebido[];
  filtro: "todos" | "enviados" | "recebidos";
  setFiltro: (f: "todos" | "enviados" | "recebidos") => void;
  esperandoMais: boolean;
  totalEsperado: number;
  secondsToNext: number;
  paused: boolean;
  ordemNumero: string;
  motoristaNome: string;
  placa: string;
}) {
  const [detalhe, setDetalhe] = useState<TimelineItem | null>(null);

  // Combina e ordena timeline (mais recente primeiro)
  const items: TimelineItem[] = [
    ...enviados.map(e => ({ kind: "enviado" as const, data: e, ts: new Date(e.timestamp).getTime() })),
    ...recebidos.map(r => ({ kind: "recebido" as const, data: r, ts: new Date(r.timestamp).getTime() })),
  ].sort((a, b) => b.ts - a.ts);

  const itemsFiltrados = items.filter(it => {
    if (filtro === "todos") return true;
    if (filtro === "enviados") return it.kind === "enviado";
    return it.kind === "recebido";
  });

  return (
    <Card className="overflow-hidden">
      {/* Header com filtros e contadores */}
      <div className="p-4 border-b bg-gradient-to-r from-violet-50/30 to-white">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-violet-100 flex items-center justify-center">
              <Mail className="w-4 h-4 text-violet-700" />
            </div>
            <div>
              <p className="text-sm font-semibold">Comunicação por e-mail</p>
              <p className="text-[11px] text-muted-foreground">Disparos da operação · respostas dos clientes com XML em anexo</p>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5">
            <button
              onClick={() => setFiltro("todos")}
              className={cn(
                "px-2.5 py-1 text-xs rounded inline-flex items-center gap-1 transition-colors",
                filtro === "todos" ? "bg-white shadow-sm font-medium" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Filter className="w-3 h-3" />Todos
              <Badge variant="muted" className="text-[9px] ml-0.5">{items.length}</Badge>
            </button>
            <button
              onClick={() => setFiltro("enviados")}
              className={cn(
                "px-2.5 py-1 text-xs rounded inline-flex items-center gap-1 transition-colors",
                filtro === "enviados" ? "bg-white shadow-sm font-medium" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Send className="w-3 h-3" />Enviados
              <Badge variant="info" className="text-[9px] ml-0.5">{enviados.length}</Badge>
            </button>
            <button
              onClick={() => setFiltro("recebidos")}
              className={cn(
                "px-2.5 py-1 text-xs rounded inline-flex items-center gap-1 transition-colors",
                filtro === "recebidos" ? "bg-white shadow-sm font-medium" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Inbox className="w-3 h-3" />Recebidos
              <Badge variant="success" className="text-[9px] ml-0.5">{recebidos.length}</Badge>
            </button>
          </div>
        </div>

        {/* Barra de status do polling — aparece quando ainda esperando NFes */}
        {esperandoMais && (
          <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded flex items-center gap-2 text-[11px] text-amber-900">
            <Loader2 className={cn("w-3.5 h-3.5", paused ? "" : "animate-spin")} />
            <span>
              Aguardando mais respostas — <strong>{recebidos.length} / {totalEsperado}</strong> NFes recebidas
            </span>
            {!paused && (
              <span className="ml-auto text-[10px] text-amber-700">
                próxima verificação em <strong className="tabular-nums">{secondsToNext}s</strong>
              </span>
            )}
            {paused && <span className="ml-auto text-[10px] text-rose-700 font-medium">Pausado</span>}
          </div>
        )}
      </div>

      {/* Timeline */}
      <div className="divide-y">
        {itemsFiltrados.length === 0 && (
          <div className="p-8 text-center text-sm text-muted-foreground">
            <Mail className="w-8 h-8 mx-auto mb-2 opacity-40" />
            {filtro === "recebidos" ? "Nenhuma resposta recebida ainda." :
             filtro === "enviados" ? "Nenhum e-mail disparado ainda." :
             "Nenhum e-mail registrado para esta ordem."}
          </div>
        )}

        {itemsFiltrados.map((item) =>
          item.kind === "enviado" ? (
            <EnviadoRow
              key={`s-${item.data.id}`}
              email={item.data}
              recebidos={recebidos}
              onClick={() => setDetalhe(item)}
            />
          ) : (
            <RecebidoRow
              key={`r-${item.data.id}`}
              email={item.data}
              onClick={() => setDetalhe(item)}
            />
          )
        )}
      </div>

      {/* Drawer lateral com detalhes do e-mail selecionado */}
      <EmailDetalheDrawer
        item={detalhe}
        onClose={() => setDetalhe(null)}
        ordemNumero={ordemNumero}
        motoristaNome={motoristaNome}
        placa={placa}
      />
    </Card>
  );
}

// UFs cobertas por cada grupo de e-mail da simulação (pra contar respostas recebidas relacionadas)
function ufsDoGrupo(grupoId: string): "all" | string[] {
  if (grupoId === "sc") return ["SC"];
  if (grupoId === "sprj") return ["SP", "RJ"];
  if (grupoId === "ne") return ["BA"];
  if (grupoId === "fat" || grupoId === "qua" || grupoId === "sup") return "all";
  return [];
}

function EnviadoRow({ email, recebidos, onClick }: { email: EmailEnviadoEnriched; recebidos: EmailRecebido[]; onClick?: () => void }) {
  // Calcula quantas respostas correspondem a este grupo (apenas pra e-mails vindos da simulação)
  const grupoId = email.grupos?.[0];
  const respostas = (() => {
    if (!grupoId || !email.grupoNome) return null;
    const ufs = ufsDoGrupo(grupoId);
    if (ufs === "all") return recebidos.length;
    return recebidos.filter(r => (ufs as string[]).includes(r.uf)).length;
  })();
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full p-4 flex items-start gap-3 hover:bg-slate-50/50 transition-colors text-left cursor-pointer"
    >
      <div className="relative shrink-0">
        <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center">
          <Mail className="w-4 h-4 text-violet-700" />
        </div>
        <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-violet-600 flex items-center justify-center ring-2 ring-white">
          <ArrowUpRight className="w-3 h-3 text-white" />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <Badge variant="info" className="text-[9px] uppercase tracking-wider">Enviado</Badge>
          {email.grupoNome && <Badge variant="muted" className="text-[9px]">Grupo: {email.grupoNome}</Badge>}
          {!email.grupoNome && <span className="text-xs font-semibold">v{email.versao}</span>}
          {email.tipo === "inicial" && !email.grupoNome && <Badge variant="muted" className="text-[9px]">Disparo inicial</Badge>}
          {email.tipo === "atualizacao" && <Badge variant="warning" className="text-[9px]">Atualização</Badge>}
          {respostas !== null && respostas > 0 && (
            <Badge variant="success" className="text-[9px] gap-0.5">
              <ArrowDownLeft className="w-2.5 h-2.5" />{respostas} resposta{respostas !== 1 ? "s" : ""}
            </Badge>
          )}
          <span className="text-[10px] text-muted-foreground ml-auto inline-flex items-center gap-1">
            <Calendar className="w-2.5 h-2.5" />{formatDateTime(email.timestamp)}
          </span>
        </div>
        <p className="text-xs text-muted-foreground mb-0.5">
          De: <span className="font-medium">Logística Dorfketal</span> · Para: <span className="font-medium inline-flex items-center gap-0.5"><Users className="w-2.5 h-2.5" />{email.destinatarios} destinatário{email.destinatarios !== 1 ? "s" : ""}</span>
        </p>
        {email.grupoDescricao && (
          <p className="text-[10px] text-muted-foreground font-mono mb-0.5 truncate">{email.grupoDescricao}</p>
        )}
        <p className="text-sm font-mono text-slate-800 truncate">{email.assunto}</p>
        {email.criterio && (
          <Badge variant="muted" className="text-[9px] mt-1.5">{email.criterio}</Badge>
        )}
        {email.resumoMudancas && (
          <p className="text-[11px] text-amber-700 mt-1.5 p-1.5 bg-amber-50 rounded border border-amber-200">
            ↻ <strong>Resumo das mudanças:</strong> {email.resumoMudancas}
          </p>
        )}
      </div>
    </button>
  );
}

function RecebidoRow({ email, onClick }: { email: EmailRecebido; onClick?: () => void }) {
  const tempo = tempoRelativo(email.timestamp);
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full p-4 flex items-start gap-3 transition-all text-left cursor-pointer",
        email.isNovo ? "bg-emerald-50/60 animate-pulse" : "hover:bg-slate-50/50",
      )}
    >
      <div className="relative shrink-0">
        <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
          <Mail className="w-4 h-4 text-emerald-700" />
        </div>
        <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-600 flex items-center justify-center ring-2 ring-white">
          <ArrowDownLeft className="w-3 h-3 text-white" />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <Badge variant="success" className="text-[9px] uppercase tracking-wider">Recebido</Badge>
          <Badge variant="info" className="text-[9px] font-bold">{email.uf}</Badge>
          {email.isNovo && (
            <Badge variant="warning" className="text-[9px] animate-pulse">NOVO</Badge>
          )}
          <span className="text-[10px] text-muted-foreground ml-auto inline-flex items-center gap-1">
            <Calendar className="w-2.5 h-2.5" />{tempo}
          </span>
        </div>
        <p className="text-xs text-muted-foreground mb-0.5">
          De: <span className="font-medium">{email.remetente}</span> · <span className="font-mono text-[10px]">{email.remetenteEmail}</span>
        </p>
        <p className="text-sm text-slate-800 truncate">{email.assunto}</p>
        <div className="mt-1.5 inline-flex items-center gap-1.5 p-1.5 bg-emerald-50 rounded border border-emerald-200 text-[11px] text-emerald-900">
          <Paperclip className="w-3 h-3" />
          <span className="font-mono">{email.anexoXml}</span>
          <span className="text-emerald-700">· casado com OC · CT-e em emissão</span>
        </div>
      </div>
    </button>
  );
}

// ===================================================================
// Drawer lateral com detalhes completos do e-mail clicado
// ===================================================================
function EmailDetalheDrawer({
  item, onClose, ordemNumero, motoristaNome, placa,
}: {
  item: TimelineItem | null;
  onClose: () => void;
  ordemNumero: string;
  motoristaNome: string;
  placa: string;
}) {
  const open = !!item;
  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent side="right" className="flex flex-col w-full sm:max-w-xl">
        {item?.kind === "enviado" && (
          <EnviadoDetalhe email={item.data} ordemNumero={ordemNumero} motoristaNome={motoristaNome} placa={placa} />
        )}
        {item?.kind === "recebido" && (
          <RecebidoDetalhe email={item.data} ordemNumero={ordemNumero} />
        )}
      </SheetContent>
    </Sheet>
  );
}

function EnviadoDetalhe({ email, ordemNumero, motoristaNome, placa }: {
  email: EmailEnviadoEnriched;
  ordemNumero: string;
  motoristaNome: string;
  placa: string;
}) {
  // Lista de destinatários (parsing simples da string descricao do grupo)
  const destinatarios = email.grupoDescricao
    ? email.grupoDescricao.split(",").map(s => s.trim())
    : [];
  return (
    <>
      <SheetHeader>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center shrink-0">
            <Mail className="w-5 h-5 text-violet-700" />
          </div>
          <div className="flex-1 min-w-0 pr-8">
            <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
              <Badge variant="info" className="text-[9px] uppercase tracking-wider gap-0.5">
                <ArrowUpRight className="w-2.5 h-2.5" />Enviado
              </Badge>
              {email.grupoNome && (
                <Badge variant="muted" className="text-[9px]">{email.grupoNome}</Badge>
              )}
              {email.tipo === "atualizacao" && (
                <Badge variant="warning" className="text-[9px]">Atualização v{email.versao}</Badge>
              )}
            </div>
            <SheetTitle className="text-sm font-mono break-words">{email.assunto}</SheetTitle>
          </div>
        </div>
      </SheetHeader>

      <SheetBody className="space-y-4 text-xs">
        {/* Metadados */}
        <div className="grid grid-cols-[80px_1fr] gap-y-2 gap-x-3 pb-3 border-b">
          <span className="text-muted-foreground">De:</span>
          <span className="font-medium">Logística Dorfketal &lt;logistica@dorfketal.com.br&gt;</span>

          <span className="text-muted-foreground">Para:</span>
          <div className="space-y-0.5">
            {destinatarios.length > 0 ? (
              destinatarios.map((d, i) => (
                <p key={i} className="font-mono text-[11px]">{d}</p>
              ))
            ) : (
              <span className="font-medium">{email.destinatarios} destinatário(s)</span>
            )}
          </div>

          <span className="text-muted-foreground">Data:</span>
          <span className="font-medium">{formatDateTime(email.timestamp)}</span>

          {email.criterio && (
            <>
              <span className="text-muted-foreground">Critério:</span>
              <Badge variant="muted" className="text-[9px] w-fit">{email.criterio}</Badge>
            </>
          )}
        </div>

        {/* Corpo do e-mail */}
        <div>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">
            Corpo do e-mail
          </p>
          <Card className="p-4 bg-slate-50/50 space-y-3 text-[13px] text-slate-800 leading-relaxed">
            {email.corpo ? (
              <>
                <p>{email.corpo}</p>
                <div className="bg-white rounded p-3 border border-slate-200 text-[11px] space-y-1">
                  <p>• <strong>OC:</strong> {ordemNumero}</p>
                  <p>• <strong>Motorista:</strong> {motoristaNome} · {placa}</p>
                  <p className="text-muted-foreground italic mt-1">[Anexo: tabela detalhada de pedidos da carga]</p>
                </div>
                <p>Atenciosamente,<br /><strong>Equipe Logística — Dorfketal</strong></p>
              </>
            ) : (
              <p className="text-muted-foreground italic">Conteúdo do template não disponível para este e-mail histórico.</p>
            )}
          </Card>
        </div>

        {email.resumoMudancas && (
          <Card className="p-3 bg-amber-50 border-amber-200 text-[11px] text-amber-900">
            <p className="font-semibold mb-1">↻ Resumo das mudanças</p>
            <p>{email.resumoMudancas}</p>
          </Card>
        )}

        {/* Indicação se houver respostas */}
        <Card className="p-3 bg-blue-50 border-blue-200 text-[11px] text-blue-900">
          <p className="flex items-center gap-1 mb-0.5">
            <Inbox className="w-3 h-3" />
            <strong>Aguardando respostas:</strong> os clientes responderão este e-mail com os XMLs das NFes.
          </p>
          <p>Quando o XML chega, o sistema casa automaticamente com a OC e emite o CT-e correspondente.</p>
        </Card>
      </SheetBody>

      <SheetFooter>
        <SheetClose asChild>
          <Button variant="outline" size="sm">Fechar</Button>
        </SheetClose>
        <Button size="sm" variant="outline">
          <Send className="w-3.5 h-3.5 mr-1.5" />Reenviar
        </Button>
        <Button size="sm">
          <Download className="w-3.5 h-3.5 mr-1.5" />Exportar
        </Button>
      </SheetFooter>
    </>
  );
}

function RecebidoDetalhe({ email, ordemNumero }: { email: EmailRecebido; ordemNumero: string }) {
  return (
    <>
      <SheetHeader>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
            <Mail className="w-5 h-5 text-emerald-700" />
          </div>
          <div className="flex-1 min-w-0 pr-8">
            <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
              <Badge variant="success" className="text-[9px] uppercase tracking-wider gap-0.5">
                <ArrowDownLeft className="w-2.5 h-2.5" />Recebido
              </Badge>
              <Badge variant="info" className="text-[9px] font-bold">{email.uf}</Badge>
              {email.isNovo && (
                <Badge variant="warning" className="text-[9px] animate-pulse">NOVO</Badge>
              )}
            </div>
            <SheetTitle className="text-sm break-words">{email.assunto}</SheetTitle>
          </div>
        </div>
      </SheetHeader>

      <SheetBody className="space-y-4 text-xs">
        {/* Metadados */}
        <div className="grid grid-cols-[80px_1fr] gap-y-2 gap-x-3 pb-3 border-b">
          <span className="text-muted-foreground">De:</span>
          <div>
            <p className="font-medium">{email.remetente}</p>
            <p className="font-mono text-[11px] text-muted-foreground">{email.remetenteEmail}</p>
          </div>

          <span className="text-muted-foreground">Para:</span>
          <span className="font-mono text-[11px]">logistica@dorfketal.com.br</span>

          <span className="text-muted-foreground">Data:</span>
          <span className="font-medium">{formatDateTime(email.timestamp)} · {tempoRelativo(email.timestamp)}</span>

          <span className="text-muted-foreground">Destino:</span>
          <span className="font-medium inline-flex items-center gap-0.5">
            <MapPin className="w-2.5 h-2.5" />{email.destino}/{email.uf}
          </span>
        </div>

        {/* Anexo XML */}
        <div>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">
            Anexo recebido
          </p>
          <Card className="p-3 bg-emerald-50 border-emerald-200">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-lg bg-white border border-emerald-300 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5 text-emerald-700" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-mono text-[12px] font-semibold text-emerald-900">{email.anexoXml}</p>
                <p className="text-[10px] text-emerald-700">XML da NFe · ~2.4 KB · casado automaticamente com OC {ordemNumero}</p>
              </div>
              <Button size="sm" variant="outline" className="shrink-0 h-7 text-[10px]">
                <Download className="w-3 h-3 mr-1" />baixar
              </Button>
            </div>
          </Card>
        </div>

        {/* Corpo da resposta (mockado) */}
        <div>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">
            Resposta do cliente
          </p>
          <Card className="p-4 bg-slate-50/50 text-[13px] text-slate-800 leading-relaxed space-y-2">
            <p>Olá,</p>
            <p>Segue em anexo o XML da NF-e referente ao pedido desta carga. Por favor, confirmem o recebimento e a emissão do CT-e correspondente.</p>
            <p>Qualquer dúvida estamos à disposição.</p>
            <p>Atenciosamente,<br /><strong>{email.remetente}</strong></p>
          </Card>
        </div>

        {/* Status da casagem */}
        <Card className="p-3 bg-emerald-50 border-emerald-200 text-[11px] text-emerald-900">
          <p className="flex items-center gap-1 font-semibold mb-1">
            <CheckCircle2 className="w-3 h-3" />XML casado automaticamente
          </p>
          <ul className="space-y-0.5 ml-4 list-disc">
            <li>OC <strong>{ordemNumero}</strong> identificada no corpo do XML</li>
            <li>CT-e correspondente entrou em emissão na SEFAZ</li>
            <li>GNRE ICMS-ST · UF {email.uf} também será emitida</li>
          </ul>
        </Card>
      </SheetBody>

      <SheetFooter>
        <SheetClose asChild>
          <Button variant="outline" size="sm">Fechar</Button>
        </SheetClose>
        <Button size="sm" variant="outline">
          <Eye className="w-3.5 h-3.5 mr-1.5" />Ver XML
        </Button>
        <Button size="sm">
          <FileSignature className="w-3.5 h-3.5 mr-1.5" />Ver CT-e
        </Button>
      </SheetFooter>
    </>
  );
}

function tempoRelativo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 5) return "agora";
  if (s < 60) return `há ${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `há ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `há ${h}h`;
  return new Date(iso).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}
