export type PedidoStatus = "recebido" | "programado" | "liberado" | "em_carga" | "entregue" | "cancelado" | "redespacho";

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
];

export const veiculos: Veiculo[] = [
  { id: "v1", placa: "DEF-4G56", tipo: "carreta", capacidadeKg: 30000, motoristaId: "m1", ativo: true },
  { id: "v2", placa: "GHI-7J89", tipo: "carreta", capacidadeKg: 33000, motoristaId: "m2", ativo: true },
  { id: "v3", placa: "KLM-0N12", tipo: "carreta", capacidadeKg: 40000, motoristaId: "m3", ativo: true },
  { id: "v4", placa: "OPQ-3R45", tipo: "truck", capacidadeKg: 12000, motoristaId: "m4", ativo: true },
  { id: "v5", placa: "STU-6V78", tipo: "toco", capacidadeKg: 6000, motoristaId: "m5", ativo: true },
];

export const pedidos: Pedido[] = [
  { id: "p1", oc: "12.7934", cliente: "Primo Tedesco", cnpjCliente: "12.345.678/0001-90", cidade: "Ribeirão Preto", uf: "SP", produto: "Aditivo Alpha 500", embalagem: "IBC 1000L Inox", quantidade: 2, pesoBruto: 620, pesoLiquido: 580, valor: 4800, prazo: "2026-04-18", dataEntrada: "2026-04-14", status: "liberado", origemLiberacao: "RS-Nova Santa Rita", tipoOperacao: "venda", observacao: "Carga reversa de IBC" },
  { id: "p2", oc: "12.8012", cliente: "Fernando CSA Indústria", cnpjCliente: "23.456.789/0001-01", cidade: "Campinas", uf: "SP", produto: "Solvente Beta 200", embalagem: "Tambor 200L", quantidade: 4, pesoBruto: 280, pesoLiquido: 240, valor: 2100, prazo: "2026-04-19", dataEntrada: "2026-04-14", status: "programado", origemLiberacao: "RS-Nova Santa Rita", tipoOperacao: "venda" },
  { id: "p3", oc: "12.8055", cliente: "Zanzalog Transportes", cnpjCliente: "34.567.890/0001-12", cidade: "Santos", uf: "SP", produto: "Reagente Gamma", embalagem: "Contentor Inox 500L", quantidade: 1, pesoBruto: 180, pesoLiquido: 160, valor: 1450, prazo: "2026-04-18", dataEntrada: "2026-04-14", status: "liberado", origemLiberacao: "RS-Nova Santa Rita", tipoOperacao: "venda", observacao: "Redespacho SP" },
  { id: "p4", oc: "12.8091", cliente: "Quimex Bahia", cnpjCliente: "45.678.901/0001-23", cidade: "Salvador", uf: "BA", produto: "Produto Delta BR", embalagem: "Bombona 50L", quantidade: 10, pesoBruto: 450, pesoLiquido: 400, valor: 3500, prazo: "2026-04-22", dataEntrada: "2026-04-15", status: "recebido", origemLiberacao: "SP-Guarulhos", tipoOperacao: "venda", observacao: "Redespacho RJ → BA" },
  { id: "p5", oc: "12.8102", cliente: "Distribuidora Norte RJ", cnpjCliente: "56.789.012/0001-34", cidade: "Rio de Janeiro", uf: "RJ", produto: "Epsilon Plus", embalagem: "Palete 500kg", quantidade: 2, pesoBruto: 1040, pesoLiquido: 1000, valor: 6200, prazo: "2026-04-20", dataEntrada: "2026-04-15", status: "liberado", origemLiberacao: "SP-Guarulhos", tipoOperacao: "venda" },
  { id: "p6", oc: "12.8118", cliente: "Petroquímica Sul", cnpjCliente: "67.890.123/0001-45", cidade: "Triunfo", uf: "RS", produto: "Base Zeta 300", embalagem: "IBC 1000L", quantidade: 1, pesoBruto: 950, pesoLiquido: 900, valor: 5400, prazo: "2026-04-21", dataEntrada: "2026-04-15", status: "programado", origemLiberacao: "SC-Joinville", tipoOperacao: "transferencia" },
  { id: "p7", oc: "12.8134", cliente: "Agroterra SC", cnpjCliente: "78.901.234/0001-56", cidade: "Joinville", uf: "SC", produto: "Fertilizante Eta", embalagem: "Saco 25kg", quantidade: 40, pesoBruto: 1020, pesoLiquido: 1000, valor: 4200, prazo: "2026-04-19", dataEntrada: "2026-04-15", status: "liberado", origemLiberacao: "RS-Nova Santa Rita", tipoOperacao: "venda" },
  { id: "p8", oc: "12.8145", cliente: "Indústria Alfa PE", cnpjCliente: "89.012.345/0001-67", cidade: "Recife", uf: "PE", produto: "Polímero Theta", embalagem: "Big Bag 500kg", quantidade: 3, pesoBruto: 1520, pesoLiquido: 1500, valor: 8400, prazo: "2026-04-25", dataEntrada: "2026-04-16", status: "recebido", origemLiberacao: "RS-Nova Santa Rita", tipoOperacao: "venda", observacao: "Redespacho RJ → PE" },
  { id: "p9", oc: "12.8156", cliente: "Primo Tedesco", cnpjCliente: "12.345.678/0001-90", cidade: "Ribeirão Preto", uf: "SP", produto: "Aditivo Alpha 500 (emb.)", embalagem: "Palete de retorno", quantidade: 1, pesoBruto: 80, pesoLiquido: 70, valor: 420, prazo: "2026-04-18", dataEntrada: "2026-04-16", status: "liberado", origemLiberacao: "RS-Nova Santa Rita", tipoOperacao: "venda", observacao: "NF de embalagem vinculada à OC 12.7934" },
  { id: "p10", oc: "12.8167", cliente: "Fernando CSA Indústria", cnpjCliente: "23.456.789/0001-01", cidade: "Campinas", uf: "SP", produto: "Solvente Beta 400", embalagem: "Tambor 400L", quantidade: 2, pesoBruto: 840, pesoLiquido: 800, valor: 4200, prazo: "2026-04-19", dataEntrada: "2026-04-16", status: "em_carga", origemLiberacao: "RS-Nova Santa Rita", tipoOperacao: "venda" },
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
];

