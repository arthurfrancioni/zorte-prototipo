import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Smartphone, Camera, MapPin, WifiOff, CheckCircle2, Clock, AlertCircle, Eye } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/shared/stat-card";

export function AppMotorista() {
  return (
    <div>
      <PageHeader
        title="App Motorista"
        description="Aplicativo offline-first com georreferenciamento real no momento da foto"
        badge={{ label: "Fase 2", variant: "phase2" }}
      />

      <div className="grid grid-cols-[1fr_340px] gap-6">
        <div className="space-y-4">
          <Card className="p-5">
            <h3 className="text-sm font-semibold mb-4">Como resolve a dor reportada</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="border rounded-lg p-4 bg-rose-50 border-rose-200">
                <p className="text-xs font-semibold text-rose-800 uppercase tracking-wider mb-2">Problema atual</p>
                <p className="text-sm text-rose-900 mb-2">Motorista entrega sem sinal, bate foto em casa ou no posto.</p>
                <p className="text-xs text-rose-700">→ Georreferenciamento aponta o posto, não o cliente. Comprovação inválida.</p>
              </div>
              <div className="border rounded-lg p-4 bg-emerald-50 border-emerald-200">
                <p className="text-xs font-semibold text-emerald-800 uppercase tracking-wider mb-2">Solução Zorte</p>
                <p className="text-sm text-emerald-900 mb-2">App grava GPS no ato do clique da foto, mesmo offline.</p>
                <p className="text-xs text-emerald-700">→ Upload sobe depois preservando horário e coordenadas originais.</p>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-3 gap-4">
            <StatCard label="Entregas hoje" value={18} icon={CheckCircle2} iconColor="emerald" />
            <StatCard label="Pendentes sync" value={3} subtitle="Sem internet no local" icon={WifiOff} iconColor="amber" />
            <StatCard label="Motoristas online" value={4} subtitle="de 6 ativos" icon={Smartphone} iconColor="blue" />
          </div>

          <Card>
            <div className="p-5 border-b">
              <h3 className="text-sm font-semibold">Entregas recentes do app</h3>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>CT-e</TableHead>
                  <TableHead>Motorista</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Hora entrega</TableHead>
                  <TableHead>GPS</TableHead>
                  <TableHead>Upload</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-mono text-xs text-blue-600">CTE-233</TableCell>
                  <TableCell>Antônio Silva</TableCell>
                  <TableCell>Agroterra SC</TableCell>
                  <TableCell className="text-xs">16/04 · 14:32</TableCell>
                  <TableCell><Badge variant="success"><MapPin className="w-3 h-3 mr-1" />Preciso</Badge></TableCell>
                  <TableCell className="text-xs">Imediato</TableCell>
                  <TableCell><StatusBadgeWrap>Entregue</StatusBadgeWrap></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-mono text-xs text-blue-600">CTE-234</TableCell>
                  <TableCell>Carlos Santos</TableCell>
                  <TableCell>Primo Tedesco</TableCell>
                  <TableCell className="text-xs">16/04 · 15:18</TableCell>
                  <TableCell><Badge variant="success"><MapPin className="w-3 h-3 mr-1" />Preciso</Badge></TableCell>
                  <TableCell className="text-xs">Imediato</TableCell>
                  <TableCell><StatusBadgeWrap>Entregue</StatusBadgeWrap></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-mono text-xs text-blue-600">CTE-235</TableCell>
                  <TableCell>Carlos Santos</TableCell>
                  <TableCell>Fernando CSA</TableCell>
                  <TableCell className="text-xs">16/04 · 16:05</TableCell>
                  <TableCell><Badge variant="warning"><WifiOff className="w-3 h-3 mr-1" />Offline · subindo</Badge></TableCell>
                  <TableCell className="text-xs text-amber-600">Pendente</TableCell>
                  <TableCell><StatusBadgeWrap>Entregue</StatusBadgeWrap></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-mono text-xs text-blue-600">CTE-236</TableCell>
                  <TableCell>Carlos Santos</TableCell>
                  <TableCell>Zanzalog</TableCell>
                  <TableCell className="text-xs">16/04 · 17:22</TableCell>
                  <TableCell className="text-muted-foreground text-xs">—</TableCell>
                  <TableCell className="text-xs">—</TableCell>
                  <TableCell><Badge variant="warning">Em trânsito</Badge></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Card>
        </div>

        {/* Mockup mobile */}
        <div className="sticky top-6">
          <Card className="p-4 bg-slate-100">
            <p className="text-xs text-muted-foreground text-center mb-3">Preview do app do motorista</p>
            <div className="mx-auto w-full max-w-[280px] bg-black rounded-[32px] p-2.5 shadow-xl">
              <div className="bg-white rounded-[24px] overflow-hidden" style={{ aspectRatio: "9/19" }}>
                {/* status bar */}
                <div className="bg-slate-900 text-white px-4 py-1.5 flex items-center justify-between text-[10px]">
                  <span>14:32</span>
                  <div className="flex items-center gap-1"><WifiOff className="w-2.5 h-2.5" /><span>Offline</span></div>
                </div>
                {/* header */}
                <div className="bg-primary text-primary-foreground p-3">
                  <p className="text-[10px] opacity-80">Motorista</p>
                  <p className="text-sm font-semibold">Carlos Santos</p>
                  <p className="text-[10px] opacity-80 mt-1">Carga CRG-2026-0018</p>
                </div>
                {/* content */}
                <div className="p-3 space-y-2 text-[11px]">
                  <p className="font-medium text-xs">Entrega #2 de 3</p>
                  <div className="border rounded-lg p-2.5 bg-slate-50">
                    <p className="font-medium">Primo Tedesco</p>
                    <p className="text-muted-foreground">Ribeirão Preto/SP</p>
                    <p className="font-mono text-[10px] text-blue-600 mt-1">NF-45231 · 620 kg</p>
                  </div>
                  <div className="border rounded-lg overflow-hidden">
                    <div className="bg-slate-200 h-24 flex items-center justify-center">
                      <Camera className="w-8 h-8 text-slate-500" />
                    </div>
                    <div className="p-2 text-[10px] text-muted-foreground">
                      <div className="flex items-center gap-1"><MapPin className="w-2.5 h-2.5" />-21.1775, -47.8208</div>
                      <div>Capturado às 14:32 · ±5m</div>
                    </div>
                  </div>
                  <button className="w-full bg-emerald-600 text-white rounded-md py-2 text-[11px] font-medium">Confirmar entrega</button>
                  <button className="w-full bg-rose-50 text-rose-700 rounded-md py-2 text-[11px] font-medium">Reportar ocorrência</button>
                </div>
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground text-center mt-3">3 entregas prontas para upload quando recuperar sinal</p>
          </Card>
        </div>
      </div>
    </div>
  );
}

