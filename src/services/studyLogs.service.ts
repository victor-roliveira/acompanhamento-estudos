import { localDb } from "@/data/localDb";
import { calculateAccuracy } from "@/lib/utils";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import type { DailyStudyLog, StudyLogInput } from "@/types/study";

function validateLog(input: StudyLogInput) {
  if (!input.subject_id) throw new Error("Selecione a matéria estudada.");
  if (input.trail_number < 0) throw new Error("A trilha não pode ser negativa.");
  if (input.total_questions !== input.correct_questions + input.wrong_questions) {
    throw new Error("O total de questões deve ser igual a certas + erradas.");
  }
  if (input.total_questions <= 0) throw new Error("Informe ao menos uma questão.");
}

export const studyLogsService = {
  async list(userId: string): Promise<DailyStudyLog[]> {
    if (!isSupabaseConfigured || !supabase) return localDb.listLogs(userId);
    const { data, error } = await supabase
      .from("daily_study_logs")
      .select("*, subject:subjects(*)")
      .eq("user_id", userId)
      .order("study_date", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as DailyStudyLog[];
  },

  async create(userId: string, input: StudyLogInput): Promise<DailyStudyLog> {
    validateLog(input);
    if (!isSupabaseConfigured || !supabase) return localDb.createLog(userId, input);

    const accuracy = calculateAccuracy(input.correct_questions, input.total_questions);
    const { data, error } = await supabase
      .from("daily_study_logs")
      .insert({
        user_id: userId,
        ...input,
        notes: input.notes?.trim() || null,
        accuracy_percentage: accuracy,
      })
      .select("*, subject:subjects(*)")
      .single();
    if (error) throw new Error(error.message);

    const { data: plans } = await supabase
      .from("weekly_plans")
      .select("id")
      .eq("user_id", userId)
      .lte("week_start", input.study_date)
      .gte("week_end", input.study_date);

    const planIds = (plans ?? []).map((plan) => plan.id);
    if (planIds.length > 0) {
      await supabase
        .from("weekly_plan_items")
        .update({ studied: true })
        .in("weekly_plan_id", planIds)
        .eq("subject_id", input.subject_id)
        .eq("trail_number", input.trail_number);
    }

    return data as DailyStudyLog;
  },
};
