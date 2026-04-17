import { Bell, Search, HelpCircle } from "lucide-react";
import { Input } from "@/components/ui/input";

export function Topbar() {
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
        <div className="flex items-center gap-2.5 pl-1">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-white text-xs font-semibold flex items-center justify-center">R</div>
          <div className="text-sm">
            <p className="font-medium leading-none">Rodrigo Silva</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Administrador</p>
          </div>
        </div>
      </div>
    </header>
  );
}