function StatusBadgeWrap({ children }: { children: React.ReactNode }) {
  return <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-100 text-emerald-800">{children}</span>;
}

export function Ocorrencias() {
  const ocs = [
    { id: 1, cte: "CTE-00230", cliente: "Loja Central LTDA", tipo: "Recusa parcial", data: "15/04 · 11:20", motorista: "José Henrique", status: "aberto", obs: "Cliente recusou 2 dos 5 volumes por avaria na embalagem externa." },
    { id: 2, cte: "CTE-00228", cliente: "Rede Mais Saúde", tipo: "Endereço inexistente", data: "15/04 · 09:45", motorista: "Antônio Silva", status: "resolvido", obs: "CEP alterado. Entrega concluída no endereço correto." },
    { id: 3, cte: "CTE-00225", cliente: "Supermercado Bom Preço", tipo: "Atraso entrega", data: "14/04 · 17:12", motorista: "Carlos Santos", status: "resolvido", obs: "Atraso de 2h30 por acidente na BR-101." },
    { id: 4, cte: "CTE-00222", cliente: "Quimex BA", tipo: "Divergência nota", data: "14/04 · 10:30", motorista: "Roberto Mendes", status: "aberto", obs: "Quantidade conferida menor que a NF. Aguardando conferência do faturamento." },
  ];

  return (
    <div>
      <PageHeader
        title="Gestão de Ocorrências"
        description="Ocorrências reportadas via app do motorista e pelo time operacional"
        badge={{ label: "Fase 2", variant: "phase2" }}
      />

      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard label="Abertas" value={ocs.filter(o => o.status === "aberto").length} icon={AlertCircle} iconColor="rose" />
        <StatCard label="Resolvidas (7d)" value={ocs.filter(o => o.status === "resolvido").length} icon={CheckCircle2} iconColor="emerald" />
        <StatCard label="Tempo médio resolução" value="3h 12m" icon={Clock} iconColor="amber" />
        <StatCard label="Taxa sucesso entrega" value="97.3%" icon={CheckCircle2} iconColor="blue" />
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>CT-e</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Motorista</TableHead>
              <TableHead>Registrado em</TableHead>
              <TableHead>Observação</TableHead>
              <TableHead>Status</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ocs.map(o => (
              <TableRow key={o.id}>
                <TableCell className="font-mono text-xs text-blue-600">{o.cte}</TableCell>
                <TableCell className="font-medium">{o.cliente}</TableCell>
                <TableCell>{o.tipo}</TableCell>
                <TableCell className="text-sm">{o.motorista}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{o.data}</TableCell>
                <TableCell className="text-xs max-w-md truncate">{o.obs}</TableCell>
                <TableCell>
                  {o.status === "aberto" ? <Badge variant="destructive">Aberta</Badge> : <Badge variant="success">Resolvida</Badge>}
                </TableCell>
                <TableCell><Button size="sm" variant="ghost"><Eye className="w-3.5 h-3.5" /></Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
