import { useState } from "react";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Award, Check, Percent, X } from "lucide-react";
import { MetricCard } from "@/components/MetricCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { useDashboard } from "@/hooks/useDashboard";
import { useStudyLogs } from "@/hooks/useStudyLogs";
import { cn, performanceClass, performanceLabel } from "@/lib/utils";
import type { DashboardFilter, RankingItem } from "@/types/study";

const filters: Array<{ value: DashboardFilter; label: string }> = [
  { value: "general", label: "Geral" },
  { value: "monthly", label: "Mensal" },
  { value: "weekly", label: "Semanal" },
  { value: "daily", label: "Diário" },
];

function RankingList({ title, items }: { title: string; items: RankingItem[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.length === 0 && <p className="text-sm text-muted-foreground">Sem dados no filtro atual.</p>}
        {items.map((item) => (
          <div key={item.label} className="space-y-2">
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="truncate font-semibold">{item.label}</span>
              <span className="font-bold">{item.accuracy}%</span>
            </div>
            <Progress value={item.accuracy} />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function DashboardPage() {
  const { user } = useAuth();
  const { logs } = useStudyLogs(user?.id);
  const [filter, setFilter] = useState<DashboardFilter>("general");
  const summary = useDashboard(logs, filter);

  return (
    <div className="space-y-5">
      <section>
        <h2 className="text-2xl font-extrabold">Dashboard</h2>
        <p className="mt-1 text-sm text-muted-foreground">Rendimento por período, matéria e trilha.</p>
      </section>

      <div className="grid grid-cols-4 gap-2 rounded-md border border-border bg-card p-1">
        {filters.map((item) => (
          <Button
            key={item.value}
            type="button"
            variant={filter === item.value ? "default" : "ghost"}
            size="sm"
            className="px-2 text-xs"
            onClick={() => setFilter(item.value)}
          >
            {item.label}
          </Button>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Questões" value={summary.totalQuestions} icon={Award} tone="accent" />
        <MetricCard label="Certas" value={summary.correctQuestions} icon={Check} tone="success" />
        <MetricCard label="Erradas" value={summary.wrongQuestions} icon={X} tone="warning" />
        <MetricCard label="Acertos" value={`${summary.accuracy}%`} icon={Percent} />
      </div>

      <Card>
        <CardContent className="flex items-center justify-between gap-3 p-4">
          <div>
            <p className="text-sm text-muted-foreground">Classificação atual</p>
            <p className="text-xl font-extrabold">{performanceLabel(summary.accuracy)}</p>
          </div>
          <Badge className={cn(performanceClass(summary.accuracy))}>{summary.accuracy}%</Badge>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Evolução</CardTitle>
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={summary.evolution}>
              <CartesianGrid stroke="#294150" strokeDasharray="3 3" />
              <XAxis dataKey="label" stroke="#9bb4bd" fontSize={12} />
              <YAxis stroke="#9bb4bd" fontSize={12} />
              <Tooltip contentStyle={{ background: "#162331", border: "1px solid #294150", borderRadius: 8 }} />
              <Line type="monotone" dataKey="accuracy" stroke="#20c7b5" strokeWidth={3} dot={{ r: 4, fill: "#20c7b5" }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Desempenho por trilha</CardTitle>
        </CardHeader>
        <CardContent className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={summary.byTrail}>
              <CartesianGrid stroke="#294150" strokeDasharray="3 3" />
              <XAxis dataKey="label" stroke="#9bb4bd" fontSize={12} />
              <YAxis stroke="#9bb4bd" fontSize={12} />
              <Tooltip contentStyle={{ background: "#162331", border: "1px solid #294150", borderRadius: 8 }} />
              <Bar dataKey="accuracy" fill="#7c3aed" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <RankingList title="Melhores matérias" items={summary.bestSubjects} />
        <RankingList title="Piores matérias" items={summary.worstSubjects} />
      </div>
    </div>
  );
}
