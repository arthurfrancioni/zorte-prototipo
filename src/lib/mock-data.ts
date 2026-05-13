export type PedidoStatus = "recebido" | "programado" | "liberado" | "em_carga" | "aguardando_nfe" | "entregue" | "cancelado" | "redespacho";
export type CategoriaCarga = "perigosa_liquida" | "perigosa_containerizada" | "granel" | "geral";

export interface Pedido {
  id: string;
  oc: string;
  cliente: string;
  cnpjCliente: string;
  cidade: string;
  uf: string;
  produto: string;
  embalagem: string;
  quantidade: number;
  pesoBruto: number;
  pesoLiquido: number;
  valor: number;
  prazo: string;
  dataEntrada: string;
  status: PedidoStatus;
  origemLiberacao: string;
  tipoOperacao: "venda" | "transferencia" | "coleta_fornecedor";
  observacao?: string;
  notaFiscal?: string;
  chaveNFe?: string;
  ncm?: string;              // ex: "2909.10.00" — usado para auto-categorizar carga
  categoria?: CategoriaCarga; // derivada do NCM (ou sobrescrita manualmente)
}

// Mapeamento simplificado NCM → categoria (em produção viria de uma tabela ANTT/Receita)
export function categoriaPorNCM(ncm?: string): CategoriaCarga {
  if (!ncm) return "geral";
  const prefixo4 = ncm.replace(/\D/g, "").slice(0, 4);
  // Cap 28-29 = produtos químicos orgânicos/inorgânicos
  if (["2828", "2829", "2902", "2903", "2904", "2905", "2906", "2907", "2908", "2909", "2910", "2911", "2912"].includes(prefixo4)) return "perigosa_liquida";
  // Cap 38 = produtos químicos diversos
  if (prefixo4.startsWith("38")) return "perigosa_containerizada";
  // Cap 27 = combustíveis / óleos minerais
  if (prefixo4.startsWith("27")) return "granel";
  return "geral";
}

export interface Motorista {
  id: string;
  nome: string;
  cpf: string;
  telefone: string;
  cnh: string;
  categoria: string;
  ativo: boolean;
  cargasMes: number;
  avaliacao: number;
}

export interface Veiculo {
  id: string;
  placa: string;
  tipo: "carreta" | "truck" | "toco" | "van";
  capacidadeKg: number;
  motoristaId?: string;
  ativo: boolean;
}

export interface Cliente {
  id: string;
  nome: string;
  cnpj: string;
  cidade: string;
  uf: string;
  pedidos: number;
  valorTotal: number;
  pesoTotal: number;
}

export interface GrupoEmail {
  id: string;
  nome: string;
  descricao: string;
  emails: string[];
  operacoes: string[];
}

export interface Carga {
  id: string;
  numero: string;
  dataSaida: string;
  horaSaida: string;
  motoristaId: string;
  veiculoId: string;
  ufOrigem: string;
  status: "pronta" | "em_transito" | "finalizada" | "cancelada";
  pedidos: string[];
  pesoTotal: number;
  valorTotal: number;
  transportadora: string;
  gruposNotificacao: string[];
  observacoes?: string;
  ctes?: string[];
  mdfe?: string;
  ciot?: string;
  valePedagio?: string;
}

export interface CTe {
  id: string;
  numero: string;
  cargaId: string;
  cnpjRemetente: string;
  cnpjDestinatario: string;
  cliente: string;
  valorFrete: number;
  pesoKg: number;
  status: "autorizado" | "pendente" | "rejeitado";
  dataEmissao: string;
  protocoloSefaz?: string;
  averbacao?: string;
  notasFiscais: string[];
  ufOrigem: string;
  ufDestino: string;
  cidadeOrigem: string;
  cidadeDestino: string;
}

export const clientes: Cliente[] = [
  { id: "c1", nome: "Primo Tedesco", cnpj: "12.345.678/0001-90", cidade: "Ribeirão Preto", uf: "SP", pedidos: 48, valorTotal: 184320, pesoTotal: 28400 },
  { id: "c2", nome: "Fernando CSA Indústria", cnpj: "23.456.789/0001-01", cidade: "Campinas", uf: "SP", pedidos: 36, valorTotal: 142800, pesoTotal: 19600 },
  { id: "c3", nome: "Zanzalog Transportes", cnpj: "34.567.890/0001-12", cidade: "Santos", uf: "SP", pedidos: 29, valorTotal: 98420, pesoTotal: 14200 },
  { id: "c4", nome: "Quimex Bahia", cnpj: "45.678.901/0001-23", cidade: "Salvador", uf: "BA", pedidos: 22, valorTotal: 87600, pesoTotal: 12800 },
  { id: "c5", nome: "Distribuidora Norte RJ", cnpj: "56.789.012/0001-34", cidade: "Rio de Janeiro", uf: "RJ", pedidos: 18, valorTotal: 68200, pesoTotal: 9400 },
  { id: "c6", nome: "Petroquímica Sul", cnpj: "67.890.123/0001-45", cidade: "Triunfo", uf: "RS", pedidos: 15, valorTotal: 55200, pesoTotal: 8100 },
  { id: "c7", nome: "Agroterra SC", cnpj: "78.901.234/0001-56", cidade: "Joinville", uf: "SC", pedidos: 12, valorTotal: 42800, pesoTotal: 6200 },
  { id: "c8", nome: "Indústria Alfa PE", cnpj: "89.012.345/0001-67", cidade: "Recife", uf: "PE", pedidos: 9, valorTotal: 31400, pesoTotal: 4800 },
];

export const motoristas: Motorista[] = [
  { id: "m1", nome: "Carlos Santos", cpf: "123.456.789-00", telefone: "(51) 99876-5432", cnh: "12345678900", categoria: "E", ativo: true, cargasMes: 22, avaliacao: 4.8 },
  { id: "m2", nome: "José Henrique", cpf: "234.567.890-11", telefone: "(51) 98765-4321", cnh: "23456789011", categoria: "E", ativo: true, cargasMes: 19, avaliacao: 4.6 },
  { id: "m3", nome: "Antônio Silva", cpf: "345.678.901-22", telefone: "(11) 97654-3210", cnh: "34567890122", categoria: "E", ativo: true, cargasMes: 17, avaliacao: 4.9 },
  { id: "m4", nome: "Roberto Mendes", cpf: "456.789.012-33", telefone: "(11) 96543-2109", cnh: "45678901233", categoria: "E", ativo: true, cargasMes: 14, avaliacao: 4.5 },
  { id: "m5", nome: "Paulo César", cpf: "567.890.123-44", telefone: "(47) 95432-1098", cnh: "56789012344", categoria: "C", ativo: true, cargasMes: 11, avaliacao: 4.7 },
  { id: "m6", nome: "Marcos Rocha", cpf: "678.901.234-55", telefone: "(21) 94321-0987", cnh: "67890123455", categoria: "E", ativo: false, cargasMes: 0, avaliacao: 4.3 },
  { id: "m7", nome: "Paulo Ribeiro", cpf: "789.012.345-66", telefone: "(51) 99100-2233", cnh: "78901234566", categoria: "E", ativo: true, cargasMes: 24, avaliacao: 4.9 },
];

export const veiculos: Veiculo[] = [
  { id: "v1", placa: "DEF-4G56", tipo: "carreta", capacidadeKg: 30000, motoristaId: "m1", ativo: true },
  { id: "v2", placa: "GHI-7J89", tipo: "carreta", capacidadeKg: 33000, motoristaId: "m2", ativo: true },
  { id: "v3", placa: "KLM-0N12", tipo: "carreta", capacidadeKg: 40000, motoristaId: "m3", ativo: true },
  { id: "v4", placa: "OPQ-3R45", tipo: "truck", capacidadeKg: 12000, motoristaId: "m4", ativo: true },
  { id: "v5", placa: "STU-6V78", tipo: "toco", capacidadeKg: 6000, motoristaId: "m5", ativo: true },
  { id: "v6", placa: "TRD-0C87", tipo: "carreta", capacidadeKg: 32000, motoristaId: "m7", ativo: true },
];

