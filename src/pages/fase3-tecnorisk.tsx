import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Shield, AlertTriangle, CheckCircle2, Clock, Settings2, FileKey } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { motoristas, veiculos, cargas } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";

export function TecnoRisk() {
  const solicitacoes = cargas.map(c => {
    const m = motoristas.find(mm => mm.id === c.motoristaId)!;
    const v = veiculos.find(vv => vv.id === c.veiculoId)!;
    return {
      carga: c.numero,
      mdfe: c.mdfe,
      placa: v.placa,
      motorista: m.nome,
      cpf: m.cpf,
      telefone: m.telefone,
      valorTotal: c.valorTotal,
      codigoMonit: c.mdfe ? `MON-${c.numero.slice(-4)}` : null,
      status: c.status === "finalizada" ? "concluida" : c.status === "em_transito" ? "aprovada" : "pendente",
    };
  });

  return (
    <div>
      <PageHeader
        title="Integração TecnoRisk"
        description="Solicitação automática de monitoramento no momento do MDF-e"
        badge={{ label: "Fase 3", variant: "phase3" }}
        actions={<Button size="sm" variant="outline"><Settings2 className="w-3.5 h-3.5 mr-1.5" />Configurar API</Button>}
      />

      <Card className="p-5 mb-6 border-amber-200 bg-amber-50/40">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-amber-700" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-900">Fase 3 · Condicional à API TecnoRisk</p>
            <p className="text-xs text-amber-800 mt-1">
              Esta integração depende da documentação da API que será disponibilizada pela TecnoRisk.
              A tela abaixo demonstra o fluxo previsto: envio automático de placa do cavalo, carreta,
              CPF e telefone do motorista e soma dos manifestos no ato da emissão do MDF-e.
            </p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard label="Solicitações do dia" value={solicitacoes.length} icon={Shield} iconColor="amber" />
        <StatCard label="Aprovadas" value={solicitacoes.filter(s => s.status === "aprovada").length} icon={CheckCircle2} iconColor="emerald" />
        <StatCard label="Pendentes" value={solicitacoes.filter(s => s.status === "pendente").length} icon={Clock} iconColor="blue" />
        <StatCard label="Integração" value="OK" subtitle="Simulação · API mockada" icon={FileKey} iconColor="violet" />
      </div>

      <Card className="mb-6">
        <div className="p-5 border-b">
          <h3 className="text-sm font-semibold">Solicitações de monitoramento</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Enviadas automaticamente ao emitir o MDF-e</p>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código monit.</TableHead>
              <TableHead>Carga</TableHead>
              <TableHead>MDF-e</TableHead>
              <TableHead>Placa</TableHead>
              <TableHead>Motorista</TableHead>
              <TableHead>CPF</TableHead>
              <TableHead className="text-right">Valor</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {solicitacoes.map((s, i) => (
              <TableRow key={i}>
                <TableCell className="font-mono text-blue-600 font-medium">{s.codigoMonit ?? "—"}</TableCell>
                <TableCell className="font-mono text-xs">{s.carga}</TableCell>
                <TableCell className="font-mono text-xs">{s.mdfe}</TableCell>
                <TableCell className="font-mono font-medium">{s.placa}</TableCell>
                <TableCell>{s.motorista}</TableCell>
                <TableCell className="font-mono text-xs">{s.cpf}</TableCell>
                <TableCell className="text-right font-medium">{formatCurrency(s.valorTotal)}</TableCell>
                <TableCell>
                  {s.status === "aprovada" && <Badge variant="success">Aprovada</Badge>}
                  {s.status === "concluida" && <Badge variant="info">Concluída</Badge>}
                  {s.status === "pendente" && <Badge variant="warning">Pendente</Badge>}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Card className="p-5">
        <p className="text-xs text-muted-foreground font-medium mb-3">PAYLOAD ENVIADO À TECNORISK</p>
        <pre className="bg-slate-950 text-slate-100 p-4 rounded-md text-[11px] overflow-x-auto font-mono">
{`POST https://api.tecnorisk.com.br/v1/monitoramento
Authorization: Bearer ****

{
  "empresa_id": "ZORTE-001",
  "carga": "CRG-2026-0018",
  "mdfe": "MDFE-2026-0018",
  "veiculo": {
    "placa_cavalo": "DEF-4G56",
    "placa_carreta": null
  },
  "motorista": {
    "nome": "Carlos Santos",
    "cpf": "123.456.789-00",
    "telefone": "(51) 99876-5432",
    "cnh": "12345678900"
  },
  "rota": {
    "origem": { "uf": "RS", "cidade": "Nova Santa Rita" },
    "destinos": [
      { "uf": "SP", "cidade": "Ribeirão Preto" },
      { "uf": "SP", "cidade": "Campinas" },
      { "uf": "SP", "cidade": "Santos" }
    ]
  },
  "valor_total_manifestos": 8770.00
}`}
        </pre>
      </Card>
    </div>
  );
}
