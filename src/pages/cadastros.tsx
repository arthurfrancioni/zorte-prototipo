import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Phone, Star, Edit2 } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { motoristas, veiculos } from "@/lib/mock-data";

export function Motoristas() {
  return (
    <div>
      <PageHeader
        title="Motoristas"
        description={`${motoristas.length} motoristas cadastrados · ${motoristas.filter(m => m.ativo).length} ativos`}
        badge={{ label: "Fase 1", variant: "phase1" }}
        actions={<Button size="sm"><Plus className="w-3.5 h-3.5 mr-1.5" />Novo motorista</Button>}
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
                  <TableCell><Button size="sm" variant="ghost"><Edit2 className="w-3.5 h-3.5" /></Button></TableCell>
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
  return (
    <div>
      <PageHeader
        title="Veículos"
        description={`${veiculos.length} veículos cadastrados`}
        badge={{ label: "Fase 1", variant: "phase1" }}
        actions={<Button size="sm"><Plus className="w-3.5 h-3.5 mr-1.5" />Novo veículo</Button>}
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
                  <TableCell><Button size="sm" variant="ghost"><Edit2 className="w-3.5 h-3.5" /></Button></TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