export const pedidos: Pedido[] = [
  { id: "p1", oc: "12.7934", cliente: "Primo Tedesco", cnpjCliente: "12.345.678/0001-90", cidade: "Ribeirão Preto", uf: "SP", produto: "Aditivo Alpha 500", embalagem: "IBC 1000L Inox", quantidade: 2, pesoBruto: 620, pesoLiquido: 580, valor: 4800, prazo: "2026-04-18", dataEntrada: "2026-04-14", status: "liberado", origemLiberacao: "RS-Nova Santa Rita", tipoOperacao: "venda", observacao: "Carga reversa de IBC", ncm: "2909.10.00", categoria: "perigosa_liquida", notaFiscal: "NF-45231" },
  { id: "p2", oc: "12.8012", cliente: "Fernando CSA Indústria", cnpjCliente: "23.456.789/0001-01", cidade: "Campinas", uf: "SP", produto: "Solvente Beta 200", embalagem: "Tambor 200L", quantidade: 4, pesoBruto: 280, pesoLiquido: 240, valor: 2100, prazo: "2026-04-19", dataEntrada: "2026-04-14", status: "programado", origemLiberacao: "RS-Nova Santa Rita", tipoOperacao: "venda", ncm: "2902.30.00", categoria: "perigosa_liquida" },
  { id: "p3", oc: "12.8055", cliente: "Zanzalog Transportes", cnpjCliente: "34.567.890/0001-12", cidade: "Santos", uf: "SP", produto: "Reagente Gamma", embalagem: "Contentor Inox 500L", quantidade: 1, pesoBruto: 180, pesoLiquido: 160, valor: 1450, prazo: "2026-04-18", dataEntrada: "2026-04-14", status: "liberado", origemLiberacao: "RS-Nova Santa Rita", tipoOperacao: "venda", observacao: "Redespacho SP", ncm: "3824.99.89", categoria: "perigosa_containerizada", notaFiscal: "NF-45240" },
  { id: "p4", oc: "12.8091", cliente: "Quimex Bahia", cnpjCliente: "45.678.901/0001-23", cidade: "Salvador", uf: "BA", produto: "Produto Delta BR", embalagem: "Bombona 50L", quantidade: 10, pesoBruto: 450, pesoLiquido: 400, valor: 3500, prazo: "2026-04-22", dataEntrada: "2026-04-15", status: "recebido", origemLiberacao: "SP-Guarulhos", tipoOperacao: "venda", observacao: "Redespacho RJ → BA", ncm: "2906.13.00", categoria: "perigosa_liquida" },
  { id: "p5", oc: "12.8102", cliente: "Distribuidora Norte RJ", cnpjCliente: "56.789.012/0001-34", cidade: "Rio de Janeiro", uf: "RJ", produto: "Epsilon Plus", embalagem: "Palete 500kg", quantidade: 2, pesoBruto: 1040, pesoLiquido: 1000, valor: 6200, prazo: "2026-04-20", dataEntrada: "2026-04-15", status: "liberado", origemLiberacao: "SP-Guarulhos", tipoOperacao: "venda", ncm: "3812.30.00", categoria: "perigosa_containerizada", notaFiscal: "NF-45253" },
  { id: "p6", oc: "12.8118", cliente: "Petroquímica Sul", cnpjCliente: "67.890.123/0001-45", cidade: "Triunfo", uf: "RS", produto: "Base Zeta 300", embalagem: "IBC 1000L", quantidade: 1, pesoBruto: 950, pesoLiquido: 900, valor: 5400, prazo: "2026-04-21", dataEntrada: "2026-04-15", status: "programado", origemLiberacao: "SC-Joinville", tipoOperacao: "transferencia", ncm: "2710.19.99", categoria: "granel" },
  { id: "p7", oc: "12.8134", cliente: "Agroterra SC", cnpjCliente: "78.901.234/0001-56", cidade: "Joinville", uf: "SC", produto: "Fertilizante Eta", embalagem: "Saco 25kg", quantidade: 40, pesoBruto: 1020, pesoLiquido: 1000, valor: 4200, prazo: "2026-04-19", dataEntrada: "2026-04-15", status: "liberado", origemLiberacao: "RS-Nova Santa Rita", tipoOperacao: "venda", ncm: "3105.20.00", categoria: "geral", notaFiscal: "NF-45218" },
  { id: "p8", oc: "12.8145", cliente: "Indústria Alfa PE", cnpjCliente: "89.012.345/0001-67", cidade: "Recife", uf: "PE", produto: "Polímero Theta", embalagem: "Big Bag 500kg", quantidade: 3, pesoBruto: 1520, pesoLiquido: 1500, valor: 8400, prazo: "2026-04-25", dataEntrada: "2026-04-16", status: "recebido", origemLiberacao: "RS-Nova Santa Rita", tipoOperacao: "venda", observacao: "Redespacho RJ → PE", ncm: "3907.99.00", categoria: "geral" },
  { id: "p9", oc: "12.8156", cliente: "Primo Tedesco", cnpjCliente: "12.345.678/0001-90", cidade: "Ribeirão Preto", uf: "SP", produto: "Aditivo Alpha 500 (emb.)", embalagem: "Palete de retorno", quantidade: 1, pesoBruto: 80, pesoLiquido: 70, valor: 420, prazo: "2026-04-18", dataEntrada: "2026-04-16", status: "liberado", origemLiberacao: "RS-Nova Santa Rita", tipoOperacao: "venda", observacao: "NF de embalagem vinculada à OC 12.7934 (logística reversa)", ncm: "7310.29.10", categoria: "geral", notaFiscal: "NF-45232" },
  { id: "p10", oc: "12.8167", cliente: "Fernando CSA Indústria", cnpjCliente: "23.456.789/0001-01", cidade: "Campinas", uf: "SP", produto: "Solvente Beta 400", embalagem: "Tambor 400L", quantidade: 2, pesoBruto: 840, pesoLiquido: 800, valor: 4200, prazo: "2026-04-19", dataEntrada: "2026-04-16", status: "em_carga", origemLiberacao: "RS-Nova Santa Rita", tipoOperacao: "venda", ncm: "2902.41.00", categoria: "perigosa_liquida", notaFiscal: "NF-45235" },

  // Transferências entre filiais (matéria-prima e produto acabado vindo de Itajaí/Joinville → NSR ou cross-stock SC/SP)
  { id: "t1", oc: "TR-22841", cliente: "Dorf · Filial SC-Joinville", cnpjCliente: "99.999.999/0002-00", cidade: "Joinville", uf: "SC", produto: "Matéria-prima TYZOR 910 (IBC)", embalagem: "IBC 1000L", quantidade: 6, pesoBruto: 5700, pesoLiquido: 5400, valor: 0, prazo: "2026-04-16", dataEntrada: "2026-04-14", status: "liberado", origemLiberacao: "RS-Nova Santa Rita", tipoOperacao: "transferencia", notaFiscal: "39838", observacao: "Transferência interna · sem valor fiscal de venda" },
  { id: "t2", oc: "TR-22842", cliente: "Dorf · Filial SC-Joinville", cnpjCliente: "99.999.999/0002-00", cidade: "Joinville", uf: "SC", produto: "TYZOR 910 (tambor)", embalagem: "Tambor 200L", quantidade: 20, pesoBruto: 3800, pesoLiquido: 3500, valor: 0, prazo: "2026-04-16", dataEntrada: "2026-04-14", status: "liberado", origemLiberacao: "RS-Nova Santa Rita", tipoOperacao: "transferencia", notaFiscal: "39840" },
  { id: "t3", oc: "TR-22843", cliente: "Dorf · Armazém Triângulo SP", cnpjCliente: "99.999.999/0003-00", cidade: "Guarulhos", uf: "SP", produto: "DORF SR 1938B", embalagem: "IBC 1000L", quantidade: 3, pesoBruto: 2550, pesoLiquido: 2400, valor: 0, prazo: "2026-04-17", dataEntrada: "2026-04-14", status: "liberado", origemLiberacao: "RS-Nova Santa Rita", tipoOperacao: "transferencia", notaFiscal: "14169", observacao: "Estoque cross-dock para redespacho SP" },
  { id: "t4", oc: "TR-22844", cliente: "Dorf · Filial RS-NSR", cnpjCliente: "99.999.999/0001-00", cidade: "Nova Santa Rita", uf: "RS", produto: "Matéria-prima importada (rotulagem pendente)", embalagem: "Bombona 50L", quantidade: 20, pesoBruto: 1000, pesoLiquido: 950, valor: 0, prazo: "2026-04-18", dataEntrada: "2026-04-15", status: "programado", origemLiberacao: "SC-Itajaí (Porto)", tipoOperacao: "transferencia", observacao: "Vinda do Porto de Itajaí · aguarda rotulagem em NSR" },
];

