import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";
import { Stepper } from "@/components/simulacao/stepper";
import {
  Step1FormacaoIA, Step2Emails, Step3Emissao,
  type Step1Selecao,
} from "@/components/simulacao/step-cards";
import {
  Play, RotateCw, Trophy, Wand2, Mail, FileSignature,
  ChevronLeft, ChevronRight, Loader2,
} from "lucide-react";
import { simCarga, simGruposEmail } from "@/lib/simulacao-data";
import { saveSimulacaoExecutada, clearSimulacaoExecutada } from "@/lib/simulacao-runtime";

const STEPS = [
  { id: 1, nome: "Formação com IA" },
  { id: 2, nome: "E-mails" },
  { id: 3, nome: "Emissão fiscal" },
];

export function Simulacao() {
  const navigate = useNavigate();
  const [started, setStarted] = useState(false);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [step, setStep] = useState(1);
  const [completed, setCompleted] = useState<boolean[]>([false, false, false]);
  const [executando, setExecutando] = useState(false);
  const [finalElapsedMs, setFinalElapsedMs] = useState<number | undefined>(undefined);
  // IDs dos grupos selecionados em Step2Emails — persistidos pra ordem-detalhe consumir
  const [gruposSelIds, setGruposSelIds] = useState<string[]>(
    simGruposEmail.filter(g => g.preSelecionado).map(g => g.id)
  );
  const handleGruposChange = useCallback((ids: string[]) => setGruposSelIds(ids), []);
  // Seleção da Etapa 1 (pedidos, motorista, veículo) — propagada pras outras etapas e Ordem
  const [step1Sel, setStep1Sel] = useState<Step1Selecao>({
    pedidosIdxs: [],
    motoristaId: null,
    veiculoId: null,
  });
  const handleStep1Selecao = useCallback((sel: Step1Selecao) => setStep1Sel(sel), []);
  // Validade de cada etapa (reportado pelos próprios componentes Step*).
  // Etapa 1: pedidos + motorista + veículo. Etapa 2/3 sempre válidas por enquanto.
  const [step1Valid, setStep1Valid] = useState(false);
  const handleStep1Validity = useCallback((v: boolean) => setStep1Valid(v), []);
  const stepValid = step === 1 ? step1Valid : true;

  const allDone = completed.every(Boolean);
  const stepperCurrent = allDone ? STEPS.length + 1 : step;
  const stepCompleted = completed[step - 1];

  // Refs pra controlar o auto-redirect sem ficar sujeito a re-renders/cleanups intermediários.
  // (Se usássemos um único useEffect com cleanup, o setTimeout seria cancelado a cada re-render
  // disparado pelo setFinalElapsedMs ou pela mudança de gruposSelIds, e o navigate nunca aconteceria.)
  const redirectScheduledRef = useRef(false);
  const redirectTimeoutRef = useRef<number | null>(null);
  const gruposRef = useRef(gruposSelIds);
  const step1Ref = useRef(step1Sel);
  useEffect(() => { gruposRef.current = gruposSelIds; }, [gruposSelIds]);
  useEffect(() => { step1Ref.current = step1Sel; }, [step1Sel]);

  // Cleanup só no unmount (não a cada re-render)
  useEffect(() => () => {
    if (redirectTimeoutRef.current) window.clearTimeout(redirectTimeoutRef.current);
  }, []);

  // Congela cronômetro e auto-redireciona pra Ordem assim que a última etapa termina
  useEffect(() => {
    if (!allDone || startedAt === null || redirectScheduledRef.current) return;
    redirectScheduledRef.current = true;
    setFinalElapsedMs(Date.now() - startedAt);
    // Persiste estado da simulação pra ordem-detalhe consumir
    saveSimulacaoExecutada({
      ordemId: simCarga.id,
      cargaId: simCarga.id,
      numeroOC: simCarga.numeroOC,
      timestamp: new Date().toISOString(),
      gruposSelecionadosIds: gruposRef.current,
      pedidosIdxs: step1Ref.current.pedidosIdxs,
      motoristaId: step1Ref.current.motoristaId,
      veiculoId: step1Ref.current.veiculoId,
    });
    // Pequeno delay pra o usuário ver o ✓ da última etapa antes de redirecionar
    redirectTimeoutRef.current = window.setTimeout(() => {
      navigate(`/ordens-carregamento/${simCarga.id}`);
    }, 500);
  }, [allDone, startedAt, navigate]);

  // Avança automaticamente para a próxima etapa quando a atual completa
  useEffect(() => {
    if (!started || allDone) return;
    if (stepCompleted && step < 3) {
      const t = setTimeout(() => {
        setStep(s => s + 1);
        setExecutando(false);
      }, 800);
      return () => clearTimeout(t);
    }
  }, [stepCompleted, step, started, allDone]);

  const start = () => {
    setStarted(true);
    setStartedAt(Date.now());
    setStep(1);
    setCompleted([false, false, false]);
    setExecutando(false);
    setFinalElapsedMs(undefined);
    redirectScheduledRef.current = false;
  };

  const reset = () => {
    setStarted(false);
    setStartedAt(null);
    setStep(1);
    setCompleted([false, false, false]);
    setExecutando(false);
    setFinalElapsedMs(undefined);
    setGruposSelIds(simGruposEmail.filter(g => g.preSelecionado).map(g => g.id));
    setStep1Sel({ pedidosIdxs: [], motoristaId: null, veiculoId: null });
    setStep1Valid(false);
    clearSimulacaoExecutada();
    redirectScheduledRef.current = false;
    if (redirectTimeoutRef.current) {
      window.clearTimeout(redirectTimeoutRef.current);
      redirectTimeoutRef.current = null;
    }
  };

  const completeStep = (idx: number) => {
    setCompleted(prev => {
      if (prev[idx]) return prev;
      const next = [...prev];
      next[idx] = true;
      return next;
    });
    setExecutando(false);
  };

  // Próximo: se a etapa atual não foi executada, dispara execução.
  // Se já foi executada, avança manualmente (apesar do auto-advance).
  const proximo = () => {
    if (executando || allDone) return;
    if (!stepCompleted) {
      if (!stepValid) return; // não executa etapa inválida
      setExecutando(true);
    } else if (step < 3) {
      setStep(step + 1);
    }
  };

  const voltar = () => {
    if (executando) return;
    if (step > 1) setStep(step - 1);
  };

  const goToOrdem = () => {
    // Persiste estado da simulação para a tela da Ordem consumir
    saveSimulacaoExecutada({
      ordemId: simCarga.id,
      cargaId: simCarga.id,
      numeroOC: simCarga.numeroOC,
      timestamp: new Date().toISOString(),
      gruposSelecionadosIds: gruposSelIds,
      pedidosIdxs: step1Sel.pedidosIdxs,
      motoristaId: step1Sel.motoristaId,
      veiculoId: step1Sel.veiculoId,
    });
    navigate(`/ordens-carregamento/${simCarga.id}`);
  };

  // ============================================
  // Tela inicial (antes de iniciar a simulação)
  // ============================================
  if (!started) {
    return (
      <div>
        <PageHeader
          title="Simulação ROI — End-to-End"
          description="Simula o fluxo completo: do XML das NFs ao vale-pedágio · ao final cria uma Ordem de Carregamento"
          badge={{ label: "Demo ★", variant: "phase4" }}
        />

        <Card className="p-8 bg-gradient-to-br from-violet-50 via-white to-emerald-50 border-violet-200">
          <div className="grid grid-cols-[1fr_360px] gap-8 items-start">
            <div>
              <div className="inline-flex items-center gap-1.5 bg-violet-100 text-violet-700 rounded-full px-3 py-1 text-xs font-semibold mb-3">
                <Trophy className="w-3.5 h-3.5" />
                Peça central da apresentação · Dorfketal
              </div>
              <h2 className="text-3xl font-bold tracking-tight mb-2">Vamos simular o fluxo real?</h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                Usa a carga real que o Rodrigo enviou no e-mail (<span className="font-mono font-semibold">{simCarga.numeroOC}</span> · motorista <strong>{simCarga.motorista}</strong> · placa <span className="font-mono font-semibold">{simCarga.placa}</span>).
                Em <strong>3 etapas</strong>: IA forma a carga, dispara os e-mails, e emite tudo o que é fiscal em paralelo.
              </p>

              <Button size="lg" onClick={start}>
                <Play className="w-4 h-4 mr-2" /> Iniciar simulação
              </Button>
              <p className="text-[11px] text-muted-foreground mt-2">
                Ao final, redireciona para a tela da <strong>Ordem de Carregamento</strong> com tudo agrupado.
              </p>
            </div>
            <Card className="p-5 bg-white">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-3">As 3 etapas</p>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-violet-100 text-violet-700 font-bold flex items-center justify-center text-sm shrink-0">1</div>
                  <div>
                    <p className="text-sm font-semibold flex items-center gap-1.5"><Wand2 className="w-3.5 h-3.5 text-violet-600" />Formação com IA</p>
                    <p className="text-xs text-muted-foreground">Sugere pedidos, transferências, XMLs casados, veículo e motorista</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-violet-100 text-violet-700 font-bold flex items-center justify-center text-sm shrink-0">2</div>
                  <div>
                    <p className="text-sm font-semibold flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-violet-600" />Disparo dos e-mails</p>
                    <p className="text-xs text-muted-foreground">Grupos de notificação por UF + Faturamento</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-violet-100 text-violet-700 font-bold flex items-center justify-center text-sm shrink-0">3</div>
                  <div>
                    <p className="text-sm font-semibold flex items-center gap-1.5"><FileSignature className="w-3.5 h-3.5 text-violet-600" />Emissão fiscal em tempo real</p>
                    <p className="text-xs text-muted-foreground">CT-e (+GNRE) → MDF-e por UF → CIOT → Vale-pedágio · todos em paralelo</p>
                  </div>
                </div>
              </div>
              <div className="border-t pt-3 mt-4 flex items-center gap-2 text-xs">
                <Trophy className="w-4 h-4 text-emerald-600" />
                <span className="font-semibold text-emerald-700">Ordem de Carregamento {simCarga.numeroOC}</span>
              </div>
            </Card>
          </div>
        </Card>
      </div>
    );
  }

  // ============================================
  // Wizard em execução
  // ============================================
  return (
    <div className="pb-20">
      <PageHeader
        title="Simulação ROI — em execução"
        description={`${simCarga.numeroOC} · ${simCarga.motorista} · ${simCarga.placa}`}
        badge={{ label: "Demo ★", variant: "phase4" }}
        actions={
          <Button variant="outline" size="sm" onClick={reset} disabled={executando}>
            <RotateCw className="w-3.5 h-3.5 mr-1.5" />Reiniciar
          </Button>
        }
      />

      <Stepper steps={STEPS} current={stepperCurrent} />

      {/* Apenas a etapa atual é renderizada */}
      {!allDone && step === 1 && (
        <Step1FormacaoIA
          onComplete={() => completeStep(0)}
          isComplete={completed[0]}
          running={executando}
          onValidityChange={handleStep1Validity}
          onSelecaoChange={handleStep1Selecao}
        />
      )}
      {!allDone && step === 2 && (
        <Step2Emails
          onComplete={() => completeStep(1)}
          isComplete={completed[1]}
          running={executando}
          onGruposChange={handleGruposChange}
        />
      )}
      {!allDone && step === 3 && (
        <Step3Emissao
          onComplete={() => completeStep(2)}
          isComplete={completed[2]}
          running={executando}
          pedidosIdxs={step1Sel.pedidosIdxs}
        />
      )}

      {/* Tela de transição enquanto auto-redireciona pra Ordem de Carregamento */}
      {allDone && (
        <Card className="p-10 text-center border-emerald-300 bg-gradient-to-br from-emerald-50 via-white to-violet-50">
          <Trophy className="w-12 h-12 mx-auto text-emerald-600 mb-3" />
          <p className="text-sm uppercase tracking-wider font-semibold text-emerald-700 mb-1">Simulação concluída</p>
          <p className="text-2xl font-bold mb-2">Ordem {simCarga.numeroOC} criada</p>
          <p className="text-sm text-muted-foreground mb-4 inline-flex items-center gap-1.5">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />Redirecionando para a Ordem de Carregamento...
          </p>
        </Card>
      )}

      {/* Footer sticky de navegação */}
      <div className="fixed bottom-0 left-64 right-0 bg-white border-t shadow-md z-20">
        <div className="max-w-[1600px] mx-auto px-6 py-3 flex items-center justify-between">
          {!allDone ? (
            <>
              <Button variant="outline" onClick={voltar} disabled={step === 1 || executando}>
                <ChevronLeft className="w-4 h-4 mr-1" /> Voltar
              </Button>
              <div className="text-xs text-muted-foreground flex items-center gap-3">
                <span>Etapa <strong className="text-foreground">{step}</strong> de {STEPS.length}</span>
                {executando && (
                  <span className="flex items-center gap-1 text-violet-700">
                    <Loader2 className="w-3 h-3 animate-spin" />Executando etapa {step}...
                  </span>
                )}
                {!executando && stepCompleted && step < 3 && (
                  <span className="text-emerald-700">✓ Etapa {step} concluída · avançando...</span>
                )}
                {!executando && !stepCompleted && !stepValid && step === 1 && (
                  <span className="text-amber-700">Selecione pedidos, motorista e veículo para avançar</span>
                )}
                {!executando && !stepCompleted && stepValid && (
                  <span className="text-muted-foreground">Clique em <strong>Próximo</strong> para executar a etapa</span>
                )}
              </div>
              <Button
                onClick={proximo}
                disabled={executando || (stepCompleted && step === 3) || (!stepCompleted && !stepValid)}
                size={!stepCompleted ? "lg" : "default"}
                className={!stepCompleted && stepValid ? "bg-violet-600 hover:bg-violet-700 text-white" : ""}
              >
                {executando ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Executando...</>
                ) : !stepCompleted ? (
                  <><Play className="w-4 h-4 mr-2" />Próximo · executar etapa {step}</>
                ) : (
                  <>Próximo <ChevronRight className="w-4 h-4 ml-1" /></>
                )}
              </Button>
            </>
          ) : (
            <div className="flex items-center justify-center w-full text-xs text-emerald-700 font-semibold gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Simulação concluída · redirecionando para a Ordem {simCarga.numeroOC}...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
