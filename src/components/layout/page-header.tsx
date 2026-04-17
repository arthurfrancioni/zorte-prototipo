import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  badge?: { label: string; variant?: "phase1" | "phase2" | "phase3" | "phase4" };
  actions?: React.ReactNode;
}

const badgeStyles = {
  phase1: "bg-emerald-100 text-emerald-800",
  phase2: "bg-blue-100 text-blue-800",
  phase3: "bg-amber-100 text-amber-800",
  phase4: "bg-violet-100 text-violet-800",
};

export function PageHeader({ title, description, badge, actions }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4 mb-6">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          {badge && (
            <span className={cn("text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded", badgeStyles[badge.variant || "phase1"])}>
              {badge.label}
            </span>
          )}
        </div>
        {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
}