export const gruposEmail: GrupoEmail[] = [
  { id: "g1", nome: "SP + RJ", descricao: "Cargas destinadas a São Paulo e Rio de Janeiro", emails: ["logistica-sp@empresa.com.br", "op-rj@empresa.com.br", "coordenacao@empresa.com.br"], operacoes: ["venda", "redespacho"] },
  { id: "g2", nome: "Santa Catarina", descricao: "Operações do hub de Joinville", emails: ["op-sc@empresa.com.br", "armazem-joinville@empresa.com.br"], operacoes: ["transferencia", "coleta_fornecedor"] },
  { id: "g3", nome: "Rio Grande do Sul", descricao: "Matriz Nova Santa Rita e filiais do RS", emails: ["op-rs@empresa.com.br", "matriz@empresa.com.br", "faturamento-rs@empresa.com.br"], operacoes: ["venda", "transferencia"] },
  { id: "g4", nome: "Faturamento", descricao: "Equipe responsável pela emissão de NFs", emails: ["anderson@empresa.com.br", "faturamento@empresa.com.br"], operacoes: ["venda", "transferencia", "coleta_fornecedor"] },
  { id: "g5", nome: "Diretoria", descricao: "Cópia para diretoria em cargas acima de R$ 50.000", emails: ["diretoria@empresa.com.br"], operacoes: ["venda"] },
  { id: "g6", nome: "Nordeste", descricao: "Redespacho para BA, PE e região NE", emails: ["redespacho-ne@empresa.com.br"], operacoes: ["venda"] },
];

export const cargas: Carga[] = [
  { id: "crg1", numero: "CRG-2026-0018", dataSaida: "2026-04-16", horaSaida: "07:30", motoristaId: "m1", veiculoId: "v1", ufOrigem: "RS", status: "em_transito", pedidos: ["p1", "p2", "p3", "p9"], pesoTotal: 1160, valorTotal: 8770, transportadora: "Frota própria", gruposNotificacao: ["g1", "g4"], ctes: ["cte1", "cte2", "cte3"], mdfe: "MDFE-2026-0018", ciot: "CIOT-83749201", valePedagio: "VP-2026-0018" },
  { id: "crg2", numero: "CRG-2026-0017", dataSaida: "2026-04-15", horaSaida: "06:00", motoristaId: "m2", veiculoId: "v2", ufOrigem: "RS", status: "em_transito", pedidos: ["p4", "p5"], pesoTotal: 1490, valorTotal: 9700, transportadora: "Frota própria", gruposNotificacao: ["g1", "g6", "g4"], ctes: ["cte4", "cte5"], mdfe: "MDFE-2026-0017", ciot: "CIOT-83749145" },
  { id: "crg3", numero: "CRG-2026-0016", dataSaida: "2026-04-14", horaSaida: "05:30", motoristaId: "m3", veiculoId: "v3", ufOrigem: "SC", status: "finalizada", pedidos: ["p7"], pesoTotal: 1020, valorTotal: 4200, transportadora: "Frota própria", gruposNotificacao: ["g2", "g4"], ctes: ["cte6"], mdfe: "MDFE-2026-0016" },

  // Carga PAULO TRD0C87 — exemplo enviado por Rodrigo (Dorfketal): RS×SC×SP×RJ×BA com 4 estados de destino para split de MDF-e
  // Carga do simulador (oc4) — recém-formada, aguardando NFes chegarem via resposta de e-mail.
  // CIOT e Vale-Pedágio já emitidos (independem de NFe). MDF-e fica pendente até CT-es autorizarem.
  // 8 CT-es alinhados 1:1 com simItens em simulacao-data.ts.
  { id: "crg4", numero: "CRG-2026-0020", dataSaida: "2026-04-15", horaSaida: "11:00", motoristaId: "m7", veiculoId: "v6", ufOrigem: "RS", status: "pronta", pedidos: ["t1", "t2", "t3"], pesoTotal: 19251, valorTotal: 17495, transportadora: "TAGLOG (ETC agregado)", gruposNotificacao: ["g1", "g2", "g3", "g4", "g6"], ctes: ["cte10", "cte11", "cte12", "cte13", "cte14", "cte15", "cte16", "cte17"], ciot: "CIOT-83749477", valePedagio: "VP-2026-0020" },
];

export const ctes: CTe[] = [
  { id: "cte1", numero: "CTE-2026-00234", cargaId: "crg1", cnpjRemetente: "99.999.999/0001-00", cnpjDestinatario: "12.345.678/0001-90", cliente: "Primo Tedesco", valorFrete: 850, pesoKg: 700, status: "autorizado", dataEmissao: "2026-04-16T06:45:00", protocoloSefaz: "143250000123456", averbacao: "ATM-45678912", notasFiscais: ["NF-45231", "NF-45232"], ufOrigem: "RS", ufDestino: "SP", cidadeOrigem: "Nova Santa Rita", cidadeDestino: "Ribeirão Preto" },
  { id: "cte2", numero: "CTE-2026-00235", cargaId: "crg1", cnpjRemetente: "99.999.999/0001-00", cnpjDestinatario: "23.456.789/0001-01", cliente: "Fernando CSA Indústria", valorFrete: 420, pesoKg: 280, status: "autorizado", dataEmissao: "2026-04-16T06:46:00", protocoloSefaz: "143250000123457", averbacao: "ATM-45678913", notasFiscais: ["NF-45235"], ufOrigem: "RS", ufDestino: "SP", cidadeOrigem: "Nova Santa Rita", cidadeDestino: "Campinas" },
  { id: "cte3", numero: "CTE-2026-00236", cargaId: "crg1", cnpjRemetente: "99.999.999/0001-00", cnpjDestinatario: "34.567.890/0001-12", cliente: "Zanzalog Transportes", valorFrete: 310, pesoKg: 180, status: "autorizado", dataEmissao: "2026-04-16T06:47:00", protocoloSefaz: "143250000123458", averbacao: "ATM-45678914", notasFiscais: ["NF-45240"], ufOrigem: "RS", ufDestino: "SP", cidadeOrigem: "Nova Santa Rita", cidadeDestino: "Santos" },
  { id: "cte4", numero: "CTE-2026-00237", cargaId: "crg2", cnpjRemetente: "99.999.999/0001-00", cnpjDestinatario: "45.678.901/0001-23", cliente: "Quimex Bahia", valorFrete: 2100, pesoKg: 450, status: "autorizado", dataEmissao: "2026-04-15T05:20:00", protocoloSefaz: "143250000123459", averbacao: "ATM-45678915", notasFiscais: ["NF-45248", "NF-45249"], ufOrigem: "SP", ufDestino: "BA", cidadeOrigem: "Guarulhos", cidadeDestino: "Salvador" },
  { id: "cte5", numero: "CTE-2026-00238", cargaId: "crg2", cnpjRemetente: "99.999.999/0001-00", cnpjDestinatario: "56.789.012/0001-34", cliente: "Distribuidora Norte RJ", valorFrete: 1480, pesoKg: 1040, status: "autorizado", dataEmissao: "2026-04-15T05:22:00", protocoloSefaz: "143250000123460", averbacao: "ATM-45678916", notasFiscais: ["NF-45253"], ufOrigem: "SP", ufDestino: "RJ", cidadeOrigem: "Guarulhos", cidadeDestino: "Rio de Janeiro" },
  { id: "cte6", numero: "CTE-2026-00233", cargaId: "crg3", cnpjRemetente: "99.999.999/0001-00", cnpjDestinatario: "78.901.234/0001-56", cliente: "Agroterra SC", valorFrete: 680, pesoKg: 1020, status: "autorizado", dataEmissao: "2026-04-14T04:55:00", protocoloSefaz: "143250000123461", averbacao: "ATM-45678917", notasFiscais: ["NF-45218"], ufOrigem: "SC", ufDestino: "SC", cidadeOrigem: "Joinville", cidadeDestino: "Blumenau" },

  // CT-es da carga Paulo TRD0C87 (CRG-2026-0020) — destinos espalhados por SC, SP, RJ, BA
  // Status "pendente" — aguardando NFes chegarem (XML virá pela resposta do e-mail de formação).
  // CT-es são emitidos dinamicamente na tela da Ordem de Carregamento conforme as NFes casam.
  { id: "cte10", numero: "—", cargaId: "crg4", cnpjRemetente: "99.999.999/0001-00", cnpjDestinatario: "99.999.999/0002-00", cliente: "TAGLOG · armazém Joinville", valorFrete: 3705, pesoKg: 5700, status: "pendente", dataEmissao: "", notasFiscais: [], ufOrigem: "RS", ufDestino: "SC", cidadeOrigem: "Nova Santa Rita", cidadeDestino: "Joinville" },
  { id: "cte11", numero: "—", cargaId: "crg4", cnpjRemetente: "99.999.999/0001-00", cnpjDestinatario: "99.999.999/0002-00", cliente: "TAGLOG · armazém Joinville", valorFrete: 2470, pesoKg: 3800, status: "pendente", dataEmissao: "", notasFiscais: [], ufOrigem: "RS", ufDestino: "SC", cidadeOrigem: "Nova Santa Rita", cidadeDestino: "Joinville" },
  { id: "cte12", numero: "—", cargaId: "crg4", cnpjRemetente: "99.999.999/0001-00", cnpjDestinatario: "99.999.999/0003-00", cliente: "ARM Triângulo · cross-dock SP", valorFrete: 1840, pesoKg: 2550, status: "pendente", dataEmissao: "", notasFiscais: [], ufOrigem: "RS", ufDestino: "SP", cidadeOrigem: "Nova Santa Rita", cidadeDestino: "Guarulhos" },
  { id: "cte13", numero: "—", cargaId: "crg4", cnpjRemetente: "99.999.999/0001-00", cnpjDestinatario: "11.222.333/0004-77", cliente: "REVAP · Petrobras", valorFrete: 1995, pesoKg: 2550, status: "pendente", dataEmissao: "", notasFiscais: [], ufOrigem: "RS", ufDestino: "SP", cidadeOrigem: "Nova Santa Rita", cidadeDestino: "São José dos Campos" },
  { id: "cte14", numero: "—", cargaId: "crg4", cnpjRemetente: "99.999.999/0001-00", cnpjDestinatario: "12.333.444/0005-88", cliente: "WEST BRASIL Indústria", valorFrete: 580, pesoKg: 666, status: "pendente", dataEmissao: "", notasFiscais: [], ufOrigem: "RS", ufDestino: "SP", cidadeOrigem: "Nova Santa Rita", cidadeDestino: "Diadema" },
  { id: "cte15", numero: "—", cargaId: "crg4", cnpjRemetente: "99.999.999/0001-00", cnpjDestinatario: "13.444.555/0006-99", cliente: "DERIO Offshore", valorFrete: 2305, pesoKg: 1605, status: "pendente", dataEmissao: "", notasFiscais: [], ufOrigem: "RS", ufDestino: "RJ", cidadeOrigem: "Nova Santa Rita", cidadeDestino: "Macaé" },
  { id: "cte16", numero: "—", cargaId: "crg4", cnpjRemetente: "99.999.999/0001-00", cnpjDestinatario: "14.555.666/0007-00", cliente: "LABTOX (amostra SA 173)", valorFrete: 220, pesoKg: 1, status: "pendente", dataEmissao: "", notasFiscais: [], ufOrigem: "RS", ufDestino: "RJ", cidadeOrigem: "Nova Santa Rita", cidadeDestino: "Rio de Janeiro" },
  { id: "cte17", numero: "—", cargaId: "crg4", cnpjRemetente: "99.999.999/0001-00", cnpjDestinatario: "15.666.777/0008-11", cliente: "ACELEN Refinaria BA", valorFrete: 4380, pesoKg: 2380, status: "pendente", dataEmissao: "", notasFiscais: [], ufOrigem: "RS", ufDestino: "BA", cidadeOrigem: "Nova Santa Rita", cidadeDestino: "Mataripe" },
];

