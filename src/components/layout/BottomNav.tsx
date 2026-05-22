import { BarChart3, CalendarDays, ListChecks, PenLine, Route } from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";

const items = [
  { to: "/planejamento", label: "Semana", icon: CalendarDays },
  { to: "/diario", label: "Diário", icon: PenLine },
  { to: "/trilhas", label: "Trilhas", icon: Route },
  { to: "/pendencias", label: "Faltantes", icon: ListChecks },
  { to: "/dashboard", label: "Dados", icon: BarChart3 },
];

export function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/96 px-3 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] pt-2 backdrop-blur">
      <div className="mx-auto grid max-w-lg grid-cols-5 gap-1">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                "flex h-14 flex-col items-center justify-center gap-1 rounded-md text-[11px] font-semibold text-muted-foreground",
                isActive && "bg-primary text-primary-foreground",
              )
            }
          >
            <item.icon className="h-5 w-5" aria-hidden="true" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
