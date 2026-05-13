// Dados seed da simulação ROI — baseados no e-mail real enviado por Rodrigo Antunes (Dorfketal)
// "CARGA RS X SC X SP X RJ - PAULO TRD0C87 - 15/04/2026 11H"

export const SIMULACAO_BASELINE_MIN = 20;
export const SIMULACAO_DIAS_UTEIS_MES = 22;
export const SIMULACAO_CARGAS_DIA = 5;

// Cabeçalho da carga simulada
export const simCarga = {
  id: "oc4",
  numeroOC: "OC-2026-0020",
  numeroCarga: "CRG-2026-0020",
  motorista: "Paulo Ribeiro",
  motoristaIdSugerido: "m7", // Paulo Ribeiro em mock-data.ts
  cpf: "789.012.345-66",
  placa: "TRD-0C87",
  veiculoIdSugerido: "v6", // TRD-0C87 em mock-data.ts
  capacidadeKg: 32000,
  dataSaida: "2026-04-15",
  horaSaida: "11:00",
  origem: "Dorf · Nova Santa Rita / RS",
  ufOrigem: "RS",
  transportadora: "TAGLOG (ETC agregado)",
  transportadoraCnpj: "08.221.456/0001-77",
};

export interface SimItem {
  oc: string;
  cliente: string;
  destino: string;
  uf: "SC" | "SP" | "RJ" | "BA";
  produto: string;
  pesoKg: number;
  tipo: "venda" | "transferencia" | "amostra" | "redespacho";
  nf?: string;
  valor: number; // valor do frete calculado pela tabela
  observacao?: string;
}

// Todos os itens entram SEM NFe — a NFe chega depois, via resposta do e-mail da Etapa 2.
// O CT-e individual de cada pedido só será emitido quando o XML chegar (fluxo na OrdemDetalhe).
// IMPORTANTE: cada simItem tem 1:1 correspondência com um CT-e em mock-data.ts (cte10..cte17),
// na mesma ordem. Isso permite que a seleção feita na Etapa 1 se reflita exatamente na lista
// de CT-es exibidos na tela da Ordem de Carregamento.
export const simItens: SimItem[] = [
  // SC (2 itens → cte10, cte11)
  { oc: "TR-22841", cliente: "TAGLOG · armazém Joinville", destino: "Joinville", uf: "SC", produto: "TYZOR 910", pesoKg: 5700, tipo: "transferencia", valor: 3705 },
  { oc: "TR-22842", cliente: "TAGLOG · armazém Joinville", destino: "Joinville", uf: "SC", produto: "TYZOR 910", pesoKg: 3800, tipo: "transferencia", valor: 2470 },
  // SP (3 itens → cte12, cte13, cte14)
  { oc: "12.7934", cliente: "ARM Triângulo · cross-dock SP", destino: "Guarulhos", uf: "SP", produto: "DORF SR 1938B", pesoKg: 2550, tipo: "redespacho", valor: 1840 },
  { oc: "4515158146", cliente: "REVAP · Petrobras", destino: "São José dos Campos", uf: "SP", produto: "DORF SR 1938B", pesoKg: 2550, tipo: "venda", valor: 1995 },
  { oc: "27524", cliente: "WEST BRASIL Indústria", destino: "Diadema", uf: "SP", produto: "MILEX S9000", pesoKg: 666, tipo: "venda", valor: 580 },
  // RJ (2 itens → cte15, cte16)
  { oc: "4515160925", cliente: "DERIO Offshore", destino: "Macaé", uf: "RJ", produto: "SOLVSCALE OG 160B", pesoKg: 1605, tipo: "venda", valor: 2305 },
  { oc: "AMOSTRA-SA173", cliente: "LABTOX (amostra SA 173)", destino: "Rio de Janeiro", uf: "RJ", produto: "SA 173 (amostra)", pesoKg: 1, tipo: "amostra", valor: 220, observacao: "Pedido criado manualmente (não veio da planilha)" },
  // BA (1 item → cte17)
  { oc: "4500036052", cliente: "ACELEN Refinaria BA", destino: "Mataripe", uf: "BA", produto: "DISPERSEPLUS SR 1368B", pesoKg: 2380, tipo: "venda", valor: 4380 },
];