export const kpis = {
  pedidosPendentes: pedidos.filter(p => p.status === "recebido" || p.status === "programado" || p.status === "liberado").length,
  pedidosTotal: pedidos.length,
  cargasAtivas: cargas.filter(c => c.status === "em_transito" || c.status === "pronta").length,
  cargasTotal: cargas.length,
  motoristasAtivos: motoristas.filter(m => m.ativo).length,
  valorTotal: cargas.reduce((s, c) => s + c.valorTotal, 0),
  pesoTotal: cargas.reduce((s, c) => s + c.pesoTotal, 0),
  entregasNoPrazo: 142,
  entregasForaPrazo: 8,
  entregasTotal: 150,
};

export const cargasPorMes = [
  { mes: "Nov/25", cargas: 42, valor: 185400 },
  { mes: "Dez/25", cargas: 38, valor: 172200 },
  { mes: "Jan/26", cargas: 45, valor: 198600 },
  { mes: "Fev/26", cargas: 48, valor: 215800 },
  { mes: "Mar/26", cargas: 52, valor: 234100 },
  { mes: "Abr/26", cargas: 18, valor: 82400 },
];

export const pedidosPorRegiao = [
  { regiao: "Sudeste", pedidos: 58 },
  { regiao: "Sul", pedidos: 32 },
  { regiao: "Nordeste", pedidos: 18 },
  { regiao: "Centro-Oeste", pedidos: 8 },
  { regiao: "Norte", pedidos: 3 },
];

export const tipoMercado = [
  { tipo: "Químico", valor: 45 },
  { tipo: "Agro", valor: 22 },
  { tipo: "Alimentos", valor: 18 },
  { tipo: "Indústria", valor: 15 },
];

// ===== Minutas (pedidos não-fiscais: amostras, equipamentos, devoluções) =====

export type MinutaTipo = "amostra" | "equipamento" | "devolucao";
export type MinutaStatus = "em_transito" | "entregue" | "cancelada";

export interface Minuta {
  id: string;
  numero: string;
  tipo: MinutaTipo;
  origem: string;
  destino: string;
  motoristaId: string;
  veiculoId: string;
  pesoKg: number;
  observacao?: string;
  status: MinutaStatus;
  dataEmissao: string;
  solicitante: string;
}

export const minutas: Minuta[] = [
  { id: "min1", numero: "MIN-2026-0007", tipo: "amostra", origem: "RS · Nova Santa Rita", destino: "Campinas/SP", motoristaId: "m2", veiculoId: "v2", pesoKg: 45, observacao: "Kit de amostras de aditivos para avaliação técnica — Fernando CSA", status: "em_transito", dataEmissao: "2026-04-17T10:30:00", solicitante: "Comercial RS" },
  { id: "min2", numero: "MIN-2026-0006", tipo: "equipamento", origem: "RS · Nova Santa Rita", destino: "Joinville/SC", motoristaId: "m5", veiculoId: "v5", pesoKg: 320, observacao: "Bomba pneumática para demo em cliente estratégico", status: "em_transito", dataEmissao: "2026-04-17T08:00:00", solicitante: "Engenharia de Aplicação" },
  { id: "min3", numero: "MIN-2026-0005", tipo: "devolucao", origem: "Campinas/SP", destino: "RS · Nova Santa Rita", motoristaId: "m1", veiculoId: "v1", pesoKg: 180, observacao: "Retorno de IBC vazio · lote 23409", status: "entregue", dataEmissao: "2026-04-15T14:10:00", solicitante: "Logística" },
  { id: "min4", numero: "MIN-2026-0004", tipo: "amostra", origem: "RS · Nova Santa Rita", destino: "Rio de Janeiro/RJ", motoristaId: "m3", veiculoId: "v3", pesoKg: 28, observacao: "Amostras para homologação Distribuidora Norte RJ", status: "entregue", dataEmissao: "2026-04-11T09:20:00", solicitante: "Comercial SE" },
  { id: "min5", numero: "MIN-2026-0003", tipo: "equipamento", origem: "RS · Nova Santa Rita", destino: "Salvador/BA", motoristaId: "m4", veiculoId: "v4", pesoKg: 520, observacao: "Cancelado por reagendamento do cliente (Quimex BA)", status: "cancelada", dataEmissao: "2026-04-08T07:15:00", solicitante: "Comercial NE" },
];

// ===== Coletas RJ (programação diária de coletas) =====

export type ColetaStatus = "prevista" | "em_coleta" | "coletada" | "cancelada";

export interface ColetaRJ {
  id: string;
  data: string;
  janela: "manha" | "tarde";
  horaPrevista: string;
  remetenteNome: string;
  remetenteEndereco: string;
  clienteDestino: string;
  destinoUF: string;
  produto: string;
  pesoKg: number;
  motoristaId?: string;
  veiculoId?: string;
  status: ColetaStatus;
  urgencia: "normal" | "urgente";
  observacao?: string;
}

