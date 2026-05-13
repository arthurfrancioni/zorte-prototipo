import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/shared/stat-card";
import {
  Zap, Plug, Plus, Settings2, CheckCircle2, AlertCircle, Send,
  Building2, FileText, AlertTriangle, HelpCircle,
} from "lucide-react";
import {
  integracoes as integracoesBase,
  destinatariosXML as destinatariosBase,
  distribuicoesXML,
  Integracao, IntegracaoStatus, DestinatarioXML,
} from "@/lib/mock-data";
import { useProfile } from "@/lib/profile-context";
import { formatDateTime, cn } from "@/lib/utils";

const STATUS_STYLE: Record<IntegracaoStatus, { label: string; dot: string; badge: string }> = {
  ativa: { label: "Ativa", dot: "bg-emerald-500", badge: "bg-emerald-100 text-emerald-800" },
  disponivel: { label: "Disponível", dot: "bg-slate-400", badge: "bg-slate-100 text-slate-700" },
  sob_demanda: { label: "Sob demanda", dot: "bg-amber-500", badge: "bg-amber-100 text-amber-800" },
  erro: { label: "Erro", dot: "bg-rose-500", badge: "bg-rose-100 text-rose-800" },
};

const CATEGORIA_LABEL: Record<Integracao["categoria"], string> = {
  captura: "Captura",
  fiscal: "Fiscal",
  seguro: "Seguro & Averbação",
  risco: "Risco",
  comunicacao: "Comunicação",
  erp: "ERP / Contadores",
  rota: "Rota & Vale-Pedágio",
};

