import { useState } from "react";
import { ChevronDown, ChevronUp, Route } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatTrailNumber } from "@/lib/utils";
import type { WeeklyPlanItem } from "@/types/study";

export function PendingStudyCard({ item }: { item: WeeklyPlanItem }) {
  const [open, setOpen] = useState(false);

  return (
    <button className="w-full text-left" onClick={() => setOpen((value) => !value)} type="button">
      <Card className="transition-colors hover:border-primary/70">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-base font-bold">{item.subject?.name ?? "Matéria"}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Badge variant="secondary">
                  <Route className="mr-1 h-3 w-3" />
                  Trilha {formatTrailNumber(item.trail_number)}
                </Badge>
                <Badge variant="warning">Pendente</Badge>
              </div>
            </div>
            {open ? <ChevronUp className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
          </div>

          <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{item.topics.join(", ")}</p>

          {open && (
            <div className="mt-4 rounded-md border border-border bg-muted p-3 text-sm">
              <p className="font-semibold text-foreground">Assuntos da trilha</p>
              <ul className="mt-2 space-y-1 text-muted-foreground">
                {item.topics.map((topic) => (
                  <li key={topic}>- {topic}</li>
                ))}
              </ul>
              <p className="mt-3 text-xs text-muted-foreground">Criado em {new Date(item.created_at).toLocaleDateString("pt-BR")}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </button>
  );
}
