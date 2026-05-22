import { CalendarDays } from "lucide-react";
import { PendingStudyCard } from "@/components/PendingStudyCard";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { usePendingStudies } from "@/hooks/usePendingStudies";
import { formatDate } from "@/lib/utils";

export function PendingPage() {
  const { user } = useAuth();
  const { weeks, isLoading, error } = usePendingStudies(user?.id);

  return (
    <div className="space-y-5">
      <section>
        <h2 className="text-2xl font-extrabold">Matérias faltantes</h2>
        <p className="mt-1 text-sm text-muted-foreground">Planejadas, ainda não registradas como estudadas, ordenadas pela trilha.</p>
      </section>

      {error && <p className="rounded-md bg-destructive p-3 text-sm font-semibold text-destructive-foreground">{error}</p>}
      {isLoading && <p className="text-sm text-muted-foreground">Carregando pendências...</p>}
      {!isLoading && weeks.length === 0 && (
        <Card>
          <CardContent className="p-5 text-sm text-muted-foreground">Nenhuma pendência encontrada para as semanas cadastradas.</CardContent>
        </Card>
      )}

      {weeks.map((week) => (
        <section key={week.plan.id} className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2">
              <CalendarDays className="h-5 w-5 shrink-0 text-primary" />
              <h3 className="truncate text-base font-bold">
                {formatDate(week.plan.week_start)} até {formatDate(week.plan.week_end)}
              </h3>
            </div>
            <Badge variant="destructive">{week.items.length}</Badge>
          </div>
          {week.items.map((item) => (
            <PendingStudyCard key={item.id} item={item} />
          ))}
        </section>
      ))}
    </div>
  );
}