export const coletasRJ: ColetaRJ[] = [
  { id: "col1", data: "2026-04-24", janela: "manha", horaPrevista: "07:30", remetenteNome: "Polímeros Ilha Ltda", remetenteEndereco: "Av. Brasil, 12 340 · Ilha do Governador · Rio de Janeiro/RJ", clienteDestino: "Primo Tedesco", destinoUF: "SP", produto: "Resina PVC (big bag 500kg)", pesoKg: 2500, motoristaId: "m4", veiculoId: "v4", status: "coletada", urgencia: "normal" },
  { id: "col2", data: "2026-04-24", janela: "manha", horaPrevista: "09:00", remetenteNome: "Química Caxias S.A.", remetenteEndereco: "Rod. Washington Luís, km 113 · Duque de Caxias/RJ", clienteDestino: "Fernando CSA Indústria", destinoUF: "SP", produto: "Solvente em tambor 200L", pesoKg: 1120, motoristaId: "m4", veiculoId: "v4", status: "em_coleta", urgencia: "urgente", observacao: "Janela fixa até 10h · cliente em linha de produção" },
  { id: "col3", data: "2026-04-24", janela: "tarde", horaPrevista: "13:30", remetenteNome: "Laboratório Nova Iguaçu", remetenteEndereco: "Rua Governador Portela, 880 · Nova Iguaçu/RJ", clienteDestino: "Agroterra SC", destinoUF: "SC", produto: "Reagente Gamma · IBC 1000L", pesoKg: 980, motoristaId: "m1", veiculoId: "v1", status: "prevista", urgencia: "normal" },
  { id: "col4", data: "2026-04-24", janela: "tarde", horaPrevista: "15:15", remetenteNome: "Indústria Centro RJ", remetenteEndereco: "Av. Rio Branco, 245 · Centro · Rio de Janeiro/RJ", clienteDestino: "Indústria Alfa PE", destinoUF: "PE", produto: "Polímero Theta · Big Bag", pesoKg: 1600, motoristaId: "m1", veiculoId: "v1", status: "prevista", urgencia: "normal", observacao: "Documentação de saída precisa de DAT-e" },

  { id: "col5", data: "2026-04-25", janela: "manha", horaPrevista: "07:00", remetenteNome: "Polímeros Ilha Ltda", remetenteEndereco: "Av. Brasil, 12 340 · Ilha do Governador · Rio de Janeiro/RJ", clienteDestino: "Distribuidora Norte RJ", destinoUF: "RJ", produto: "Resina PVC · coleta local", pesoKg: 780, motoristaId: "m2", veiculoId: "v2", status: "prevista", urgencia: "normal" },
  { id: "col6", data: "2026-04-25", janela: "manha", horaPrevista: "08:30", remetenteNome: "Tintas Litoral RJ", remetenteEndereco: "Av. das Américas, 4400 · Barra da Tijuca · Rio de Janeiro/RJ", clienteDestino: "Zanzalog Transportes", destinoUF: "SP", produto: "Tintas · latão 18L", pesoKg: 540, status: "prevista", urgencia: "urgente", observacao: "Aguardando motorista" },
  { id: "col7", data: "2026-04-25", janela: "tarde", horaPrevista: "14:00", remetenteNome: "Química Caxias S.A.", remetenteEndereco: "Rod. Washington Luís, km 113 · Duque de Caxias/RJ", clienteDestino: "Primo Tedesco", destinoUF: "SP", produto: "Ácido sulfônico · IBC", pesoKg: 1200, status: "prevista", urgencia: "normal" },
  { id: "col8", data: "2026-04-25", janela: "tarde", horaPrevista: "16:00", remetenteNome: "Laboratório Nova Iguaçu", remetenteEndereco: "Rua Governador Portela, 880 · Nova Iguaçu/RJ", clienteDestino: "Petroquímica Sul", destinoUF: "RS", produto: "Reagente controlado · palete", pesoKg: 480, status: "prevista", urgencia: "urgente", observacao: "Produto controlado · documentação PF" },

  { id: "col9", data: "2026-04-26", janela: "manha", horaPrevista: "08:00", remetenteNome: "Indústria Centro RJ", remetenteEndereco: "Av. Rio Branco, 245 · Centro · Rio de Janeiro/RJ", clienteDestino: "Fernando CSA Indústria", destinoUF: "SP", produto: "Polímero Theta", pesoKg: 920, status: "prevista", urgencia: "normal" },
  { id: "col10", data: "2026-04-26", janela: "manha", horaPrevista: "10:30", remetenteNome: "Tintas Litoral RJ", remetenteEndereco: "Av. das Américas, 4400 · Barra da Tijuca · Rio de Janeiro/RJ", clienteDestino: "Agroterra SC", destinoUF: "SC", produto: "Tintas industriais · latão", pesoKg: 660, status: "prevista", urgencia: "normal" },
  { id: "col11", data: "2026-04-26", janela: "tarde", horaPrevista: "13:00", remetenteNome: "Polímeros Ilha Ltda", remetenteEndereco: "Av. Brasil, 12 340 · Ilha do Governador · Rio de Janeiro/RJ", clienteDestino: "Quimex Bahia", destinoUF: "BA", produto: "Resina · big bag 500kg", pesoKg: 2000, status: "prevista", urgencia: "normal", observacao: "Redespacho BA · consolidar com col4" },
  { id: "col12", data: "2026-04-26", janela: "tarde", horaPrevista: "15:30", remetenteNome: "Química Caxias S.A.", remetenteEndereco: "Rod. Washington Luís, km 113 · Duque de Caxias/RJ", clienteDestino: "Indústria Alfa PE", destinoUF: "PE", produto: "Solvente · tambor 200L", pesoKg: 840, status: "prevista", urgencia: "normal" },
];

// ===== Canhotos e Portal de Parceiros =====

export type CanhotoStatus = "pendente" | "recebido" | "enviado_cliente";

export interface Canhoto {
  id: string;
  cteId: string;
  numeroNF: string;
  cliente: string;
  clienteEmail: string;
  motoristaId: string;
  dataEntrega: string;
  status: CanhotoStatus;
  imagemUrl?: string;
  dataUpload?: string;
  dataEnvioCliente?: string;
  transportadoraParceira?: string;
}

export interface TransportadoraParceira {
  id: string;
  nome: string;
  cnpj: string;
  cidade: string;
  uf: string;
  entregasMes: number;
}

export const parceiras: TransportadoraParceira[] = [
  { id: "par1", nome: "Expresso Rio Transportes", cnpj: "09.112.233/0001-44", cidade: "Rio de Janeiro", uf: "RJ", entregasMes: 34 },
  { id: "par2", nome: "Log Sul Cargas", cnpj: "10.223.344/0001-55", cidade: "Porto Alegre", uf: "RS", entregasMes: 21 },
  { id: "par3", nome: "Fronteira Transportes", cnpj: "11.334.455/0001-66", cidade: "Recife", uf: "PE", entregasMes: 12 },
];

export const canhotos: Canhoto[] = [
  { id: "cnh1", cteId: "cte1", numeroNF: "NF-45231", cliente: "Primo Tedesco", clienteEmail: "fiscal@primotedesco.com.br", motoristaId: "m1", dataEntrega: "2026-04-18", status: "enviado_cliente", dataUpload: "2026-04-18T16:20:00", dataEnvioCliente: "2026-04-18T17:05:00", imagemUrl: "placeholder-canhoto.jpg" },
  { id: "cnh2", cteId: "cte2", numeroNF: "NF-45235", cliente: "Fernando CSA Indústria", clienteEmail: "recebimento@fernandocsa.com.br", motoristaId: "m1", dataEntrega: "2026-04-19", status: "recebido", dataUpload: "2026-04-19T14:50:00", imagemUrl: "placeholder-canhoto.jpg" },
  { id: "cnh3", cteId: "cte3", numeroNF: "NF-45240", cliente: "Zanzalog Transportes", clienteEmail: "suprimentos@zanzalog.com.br", motoristaId: "m1", dataEntrega: "2026-04-18", status: "pendente", transportadoraParceira: "par1" },
  { id: "cnh4", cteId: "cte4", numeroNF: "NF-45248", cliente: "Quimex Bahia", clienteEmail: "nf@quimexba.com.br", motoristaId: "m2", dataEntrega: "2026-04-22", status: "pendente", transportadoraParceira: "par3" },
  { id: "cnh5", cteId: "cte4", numeroNF: "NF-45249", cliente: "Quimex Bahia", clienteEmail: "nf@quimexba.com.br", motoristaId: "m2", dataEntrega: "2026-04-22", status: "pendente", transportadoraParceira: "par3" },
  { id: "cnh6", cteId: "cte5", numeroNF: "NF-45253", cliente: "Distribuidora Norte RJ", clienteEmail: "fiscal@distribnorterj.com.br", motoristaId: "m2", dataEntrega: "2026-04-20", status: "recebido", dataUpload: "2026-04-20T18:30:00", imagemUrl: "placeholder-canhoto.jpg", transportadoraParceira: "par1" },
  { id: "cnh7", cteId: "cte6", numeroNF: "NF-45218", cliente: "Agroterra SC", clienteEmail: "fiscal@agroterrasc.com.br", motoristaId: "m3", dataEntrega: "2026-04-14", status: "enviado_cliente", dataUpload: "2026-04-14T16:00:00", dataEnvioCliente: "2026-04-14T17:12:00", imagemUrl: "placeholder-canhoto.jpg" },
  { id: "cnh8", cteId: "cte6", numeroNF: "NF-45219", cliente: "Agroterra SC", clienteEmail: "fiscal@agroterrasc.com.br", motoristaId: "m3", dataEntrega: "2026-04-14", status: "recebido", dataUpload: "2026-04-14T16:02:00", imagemUrl: "placeholder-canhoto.jpg" },
];

// ===== Histórico de alterações da carga + e-mails enviados =====

export type EventoCargaTipo =
  | "criada"
  | "postergada"
  | "antecipada"
  | "pedido_incluido"
  | "pedido_removido"
  | "motorista_alterado"
  | "email_enviado"
  | "reenvio_email";