export function Integracoes() {
  const { capabilities } = useProfile();
  const canEdit = capabilities.canEdit("integracoes");
  const [tab, setTab] = useState("conectores");
  const [destinatarios, setDestinatarios] = useState<DestinatarioXML[]>(destinatariosBase);
  const [novoOpen, setNovoOpen] = useState(false);
  const [gnreOpen, setGnreOpen] = useState(false);
  const [novo, setNovo] = useState({
    cnpj: "", razaoSocial: "", tipo: "contador" as "contador" | "erp",
    metodo: "email" as "email" | "api", contato: "", frequencia: "tempo_real" as "tempo_real" | "diaria" | "semanal",
  });

  const totais = useMemo(() => ({
    ativas: integracoesBase.filter(i => i.status === "ativa").length,
    disponiveis: integracoesBase.filter(i => i.status === "disponivel").length,
    sobDemanda: integracoesBase.filter(i => i.status === "sob_demanda").length,
    erros: integracoesBase.filter(i => i.status === "erro").length,
  }), []);

  const adicionar = () => {
    if (!novo.cnpj || !novo.razaoSocial || !novo.contato) return;
    const novoDest: DestinatarioXML = { id: `dest${Date.now()}`, ...novo, ativo: true };
    setDestinatarios(prev => [...prev, novoDest]);
    setNovoOpen(false);
    setNovo({ cnpj: "", razaoSocial: "", tipo: "contador", metodo: "email", contato: "", frequencia: "tempo_real", ativo: false } as any);
  };

  const toggleAtivo = (id: string) => {
    if (!canEdit) return;
    setDestinatarios(prev => prev.map(d => d.id === id ? { ...d, ativo: !d.ativo } : d));
  };

  return (
    <div>
      <PageHeader
        title="Integrações"
        description="Conectores ativos, disponíveis e sob demanda · distribuição automática de XMLs para contadores e ERPs"
      />

      <Tabs value={tab} onValueChange={setTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="conectores">Conectores</TabsTrigger>
          <TabsTrigger value="xml">Distribuição de XMLs</TabsTrigger>
        </TabsList>

        <TabsContent value="conectores">
          <div className="grid grid-cols-4 gap-4 mb-6">
            <StatCard label="Ativas" value={totais.ativas} icon={CheckCircle2} iconColor="emerald" />
            <StatCard label="Disponíveis" value={totais.disponiveis} icon={Plug} iconColor="blue" />
            <StatCard label="Sob demanda" value={totais.sobDemanda} icon={AlertTriangle} iconColor="amber" />
            <StatCard label="Em erro" value={totais.erros} icon={AlertCircle} iconColor="rose" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {integracoesBase.map(i => {
              const style = STATUS_STYLE[i.status];
              const isGNRE = i.id === "int8";
              const isXMLDistrib = i.id === "int10";
              return (
                <Card key={i.id} className="p-5">
                  <div className="flex items-start gap-3 mb-3">
                    <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center shrink-0", i.status === "ativa" ? "bg-emerald-100 text-emerald-700" : i.status === "sob_demanda" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600")}>
                      <Zap className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-semibold">{i.nome}</h3>
                        <div className="flex items-center gap-1">
                          <span className={cn("w-1.5 h-1.5 rounded-full", style.dot)} />
                          <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded", style.badge)}>{style.label}</span>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">{CATEGORIA_LABEL[i.categoria]}</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-700 mb-3">{i.descricao}</p>
                  {i.ultimoEvento && (
                    <p className="text-[11px] text-muted-foreground mb-3">↳ {i.ultimoEvento}</p>
                  )}
                  <div className="flex gap-2">
                    {i.status === "ativa" && (
                      <Button size="sm" variant="outline" disabled={!canEdit} title={!canEdit ? "Somente leitura" : undefined}>
                        <Settings2 className="w-3.5 h-3.5 mr-1.5" /> Configurar
                      </Button>
                    )}
                    {i.status === "disponivel" && (
                      <Button size="sm" disabled={!canEdit}>
                        <Plus className="w-3.5 h-3.5 mr-1.5" /> Ativar
                      </Button>
                    )}
                    {i.status === "sob_demanda" && (
                      <Button size="sm" variant="outline" onClick={() => isGNRE ? setGnreOpen(true) : undefined} disabled={!canEdit}>
                        <Send className="w-3.5 h-3.5 mr-1.5" /> Solicitar ativação
                      </Button>
                    )}
                    {isXMLDistrib && (
                      <Button size="sm" variant="ghost" onClick={() => setTab("xml")}>
                        Gerenciar destinatários →
                      </Button>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="xml">
          <Card className="p-4 mb-4 bg-blue-50 border-blue-200 flex items-start gap-3">
            <FileText className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold text-blue-900">Distribuição automática de XMLs ao ERP e contadores</p>
              <p className="text-blue-800 text-xs mt-1">
                Cada CT-e emitido dispara o envio do XML aos destinatários autorizados abaixo, no método e frequência configurados.
                O contador pode autorizar esse envio e seu software captura os CT-es do Zorte automaticamente — sem upload manual.
              </p>
            </div>
          </Card>

          <Card className="mb-4">
            <div className="p-5 border-b flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold">Destinatários autorizados</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{destinatarios.filter(d => d.ativo).length} de {destinatarios.length} ativos</p>
              </div>
              <Button size="sm" onClick={() => setNovoOpen(true)} disabled={!canEdit}>
                <Plus className="w-3.5 h-3.5 mr-1.5" /> Adicionar destinatário
              </Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>CNPJ</TableHead>
                  <TableHead>Razão Social</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Método</TableHead>
                  <TableHead>Contato / Endpoint</TableHead>
                  <TableHead>Frequência</TableHead>
                  <TableHead>Ativo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {destinatarios.map(d => (
                  <TableRow key={d.id}>
                    <TableCell className="font-mono text-xs">{d.cnpj}</TableCell>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
                        {d.razaoSocial}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={d.tipo === "erp" ? "info" : "muted"} className="text-[10px]">{d.tipo === "erp" ? "ERP" : "Contador"}</Badge>
                    </TableCell>
                    <TableCell className="text-xs uppercase text-muted-foreground">{d.metodo}</TableCell>
                    <TableCell className="font-mono text-[11px] max-w-[280px] truncate">{d.contato}</TableCell>
                    <TableCell className="text-xs capitalize">{d.frequencia.replace("_", " ")}</TableCell>
                    <TableCell>
                      <Checkbox checked={d.ativo} onCheckedChange={() => toggleAtivo(d.id)} disabled={!canEdit} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>

          <Card>
            <div className="p-5 border-b">
              <h3 className="text-sm font-semibold">Últimos XMLs distribuídos</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Histórico recente de envios</p>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Chave NFe</TableHead>
                  <TableHead>Destinatário</TableHead>
                  <TableHead>Meio</TableHead>
                  <TableHead>Data/hora</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {distribuicoesXML.map(dx => {
                  const d = destinatarios.find(dd => dd.id === dx.destinatarioId);
                  return (
                    <TableRow key={dx.id}>
                      <TableCell className="font-mono text-[10px] text-muted-foreground">
                        ...{dx.chaveNFe.slice(-12)}
                      </TableCell>
                      <TableCell className="font-medium text-sm">{d?.razaoSocial ?? "—"}</TableCell>
                      <TableCell className="text-xs uppercase">{d?.metodo ?? "—"}</TableCell>
                      <TableCell className="text-xs">{formatDateTime(dx.dataEnvio)}</TableCell>
                      <TableCell>
                        {dx.status === "enviado" && <Badge variant="success" className="text-[10px]">Enviado</Badge>}
                        {dx.status === "pendente" && <Badge variant="warning" className="text-[10px]">Pendente</Badge>}
                        {dx.status === "falhou" && (
                          <div className="flex items-center gap-1">
                            <Badge variant="destructive" className="text-[10px]">Falhou</Badge>
                            {dx.erroMsg && (
                              <span title={dx.erroMsg} className="inline-flex items-center">
                                <HelpCircle className="w-3 h-3 text-rose-600" />
                              </span>
                            )}
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={novoOpen} onOpenChange={setNovoOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Adicionar destinatário</DialogTitle>
            <DialogDescription>Contador autorizado ou endpoint de ERP para receber os XMLs.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Label className="text-xs">CNPJ *</Label>
              <Input value={novo.cnpj} onChange={e => setNovo(n => ({ ...n, cnpj: e.target.value }))} placeholder="00.000.000/0001-00" className="mt-1" />
            </div>
            <div className="col-span-2">
              <Label className="text-xs">Razão Social *</Label>
              <Input value={novo.razaoSocial} onChange={e => setNovo(n => ({ ...n, razaoSocial: e.target.value }))} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Tipo</Label>
              <Select value={novo.tipo} onValueChange={v => setNovo(n => ({ ...n, tipo: v as any }))}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="contador">Contador</SelectItem>
                  <SelectItem value="erp">ERP</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Método</Label>
              <Select value={novo.metodo} onValueChange={v => setNovo(n => ({ ...n, metodo: v as any }))}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">E-mail</SelectItem>
                  <SelectItem value="api">API</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2">
              <Label className="text-xs">{novo.metodo === "email" ? "E-mail de destino" : "Endpoint HTTPS"} *</Label>
              <Input value={novo.contato} onChange={e => setNovo(n => ({ ...n, contato: e.target.value }))} placeholder={novo.metodo === "email" ? "fiscal@contabilidade.com.br" : "https://erp.example.com/api/xml"} className="mt-1 font-mono text-xs" />
            </div>
            <div className="col-span-2">
              <Label className="text-xs">Frequência</Label>
              <Select value={novo.frequencia} onValueChange={v => setNovo(n => ({ ...n, frequencia: v as any }))}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="tempo_real">Tempo real (ao emitir)</SelectItem>
                  <SelectItem value="diaria">Diária (resumo noturno)</SelectItem>
                  <SelectItem value="semanal">Semanal</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setNovoOpen(false)}>Cancelar</Button>
            <Button className="flex-1" onClick={adicionar}>Adicionar</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={gnreOpen} onOpenChange={setGnreOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>GNRE · Smartonline</DialogTitle>
            <DialogDescription>Integração personalizada com a plataforma Smartonline para emissão de GNRE.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-sm">
            <div className="bg-amber-50 border border-amber-200 rounded p-3 text-xs text-amber-900">
              <p className="font-semibold mb-1">Integração sob demanda</p>
              <p>O Zorte TMS não possui conector nativo com a Smartonline, mas o desenvolvimento dessa integração faz parte do escopo de projetos personalizados. Uma vez ativada, as GNREs de operações interestaduais (ICMS-ST, DIFAL) são emitidas automaticamente no momento da saída da carga.</p>
            </div>
            <div className="space-y-2">
              <p className="font-medium">O que será entregue:</p>
              <ul className="list-disc list-inside text-xs text-slate-700 space-y-1">
                <li>Conector HTTPS com a API Smartonline autenticado pelo certificado digital da indústria.</li>
                <li>Emissão automática de GNRE a cada CT-e interestadual que exija o tributo.</li>
                <li>Anexo do PDF da GNRE ao MDF-e e ao e-mail da carga.</li>
                <li>Dashboard de conferência e reemissão em caso de divergência.</li>
              </ul>
            </div>
            <p className="text-xs text-muted-foreground">Entre em contato com o time comercial para orçamento e cronograma de integração.</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
