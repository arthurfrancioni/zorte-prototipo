import { Routes, Route } from "react-router-dom";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

import { DashboardGeral } from "@/pages/dashboard-geral";
import { DashboardClientes } from "@/pages/dashboard-clientes";
import { DashboardTransportadora } from "@/pages/dashboard-transportadora";
import { ImportarTeams } from "@/pages/importar-teams";
import { Pedidos } from "@/pages/pedidos";
import { FormacaoCarga } from "@/pages/formacao-carga";
import { GruposEmail } from "@/pages/grupos-email";
import { Motoristas, Veiculos } from "@/pages/cadastros";
import { TecnoRisk } from "@/pages/fase3-tecnorisk";
import { SugestaoCarga, EmissaoAutomatica } from "@/pages/fase4-automacoes";

export default function App() {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 min-w-0 flex flex-col">
        <Topbar />
        <main className="flex-1 p-6 max-w-[1600px] w-full mx-auto">
          <Routes>
            <Route path="/" element={<DashboardGeral />} />
            <Route path="/dashboard/clientes" element={<DashboardClientes />} />
            <Route path="/dashboard/transportadora" element={<DashboardTransportadora />} />

            {/* Fase 1 */}
            <Route path="/importar" element={<ImportarTeams />} />
            <Route path="/pedidos" element={<Pedidos />} />
            <Route path="/formacao-carga" element={<FormacaoCarga />} />
            <Route path="/grupos-email" element={<GruposEmail />} />
            <Route path="/motoristas" element={<Motoristas />} />
            <Route path="/veiculos" element={<Veiculos />} />

            {/* Fase 3 */}
            <Route path="/tecnorisk" element={<TecnoRisk />} />

            {/* Fase 4 */}
            <Route path="/sugestao-carga" element={<SugestaoCarga />} />
            <Route path="/emissao-automatica" element={<EmissaoAutomatica />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
