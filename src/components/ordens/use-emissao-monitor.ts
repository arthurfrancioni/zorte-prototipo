import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { toast } from "sonner";
import type { CTe } from "@/lib/mock-data";

// Polling de "NFes chegando por e-mail":
// - A cada POLL_INTERVAL_S, simula chegada de 1 NFe (XML casado com 1 CT-e).
// - CT-e vai de "aguardando_nfe" → "processando" (CTE_PROCESSING_MS) → "autorizado".
// - Quando todos CT-es de uma UF estão autorizados: dispara MDF-e dessa UF.
// - Quando MDF-e é autorizado: dispara solicitação Tecnorisk com a chave do MDF-e.

const POLL_INTERVAL_S = 5;
const CTE_PROCESSING_MS = 1500;
const MDFE_PROCESSING_MS = 2000;
const TECNORISK_PROCESSING_MS = 1200;
const MDFE_DELAY_AFTER_CTE_MS = 600;
const TECNORISK_DELAY_AFTER_MDFE_MS = 600;

export type CteEffectiveStatus = "aguardando_nfe" | "processando" | "autorizado";
export type MdfeEffectiveStatus = "aguardando_ctes" | "processando" | "autorizado";
export type TecnoriskStatus = "pendente" | "processando" | "ativo";

export interface EmissaoMonitorState {
  arrivedCount: number;
  processingCteIdx: number | null;
  processingMdfeUf: string | null;
  authMdfeUfs: Set<string>;
  processingTecnoriskUf: string | null;
  activeTecnoriskUfs: Set<string>;
  secondsToNext: number;
  paused: boolean;
}

export interface EmissaoMonitor extends EmissaoMonitorState {
  cteStatus: (idx: number) => CteEffectiveStatus;
  mdfeStatus: (uf: string) => MdfeEffectiveStatus;
  tecnoriskStatus: (uf: string) => TecnoriskStatus;
  totalCtes: number;
  allArrived: boolean;
  allComplete: boolean;
  pause: () => void;
  resume: () => void;
  verifyNow: () => void;
  reset: () => void;
}

export interface EmissaoMonitorOptions {
  onNfeArrived?: (cte: CTe, idx: number) => void;
  onMdfeAuthorized?: (uf: string) => void;
  onTecnoriskActive?: (uf: string) => void;
}

// Gera código de monitoramento Tecnorisk pra um MDF-e
export const tecnoriskCodigo = (uf: string, cargaNumero: string) =>
  `MON-${cargaNumero.slice(-4)}-${uf}`;

// Chave fictícia do MDF-e
export const mdfeChave = (uf: string, idxUf: number) =>
  `43260499999999000100580010000${(idxUf + 1).toString().padStart(5, "0")}${uf === "SC" ? "01" : uf === "SP" ? "02" : uf === "RJ" ? "03" : "04"}123456`;

