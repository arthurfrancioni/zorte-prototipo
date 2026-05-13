import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pedido } from "@/lib/mock-data";
import { FileText, Upload, Sparkles, CheckCircle2 } from "lucide-react";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreate: (p: Pedido) => void;
};

// Mock dos campos que viriam do XML quando o usuário "importa" (Rodrigo: só descrição do produto fica editável)
const XML_MOCK = {
  oc: "AMOSTRA-SA174",
  cliente: "LABTOX",
  cnpjCliente: "14.555.666/0007-00",
  cidade: "Rio de Janeiro",
  uf: "RJ",
  pesoBruto: 0.25,
  pesoLiquido: 0.25,
  valor: 220,
  quantidade: 1,
  embalagem: "Caixa de papelão",
  notaFiscal: "14164",
  chaveNFe: "33260499999999000100550010000141640001234567",
};

function gerarId() {
  return `np${Date.now().toString(36)}`;
}

export function NovoPedidoDialog({ open, onOpenChange, onCreate }: Props) {
  const [tab, setTab] = useState<"xml" | "manual">("xml");

  // XML tab — apenas descrição editável
  const [xmlImported, setXmlImported] = useState(false);
  const [xmlProduto, setXmlProduto] = useState("Amostra · SA 174 (descrição a confirmar com Faturamento)");

  // Manual tab
  const [m, setM] = useState({
    oc: "", cliente: "", cnpjCliente: "", cidade: "", uf: "SP",
    produto: "", embalagem: "Caixa", quantidade: 1, pesoBruto: 0, valor: 0,
    prazo: "2026-04-30", tipoOperacao: "venda" as "venda" | "transferencia" | "coleta_fornecedor",
  });

  const reset = () => {
    setXmlImported(false);
    setXmlProduto("Amostra · SA 174 (descrição a confirmar com Faturamento)");
    setM({ oc: "", cliente: "", cnpjCliente: "", cidade: "", uf: "SP", produto: "", embalagem: "Caixa", quantidade: 1, pesoBruto: 0, valor: 0, prazo: "2026-04-30", tipoOperacao: "venda" });
  };

  const criarFromXml = () => {
    const p: Pedido = {
      id: gerarId(),
      oc: XML_MOCK.oc,
      cliente: XML_MOCK.cliente,
      cnpjCliente: XML_MOCK.cnpjCliente,
      cidade: XML_MOCK.cidade,
      uf: XML_MOCK.uf,
      produto: xmlProduto,
      embalagem: XML_MOCK.embalagem,
      quantidade: XML_MOCK.quantidade,
      pesoBruto: XML_MOCK.pesoBruto,
      pesoLiquido: XML_MOCK.pesoLiquido,
      valor: XML_MOCK.valor,
      prazo: "2026-04-30",
      dataEntrada: new Date().toISOString().slice(0, 10),
      status: "liberado",
      origemLiberacao: "Importado via XML da NF",
      tipoOperacao: "venda",
      notaFiscal: XML_MOCK.notaFiscal,
      chaveNFe: XML_MOCK.chaveNFe,
      observacao: "Pedido criado a partir de XML — apenas a descrição do produto foi editada manualmente",
    };
    onCreate(p);
    reset();
    onOpenChange(false);
  };

  const criarManual = () => {
    if (!m.oc || !m.cliente || !m.produto) return;
    const p: Pedido = {
      id: gerarId(),
      oc: m.oc, cliente: m.cliente, cnpjCliente: m.cnpjCliente || "—",
      cidade: m.cidade || "—", uf: m.uf,
      produto: m.produto, embalagem: m.embalagem, quantidade: m.quantidade,
      pesoBruto: m.pesoBruto, pesoLiquido: m.pesoBruto,
      valor: m.valor, prazo: m.prazo,
      dataEntrada: new Date().toISOString().slice(0, 10),
      status: "liberado",
      origemLiberacao: "Cadastro manual",
      tipoOperacao: m.tipoOperacao,
      observacao: "Pedido criado manualmente (não veio da planilha)",
    };
    onCreate(p);
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Novo pedido</DialogTitle>
          <p className="text-xs text-muted-foreground">Use o XML da NF (rápido) ou cadastre manualmente (amostras, coffee carga, headset etc.)</p>
        </DialogHeader>

        <Tabs value={tab} onValueChange={(v) => setTab(v as "xml" | "manual")} className="mt-2">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="xml"><FileText className="w-3.5 h-3.5 mr-1.5" />Importar XML</TabsTrigger>
            <TabsTrigger value="manual"><Sparkles className="w-3.5 h-3.5 mr-1.5" />Manual</TabsTrigger>
          </TabsList>

          <TabsContent value="xml" className="space-y-3 mt-3">
            {!xmlImported ? (
              <Card className="p-8 border-2 border-dashed text-center cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => setXmlImported(true)}>
                <Upload className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                <p className="text-sm font-medium">Clique ou arraste o XML da NF aqui</p>
                <p className="text-xs text-muted-foreground mt-1">O sistema extrai automaticamente CNPJ, destinatário, peso e valor</p>
              </Card>
            ) : (
              <>
                <Card className="p-3 bg-emerald-50 border-emerald-200 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 mt-0.5 shrink-0" />
                  <div className="text-xs">
                    <p className="font-semibold text-emerald-900">XML lido com sucesso</p>
                    <p className="text-emerald-800 font-mono mt-0.5 text-[10px]">Chave: {XML_MOCK.chaveNFe}</p>
                  </div>
                </Card>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><p className="text-xs text-muted-foreground">OC</p><p className="font-medium font-mono">{XML_MOCK.oc}</p></div>
                  <div><p className="text-xs text-muted-foreground">NF</p><p className="font-medium font-mono">{XML_MOCK.notaFiscal}</p></div>
                  <div><p className="text-xs text-muted-foreground">Destinatário</p><p className="font-medium">{XML_MOCK.cliente} · {XML_MOCK.cnpjCliente}</p></div>
                  <div><p className="text-xs text-muted-foreground">Destino</p><p className="font-medium">{XML_MOCK.cidade}/{XML_MOCK.uf}</p></div>
                  <div><p className="text-xs text-muted-foreground">Peso bruto</p><p className="font-medium">{XML_MOCK.pesoBruto} kg</p></div>
                  <div><p className="text-xs text-muted-foreground">Valor</p><p className="font-medium">R$ {XML_MOCK.valor.toFixed(2)}</p></div>
                </div>

                <div>
                  <Label className="text-xs">Descrição do produto <span className="text-amber-700">(editável — Rodrigo pediu)</span></Label>
                  <Input value={xmlProduto} onChange={e => setXmlProduto(e.target.value)} className="mt-1" />
                  <p className="text-[10px] text-muted-foreground mt-1">Faturamento pode ter cadastrado o produto com outro nome técnico. Ajuste aqui para o operacional reconhecer.</p>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={() => setXmlImported(false)}>Trocar XML</Button>
                  <Button className="flex-1" onClick={criarFromXml}>Criar pedido</Button>
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="manual" className="mt-3">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <Label className="text-xs">OC *</Label>
                <Input value={m.oc} onChange={e => setM({ ...m, oc: e.target.value })} placeholder="12.8200 ou COFRE-001" className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">Tipo de operação *</Label>
                <Select value={m.tipoOperacao} onValueChange={v => setM({ ...m, tipoOperacao: v as any })}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="venda">Venda</SelectItem>
                    <SelectItem value="transferencia">Transferência</SelectItem>
                    <SelectItem value="coleta_fornecedor">Coleta de fornecedor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <Label className="text-xs">Cliente / Destinatário *</Label>
                <Input value={m.cliente} onChange={e => setM({ ...m, cliente: e.target.value })} placeholder="Ex: LABTOX, ARM TRIÂNGULO" className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">CNPJ</Label>
                <Input value={m.cnpjCliente} onChange={e => setM({ ...m, cnpjCliente: e.target.value })} placeholder="00.000.000/0000-00" className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">Cidade</Label>
                <Input value={m.cidade} onChange={e => setM({ ...m, cidade: e.target.value })} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">UF</Label>
                <Select value={m.uf} onValueChange={v => setM({ ...m, uf: v })}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["SP", "RJ", "SC", "RS", "BA", "PE", "MG", "PR"].map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Prazo</Label>
                <Input type="date" value={m.prazo} onChange={e => setM({ ...m, prazo: e.target.value })} className="mt-1" />
              </div>
              <div className="col-span-2">
                <Label className="text-xs">Produto / descrição *</Label>
                <Input value={m.produto} onChange={e => setM({ ...m, produto: e.target.value })} placeholder="Ex: Cofre carga, Headset corporate, Notebook Dell" className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">Embalagem</Label>
                <Input value={m.embalagem} onChange={e => setM({ ...m, embalagem: e.target.value })} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">Quantidade</Label>
                <Input type="number" value={m.quantidade} onChange={e => setM({ ...m, quantidade: +e.target.value })} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">Peso bruto (kg)</Label>
                <Input type="number" value={m.pesoBruto} onChange={e => setM({ ...m, pesoBruto: +e.target.value })} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">Valor (R$)</Label>
                <Input type="number" value={m.valor} onChange={e => setM({ ...m, valor: +e.target.value })} className="mt-1" />
              </div>
            </div>
            <Button className="w-full mt-4" onClick={criarManual} disabled={!m.oc || !m.cliente || !m.produto}>
              Criar pedido
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
