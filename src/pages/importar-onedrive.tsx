import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/layout/page-header";
import { CheckCircle2, RefreshCw, FileSpreadsheet, Settings2, Link2 } from "lucide-react";
import { pedidos } from "@/lib/mock-data";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatDateTime } from "@/lib/utils";

export function ImportarTeams() {
  const [lastSync, setLastSync] = useState(new Date());
  const [count, setCount] = useState(60);
  const [syncing, setSyncing] = useState(false);

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

  return (
    <div>
      <PageHeader
        title="Importar Dados — Teams"
        description="Integração em tempo real com a planilha da indústria no Microsoft Teams"
        badge={{ label: "Fase 1", variant: "phase1" }}
      />

      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card className="p-5 col-span-2">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-11 h-11 rounded-lg bg-violet-100 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5 text-violet-700" />
            </div>
            <div>
              <p className="text-sm font-semibold">Conexão Microsoft Teams</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className={`w-1.5 h-1.5 rounded-full ${syncing ? "bg-amber-500 animate-pulse" : "bg-emerald-500"}`}></div>
                <p className="text-xs text-muted-foreground">{syncing ? "Sincronizando..." : `Conectado · próxima sincronização em ${count}s`}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <Label className="text-xs text-muted-foreground">Workspace Teams</Label>
              <p className="text-sm font-medium mt-1">Transportadora Cativa</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Arquivo origem</Label>
              <p className="text-sm font-medium mt-1">📊 Pedidos_Logistica.xlsx</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Intervalo de sincronização</Label>
              <p className="text-sm font-medium mt-1">1 minuto</p>
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
            {[
              ["Ordem de Compra", "oc"],
              ["Cliente", "cliente"],
              ["Peso Bruto", "pesoBruto"],
              ["Prazo", "prazo"],
              ["Status", "status"],
              ["Origem Liberação", "origemLiberacao"],
            ].map(([k, v]) => (
              <div key={v} className="flex items-center justify-between text-xs">
                <span className="text-slate-700">{k}</span>
                <div className="flex items-center gap-1 text-muted-foreground"><Link2 className="w-3 h-3" /><span className="font-mono">{v}</span></div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="p-5 mb-6">
        <p className="text-xs text-muted-foreground font-medium mb-3">CONFIGURAÇÃO</p>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label className="text-xs">Planilha de Pedidos</Label>
            <Select defaultValue="pedidos">
              <SelectTrigger className="mt-1 h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="pedidos">Pedidos_Logistica.xlsx</SelectItem>
                <SelectItem value="transf">Transferencias.xlsx</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Autenticação</Label>
            <Input disabled defaultValue="OAuth · MSTeams Corporate" className="mt-1" />
          </div>
          <div>
            <Label className="text-xs">Aba/Sheet</Label>
            <Input disabled defaultValue="Pedidos Ativos" className="mt-1" />
          </div>
        </div>
      </Card>

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
    </div>
  );
}