// Mapping 1:1 paralelo a simItens — id do CT-e correspondente em mock-data.ts
export const simItemCteIds: string[] = [
  "cte10", "cte11",                 // SC
  "cte12", "cte13", "cte14",        // SP
  "cte15", "cte16",                 // RJ
  "cte17",                          // BA
];

// GNRE ICMS-ST estimada por UF (R$ por CT-e na média)
const GNRE_POR_CTE_BY_UF: Record<string, number> = {
  SC: 343.75,
  SP: 251.95,
  RJ: 140.50,
  BA: 487.40,
};

export interface SimUfStat {
  uf: string;
  ctes: number;
  peso: number;
  valor: number;
  gnreValor: number;
}

// Calcula estatísticas por UF a partir de um conjunto de índices em simItens.
// Se nenhum índice for passado, considera todos.
export function computeUfStats(idxs?: number[]): SimUfStat[] {
  const ativos = idxs ? idxs.map(i => simItens[i]).filter(Boolean) : simItens;
  const grouped = new Map<string, SimUfStat>();
  ativos.forEach(it => {
    const cur = grouped.get(it.uf) ?? { uf: it.uf, ctes: 0, peso: 0, valor: 0, gnreValor: 0 };
    cur.ctes += 1;
    cur.peso += it.pesoKg;
    cur.valor += it.valor;
    cur.gnreValor += GNRE_POR_CTE_BY_UF[it.uf] ?? 0;
    grouped.set(it.uf, cur);
  });
  // Ordem fixa SC, SP, RJ, BA pra coerência visual
  const ordem = ["SC", "SP", "RJ", "BA"];
  return ordem.map(uf => grouped.get(uf)).filter((s): s is SimUfStat => !!s);
}

// Totais agregados a partir de um conjunto de índices
export function computeTotais(idxs?: number[]) {
  const ativos = idxs ? idxs.map(i => simItens[i]).filter(Boolean) : simItens;
  return {
    qtdPedidos: ativos.length,
    qtdMdfes: new Set(ativos.map(it => it.uf)).size,
    peso: ativos.reduce((s, it) => s + it.pesoKg, 0),
    frete: ativos.reduce((s, it) => s + it.valor, 0),
    gnre: ativos.reduce((s, it) => s + (GNRE_POR_CTE_BY_UF[it.uf] ?? 0), 0),
  };
}

// Estatísticas com TODOS os itens (uso legado nos textos do e-mail/preview)
export const simUfStats = computeUfStats();

export interface SimGrupoEmail {
  id: string;
  nome: string;
  emails: number;
  descricao: string;
  criterio: string;       // razão da pré-seleção (ou da disponibilidade)
  preSelecionado: boolean; // true = entra marcado por padrão
  template: {
    assunto: string;       // pode conter tokens: {OC}, {UFS}, {DATA}, {MOTORISTA}, {PLACA}
    saudacao: string;
    corpo: string;
    incluirTabela: boolean; // se a tabela de itens deve aparecer
    assinatura: string;
  };
}

