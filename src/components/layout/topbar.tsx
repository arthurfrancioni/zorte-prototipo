import { useState } from "react";
import { Bell, Search, HelpCircle, ChevronDown, LogOut, ShieldCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckIcon,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useProfile, ProfileRole } from "@/lib/profile-context";
import { cn } from "@/lib/utils";

const CAPABILITIES_MATRIX: { feature: string; admin: string; customer_care: string; vendas: string }[] = [
  { feature: "Formação de carga", admin: "Editar", customer_care: "Oculto", vendas: "Oculto" },
  { feature: "Grupos de e-mail", admin: "Editar", customer_care: "Oculto", vendas: "Oculto" },
  { feature: "Cadastros (motoristas/veículos)", admin: "Editar", customer_care: "Oculto", vendas: "Oculto" },
  { feature: "Integrações", admin: "Editar", customer_care: "Oculto", vendas: "Oculto" },
  { feature: "Canhotos · upload/envio", admin: "Editar", customer_care: "Somente leitura", vendas: "Oculto" },
  { feature: "Fiscal (CT-e, MDF-e, SEFAZ)", admin: "Editar", customer_care: "Somente leitura", vendas: "Oculto" },
  { feature: "Revisão de carga", admin: "Editar", customer_care: "Somente leitura", vendas: "Somente leitura" },
  { feature: "Minutas", admin: "Editar", customer_care: "Somente leitura", vendas: "Oculto" },
  { feature: "Pedidos / Dashboards", admin: "Consulta", customer_care: "Consulta", vendas: "Consulta" },
];

function capabilityBadge(value: string) {
  if (value === "Editar") return <Badge variant="success" className="text-[10px]">Editar</Badge>;
  if (value === "Somente leitura") return <Badge variant="warning" className="text-[10px]">Leitura</Badge>;
  if (value === "Consulta") return <Badge variant="info" className="text-[10px]">Consulta</Badge>;
  return <Badge variant="muted" className="text-[10px]">Oculto</Badge>;
}

export function Topbar() {
  const { profile, role, setRole, profiles } = useProfile();
  const [capsOpen, setCapsOpen] = useState(false);

  return (
    <header className="h-14 border-b bg-white sticky top-0 z-10 px-6 flex items-center gap-4 justify-end">
      <div className="flex-1 max-w-md relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Buscar pedido, CT-e, cliente, motorista..." className="pl-9 h-9 bg-slate-50 border-slate-200" />
      </div>
      <div className="flex items-center gap-2">
        <button className="w-9 h-9 rounded-md hover:bg-slate-100 flex items-center justify-center text-slate-600">
          <HelpCircle className="w-4 h-4" />
        </button>
        <button className="w-9 h-9 rounded-md hover:bg-slate-100 flex items-center justify-center text-slate-600 relative">
          <Bell className="w-4 h-4" />
          <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-red-500 rounded-full"></span>
        </button>
        <div className="h-6 w-px bg-slate-200 mx-1" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2.5 pl-1 pr-2 py-1 rounded-md hover:bg-slate-50 transition-colors">
              <div className={cn("w-8 h-8 rounded-full bg-gradient-to-br text-white text-xs font-semibold flex items-center justify-center", profile.gradiente)}>
                {profile.iniciais}
              </div>
              <div className="text-sm text-left">
                <p className="font-medium leading-none">{profile.nome}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{profile.cargo}</p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuLabel>Trocar de perfil</DropdownMenuLabel>
            {(Object.keys(profiles) as ProfileRole[]).map((r) => {
              const p = profiles[r];
              return (
                <DropdownMenuItem
                  key={r}
                  onSelect={() => setRole(r)}
                  className="gap-3"
                >
                  <div className={cn("w-7 h-7 rounded-full bg-gradient-to-br text-white text-[10px] font-semibold flex items-center justify-center shrink-0", p.gradiente)}>
                    {p.iniciais}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium leading-none">{p.nome}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{p.cargo}</p>
                  </div>
                  <DropdownMenuCheckIcon show={role === r} />
                </DropdownMenuItem>
              );
            })}
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={(e) => { e.preventDefault(); setCapsOpen(true); }}>
              <ShieldCheck className="w-4 h-4 text-muted-foreground" />
              <span>Ver capacidades do perfil</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="text-rose-600">
              <LogOut className="w-4 h-4" />
              <span>Sair da sessão</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Dialog open={capsOpen} onOpenChange={setCapsOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Capacidades dos perfis</DialogTitle>
            <DialogDescription>
              Perfis configuráveis pelo administrador. Customer Care e Vendas acessam dashboards e consultas sem executar ações operacionais.
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 font-medium text-xs text-muted-foreground uppercase tracking-wider">Funcionalidade</th>
                  <th className="text-left py-2 font-medium text-xs text-muted-foreground uppercase tracking-wider">Administrador</th>
                  <th className="text-left py-2 font-medium text-xs text-muted-foreground uppercase tracking-wider">Customer Care</th>
                  <th className="text-left py-2 font-medium text-xs text-muted-foreground uppercase tracking-wider">Vendas</th>
                </tr>
              </thead>
              <tbody>
                {CAPABILITIES_MATRIX.map((row) => (
                  <tr key={row.feature} className="border-b last:border-0">
                    <td className="py-2 pr-2 font-medium text-sm">{row.feature}</td>
                    <td className="py-2 pr-2">{capabilityBadge(row.admin)}</td>
                    <td className="py-2 pr-2">{capabilityBadge(row.customer_care)}</td>
                    <td className="py-2">{capabilityBadge(row.vendas)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DialogContent>
      </Dialog>
    </header>
  );
}
