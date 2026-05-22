import { useEffect, useMemo, useState } from "react";
import { BookOpenCheck, CalendarDays, CircleDot, Route } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Select } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { useStudyLogs } from "@/hooks/useStudyLogs";
import { useTrailItems } from "@/hooks/useTrailItems";
import { calculateAccuracy, formatDate, formatTrailNumber, performanceClass, performanceLabel } from "@/lib/utils";
import type { DailyStudyLog, WeeklyPlanItem } from "@/types/study";

type TrailSubjectGroup = {
  key: string;
  subjectId: string;
  subjectName: string;
  trailNumber: number;
  topics: string[];
  weeks: string[];
  plannedCount: number;
  studiedCount: number;
  totalQuestions: number;
  correctQuestions: number;
  wrongQuestions: number;
  accuracy: number;
};

function unique(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)));
}

function buildGroups(items: WeeklyPlanItem[], logs: DailyStudyLog[], trailNumber: number): TrailSubjectGroup[] {
  const scopedItems = items.filter((item) => item.trail_number === trailNumber);

  return Object.values(
    scopedItems.reduce<Record<string, TrailSubjectGroup>>((acc, item) => {
      const subjectName = item.subject?.name ?? "Matéria";
      const subjectId = item.subject_id;
      const key = `${subjectId}-${trailNumber}`;
      const subjectLogs = logs.filter((log) => log.subject_id === subjectId && log.trail_number === trailNumber);
      const totalQuestions = subjectLogs.reduce((sum, log) => sum + log.total_questions, 0);
      const correctQuestions = subjectLogs.reduce((sum, log) => sum + log.correct_questions, 0);
      const wrongQuestions = subjectLogs.reduce((sum, log) => sum + log.wrong_questions, 0);

      acc[key] ??= {
        key,
        subjectId,
        subjectName,
        trailNumber,
        topics: [],
        weeks: [],
        plannedCount: 0,
        studiedCount: 0,
        totalQuestions: 0,
        correctQuestions: 0,
        wrongQuestions: 0,
        accuracy: 0,
      };

      acc[key].topics = unique([...acc[key].topics, ...item.topics]);
      acc[key].weeks = unique([
        ...acc[key].weeks,
        item.weekly_plan ? `${formatDate(item.weekly_plan.week_start)} até ${formatDate(item.weekly_plan.week_end)}` : "",
      ]);
      acc[key].plannedCount += 1;
      acc[key].studiedCount += item.studied ? 1 : 0;
      acc[key].totalQuestions = totalQuestions;
      acc[key].correctQuestions = correctQuestions;
      acc[key].wrongQuestions = wrongQuestions;
      acc[key].accuracy = calculateAccuracy(correctQuestions, totalQuestions);
      return acc;
    }, {}),
  ).sort((a, b) => a.subjectName.localeCompare(b.subjectName));
}

export function TrailsPage() {
  const { user } = useAuth();
  const trailItems = useTrailItems(user?.id);
  const studyLogs = useStudyLogs(user?.id);
  const availableTrails = useMemo(() => {
    const fromPlans = trailItems.items.map((item) => item.trail_number);
    const fromLogs = studyLogs.logs.map((log) => log.trail_number);
    const trails = Array.from(new Set([...fromPlans, ...fromLogs])).sort((a, b) => a - b);
    return trails.length > 0 ? trails : [0];
  }, [studyLogs.logs, trailItems.items]);
  const [selectedTrail, setSelectedTrail] = useState(0);

  useEffect(() => {
    if (availableTrails.includes(0)) {
      setSelectedTrail(0);
      return;
    }
    setSelectedTrail((current) => (availableTrails.includes(current) ? current : availableTrails[0] ?? 0));
  }, [availableTrails]);

  const groups = useMemo(() => buildGroups(trailItems.items, studyLogs.logs, selectedTrail), [selectedTrail, studyLogs.logs, trailItems.items]);

  return (
    <div className="space-y-5">
      <section>
        <h2 className="text-2xl font-extrabold">Trilhas</h2>
        <p className="mt-1 text-sm text-muted-foreground">Visualize as matérias planejadas em cada trilha.</p>
      </section>

      <Card>
        <CardContent className="p-4">
          <label className="mb-2 block text-sm font-semibold" htmlFor="trailFilter">
            Filtrar trilha
          </label>
          <Select id="trailFilter" value={String(selectedTrail)} onChange={(event) => setSelectedTrail(Number(event.target.value))}>
            {availableTrails.map((trail) => (
              <option key={trail} value={trail}>
                Trilha {formatTrailNumber(trail)}
              </option>
            ))}
          </Select>
        </CardContent>
      </Card>

      {(trailItems.error || studyLogs.error) && (
        <p className="rounded-md bg-destructive p-3 text-sm font-semibold text-destructive-foreground">{trailItems.error ?? studyLogs.error}</p>
      )}

      {(trailItems.isLoading || studyLogs.isLoading) && <p className="text-sm text-muted-foreground">Carregando trilhas...</p>}

      {!trailItems.isLoading && groups.length === 0 && (
        <Card>
          <CardContent className="p-5 text-sm text-muted-foreground">Nenhuma matéria encontrada na Trilha {formatTrailNumber(selectedTrail)}.</CardContent>
        </Card>
      )}

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold">Matérias da Trilha {formatTrailNumber(selectedTrail)}</h3>
          <Badge variant="success">{groups.length}</Badge>
        </div>

        {groups.map((group) => (
          <Card key={group.key}>
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <CardTitle className="truncate">{group.subjectName}</CardTitle>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Badge variant="secondary">
                      <Route className="mr-1 h-3 w-3" />
                      Trilha {formatTrailNumber(group.trailNumber)}
                    </Badge>
                    <Badge variant={group.studiedCount === group.plannedCount ? "success" : "warning"}>
                      {group.studiedCount}/{group.plannedCount} estudada(s)
                    </Badge>
                  </div>
                </div>
                <Badge className={performanceClass(group.accuracy)}>{group.accuracy}%</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="mb-2 flex items-center gap-2 text-sm font-semibold">
                  <BookOpenCheck className="h-4 w-4" />
                  Assuntos
                </p>
                <div className="flex flex-wrap gap-2">
                  {group.topics.map((topic) => (
                    <Badge key={topic} variant="muted">
                      {topic}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-2 flex items-center gap-2 text-sm font-semibold">
                  <CalendarDays className="h-4 w-4" />
                  Semanas
                </p>
                <div className="space-y-1 text-sm text-muted-foreground">
                  {group.weeks.map((week) => (
                    <p key={week}>{week}</p>
                  ))}
                </div>
              </div>

              <div className="rounded-md border border-border bg-muted p-3">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <p className="flex items-center gap-2 text-sm font-semibold">
                    <CircleDot className="h-4 w-4" />
                    Rendimento
                  </p>
                  <span className="text-sm font-bold">{performanceLabel(group.accuracy)}</span>
                </div>
                <Progress value={group.accuracy} />
                <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                  <p>
                    <strong className="block text-base text-foreground">{group.totalQuestions}</strong>
                    questões
                  </p>
                  <p>
                    <strong className="block text-base text-foreground">{group.correctQuestions}</strong>
                    certas
                  </p>
                  <p>
                    <strong className="block text-base text-foreground">{group.wrongQuestions}</strong>
                    erradas
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}
