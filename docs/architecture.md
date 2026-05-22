# Arquitetura do Sistema

## Stack

- React + TypeScript com Vite.
- Supabase para Auth, Postgres e RLS.
- shadcn/ui como base visual dos componentes em `src/components/ui`.
- Tailwind CSS com tema dark e fonte Outfit.
- Recharts para gráficos web.

## Estrutura de Pastas

```txt
src/
  components/
    layout/        # shell, navegação inferior e proteção visual da aplicação
    ui/            # componentes base no estilo shadcn/ui
  data/            # modo local de preview quando Supabase não está configurado
  hooks/           # estado de sessão e consultas por domínio
  lib/             # Supabase client e utilitários puros
  pages/           # telas principais
  services/        # acesso a dados e regras de negócio por domínio
  types/           # contratos TypeScript compartilhados
supabase/
  schema.sql       # tabelas, constraints, triggers e políticas RLS
docs/
  architecture.md
```

## Fluxo das Telas

1. Login: entrada, criação de acesso e manutenção de sessão via Supabase Auth.
2. Planejamento semanal: define semana, matéria, trilha, assuntos e status de estudo.
3. Validação diária: registra estudo, questões certas/erradas, total e observações.
4. Matérias faltantes: lista itens planejados e ainda não estudados, separados por semana e ordenados por trilha.
5. Dashboard: filtros geral, mensal, semanal e diário com indicadores, rankings e evolução.

## Modelagem

- `users`: perfil mínimo espelhado de `auth.users`.
- `subjects`: matérias por usuário.
- `weekly_plans`: intervalo semanal por usuário.
- `weekly_plan_items`: matérias planejadas por semana, com trilha, assuntos e status.
- `daily_study_logs`: registros diários com questões, acerto calculado e notas.

O SQL completo está em `supabase/schema.sql`.

## Regras de Negócio

- O frontend valida total de questões antes de salvar.
- As trilhas aceitam valor `0`; na interface, `0` é exibido como `00`.
- O banco reforça `total_questions = correct_questions + wrong_questions`.
- O percentual é recalculado no banco por trigger.
- Ao salvar um registro diário, o service marca como estudado o item semanal com mesma matéria, trilha e semana.
- Pendências são itens de planejamento com `studied = false`, agrupados por semana e ordenados por `trail_number`.
- Todos os dados são filtrados por usuário via RLS.

## Componentes Principais

- `AppShell`: cabeçalho, aviso de modo local e navegação.
- `BottomNav`: navegação mobile-first fixa no rodapé.
- `MetricCard`: indicadores resumidos do dashboard.
- `PendingStudyCard`: card resumido expansível para matérias faltantes.
- `ui/*`: Button, Card, Input, Label, Select, Textarea, Badge e Progress.

## Hooks e Services

- `useAuth` + `authService`: sessão, login, cadastro e logout.
- `useSubjects` + `subjectsService`: listagem e upsert de matérias.
- `useWeeklyPlan` + `weeklyPlansService`: plano semanal, itens e marcação de estudado.
- `useStudyLogs` + `studyLogsService`: registros diários e validação.
- `usePendingStudies`: pendências por semana.
- `useDashboard` + `dashboardService`: métricas, evolução e rankings.

## Estratégia dos Gráficos

Os gráficos devem receber dados já agregados pelo `dashboardService`, evitando lógica de cálculo dentro dos componentes. Para web, esta base usa Recharts por ser simples, responsivo e compatível com React. Para uma versão React Native, eu recomendo `victory-native` quando a prioridade for consistência estatística e customização, ou `react-native-gifted-charts` quando a prioridade for velocidade visual e animações prontas.

## Escalabilidade Futura

- Migrar cálculos pesados do dashboard para views ou RPCs no Supabase.
- Adicionar tabela de metas semanais e revisões espaçadas.
- Criar testes unitários para services e testes de fluxo com Playwright.
- Separar tipos gerados pelo Supabase CLI em `src/types/database.ts`.
- Adicionar cache com TanStack Query quando houver mais telas e sincronização.
- Evoluir `topics` para tabela própria se os assuntos precisarem de histórico individual.
