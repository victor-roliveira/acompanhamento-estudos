import { calculateAccuracy, formatTrailNumber, parseIsoDate, toIsoDate } from "@/lib/utils";
import type { DailyStudyLog, DashboardFilter, DashboardSummary, EvolutionPoint, RankingItem, SubjectTrailEvolution } from "@/types/study";

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function filterLogs(logs: DailyStudyLog[], filter: DashboardFilter) {
  if (filter === "general") return logs;
  const today = startOfDay(new Date());
  const start = new Date(today);
  if (filter === "daily") {
    return logs.filter((log) => log.study_date === toIsoDate(today));
  }
  if (filter === "weekly") start.setDate(today.getDate() - 6);
  if (filter === "monthly") start.setMonth(today.getMonth() - 1);
  return logs.filter((log) => parseIsoDate(log.study_date) >= start);
}

function groupRanking(logs: DailyStudyLog[], getLabel: (log: DailyStudyLog) => string): RankingItem[] {
  const grouped = logs.reduce<Record<string, RankingItem>>((acc, log) => {
    const label = getLabel(log);
    acc[label] ??= { label, total: 0, correct: 0, wrong: 0, accuracy: 0 };
    acc[label].total += log.total_questions;
    acc[label].correct += log.correct_questions;
    acc[label].wrong += log.wrong_questions;
    acc[label].accuracy = calculateAccuracy(acc[label].correct, acc[label].total);
    return acc;
  }, {});
  return Object.values(grouped).sort((a, b) => b.accuracy - a.accuracy);
}

function buildEvolution(logs: DailyStudyLog[], filter: DashboardFilter): EvolutionPoint[] {
  const grouped = logs.reduce<Record<string, EvolutionPoint>>((acc, log) => {
    const date = parseIsoDate(log.study_date);
    const label =
      filter === "monthly"
        ? `${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`
        : date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
    acc[label] ??= { label, total: 0, correct: 0, accuracy: 0 };
    acc[label].total += log.total_questions;
    acc[label].correct += log.correct_questions;
    acc[label].accuracy = calculateAccuracy(acc[label].correct, acc[label].total);
    return acc;
  }, {});
  return Object.values(grouped).reverse();
}

function buildSubjectTrailEvolution(logs: DailyStudyLog[]): SubjectTrailEvolution[] {
  const grouped = logs.reduce<Record<string, SubjectTrailEvolution>>((acc, log) => {
    const subject = log.subject?.name ?? "Sem matéria";
    const key = `${subject}-${log.trail_number}`;
    acc[key] ??= {
      subject,
      trailLabel: `Trilha ${formatTrailNumber(log.trail_number)}`,
      trailNumber: log.trail_number,
      total: 0,
      correct: 0,
      accuracy: 0,
    };
    acc[key].total += log.total_questions;
    acc[key].correct += log.correct_questions;
    acc[key].accuracy = calculateAccuracy(acc[key].correct, acc[key].total);
    return acc;
  }, {});

  return Object.values(grouped).sort((a, b) => a.subject.localeCompare(b.subject) || a.trailNumber - b.trailNumber);
}

export const dashboardService = {
  summarize(logs: DailyStudyLog[], filter: DashboardFilter): DashboardSummary {
    const scoped = filterLogs(logs, filter);
    const totalQuestions = scoped.reduce((sum, log) => sum + log.total_questions, 0);
    const correctQuestions = scoped.reduce((sum, log) => sum + log.correct_questions, 0);
    const wrongQuestions = scoped.reduce((sum, log) => sum + log.wrong_questions, 0);
    const bySubject = groupRanking(scoped, (log) => log.subject?.name ?? "Sem matéria");
    const byTrail = groupRanking(scoped, (log) => `Trilha ${formatTrailNumber(log.trail_number)}`);

    return {
      totalQuestions,
      correctQuestions,
      wrongQuestions,
      accuracy: calculateAccuracy(correctQuestions, totalQuestions),
      bySubject,
      byTrail,
      bestSubjects: bySubject.slice(0, 5),
      worstSubjects: [...bySubject].sort((a, b) => a.accuracy - b.accuracy).slice(0, 5),
      evolution: buildEvolution(scoped, filter),
      subjectTrailEvolution: buildSubjectTrailEvolution(scoped),
    };
  },
};
