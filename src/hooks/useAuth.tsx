import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { authService } from "@/services/auth.service";
import type { UserSession } from "@/types/study";

type AuthContextValue = {
  user: UserSession | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    authService.getCurrentUser().then((currentUser) => {
      if (!mounted) return;
      setUser(currentUser);
      setIsLoading(false);
    });
    const subscription = authService.onAuthStateChange((currentUser) => {
      setUser(currentUser);
      setIsLoading(false);
    });
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      signIn: async (email, password) => setUser(await authService.signIn(email, password)),
      signUp: async (email, password) => setUser(await authService.signUp(email, password)),
      signOut: async () => {
        await authService.signOut();
        setUser(null);
      },
    }),
    [isLoading, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth deve ser usado dentro de AuthProvider.");
  return context;
}
