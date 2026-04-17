import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Mail, Users2, Edit2, Trash2, Send } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { gruposEmail, cargas, motoristas, veiculos } from "@/lib/mock-data";

export function GruposEmail() {
  const [selected, setSelected] = useState(gruposEmail[0].id);
  const grupo = gruposEmail.find(g => g.id === selected)!;
  const motorista = motoristas.find(m => m.id === cargas[0].motoristaId);
  const veiculo = veiculos.find(v => v.id === cargas[0].veiculoId);

  return (
    <div>
      <PageHeader
        title="Grupos de E-mail"
        description="Cadastre grupos de destinatários por operação ou região e personalize templates"
        badge={{ label: "Fase 1", variant: "phase1" }}
        actions={<Button size="sm"><Plus className="w-3.5 h-3.5 mr-1.5" />Novo grupo</Button>}
      />

      <div className="grid grid-cols-[340px_1fr] gap-4">
        <div className="space-y-2">
          {gruposEmail.map(g => (
            <Card key={g.id} onClick={() => setSelected(g.id)} className={`p-4 cursor-pointer transition-colors ${selected === g.id ? "ring-2 ring-primary" : "hover:bg-slate-50"}`}>
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                  <Users2 className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{g.nome}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{g.descricao}</p>
                  <div className="flex items-center gap-3 mt-1.5 text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{g.emails.length}</span>
                    <span>·</span>
                    <span>{g.operacoes.length} operações</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="space-y-4">
          <Card className="p-5">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-base font-semibold">{grupo.nome}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{grupo.descricao}</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline"><Edit2 className="w-3.5 h-3.5 mr-1.5" />Editar</Button>
                <Button size="sm" variant="outline" className="text-rose-600 hover:text-rose-700"><Trash2 className="w-3.5 h-3.5" /></Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-xs text-muted-foreground font-medium mb-2">Destinatários ({grupo.emails.length})</p>
                <div className="space-y-1">
                  {grupo.emails.map(e => (
                    <div key={e} className="flex items-center gap-2 p-2 rounded bg-slate-50 text-xs">
                      <Mail className="w-3 h-3 text-muted-foreground" />
                      <span className="font-mono">{e}</span>
                    </div>
                  ))}
                </div>
                <Button size="sm" variant="ghost" className="w-full mt-2"><Plus className="w-3.5 h-3.5 mr-1.5" />Adicionar e-mail</Button>
              </div>

              <div>
                <p className="text-xs text-muted-foreground font-medium mb-2">Operações vinculadas</p>
                <div className="flex flex-wrap gap-1.5">
                  {grupo.operacoes.map(op => (
                    <Badge key={op} variant="info" className="capitalize">{op.replace("_", " ")}</Badge>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground font-medium mt-4 mb-2">Disparo automático</p>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  <span>Ao formar uma carga</span>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold">Preview do template</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Este é o e-mail que será disparado automaticamente ao formar uma carga com este grupo</p>
              </div>
              <Button size="sm" variant="outline"><Send className="w-3.5 h-3.5 mr-1.5" />Enviar teste</Button>
            </div>

            <div className="border rounded-lg overflow-hidden">
              <div className="bg-slate-50 p-3 border-b text-xs space-y-1">
                <div className="flex gap-2"><span className="text-muted-foreground w-14">De:</span><span>logistica@transportadora.com.br</span></div>
                <div className="flex gap-2"><span className="text-muted-foreground w-14">Para:</span><span className="font-mono text-[11px]">{grupo.emails.join("; ")}</span></div>
                <div className="flex gap-2"><span className="text-muted-foreground w-14">Assunto:</span><span className="font-medium">CRG-2026-0018 · RS → SP · 17/04 07:30 · {motorista?.nome} · {veiculo?.placa}</span></div>
              </div>
              <div className="p-4 text-sm space-y-3 bg-white">
                <p>Prezados,</p>
                <p>Segue a programação de carga:</p>
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
                    <tr className="border-b"><td className="py-1.5 font-mono">12.7934</td><td>Primo Tedesco</td><td>Ribeirão Preto/SP</td><td className="text-right">620 kg</td></tr>
                    <tr className="border-b"><td className="py-1.5 font-mono">12.8012</td><td>Fernando CSA</td><td>Campinas/SP</td><td className="text-right">280 kg</td></tr>
                    <tr className="border-b"><td className="py-1.5 font-mono">12.8055</td><td>Zanzalog</td><td>Santos/SP (Redespacho)</td><td className="text-right">180 kg</td></tr>
                  </tbody>
                </table>
                <div className="text-xs bg-slate-50 p-2 rounded">
                  <p><span className="text-muted-foreground">Motorista:</span> <span className="font-medium">{motorista?.nome}</span></p>
                  <p><span className="text-muted-foreground">Placa:</span> <span className="font-mono font-medium">{veiculo?.placa}</span> · CNH {motorista?.cnh}</p>
                  <p><span className="text-muted-foreground">Saída:</span> 17/04/2026 às 07:30 · Nova Santa Rita/RS</p>
                </div>
                <p className="text-xs text-muted-foreground">Solicitamos o faturamento dos pedidos acima. Aguardamos o retorno com os XMLs e DANFEs.</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
