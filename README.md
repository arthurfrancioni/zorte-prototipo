# Zorte TMS — Protótipo Visual

Protótipo navegável do escopo da Zorte para a transportadora cativa.
Foca nas **novidades** que a Zorte entregará: Fase 1 (Pré-TMS), Fase 3 (Risco) e Fase 4 (Automações).

> A Fase 2 (TMS completo: CT-e, MDF-e, CIOT, vale-pedágio, averbação, comprovação de entrega etc.) **não está neste protótipo** porque já existe hoje no Zorte e foi apresentada ao cliente na reunião. O protótipo mostra apenas o que vai ser desenvolvido de novo.

## Stack

- **Vite 5** + **React 18** + **TypeScript**
- **Tailwind CSS 3** com tokens do design system Zorte
- **Shadcn UI** (Radix primitives customizados)
- **Recharts** para gráficos
- **Lucide React** para ícones
- **React Router 6** para navegação

## Como rodar

```bash
pnpm install
pnpm dev
```

Abra http://localhost:5173

> Funciona também com `npm install && npm run dev` ou `yarn && yarn dev`.

## Telas implementadas

### Visão Geral (3)
- **Dashboard Geral** — KPIs, status das cargas, cargas por mês, regiões, tipo de mercado, top clientes
- **Dashboard de Clientes** — ranking + drill-down por cliente
- **Dashboard de Transportadora** — drill-down por motorista/placa

### Fase 1 — Pré-TMS (6)
- **Importar Teams** — integração com planilha do Microsoft Teams (com timer de sync ao vivo)
- **Pedidos** — listagem, filtros, busca e detalhe
- **Formação de Carga** — seleção de pedidos + totais em tempo real + progress da carreta ★ tela estrela
- **Grupos de E-mail** — CRUD + preview do template disparado automaticamente
- **Motoristas** e **Veículos**

### Fase 3 — Risco (1)
- **Integração TecnoRisk** — solicitação automática de monitoramento (marcada como condicional à API)

### Fase 4 — Automações (2)
- **Sugestão Automática de Carga** — 3 cargas sugeridas com score, razões e ocupação
- **Emissão Automática de CT-e** — pipeline de emissão com exceção para piso mínimo ANTT

## Estrutura

```
src/
├── main.tsx, App.tsx, index.css
├── lib/
│   ├── utils.ts                # cn + formatadores BR
│   └── mock-data.ts            # dados de demonstração
├── components/
│   ├── ui/                     # Shadcn
│   ├── layout/                 # Sidebar, Topbar, PageHeader
│   └── shared/                 # StatCard, StatusBadge
└── pages/                      # 12 telas
```

## Fluxo sugerido para demo com o Rodrigo

1. **Dashboard Geral** — "eis o que vai aparecer logo que você entrar no sistema"
2. **Importar Teams** — resolver a dor #1 (fim do copy/paste), mostrar o timer de sincronização
3. **Pedidos** — a planilha dele virou tela com filtros
4. **Formação de Carga** ★ — deixar ele clicar nos checkboxes e ver os totais/progress mudando em tempo real
5. **Grupos de E-mail** — mostrar o template do e-mail automático
6. *(Falar verbalmente que a partir daí o fluxo segue no TMS Zorte já existente — CT-e, MDF-e, CIOT, vale-pedágio, averbação, app de motorista)*
7. **TecnoRisk** (Fase 3) — automação da gerenciadora de risco
8. **Sugestão Automática** (Fase 4) — o que vem pela frente

## Personalização rápida

- **Nome da empresa dele**: em `src/lib/mock-data.ts`, trocar os clientes/CNPJs
- **Logo Zorte real**: em `src/components/layout/sidebar.tsx`, trocar o "Z" azul por `<img src="..." />`
- **Cor primária**: em `src/index.css`, a variável `--primary` (HSL 221 83% 40%)
