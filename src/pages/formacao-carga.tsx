import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PageHeader } from "@/components/layout/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Package, Plus, MapPin, Truck, Mail, AlertCircle, Sparkles, CheckCircle2 } from "lucide-react";
import { pedidos, motoristas, veiculos, gruposEmail } from "@/lib/mock-data";
import { formatCurrency, cn } from "@/lib/utils";

export function FormacaoCarga() {
  const pendentes = pedidos.filter(p => p.status === "liberado" || p.status === "programado" || p.status === "recebido");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [motoristaId, setMotoristaId] = useState("m1");
  const [veiculoId, setVeiculoId] = useState("v1");
  const [grupos, setGrupos] = useState<Set<string>>(new Set(["g1", "g4"]));
  const [data, setData] = useState("2026-04-17");
  const [hora, setHora] = useState("07:30");
  const [obs, setObs] = useState("");
  const [confirmado, setConfirmado] = useState(false);

  const veiculo = veiculos.find(v => v.id === veiculoId);
  const totais = useMemo(() => {
    const selecionados = pendentes.filter(p => selected.has(p.id));
    return {
      qtd: selecionados.length,
      peso: selecionados.reduce((s, p) => s + p.pesoBruto, 0),
      valor: selecionados.reduce((s, p) => s + p.valor, 0),
    };
  }, [selected, pendentes]);

  const capacidade = veiculo?.capacidadeKg ?? 30000;
  const ocupacao = Math.min(100, (totais.peso / capacidade) * 100);
  const destinos = [...new Set(pendentes.filter(p => selected.has(p.id)).map(p => `${p.cidade}/${p.uf}`))];

  const toggle = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleGrupo = (id: string) => {
    setGrupos(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const formar = () => {
    if (totais.qtd === 0) return;
    setConfirmado(true);
  };

  const resetar = () => {
    setConfirmado(false);
    setSelected(new Set());
  };

  return (
    <div>
      <PageHeader
        title="Formação de Carga"
        description="Selecione pedidos pendentes e componha a carga com motorista, placa e destinatários da comunicação"
        badge={{ label: "Fase 1", variant: "phase1" }}
        actions={<Button size="sm" variant="outline"><Sparkles className="w-3.5 h-3.5 mr-1.5" />Sugestão automática (Fase 4)</Button>}
      />

      <div className="grid grid-cols-[1fr_420px] gap-4">
        <div className="space-y-4">
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold">1. Selecionar pedidos pendentes</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {totais.qtd} de {pendentes.length} selecionados
                </p>
              </div>
              <Button size="sm" variant="outline"><Plus className="w-3.5 h-3.5 mr-1.5" />Adicionar manual</Button>
            </div>

            <div className="space-y-2 max-h-[560px] overflow-y-auto pr-1">
              {pendentes.map(p => {
                const isSelected = selected.has(p.id);
                return (
                  <label
                    key={p.id}
                    className={cn(
                      "flex items-start gap-3 p-3 rounded-md border cursor-pointer transition-colors",
                      isSelected ? "bg-blue-50 border-blue-300" : "border-slate-200 hover:bg-slate-50"
                    )}
                  >
                    <Checkbox checked={isSelected} onCheckedChange={() => toggle(p.id)} className="mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-mono text-xs text-blue-600 font-medium">{p.oc}</span>
                        <span className="text-sm font-medium">{p.cliente}</span>
                        <StatusBadge status={p.status} />
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{p.cidade}/{p.uf}</span>
                        <span>{p.pesoBruto} kg</span>
                        <span>{formatCurrency(p.valor)}</span>
                        <span className="ml-auto">Prazo: {new Date(p.prazo).toLocaleDateString("pt-BR")}</span>
                      </div>
                      {p.observacao && (
                        <p className="text-[11px] text-amber-700 mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />{p.observacao}
                        </p>
                      )}
                    </div>
                  </label>
                );
              })}
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="p-5">
            <h3 className="text-sm font-semibold mb-4">2. Dados da carga</h3>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <Label className="text-xs">Data de saída *</Label>
                <Input type="date" value={data} onChange={e => setData(e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">Horário *</Label>
                <Input type="time" value={hora} onChange={e => setHora(e.target.value)} className="mt-1" />
              </div>
            </div>

            <div className="mb-3">
              <Label className="text-xs">Motorista *</Label>
              <Select value={motoristaId} onValueChange={setMotoristaId}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {motoristas.filter(m => m.ativo).map(m => (
                    <SelectItem key={m.id} value={m.id}>{m.nome} · CPF {m.cpf}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="mb-3">
              <Label className="text-xs">Veículo / Placa</Label>
              <Select value={veiculoId} onValueChange={setVeiculoId}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {veiculos.map(v => (
                    <SelectItem key={v.id} value={v.id}>{v.placa} · {v.tipo} · {v.capacidadeKg.toLocaleString("pt-BR")} kg</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="mb-3">
              <Label className="text-xs">Transportadora</Label>
              <Input defaultValue="Frota própria" className="mt-1" />
            </div>

            <div className="mb-4">
              <Label className="text-xs">UF de origem</Label>
              <Select defaultValue="RS">
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="RS">RS — Nova Santa Rita</SelectItem>
                  <SelectItem value="SC">SC — Joinville</SelectItem>
                  <SelectItem value="SP">SP — Guarulhos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs flex items-center gap-1"><Mail className="w-3 h-3" />Grupos de notificação</Label>
              <div className="mt-2 space-y-1.5 max-h-44 overflow-y-auto">
                {gruposEmail.map(g => {
                  const active = grupos.has(g.id);
                  return (
                    <label key={g.id} className={cn("flex items-start gap-2 p-2 rounded border cursor-pointer text-xs", active ? "bg-blue-50 border-blue-300" : "border-slate-200 hover:bg-slate-50")}>
                      <Checkbox checked={active} onCheckedChange={() => toggleGrupo(g.id)} className="mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">{g.nome}</p>
                        <p className="text-muted-foreground truncate">{g.emails.length} destinatários</p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="mt-3">
              <Label className="text-xs">Observações</Label>
              <Textarea value={obs} onChange={e => setObs(e.target.value)} placeholder="Observações sobre a carga..." className="mt-1 min-h-[60px]" />
            </div>
          </Card>

          <Card className="p-5 bg-slate-50 border-2 border-dashed">
            <div className="flex items-center gap-2 mb-3">
              <Package className="w-4 h-4 text-slate-600" />
              <p className="text-xs font-semibold text-slate-700">Resumo da carga</p>
            </div>
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Pedidos selecionados</span><span className="font-semibold">{totais.qtd}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Peso total</span><span className="font-semibold">{totais.peso.toLocaleString("pt-BR")} kg</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Valor total</span><span className="font-semibold">{formatCurrency(totais.valor)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Destinos</span><span className="font-semibold">{destinos.length}</span></div>
            </div>
            <div className="mt-3">
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-muted-foreground">Ocupação da carreta ({veiculo?.placa})</span>
                <span className="font-semibold">{ocupacao.toFixed(0)}%</span>
              </div>
              <Progress value={ocupacao} className="h-2" />
              <p className="text-[11px] text-muted-foreground mt-1">Capacidade: {capacidade.toLocaleString("pt-BR")} kg</p>
            </div>
            <Button className="w-full mt-4" disabled={totais.qtd === 0} onClick={formar}>
              <Truck className="w-4 h-4 mr-2" />
              Formar carga e enviar e-mails
            </Button>
            <p className="text-[10px] text-muted-foreground text-center mt-2">
              Ao formar, o sistema cria o identificador único, dispara o e-mail aos {grupos.size} grupo(s) e prepara o casamento XML × Pedido
            </p>
          </Card>
        </div>
      </div>

      <Dialog open={confirmado} onOpenChange={setConfirmado}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-emerald-700" />
              </div>
              <DialogTitle>Carga formada com sucesso</DialogTitle>
            </div>
          </DialogHeader>
          <div className="space-y-3 text-sm">
            <div className="bg-slate-50 rounded-lg p-3 space-y-1">
              <div className="flex justify-between"><span className="text-muted-foreground">Identificador</span><span className="font-mono font-semibold">CRG-2026-0019</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Pedidos</span><span className="font-semibold">{totais.qtd}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Peso total</span><span className="font-semibold">{totais.peso.toLocaleString("pt-BR")} kg</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Valor total</span><span className="font-semibold">{formatCurrency(totais.valor)}</span></div>
            </div>
            <div className="bg-blue-50 rounded-lg p-3 flex items-start gap-2">
              <Mail className="w-4 h-4 text-blue-700 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-blue-900">E-mails disparados</p>
                <p className="text-xs text-blue-800">
                  {grupos.size} grupo(s) notificado(s) com o programa de carga e a lista de pedidos para o faturamento.
                </p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              A carga agora segue para o fluxo do TMS (emissão de CT-e, MDF-e, CIOT, vale-pedágio e averbação).
            </p>
          </div>
          <div className="flex gap-2 mt-4">
            <Button variant="outline" className="flex-1" onClick={() => setConfirmado(false)}>Fechar</Button>
            <Button className="flex-1" onClick={resetar}>Formar nova carga</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