export interface EventoCarga {
  id: string;
  cargaId: string;
  tipo: EventoCargaTipo;
  descricao: string;
  autor: string;
  timestamp: string;
  detalhe?: string;
}

export interface EmailEnviado {
  id: string;
  cargaId: string;
  assunto: string;
  grupos: string[];
  destinatarios: number;
  timestamp: string;
  versao: number;
  tipo: "inicial" | "atualizacao" | "cancelamento";
  resumoMudancas?: string;
}

export const eventosCarga: EventoCarga[] = [
  { id: "ev1", cargaId: "crg1", tipo: "criada", descricao: "Carga formada com 3 pedidos", autor: "Rodrigo Silva", timestamp: "2026-04-16T06:00:00" },
  { id: "ev2", cargaId: "crg1", tipo: "email_enviado", descricao: "E-mail v1 disparado a SP+RJ e Faturamento", autor: "Sistema", timestamp: "2026-04-16T06:02:00", detalhe: "5 destinatários" },
  { id: "ev3", cargaId: "crg1", tipo: "pedido_incluido", descricao: "Pedido 12.8156 · Primo Tedesco (retorno de palete) incluído", autor: "Rodrigo Silva", timestamp: "2026-04-16T07:15:00" },
  { id: "ev4", cargaId: "crg1", tipo: "postergada", descricao: "Saída postergada de 16/04 07:30 para 17/04 07:30", autor: "Rodrigo Silva", timestamp: "2026-04-16T07:16:00", detalhe: "Motivo: aguardo de NF de embalagem" },
  { id: "ev5", cargaId: "crg1", tipo: "reenvio_email", descricao: "E-mail v2 reenviado com as alterações", autor: "Sistema", timestamp: "2026-04-16T07:18:00", detalhe: "5 destinatários · inclusão de pedido + postergação" },

  { id: "ev6", cargaId: "crg2", tipo: "criada", descricao: "Carga formada com 2 pedidos", autor: "Rodrigo Silva", timestamp: "2026-04-15T05:45:00" },
  { id: "ev7", cargaId: "crg2", tipo: "email_enviado", descricao: "E-mail v1 disparado a SP+RJ, Nordeste e Faturamento", autor: "Sistema", timestamp: "2026-04-15T05:47:00", detalhe: "6 destinatários" },
  { id: "ev8", cargaId: "crg2", tipo: "antecipada", descricao: "Saída antecipada de 15/04 06:30 para 15/04 06:00", autor: "Rodrigo Silva", timestamp: "2026-04-15T05:50:00", detalhe: "Motivo: janela fixa do cliente Quimex BA" },
  { id: "ev9", cargaId: "crg2", tipo: "reenvio_email", descricao: "E-mail v2 reenviado com as alterações", autor: "Sistema", timestamp: "2026-04-15T05:52:00", detalhe: "6 destinatários · antecipação de saída" },

  { id: "ev10", cargaId: "crg3", tipo: "criada", descricao: "Carga formada com 1 pedido (transferência SC)", autor: "Rodrigo Silva", timestamp: "2026-04-14T05:15:00" },
  { id: "ev11", cargaId: "crg3", tipo: "email_enviado", descricao: "E-mail v1 disparado a Santa Catarina e Faturamento", autor: "Sistema", timestamp: "2026-04-14T05:17:00", detalhe: "4 destinatários" },
];

export const emailsEnviados: EmailEnviado[] = [
  { id: "em1", cargaId: "crg1", assunto: "CRG-2026-0018 · RS → SP · 16/04 07:30 · Carlos Santos · DEF-4G56", grupos: ["g1", "g4"], destinatarios: 5, timestamp: "2026-04-16T06:02:00", versao: 1, tipo: "inicial" },
  { id: "em2", cargaId: "crg1", assunto: "CRG-2026-0018 · ATUALIZAÇÃO · RS → SP · 17/04 07:30 · Carlos Santos · DEF-4G56", grupos: ["g1", "g4"], destinatarios: 5, timestamp: "2026-04-16T07:18:00", versao: 2, tipo: "atualizacao", resumoMudancas: "Saída postergada em +24h · Pedido 12.8156 incluído" },
  { id: "em3", cargaId: "crg2", assunto: "CRG-2026-0017 · SP → BA/RJ · 15/04 06:30 · José Henrique · GHI-7J89", grupos: ["g1", "g6", "g4"], destinatarios: 6, timestamp: "2026-04-15T05:47:00", versao: 1, tipo: "inicial" },
  { id: "em4", cargaId: "crg2", assunto: "CRG-2026-0017 · ATUALIZAÇÃO · SP → BA/RJ · 15/04 06:00 · José Henrique · GHI-7J89", grupos: ["g1", "g6", "g4"], destinatarios: 6, timestamp: "2026-04-15T05:52:00", versao: 2, tipo: "atualizacao", resumoMudancas: "Saída antecipada em 30min · janela fixa Quimex BA" },
  { id: "em5", cargaId: "crg3", assunto: "CRG-2026-0016 · SC → SC · 14/04 05:30 · Antônio Silva · KLM-0N12", grupos: ["g2", "g4"], destinatarios: 4, timestamp: "2026-04-14T05:17:00", versao: 1, tipo: "inicial" },
];

// ===== Integrações e distribuição de XML ao ERP/contador =====

export type IntegracaoStatus = "ativa" | "disponivel" | "sob_demanda" | "erro";
export type IntegracaoCategoria = "captura" | "fiscal" | "seguro" | "risco" | "comunicacao" | "erp" | "rota";

export interface Integracao {
  id: string;
  nome: string;
  categoria: IntegracaoCategoria;
  status: IntegracaoStatus;
  descricao: string;
  ultimoEvento?: string;
}

export const integracoes: Integracao[] = [
  { id: "int1", nome: "Microsoft OneDrive", categoria: "captura", status: "ativa", descricao: "Leitura contínua da planilha de pedidos (Pedidos_Logistica.xlsx)", ultimoEvento: "Sincronizado há 42s" },
  { id: "int2", nome: "SEFAZ · Certificado A1", categoria: "fiscal", status: "ativa", descricao: "Captura automática de XMLs emitidos pela indústria e casamento por OC", ultimoEvento: "24 XMLs hoje · 91,7% casados" },
  { id: "int3", nome: "TecnoRisk", categoria: "risco", status: "sob_demanda", descricao: "Monitoramento de carga/motorista/placa (condicional à documentação da TecnoRisk)", ultimoEvento: "Aguardando documentação da API" },
  { id: "int4", nome: "ATM · Averbação", categoria: "seguro", status: "ativa", descricao: "Averbação automática de CT-e no momento da emissão", ultimoEvento: "6 averbações hoje" },
  { id: "int5", nome: "ELC2 · Averbação alternativa", categoria: "seguro", status: "disponivel", descricao: "Provedor alternativo de averbação para clientes específicos" },
  { id: "int6", nome: "Smart Locking", categoria: "seguro", status: "disponivel", descricao: "Lacres eletrônicos e geofencing para cargas de alto valor" },
  { id: "int7", nome: "Porto Seguro", categoria: "seguro", status: "disponivel", descricao: "Apólice de responsabilidade civil integrada" },
  { id: "int8", nome: "GNRE · Smartonline", categoria: "fiscal", status: "sob_demanda", descricao: "Emissão de GNRE para operações interestaduais (ICMS-ST, DIFAL). Integração personalizada — consultar time comercial para ativação.", ultimoEvento: "Solicitação registrada pelo time Dorfketal" },
  { id: "int9", nome: "GraphHopper + ANTT", categoria: "rota", status: "ativa", descricao: "Cálculo de rota e piso mínimo ANTT para vale-pedágio e conferência de frete", ultimoEvento: "98% de cobertura" },
  { id: "int10", nome: "ERP · Distribuição de XMLs", categoria: "erp", status: "ativa", descricao: "Envio automático dos XMLs de CT-e e NF-e aos contadores e ERPs autorizados", ultimoEvento: "38 envios hoje · 100% entregues" },
];

export interface DestinatarioXML {
  id: string;
  cnpj: string;
  razaoSocial: string;
  tipo: "contador" | "erp";
  metodo: "email" | "api";
  contato: string;
  frequencia: "tempo_real" | "diaria" | "semanal";
  ativo: boolean;
}

export interface DistribuicaoXML {
  id: string;
  chaveNFe: string;
  cteId?: string;
  destinatarioId: string;
  dataEnvio: string;
  status: "enviado" | "pendente" | "falhou";
  erroMsg?: string;
}

