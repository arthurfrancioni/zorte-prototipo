import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/layout/page-header";
import { CheckCircle2, RefreshCw, FileSpreadsheet, Settings2, Link2, MapPin, Calendar } from "lucide-react";
import { pedidos, coletasRJ } from "@/lib/mock-data";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatDateTime } from "@/lib/utils";

type Modelo = "pedidos" | "transferencias" | "coletas_rj";

const MODELO_CONFIG: Record<Modelo, { label: string; arquivo: string; intervalo: string; mapeamento: [string, string][] }> = {
  pedidos: {
    label: "Pedidos",
    arquivo: "Pedidos_Logistica.xlsx",
    intervalo: "1 minuto",
    mapeamento: [
      ["Ordem de Compra", "oc"],
      ["Cliente", "cliente"],
      ["Peso Bruto", "pesoBruto"],
      ["Prazo", "prazo"],
      ["Status", "status"],
      ["Origem Liberação", "origemLiberacao"],
    ],
  },
  transferencias: {
    label: "Transferências",
    arquivo: "Transferencias_Filiais.xlsx",
    intervalo: "5 minutos",
    mapeamento: [
      ["Filial Origem", "filialOrigem"],
      ["Filial Destino", "filialDestino"],
      ["Matéria-Prima", "produto"],
      ["Qtd / Volume", "quantidade"],
      ["Peso", "pesoBruto"],
      ["Data Transf.", "prazo"],
      ["NF Transferência", "notaFiscal"],
    ],
  },
  coletas_rj: {
    label: "Coletas RJ",
    arquivo: "Coletas_RJ.xlsx",
    intervalo: "Tempo real",
    mapeamento: [
      ["Data Coleta", "data"],
      ["Janela (Manhã/Tarde)", "janela"],
      ["Remetente", "remetenteNome"],
      ["Endereço Coleta", "remetenteEndereco"],
      ["Produto", "produto"],
      ["Peso", "pesoKg"],
      ["Cliente Destino", "clienteDestino"],
      ["Urgência", "urgencia"],
    ],
  },
};

