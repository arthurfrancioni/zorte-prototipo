import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Phone, Star, Edit2, FileSpreadsheet, Info } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { motoristas, veiculos, tabelasFrete } from "@/lib/mock-data";
import { useProfile } from "@/lib/profile-context";
import { formatCurrency } from "@/lib/utils";

export function Motoristas() {
  const { capabilities } = useProfile();
  const canEdit = capabilities.canEdit("cadastros");
  return (
    <div>
      <PageHeader
        title="Motoristas"
        description={`${motoristas.length} motoristas cadastrados · ${motoristas.filter(m => m.ativo).length} ativos`}
        badge={{ label: "Fase 1", variant: "phase1" }}
        actions={<Button size="sm" disabled={!canEdit} title={!canEdit ? "Somente leitura" : undefined}><Plus className="w-3.5 h-3.5 mr-1.5" />Novo motorista</Button>}
      />

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Motorista</TableHead>
              <TableHead>CPF</TableHead>
              <TableHead>CNH</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>Veículo vinculado</TableHead>
              <TableHead className="text-right">Cargas/mês</TableHead>
              <TableHead>Avaliação</TableHead>
              <TableHead>Status</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {motoristas.map(m => {
              const v = veiculos.find(vv => vv.motoristaId === m.id);
              return (
                <TableRow key={m.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-white text-xs font-semibold flex items-center justify-center">
                        {m.nome.split(" ").map(n => n[0]).slice(0, 2).join("")}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{m.nome}</p>
                        <p className="text-xs text-muted-foreground">Cat. {m.categoria}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{m.cpf}</TableCell>
                  <TableCell className="font-mono text-xs">{m.cnh}</TableCell>
                  <TableCell><div className="flex items-center gap-1 text-sm"><Phone className="w-3 h-3 text-muted-foreground" />{m.telefone}</div></TableCell>
                  <TableCell>{v ? <span className="font-mono text-sm">{v.placa}</span> : <span className="text-xs text-muted-foreground">—</span>}</TableCell>
                  <TableCell className="text-right font-medium">{m.cargasMes}</TableCell>
                  <TableCell><div className="flex items-center gap-1"><Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /><span className="text-sm font-medium">{m.avaliacao}</span></div></TableCell>
                  <TableCell>{m.ativo ? <Badge variant="success">Ativo</Badge> : <Badge variant="muted">Inativo</Badge>}</TableCell>
                  <TableCell><Button size="sm" variant="ghost" disabled={!canEdit}><Edit2 className="w-3.5 h-3.5" /></Button></TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

export function Veiculos() {
  const { capabilities } = useProfile();
  const canEdit = capabilities.canEdit("cadastros");
  return (
    <div>
      <PageHeader
        title="Veículos"
        description={`${veiculos.length} veículos cadastrados`}
        badge={{ label: "Fase 1", variant: "phase1" }}
        actions={<Button size="sm" disabled={!canEdit} title={!canEdit ? "Somente leitura" : undefined}><Plus className="w-3.5 h-3.5 mr-1.5" />Novo veículo</Button>}
      />

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Placa</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead className="text-right">Capacidade</TableHead>
              <TableHead>Motorista vinculado</TableHead>
              <TableHead>Status</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {veiculos.map(v => {
              const m = motoristas.find(mm => mm.id === v.motoristaId);
              return (
                <TableRow key={v.id}>
                  <TableCell className="font-mono font-medium">{v.placa}</TableCell>
                  <TableCell className="capitalize">{v.tipo}</TableCell>
                  <TableCell className="text-right font-medium">{v.capacidadeKg.toLocaleString("pt-BR")} kg</TableCell>
                  <TableCell>{m ? m.nome : <span className="text-xs text-muted-foreground">—</span>}</TableCell>
                  <TableCell>{v.ativo ? <Badge variant="success">Ativo</Badge> : <Badge variant="muted">Inativo</Badge>}</TableCell>
                  <TableCell><Button size="sm" variant="ghost" disabled={!canEdit}><Edit2 className="w-3.5 h-3.5" /></Button></TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

export function TabelaFrete() {
  const { capabilities } = useProfile();
  const canEdit = capabilities.canEdit("cadastros");

  return (
    <div>
      <PageHeader
        title="Tabela de Frete"
        description={`${tabelasFrete.length} faixas cadastradas · cálculo automático aplicado na emissão de CT-e`}
        badge={{ label: "Fase 1", variant: "phase1" }}
        actions={<Button size="sm" disabled={!canEdit} title={!canEdit ? "Somente leitura" : undefined}><Plus className="w-3.5 h-3.5 mr-1.5" />Nova faixa</Button>}
      />

      <Card className="p-4 mb-4 bg-blue-50 border-blue-200 flex items-start gap-3">
        <Info className="w-4 h-4 text-blue-700 mt-0.5 shrink-0" />
        <div className="text-xs text-blue-900">
          <p className="font-semibold">Cálculo automatizado na emissão de CT-e</p>
          <p className="mt-0.5">Cada CT-e do lote consulta a tabela pela rota (origem → destino) e faixa de peso. Aplica-se valor mínimo se o cálculo por kg ficar abaixo. A tabela enviada pela <strong>Dorfketal</strong> foi pré-carregada como referência.</p>
        </div>
      </Card>

      <Card className="p-4 mb-4 bg-violet-50 border-violet-200 text-xs text-violet-900">
        <p className="font-semibold mb-1">Como o sistema calcula o frete de cada CT-e</p>
        <p>Para cada nota fiscal o sistema localiza a faixa pela rota e peso, e aplica: <strong>Frete = (peso × R$/kg) + Fixo + (Valor NF × ad valorem%) + ICMS embutido</strong>. Se o cálculo ficar abaixo do <strong>Mínimo</strong>, este prevalece. <strong>Cargas fracionadas</strong> (até 599kg) usam estrutura de valor fixo + ad valorem; <strong>lotação</strong> (≥600kg) usa R$/kg.</p>
      </Card>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead><FileSpreadsheet className="w-3 h-3 inline mr-1" />Origem</TableHead>
              <TableHead>Destino</TableHead>
              <TableHead>Faixa de peso</TableHead>
              <TableHead className="text-right">R$ / kg</TableHead>
              <TableHead className="text-right">Fixo</TableHead>
              <TableHead className="text-right">Mínimo</TableHead>
              <TableHead className="text-right">Ad valorem</TableHead>
              <TableHead className="text-right">ICMS</TableHead>
              <TableHead>Modalidade</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tabelasFrete.map(t => (
              <TableRow key={t.id}>
                <TableCell className="text-sm font-medium">{t.origem}</TableCell>
                <TableCell className="text-sm">{t.destino}</TableCell>
                <TableCell className="text-xs">
                  <span>{t.faixaPeso}</span>
                  {t.observacao && <p className="text-[10px] text-muted-foreground mt-0.5">{t.observacao}</p>}
                </TableCell>
                <TableCell className="text-right font-medium">{t.valorPorKg > 0 ? `R$ ${t.valorPorKg.toFixed(2).replace(".", ",")}` : "—"}</TableCell>
                <TableCell className="text-right font-medium">{t.valorFixo > 0 ? formatCurrency(t.valorFixo) : "—"}</TableCell>
                <TableCell className="text-right font-medium">{formatCurrency(t.valorMinimo)}</TableCell>
                <TableCell className="text-right text-amber-700 font-medium">{t.adValoremPct.toFixed(2).replace(".", ",")}%</TableCell>
                <TableCell className="text-right text-sky-700 font-medium">{t.icmsEmbutidoPct.toFixed(1).replace(".", ",")}%</TableCell>
                <TableCell>
                  {t.modalidade === "venda" && <Badge variant="info">Venda</Badge>}
                  {t.modalidade === "transferencia" && <Badge variant="warning">Transferência</Badge>}
                  {t.modalidade === "redespacho" && <Badge variant="success">Redespacho</Badge>}
                </TableCell>
                <TableCell><Button size="sm" variant="ghost" disabled={!canEdit}><Edit2 className="w-3.5 h-3.5" /></Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