export const destinatariosXML: DestinatarioXML[] = [
  { id: "dest1", cnpj: "11.222.333/0001-44", razaoSocial: "Cecil Contabilidade", tipo: "contador", metodo: "email", contato: "xml@cecilcontabil.com.br", frequencia: "tempo_real", ativo: true },
  { id: "dest2", cnpj: "22.333.444/0001-55", razaoSocial: "Contax Assessoria Fiscal", tipo: "contador", metodo: "email", contato: "fiscal@contaxrs.com.br", frequencia: "diaria", ativo: true },
  { id: "dest3", cnpj: "33.444.555/0001-66", razaoSocial: "ERP Interno Dorfketal", tipo: "erp", metodo: "api", contato: "https://erp.dorfketal.com.br/api/xml", frequencia: "tempo_real", ativo: true },
];

export const distribuicoesXML: DistribuicaoXML[] = [
  { id: "dx1", chaveNFe: "43260412345678000190550010000452310001234567", cteId: "cte1", destinatarioId: "dest1", dataEnvio: "2026-04-16T06:48:12", status: "enviado" },
  { id: "dx2", chaveNFe: "43260412345678000190550010000452310001234567", cteId: "cte1", destinatarioId: "dest3", dataEnvio: "2026-04-16T06:48:14", status: "enviado" },
  { id: "dx3", chaveNFe: "43260412345678000190550010000452320001234568", cteId: "cte2", destinatarioId: "dest1", dataEnvio: "2026-04-16T06:49:01", status: "enviado" },
  { id: "dx4", chaveNFe: "43260412345678000190550010000452320001234568", cteId: "cte2", destinatarioId: "dest3", dataEnvio: "2026-04-16T06:49:03", status: "enviado" },
  { id: "dx5", chaveNFe: "43260412345678000190550010000452400001234569", cteId: "cte3", destinatarioId: "dest1", dataEnvio: "2026-04-16T06:49:55", status: "enviado" },
  { id: "dx6", chaveNFe: "43260412345678000190550010000452480001234570", cteId: "cte4", destinatarioId: "dest3", dataEnvio: "2026-04-15T05:25:10", status: "enviado" },
  { id: "dx7", chaveNFe: "43260412345678000190550010000452490001234571", cteId: "cte4", destinatarioId: "dest2", dataEnvio: "2026-04-15T23:00:00", status: "pendente" },
  { id: "dx8", chaveNFe: "43260412345678000190550010000452530001234572", cteId: "cte5", destinatarioId: "dest3", dataEnvio: "2026-04-15T05:27:20", status: "falhou", erroMsg: "Endpoint respondeu 502 — tentativa reagendada" },
];

// ===== GNRE — recolhimento de ICMS interestadual, vinculada ao CT-e =====

export type GNREStatus = "gerada" | "paga" | "vencida";

export interface GNRE {
  id: string;
  numero: string;
  cteId: string;
  ufRecolhimento: string;
  valor: number;
  vencimento: string;
  status: GNREStatus;
  dataEmissao: string;
  bancoLiquidacao?: string;
}

export const gnres: GNRE[] = [
  // GNREs da carga Paulo TRD0C87 — uma por CT-e interestadual (todos saem do RS)
  { id: "gnre1", numero: "GNRE-2026-1042", cteId: "cte10", ufRecolhimento: "SC", valor: 412.50, vencimento: "2026-04-30", status: "gerada", dataEmissao: "2026-04-15T10:42:30", bancoLiquidacao: "Banco do Brasil" },
  { id: "gnre2", numero: "GNRE-2026-1043", cteId: "cte11", ufRecolhimento: "SC", valor: 275.00, vencimento: "2026-04-30", status: "gerada", dataEmissao: "2026-04-15T10:43:30", bancoLiquidacao: "Banco do Brasil" },
  { id: "gnre3", numero: "GNRE-2026-1044", cteId: "cte12", ufRecolhimento: "SP", valor: 204.80, vencimento: "2026-04-30", status: "gerada", dataEmissao: "2026-04-15T10:44:30", bancoLiquidacao: "Bradesco" },
  { id: "gnre4", numero: "GNRE-2026-1045", cteId: "cte13", ufRecolhimento: "SP", valor: 222.20, vencimento: "2026-04-30", status: "gerada", dataEmissao: "2026-04-15T10:45:30", bancoLiquidacao: "Bradesco" },
  { id: "gnre5", numero: "GNRE-2026-1046", cteId: "cte14", ufRecolhimento: "SP", valor: 64.50, vencimento: "2026-04-30", status: "gerada", dataEmissao: "2026-04-15T10:46:30", bancoLiquidacao: "Bradesco" },
  { id: "gnre6", numero: "GNRE-2026-1047", cteId: "cte15", ufRecolhimento: "RJ", valor: 256.60, vencimento: "2026-04-30", status: "gerada", dataEmissao: "2026-04-15T10:47:30", bancoLiquidacao: "Itaú" },
  { id: "gnre7", numero: "GNRE-2026-1048", cteId: "cte16", ufRecolhimento: "RJ", valor: 24.40, vencimento: "2026-04-30", status: "gerada", dataEmissao: "2026-04-15T10:48:30", bancoLiquidacao: "Itaú" },
  { id: "gnre8", numero: "GNRE-2026-1049", cteId: "cte17", ufRecolhimento: "BA", valor: 487.40, vencimento: "2026-04-30", status: "gerada", dataEmissao: "2026-04-15T10:49:30", bancoLiquidacao: "Itaú" },
  // GNREs das cargas antigas (apenas para o histórico parecer realista)
  { id: "gnre9", numero: "GNRE-2026-1031", cteId: "cte1", ufRecolhimento: "SP", valor: 94.50, vencimento: "2026-04-30", status: "paga", dataEmissao: "2026-04-16T06:48:00", bancoLiquidacao: "Bradesco" },
  { id: "gnre10", numero: "GNRE-2026-1032", cteId: "cte4", ufRecolhimento: "BA", valor: 168.40, vencimento: "2026-04-30", status: "paga", dataEmissao: "2026-04-15T05:25:00", bancoLiquidacao: "Itaú" },
];

// ===== Ordem de Carregamento — entidade que agrupa toda a operação =====

export type OrdemCarregamentoStatus = "rascunho" | "emitida" | "em_transito" | "finalizada";

export interface OrdemCarregamento {
  id: string;
  numero: string; // OC-2026-NNNN
  dataCriacao: string;
  cargaId: string; // espelha a carga
  status: OrdemCarregamentoStatus;
  // sumários (derivam de carga, mas cacheados para a listagem)
  motorista: string;
  placa: string;
  origem: string;
  destinosUF: string[];
  pesoTotal: number;
  valorFrete: number;
  qtdCtes: number;
  qtdMdfes: number;
  qtdGnres: number;
  temCiot: boolean;
  temValePedagio: boolean;
}

export const ordensCarregamento: OrdemCarregamento[] = [
  // OC do exemplo Paulo TRD0C87 — a estrela da simulação
  { id: "oc4", numero: "OC-2026-0020", dataCriacao: "2026-04-15T10:30:00", cargaId: "crg4", status: "em_transito", motorista: "Paulo Ribeiro", placa: "TRD-0C87", origem: "RS · Nova Santa Rita", destinosUF: ["SC", "SP", "RJ", "BA"], pesoTotal: 19251, valorFrete: 17495, qtdCtes: 8, qtdMdfes: 4, qtdGnres: 8, temCiot: true, temValePedagio: true },
  { id: "oc1", numero: "OC-2026-0018", dataCriacao: "2026-04-16T06:00:00", cargaId: "crg1", status: "em_transito", motorista: "Carlos Santos", placa: "DEF-4G56", origem: "RS · Nova Santa Rita", destinosUF: ["SP"], pesoTotal: 1160, valorFrete: 1580, qtdCtes: 3, qtdMdfes: 1, qtdGnres: 1, temCiot: true, temValePedagio: true },
  { id: "oc2", numero: "OC-2026-0017", dataCriacao: "2026-04-15T05:45:00", cargaId: "crg2", status: "em_transito", motorista: "José Henrique", placa: "GHI-7J89", origem: "RS · Nova Santa Rita", destinosUF: ["BA", "RJ"], pesoTotal: 1490, valorFrete: 3580, qtdCtes: 2, qtdMdfes: 2, qtdGnres: 1, temCiot: true, temValePedagio: true },
  { id: "oc3", numero: "OC-2026-0016", dataCriacao: "2026-04-14T05:15:00", cargaId: "crg3", status: "finalizada", motorista: "Antônio Silva", placa: "KLM-0N12", origem: "SC · Joinville", destinosUF: ["SC"], pesoTotal: 1020, valorFrete: 680, qtdCtes: 1, qtdMdfes: 1, qtdGnres: 0, temCiot: false, temValePedagio: false },
];

// ===== CIOT (Código Identificador da Operação de Transporte) — obrigatório a partir de 24/05/2026 =====

export type CIOTStatus = "gerado" | "pago" | "cancelado";

