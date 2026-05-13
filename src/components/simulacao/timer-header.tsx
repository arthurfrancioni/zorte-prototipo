import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Timer, Hourglass, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  startedAt: number | null; // ms epoch; null = não iniciado
  running: boolean;
  baselineMin: number; // tempo manual (referência)
  finished: boolean;
  finalElapsedMs?: number; // congela quando terminar
};

function formatElapsed(ms: number) {
  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
}

function formatBaseline(min: number) {
  return `${min}:00`;
}

export function TimerHeader({ startedAt, running, baselineMin, finished, finalElapsedMs }: Props) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, [running]);

  const elapsed = finished && finalElapsedMs !== undefined
    ? finalElapsedMs
    : (startedAt ? Math.max(0, now - startedAt) : 0);
  const baselineMs = baselineMin * 60 * 1000;
  const ratio = baselineMs > 0 ? Math.min(elapsed / baselineMs, 1) : 0;
  const savedMin = Math.max(0, baselineMin - elapsed / 60000);

  return (
    <Card className="p-4 sticky top-0 z-10 mb-4 shadow-sm border-violet-200 bg-gradient-to-r from-violet-50 via-white to-emerald-50">
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-6">
        {/* Zorte timer */}
        <div className="flex items-center gap-3">
          <div className={cn("w-11 h-11 rounded-lg flex items-center justify-center", running ? "bg-emerald-100 animate-pulse" : finished ? "bg-emerald-100" : "bg-slate-100")}>
            <Timer className={cn("w-5 h-5", running || finished ? "text-emerald-700" : "text-slate-500")} />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider font-semibold text-emerald-700">⏱ Zorte (este protótipo)</p>
            <p className={cn("font-mono tabular-nums text-3xl font-bold tracking-tight", finished ? "text-emerald-700" : "text-slate-900")}>
              {formatElapsed(elapsed)}
            </p>
            <p className="text-[11px] text-muted-foreground">{running ? "Cronômetro rodando..." : finished ? "Fluxo concluído" : "Aguardando início"}</p>
          </div>
        </div>

        {/* Comparação no meio */}
        <div className="text-center">
          <div className="flex items-center gap-2 text-emerald-700 font-semibold">
            <TrendingDown className="w-4 h-4" />
            <span className="text-xl">{savedMin.toFixed(1)} min economizados</span>
          </div>
          <div className="mt-1 h-1.5 w-40 rounded-full bg-slate-200 overflow-hidden mx-auto">
            <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all" style={{ width: `${ratio * 100}%` }} />
          </div>
          <p className="text-[10px] text-muted-foreground mt-1">{(ratio * 100).toFixed(0)}% do tempo manual usado</p>
        </div>

        {/* Manual estimado */}
        <div className="flex items-center gap-3 justify-end">
          <div>
            <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 text-right">Manual (como é hoje)</p>
            <p className="font-mono tabular-nums text-3xl font-bold tracking-tight text-slate-500 text-right line-through decoration-rose-400 decoration-2">
              {formatBaseline(baselineMin)}
            </p>
            <p className="text-[11px] text-muted-foreground text-right">Smart online + GNRE + 1-por-vez</p>
          </div>
          <div className="w-11 h-11 rounded-lg bg-slate-100 flex items-center justify-center">
            <Hourglass className="w-5 h-5 text-slate-500" />
          </div>
        </div>
      </div>
    </Card>
  );
}
