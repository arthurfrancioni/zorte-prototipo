import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Users, Truck, Package, PackagePlus, Mail, FileDown,
  Shield, Sparkles, Wand2, UserCog, CarFront,
} from "lucide-react";

type Item = { to: string; label: string; icon: React.ComponentType<any>; badge?: string };
type Group = { title: string; color: string; items: Item[] };

const groups: Group[] = [
  {
    title: "Visão Geral",
    color: "text-slate-500",
    items: [
      { to: "/", label: "Dashboard Geral", icon: LayoutDashboard },
      { to: "/dashboard/clientes", label: "Dashboard Clientes", icon: Users },
      { to: "/dashboard/transportadora", label: "Dashboard Transportadora", icon: Truck },
    ],
  },
  {
    title: "Fase 1 — Pré-TMS",
    color: "text-emerald-600",
    items: [
      { to: "/importar", label: "Importar Teams", icon: FileDown },
      { to: "/pedidos", label: "Pedidos", icon: Package },
      { to: "/formacao-carga", label: "Formação de Carga", icon: PackagePlus },
      { to: "/grupos-email", label: "Grupos de E-mail", icon: Mail },
      { to: "/motoristas", label: "Motoristas", icon: UserCog },
      { to: "/veiculos", label: "Veículos", icon: CarFront },
    ],
  },
  {
    title: "Fase 3 — Risco",
    color: "text-amber-600",
    items: [{ to: "/tecnorisk", label: "Integração TecnoRisk", icon: Shield, badge: "Condicional" }],
  },
  {
    title: "Fase 4 — Automações",
    color: "text-violet-600",
    items: [
      { to: "/sugestao-carga", label: "Sugestão Automática", icon: Sparkles },
      { to: "/emissao-automatica", label: "Emissão Auto. CT-e", icon: Wand2 },
    ],
  },
];

export function Sidebar() {
  const location = useLocation();
  return (
    <aside className="w-64 shrink-0 border-r bg-white h-screen sticky top-0 overflow-y-auto">
      <div className="p-4 border-b">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
            Z
          </div>
          <div>
            <p className="font-semibold text-sm leading-none">Zorte TMS</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Protótipo · Fases 1, 3 e 4</p>
          </div>
        </div>
      </div>
      <nav className="p-3 pb-8 space-y-4">
        {groups.map((g) => (
          <div key={g.title}>
            <p className={cn("text-[10px] uppercase tracking-wider font-semibold mb-1.5 px-2", g.color)}>{g.title}</p>
            <div className="space-y-0.5">
              {g.items.map((it) => {
                const active = location.pathname === it.to;
                const Icon = it.icon;
                return (
                  <NavLink
                    key={it.to}
                    to={it.to}
                    className={cn(
                      "flex items-center gap-2.5 px-2 py-1.5 rounded-md text-[13px] transition-colors",
                      active ? "bg-primary/10 text-primary font-medium" : "text-slate-700 hover:bg-slate-50"
                    )}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="flex-1 truncate">{it.label}</span>
                    {it.badge && (
                      <span className="text-[9px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">{it.badge}</span>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}