export const simGruposEmail: SimGrupoEmail[] = [
  {
    id: "sc",
    nome: "Santa Catarina",
    emails: 2,
    descricao: "op-sc@empresa.com.br, armazem-joinville@empresa.com.br",
    criterio: "UF de destino contém SC",
    preSelecionado: true,
    template: {
      assunto: "CARGA {OC} · RS → SC · {DATA} · {MOTORISTA} · {PLACA}",
      saudacao: "Equipe SC, boa tarde,",
      corpo: "Segue composição com destino ao armazém de Joinville. Por favor, confirmem disponibilidade de descarga e separação dos volumes de transferência.",
      incluirTabela: true,
      assinatura: "Equipe Logística — Dorfketal",
    },
  },
  {
    id: "sprj",
    nome: "SP + RJ",
    emails: 3,
    descricao: "logistica-sp@empresa.com.br, op-rj@empresa.com.br, coordenacao@empresa.com.br",
    criterio: "UF de destino contém SP ou RJ",
    preSelecionado: true,
    template: {
      assunto: "CARGA {OC} · RS → SP/RJ · {DATA} · {MOTORISTA} · {PLACA}",
      saudacao: "Times SP e RJ, boa tarde,",
      corpo: "Composição multi-stop SP/RJ. Atenção às janelas de entrega na REVAP, REPLAN e REDUC. Amostra LABTOX entra na rota — favor coordenar agendamento.",
      incluirTabela: true,
      assinatura: "Equipe Logística — Dorfketal",
    },
  },
  {
    id: "ne",
    nome: "Nordeste (BA)",
    emails: 1,
    descricao: "redespacho-ne@empresa.com.br",
    criterio: "UF de destino contém BA",
    preSelecionado: true,
    template: {
      assunto: "CARGA {OC} · RS → BA · {DATA} · {MOTORISTA} · {PLACA}",
      saudacao: "Equipe Redespacho NE, boa tarde,",
      corpo: "Carga com destino ACELEN (Mataripe). Confirmem fila de descarga e necessidade de batedor no trecho final.",
      incluirTabela: true,
      assinatura: "Equipe Logística — Dorfketal",
    },
  },
  {
    id: "fat",
    nome: "Faturamento",
    emails: 2,
    descricao: "anderson@empresa.com.br, faturamento@empresa.com.br",
    criterio: "Sempre incluído (financeiro)",
    preSelecionado: true,
    template: {
      assunto: "FATURAMENTO · Carga {OC} · {DATA} · valor total estimado",
      saudacao: "Anderson, faturamento,",
      corpo: "Segue carga formada para fins de pré-faturamento. NFes serão casadas conforme retorno dos clientes via e-mail. CT-es serão emitidos automaticamente após o casamento.",
      incluirTabela: true,
      assinatura: "Equipe Logística — Dorfketal",
    },
  },
  // Grupos NÃO pré-selecionados — disponíveis para adição manual
  {
    id: "qua",
    nome: "Qualidade",
    emails: 1,
    descricao: "qualidade@empresa.com.br",
    criterio: "Adicionar se houver amostra ou item de análise",
    preSelecionado: false,
    template: {
      assunto: "QUALIDADE · Amostra na carga {OC} · {DATA}",
      saudacao: "Time de Qualidade,",
      corpo: "Carga contém amostra de análise (LABTOX · SA 173). Favor acompanhar o recebimento e validar laudo de conformidade.",
      incluirTabela: false,
      assinatura: "Equipe Logística — Dorfketal",
    },
  },
  {
    id: "sup",
    nome: "Suprimentos RS",
    emails: 1,
    descricao: "suprimentos-rs@empresa.com.br",
    criterio: "Adicionar se houver coleta de fornecedor na rota",
    preSelecionado: false,
    template: {
      assunto: "SUPRIMENTOS · Janela de coleta · Carga {OC} · {DATA}",
      saudacao: "Suprimentos RS,",
      corpo: "Caso haja coleta de fornecedor a inserir nessa viagem, favor confirmar janela com antecedência. Motorista sai {DATA} às {HORA}.",
      incluirTabela: false,
      assinatura: "Equipe Logística — Dorfketal",
    },
  },
];

// Renderiza tokens do template ({OC}, {UFS}, {DATA}, {HORA}, {MOTORISTA}, {PLACA}) usando
// os dados da carga simulada. Compartilhado entre Step2Emails e ordem-detalhe.
export function renderTemplateTokens(txt: string): string {
  const ufsDestino = Array.from(new Set(simItens.map(it => it.uf))).join("/");
  return txt
    .replace(/\{OC\}/g, simCarga.numeroOC)
    .replace(/\{UFS\}/g, ufsDestino)
    .replace(/\{DATA\}/g, new Date(simCarga.dataSaida).toLocaleDateString("pt-BR"))
    .replace(/\{HORA\}/g, simCarga.horaSaida)
    .replace(/\{MOTORISTA\}/g, simCarga.motorista)
    .replace(/\{PLACA\}/g, simCarga.placa);
}

// Tempo manual estimado por etapa (para o cronômetro regressivo do timer header)
// Distribuição que totaliza SIMULACAO_BASELINE_MIN (20 min)
export const simEtapasManual = [
  { id: 1, nome: "Formação de carga (planilha + análise manual)", min: 7 },
  { id: 2, nome: "Disparo do e-mail para grupos", min: 3 },
  { id: 3, nome: "Emissão fiscal (CT-e + MDF-e + CIOT + Vale + GNRE)", min: 10 },
];

// ===== Pipeline da Etapa 3 — sequência cronometrada de emissões =====

export type DocStatus = "pendente" | "processando" | "autorizado" | "falhou";

