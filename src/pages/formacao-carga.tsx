import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/layout/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Stepper } from "@/components/simulacao/stepper";
import {
  Package, Plus, MapPin, Truck, Mail, AlertCircle, Sparkles, CheckCircle2,
  ArrowRightLeft, ChevronLeft, ChevronRight, CalendarClock, Building2,
} from "lucide-react";
import { pedidos as pedidosBase, motoristas, veiculos, gruposEmail, Pedido } from "@/lib/mock-data";
import { formatCurrency, cn } from "@/lib/utils";
import { useProfile } from "@/lib/profile-context";
import { NovoPedidoDialog } from "@/components/pedidos/novo-pedido-dialog";

type ListaTab = "pedidos" | "transferencias";

const WIZARD_STEPS = [
  { id: 1, nome: "Pedidos e Transferências" },
  { id: 2, nome: "Dados da carga" },
  { id: 3, nome: "Resumo & confirmação" },
];

export function FormacaoCarga() {
  const navigate = useNavigate();
  const { capabilities } = useProfile();
  const canEdit = capabilities.canEdit("formacao_carga");

  const [step, setStep] = useState(1);
  const [extras, setExtras] = useState<Pedido[]>([]);
  const [novoOpen, setNovoOpen] = useState(false);
  const [tabLista, setTabLista] = useState<ListaTab>("pedidos");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [motoristaId, setMotoristaId] = useState("m1");
  const [veiculoId, setVeiculoId] = useState("v1");
  const [transportadora, setTransportadora] = useState("Frota própria");
  const [ufOrigem, setUfOrigem] = useState("RS");
  const [grupos, setGrupos] = useState<Set<string>>(new Set(["g1", "g4"]));
  const [data, setData] = useState("2026-04-17");
  const [hora, setHora] = useState("07:30");
  const [obs, setObs] = useState("");

  const pedidos = useMemo(() => [...extras, ...pedidosBase], [extras]);
  const pendentesTodos = pedidos.filter(p => p.status === "liberado" || p.status === "programado" || p.status === "recebido");
  const pendentesPedidos = pendentesTodos.filter(p => p.tipoOperacao !== "transferencia");
  const pendentesTransf = pendentesTodos.filter(p => p.tipoOperacao === "transferencia");
  const pendentesVisivel = tabLista === "pedidos" ? pendentesPedidos : pendentesTransf;

  const motorista = motoristas.find(m => m.id === motoristaId);
  const veiculo = veiculos.find(v => v.id === veiculoId);

  const totais = useMemo(() => {
    const selecionados = pendentesTodos.filter(p => selected.has(p.id));
    return {
      qtd: selecionados.length,
      qtdPedidos: selecionados.filter(p => p.tipoOperacao !== "transferencia").length,
      qtdTransf: selecionados.filter(p => p.tipoOperacao === "transferencia").length,
      peso: selecionados.reduce((s, p) => s + p.pesoBruto, 0),
      valor: selecionados.reduce((s, p) => s + p.valor, 0),
      lista: selecionados,
    };
  }, [selected, pendentesTodos]);

  const capacidade = veiculo?.capacidadeKg ?? 30000;
  const ocupacao = Math.min(100, (totais.peso / capacidade) * 100);
  const ufsDestino = [...new Set(totais.lista.map(p => p.uf))];

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

  const canAvancar =
    (step === 1 && totais.qtd > 0) ||
    (step === 2 && !!data && !!hora && !!motoristaId && !!veiculoId);

  const proximo = () => { if (canAvancar && step < 3) setStep(step + 1); };
  const voltar = () => { if (step > 1) setStep(step - 1); };
  const formar = () => {
    if (totais.qtd === 0 || !canEdit) return;
    // Redireciona direto para visualizar a ordem recém-formada
    navigate("/ordens-carregamento/oc1");
  };

  return (
    <div className="pb-20">
      <PageHeader
        title="Formação de Carga"
        description="Wizard de 3 etapas · selecione os pedidos, configure motorista e placa, revise e forme a carga"
        badge={{ label: "Fase 1", variant: "phase1" }}
        actions={<Button size="sm" variant="outline"><Sparkles className="w-3.5 h-3.5 mr-1.5" />Sugestão automática (Fase 4)</Button>}
      />

      <Stepper steps={WIZARD_STEPS} current={step} />

      {/* ============================================ */}
      {/* ETAPA 1 — Pedidos e Transferências           */}
      {/* ============================================ */}
      {step === 1 && (
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold">Selecionar pedidos e transferências pendentes</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {totais.qtd} selecionado(s) · {totais.qtdPedidos} pedido(s) + {totais.qtdTransf} transferência(s)
              </p>
            </div>
            <Button size="sm" variant="outline" disabled={!canEdit} onClick={() => setNovoOpen(true)}>
              <Plus className="w-3.5 h-3.5 mr-1.5" />Adicionar pedido
            </Button>
          </div>

          <Tabs value={tabLista} onValueChange={(v) => setTabLista(v as ListaTab)} className="mb-3">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="pedidos"><Package className="w-3.5 h-3.5 mr-1.5" />Pedidos ({pendentesPedidos.length})</TabsTrigger>
              <TabsTrigger value="transferencias"><ArrowRightLeft className="w-3.5 h-3.5 mr-1.5" />Transferências ({pendentesTransf.length})</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
            {pendentesVisivel.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-6">Nenhum item nesta aba no momento</p>
            )}
            {pendentesVisivel.map(p => {
              const isSelected = selected.has(p.id);
              const isTransf = p.tipoOperacao === "transferencia";
              return (
                <label
                  key={p.id}
                  className={cn(
                    "flex items-start gap-3 p-3 rounded-md border cursor-pointer transition-colors",
                    isSelected ? (isTransf ? "bg-amber-50 border-amber-300" : "bg-blue-50 border-blue-300") : "border-slate-200 hover:bg-slate-50"
                  )}
                >
                  <Checkbox checked={isSelected} onCheckedChange={() => toggle(p.id)} className="mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <span className="font-mono text-xs text-blue-600 font-medium">{p.oc}</span>
                      <span className="text-sm font-medium">{p.cliente}</span>
                      <StatusBadge status={p.status} />
                      {isTransf && <Badge variant="warning" className="text-[9px]">Transferência</Badge>}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{p.cidade}/{p.uf}</span>
                      <span>{p.pesoBruto.toLocaleString("pt-BR")} kg</span>
                      {p.valor > 0 && <span>{formatCurrency(p.valor)}</span>}
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

          {totais.qtd > 0 && (
            <div className="mt-4 pt-3 border-t flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Pré-visualização dos totais</span>
              <div className="flex items-center gap-4">
                <span><strong>{totais.peso.toLocaleString("pt-BR")}</strong> kg</span>
                <span><strong>{formatCurrency(totais.valor)}</strong></span>
                <span>Ocupação <strong>{ocupacao.toFixed(0)}%</strong></span>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* ============================================ */}
      {/* ETAPA 2 — Dados da carga                     */}
      {/* ============================================ */}
      {step === 2 && (
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-5">
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <CalendarClock className="w-4 h-4 text-violet-600" />Saída · Motorista · Veículo
            </h3>
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
              <Label className="text-xs">Veículo / Placa *</Label>
              <Select value={veiculoId} onValueChange={setVeiculoId}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {veiculos.map(v => (
                    <SelectItem key={v.id} value={v.id}>{v.placa} · {v.tipo} · {v.capacidadeKg.toLocaleString("pt-BR")} kg</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {veiculo && totais.peso > 0 && (
                <p className="text-[10px] text-muted-foreground mt-1">
                  Ocupação prevista: <strong>{ocupacao.toFixed(0)}%</strong> ({totais.peso.toLocaleString("pt-BR")} / {veiculo.capacidadeKg.toLocaleString("pt-BR")} kg)
                </p>
              )}
            </div>
            <div className="mb-3">
              <Label className="text-xs">Transportadora</Label>
              <Input value={transportadora} onChange={e => setTransportadora(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">UF de origem</Label>
              <Select value={ufOrigem} onValueChange={setUfOrigem}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="RS">RS — Nova Santa Rita</SelectItem>
                  <SelectItem value="SC">SC — Joinville</SelectItem>
                  <SelectItem value="SP">SP — Guarulhos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <Mail className="w-4 h-4 text-violet-600" />Comunicação e observações
            </h3>
            <Label className="text-xs">Grupos de notificação</Label>
            <p className="text-[10px] text-muted-foreground mt-0.5 mb-2">Quem recebe o e-mail de carga (motorista, placa, lista de pedidos)</p>
            <div className="space-y-1.5 max-h-72 overflow-y-auto">
              {gruposEmail.map(g => {
                const active = grupos.has(g.id);
                return (
                  <label key={g.id} className={cn("flex items-start gap-2 p-2 rounded border cursor-pointer text-xs", active ? "bg-blue-50 border-blue-300" : "border-slate-200 hover:bg-slate-50")}>
                    <Checkbox checked={active} onCheckedChange={() => toggleGrupo(g.id)} className="mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">{g.nome}</p>
                      <p className="text-muted-foreground truncate">{g.emails.length} destinatários · {g.descricao}</p>
                    </div>
                  </label>
                );
              })}
            </div>
            <div className="mt-3">
              <Label className="text-xs">Observações</Label>
              <Textarea value={obs} onChange={e => setObs(e.target.value)} placeholder="Ex: carga perigosa, lacre específico, janela de descarga, contato no destino..." className="mt-1 min-h-[80px]" />
            </div>
          </Card>
        </div>
      )}

      {/* ============================================ */}
      {/* ETAPA 3 — Resumo                             */}
      {/* ============================================ */}
      {step === 3 && (
        <div className="space-y-3">
          <Card className="p-5 bg-gradient-to-br from-violet-50 to-white border-violet-200">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-5 h-5 text-violet-700" />
              <h3 className="text-base font-semibold">Resumo da carga</h3>
              <Badge variant="info" className="ml-auto">Revisão final</Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Confira os dados antes de formar. Ao confirmar, o sistema cria o identificador único, dispara o e-mail aos {grupos.size} grupo(s) selecionado(s), e prepara o casamento XML × Pedido para a emissão dos documentos fiscais.
            </p>
          </Card>

          <div className="grid grid-cols-[1.4fr_1fr] gap-3">
            <div className="space-y-3">
              {/* Itens */}
              <Card className="p-4">
                <p className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Package className="w-4 h-4 text-violet-600" />Itens selecionados ({totais.qtd})
                </p>
                <div className="max-h-[280px] overflow-y-auto space-y-1">
                  {totais.lista.map(p => {
                    const isTransf = p.tipoOperacao === "transferencia";
                    return (
                      <div key={p.id} className="flex items-center gap-2 p-2 rounded border text-xs bg-slate-50">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                        <span className="font-mono text-blue-600 w-20 truncate">{p.oc}</span>
                        <span className="font-medium flex-1 truncate">{p.cliente}</span>
                        <span className="text-muted-foreground flex items-center gap-0.5 text-[10px]"><MapPin className="w-2.5 h-2.5" />{p.cidade}/{p.uf}</span>
                        <span className="text-muted-foreground w-16 text-right">{p.pesoBruto.toLocaleString("pt-BR")} kg</span>
                        {isTransf && <Badge variant="warning" className="text-[9px]">Transf</Badge>}
                      </div>
                    );
                  })}
                </div>
              </Card>

              {/* Totais */}
              <Card className="p-4 bg-slate-50 border-2 border-dashed">
                <p className="text-xs font-semibold text-slate-700 mb-2 uppercase tracking-wider">Totais</p>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <p className="text-2xl font-bold tabular-nums">{totais.qtd}</p>
                    <p className="text-[10px] text-muted-foreground">Itens ({totais.qtdPedidos}P + {totais.qtdTransf}T)</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold tabular-nums">{totais.peso.toLocaleString("pt-BR")}</p>
                    <p className="text-[10px] text-muted-foreground">kg</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold tabular-nums">{ufsDestino.length}</p>
                    <p className="text-[10px] text-muted-foreground">UFs destino</p>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t flex justify-between text-sm">
                  <span className="text-muted-foreground">Valor total NFs</span>
                  <span className="font-bold">{formatCurrency(totais.valor)}</span>
                </div>
                <div className="mt-3">
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-muted-foreground">Ocupação da carreta ({veiculo?.placa})</span>
                    <span className="font-semibold">{ocupacao.toFixed(0)}%</span>
                  </div>
                  <Progress value={ocupacao} className="h-2" />
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Capacidade: {capacidade.toLocaleString("pt-BR")} kg · Disponível: {Math.max(0, capacidade - totais.peso).toLocaleString("pt-BR")} kg
                  </p>
                </div>
              </Card>
            </div>

            {/* Lateral: Dados + Grupos + Observações */}
            <div className="space-y-3">
              <Card className="p-4">
                <p className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Truck className="w-4 h-4 text-violet-600" />Dados da carga
                </p>
                <div className="space-y-2.5 text-xs">
                  <div>
                    <p className="text-muted-foreground">Motorista</p>
                    <p className="font-medium">{motorista?.nome}</p>
                    <p className="text-[10px] text-muted-foreground font-mono">CPF {motorista?.cpf} · CNH cat. {motorista?.categoria}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Placa · Veículo</p>
                    <p className="font-mono font-medium">{veiculo?.placa} · {veiculo?.tipo}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Saída</p>
                    <p className="font-medium">{new Date(data).toLocaleDateString("pt-BR")} às {hora}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground flex items-center gap-1"><Building2 className="w-3 h-3" />Origem · Transportadora</p>
                    <p className="font-medium">{ufOrigem} · {transportadora}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Destinos</p>
                    <div className="flex flex-wrap gap-1 mt-0.5">
                      {ufsDestino.map(u => <Badge key={u} variant="info" className="text-[9px]">{u}</Badge>)}
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <p className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-violet-600" />Notificação ({grupos.size} grupo{grupos.size === 1 ? "" : "s"})
                </p>
                <div className="space-y-1.5 text-xs">
                  {[...grupos].map(gId => {
                    const g = gruposEmail.find(gg => gg.id === gId);
                    if (!g) return null;
                    return (
                      <div key={gId} className="flex items-center gap-2">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                        <span className="font-medium flex-1 truncate">{g.nome}</span>
                        <span className="text-muted-foreground text-[10px]">{g.emails.length} dest.</span>
                      </div>
                    );
                  })}
                  {grupos.size === 0 && (
                    <p className="text-amber-700 text-[11px] flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />Nenhum grupo selecionado — volte à etapa 2
                    </p>
                  )}
                </div>
              </Card>

              {obs && (
                <Card className="p-3 bg-amber-50 border-amber-200 text-xs text-amber-900">
                  <p className="font-semibold mb-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />Observações</p>
                  <p className="whitespace-pre-wrap">{obs}</p>
                </Card>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============================================ */}
      {/* Footer sticky de navegação                   */}
      {/* ============================================ */}
      <div className="fixed bottom-0 left-64 right-0 bg-white border-t shadow-md z-20">
        <div className="max-w-[1600px] mx-auto px-6 py-3 flex items-center justify-between">
          <Button variant="outline" onClick={voltar} disabled={step === 1}>
            <ChevronLeft className="w-4 h-4 mr-1" /> Voltar
          </Button>

          <div className="text-xs text-muted-foreground">
            Etapa <strong className="text-foreground">{step}</strong> de {WIZARD_STEPS.length}
            {step === 1 && totais.qtd === 0 && <span className="ml-3 text-amber-700">⚠ Selecione ao menos 1 pedido</span>}
          </div>

          {step < 3 ? (
            <Button onClick={proximo} disabled={!canAvancar}>
              Próximo <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button onClick={formar} disabled={totais.qtd === 0 || !canEdit} size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white">
              <Truck className="w-4 h-4 mr-2" /> Formar carga e enviar e-mails
            </Button>
          )}
        </div>
      </div>

      <NovoPedidoDialog open={novoOpen} onOpenChange={setNovoOpen} onCreate={p => {
        setExtras(prev => [p, ...prev]);
        setSelected(prev => new Set([...prev, p.id]));
        setTabLista(p.tipoOperacao === "transferencia" ? "transferencias" : "pedidos");
      }} />
    </div>
  );
}
