import { cn } from "@/lib/utils";

type Variant = "recebido" | "programado" | "liberado" | "em_carga" | "entregue" | "cancelado" | "redespacho" |
  "pronta" | "em_transito" | "finalizada" | "cancelada" | "autorizado" | "pendente" | "rejeitado";

const configs: Record<Variant, { label: string; className: string }> = {
  recebido: { label: "Recebido", className: "bg-blue-100 text-blue-800" },
  programado: { label: "Programado", className: "bg-amber-100 text-amber-800" },
  liberado: { label: "Liberado", className: "bg-emerald-100 text-emerald-800" },
  em_carga: { label: "Em Carga", className: "bg-violet-100 text-violet-800" },
  entregue: { label: "Entregue", className: "bg-green-100 text-green-800" },
  cancelado: { label: "Cancelado", className: "bg-rose-100 text-rose-800" },
  redespacho: { label: "Redespacho", className: "bg-sky-100 text-sky-800" },
  pronta: { label: "Pronta", className: "bg-blue-100 text-blue-800" },
  em_transito: { label: "Em Trânsito", className: "bg-amber-100 text-amber-800" },
  finalizada: { label: "Finalizada", className: "bg-emerald-100 text-emerald-800" },
  cancelada: { label: "Cancelada", className: "bg-rose-100 text-rose-800" },
  autorizado: { label: "Autorizado", className: "bg-emerald-100 text-emerald-800" },
  pendente: { label: "Pendente", className: "bg-amber-100 text-amber-800" },
  rejeitado: { label: "Rejeitado", className: "bg-rose-100 text-rose-800" },
};

export function StatusBadge({ status, className }: { status: Variant; className?: string }) {
  const cfg = configs[status];
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium", cfg.className, className)}>
      {cfg.label}
    </span>
  );
}
