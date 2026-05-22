import { FormEvent, useState } from "react";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useAuth } from "@/hooks/useAuth";
import { useStudyLogs } from "@/hooks/useStudyLogs";
import { useSubjects } from "@/hooks/useSubjects";
import { calculateAccuracy, formatDate, formatTrailNumber, performanceLabel, toIsoDate } from "@/lib/utils";

const today = toIsoDate(new Date());

function splitTopics(value: string) {
  return value
    .split(",")
    .map((topic) => topic.trim())
    .filter(Boolean);
}

export function DailyLogPage() {
  const { user } = useAuth();
  const { subjects, refresh: refreshSubjects } = useSubjects(user?.id);
  const logs = useStudyLogs(user?.id);
  const { isSubmitting, error, setError, run } = useAsyncAction();
  const [studyDate, setStudyDate] = useState(today);
  const [subjectId, setSubjectId] = useState("");
  const [trailNumber, setTrailNumber] = useState(0);
  const [topics, setTopics] = useState("");
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [correctQuestions, setCorrectQuestions] = useState(0);
  const [wrongQuestions, setWrongQuestions] = useState(0);
  const [notes, setNotes] = useState("");
  const expectedTotal = correctQuestions + wrongQuestions;
  const accuracy = calculateAccuracy(correctQuestions, totalQuestions);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (totalQuestions !== expectedTotal) {
      setError("O total de questões deve ser igual a certas + erradas.");
      return;
    }
    await run(async () => {
      await logs.createLog({
        subject_id: subjectId,
        trail_number: trailNumber,
        topics: splitTopics(topics),
        study_date: studyDate,
        total_questions: totalQuestions,
        correct_questions: correctQuestions,
        wrong_questions: wrongQuestions,
        notes,
      });
      await refreshSubjects();
      setTopics("");
      setTotalQuestions(0);
      setCorrectQuestions(0);
      setWrongQuestions(0);
      setNotes("");
    });
  }

  return (
    <div className="space-y-5">
      <section>
        <h2 className="text-2xl font-extrabold">Validação diária</h2>
        <p className="mt-1 text-sm text-muted-foreground">Registre o estudo feito e deixe a pendência da semana se resolver sozinha.</p>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Novo registro</CardTitle>
          <CardDescription>Total precisa bater com questões certas + erradas.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="studyDate">Data</Label>
                <DatePicker id="studyDate" value={studyDate} onChange={setStudyDate} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="trailNumber">Trilha</Label>
                <Input id="trailNumber" type="number" min={0} value={trailNumber} onChange={(event) => setTrailNumber(Number(event.target.value))} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subjectId">Matéria</Label>
              <Select id="subjectId" value={subjectId} onChange={(event) => setSubjectId(event.target.value)} required>
                <option value="">Selecione</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="topics">Assuntos estudados</Label>
              <Textarea id="topics" value={topics} onChange={(event) => setTopics(event.target.value)} placeholder="Assunto 1, assunto 2" />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label htmlFor="totalQuestions">Total</Label>
                <Input id="totalQuestions" type="number" min={0} value={totalQuestions} onChange={(event) => setTotalQuestions(Number(event.target.value))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="correctQuestions">Certas</Label>
                <Input id="correctQuestions" type="number" min={0} value={correctQuestions} onChange={(event) => setCorrectQuestions(Number(event.target.value))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="wrongQuestions">Erradas</Label>
                <Input id="wrongQuestions" type="number" min={0} value={wrongQuestions} onChange={(event) => setWrongQuestions(Number(event.target.value))} />
              </div>
            </div>

            <div className="rounded-md border border-border bg-muted p-3 text-sm">
              <p className="font-semibold">Soma esperada: {expectedTotal}</p>
              <p className="text-muted-foreground">
                Rendimento: {accuracy}% - {performanceLabel(accuracy)}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Observações</Label>
              <Textarea id="notes" value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Opcional" />
            </div>

            {error && <p className="rounded-md bg-destructive p-3 text-sm font-semibold text-destructive-foreground">{error}</p>}
            {logs.error && <p className="rounded-md bg-destructive p-3 text-sm font-semibold text-destructive-foreground">{logs.error}</p>}

            <Button className="w-full" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
              {isSubmitting ? "Salvando..." : "Salvar registro"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <section className="space-y-3">
        <h3 className="text-lg font-bold">Últimos estudos</h3>
        {logs.logs.slice(0, 5).map((log) => (
          <Card key={log.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-bold">{log.subject?.name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {formatDate(log.study_date)} - Trilha {formatTrailNumber(log.trail_number)}
                  </p>
                </div>
                <p className="rounded-md bg-primary px-2 py-1 text-sm font-bold text-primary-foreground">{log.accuracy_percentage}%</p>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                {log.correct_questions} certas, {log.wrong_questions} erradas, {log.total_questions} no total
              </p>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}
