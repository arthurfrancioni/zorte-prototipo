import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { ChevronLeft, ChevronRight, MapPin, Truck, AlertTriangle, Package, Clock3, Sun, Moon } from "lucide-react";
import { coletasRJ, motoristas, veiculos, ColetaStatus } from "@/lib/mock-data";

const STATUS_LABEL: Record<ColetaStatus, string> = {
  prevista: "Prevista",
  em_coleta: "Em coleta",
  coletada: "Coletada",
  cancelada: "Cancelada",
};

const STATUS_STYLE: Record<ColetaStatus, string> = {
  prevista: "bg-slate-100 text-slate-700",
  em_coleta: "bg-amber-100 text-amber-800",
  coletada: "bg-emerald-100 text-emerald-800",
  cancelada: "bg-rose-100 text-rose-800",
};

export function ColetasRJ() {
  const datasDisponiveis = useMemo(
    () => Array.from(new Set(coletasRJ.map(c => c.data))).sort(),
    []
  );
  const [dataAtual, setDataAtual] = useState(datasDisponiveis[0] ?? new Date().toISOString().slice(0, 10));

  const coletasDoDia = coletasRJ.filter(c => c.data === dataAtual);
  const manha = coletasDoDia.filter(c => c.janela === "manha");
  const tarde = coletasDoDia.filter(c => c.janela === "tarde");

  const indexAtual = datasDisponiveis.indexOf(dataAtual);
  const podeVoltar = indexAtual > 0;
  const podeAvancar = indexAtual < datasDisponiveis.length - 1;

  const totais = useMemo(() => ({
    coletas: coletasDoDia.length,
    peso: coletasDoDia.reduce((s, c) => s + c.pesoKg, 0),
    motoristas: new Set(coletasDoDia.map(c => c.motoristaId).filter(Boolean)).size,
  }), [coletasDoDia]);

  return (
    <div>
      <PageHeader
        title="Coletas RJ"
        description="Programação diária de coletas no Rio de Janeiro · visão separada para facilitar a gestão com múltiplas cargas por dia"
        badge={{ label: "Fase 1", variant: "phase1" }}
      />

      <div className="grid grid-cols-3 gap-4 mb-6">
        <StatCard label="Coletas programadas no dia" value={totais.coletas} icon={Package} iconColor="blue" />
        <StatCard label="Peso previsto" value={`${totais.peso.toLocaleString("pt-BR")} kg`} icon={Truck} iconColor="violet" />
        <StatCard label="Motoristas escalados" value={totais.motoristas} icon={Clock3} iconColor="emerald" />
      </div>

      <Card className="p-4 mb-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Button
              size="sm" variant="outline"
              onClick={() => podeVoltar && setDataAtual(datasDisponiveis[indexAtual - 1])}
              disabled={!podeVoltar}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Input
              type="date"
              value={dataAtual}
              onChange={e => setDataAtual(e.target.value)}
              className="w-44"
            />
            <Button
              size="sm" variant="outline"
              onClick={() => podeAvancar && setDataAtual(datasDisponiveis[indexAtual + 1])}
              disabled={!podeAvancar}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
          <div className="text-sm text-muted-foreground">
            <span className="font-medium text-slate-800">
              {new Date(dataAtual + "T00:00:00").toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" })}
            </span>
          </div>
        </div>
      </Card>

      <div className="space-y-4">
        <ColetaJanela titulo="Manhã" icon={Sun} iconColor="text-amber-600" coletas={manha} />
        <ColetaJanela titulo="Tarde" icon={Moon} iconColor="text-violet-600" coletas={tarde} />
      </div>
    </div>
  );
}

function ColetaJanela({
  titulo,
  icon: Icon,
  iconColor,
  coletas,
}: {
  titulo: string;
  icon: React.ElementType;
  iconColor: string;
  coletas: typeof coletasRJ;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-center gap-2 mb-4">
        <Icon className={`w-4 h-4 ${iconColor}`} />
        <h3 className="text-sm font-semibold">Janela · {titulo}</h3>
        <Badge variant="muted" className="text-[10px]">{coletas.length} coleta(s)</Badge>
      </div>
      {coletas.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-6">Nenhuma coleta programada nesta janela.</p>
      ) : (
        <div className="space-y-2">
          {coletas.map(c => {
            const motorista = motoristas.find(m => m.id === c.motoristaId);
            const veiculo = veiculos.find(v => v.id === c.veiculoId);
            return (
              <div key={c.id} className="border rounded-md p-3 hover:bg-slate-50">
                <div className="flex items-start gap-4">
                  <div className="font-mono text-sm font-semibold text-slate-700 w-14 pt-0.5">{c.horaPrevista}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-sm">{c.remetenteNome}</p>
                      {c.urgencia === "urgente" && (
                        <span className="inline-flex items-center gap-1 text-[10px] bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded font-medium">
                          <AlertTriangle className="w-3 h-3" />URGENTE
                        </span>
                      )}
                      <span className={`ml-auto inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${STATUS_STYLE[c.status]}`}>
                        {STATUS_LABEL[c.status]}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                      <MapPin className="w-3 h-3" />{c.remetenteEndereco}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 text-xs">
                      <span><span className="text-muted-foreground">→ destino:</span> <strong>{c.clienteDestino} · {c.destinoUF}</strong></span>
                      <span><span className="text-muted-foreground">Produto:</span> {c.produto}</span>
                      <span><span className="text-muted-foreground">Peso:</span> {c.pesoKg.toLocaleString("pt-BR")} kg</span>
                      {motorista && (
                        <span className="flex items-center gap-1">
                          <Truck className="w-3 h-3 text-muted-foreground" />
                          {motorista.nome} · <span className="font-mono">{veiculo?.placa}</span>
                        </span>
                      )}
                    </div>
                    {c.observacao && (
                      <p className="text-[11px] text-amber-700 mt-1">↳ {c.observacao}</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