export type EmissaoTipo =
  | "cte"      // CT-e individual (contém GNRE se interestadual)
  | "mdfe"     // MDF-e por UF (contém CT-es de sua UF)
  | "ciot"     // CIOT único da viagem
  | "vale";    // Vale-pedágio único da viagem

export interface EmissaoNode {
  id: string;
  tipo: EmissaoTipo;
  rotulo: string;          // ex: "CT-e #1 · TAGLOG/SC"
  numeroDoc?: string;      // preenchido ao autorizar
  uf?: string;             // para agrupar visualmente
  detalhe?: string;        // ex: "RS → SC · 5.700 kg"
  valor?: number;          // valor do frete ou da guia
  startMs: number;         // quando começa "processando"
  durMs: number;           // quanto tempo dura "processando"
  // GNRE aninhada quando aplicável
  gnre?: {
    numero: string;
    valor: number;
    uf: string;
    startMs: number;
    durMs: number;
  };
}

// Constrói o pipeline de emissão com timing escalonado
// CT-es emitem em onda (start staggered), MDF-es esperam os CT-es da UF, CIOT/Vale começam em paralelo
function buildPipeline(): EmissaoNode[] {
  const nodes: EmissaoNode[] = [];
  let cteIdx = 0;

  // CT-es em onda — cada um leva ~700ms a partir de um start staggered
  simItens.forEach((it) => {
    const start = 200 + cteIdx * 220;
    const dur = 900;
    nodes.push({
      id: `cte-${cteIdx}`,
      tipo: "cte",
      rotulo: `CT-e ${cteIdx + 1} · ${it.cliente}`,
      uf: it.uf,
      detalhe: `RS → ${it.uf} · ${it.pesoKg.toLocaleString("pt-BR")} kg · ${it.produto}`,
      valor: it.valor,
      startMs: start,
      durMs: dur,
      gnre: {
        numero: `GNRE-2026-${1042 + cteIdx}`,
        valor: simUfStats.find(u => u.uf === it.uf)!.gnreValor / simUfStats.find(u => u.uf === it.uf)!.ctes,
        uf: it.uf,
        startMs: start + 300,
        durMs: 700,
      },
    });
    cteIdx++;
  });

  // MDF-es por UF — só começam depois do último CT-e daquela UF
  const ufs: ("SC" | "SP" | "RJ" | "BA")[] = ["SC", "SP", "RJ", "BA"];
  ufs.forEach((uf, i) => {
    const ctesDaUf = nodes.filter(n => n.tipo === "cte" && n.uf === uf);
    const lastCteEnd = Math.max(...ctesDaUf.map(c => c.startMs + c.durMs));
    const stats = simUfStats.find(u => u.uf === uf)!;
    nodes.push({
      id: `mdfe-${uf}`,
      tipo: "mdfe",
      rotulo: `MDF-e · UF ${uf}`,
      uf,
      detalhe: `${stats.ctes} CT-es · ${stats.peso.toLocaleString("pt-BR")} kg · ${stats.valor.toLocaleString("pt-BR")} R$`,
      startMs: lastCteEnd + 100 + i * 80,
      durMs: 1100,
    });
  });

  // CIOT — começa em paralelo com os primeiros CT-es (ANTT registra contratação)
  nodes.push({
    id: "ciot",
    tipo: "ciot",
    rotulo: "CIOT · TAGLOG (ETC)",
    detalhe: "Piso ANTT R$ 16.670,00 + margem 5% = R$ 17.495,00 · BB 3214-5 / C/C 12.345-6",
    valor: 17495,
    startMs: 600,
    durMs: 1300,
  });

  // Vale-pedágio — começa em paralelo com MDF-es
  const firstMdfe = nodes.find(n => n.tipo === "mdfe")!;
  nodes.push({
    id: "vale",
    tipo: "vale",
    rotulo: "Vale-Pedágio · ConectCar",
    detalhe: "Rota multi-stop 4.280 km · 5 eixos · piso ANTT respeitado",
    valor: 2840,
    startMs: firstMdfe.startMs - 200,
    durMs: 1200,
  });

  return nodes.sort((a, b) => a.startMs - b.startMs);
}

export const simPipeline = buildPipeline();
export const simPipelineDuracaoTotal = Math.max(...simPipeline.map(n => n.startMs + n.durMs)) + 200;