export function ImportarOneDrive() {
  const [lastSync, setLastSync] = useState(new Date());
  const [count, setCount] = useState(60);
  const [syncing, setSyncing] = useState(false);
  const [modelo, setModelo] = useState<Modelo>("pedidos");

  useEffect(() => {
    const interval = setInterval(() => {
      setCount(c => {
        if (c <= 1) {
          setSyncing(true);
          setTimeout(() => { setLastSync(new Date()); setSyncing(false); }, 1500);
          return 60;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const cfg = MODELO_CONFIG[modelo];

  return (
    <div>
      <PageHeader
        title="Importar Dados — OneDrive"
        description="Integração em tempo real com diferentes planilhas da indústria no Microsoft OneDrive"
        badge={{ label: "Fase 1", variant: "phase1" }}
      />

      <Tabs value={modelo} onValueChange={(v) => setModelo(v as Modelo)} className="space-y-4">
        <TabsList>
          <TabsTrigger value="pedidos">Pedidos</TabsTrigger>
          <TabsTrigger value="transferencias">Transferências</TabsTrigger>
          <TabsTrigger value="coletas_rj">Coletas RJ</TabsTrigger>
        </TabsList>

        <TabsContent value="pedidos" className="space-y-4">
          <CabecalhoConexao syncing={syncing} count={count} lastSync={lastSync} cfg={cfg} />
          <TabelaConfiguracao />
          <Card>
            <div className="p-5 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold">Últimos pedidos capturados</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Leitura contínua da planilha · {pedidos.length} pedidos sincronizados</p>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-emerald-600">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Tudo atualizado</span>
                </div>
              </div>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>OC</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Origem</TableHead>
                  <TableHead>Destino</TableHead>
                  <TableHead className="text-right">Peso</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Capturado em</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pedidos.slice(0, 8).map(p => (
                  <TableRow key={p.id}>
                    <TableCell className="font-mono text-blue-600">{p.oc}</TableCell>
                    <TableCell className="font-medium">{p.cliente}</TableCell>
                    <TableCell className="text-sm">{p.origemLiberacao}</TableCell>
                    <TableCell>{p.cidade}/{p.uf}</TableCell>
                    <TableCell className="text-right">{p.pesoBruto} kg</TableCell>
                    <TableCell><StatusBadge status={p.status} /></TableCell>
                    <TableCell className="text-xs text-muted-foreground">{formatDateTime(p.dataEntrada + "T09:15:00")}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="transferencias" className="space-y-4">
          <CabecalhoConexao syncing={syncing} count={count} lastSync={lastSync} cfg={cfg} />
          <Card className="p-4 bg-blue-50 border-blue-200 text-xs text-blue-900">
            <p className="font-semibold">Mesma lógica da planilha de Pedidos, com ajuste de nomenclaturas</p>
            <p className="mt-1">Transferências entre filiais substituem cliente/OC por filial origem/destino e acrescentam NF de transferência e lote de matéria-prima.</p>
          </Card>
          <PreviewTransferencias />
        </TabsContent>

        <TabsContent value="coletas_rj" className="space-y-4">
          <CabecalhoConexao syncing={syncing} count={count} lastSync={lastSync} cfg={cfg} />
          <Card className="p-4 bg-amber-50 border-amber-200 text-xs text-amber-900">
            <p className="font-semibold flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />Visão separada para o RJ</p>
            <p className="mt-1">Como se trata de programação diária com múltiplas cargas, as coletas do Rio de Janeiro são lidas em sincronização mais frequente e têm uma <strong>tela dedicada</strong> em <span className="font-mono">/coletas-rj</span>.</p>
          </Card>
          <Card>
            <div className="p-5 border-b">
              <h3 className="text-sm font-semibold">Últimas coletas capturadas</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{coletasRJ.length} coletas sincronizadas nos últimos 3 dias</p>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Hora</TableHead>
                  <TableHead>Remetente</TableHead>
                  <TableHead>Destino</TableHead>
                  <TableHead className="text-right">Peso</TableHead>
                  <TableHead>Urgência</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {coletasRJ.slice(0, 8).map(c => (
                  <TableRow key={c.id}>
                    <TableCell className="text-xs">{new Date(c.data + "T00:00:00").toLocaleDateString("pt-BR")}</TableCell>
                    <TableCell className="font-mono text-xs">{c.horaPrevista}</TableCell>
                    <TableCell className="text-sm font-medium">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-muted-foreground" />
                        {c.remetenteNome}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{c.clienteDestino} · {c.destinoUF}</TableCell>
                    <TableCell className="text-right">{c.pesoKg.toLocaleString("pt-BR")} kg</TableCell>
                    <TableCell>
                      {c.urgencia === "urgente" ? (
                        <Badge variant="destructive" className="text-[10px]">Urgente</Badge>
                      ) : (
                        <Badge variant="muted" className="text-[10px]">Normal</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function CabecalhoConexao({
  syncing, count, lastSync, cfg,
}: { syncing: boolean; count: number; lastSync: Date; cfg: typeof MODELO_CONFIG[Modelo] }) {
  return (
    <div className="grid grid-cols-3 gap-4">
      <Card className="p-5 col-span-2">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-lg bg-violet-100 flex items-center justify-center">
            <FileSpreadsheet className="w-5 h-5 text-violet-700" />
          </div>
          <div>
            <p className="text-sm font-semibold">Conexão Microsoft OneDrive · {cfg.label}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className={`w-1.5 h-1.5 rounded-full ${syncing ? "bg-amber-500 animate-pulse" : "bg-emerald-500"}`}></div>
              <p className="text-xs text-muted-foreground">{syncing ? "Sincronizando..." : `Conectado · próxima sincronização em ${count}s`}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <Label className="text-xs text-muted-foreground">Pasta OneDrive</Label>
            <p className="text-sm font-medium mt-1">Transportadora Cativa</p>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Arquivo origem</Label>
            <p className="text-sm font-medium mt-1">📊 {cfg.arquivo}</p>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Intervalo de sincronização</Label>
            <p className="text-sm font-medium mt-1">{cfg.intervalo}</p>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Última sincronização</Label>
            <p className="text-sm font-medium mt-1">{formatDateTime(lastSync.toISOString())}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button size="sm" variant="outline"><Settings2 className="w-3.5 h-3.5 mr-1.5" />Mapeamento de colunas</Button>
          <Button size="sm" variant="outline"><RefreshCw className="w-3.5 h-3.5 mr-1.5" />Sincronizar agora</Button>
        </div>
      </Card>

      <Card className="p-5">
        <p className="text-xs text-muted-foreground font-medium mb-3">MAPEAMENTO ATIVO</p>
        <div className="space-y-2">
          {cfg.mapeamento.map(([k, v]) => (
            <div key={v} className="flex items-center justify-between text-xs">
              <span className="text-slate-700">{k}</span>
              <div className="flex items-center gap-1 text-muted-foreground">
                <Link2 className="w-3 h-3" />
                <span className="font-mono">{v}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function TabelaConfiguracao() {
  return (
    <Card className="p-5">
      <p className="text-xs text-muted-foreground font-medium mb-3">CONFIGURAÇÃO</p>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label className="text-xs">Planilha de Pedidos</Label>
          <Select defaultValue="pedidos">
            <SelectTrigger className="mt-1 h-9"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="pedidos">Pedidos_Logistica.xlsx</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs">Autenticação</Label>
          <Input disabled defaultValue="OAuth · OneDrive Corporate" className="mt-1" />
        </div>
        <div>
          <Label className="text-xs">Aba/Sheet</Label>
          <Input disabled defaultValue="Pedidos Ativos" className="mt-1" />
        </div>
      </div>
    </Card>
  );
}

function PreviewTransferencias() {
  const amostras = [
    { filialOrigem: "RS · Nova Santa Rita", filialDestino: "SC · Joinville", produto: "Matéria-prima Alpha", qtd: "12 IBC", peso: "11 400 kg", data: "2026-04-18", nf: "NF-TR-22841" },
    { filialOrigem: "RS · Nova Santa Rita", filialDestino: "SP · Guarulhos", produto: "Aditivo Beta base", qtd: "8 tambores", peso: "1 840 kg", data: "2026-04-19", nf: "NF-TR-22842" },
    { filialOrigem: "SC · Joinville", filialDestino: "RS · Nova Santa Rita", produto: "Produto acabado Theta", qtd: "4 Big Bags", peso: "2 000 kg", data: "2026-04-20", nf: "NF-TR-22843" },
    { filialOrigem: "SP · Guarulhos", filialDestino: "RJ · Duque de Caxias", produto: "Solvente Delta", qtd: "20 bombonas", peso: "1 000 kg", data: "2026-04-20", nf: "NF-TR-22844" },
  ];
  return (
    <Card>
      <div className="p-5 border-b">
        <h3 className="text-sm font-semibold">Últimas transferências entre filiais</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Dados capturados da planilha Transferencias_Filiais.xlsx</p>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>NF Transf.</TableHead>
            <TableHead>Origem</TableHead>
            <TableHead>Destino</TableHead>
            <TableHead>Matéria-prima</TableHead>
            <TableHead>Qtd</TableHead>
            <TableHead className="text-right">Peso</TableHead>
            <TableHead>Data</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {amostras.map(a => (
            <TableRow key={a.nf}>
              <TableCell className="font-mono text-blue-600 text-xs">{a.nf}</TableCell>
              <TableCell className="text-sm">{a.filialOrigem}</TableCell>
              <TableCell className="text-sm">{a.filialDestino}</TableCell>
              <TableCell className="font-medium">{a.produto}</TableCell>
              <TableCell className="text-xs text-muted-foreground">{a.qtd}</TableCell>
              <TableCell className="text-right">{a.peso}</TableCell>
              <TableCell className="text-xs">{new Date(a.data + "T00:00:00").toLocaleDateString("pt-BR")}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
