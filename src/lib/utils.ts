import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function parseIsoDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return new Date(value);
  return new Date(year, month - 1, day);
}

export function formatDate(value: string | Date) {
  const date = typeof value === "string" ? parseIsoDate(value) : value;
  return new Intl.DateTimeFormat("pt-BR").format(date);
}

export function toIsoDate(value: Date) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getCurrentWeekRange(date = new Date()) {
  const base = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = base.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const start = new Date(base);
  start.setDate(base.getDate() + diffToMonday);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);

  return {
    weekStart: toIsoDate(start),
    weekEnd: toIsoDate(end),
  };
}

export function calculateAccuracy(correct: number, total: number) {
  if (total <= 0) return 0;
  return Number(((correct / total) * 100).toFixed(2));
}

export function formatTrailNumber(value: number) {
  return String(value).padStart(2, "0");
}

export function performanceLabel(accuracy: number) {
  if (accuracy < 49) return "Ruim";
  if (accuracy === 50) return "Na média";
  if (accuracy >= 51 && accuracy <= 60) return "Bom";
  if (accuracy >= 61 && accuracy <= 79) return "Ótimo";
  if (accuracy >= 80) return "Excelente";
  return "Ajustar";
}

export function performanceClass(accuracy: number) {
  if (accuracy < 49) return "bg-red-600 text-white";
  if (accuracy === 50) return "bg-yellow-400 text-slate-950";
  if (accuracy >= 51 && accuracy <= 60) return "bg-lime-500 text-slate-950";
  if (accuracy >= 61 && accuracy <= 79) return "bg-emerald-500 text-white";
  if (accuracy >= 80) return "bg-emerald-300 text-slate-950";
  return "bg-muted text-muted-foreground";
}

export function getErrorMessage(error: unknown, fallback = "Não foi possível concluir a ação.") {
  const message = error instanceof Error ? error.message : String(error ?? "");

  if (message.includes("weekly_plans_user_week_unique")) {
    return "Essa semana já existe. Atualizei os dados para continuar.";
  }

  if (message.includes("duplicate key value violates unique constraint")) {
    return "Já existe um registro igual cadastrado.";
  }

  if (message.includes("violates row-level security policy")) {
    return "Você não tem permissão para acessar esse registro.";
  }

  if (message.includes("Failed to fetch")) {
    return "Não foi possível conectar ao Supabase agora.";
  }

  return message || fallback;
}
