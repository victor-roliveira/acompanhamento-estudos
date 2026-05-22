import { localDb } from "@/data/localDb";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import type { Subject } from "@/types/study";

export const subjectsService = {
  async list(userId: string): Promise<Subject[]> {
    if (!isSupabaseConfigured || !supabase) return localDb.listSubjects(userId);
    const { data, error } = await supabase.from("subjects").select("*").eq("user_id", userId).order("name");
    if (error) throw new Error(error.message);
    return data ?? [];
  },

  async upsertByName(userId: string, name: string): Promise<Subject> {
    if (!isSupabaseConfigured || !supabase) return localDb.upsertSubject(userId, name);
    const normalized = name.trim();
    const { data: existing, error: findError } = await supabase
      .from("subjects")
      .select("*")
      .eq("user_id", userId)
      .ilike("name", normalized)
      .maybeSingle();
    if (findError) throw new Error(findError.message);
    if (existing) return existing;

    const { data, error } = await supabase.from("subjects").insert({ user_id: userId, name: normalized }).select("*").single();
    if (error) throw new Error(error.message);
    return data;
  },
};
