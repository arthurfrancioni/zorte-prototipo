import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Step = { id: number; nome: string };

type Props = {
  steps: Step[];
  current: number; // 1..N, ou N+1 quando concluído (resumo)
};

export function Stepper({ steps, current }: Props) {
  return (
    <div className="bg-white rounded-lg border p-4 mb-4">
      <div className="flex items-center gap-1 overflow-x-auto">
        {steps.map((s, i) => {
          const isDone = current > s.id;
          const isCurrent = current === s.id;
          const isLast = i === steps.length - 1;
          return (
            <div key={s.id} className="flex items-center gap-1 min-w-0">
              <div className={cn(
                "flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs whitespace-nowrap transition-colors",
                isCurrent && "bg-violet-100 text-violet-900 font-semibold ring-2 ring-violet-400",
                isDone && "bg-emerald-50 text-emerald-800",
                !isCurrent && !isDone && "bg-slate-50 text-slate-500"
              )}>
                <span className={cn(
                  "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold",
                  isCurrent && "bg-violet-600 text-white",
                  isDone && "bg-emerald-500 text-white",
                  !isCurrent && !isDone && "bg-slate-300 text-white"
                )}>
                  {isDone ? <CheckCircle2 className="w-3 h-3" /> : s.id}
                </span>
                <span className="truncate max-w-[160px]">{s.nome}</span>
              </div>
              {!isLast && (
                <div className={cn("h-0.5 w-3 shrink-0", isDone ? "bg-emerald-300" : "bg-slate-200")} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
