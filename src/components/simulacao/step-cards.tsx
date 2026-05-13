import { useState, useEffect, useRef, ReactNode, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select, SelectTrigger, SelectContent, SelectItem, SelectValue,
} from "@/components/ui/select";
import {
  Mail, FileSignature, Route, Sparkles, ArrowRight,
  CheckCircle2, Loader2, Play, MapPin, Truck, Building2, Clock,
  AlertCircle, ShieldCheck, Receipt, Wand2, FileSpreadsheet, Eye, ListChecks,
  Pencil, Send, Hourglass, MailCheck, FileEdit,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils";
import {
  simItens, simCarga, simUfStats, simGruposEmail,
  simPipeline, simPipelineDuracaoTotal, EmissaoNode, DocStatus,
  SimItem, SimGrupoEmail, renderTemplateTokens,
  computeUfStats, computeTotais,
} from "@/lib/simulacao-data";
import { motoristas, veiculos } from "@/lib/mock-data";

// ===================================================================
// Shell genérico de etapa — header com cronômetro de "tempo manual"
// ===================================================================
type StepShellProps = {
  stepId: number;
  title: string;
  subtitle: string;
  icon: any;
  isComplete: boolean;
  running: boolean;          // controlado pelo pai
  onComplete: () => void;
  autoDelayMs?: number;      // duração da animação interna (timer)
  children?: ReactNode | ((ctx: { running: boolean; progressMs: number }) => ReactNode);
};

function StepShell({
  stepId, title, subtitle, icon: Icon, isComplete, running, onComplete,
  autoDelayMs = 2000,
  children,
}: StepShellProps) {
  const [progressMs, setProgressMs] = useState(0);
  const intervalRef = useRef<number | null>(null);

  // Dispara animação quando `running` vira true
  useEffect(() => {
    if (!running || isComplete) {
      setProgressMs(0);
      return;
    }
    const t0 = Date.now();
    intervalRef.current = window.setInterval(() => {
      const elapsed = Date.now() - t0;
      setProgressMs(elapsed);
      if (elapsed >= autoDelayMs) {
        if (intervalRef.current) window.clearInterval(intervalRef.current);
        onComplete();
      }
    }, 50);
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, [running, isComplete, autoDelayMs, onComplete]);

  return (
    <Card className="overflow-hidden">
      <div className="p-5 border-b bg-gradient-to-r from-violet-50/40 to-white flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className={cn(
            "w-11 h-11 rounded-lg flex items-center justify-center shrink-0",
            isComplete ? "bg-emerald-100" : running ? "bg-violet-100 animate-pulse" : "bg-violet-100"
          )}>
            {isComplete ? <CheckCircle2 className="w-5 h-5 text-emerald-700" /> : <Icon className="w-5 h-5 text-violet-700" />}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h2 className="text-base font-semibold">Etapa {stepId}: {title}</h2>
              {isComplete && <Badge variant="success" className="text-[10px]">✓ Concluída</Badge>}
              {running && !isComplete && (
                <Badge variant="info" className="text-[10px] gap-1 animate-pulse">
                  <Loader2 className="w-2.5 h-2.5 animate-spin" />Executando
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          </div>
        </div>
      </div>
      <div className="p-5">
        {running && !isComplete && (
          <div className="mb-3">
            <Progress value={Math.min(100, (progressMs / autoDelayMs) * 100)} className="h-1.5" />
          </div>
        )}
        {typeof children === "function" ? children({ running, progressMs }) : children}
      </div>
    </Card>
  );
}

// ===================================================================
// ETAPA 1 — Formação da carga
// Default: seleção manual em branco. Botão "Sugestão IA" preenche tudo.
// Veículo e motorista editáveis via selects inline.
// ===================================================================
export interface Step1Selecao {
  pedidosIdxs: number[];
  motoristaId: string | null;
  veiculoId: string | null;
}

export function Step1FormacaoIA({ onComplete, isComplete, running, onValidityChange, onSelecaoChange }: {
  onComplete: () => void;
  isComplete: boolean;
  running: boolean;
  // Reporta se a etapa pode avançar (precisa ter pedidos + motorista + veículo)
  onValidityChange?: (valid: boolean) => void;
  // Reporta a seleção atual pra propagar pras próximas etapas e pra Ordem de Carregamento
  onSelecaoChange?: (sel: Step1Selecao) => void;
}) {
  // Seleção começa vazia (manual). IA preenche tudo ao clicar.
  const [selecionados, setSelecionados] = useState<Set<number>>(new Set());
  const [iaCarregando, setIaCarregando] = useState(false);
  const [iaAplicada, setIaAplicada] = useState(false);

  // Veículo e motorista — começam null, IA sugere ou usuário escolhe manualmente.
  const [motoristaId, setMotoristaId] = useState<string | null>(null);
  const [veiculoId, setVeiculoId] = useState<string | null>(null);
  const [editandoVM, setEditandoVM] = useState(false);

  const motoristasAtivos = motoristas.filter(m => m.ativo);
  const veiculosAtivos = veiculos.filter(v => v.ativo);
  const motoristaSel = motoristas.find(m => m.id === motoristaId) ?? null;
  const veiculoSel = veiculos.find(v => v.id === veiculoId) ?? null;

  const toggleItem = (idx: number) => {
    setSelecionados(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx); else next.add(idx);
      return next;
    });
    // qualquer edição manual reverte indicador de IA
    setIaAplicada(false);
  };

  const triggerSugestaoIA = () => {
    setIaCarregando(true);
    // Loader visual ~1.5s — anima como se a IA estivesse "pensando"
    window.setTimeout(() => {
      setSelecionados(new Set(simItens.map((_, i) => i)));
      setMotoristaId(simCarga.motoristaIdSugerido);
      setVeiculoId(simCarga.veiculoIdSugerido);
      setIaCarregando(false);
      setIaAplicada(true);
      setEditandoVM(false);
    }, 1500);
  };

  const total = selecionados.size;
  const peso = simItens.filter((_, i) => selecionados.has(i)).reduce((s, it) => s + it.pesoKg, 0);
  const capacidade = veiculoSel?.capacidadeKg ?? simCarga.capacidadeKg;
  const ocupacaoPct = Math.round((peso / capacidade) * 100);
  const itensSemNfe = simItens.filter((_, i) => selecionados.has(i) && !simItens[i].nf).length;

  // Validação: precisa de pelo menos 1 pedido + motorista + veículo
  const isValid = total > 0 && !!motoristaId && !!veiculoId;
  useEffect(() => {
    onValidityChange?.(isValid);
  }, [isValid, onValidityChange]);

  // Reporta a seleção atual pro orquestrador (Simulacao) sempre que mudar
  useEffect(() => {
    onSelecaoChange?.({
      pedidosIdxs: Array.from(selecionados).sort((a, b) => a - b),
      motoristaId,
      veiculoId,
    });
  }, [selecionados, motoristaId, veiculoId, onSelecaoChange]);

  return (
    <StepShell
      stepId={1}
      title="Formação da carga"
      subtitle={iaAplicada
        ? "Composição sugerida pela IA · pedidos + veículo + motorista escolhidos automaticamente"
        : "Seleção manual · marque os pedidos, escolha o veículo e o motorista. Use Sugestão IA para automatizar."}
      icon={Wand2}
      isComplete={isComplete}
      running={running}
      onComplete={onComplete}
      autoDelayMs={iaAplicada ? 2200 : 1500}
    >
      <div className="grid grid-cols-[1.4fr_1fr] gap-4">
        {/* ============ Lista de itens ============ */}
        <Card className="p-4 relative">
          <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
            <p className="text-xs uppercase tracking-wider text-slate-700 font-semibold flex items-center gap-1.5">
              <ListChecks className="w-3 h-3" />Pedidos disponíveis · marque os desejados
            </p>
            <div className="flex items-center gap-2">
              <Badge variant={iaAplicada ? "success" : "info"} className="text-[10px]">
                {total} de {simItens.length} {iaAplicada ? "" : "selecionados"}
              </Badge>
              <Button
                onClick={triggerSugestaoIA}
                disabled={iaCarregando}
                variant="outline"
                size="sm"
                className="border-violet-300 bg-violet-50 text-violet-700 hover:bg-violet-100 hover:text-violet-800 h-7 text-xs"
              >
                {iaCarregando ? (
                  <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />Calculando...</>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                    Sugestão IA
                    <Badge variant="success" className="ml-1.5 text-[9px] px-1">score 94</Badge>
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className={cn("space-y-1.5 max-h-[320px] overflow-y-auto pr-1 transition-opacity", iaCarregando && "opacity-30")}>
            {simItens.map((it, idx) => {
              const checked = selecionados.has(idx);
              const semNfe = !it.nf;
              return (
                <label
                  key={idx}
                  onClick={() => !iaCarregando && toggleItem(idx)}
                  className={cn(
                    "flex items-center gap-2 p-2 rounded border text-xs transition-colors cursor-pointer",
                    iaCarregando ? "pointer-events-none" : "hover:bg-slate-100",
                    checked ? "bg-slate-50 border-slate-200" : "bg-white border-slate-200 opacity-60",
                  )}
                >
                  <Checkbox checked={checked} onCheckedChange={() => toggleItem(idx)} className="shrink-0" />
                  <span className="font-mono text-[10px] text-blue-600 w-24 truncate">{it.oc}</span>
                  <span className="font-medium flex-1 truncate">{it.cliente}</span>
                  <span className="text-muted-foreground flex items-center gap-0.5 text-[10px]">
                    <MapPin className="w-2.5 h-2.5" />{it.destino}/{it.uf}
                  </span>
                  {it.nf ? (
                    <span className="text-[10px] text-muted-foreground font-mono">NF {it.nf}</span>
                  ) : (
                    <Badge variant="warning" className="text-[9px] px-1 gap-0.5">
                      <Hourglass className="w-2.5 h-2.5" />Aguardando NFe
                    </Badge>
                  )}
                  {it.tipo === "transferencia" && <Badge variant="warning" className="text-[9px] px-1">Transf</Badge>}
                  {it.tipo === "amostra" && <Badge variant="info" className="text-[9px] px-1">Amostra</Badge>}
                  {it.tipo === "redespacho" && <Badge variant="success" className="text-[9px] px-1">Redesp</Badge>}
                  {!semNfe && it.tipo === "venda" && <span className="w-[40px]" />}
                </label>
              );
            })}
          </div>

          {/* Overlay de loader IA */}
          {iaCarregando && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm rounded">
              <div className="bg-violet-100 rounded-full p-3 mb-3">
                <Sparkles className="w-6 h-6 text-violet-700 animate-pulse" />
              </div>
              <p className="text-sm font-semibold text-violet-900 mb-1">IA analisando...</p>
              <p className="text-[11px] text-violet-700 text-center max-w-[280px]">
                Avaliando {simItens.length} pedidos, motoristas disponíveis e capacidades de veículo
              </p>
              <Loader2 className="w-4 h-4 text-violet-600 animate-spin mt-3" />
            </div>
          )}

          {!iaCarregando && (
            <Card className="p-2.5 mt-3 bg-amber-50 border-amber-200 flex items-start gap-2 text-[11px]">
              <Hourglass className="w-3.5 h-3.5 text-amber-700 mt-0.5 shrink-0" />
              <p className="text-amber-900">
                <strong>NFes chegam após o envio do e-mail.</strong>{" "}
                Pedidos entram com status <em>Aguardando NFe</em> — os CT-es são emitidos automaticamente na tela da Ordem de Carregamento à medida que os clientes respondem com o XML.
              </p>
            </Card>
          )}
        </Card>

        {/* ============ Veículo + motorista + razões/métricas ============ */}
        <div className="space-y-3">
          <Card className="p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Veículo · Motorista</p>
              {(motoristaSel || veiculoSel) && !editandoVM && (
                <button
                  onClick={() => setEditandoVM(true)}
                  className="text-violet-600 hover:text-violet-800 hover:bg-violet-50 rounded p-1 inline-flex items-center gap-0.5 text-[10px]"
                  title="Editar veículo e motorista"
                >
                  <Pencil className="w-3 h-3" />Editar
                </button>
              )}
            </div>

            {/* Modo edição: selects */}
            {editandoVM && (
              <div className="space-y-2">
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Motorista</label>
                  <Select value={motoristaId ?? ""} onValueChange={(v) => setMotoristaId(v)}>
                    <SelectTrigger className="h-8 text-xs mt-1">
                      <SelectValue placeholder="Escolha o motorista" />
                    </SelectTrigger>
                    <SelectContent>
                      {motoristasAtivos.map(m => (
                        <SelectItem key={m.id} value={m.id}>
                          {m.nome} · CNH {m.categoria} · ★ {m.avaliacao.toFixed(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Veículo</label>
                  <Select value={veiculoId ?? ""} onValueChange={(v) => setVeiculoId(v)}>
                    <SelectTrigger className="h-8 text-xs mt-1">
                      <SelectValue placeholder="Escolha o veículo" />
                    </SelectTrigger>
                    <SelectContent>
                      {veiculosAtivos.map(v => (
                        <SelectItem key={v.id} value={v.id}>
                          {v.placa} · {v.tipo} · {v.capacidadeKg.toLocaleString("pt-BR")} kg
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2 pt-1">
                  <Button size="sm" className="flex-1 h-7 text-xs" onClick={() => setEditandoVM(false)}>
                    <CheckCircle2 className="w-3 h-3 mr-1" />Salvar
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1 h-7 text-xs" onClick={() => setEditandoVM(false)}>
                    Cancelar
                  </Button>
                </div>
              </div>
            )}

            {/* Modo leitura: dados preenchidos */}
            {!editandoVM && motoristaSel && veiculoSel && (
              <>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-white text-sm font-semibold flex items-center justify-center">
                    {motoristaSel.nome.split(" ").map(s => s[0]).slice(0, 2).join("")}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm">{motoristaSel.nome}</p>
                    <p className="text-xs text-muted-foreground font-mono">CNH cat. {motoristaSel.categoria} · ★ {motoristaSel.avaliacao.toFixed(1)} · {motoristaSel.cargasMes} cargas/mês</p>
                  </div>
                </div>
                <div className="space-y-1.5 text-xs border-t pt-3">
                  <div className="flex justify-between"><span className="text-muted-foreground flex items-center gap-1"><Truck className="w-3 h-3" />Placa</span><span className="font-mono font-semibold">{veiculoSel.placa}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Tipo</span><span className="font-medium capitalize">{veiculoSel.tipo}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Capacidade</span><span className="font-medium">{veiculoSel.capacidadeKg.toLocaleString("pt-BR")} kg</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Saída</span><span className="font-medium">{new Date(simCarga.dataSaida).toLocaleDateString("pt-BR")} · {simCarga.horaSaida}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground"><Building2 className="w-3 h-3 inline mr-0.5" />Origem</span><span className="font-medium text-right">{simCarga.origem}</span></div>
                </div>
              </>
            )}

            {/* Vazio — nada escolhido ainda */}
            {!editandoVM && (!motoristaSel || !veiculoSel) && (
              <div className="py-4 text-center">
                <Truck className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-muted-foreground mb-3">Nenhum motorista ou veículo escolhido</p>
                <Button size="sm" variant="outline" className="text-xs" onClick={() => setEditandoVM(true)}>
                  <Pencil className="w-3 h-3 mr-1.5" />Selecionar
                </Button>
              </div>
            )}
          </Card>

          {/* Card de critérios da IA — só aparece quando IA foi aplicada */}
          {iaAplicada ? (
            <Card className="p-4 bg-violet-50 border-violet-200">
              <p className="text-xs uppercase tracking-wider text-violet-700 font-semibold mb-2 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />Por que essa composição?
              </p>
              <ul className="space-y-1.5 text-[11px] text-violet-900">
                <li className="flex items-start gap-1.5"><Sparkles className="w-3 h-3 mt-0.5 shrink-0" />Motorista <strong>Paulo Ribeiro</strong> — habituado à rota RS→SC→SP→RJ→BA ({motoristaSel?.cargasMes ?? 24} cargas/mês, ★ {motoristaSel?.avaliacao.toFixed(1) ?? "4.9"})</li>
                <li className="flex items-start gap-1.5"><Sparkles className="w-3 h-3 mt-0.5 shrink-0" />Carreta <strong>{veiculoSel?.placa ?? "TRD-0C87"}</strong> — ocupação {ocupacaoPct}% ({peso.toLocaleString("pt-BR")} / {capacidade.toLocaleString("pt-BR")} kg)</li>
                <li className="flex items-start gap-1.5"><Sparkles className="w-3 h-3 mt-0.5 shrink-0" />Composição cobre {total} pedidos · NFes virão por e-mail após o disparo da Etapa 2</li>
                <li className="flex items-start gap-1.5"><Sparkles className="w-3 h-3 mt-0.5 shrink-0" />Janela de entrega respeitada nos 4 estados (SC, SP, RJ, BA)</li>
                <li className="flex items-start gap-1.5"><Sparkles className="w-3 h-3 mt-0.5 shrink-0" />Transferências TAGLOG aproveitam a viagem (sem deadhead)</li>
              </ul>
            </Card>
          ) : (
            <Card className="p-4 bg-blue-50 border-blue-200">
              <p className="text-xs uppercase tracking-wider text-blue-700 font-semibold mb-2 flex items-center gap-1"><ListChecks className="w-3 h-3" />Métricas da seleção</p>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between"><span className="text-blue-900">Itens selecionados</span><strong className="text-blue-900">{total} / {simItens.length}</strong></div>
                <div className="flex justify-between"><span className="text-blue-900">Peso total</span><strong className="text-blue-900">{peso.toLocaleString("pt-BR")} kg</strong></div>
                <div className="flex justify-between"><span className="text-blue-900">Ocupação do veículo</span><strong className="text-blue-900">{ocupacaoPct}%</strong></div>
                {itensSemNfe > 0 && (
                  <div className="flex justify-between"><span className="text-blue-900">Sem NFe</span><strong className="text-orange-700">{itensSemNfe} pedido(s)</strong></div>
                )}
              </div>
              <Progress value={ocupacaoPct} className="h-1.5 mt-2" />
              <div className="pt-3 mt-3 border-t border-blue-200">
                <p className="text-[10px] text-blue-800">
                  Marque os pedidos manualmente ou clique em <strong>Sugestão IA</strong> para preencher tudo de uma vez (pedidos + veículo + motorista).
                </p>
              </div>
              {!isValid && (
                <div className="mt-2 space-y-0.5">
                  {total === 0 && (
                    <p className="text-[10px] text-amber-700 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />Selecione ao menos 1 pedido
                    </p>
                  )}
                  {!motoristaId && (
                    <p className="text-[10px] text-amber-700 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />Escolha um motorista
                    </p>
                  )}
                  {!veiculoId && (
                    <p className="text-[10px] text-amber-700 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />Escolha um veículo
                    </p>
                  )}
                </div>
              )}
            </Card>
          )}
        </div>
      </div>
    </StepShell>
  );
}

// ===================================================================
// ETAPA 2 — Disparo dos e-mails
// Grupos pré-selecionados conforme critério, editáveis, template do grupo focado no painel
// ===================================================================
export function Step2Emails({ onComplete, isComplete, running, onGruposChange }: {
  onComplete: () => void;
  isComplete: boolean;
  running: boolean;
  // Notifica o pai sempre que a seleção de grupos muda (para persistência fora da simulação)
  onGruposChange?: (gruposIds: string[]) => void;
}) {
  const [selecionados, setSelecionados] = useState<Set<string>>(
    new Set(simGruposEmail.filter(g => g.preSelecionado).map(g => g.id))
  );
  const [focado, setFocado] = useState<string>(simGruposEmail.find(g => g.preSelecionado)?.id ?? simGruposEmail[0].id);

  // Reporta seleção atual sempre que mudar
  useEffect(() => {
    onGruposChange?.(Array.from(selecionados));
  }, [selecionados, onGruposChange]);

  const toggle = (id: string) => {
    setSelecionados(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
    setFocado(id);
  };

  const grupoFocado = simGruposEmail.find(g => g.id === focado) ?? simGruposEmail[0];
  const totalEmails = useMemo(
    () => simGruposEmail.filter(g => selecionados.has(g.id)).reduce((s, g) => s + g.emails, 0),
    [selecionados]
  );
  const ufsDestino = useMemo(
    () => Array.from(new Set(simItens.map(it => it.uf))).join("/"),
    []
  );

  // Substitui tokens no template (delega pra helper compartilhado)
  const renderTemplate = renderTemplateTokens;

  return (
    <StepShell
      stepId={2}
      title="Disparo dos e-mails de carga"
      subtitle="Grupos pré-selecionados por UF · edite a lista e visualize o template de cada grupo"
      icon={Mail}
      isComplete={isComplete}
      running={running}
      onComplete={onComplete}
      autoDelayMs={1800}
    >
      {({ running: r }) => (
        <div className="grid grid-cols-[1fr_1.4fr] gap-4">
          {/* ======= Coluna esquerda: grupos ======= */}
          <div className="space-y-2">
            <Card className="p-2 bg-blue-50 border-blue-200 text-[11px] text-blue-900 flex items-start gap-1.5">
              <Sparkles className="w-3 h-3 mt-0.5 shrink-0" />
              <span>
                <strong>{simGruposEmail.filter(g => g.preSelecionado).length} grupos pré-selecionados</strong> com base nas UFs da carga ({ufsDestino}) + Faturamento (sempre). Adicione/remova conforme necessário.
              </span>
            </Card>

            <Card className="p-3">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">Grupos disponíveis · clique para visualizar template</p>
              <div className="space-y-1.5">
                {simGruposEmail.map((g) => {
                  const isOn = selecionados.has(g.id);
                  const isFocado = focado === g.id;
                  return (
                    <div
                      key={g.id}
                      className={cn(
                        "flex items-start gap-2 p-2 rounded border transition-all",
                        isOn ? "bg-violet-50/50 border-violet-200" : "bg-white border-slate-200",
                        isFocado && "ring-2 ring-violet-400 ring-offset-1",
                      )}
                    >
                      {/* Checkbox: clica pra marcar/desmarcar (não dispara setFocado) */}
                      <div
                        className="pt-0.5"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Checkbox
                          checked={isOn}
                          onCheckedChange={() => toggle(g.id)}
                          aria-label={`Selecionar grupo ${g.nome}`}
                        />
                      </div>
                      {/* Conteúdo: clica pra focar (visualizar template) */}
                      <button
                        type="button"
                        onClick={() => setFocado(g.id)}
                        className="flex-1 min-w-0 text-left cursor-pointer"
                      >
                        <div className="flex items-center gap-1.5">
                          <p className="font-medium text-xs truncate">{g.nome}</p>
                          {(r || isComplete) && isOn && (
                            <MailCheck className="w-3 h-3 text-emerald-600 shrink-0" />
                          )}
                        </div>
                        <p className="text-[10px] text-muted-foreground truncate">{g.descricao}</p>
                        <Badge variant="muted" className="text-[9px] mt-1 px-1.5">{g.criterio}</Badge>
                      </button>
                      <Badge variant="muted" className="text-[9px] shrink-0 mt-0.5">{g.emails}</Badge>
                    </div>
                  );
                })}
              </div>
              <div className="border-t pt-2 mt-3 flex justify-between text-xs">
                <span className="text-muted-foreground">{selecionados.size} grupos · destinatários</span>
                <span className="font-semibold">{totalEmails}</span>
              </div>
            </Card>
          </div>

          {/* ======= Coluna direita: preview do template do grupo focado ======= */}
          <Card className="p-0 overflow-hidden">
            <div className="px-4 py-2 border-b bg-slate-50 flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2 min-w-0">
                <p className="text-[10px] uppercase tracking-wider text-slate-700 font-semibold">Template do grupo:</p>
                <Badge variant="info" className="text-[10px]">{grupoFocado.nome}</Badge>
              </div>
              <div className="flex items-center gap-1">
                {(r || isComplete) && selecionados.has(grupoFocado.id) && (
                  <Badge variant="success" className="text-[9px] gap-1"><CheckCircle2 className="w-2.5 h-2.5" />Enviado</Badge>
                )}
                <button className="text-slate-500 hover:text-violet-700 hover:bg-violet-50 rounded p-1 text-[10px] inline-flex items-center gap-0.5" title="Editar template (demo)">
                  <FileEdit className="w-3 h-3" />editar
                </button>
                <button className="text-slate-500 hover:text-violet-700 hover:bg-violet-50 rounded p-1 text-[10px] inline-flex items-center gap-0.5" title="Enviar teste (demo)">
                  <Send className="w-3 h-3" />teste
                </button>
              </div>
            </div>
            <div className="p-4 text-xs space-y-2">
              <div className="border-b pb-2">
                <p className="text-muted-foreground">Assunto:</p>
                <p className="font-mono mt-0.5 text-violet-700 font-semibold break-all">{renderTemplate(grupoFocado.template.assunto)}</p>
              </div>
              <p className="text-slate-700">{renderTemplate(grupoFocado.template.saudacao)}</p>
              <p className="text-slate-700">{renderTemplate(grupoFocado.template.corpo)}</p>
              {grupoFocado.template.incluirTabela && (
                <div className="bg-slate-50 rounded p-2 text-[11px]">
                  <p>• <strong>Carregamento:</strong> {simCarga.origem} — {simCarga.horaSaida}</p>
                  <p>• <strong>Motorista:</strong> {simCarga.motorista} · {simCarga.placa}</p>
                  <p>• <strong>Destinos:</strong> {simUfStats.map(u => `${u.uf} (${u.ctes})`).join(" · ")}</p>
                  <p>• <strong>Peso total:</strong> 29.850 kg · <strong>Frete:</strong> R$ 23.865,00</p>
                  <p className="mt-1 text-muted-foreground">[tabela detalhada com {simItens.length} linhas anexa ao e-mail]</p>
                </div>
              )}
              <p className="text-slate-700">Atenciosamente,<br /><strong>{grupoFocado.template.assinatura}</strong></p>

              {!selecionados.has(grupoFocado.id) && (
                <Card className="p-2 mt-3 bg-amber-50 border-amber-200 flex items-start gap-1.5 text-[11px] text-amber-900">
                  <AlertCircle className="w-3 h-3 mt-0.5 shrink-0" />
                  <span>Este grupo está <strong>desmarcado</strong> — o template é só uma pré-visualização. Marque o checkbox para incluir no disparo.</span>
                </Card>
              )}
            </div>
          </Card>
        </div>
      )}
    </StepShell>
  );
}

// ===================================================================
// ETAPA 3 — Plano de Emissão Fiscal
// Tabs: "Emitir agora" (NFe casada) | "Aguardando NFe" (pedidos sem XML)
// ===================================================================

type NodeWithStatus = EmissaoNode & { status: DocStatus; gnreStatus?: DocStatus };

function computeStatus(node: EmissaoNode, elapsed: number): NodeWithStatus {
  let status: DocStatus = "pendente";
  if (elapsed >= node.startMs + node.durMs) status = "autorizado";
  else if (elapsed >= node.startMs) status = "processando";

  let gnreStatus: DocStatus | undefined;
  if (node.gnre) {
    if (elapsed >= node.gnre.startMs + node.gnre.durMs) gnreStatus = "autorizado";
    else if (elapsed >= node.gnre.startMs) gnreStatus = "processando";
    else gnreStatus = "pendente";
  }
  return { ...node, status, gnreStatus };
}

function StatusDot({ status }: { status: DocStatus }) {
  if (status === "autorizado") return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />;
  if (status === "processando") return <Loader2 className="w-3.5 h-3.5 text-violet-600 animate-spin shrink-0" />;
  if (status === "falhou") return <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />;
  return <div className="w-3.5 h-3.5 rounded-full border border-slate-300 shrink-0" />;
}

function StatusLabel({ status }: { status: DocStatus }) {
  if (status === "autorizado") return <Badge variant="success" className="text-[9px] px-1.5">Autorizado</Badge>;
  if (status === "processando") return <Badge variant="info" className="text-[9px] px-1.5 animate-pulse">Processando</Badge>;
  if (status === "falhou") return <Badge variant="destructive" className="text-[9px] px-1.5">Falhou</Badge>;
  return <Badge variant="muted" className="text-[9px] px-1.5">Aguardando</Badge>;
}

function CteRow({ node, idx, onPreview }: { node: NodeWithStatus; idx: number; onPreview: (node: NodeWithStatus, idx: number) => void }) {
  const isInterstate = node.uf && node.uf !== "RS";
  const numeroDoc = node.status === "autorizado" ? `CTE-2026-${(240 + idx).toString().padStart(5, "0")}` : "—";
  const gnreNumero = node.gnreStatus === "autorizado" ? node.gnre?.numero : "—";
  const canPreview = node.status === "processando" || node.status === "autorizado";
  return (
    <div className="border-l-2 border-slate-200 pl-3 py-1.5">
      <div className="flex items-center gap-2 text-xs">
        <StatusDot status={node.status} />
        <span className="font-medium flex-1 truncate">{node.rotulo}</span>
        <span className="font-mono text-[10px] text-blue-600">{numeroDoc}</span>
        {canPreview && (
          <button onClick={() => onPreview(node, idx)} className="text-violet-600 hover:text-violet-800 hover:bg-violet-50 rounded px-1 py-0.5 text-[10px] inline-flex items-center gap-0.5" title="Ver espelho do CT-e">
            <Eye className="w-3 h-3" />
            espelho
          </button>
        )}
        <StatusLabel status={node.status} />
      </div>
      <p className="text-[10px] text-muted-foreground ml-5 mt-0.5">{node.detalhe} · R$ {node.valor?.toLocaleString("pt-BR")}</p>
      {isInterstate && node.gnre && (
        <div className="ml-5 mt-1 flex items-center gap-2 text-[11px] py-1 px-2 bg-amber-50 rounded border border-amber-200">
          <StatusDot status={node.gnreStatus!} />
          <Receipt className="w-3 h-3 text-amber-700" />
          <span className="text-amber-900">GNRE ICMS-ST · UF {node.gnre.uf}</span>
          <span className="font-mono text-[10px] text-amber-700">{gnreNumero}</span>
          <span className="ml-auto font-semibold text-amber-900">R$ {node.gnre.valor.toFixed(2).replace(".", ",")}</span>
          <StatusLabel status={node.gnreStatus!} />
        </div>
      )}
    </div>
  );
}

// Modal "Espelho do CT-e" — mostra dados que iriam para SEFAZ antes de autorizar
function EspelhoDialog({ open, onOpenChange, node, idx, item }: {
  open: boolean; onOpenChange: (v: boolean) => void;
  node: NodeWithStatus | null; idx: number; item: SimItem | null;
}) {
  if (!node || !item) return null;
  const numero = `CTE-2026-${(240 + idx).toString().padStart(5, "0")}`;
  const chave = `43260499999999000100570010000${(240 + idx).toString().padStart(5, "0")}00012345${idx + 7}`;
  const valorFrete = node.valor ?? 0;
  const isFracionada = item.pesoKg < 600;
  const adValoremPct = 0.30;
  const adValorem = item.valor * (adValoremPct / 100);
  const icmsPct = item.uf === "BA" ? 7.0 : 12.0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <DialogTitle>Espelho do CT-e {numero}</DialogTitle>
            {node.status === "autorizado"
              ? <Badge variant="success" className="gap-0.5"><CheckCircle2 className="w-3 h-3" />Autorizado</Badge>
              : <Badge variant="info" className="gap-0.5 animate-pulse"><Loader2 className="w-3 h-3 animate-spin" />Processando</Badge>}
          </div>
          <p className="text-xs text-muted-foreground">Pré-visualização do documento antes de seguir para a SEFAZ — confira valores, peso, rota e cálculo</p>
        </DialogHeader>

        <div className="border-2 border-slate-300 rounded p-3 bg-white">
          <div className="grid grid-cols-2 gap-2 pb-2 border-b">
            <div>
              <p className="text-[9px] uppercase text-muted-foreground">REMETENTE</p>
              <p className="text-xs font-semibold">Dorfketal · {simCarga.origem}</p>
              <p className="text-[10px] font-mono">CNPJ 99.999.999/0001-00</p>
            </div>
            <div className="text-right">
              <p className="text-[9px] uppercase text-muted-foreground">DESTINATÁRIO</p>
              <p className="text-xs font-semibold">{item.cliente}</p>
              <p className="text-[10px]">{item.destino}/{item.uf}</p>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2 py-2 border-b text-xs">
            <div><p className="text-[9px] text-muted-foreground">Modal</p><p className="font-medium">Rodoviário</p></div>
            <div><p className="text-[9px] text-muted-foreground">Tipo serviço</p><p className="font-medium">{isFracionada ? "Fracionada" : "Lotação"}</p></div>
            <div><p className="text-[9px] text-muted-foreground">UF origem → destino</p><p className="font-medium">RS → {item.uf}</p></div>
            <div><p className="text-[9px] text-muted-foreground">CFOP</p><p className="font-medium">6353</p></div>
          </div>

          <div className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-2 py-2 border-b text-xs">
            <div><p className="text-[9px] text-muted-foreground">Produto</p><p className="font-medium">{item.produto}</p></div>
            <div><p className="text-[9px] text-muted-foreground">OC vinculada</p><p className="font-mono">{item.oc}</p></div>
            <div><p className="text-[9px] text-muted-foreground">NF-e</p><p className="font-mono">{item.nf ?? "—"}</p></div>
            <div><p className="text-[9px] text-muted-foreground">Peso bruto</p><p className="font-medium">{item.pesoKg.toLocaleString("pt-BR")} kg</p></div>
          </div>

          <div className="py-2 border-b">
            <p className="text-[9px] uppercase text-muted-foreground mb-1.5">Cálculo do frete (Tabela Dorfketal)</p>
            <div className="space-y-0.5 text-[11px] font-mono">
              {isFracionada ? (
                <>
                  <div className="flex justify-between"><span>Valor fixo (fracionada {item.pesoKg < 100 ? "≤100kg" : "101-599kg"})</span><span>{formatCurrency(item.pesoKg < 100 ? 180 : 380)}</span></div>
                </>
              ) : (
                <>
                  <div className="flex justify-between"><span>{item.pesoKg.toLocaleString("pt-BR")} kg × R$ {(valorFrete / item.pesoKg).toFixed(2).replace(".", ",")}/kg</span><span>{formatCurrency(valorFrete * 0.85)}</span></div>
                </>
              )}
              <div className="flex justify-between"><span>Ad valorem {adValoremPct.toFixed(2)}% × {formatCurrency(item.valor)}</span><span>{formatCurrency(adValorem)}</span></div>
              <div className="flex justify-between text-muted-foreground"><span>ICMS embutido {icmsPct.toFixed(1)}%</span><span>incluso</span></div>
              <div className="flex justify-between font-bold pt-1 border-t text-violet-900"><span>VALOR DO FRETE</span><span>{formatCurrency(valorFrete)}</span></div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 text-[10px]">
            <div>
              <p className="text-muted-foreground">Chave de acesso (44 dígitos)</p>
              <p className="font-mono break-all">{chave}</p>
            </div>
            <div className="text-right">
              <p className="text-muted-foreground">Protocolo SEFAZ</p>
              <p className="font-mono">{node.status === "autorizado" ? `143${260000 + idx * 17}${(idx + 470).toString()}` : "Aguardando autorização"}</p>
            </div>
          </div>
        </div>

        <Card className="p-3 bg-violet-50 border-violet-200 flex items-start gap-2 text-xs text-violet-900">
          <FileSpreadsheet className="w-3.5 h-3.5 mt-0.5 shrink-0" />
          <p>É essa visualização que o Rodrigo pediu na reunião — confere cálculo via tabela de frete, casamento OC×NF e dados fiscais antes de mandar pra SEFAZ. Se algo estiver errado, dá pra interromper o lote antes de autorizar.</p>
        </Card>

        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>Fechar</Button>
          {node.status === "processando" && (
            <Button className="flex-1" onClick={() => onOpenChange(false)}>
              <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />Autorizar mesmo assim
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function MdfeCard({ node, ctesDaUf, onPreview }: { node: NodeWithStatus; ctesDaUf: NodeWithStatus[]; onPreview: (n: NodeWithStatus, idx: number) => void }) {
  const allDone = node.status === "autorizado";
  const numeroDoc = allDone ? `MDFE-${simCarga.numeroCarga.replace("CRG-", "")}-${node.uf}01` : "—";
  return (
    <Card className={cn(
      "p-3 transition-colors",
      allDone ? "border-emerald-300 bg-emerald-50/40" :
      node.status === "processando" ? "border-violet-300 bg-violet-50/40" : ""
    )}>
      <div className="flex items-center gap-2 mb-2">
        <StatusDot status={node.status} />
        <FileSignature className="w-4 h-4 text-violet-700" />
        <span className="font-semibold text-sm">{node.rotulo}</span>
        <span className="font-mono text-[10px] text-violet-700 ml-auto">{numeroDoc}</span>
        <StatusLabel status={node.status} />
      </div>
      <p className="text-[10px] text-muted-foreground ml-6 mb-2">{node.detalhe}</p>
      <div className="ml-2 space-y-0">
        {ctesDaUf.map((cte) => <CteRow key={cte.id} node={cte} idx={parseInt(cte.id.split("-")[1])} onPreview={onPreview} />)}
      </div>
    </Card>
  );
}

function CiotCard({ node }: { node: NodeWithStatus }) {
  const allDone = node.status === "autorizado";
  return (
    <Card className={cn(
      "p-3 transition-colors",
      allDone ? "border-emerald-300 bg-emerald-50/40" :
      node.status === "processando" ? "border-violet-300 bg-violet-50/40" : ""
    )}>
      <div className="flex items-center gap-2 mb-2">
        <StatusDot status={node.status} />
        <ShieldCheck className="w-4 h-4 text-emerald-700" />
        <span className="font-semibold text-sm">{node.rotulo}</span>
        <span className="font-mono text-[10px] text-emerald-700 ml-auto">{allDone ? "CIOT-83749477" : "—"}</span>
        <StatusLabel status={node.status} />
      </div>
      <p className="text-[10px] text-muted-foreground ml-6">{node.detalhe}</p>
    </Card>
  );
}

function ValeCard({ node }: { node: NodeWithStatus }) {
  const allDone = node.status === "autorizado";
  return (
    <Card className={cn(
      "p-3 transition-colors",
      allDone ? "border-emerald-300 bg-emerald-50/40" :
      node.status === "processando" ? "border-violet-300 bg-violet-50/40" : ""
    )}>
      <div className="flex items-center gap-2 mb-2">
        <StatusDot status={node.status} />
        <Route className="w-4 h-4 text-amber-700" />
        <span className="font-semibold text-sm">{node.rotulo}</span>
        <span className="font-mono text-[10px] text-amber-700 ml-auto">{allDone ? "VP-2026-0020" : "—"}</span>
        <StatusLabel status={node.status} />
      </div>
      <p className="text-[10px] text-muted-foreground ml-6 mb-2">{node.detalhe}</p>
      {allDone && (
        <div className="ml-6 inline-flex items-center gap-2 text-[10px] py-1 px-2 bg-emerald-50 rounded border border-emerald-200">
          <ShieldCheck className="w-3 h-3 text-emerald-700" />
          <span className="text-emerald-900 font-medium">Conformidade ANTT: valor &gt; piso mínimo</span>
        </div>
      )}
    </Card>
  );
}

// Card de pedido sem NFe — aguarda XML chegar pra emitir CT-e + GNRE
function AguardandoNfeCard({ item, idx }: { item: SimItem; idx: number }) {
  return (
    <Card className="p-3 border-amber-300 bg-amber-50/40">
      <div className="flex items-center gap-2 mb-2 flex-wrap">
        <Hourglass className="w-4 h-4 text-amber-700 shrink-0 animate-pulse" />
        <span className="font-mono text-[11px] text-blue-600">{item.oc}</span>
        <span className="font-semibold text-sm flex-1 min-w-0 truncate">{item.cliente}</span>
        <span className="text-muted-foreground text-[11px] flex items-center gap-0.5"><MapPin className="w-2.5 h-2.5" />{item.destino}/{item.uf}</span>
        <Badge variant="warning" className="text-[9px] px-1.5 gap-0.5">
          <Hourglass className="w-2.5 h-2.5" />Aguardando NFe
        </Badge>
      </div>
      <p className="text-[11px] text-amber-900 ml-6 mb-2 italic">
        NFe ainda não recebida — chegará via resposta de e-mail do cliente (resposta à Etapa 2).
      </p>
      <div className="ml-6 p-2 bg-white rounded border border-amber-200 text-[11px] space-y-1">
        <p className="text-muted-foreground font-semibold uppercase text-[9px] tracking-wider mb-1">Será emitido automaticamente quando o XML chegar:</p>
        <div className="flex items-center gap-2">
          <FileSignature className="w-3 h-3 text-violet-600" />
          <span>CT-e — {item.destino}/{item.uf} · estimado R$ {item.valor.toLocaleString("pt-BR")}</span>
        </div>
        <div className="flex items-center gap-2">
          <Receipt className="w-3 h-3 text-amber-700" />
          <span>GNRE ICMS-ST · UF {item.uf}</span>
        </div>
      </div>
    </Card>
  );
}

export function Step3Emissao({ onComplete, isComplete, running, pedidosIdxs }: {
  onComplete: () => void;
  isComplete: boolean;
  running: boolean;
  // Índices dos pedidos selecionados em Step1. Se undefined, considera todos.
  pedidosIdxs?: number[];
}) {
  // Como nenhuma NFe chegou ainda, a etapa apenas mostra o PLANO de emissão e a lista de pedidos
  // aguardando XML. A emissão real acontecerá em background na tela da Ordem de Carregamento.
  const idxsAtivos = useMemo(
    () => pedidosIdxs ?? simItens.map((_, i) => i),
    [pedidosIdxs],
  );
  const itensAtivos = useMemo(() => idxsAtivos.map(i => simItens[i]).filter(Boolean), [idxsAtivos]);
  const ufStatsAtivos = useMemo(() => computeUfStats(idxsAtivos), [idxsAtivos]);
  const totais = useMemo(() => computeTotais(idxsAtivos), [idxsAtivos]);

  const totalCtes = totais.qtdPedidos;
  const totalMdfes = totais.qtdMdfes;
  const totalGnres = totais.qtdPedidos; // 1 GNRE por CT-e interestadual
  const totalCiot = totalCtes > 0 ? 1 : 0;
  const totalVale = totalCtes > 0 ? 1 : 0;

  const pesoTotal = totais.peso;
  const freteTotal = totais.frete;
  const gnreTotal = totais.gnre;

  return (
    <StepShell
      stepId={3}
      title="Plano de emissão fiscal"
      subtitle="Documentos serão emitidos automaticamente conforme as NFes chegarem por e-mail · acompanhamento em tempo real na Ordem de Carregamento"
      icon={FileSignature}
      isComplete={isComplete}
      running={running}
      onComplete={onComplete}
      autoDelayMs={1500}
    >
      {/* ============ Card resumo dos totais ============ */}
      <Card className="p-4 mb-4 border-violet-200 bg-gradient-to-br from-violet-50/40 to-white">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs uppercase tracking-wider text-violet-700 font-semibold flex items-center gap-1.5">
            <FileSpreadsheet className="w-3 h-3" />Documentos que serão emitidos
          </p>
          <Badge variant="info" className="text-[10px]">{totalCtes + totalMdfes + totalGnres + totalCiot + totalVale} documentos no total</Badge>
        </div>

        <div className="grid grid-cols-5 gap-2 mb-3">
          <Card className="p-2.5 text-center">
            <p className="text-2xl font-bold tabular-nums text-blue-700">{totalCtes}</p>
            <p className="text-[10px] text-muted-foreground">CT-e</p>
            <p className="text-[9px] text-muted-foreground mt-0.5">1 por pedido</p>
          </Card>
          <Card className="p-2.5 text-center">
            <p className="text-2xl font-bold tabular-nums text-amber-700">{totalGnres}</p>
            <p className="text-[10px] text-muted-foreground">GNRE</p>
            <p className="text-[9px] text-muted-foreground mt-0.5">ICMS-ST por UF</p>
          </Card>
          <Card className="p-2.5 text-center">
            <p className="text-2xl font-bold tabular-nums text-violet-700">{totalMdfes}</p>
            <p className="text-[10px] text-muted-foreground">MDF-e</p>
            <p className="text-[9px] text-muted-foreground mt-0.5">1 por UF</p>
          </Card>
          <Card className="p-2.5 text-center">
            <p className="text-2xl font-bold tabular-nums text-emerald-700">{totalCiot}</p>
            <p className="text-[10px] text-muted-foreground">CIOT</p>
            <p className="text-[9px] text-muted-foreground mt-0.5">ANTT · viagem</p>
          </Card>
          <Card className="p-2.5 text-center">
            <p className="text-2xl font-bold tabular-nums text-amber-700">{totalVale}</p>
            <p className="text-[10px] text-muted-foreground">Vale-pedágio</p>
            <p className="text-[9px] text-muted-foreground mt-0.5">Rota multi-stop</p>
          </Card>
        </div>

        {/* Distribuição por UF (dinâmica conforme seleção da Etapa 1) */}
        {ufStatsAtivos.length > 0 && (
          <div className="border-t pt-3 mt-2">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">Distribuição por UF de destino</p>
            <div className={cn(
              "grid gap-2",
              ufStatsAtivos.length === 1 ? "grid-cols-1" :
              ufStatsAtivos.length === 2 ? "grid-cols-2" :
              ufStatsAtivos.length === 3 ? "grid-cols-3" : "grid-cols-4",
            )}>
              {ufStatsAtivos.map(u => (
                <div key={u.uf} className="flex items-center gap-2 p-2 bg-white rounded border border-slate-200 text-xs">
                  <Badge variant="info" className="text-[10px] font-bold">{u.uf}</Badge>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{u.ctes} CT-e · 1 MDF-e</p>
                    <p className="text-[10px] text-muted-foreground">{u.peso.toLocaleString("pt-BR")} kg · {formatCurrency(u.valor)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Totais financeiros */}
        <div className="border-t pt-3 mt-3 grid grid-cols-3 gap-3 text-xs">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Peso total</p>
            <p className="text-sm font-bold mt-0.5">{pesoTotal.toLocaleString("pt-BR")} kg</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Frete total (CT-es)</p>
            <p className="text-sm font-bold mt-0.5">{formatCurrency(freteTotal)}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">ICMS-ST estimado</p>
            <p className="text-sm font-bold mt-0.5 text-amber-700">{formatCurrency(gnreTotal)}</p>
          </div>
        </div>
      </Card>

      {/* ============ Banner explicativo ============ */}
      <Card className="p-3 mb-4 bg-amber-50 border-amber-200 flex items-start gap-2 text-[11px] text-amber-900">
        <Hourglass className="w-4 h-4 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold mb-0.5">Como funciona a emissão automática</p>
          <ol className="list-decimal ml-4 mt-1 space-y-0.5">
            <li>Clientes respondem o e-mail da Etapa 2 com o XML da NFe anexado</li>
            <li>Sistema casa automaticamente o XML com a OC (verifica a cada 5s)</li>
            <li>Para cada NFe casada: emite o <strong>CT-e</strong> + <strong>GNRE</strong> correspondentes</li>
            <li>Quando todos os CT-es de uma UF autorizam: emite o <strong>MDF-e</strong> dessa UF</li>
            <li>Após cada MDF-e: solicita <strong>monitoramento na Tecnorisk</strong> com a chave do documento</li>
          </ol>
          <p className="mt-1.5">
            Acompanhamento em tempo real na tela da <strong>Ordem de Carregamento</strong> (próxima etapa).
          </p>
        </div>
      </Card>

      {/* ============ Lista de pedidos aguardando NFe (somente os selecionados na Etapa 1) ============ */}
      <div className="flex items-center justify-between mb-2">
        <p className="text-[10px] uppercase tracking-wider text-amber-700 font-semibold flex items-center gap-1.5">
          <Hourglass className="w-3 h-3" />Pedidos aguardando NFe ({totalCtes})
        </p>
        <Badge variant="warning" className="text-[10px]">{totalCtes} CT-es pendentes</Badge>
      </div>
      <div className="space-y-2">
        {idxsAtivos.map((i) => (
          <AguardandoNfeCard key={i} item={simItens[i]} idx={i} />
        ))}
      </div>
    </StepShell>
  );
}

// ===================================================================
// ResumoROI compacto — mostrado no final da simulação (antes de redirecionar)
// ===================================================================
export function ResumoROI({ elapsedMs, baselineMin, onView }: { elapsedMs: number; baselineMin: number; onView: () => void }) {
  const elapsedMin = elapsedMs / 60000;
  const savedPerCarga = Math.max(0, baselineMin - elapsedMin);
  const DIAS = 22, CARGAS_DIA = 5;
  const horasMes = (savedPerCarga * DIAS * CARGAS_DIA) / 60;
  const horasAno = horasMes * 12;
  const fte = horasMes / (40 * 4);
  const semNfe = simItens.filter(it => !it.nf).length;

  return (
    <Card className="overflow-hidden border-emerald-300 shadow-lg">
      <div className="p-7 bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700 text-white text-center">
        <Sparkles className="w-9 h-9 mx-auto mb-2 opacity-90" />
        <p className="text-emerald-100 text-xs uppercase tracking-wider font-semibold">Ordem de carregamento criada · economia por carga</p>
        <p className="text-6xl font-bold tracking-tight mt-2 font-mono tabular-nums">{savedPerCarga.toFixed(1)} min</p>
        <p className="text-emerald-100 text-sm mt-1">de {baselineMin} min (manual) para {elapsedMin.toFixed(1)} min (Zorte)</p>
      </div>
      <div className="p-5 grid grid-cols-3 gap-3">
        <div className="text-center">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Por mês</p>
          <p className="text-2xl font-bold mt-1">{horasMes.toFixed(0)}<span className="text-sm text-muted-foreground ml-1">h</span></p>
        </div>
        <div className="text-center border-x">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Por ano</p>
          <p className="text-2xl font-bold mt-1">{horasAno.toFixed(0)}<span className="text-sm text-muted-foreground ml-1">h</span></p>
        </div>
        <div className="text-center">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">FTE liberado</p>
          <p className="text-2xl font-bold mt-1">{fte.toFixed(1)}</p>
        </div>
      </div>
      {semNfe > 0 && (
        <div className="px-5 pb-3">
          <Card className="p-2.5 bg-amber-50 border-amber-200 flex items-start gap-2 text-[11px] text-amber-900">
            <Hourglass className="w-3.5 h-3.5 mt-0.5 shrink-0" />
            <span>
              <strong>{semNfe} CT-e{semNfe > 1 ? "s" : ""} aguardando NFe</strong> — abra a Ordem de Carregamento para acompanhar a emissão automática à medida que as respostas de e-mail chegam (verificação a cada 5s). Após cada MDF-e, a integração Tecnorisk é acionada.
            </span>
          </Card>
        </div>
      )}
      <div className="p-5 pt-0">
        <Button className="w-full" onClick={onView}>
          <ArrowRight className="w-4 h-4 mr-2" />
          Ver Ordem de Carregamento {simCarga.numeroOC}
        </Button>
      </div>
    </Card>
  );
}