export function useEmissaoMonitor(
  ctes: CTe[],
  cargaNumero: string,
  enabled: boolean,
  options: EmissaoMonitorOptions = {},
): EmissaoMonitor {
  const { onNfeArrived, onMdfeAuthorized, onTecnoriskActive } = options;

  const totalCtes = ctes.length;
  const ufsOrdered = useMemo(
    () => Array.from(new Set(ctes.map(c => c.ufDestino))),
    [ctes],
  );
  const totalUfs = ufsOrdered.length;

  const [arrivedCount, setArrivedCount] = useState(0);
  const [processingCteIdx, setProcessingCteIdx] = useState<number | null>(null);
  const [processingMdfeUf, setProcessingMdfeUf] = useState<string | null>(null);
  const [authMdfeUfs, setAuthMdfeUfs] = useState<Set<string>>(new Set());
  const [processingTecnoriskUf, setProcessingTecnoriskUf] = useState<string | null>(null);
  const [activeTecnoriskUfs, setActiveTecnoriskUfs] = useState<Set<string>>(new Set());
  const [secondsToNext, setSecondsToNext] = useState(POLL_INTERVAL_S);
  const [paused, setPaused] = useState(false);

  // Refs de idempotência — protegem contra disparos duplicados (StrictMode, re-renders, stale closures)
  const firedCteRef = useRef<Set<number>>(new Set());
  const triggeredMdfeUfsRef = useRef<Set<string>>(new Set());
  const triggeredTecnoriskUfsRef = useRef<Set<string>>(new Set());

  // Refs com props/options atualizados pra usar dentro de setTimeouts sem stale closure
  const ctesRef = useRef(ctes);
  const cargaNumeroRef = useRef(cargaNumero);
  const onNfeArrivedRef = useRef(onNfeArrived);
  const onMdfeAuthorizedRef = useRef(onMdfeAuthorized);
  const onTecnoriskActiveRef = useRef(onTecnoriskActive);
  useEffect(() => { ctesRef.current = ctes; }, [ctes]);
  useEffect(() => { cargaNumeroRef.current = cargaNumero; }, [cargaNumero]);
  useEffect(() => { onNfeArrivedRef.current = onNfeArrived; }, [onNfeArrived]);
  useEffect(() => { onMdfeAuthorizedRef.current = onMdfeAuthorized; }, [onMdfeAuthorized]);
  useEffect(() => { onTecnoriskActiveRef.current = onTecnoriskActive; }, [onTecnoriskActive]);

  const allArrived = arrivedCount >= totalCtes && processingCteIdx === null;
  const allComplete = allArrived && authMdfeUfs.size === totalUfs && activeTecnoriskUfs.size === totalUfs;

  // Status efetivos (derivados do state)
  const cteStatus = useCallback((idx: number): CteEffectiveStatus => {
    if (processingCteIdx === idx) return "processando";
    if (idx < arrivedCount) return "autorizado";
    return "aguardando_nfe";
  }, [arrivedCount, processingCteIdx]);

  const mdfeStatus = useCallback((uf: string): MdfeEffectiveStatus => {
    if (authMdfeUfs.has(uf)) return "autorizado";
    if (processingMdfeUf === uf) return "processando";
    return "aguardando_ctes";
  }, [authMdfeUfs, processingMdfeUf]);

  const tecnoriskStatus = useCallback((uf: string): TecnoriskStatus => {
    if (activeTecnoriskUfs.has(uf)) return "ativo";
    if (processingTecnoriskUf === uf) return "processando";
    return "pendente";
  }, [activeTecnoriskUfs, processingTecnoriskUf]);

  // ============================================================
  // Disparo de um CT-e (idempotente via firedCteRef)
  // ============================================================
  const fireCte = useCallback((idx: number) => {
    if (firedCteRef.current.has(idx)) return;
    firedCteRef.current.add(idx);

    const currentCtes = ctesRef.current;
    const cte = currentCtes[idx];
    if (!cte) return;

    toast.info(`📧 NFe recebida — ${cte.cliente}`, {
      description: `XML casado com OC. Iniciando emissão do CT-e...`,
      duration: 3500,
    });
    onNfeArrivedRef.current?.(cte, idx);

    setProcessingCteIdx(idx);

    window.setTimeout(() => {
      const numeroCte = `CTE-2026-${(240 + idx).toString().padStart(5, "0")}`;
      toast.success(`✓ CT-e ${numeroCte} autorizado`, {
        description: `${cte.cliente} · ${cte.cidadeDestino}/${cte.ufDestino}`,
        duration: 4000,
      });
      // Único setter "ascendente" do CT-e: incrementa arrivedCount e libera o slot de processing.
      // O useEffect abaixo reage e dispara o MDF-e da UF quando ela ficar completa.
      setArrivedCount(prev => Math.max(prev, idx + 1));
      setProcessingCteIdx(prev => (prev === idx ? null : prev));
    }, CTE_PROCESSING_MS);
  }, []);

  // ============================================================
  // Disparo de um MDF-e (idempotente via triggeredMdfeUfsRef)
  // ============================================================
  const fireMdfe = useCallback((uf: string) => {
    if (triggeredMdfeUfsRef.current.has(uf)) return;
    triggeredMdfeUfsRef.current.add(uf);

    const ctesUf = ctesRef.current.filter(c => c.ufDestino === uf);
    setProcessingMdfeUf(uf);

    toast.info(`📄 Emitindo MDF-e · UF ${uf}`, {
      description: `${ctesUf.length} CT-e(s) consolidados nesta UF`,
      duration: 3000,
    });

    window.setTimeout(() => {
      const numeroMdfe = `MDFE-${cargaNumeroRef.current.replace("CRG-", "")}-${uf}01`;
      toast.success(`✓ MDF-e ${numeroMdfe} autorizado`, {
        description: `Consolidando rota RS → ${uf}`,
        duration: 4000,
      });
      setAuthMdfeUfs(prev => {
        if (prev.has(uf)) return prev;
        const next = new Set(prev);
        next.add(uf);
        return next;
      });
      setProcessingMdfeUf(prev => (prev === uf ? null : prev));
      onMdfeAuthorizedRef.current?.(uf);
      // O useEffect abaixo reage à mudança em authMdfeUfs e dispara o Tecnorisk
    }, MDFE_PROCESSING_MS);
  }, []);

  // ============================================================
  // Disparo de uma solicitação Tecnorisk (idempotente via triggeredTecnoriskUfsRef)
  // ============================================================
  const fireTecnorisk = useCallback((uf: string) => {
    if (triggeredTecnoriskUfsRef.current.has(uf)) return;
    triggeredTecnoriskUfsRef.current.add(uf);

    const ufIdx = Array.from(new Set(ctesRef.current.map(c => c.ufDestino))).indexOf(uf);
    const chave = mdfeChave(uf, ufIdx);
    const cod = tecnoriskCodigo(uf, cargaNumeroRef.current);

    setProcessingTecnoriskUf(uf);

    toast.info(`📡 Solicitando monitoramento Tecnorisk · ${uf}`, {
      description: `Enviando chave do MDF-e: ${chave.slice(0, 12)}...`,
      duration: 2500,
    });

    window.setTimeout(() => {
      toast.success(`🛡️ Monitoramento ativo · ${cod}`, {
        description: `Tecnorisk confirmou o cadastro da carga para UF ${uf}`,
        duration: 4500,
      });
      setActiveTecnoriskUfs(prev => {
        if (prev.has(uf)) return prev;
        const next = new Set(prev);
        next.add(uf);
        return next;
      });
      setProcessingTecnoriskUf(prev => (prev === uf ? null : prev));
      onTecnoriskActiveRef.current?.(uf);
    }, TECNORISK_PROCESSING_MS);
  }, []);

  // ============================================================
  // Tick principal — decrementa secondsToNext e dispara próxima NFe
  // ============================================================
  useEffect(() => {
    if (!enabled || paused) return;
    if (arrivedCount >= totalCtes && processingCteIdx === null) return;

    const id = window.setInterval(() => {
      setSecondsToNext(s => {
        if (s > 1) return s - 1;
        // Tempo esgotado: dispara próxima NFe se nenhuma estiver processando
        if (processingCteIdx === null && arrivedCount < totalCtes) {
          // Agenda fora do reducer pra evitar side effects duplicados (StrictMode)
          window.setTimeout(() => fireCte(arrivedCount), 0);
        }
        return POLL_INTERVAL_S;
      });
    }, 1000);

    return () => window.clearInterval(id);
  }, [enabled, paused, arrivedCount, processingCteIdx, totalCtes, fireCte]);

  // ============================================================
  // Effect reativo: quando arrivedCount muda, verifica UFs completas e dispara MDF-e
  // ============================================================
  useEffect(() => {
    if (arrivedCount === 0) return;
    // Para cada UF, checa se todos os seus CT-es já chegaram (idx < arrivedCount)
    ufsOrdered.forEach(uf => {
      if (triggeredMdfeUfsRef.current.has(uf)) return;
      const idxsUf = ctes
        .map((c, i) => (c.ufDestino === uf ? i : -1))
        .filter(i => i >= 0);
      const allArrivedInUf = idxsUf.every(i => i < arrivedCount);
      if (allArrivedInUf) {
        window.setTimeout(() => fireMdfe(uf), MDFE_DELAY_AFTER_CTE_MS);
      }
    });
  }, [arrivedCount, ctes, ufsOrdered, fireMdfe]);

  // ============================================================
  // Effect reativo: quando authMdfeUfs muda, dispara Tecnorisk para cada UF nova
  // ============================================================
  useEffect(() => {
    authMdfeUfs.forEach(uf => {
      if (triggeredTecnoriskUfsRef.current.has(uf)) return;
      window.setTimeout(() => fireTecnorisk(uf), TECNORISK_DELAY_AFTER_MDFE_MS);
    });
  }, [authMdfeUfs, fireTecnorisk]);

  // ============================================================
  // Ações expostas
  // ============================================================
  const verifyNow = useCallback(() => {
    if (processingCteIdx !== null) return;
    if (arrivedCount >= totalCtes) return;
    setSecondsToNext(POLL_INTERVAL_S);
    fireCte(arrivedCount);
  }, [arrivedCount, processingCteIdx, totalCtes, fireCte]);

  const pause = useCallback(() => setPaused(true), []);
  const resume = useCallback(() => setPaused(false), []);
  const reset = useCallback(() => {
    firedCteRef.current = new Set();
    triggeredMdfeUfsRef.current = new Set();
    triggeredTecnoriskUfsRef.current = new Set();
    setArrivedCount(0);
    setProcessingCteIdx(null);
    setProcessingMdfeUf(null);
    setAuthMdfeUfs(new Set());
    setProcessingTecnoriskUf(null);
    setActiveTecnoriskUfs(new Set());
    setSecondsToNext(POLL_INTERVAL_S);
    setPaused(false);
  }, []);

  return {
    arrivedCount,
    processingCteIdx,
    processingMdfeUf,
    authMdfeUfs,
    processingTecnoriskUf,
    activeTecnoriskUfs,
    secondsToNext,
    paused,
    cteStatus,
    mdfeStatus,
    tecnoriskStatus,
    totalCtes,
    allArrived,
    allComplete,
    pause,
    resume,
    verifyNow,
    reset,
  };
}
