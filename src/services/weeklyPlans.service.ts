import { localDb } from "@/data/localDb";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { subjectsService } from "@/services/subjects.service";
import type { PendingWeek, WeeklyPlan, WeeklyPlanItem, WeeklyPlanItemInput } from "@/types/study";

async function getOrCreatePlan(userId: string, weekStart: string, weekEnd: string): Promise<WeeklyPlan> {
  if (!isSupabaseConfigured || !supabase) return localDb.getOrCreateWeeklyPlan(userId, weekStart, weekEnd);

  const { data, error } = await supabase
    .from("weekly_plans")
    .upsert({ user_id: userId, week_start: weekStart, week_end: weekEnd }, { onConflict: "user_id,week_start" })
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export const weeklyPlansService = {
  getOrCreatePlan,

  async listItems(userId: string, weekStart: string, weekEnd: string): Promise<WeeklyPlanItem[]> {
    if (!isSupabaseConfigured || !supabase) return localDb.listWeeklyPlanItems(userId, weekStart, weekEnd);
    const plan = await getOrCreatePlan(userId, weekStart, weekEnd);
    const { data, error } = await supabase
      .from("weekly_plan_items")
      .select("*, subject:subjects(*)")
      .eq("weekly_plan_id", plan.id)
      .order("trail_number");
    if (error) throw new Error(error.message);
    return (data ?? []) as WeeklyPlanItem[];
  },

  async addItem(userId: string, weekStart: string, weekEnd: string, input: WeeklyPlanItemInput): Promise<WeeklyPlanItem> {
    if (!input.subjectName.trim()) throw new Error("Informe a matéria.");
    if (input.trail_number < 0) throw new Error("A trilha não pode ser negativa.");
    if (input.topics.length === 0) throw new Error("Informe ao menos um assunto.");

    if (!isSupabaseConfigured || !supabase) {
      return localDb.addWeeklyPlanItem(userId, weekStart, weekEnd, input.subjectName, input.trail_number, input.topics);
    }

    const [subject, plan] = await Promise.all([
      subjectsService.upsertByName(userId, input.subjectName),
      getOrCreatePlan(userId, weekStart, weekEnd),
    ]);
    const { data, error } = await supabase
      .from("weekly_plan_items")
      .insert({
        weekly_plan_id: plan.id,
        subject_id: subject.id,
        trail_number: input.trail_number,
        topics: input.topics,
        studied: false,
      })
      .select("*, subject:subjects(*)")
      .single();
    if (error) throw new Error(error.message);
    return data as WeeklyPlanItem;
  },

  async setStudied(itemId: string, studied: boolean) {
    if (!isSupabaseConfigured || !supabase) {
      localDb.updatePlanItemStudied(itemId, studied);
      return;
    }
    const { error } = await supabase.from("weekly_plan_items").update({ studied }).eq("id", itemId);
    if (error) throw new Error(error.message);
  },

  async listPending(userId: string): Promise<PendingWeek[]> {
    if (!isSupabaseConfigured || !supabase) return localDb.listPending(userId);
    const client = supabase;
    const { data: plans, error: planError } = await client
      .from("weekly_plans")
      .select("*")
      .eq("user_id", userId)
      .order("week_start", { ascending: false });
    if (planError) throw new Error(planError.message);

    const result = await Promise.all(
      (plans ?? []).map(async (plan) => {
        const { data: items, error } = await client
          .from("weekly_plan_items")
          .select("*, subject:subjects(*), weekly_plan:weekly_plans(*)")
          .eq("weekly_plan_id", plan.id)
          .eq("studied", false)
          .order("trail_number");
        if (error) throw new Error(error.message);
        return { plan, items: (items ?? []) as WeeklyPlanItem[] };
      }),
    );
    return result.filter((week) => week.items.length > 0);
  },
};
