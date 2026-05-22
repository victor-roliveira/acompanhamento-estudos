import { LogOut } from "lucide-react";
import { Outlet } from "react-router-dom";
import { BottomNav } from "@/components/layout/BottomNav";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { isSupabaseConfigured } from "@/lib/supabase";

export function AppShell() {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div>
            <p className="text-xs font-semibold uppercase text-primary">Concursos</p>
            <h1 className="text-lg font-extrabold">Controle de Estudos</h1>
          </div>
          <Button variant="ghost" size="icon" onClick={signOut} aria-label="Sair">
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {!isSupabaseConfigured && (
        <div className="border-b border-warning/40 bg-warning px-4 py-2 text-center text-xs font-bold text-slate-950">
          Modo local ativo. Configure o .env para usar Supabase.
        </div>
      )}

      <main className="safe-bottom mx-auto max-w-5xl px-4 py-5">
        <p className="mb-4 truncate text-sm text-muted-foreground">{user?.email}</p>
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
