import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { FileText, UploadCloud, Mail, Eye, Send, CheckCircle2, Clock, Inbox, Search, Image as ImageIcon } from "lucide-react";
import {
  canhotos as canhotosBase, ctes, motoristas, parceiras, Canhoto, CanhotoStatus,
} from "@/lib/mock-data";
import { useProfile } from "@/lib/profile-context";
import { formatDateTime } from "@/lib/utils";

const STATUS_LABEL: Record<CanhotoStatus, string> = {
  pendente: "Pendente",
  recebido: "Recebido",
  enviado_cliente: "Enviado ao cliente",
};

function statusBadge(s: CanhotoStatus) {
  if (s === "pendente") return <Badge variant="warning" className="text-[10px]">{STATUS_LABEL[s]}</Badge>;
  if (s === "recebido") return <Badge variant="info" className="text-[10px]">{STATUS_LABEL[s]}</Badge>;
  return <Badge variant="success" className="text-[10px]">{STATUS_LABEL[s]}</Badge>;
}

export function Canhotos() {
  const { capabilities } = useProfile();
  const canEdit = capabilities.canEdit("canhotos_upload");
  const [list, setList] = useState<Canhoto[]>(canhotosBase);
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<string>("todos");
  const [upload, setUpload] = useState<Canhoto | null>(null);
  const [envio, setEnvio] = useState<Canhoto | null>(null);
  const [preview, setPreview] = useState<Canhoto | null>(null);
  const [emailAssunto, setEmailAssunto] = useState("");
  const [emailCorpo, setEmailCorpo] = useState("");

  const filtrados = useMemo(() => {
    return list.filter(c => {
      if (filtroStatus !== "todos" && c.status !== filtroStatus) return false;
      if (busca) {
        const cte = ctes.find(cc => cc.id === c.cteId);
        const txt = `${cte?.numero ?? ""} ${c.numeroNF} ${c.cliente}`.toLowerCase();
        if (!txt.includes(busca.toLowerCase())) return false;
      }
      return true;
    });
  }, [list, busca, filtroStatus]);

  const totais = useMemo(() => ({
    pendentes: list.filter(c => c.status === "pendente").length,
    recebidos: list.filter(c => c.status === "recebido").length,
    enviados: list.filter(c => c.status === "enviado_cliente").length,
    total: list.length,
  }), [list]);

  const fazerUpload = () => {
    if (!upload) return;
    setList(prev => prev.map(c => c.id === upload.id ? { ...c, status: "recebido" as CanhotoStatus, dataUpload: new Date().toISOString(), imagemUrl: "placeholder-canhoto.jpg" } : c));
    setUpload(null);
  };

  const abrirEnvio = (c: Canhoto) => {
    setEnvio(c);
    setEmailAssunto(`Canhoto da NF ${c.numeroNF} · ${c.cliente}`);
    setEmailCorpo(`Prezados,\n\nSegue o canhoto assinado da Nota Fiscal ${c.numeroNF} entregue em ${new Date(c.dataEntrega).toLocaleDateString("pt-BR")}.\n\nQualquer dúvida, estamos à disposição.\n\nAtenciosamente,\nEquipe de Logística`);
  };

  const enviar = () => {
    if (!envio) return;
    setList(prev => prev.map(c => c.id === envio.id ? { ...c, status: "enviado_cliente" as CanhotoStatus, dataEnvioCliente: new Date().toISOString() } : c));
    setEnvio(null);
  };

  return (
    <div>
      <PageHeader
        title="Canhotos de NF"
        description="Recebimento de canhotos assinados e envio automático por e-mail aos clientes"
        badge={{ label: "Fase 1", variant: "phase1" }}
      />

      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard label="Pendentes" value={totais.pendentes} icon={Clock} iconColor="amber" />
        <StatCard label="Recebidos" value={totais.recebidos} icon={Inbox} iconColor="blue" />
        <StatCard label="Enviados ao cliente" value={totais.enviados} icon={CheckCircle2} iconColor="emerald" />
        <StatCard label="Total no mês" value={totais.total} icon={FileText} iconColor="violet" />
      </div>

      <Card className="p-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Buscar por CT-e, NF ou cliente..." className="pl-9" value={busca} onChange={e => setBusca(e.target.value)} />
          </div>
          <Select value={filtroStatus} onValueChange={setFiltroStatus}>
            <SelectTrigger className="w-60"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os status</SelectItem>
              <SelectItem value="pendente">Pendente</SelectItem>
              <SelectItem value="recebido">Recebido</SelectItem>
              <SelectItem value="enviado_cliente">Enviado ao cliente</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>CT-e</TableHead>
              <TableHead>NF</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Motorista / Parceira</TableHead>
              <TableHead>Data entrega</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtrados.map(c => {
              const cte = ctes.find(cc => cc.id === c.cteId);
              const motorista = motoristas.find(m => m.id === c.motoristaId);
              const parceira = c.transportadoraParceira ? parceiras.find(p => p.id === c.transportadoraParceira) : null;
              return (
                <TableRow key={c.id}>
                  <TableCell className="font-mono text-blue-600 text-xs">{cte?.numero ?? "—"}</TableCell>
                  <TableCell className="font-mono text-xs">{c.numeroNF}</TableCell>
                  <TableCell className="font-medium">{c.cliente}</TableCell>
                  <TableCell className="text-xs">
                    {parceira ? (
                      <div>
                        <p className="font-medium">{parceira.nome}</p>
                        <p className="text-muted-foreground">Parceira · {parceira.uf}</p>
                      </div>
                    ) : (
                      <div>
                        <p>{motorista?.nome ?? "—"}</p>
                        <p className="text-muted-foreground">Frota própria</p>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-xs">{new Date(c.dataEntrega).toLocaleDateString("pt-BR")}</TableCell>
                  <TableCell>{statusBadge(c.status)}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {c.status === "pendente" && (
                        <Button size="sm" variant="outline" onClick={() => setUpload(c)} disabled={!canEdit} title={!canEdit ? "Somente leitura" : undefined}>
                          <UploadCloud className="w-3.5 h-3.5 mr-1" /> Upload
                        </Button>
                      )}
                      {c.status === "recebido" && (
                        <Button size="sm" variant="outline" onClick={() => abrirEnvio(c)} disabled={!canEdit}>
                          <Mail className="w-3.5 h-3.5 mr-1" /> Enviar
                        </Button>
                      )}
                      {c.imagemUrl && (
                        <Button size="sm" variant="ghost" onClick={() => setPreview(c)}>
                          <Eye className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={!!upload} onOpenChange={() => setUpload(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Upload do canhoto</DialogTitle>
            <DialogDescription>
              NF <span className="font-mono">{upload?.numeroNF}</span> · {upload?.cliente}
            </DialogDescription>
          </DialogHeader>
          <div className="border-2 border-dashed rounded-lg p-8 text-center bg-slate-50">
            <UploadCloud className="w-10 h-10 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-medium">Arraste a foto do canhoto ou clique para selecionar</p>
            <p className="text-xs text-muted-foreground mt-1">JPG ou PDF · até 10 MB</p>
            <Button variant="outline" size="sm" className="mt-3">Selecionar arquivo</Button>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setUpload(null)}>Cancelar</Button>
            <Button className="flex-1" onClick={fazerUpload}>
              <UploadCloud className="w-4 h-4 mr-2" /> Confirmar upload
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!envio} onOpenChange={() => setEnvio(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Enviar canhoto ao cliente</DialogTitle>
            <DialogDescription>
              O canhoto será enviado como anexo ao e-mail do cliente cadastrado.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-xs">Destinatário</Label>
              <Input value={envio?.clienteEmail ?? ""} readOnly className="mt-1 bg-slate-50 font-mono text-xs" />
            </div>
            <div>
              <Label className="text-xs">Assunto</Label>
              <Input value={emailAssunto} onChange={e => setEmailAssunto(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Corpo</Label>
              <Textarea value={emailCorpo} onChange={e => setEmailCorpo(e.target.value)} className="mt-1 min-h-[140px]" />
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded p-2 flex items-center gap-2 text-xs text-blue-900">
              <ImageIcon className="w-3.5 h-3.5" />
              Anexo: canhoto-{envio?.numeroNF}.jpg
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setEnvio(null)}>Cancelar</Button>
            <Button className="flex-1" onClick={enviar}>
              <Send className="w-4 h-4 mr-2" /> Enviar e-mail
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!preview} onOpenChange={() => setPreview(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Canhoto · NF {preview?.numeroNF}</DialogTitle>
            <DialogDescription>
              {preview && preview.dataUpload && <>Upload: {formatDateTime(preview.dataUpload)}</>}
              {preview && preview.dataEnvioCliente && <> · Enviado ao cliente: {formatDateTime(preview.dataEnvioCliente)}</>}
            </DialogDescription>
          </DialogHeader>
          <div className="aspect-[3/4] bg-slate-100 border rounded flex items-center justify-center">
            <div className="text-center">
              <ImageIcon className="w-12 h-12 text-slate-400 mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">Preview do canhoto (placeholder)</p>
              <p className="text-[11px] text-muted-foreground mt-0.5 font-mono">canhoto-{preview?.numeroNF}.jpg</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