export const ctes: CTe[] = [
  { id: "cte1", numero: "CTE-2026-00234", cargaId: "crg1", cnpjRemetente: "99.999.999/0001-00", cnpjDestinatario: "12.345.678/0001-90", cliente: "Primo Tedesco", valorFrete: 850, pesoKg: 700, status: "autorizado", dataEmissao: "2026-04-16T06:45:00", protocoloSefaz: "143250000123456", averbacao: "ATM-45678912", notasFiscais: ["NF-45231", "NF-45232"], ufOrigem: "RS", ufDestino: "SP", cidadeOrigem: "Nova Santa Rita", cidadeDestino: "Ribeirão Preto" },
  { id: "cte2", numero: "CTE-2026-00235", cargaId: "crg1", cnpjRemetente: "99.999.999/0001-00", cnpjDestinatario: "23.456.789/0001-01", cliente: "Fernando CSA Indústria", valorFrete: 420, pesoKg: 280, status: "autorizado", dataEmissao: "2026-04-16T06:46:00", protocoloSefaz: "143250000123457", averbacao: "ATM-45678913", notasFiscais: ["NF-45235"], ufOrigem: "RS", ufDestino: "SP", cidadeOrigem: "Nova Santa Rita", cidadeDestino: "Campinas" },
  { id: "cte3", numero: "CTE-2026-00236", cargaId: "crg1", cnpjRemetente: "99.999.999/0001-00", cnpjDestinatario: "34.567.890/0001-12", cliente: "Zanzalog Transportes", valorFrete: 310, pesoKg: 180, status: "autorizado", dataEmissao: "2026-04-16T06:47:00", protocoloSefaz: "143250000123458", averbacao: "ATM-45678914", notasFiscais: ["NF-45240"], ufOrigem: "RS", ufDestino: "SP", cidadeOrigem: "Nova Santa Rita", cidadeDestino: "Santos" },
  { id: "cte4", numero: "CTE-2026-00237", cargaId: "crg2", cnpjRemetente: "99.999.999/0001-00", cnpjDestinatario: "45.678.901/0001-23", cliente: "Quimex Bahia", valorFrete: 2100, pesoKg: 450, status: "autorizado", dataEmissao: "2026-04-15T05:20:00", protocoloSefaz: "143250000123459", averbacao: "ATM-45678915", notasFiscais: ["NF-45248", "NF-45249"], ufOrigem: "SP", ufDestino: "BA", cidadeOrigem: "Guarulhos", cidadeDestino: "Salvador" },
  { id: "cte5", numero: "CTE-2026-00238", cargaId: "crg2", cnpjRemetente: "99.999.999/0001-00", cnpjDestinatario: "56.789.012/0001-34", cliente: "Distribuidora Norte RJ", valorFrete: 1480, pesoKg: 1040, status: "autorizado", dataEmissao: "2026-04-15T05:22:00", protocoloSefaz: "143250000123460", averbacao: "ATM-45678916", notasFiscais: ["NF-45253"], ufOrigem: "SP", ufDestino: "RJ", cidadeOrigem: "Guarulhos", cidadeDestino: "Rio de Janeiro" },
  { id: "cte6", numero: "CTE-2026-00233", cargaId: "crg3", cnpjRemetente: "99.999.999/0001-00", cnpjDestinatario: "78.901.234/0001-56", cliente: "Agroterra SC", valorFrete: 680, pesoKg: 1020, status: "autorizado", dataEmissao: "2026-04-14T04:55:00", protocoloSefaz: "143250000123461", averbacao: "ATM-45678917", notasFiscais: ["NF-45218"], ufOrigem: "SC", ufDestino: "SC", cidadeOrigem: "Joinville", cidadeDestino: "Blumenau" },
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
