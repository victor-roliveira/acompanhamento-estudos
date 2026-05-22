import { FormEvent, useEffect, useMemo, useState } from "react";
import { CheckCircle2, Info, ListPlus, Route } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip } from "@/components/ui/tooltip";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useAuth } from "@/hooks/useAuth";
import { useWeeklyPlan } from "@/hooks/useWeeklyPlan";
import { formatDate, formatTrailNumber, getCurrentWeekRange } from "@/lib/utils";

function splitTopics(value: string) {
  return value
    .split(",")
    .map((topic) => topic.trim())
    .filter(Boolean);
}

const SELECTED_WEEK_STORAGE_KEY = "study-control-selected-week";

function getInitialWeek() {
  const fallback = getCurrentWeekRange();
  const stored = localStorage.getItem(SELECTED_WEEK_STORAGE_KEY);
  if (!stored) return fallback;

  try {
    const parsed = JSON.parse(stored) as { weekStart?: string; weekEnd?: string };
    return parsed.weekStart && parsed.weekEnd ? { weekStart: parsed.weekStart, weekEnd: parsed.weekEnd } : fallback;
  } catch {
    return fallback;
  }
}

function parseNumberField(value: string) {
  if (value.trim() === "") return Number.NaN;
  return Number(value);
}

export function WeeklyPlanPage() {
  const { user } = useAuth();
  const defaultWeek = useMemo(() => getInitialWeek(), []);
  const [weekStart, setWeekStart] = useState(defaultWeek.weekStart);
  const [weekEnd, setWeekEnd] = useState(defaultWeek.weekEnd);
  const [subjectName, setSubjectName] = useState("");
  const [trailNumber, setTrailNumber] = useState("");
  const [topics, setTopics] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const plan = useWeeklyPlan(user?.id, weekStart, weekEnd);
  const { isSubmitting, error, setError, run } = useAsyncAction();

  useEffect(() => {
    localStorage.setItem(SELECTED_WEEK_STORAGE_KEY, JSON.stringify({ weekStart, weekEnd }));
  }, [weekEnd, weekStart]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const parsedTrailNumber = parseNumberField(trailNumber);
    if (Number.isNaN(parsedTrailNumber)) {
      setError("Informe o número da trilha.");
      return;
    }

    await run(async () => {
      await plan.addItem({ subjectName, trail_number: parsedTrailNumber, topics: splitTopics(topics) });
      setSubjectName("");
      setTrailNumber("");
      setTopics("");
      setFeedback("Matéria adicionada na semana selecionada.");
    });
  }

  return (
    <div className="space-y-5">
      <section>
        <h2 className="text-2xl font-extrabold">Planejamento semanal</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {formatDate(weekStart)} até {formatDate(weekEnd)}
        </p>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Semana de referência</CardTitle>
          <CardDescription>Ajuste a semana e cadastre as matérias previstas.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="weekStart">Início</Label>
              <DatePicker id="weekStart" value={weekStart} onChange={setWeekStart} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="weekEnd">Fim</Label>
              <DatePicker id="weekEnd" value={weekEnd} onChange={setWeekEnd} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Nova matéria planejada</CardTitle>
          <CardDescription>Use assuntos separados por vírgula para manter o cadastro rápido no celular.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="subject">Matéria</Label>
              <Input id="subject" value={subjectName} onChange={(event) => setSubjectName(event.target.value)} placeholder="Ex.: Direito Administrativo" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="trail">Número da trilha</Label>
              <Input id="trail" value={trailNumber} onChange={(event) => setTrailNumber(event.target.value)} type="number" min={0} placeholder="00" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="topics">Assuntos</Label>
              <Textarea id="topics" value={topics} onChange={(event) => setTopics(event.target.value)} placeholder="Atos administrativos, poderes, agentes" />
            </div>
            {feedback && (
              <p className="flex items-center gap-2 rounded-md bg-success p-3 text-sm font-semibold text-white">
                <Info className="h-4 w-4" />
                {feedback}
              </p>
            )}
            {error && <p className="rounded-md bg-destructive p-3 text-sm font-semibold text-destructive-foreground">{error}</p>}
            <Tooltip label="Adiciona a matéria exatamente na semana de referência selecionada acima.">
              <Button className="w-full" disabled={isSubmitting}>
                <ListPlus className="h-5 w-5" />
                Adicionar na semana
              </Button>
            </Tooltip>
          </form>
        </CardContent>
      </Card>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold">Matérias da semana</h3>
          <Badge variant="success">{plan.items.length}</Badge>
        </div>
        {plan.error && <p className="rounded-md bg-destructive p-3 text-sm font-semibold text-destructive-foreground">{plan.error}</p>}
        {plan.isLoading && <p className="text-sm text-muted-foreground">Carregando planejamento...</p>}
        {!plan.isLoading && plan.items.length === 0 && <p className="rounded-md border border-border p-4 text-sm text-muted-foreground">Nenhuma matéria planejada ainda.</p>}
        {plan.items.map((item) => (
          <Card key={item.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-bold">{item.subject?.name}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Badge variant="secondary">
                      <Route className="mr-1 h-3 w-3" />
                      Trilha {formatTrailNumber(item.trail_number)}
                    </Badge>
                    <Badge variant={item.studied ? "success" : "muted"}>{item.studied ? "Estudada" : "Não estudada"}</Badge>
                  </div>
                </div>
                <Tooltip label={item.studied ? "Marca a matéria como não estudada novamente." : "Marca a matéria como estudada nesta semana."} className="w-auto">
                  <Button variant={item.studied ? "secondary" : "outline"} size="sm" onClick={() => plan.setStudied(item.id, !item.studied)}>
                    <CheckCircle2 className="h-4 w-4" />
                    {item.studied ? "Reabrir" : "Concluir"}
                  </Button>
                </Tooltip>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{item.topics.join(", ")}</p>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}
