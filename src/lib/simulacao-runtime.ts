// Estado persistido da última execução do simulador (sessionStorage).
// Permite que a tela da Ordem de Carregamento (ordem-detalhe.tsx) saiba quais grupos
// de e-mail foram efetivamente selecionados na Etapa 2 da simulação.

export interface SimulacaoExecutada {
  // ID da ordem/carga gerada
  ordemId: string;
  cargaId: string;
  numeroOC: string;
  // ISO timestamp da finalização da simulação
  timestamp: string;
  // IDs dos grupos selecionados em Step2Emails (cruza com simGruposEmail.id)
  gruposSelecionadosIds: string[];
  // Índices dos pedidos selecionados em Step1FormacaoIA (paralelo a simItens / simItemCteIds)
  pedidosIdxs: number[];
  // Motorista e veículo escolhidos em Step1 (IDs de mock-data.motoristas / mock-data.veiculos)
  motoristaId: string | null;
  veiculoId: string | null;
}

const STORAGE_KEY = "zorte:ultima-simulacao";

export function saveSimulacaoExecutada(s: SimulacaoExecutada) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {
    // sessionStorage indisponível (modo privado, quota cheia) — não é fatal.
  }
}

export function loadSimulacaoExecutada(): SimulacaoExecutada | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SimulacaoExecutada;
  } catch {
    return null;
  }
}

export function clearSimulacaoExecutada() {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {}
}
