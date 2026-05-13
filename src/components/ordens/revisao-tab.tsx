// Aba "Revisão & Histórico" do detalhe de Ordem de Carregamento
// Reúne: edição da carga (postergar, antecipar, incluir/retirar pedido), timeline de eventos
// e histórico versionado de e-mails. Antes vivia em /cargas/:id — agora absorvido na ordem.

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
  CalendarClock, CalendarPlus, Plus, Minus, Mail, Send,
  Clock, Truck, MapPin, UserCog, FileText, AlertCircle,
} from "lucide-react";
import {
  cargas, pedidos, motoristas, veiculos, gruposEmail,
  eventosCarga as eventosCargaMock, emailsEnviados as emailsMock,
  EventoCarga, EventoCargaTipo, EmailEnviado,
} from "@/lib/mock-data";
import { useProfile } from "@/lib/profile-context";
import { formatCurrency, formatDateTime, cn } from "@/lib/utils";

type EdicaoTipo = "postergar" | "antecipar" | "incluir" | "remover" | null;

const TIPO_ICON: Record<EventoCargaTipo, React.ElementType> = {
  criada: Truck, postergada: CalendarClock, antecipada: CalendarPlus,
  pedido_incluido: Plus, pedido_removido: Minus, motorista_alterado: UserCog,
  email_enviado: Mail, reenvio_email: Send,
};

const TIPO_BG: Record<EventoCargaTipo, string> = {
  criada: "bg-blue-100 text-blue-700",
  postergada: "bg-amber-100 text-amber-700",
  antecipada: "bg-emerald-100 text-emerald-700",
  pedido_incluido: "bg-emerald-100 text-emerald-700",
  pedido_removido: "bg-rose-100 text-rose-700",
  motorista_alterado: "bg-violet-100 text-violet-700",
  email_enviado: "bg-slate-100 text-slate-700",
  reenvio_email: "bg-sky-100 text-sky-700",
};

