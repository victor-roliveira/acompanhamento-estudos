import { FormEvent, useState } from "react";
import { Navigate } from "react-router-dom";
import { LockKeyhole, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useAuth } from "@/hooks/useAuth";
import { isSupabaseConfigured } from "@/lib/supabase";

export function LoginPage() {
  const { user, signIn, signUp } = useAuth();
  const { isSubmitting, error, run } = useAsyncAction();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  if (user) return <Navigate to="/planejamento" replace />;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    await run(() => (mode === "signin" ? signIn(email, password) : signUp(email, password)));
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-8">
      <section className="w-full max-w-sm">
        <div className="mb-6">
          <p className="text-sm font-bold uppercase text-primary">Acompanhamento</p>
          <h1 className="mt-2 text-3xl font-extrabold leading-tight">Estudos para concurso, sem planilha solta.</h1>
          <p className="mt-3 text-sm text-muted-foreground">Planeje a semana, valide o dia e acompanhe rendimento por matéria e trilha.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{mode === "signin" ? "Entrar" : "Criar acesso"}</CardTitle>
            <CardDescription>{isSupabaseConfigured ? "Use seu login do Supabase Auth." : "Modo local ativo para preview da interface."}</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input id="email" className="pl-10" value={email} onChange={(event) => setEmail(event.target.value)} type="email" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <LockKeyhole className="pointer-events-none absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="password"
                    className="pl-10"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    type="password"
                    minLength={6}
                    required
                  />
                </div>
              </div>

              {error && <p className="rounded-md bg-destructive p-3 text-sm font-semibold text-destructive-foreground">{error}</p>}

              <Button className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Aguarde..." : mode === "signin" ? "Entrar" : "Criar conta"}
              </Button>
              <Button className="w-full" type="button" variant="ghost" onClick={() => setMode(mode === "signin" ? "signup" : "signin")}>
                {mode === "signin" ? "Preciso criar acesso" : "Já tenho acesso"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
