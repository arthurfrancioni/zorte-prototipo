import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
  Package, UploadCloud, CheckCircle2, ArrowLeft, Image as ImageIcon, Clock, LogOut,
} from "lucide-react";
import { parceiras, canhotos as canhotosBase, ctes, Canhoto, CanhotoStatus } from "@/lib/mock-data";
import { formatDateTime } from "@/lib/utils";

function statusBadge(s: CanhotoStatus) {
  if (s === "pendente") return <Badge variant="warning" className="text-[10px]">Pendente</Badge>;
  if (s === "recebido") return <Badge variant="info" className="text-[10px]">Recebido</Badge>;
  return <Badge variant="success" className="text-[10px]">Enviado ao cliente</Badge>;
}

export function PortalParceiros() {
  const navigate = useNavigate();
  const [parceiraId, setParceiraId] = useState(parceiras[0].id);
  const [canhotos, setCanhotos] = useState<Canhoto[]>(canhotosBase);
  const [upload, setUpload] = useState<Canhoto | null>(null);

  const parceira = parceiras.find(p => p.id === parceiraId)!;

  const entregas = useMemo(
    () => canhotos.filter(c => c.transportadoraParceira === parceiraId),
    [canhotos, parceiraId]
  );

  const totais = useMemo(() => ({
    total: entregas.length,
    pendentes: entregas.filter(c => c.status === "pendente").length,
    recebidos: entregas.filter(c => c.status === "recebido").length,
    enviados: entregas.filter(c => c.status === "enviado_cliente").length,
  }), [entregas]);

  const confirmarUpload = () => {
    if (!upload) return;
    setCanhotos(prev => prev.map(c => c.id === upload.id ? { ...c, status: "recebido" as CanhotoStatus, dataUpload: new Date().toISOString(), imagemUrl: "placeholder-canhoto.jpg" } : c));
    setUpload(null);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* banner preview */}
      <div className="bg-amber-100 border-b border-amber-300 px-6 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-amber-900">
          <span className="font-semibold uppercase tracking-wider">Preview</span>
          <span>·</span>
          <span>Esta é a visão que <strong>transportadoras parceiras</strong> terão do Zorte TMS ao acessar o portal externo.</span>
        </div>
        <Button size="sm" variant="outline" onClick={() => navigate("/")} className="h-7 text-xs bg-white">
          <ArrowLeft className="w-3 h-3 mr-1" /> Voltar ao TMS (admin)
        </Button>
      </div>

      {/* header próprio */}
      <header className="bg-white border-b px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold">Z</div>
          <div>
            <p className="font-semibold">Zorte TMS · Portal de Parceiros</p>
            <p className="text-xs text-muted-foreground">Acesso exclusivo para transportadoras terceirizadas</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Select value={parceiraId} onValueChange={setParceiraId}>
            <SelectTrigger className="w-72"><SelectValue /></SelectTrigger>
            <SelectContent>
              {parceiras.map(p => (
                <SelectItem key={p.id} value={p.id}>{p.nome} · {p.cidade}/{p.uf}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="ghost" size="sm"><LogOut className="w-4 h-4 mr-1.5" /> Sair</Button>
        </div>
      </header>

      <main className="px-8 py-6 max-w-[1400px] mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold">Olá, {parceira.nome}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            CNPJ {parceira.cnpj} · {parceira.entregasMes} entregas realizadas neste mês
          </p>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-6">
          <Card className="p-5">
            <p className="text-xs text-muted-foreground font-medium">Entregas atribuídas</p>
            <p className="text-2xl font-semibold mt-1">{totais.total}</p>
          </Card>
          <Card className="p-5">
            <p className="text-xs text-muted-foreground font-medium">Canhotos pendentes</p>
            <p className="text-2xl font-semibold mt-1 text-amber-700">{totais.pendentes}</p>
          </Card>
          <Card className="p-5">
            <p className="text-xs text-muted-foreground font-medium">Canhotos enviados</p>
            <p className="text-2xl font-semibold mt-1 text-blue-700">{totais.recebidos}</p>
          </Card>
          <Card className="p-5">
            <p className="text-xs text-muted-foreground font-medium">Concluídos</p>
            <p className="text-2xl font-semibold mt-1 text-emerald-700">{totais.enviados}</p>
          </Card>
        </div>

        <Card>
          <div className="p-5 border-b">
            <h3 className="text-sm font-semibold">Entregas atribuídas à sua transportadora</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Confirme a entrega e faça o upload do canhoto assinado</p>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>CT-e</TableHead>
                <TableHead>NF</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Destino</TableHead>
                <TableHead>Data entrega</TableHead>
                <TableHead>Status canhoto</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entregas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-10">
                    Nenhuma entrega atribuída no momento.
                  </TableCell>
                </TableRow>
              ) : entregas.map(c => {
                const cte = ctes.find(cc => cc.id === c.cteId);
                return (
                  <TableRow key={c.id}>
                    <TableCell className="font-mono text-blue-600 text-xs">{cte?.numero ?? "—"}</TableCell>
                    <TableCell className="font-mono text-xs">{c.numeroNF}</TableCell>
                    <TableCell className="font-medium">{c.cliente}</TableCell>
                    <TableCell className="text-xs">{cte?.cidadeDestino}/{cte?.ufDestino}</TableCell>
                    <TableCell className="text-xs">{new Date(c.dataEntrega).toLocaleDateString("pt-BR")}</TableCell>
                    <TableCell>{statusBadge(c.status)}</TableCell>
                    <TableCell>
                      {c.status === "pendente" ? (
                        <Button size="sm" onClick={() => setUpload(c)}>
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> Confirmar entrega
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {c.dataUpload ? formatDateTime(c.dataUpload) : "—"}
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>

        <Card className="p-5 mt-6 bg-slate-100 border-dashed border-2">
          <div className="flex items-start gap-3">
            <Package className="w-5 h-5 text-slate-600 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-700">
              <p className="font-semibold">Modelos de acesso disponíveis</p>
              <p className="mt-1">
                Este portal pode funcionar com <strong>login próprio</strong> da transportadora (usuário/senha) ou com <strong>link autenticado</strong> (token temporário) enviado junto ao e-mail da carga — a definir conforme a preferência da indústria.
              </p>
            </div>
          </div>
        </Card>
      </main>

      <Dialog open={!!upload} onOpenChange={() => setUpload(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar entrega</DialogTitle>
            <DialogDescription>
              NF <span className="font-mono">{upload?.numeroNF}</span> · {upload?.cliente}
            </DialogDescription>
          </DialogHeader>
          <div className="border-2 border-dashed rounded-lg p-8 text-center bg-slate-50">
            <UploadCloud className="w-10 h-10 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-medium">Tire ou arraste a foto do canhoto</p>
            <p className="text-xs text-muted-foreground mt-1">JPG ou PDF · até 10 MB</p>
            <Button variant="outline" size="sm" className="mt-3">Selecionar arquivo</Button>
          </div>
          <div className="flex items-center gap-2 text-xs bg-blue-50 border border-blue-200 rounded p-2">
            <ImageIcon className="w-3.5 h-3.5 text-blue-700" />
            <span className="text-blue-900">O canhoto é enviado à indústria e automaticamente ao cliente final.</span>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setUpload(null)}>Cancelar</Button>
            <Button className="flex-1" onClick={confirmarUpload}>
              <CheckCircle2 className="w-4 h-4 mr-2" /> Confirmar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