export function RevisaoTab({ cargaId }: { cargaId: string }) {
  const { capabilities } = useProfile();
  const canEdit = capabilities.canEdit("revisao_carga");
  const carga = cargas.find(c => c.id === cargaId);

  const [pedidosIds, setPedidosIds] = useState<string[]>(carga?.pedidos ?? []);
  const [eventos, setEventos] = useState<EventoCarga[]>(() => eventosCargaMock.filter(e => e.cargaId === cargaId));
  const [emails, setEmails] = useState<EmailEnviado[]>(() => emailsMock.filter(e => e.cargaId === cargaId));
  const [dataSaida, setDataSaida] = useState(carga?.dataSaida ?? "");
  const [horaSaida, setHoraSaida] = useState(carga?.horaSaida ?? "");
  const [edicao, setEdicao] = useState<EdicaoTipo>(null);
  const [novaData, setNovaData] = useState("");
  const [novaHora, setNovaHora] = useState("");
  const [motivo, setMotivo] = useState("");
  const [reenviar, setReenviar] = useState(true);
  const [pedidoAlvo, setPedidoAlvo] = useState<string>("");
  const [emailPreview, setEmailPreview] = useState<EmailEnviado | null>(null);

  if (!carga) return <p className="text-sm text-muted-foreground p-4">Carga não encontrada.</p>;

  const motorista = motoristas.find(m => m.id === carga.motoristaId);
  const veiculo = veiculos.find(v => v.id === carga.veiculoId);
  const pedidosCarga = pedidos.filter(p => pedidosIds.includes(p.id));
  const pedidosDisponiveis = pedidos.filter(p => !pedidosIds.includes(p.id) && (p.status === "liberado" || p.status === "programado" || p.status === "recebido"));
  const gruposUsados = carga.gruposNotificacao;
  const destinatariosCount = gruposUsados.reduce((s, gId) => s + (gruposEmail.find(g => g.id === gId)?.emails.length ?? 0), 0);
  const ultimaVersao = useMemo(() => emails.reduce((m, e) => (e.versao > m ? e.versao : m), 0), [emails]);

  const registrarEvento = (tipo: EventoCargaTipo, descricao: string, detalhe?: string) => {
    setEventos(prev => [...prev, { id: `ev${Date.now()}`, cargaId, tipo, descricao, autor: "Operação", timestamp: new Date().toISOString(), detalhe }]);
  };

  const registrarReenvio = (resumo: string) => {
    const nova: EmailEnviado = {
      id: `em${Date.now()}`, cargaId,
      assunto: `${carga.numero} · ATUALIZAÇÃO · ${carga.ufOrigem} · ${new Date(dataSaida).toLocaleDateString("pt-BR")} ${horaSaida} · ${motorista?.nome} · ${veiculo?.placa}`,
      grupos: gruposUsados, destinatarios: destinatariosCount,
      timestamp: new Date().toISOString(), versao: ultimaVersao + 1, tipo: "atualizacao", resumoMudancas: resumo,
    };
    setEmails(prev => [...prev, nova]);
    registrarEvento("reenvio_email", `E-mail v${ultimaVersao + 1} reenviado com as alterações`, `${destinatariosCount} destinatários · ${resumo}`);
  };

  const confirmarEdicao = () => {
    if (edicao === "postergar" || edicao === "antecipar") {
      if (!novaData || !novaHora) return;
      const antes = `${new Date(dataSaida).toLocaleDateString("pt-BR")} ${horaSaida}`;
      const depois = `${new Date(novaData).toLocaleDateString("pt-BR")} ${novaHora}`;
      const tipo = edicao === "postergar" ? "postergada" : "antecipada";
      setDataSaida(novaData); setHoraSaida(novaHora);
      registrarEvento(tipo, `Saída ${tipo} de ${antes} para ${depois}`, motivo ? `Motivo: ${motivo}` : undefined);
      if (reenviar) registrarReenvio(`Nova saída: ${depois}${motivo ? ` · ${motivo}` : ""}`);
    } else if (edicao === "incluir" && pedidoAlvo) {
      const p = pedidos.find(pp => pp.id === pedidoAlvo)!;
      setPedidosIds(prev => [...prev, pedidoAlvo]);
      registrarEvento("pedido_incluido", `Pedido ${p.oc} · ${p.cliente} incluído`);
      if (reenviar) registrarReenvio(`Inclusão do pedido ${p.oc}`);
    } else if (edicao === "remover" && pedidoAlvo) {
      const p = pedidos.find(pp => pp.id === pedidoAlvo)!;
      setPedidosIds(prev => prev.filter(x => x !== pedidoAlvo));
      registrarEvento("pedido_removido", `Pedido ${p.oc} · ${p.cliente} retirado`);
      if (reenviar) registrarReenvio(`Retirada do pedido ${p.oc}`);
    }
    setEdicao(null); setMotivo(""); setPedidoAlvo(""); setNovaData(""); setNovaHora(""); setReenviar(true);
  };

  const eventosOrdenados = [...eventos].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  const emailsOrdenados = [...emails].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <div className="space-y-3">
      {!canEdit && (
        <Card className="p-3 bg-amber-50 border-amber-200 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-amber-700 mt-0.5 shrink-0" />
          <p className="text-xs text-amber-900">Você está em <strong>somente leitura</strong>. Alterações e reenvios exigem perfil Administrador.</p>
        </Card>
      )}

      {/* Ações rápidas */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <UserCog className="w-4 h-4 text-violet-600" />
          <p className="text-sm font-semibold">Revisar carga (gera nova versão do e-mail)</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" onClick={() => setEdicao("postergar")} disabled={!canEdit}>
            <CalendarClock className="w-3.5 h-3.5 mr-1.5" /> Postergar entrega
          </Button>
          <Button size="sm" variant="outline" onClick={() => setEdicao("antecipar")} disabled={!canEdit}>
            <CalendarPlus className="w-3.5 h-3.5 mr-1.5" /> Antecipar entrega
          </Button>
          <Button size="sm" variant="outline" onClick={() => setEdicao("incluir")} disabled={!canEdit}>
            <Plus className="w-3.5 h-3.5 mr-1.5" /> Incluir pedido
          </Button>
        </div>
        <p className="text-[11px] text-muted-foreground mt-2">
          Casos típicos: cliente avisa que não pode receber, caminhão entra em manutenção (troca de placa), inclusão de amostra de última hora.
        </p>
      </Card>

      {/* Pedidos editáveis */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold">Pedidos da carga ({pedidosCarga.length})</p>
        </div>
        <div className="space-y-1.5">
          {pedidosCarga.map(p => (
            <div key={p.id} className="flex items-start gap-3 p-2.5 rounded border text-xs">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-mono text-blue-600">{p.oc}</span>
                  <span className="font-medium">{p.cliente}</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-0.5"><MapPin className="w-3 h-3" />{p.cidade}/{p.uf}</span>
                  <span>{p.pesoBruto} kg</span>
                  <span>{formatCurrency(p.valor)}</span>
                </div>
              </div>
              <Button size="sm" variant="ghost" className="text-rose-600 h-7"
                onClick={() => { setPedidoAlvo(p.id); setEdicao("remover"); }}
                disabled={!canEdit || pedidosCarga.length <= 1}
                title={pedidosCarga.length <= 1 ? "Não é possível remover o último pedido" : undefined}>
                <Minus className="w-3.5 h-3.5" />
              </Button>
            </div>
          ))}
        </div>
      </Card>

      {/* Timeline */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Clock className="w-4 h-4 text-slate-600" />
          <p className="text-sm font-semibold">Timeline de alterações ({eventosOrdenados.length})</p>
        </div>
        <div className="relative">
          <div className="absolute left-3.5 top-2 bottom-2 w-px bg-slate-200" />
          <div className="space-y-3">
            {eventosOrdenados.map(ev => {
              const Icon = TIPO_ICON[ev.tipo];
              return (
                <div key={ev.id} className="flex gap-3 relative">
                  <div className={cn("w-7 h-7 rounded-full flex items-center justify-center shrink-0 border-2 border-white z-10", TIPO_BG[ev.tipo])}>
                    <Icon className="w-3 h-3" />
                  </div>
                  <div className="flex-1 min-w-0 pt-0.5">
                    <p className="text-xs font-medium">{ev.descricao}</p>
                    {ev.detalhe && <p className="text-[11px] text-muted-foreground mt-0.5">{ev.detalhe}</p>}
                    <p className="text-[10px] text-muted-foreground mt-0.5">{formatDateTime(ev.timestamp)} · {ev.autor}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Versões de e-mail */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold flex items-center gap-2"><Mail className="w-4 h-4 text-violet-600" />E-mails enviados (versões)</p>
          <Badge variant="muted" className="text-[10px]">{emails.length} total · última v{ultimaVersao}</Badge>
        </div>
        <div className="space-y-2">
          {emailsOrdenados.map(e => (
            <div key={e.id} className="border rounded p-3 text-xs">
              <div className="flex items-center justify-between mb-1">
                <Badge variant={e.tipo === "inicial" ? "info" : "warning"} className="text-[10px]">
                  v{e.versao} · {e.tipo === "inicial" ? "Inicial" : e.tipo === "atualizacao" ? "Atualização" : "Cancelamento"}
                </Badge>
                <span className="text-muted-foreground text-[10px]">{formatDateTime(e.timestamp)}</span>
              </div>
              <p className="font-medium text-slate-800 mb-1 truncate">{e.assunto}</p>
              {e.resumoMudancas && <p className="text-muted-foreground text-[11px] mb-1">↳ {e.resumoMudancas}</p>}
              <div className="flex items-center justify-between mt-1.5">
                <span className="text-muted-foreground text-[10px]">{e.destinatarios} destinatários · {e.grupos.length} grupo(s)</span>
                <Button size="sm" variant="ghost" className="h-6 text-[10px]" onClick={() => setEmailPreview(e)}>
                  <FileText className="w-3 h-3 mr-1" /> Ver e-mail
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Dialog de edição */}
      <Dialog open={edicao !== null} onOpenChange={() => setEdicao(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {edicao === "postergar" && "Postergar entrega"}
              {edicao === "antecipar" && "Antecipar entrega"}
              {edicao === "incluir" && "Incluir pedido na carga"}
              {edicao === "remover" && "Retirar pedido da carga"}
            </DialogTitle>
            <DialogDescription>
              Após a confirmação, o evento é registrado na timeline. Se marcar "Reenviar e-mail", os grupos já notificados recebem uma nova versão com as alterações destacadas.
            </DialogDescription>
          </DialogHeader>

          {(edicao === "postergar" || edicao === "antecipar") && (
            <div className="space-y-3">
              <div><Label className="text-xs">Nova data *</Label><Input type="date" value={novaData} onChange={e => setNovaData(e.target.value)} className="mt-1" /></div>
              <div><Label className="text-xs">Novo horário *</Label><Input type="time" value={novaHora} onChange={e => setNovaHora(e.target.value)} className="mt-1" /></div>
              <div><Label className="text-xs">Motivo</Label><Textarea value={motivo} onChange={e => setMotivo(e.target.value)} placeholder="Ex: cliente em manutenção / aguardo NF embalagem / troca de placa" className="mt-1" /></div>
            </div>
          )}

          {edicao === "incluir" && (
            <div className="space-y-3">
              <Label className="text-xs">Pedidos disponíveis</Label>
              <div className="max-h-60 overflow-y-auto space-y-1.5">
                {pedidosDisponiveis.map(p => (
                  <label key={p.id} className={cn("flex items-start gap-2 p-2 rounded border cursor-pointer text-xs", pedidoAlvo === p.id ? "bg-blue-50 border-blue-300" : "border-slate-200 hover:bg-slate-50")}>
                    <input type="radio" name="pedido" checked={pedidoAlvo === p.id} onChange={() => setPedidoAlvo(p.id)} className="mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="font-mono text-blue-600">{p.oc}</p>
                      <p className="font-medium">{p.cliente}</p>
                      <p className="text-muted-foreground">{p.cidade}/{p.uf} · {p.pesoBruto} kg · {formatCurrency(p.valor)}</p>
                    </div>
                  </label>
                ))}
                {pedidosDisponiveis.length === 0 && <p className="text-sm text-muted-foreground p-4 text-center">Nenhum pedido disponível.</p>}
              </div>
            </div>
          )}

          {edicao === "remover" && pedidoAlvo && (
            <div className="bg-rose-50 border border-rose-200 rounded p-3 text-sm">
              <p>Remover pedido <strong>{pedidos.find(p => p.id === pedidoAlvo)?.oc}</strong> ({pedidos.find(p => p.id === pedidoAlvo)?.cliente}) da carga?</p>
            </div>
          )}

          <label className="flex items-start gap-2 p-3 bg-sky-50 border border-sky-200 rounded cursor-pointer">
            <Checkbox checked={reenviar} onCheckedChange={v => setReenviar(!!v)} className="mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-sky-900">Reenviar e-mail atualizado</p>
              <p className="text-xs text-sky-800">Os {destinatariosCount} destinatários originais receberão uma nova versão com as alterações.</p>
            </div>
          </label>

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setEdicao(null)}>Cancelar</Button>
            <Button className="flex-1" onClick={confirmarEdicao}>Confirmar</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog preview do e-mail */}
      <Dialog open={!!emailPreview} onOpenChange={() => setEmailPreview(null)}>
        <DialogContent className="max-w-2xl">
          {emailPreview && (
            <>
              <DialogHeader>
                <DialogTitle>E-mail · versão {emailPreview.versao}</DialogTitle>
                <DialogDescription>
                  {emailPreview.tipo === "inicial" ? "E-mail inicial enviado ao formar a carga" : "Reenvio após alteração"} · {formatDateTime(emailPreview.timestamp)}
                </DialogDescription>
              </DialogHeader>

              <div className="border rounded-lg overflow-hidden">
                <div className="bg-slate-50 p-3 border-b text-xs space-y-1">
                  <div className="flex gap-2"><span className="text-muted-foreground w-16">De:</span><span>logistica@dorfketal.com</span></div>
                  <div className="flex gap-2"><span className="text-muted-foreground w-16">Para:</span><span className="font-mono text-[11px] truncate">{emailPreview.grupos.map(gId => gruposEmail.find(g => g.id === gId)?.emails.join("; ")).join("; ")}</span></div>
                  <div className="flex gap-2"><span className="text-muted-foreground w-16">Assunto:</span><span className="font-medium">{emailPreview.assunto}</span></div>
                </div>
                <div className="p-4 text-sm space-y-3 bg-white">
                  <p>Prezados,</p>
                  {emailPreview.tipo === "inicial" ? (
                    <p>Segue a programação de carga:</p>
                  ) : (
                    <div className="bg-amber-50 border border-amber-200 rounded p-2 text-xs">
                      <p className="font-semibold text-amber-900">⚠ Atualização da carga {carga.numero}</p>
                      <p className="text-amber-800 mt-0.5">{emailPreview.resumoMudancas}</p>
                    </div>
                  )}
                  <table className="w-full text-xs border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="py-1.5 text-left font-medium text-muted-foreground">OC</th>
                        <th className="py-1.5 text-left font-medium text-muted-foreground">Cliente</th>
                        <th className="py-1.5 text-left font-medium text-muted-foreground">Destino</th>
                        <th className="py-1.5 text-right font-medium text-muted-foreground">Peso</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pedidosCarga.map(p => (
                        <tr key={p.id} className="border-b">
                          <td className="py-1.5 font-mono">{p.oc}</td>
                          <td>{p.cliente}</td>
                          <td>{p.cidade}/{p.uf}</td>
                          <td className="text-right">{p.pesoBruto} kg</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="text-xs bg-slate-50 p-2 rounded">
                    <p><span className="text-muted-foreground">Motorista:</span> <span className="font-medium">{motorista?.nome}</span></p>
                    <p><span className="text-muted-foreground">Placa:</span> <span className="font-mono font-medium">{veiculo?.placa}</span></p>
                    <p><span className="text-muted-foreground">Saída:</span> {new Date(dataSaida).toLocaleDateString("pt-BR")} às {horaSaida} · {carga.ufOrigem}</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
