import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { localDb } from "@/data/localDb";
import type { UserSession } from "@/types/study";

function toUserSession(user: { id: string; email?: string | null }): UserSession {
  return { id: user.id, email: user.email ?? "" };
}

export const authService = {
  async getCurrentUser(): Promise<UserSession | null> {
    if (!isSupabaseConfigured || !supabase) return localDb.demoUser;
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) return null;
    return toUserSession(data.user);
  },

  async signIn(email: string, password: string): Promise<UserSession> {
    if (!isSupabaseConfigured || !supabase) return localDb.demoUser;
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.user) throw new Error(error?.message ?? "Não foi possível entrar.");
    return toUserSession(data.user);
  },

  async signUp(email: string, password: string): Promise<UserSession> {
    if (!isSupabaseConfigured || !supabase) return localDb.demoUser;
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error || !data.user) throw new Error(error?.message ?? "Não foi possível criar o acesso.");
    return toUserSession(data.user);
  },

  async signOut() {
    if (!isSupabaseConfigured || !supabase) return;
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(error.message);
  },

  onAuthStateChange(callback: (user: UserSession | null) => void) {
    if (!isSupabaseConfigured || !supabase) {
      callback(localDb.demoUser);
      return { unsubscribe: () => undefined };
    }
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      callback(session?.user ? toUserSession(session.user) : null);
    });
    return subscription;
  },
};
