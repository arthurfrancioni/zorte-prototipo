import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Hourglass, Mail, RefreshCw, Pause, Play, CheckCircle2, Loader2,
  Shield, Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { EmissaoMonitor } from "./use-emissao-monitor";

export function MonitorEmissaoBanner({ monitor }: { monitor: EmissaoMonitor }) {
  const {
    arrivedCount, totalCtes, processingCteIdx, secondsToNext,
    paused, allArrived, allComplete,
    authMdfeUfs, processingMdfeUf, activeTecnoriskUfs, processingTecnoriskUf,
    pause, resume, verifyNow,
  } = monitor;

  const pct = Math.round((arrivedCount / totalCtes) * 100);

  // Quando tudo já está completo, mostra um banner de sucesso compacto
  if (allComplete) {
    return (
      <Card className="p-3 mb-4 border-emerald-200 bg-emerald-50/50 flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
          <CheckCircle2 className="w-5 h-5 text-emerald-700" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-emerald-900">Emissão fiscal concluída · monitoramento ativo</p>
          <p className="text-xs text-emerald-800 mt-0.5">
            Todas as {totalCtes} NFes chegaram · {authMdfeUfs.size} MDF-es autorizados · {activeTecnoriskUfs.size} solicitações Tecnorisk ativas
          </p>
        </div>
        <Badge variant="success" className="gap-1">
          <Shield className="w-3 h-3" />Tecnorisk ativo
        </Badge>
      </Card>
    );
  }

  return (
    <Card className={cn(
      "p-4 mb-4 border-2 transition-colors",
      allArrived ? "border-violet-300 bg-violet-50/40" : "border-amber-300 bg-amber-50/40",
    )}>
      <div className="flex items-start gap-3 mb-3">
        <div className={cn(
          "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
          allArrived ? "bg-violet-100" : "bg-amber-100",
          !paused && !allArrived && "animate-pulse",
        )}>
          {allArrived ? (
            <Sparkles className="w-5 h-5 text-violet-700" />
          ) : (
            <Hourglass className="w-5 h-5 text-amber-700" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <p className="text-sm font-semibold">
              {allArrived
                ? "Todas NFes recebidas · finalizando documentos da rota"
                : "Aguardando NFes via resposta de e-mail"}
            </p>
            <Badge variant={allArrived ? "info" : "warning"} className="text-[10px]">
              {arrivedCount} / {totalCtes} NFes
            </Badge>
            {processingCteIdx !== null && (
              <Badge variant="info" className="text-[10px] gap-1 animate-pulse">
                <Loader2 className="w-2.5 h-2.5 animate-spin" />Emitindo CT-e
              </Badge>
            )}
            {processingMdfeUf && (
              <Badge variant="info" className="text-[10px] gap-1 animate-pulse">
                <Loader2 className="w-2.5 h-2.5 animate-spin" />Emitindo MDF-e {processingMdfeUf}
              </Badge>
            )}
            {processingTecnoriskUf && (
              <Badge variant="warning" className="text-[10px] gap-1 animate-pulse">
                <Loader2 className="w-2.5 h-2.5 animate-spin" />Tecnorisk {processingTecnoriskUf}
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            <Mail className="w-3 h-3 inline mr-0.5" />
            Sistema verifica caixa de entrada a cada 5 segundos para casar XMLs com pedidos. À medida que as NFes chegam, CT-e e GNRE são emitidos automaticamente.
          </p>
        </div>
        {!allArrived && (
          <div className="flex items-center gap-1 shrink-0">
            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={verifyNow} disabled={paused || processingCteIdx !== null}>
              <RefreshCw className="w-3 h-3 mr-1" />Verificar agora
            </Button>
            {paused ? (
              <Button size="sm" variant="outline" className="h-7 text-xs" onClick={resume}>
                <Play className="w-3 h-3 mr-1" />Retomar
              </Button>
            ) : (
              <Button size="sm" variant="outline" className="h-7 text-xs" onClick={pause}>
                <Pause className="w-3 h-3 mr-1" />Pausar
              </Button>
            )}
          </div>
        )}
      </div>

      <Progress value={pct} className="h-1.5 mb-2" />

      <div className="flex items-center justify-between text-[11px]">
        <span className="text-muted-foreground">
          {!allArrived && !paused && processingCteIdx === null && (
            <>Próxima verificação em <strong className="text-amber-700 tabular-nums">{secondsToNext}s</strong></>
          )}
          {paused && <span className="text-rose-700 font-medium">Verificação pausada</span>}
          {processingCteIdx !== null && <span className="text-violet-700 font-medium">Processando CT-e na SEFAZ...</span>}
          {allArrived && !allComplete && <span className="text-violet-700 font-medium">Finalizando MDF-es e Tecnorisk...</span>}
        </span>
        <div className="flex items-center gap-3 text-[10px]">
          <span className="inline-flex items-center gap-1 text-blue-700">
            <CheckCircle2 className="w-3 h-3" />{arrivedCount} CT-e{arrivedCount !== 1 ? "s" : ""}
          </span>
          <span className="inline-flex items-center gap-1 text-violet-700">
            <CheckCircle2 className="w-3 h-3" />{authMdfeUfs.size} MDF-e{authMdfeUfs.size !== 1 ? "s" : ""}
          </span>
          <span className="inline-flex items-center gap-1 text-emerald-700">
            <Shield className="w-3 h-3" />{activeTecnoriskUfs.size} Tecnorisk
          </span>
        </div>
      </div>
    </Card>
  );
}