export interface CIOT {
  id: string;
  numero: string;
  cargaId: string;
  transportadorTipo: "agregado" | "etc" | "frota_propria";
  transportadorNome: string;
  transportadorCnpjCpf: string;
  valorFrete: number;
  pisoMinimoAntt: number;
  banco: string;
  agencia: string;
  conta: string;
  dataEmissao: string;
  status: CIOTStatus;
  observacao?: string;
}

export const ciots: CIOT[] = [
  { id: "ciot1", numero: "CIOT-83749477", cargaId: "crg4", transportadorTipo: "etc", transportadorNome: "TAGLOG Transportes Ltda", transportadorCnpjCpf: "08.221.456/0001-77", valorFrete: 17495, pisoMinimoAntt: 16670, banco: "Banco do Brasil", agencia: "3214-5", conta: "12.345-6", dataEmissao: "2026-04-15T10:38:00", status: "gerado", observacao: "Margem 5% sobre piso mínimo · pagamento na descarga em Joinville" },
  { id: "ciot2", numero: "CIOT-83749201", cargaId: "crg1", transportadorTipo: "frota_propria", transportadorNome: "Frota própria · Carlos Santos", transportadorCnpjCpf: "123.456.789-00", valorFrete: 0, pisoMinimoAntt: 0, banco: "—", agencia: "—", conta: "—", dataEmissao: "2026-04-16T06:30:00", status: "gerado", observacao: "Frota própria · CIOT registrado sem pagamento a terceiro" },
  { id: "ciot3", numero: "CIOT-83749145", cargaId: "crg2", transportadorTipo: "agregado", transportadorNome: "José Henrique (agregado)", transportadorCnpjCpf: "234.567.890-11", valorFrete: 3580, pisoMinimoAntt: 3410, banco: "Itaú", agencia: "1832", conta: "98.765-4", dataEmissao: "2026-04-15T05:30:00", status: "pago" },
];

// ===== Vale-Pedágio (obrigatório, cálculo via tabela ANTT por eixos) =====

export type ValePedagioStatus = "emitido" | "utilizado" | "estornado";

export interface ValePedagio {
  id: string;
  numero: string;
  cargaId: string;
  motoristaId: string;
  veiculoId: string;
  origem: string;
  destino: string;
  kmTotal: number;
  eixos: number;
  valor: number;
  emissor: "ConectCar" | "Sem Parar" | "RepomVPe" | "DBTrans";
  dataEmissao: string;
  status: ValePedagioStatus;
}

export const valesPedagio: ValePedagio[] = [
  { id: "vp1", numero: "VP-2026-0020", cargaId: "crg4", motoristaId: "m7", veiculoId: "v6", origem: "Nova Santa Rita/RS", destino: "Mataripe/BA (rota multi-stop SC → SP → RJ → BA)", kmTotal: 4280, eixos: 5, valor: 2840, emissor: "ConectCar", dataEmissao: "2026-04-15T10:35:00", status: "emitido" },
  { id: "vp2", numero: "VP-2026-0018", cargaId: "crg1", motoristaId: "m1", veiculoId: "v1", origem: "Nova Santa Rita/RS", destino: "Ribeirão Preto/SP", kmTotal: 1410, eixos: 5, valor: 980, emissor: "Sem Parar", dataEmissao: "2026-04-16T06:32:00", status: "utilizado" },
  { id: "vp3", numero: "VP-2026-0017", cargaId: "crg2", motoristaId: "m2", veiculoId: "v2", origem: "Guarulhos/SP", destino: "Salvador/BA", kmTotal: 2080, eixos: 5, valor: 1420, emissor: "ConectCar", dataEmissao: "2026-04-15T05:32:00", status: "utilizado" },
];

// ===== Tabela de Frete (cálculo automático CT-e por rota e faixa de peso) =====

export interface TabelaFreteLinha {
  id: string;
  origem: string;
  destino: string;
  faixaPeso: string;
  pesoMinKg: number;
  pesoMaxKg: number;
  valorPorKg: number;       // R$ por kg (0 quando só fixo + ad valorem)
  valorFixo: number;        // taxa fixa por nota (para faixas fracionadas)
  valorMinimo: number;      // piso por CT-e
  adValoremPct: number;     // % sobre valor da NF (GRIS/seguro)
  icmsEmbutidoPct: number;  // alíquota ICMS típica do trecho
  modalidade?: "venda" | "transferencia" | "redespacho";
  observacao?: string;
}

export const tabelasFrete: TabelaFreteLinha[] = [
  // Estrutura Dorfketal: 3 modalidades — fracionada (até 100kg fixo+adval, 101-599 fixo+adval), e lotação a partir de 600kg por kg
  // FRACIONADA — até 100 kg (amostras / pequenos volumes)
  { id: "tf1", origem: "RS · Nova Santa Rita", destino: "Qualquer UF · Fracionada", faixaPeso: "até 100 kg (amostras)", pesoMinKg: 0, pesoMaxKg: 100, valorPorKg: 0, valorFixo: 180, valorMinimo: 180, adValoremPct: 0.30, icmsEmbutidoPct: 12.0, modalidade: "venda", observacao: "Valor fixo + ad valorem sobre NF" },
  // FRACIONADA — 101 a 599 kg
  { id: "tf2", origem: "RS · Nova Santa Rita", destino: "Qualquer UF · Fracionada", faixaPeso: "101 – 599 kg", pesoMinKg: 101, pesoMaxKg: 599, valorPorKg: 0, valorFixo: 380, valorMinimo: 380, adValoremPct: 0.45, icmsEmbutidoPct: 12.0, modalidade: "venda", observacao: "Valor fixo + ad valorem sobre NF" },
  // LOTAÇÃO — a partir de 600 kg (R$/kg)
  { id: "tf3", origem: "RS · Nova Santa Rita", destino: "SC · Joinville (cross-dock TAGLOG)", faixaPeso: "≥ 600 kg", pesoMinKg: 600, pesoMaxKg: 30000, valorPorKg: 0.52, valorFixo: 0, valorMinimo: 580, adValoremPct: 0.25, icmsEmbutidoPct: 12.0, modalidade: "transferencia", observacao: "Granel / lotação · sem piso ANTT" },
  { id: "tf4", origem: "RS · Nova Santa Rita", destino: "SP · Grande SP", faixaPeso: "≥ 600 kg", pesoMinKg: 600, pesoMaxKg: 30000, valorPorKg: 0.78, valorFixo: 0, valorMinimo: 750, adValoremPct: 0.30, icmsEmbutidoPct: 12.0, modalidade: "venda" },
  { id: "tf5", origem: "RS · Nova Santa Rita", destino: "SP · Vale do Paraíba (REVAP)", faixaPeso: "≥ 600 kg", pesoMinKg: 600, pesoMaxKg: 30000, valorPorKg: 0.86, valorFixo: 0, valorMinimo: 920, adValoremPct: 0.30, icmsEmbutidoPct: 12.0, modalidade: "venda" },
  { id: "tf6", origem: "RS · Nova Santa Rita", destino: "SP · ABC paulista", faixaPeso: "≥ 600 kg", pesoMinKg: 600, pesoMaxKg: 30000, valorPorKg: 1.04, valorFixo: 0, valorMinimo: 580, adValoremPct: 0.30, icmsEmbutidoPct: 12.0, modalidade: "venda" },
  { id: "tf7", origem: "RS · Nova Santa Rita", destino: "RJ · Macaé / Bacia de Campos", faixaPeso: "≥ 600 kg", pesoMinKg: 600, pesoMaxKg: 30000, valorPorKg: 1.42, valorFixo: 0, valorMinimo: 1480, adValoremPct: 0.35, icmsEmbutidoPct: 12.0, modalidade: "venda" },
  { id: "tf8", origem: "RS · Nova Santa Rita", destino: "BA · Salvador / Mataripe", faixaPeso: "≥ 600 kg", pesoMinKg: 600, pesoMaxKg: 30000, valorPorKg: 1.84, valorFixo: 0, valorMinimo: 1980, adValoremPct: 0.40, icmsEmbutidoPct: 7.0, modalidade: "venda" },
  { id: "tf9", origem: "RS · Nova Santa Rita", destino: "BA · interior (RLAM)", faixaPeso: "≥ 5 000 kg (granel)", pesoMinKg: 5000, pesoMaxKg: 30000, valorPorKg: 1.62, valorFixo: 0, valorMinimo: 8800, adValoremPct: 0.40, icmsEmbutidoPct: 7.0, modalidade: "venda", observacao: "Carga granel / lotação" },
  { id: "tf10", origem: "SP · Guarulhos (cross-dock)", destino: "RJ · capital", faixaPeso: "≥ 600 kg", pesoMinKg: 600, pesoMaxKg: 30000, valorPorKg: 0.92, valorFixo: 0, valorMinimo: 620, adValoremPct: 0.30, icmsEmbutidoPct: 12.0, modalidade: "redespacho" },
];
