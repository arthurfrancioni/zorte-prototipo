import { Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from "sonner";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { ProfileProvider } from "@/lib/profile-context";

import { DashboardGeral } from "@/pages/dashboard-geral";
import { DashboardClientes } from "@/pages/dashboard-clientes";
import { DashboardTransportadora } from "@/pages/dashboard-transportadora";
import { ImportarOneDrive } from "@/pages/importar-onedrive";
import { Pedidos } from "@/pages/pedidos";
import { FormacaoCarga } from "@/pages/formacao-carga";
import { GruposEmail } from "@/pages/grupos-email";
import { Motoristas, Veiculos, TabelaFrete } from "@/pages/cadastros";
import { TecnoRisk } from "@/pages/fase3-tecnorisk";
import { SugestaoCarga, EmissaoAutomatica } from "@/pages/fase4-automacoes";
import { Minutas } from "@/pages/minutas";
import { ColetasRJ } from "@/pages/coletas-rj";
import { Canhotos } from "@/pages/canhotos";
import { Integracoes } from "@/pages/integracoes";
import { PortalParceiros } from "@/pages/portal-parceiros";
import { CapturaSefaz, CTes, MDFE } from "@/pages/fase2-fiscal";
import { CIOTPage } from "@/pages/fase2-ciot";
import { ValePedagioPage } from "@/pages/fase2-vale-pedagio";
import { Simulacao } from "@/pages/simulacao";
import { OrdensCarregamento } from "@/pages/ordens-carregamento";
import { OrdemDetalhe } from "@/pages/ordem-detalhe";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<DashboardGeral />} />
      <Route path="/dashboard/clientes" element={<DashboardClientes />} />
      <Route path="/dashboard/transportadora" element={<DashboardTransportadora />} />

      {/* Fase 1 */}
      <Route path="/importar" element={<ImportarOneDrive />} />
      <Route path="/pedidos" element={<Pedidos />} />
      <Route path="/formacao-carga" element={<FormacaoCarga />} />
      <Route path="/grupos-email" element={<GruposEmail />} />
      <Route path="/motoristas" element={<Motoristas />} />
      <Route path="/veiculos" element={<Veiculos />} />
      <Route path="/tabela-frete" element={<TabelaFrete />} />

      {/* Operação */}
      <Route path="/ordens-carregamento" element={<OrdensCarregamento />} />
      <Route path="/ordens-carregamento/:id" element={<OrdemDetalhe />} />
      <Route path="/minutas" element={<Minutas />} />
      <Route path="/coletas-rj" element={<ColetasRJ />} />
      <Route path="/canhotos" element={<Canhotos />} />

      {/* Fiscal */}
      <Route path="/fiscal/cte" element={<CTes />} />
      <Route path="/fiscal/mdfe" element={<MDFE />} />
      <Route path="/fiscal/ciot" element={<CIOTPage />} />
      <Route path="/fiscal/vale-pedagio" element={<ValePedagioPage />} />
      <Route path="/fiscal/captura" element={<CapturaSefaz />} />

      {/* Integrações */}
      <Route path="/integracoes" element={<Integracoes />} />

      {/* Fase 3 */}
      <Route path="/tecnorisk" element={<TecnoRisk />} />

      {/* Fase 4 */}
      <Route path="/simulacao" element={<Simulacao />} />
      <Route path="/sugestao-carga" element={<SugestaoCarga />} />
      <Route path="/emissao-automatica" element={<EmissaoAutomatica />} />
    </Routes>
  );
}

function Layout() {
  const location = useLocation();
  const isPortal = location.pathname === "/portal-parceiros";

  if (isPortal) {
    return (
      <Routes>
        <Route path="/portal-parceiros" element={<PortalParceiros />} />
      </Routes>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 min-w-0 flex flex-col">
        <Topbar />
        <main className="flex-1 p-6 max-w-[1600px] w-full mx-auto">
          <AppRoutes />
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ProfileProvider>
      <Layout />
      <Toaster position="bottom-right" richColors closeButton />
    </ProfileProvider>
  );
}
