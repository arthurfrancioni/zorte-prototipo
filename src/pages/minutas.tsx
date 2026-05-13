import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { ClipboardList, Plus, AlertCircle, Package, Truck, Eye } from "lucide-react";
import { minutas, motoristas, veiculos, Minuta, MinutaTipo, MinutaStatus } from "@/lib/mock-data";
import { useProfile } from "@/lib/profile-context";
import { formatDateTime } from "@/lib/utils";
import { cn } from "@/lib/utils";

const TIPO_LABEL: Record<MinutaTipo, string> = {
  amostra: "Amostra",
  equipamento: "Equipamento",
  devolucao: "Devolução",
};

const TIPO_COLOR: Record<MinutaTipo, string> = {
  amostra: "bg-sky-100 text-sky-800",
  equipamento: "bg-violet-100 text-violet-800",
  devolucao: "bg-amber-100 text-amber-800",
};

export function Minutas() {
  const { capabilities } = useProfile();
  const canEdit = capabilities.canEdit("minutas");
  const [list, setList] = useState<Minuta[]>(minutas);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    tipo: "amostra" as MinutaTipo,
    origem: "RS · Nova Santa Rita",
    destino: "",
    motoristaId: "m1",
    veiculoId: "v1",
    pesoKg: 0,
    observacao: "",
    solicitante: "Comercial RS",
  });
  const [details, setDetails] = useState<Minuta | null>(null);

  const totais = useMemo(() => ({
    ativas: list.filter(m => m.status === "em_transito").length,
    entregues: list.filter(m => m.status === "entregue").length,
    mesPeso: list.reduce((s, m) => s + m.pesoKg, 0),
  }), [list]);

  const proximoNumero = useMemo(() => {
    const ids = list.map(m => parseInt(m.numero.split("-").pop() || "0"));
    const max = Math.max(...ids, 0);
    return `MIN-2026-${String(max + 1).padStart(4, "0")}`;
  }, [list]);

  const criar = () => {
    if (!form.destino || form.pesoKg <= 0) return;
    const nova: Minuta = {
      id: `min${Date.now()}`,
      numero: proximoNumero,
      tipo: form.tipo,
      origem: form.origem,
      destino: form.destino,
      motoristaId: form.motoristaId,
      veiculoId: form.veiculoId,
      pesoKg: form.pesoKg,
      observacao: form.observacao,
      status: "em_transito" as MinutaStatus,
      dataEmissao: new Date().toISOString(),
      solicitante: form.solicitante,
    };
    setList(prev => [nova, ...prev]);
    setDialogOpen(false);
    setForm({ tipo: "amostra", origem: "RS · Nova Santa Rita", destino: "", motoristaId: "m1", veiculoId: "v1", pesoKg: 0, observacao: "", solicitante: "Comercial RS" });
  };

  return (
    <div>
      <PageHeader
        title="Minutas"
        description="Controle interno de viagens sem emissão fiscal — amostras, equipamentos e devoluções"
        badge={{ label: "Não-fiscal", variant: "phase3" }}
        actions={
          <Button
            size="sm"
            onClick={() => setDialogOpen(true)}
            disabled={!canEdit}
            title={!canEdit ? "Somente leitura neste perfil" : undefined}
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            Nova Minuta
          </Button>
        }
      />

      <Card className="p-4 mb-6 bg-amber-50 border-amber-200 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-semibold text-amber-900">Minuta é documento interno — não substitui CT-e/NF-e</p>
          <p className="text-amber-800 text-xs mt-1">
            Usada para registrar viagens de amostras, equipamentos e devoluções que não geram obrigação tributária.
            Controla motorista, placa e peso, mas não é escriturada fiscalmente. O fluxo foi confirmado com o time
            da Dorfketal e será detalhado na 2ª agenda comercial.
          </p>
        </div>
      </Card>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <StatCard label="Minutas em trânsito" value={totais.ativas} icon={Truck} iconColor="amber" />
        <StatCard label="Entregues" value={totais.entregues} icon={Package} iconColor="emerald" />
        <StatCard label="Peso controlado (kg)" value={totais.mesPeso.toLocaleString("pt-BR")} subtitle="Somatório de todas as minutas" icon={ClipboardList} iconColor="violet" />
      </div>

      <Card>
        <div className="p-5 border-b">
          <h3 className="text-sm font-semibold">Minutas emitidas</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{list.length} registros · numeração interna</p>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Número</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Origem → Destino</TableHead>
              <TableHead>Motorista / Placa</TableHead>
              <TableHead className="text-right">Peso</TableHead>
              <TableHead>Emissão</TableHead>
              <TableHead>Status</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {list.map(m => {
              const motorista = motoristas.find(mm => mm.id === m.motoristaId);
              const veiculo = veiculos.find(vv => vv.id === m.veiculoId);
              return (
                <TableRow key={m.id}>
                  <TableCell className="font-mono text-amber-700 font-medium">{m.numero}</TableCell>
                  <TableCell>
                    <span className={cn("inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium", TIPO_COLOR[m.tipo])}>
                      {TIPO_LABEL[m.tipo]}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs">
                    <div className="text-slate-700">{m.origem}</div>
                    <div className="text-muted-foreground">→ {m.destino}</div>
                  </TableCell>
                  <TableCell className="text-xs">
                    <div>{motorista?.nome ?? "—"}</div>
                    <div className="font-mono text-muted-foreground">{veiculo?.placa ?? "—"}</div>
                  </TableCell>
                  <TableCell className="text-right font-medium">{m.pesoKg.toLocaleString("pt-BR")} kg</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{formatDateTime(m.dataEmissao)}</TableCell>
                  <TableCell><StatusBadge status={m.status} /></TableCell>
                  <TableCell>
                    <Button size="sm" variant="ghost" onClick={() => setDetails(m)}>
                      <Eye className="w-3.5 h-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Nova minuta</DialogTitle>
            <DialogDescription>
              Próximo número: <span className="font-mono font-semibold text-amber-700">{proximoNumero}</span>
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Label className="text-xs">Tipo *</Label>
              <Select value={form.tipo} onValueChange={v => setForm(f => ({ ...f, tipo: v as MinutaTipo }))}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="amostra">Amostra</SelectItem>
                  <SelectItem value="equipamento">Equipamento</SelectItem>
                  <SelectItem value="devolucao">Devolução</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Origem</Label>
              <Input value={form.origem} onChange={e => setForm(f => ({ ...f, origem: e.target.value }))} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Destino *</Label>
              <Input value={form.destino} onChange={e => setForm(f => ({ ...f, destino: e.target.value }))} placeholder="Campinas/SP" className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Motorista</Label>
              <Select value={form.motoristaId} onValueChange={v => setForm(f => ({ ...f, motoristaId: v }))}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {motoristas.filter(m => m.ativo).map(m => (
                    <SelectItem key={m.id} value={m.id}>{m.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Veículo</Label>
              <Select value={form.veiculoId} onValueChange={v => setForm(f => ({ ...f, veiculoId: v }))}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {veiculos.map(v => (
                    <SelectItem key={v.id} value={v.id}>{v.placa} · {v.tipo}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Peso (kg) *</Label>
              <Input type="number" min={0} value={form.pesoKg || ""} onChange={e => setForm(f => ({ ...f, pesoKg: Number(e.target.value) }))} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Solicitante</Label>
              <Input value={form.solicitante} onChange={e => setForm(f => ({ ...f, solicitante: e.target.value }))} className="mt-1" />
            </div>
            <div className="col-span-2">
              <Label className="text-xs">Observação</Label>
              <Textarea value={form.observacao} onChange={e => setForm(f => ({ ...f, observacao: e.target.value }))} placeholder="Descreva o conteúdo ou o motivo da minuta..." className="mt-1" />
            </div>
          </div>

          <div className="flex gap-2 mt-2">
            <Button variant="outline" className="flex-1" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button className="flex-1" onClick={criar} disabled={!form.destino || form.pesoKg <= 0}>
              Criar minuta
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!details} onOpenChange={() => setDetails(null)}>
        <DialogContent className="max-w-lg">
          {details && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2">
                  <DialogTitle className="font-mono">{details.numero}</DialogTitle>
                  <Badge variant="warning" className="text-[10px]">Não-fiscal</Badge>
                </div>
              </DialogHeader>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Tipo</span><span className="font-medium">{TIPO_LABEL[details.tipo]}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Origem</span><span>{details.origem}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Destino</span><span>{details.destino}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Motorista</span><span>{motoristas.find(m => m.id === details.motoristaId)?.nome ?? "—"}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Placa</span><span className="font-mono">{veiculos.find(v => v.id === details.veiculoId)?.placa ?? "—"}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Peso</span><span className="font-medium">{details.pesoKg.toLocaleString("pt-BR")} kg</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Solicitante</span><span>{details.solicitante}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Emissão</span><span>{formatDateTime(details.dataEmissao)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Status</span><StatusBadge status={details.status} /></div>
                {details.observacao && (
                  <div className="bg-slate-50 rounded p-3 text-xs">
                    <p className="text-muted-foreground mb-1">Observação</p>
                    <p>{details.observacao}</p>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
